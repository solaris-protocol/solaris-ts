import {
  Connection,
  PublicKey,
  Keypair,
  sendAndConfirmTransaction,
} from '@solana/web3.js';

import { ObligationParser, ReserveParser } from '../models';
import { refreshObligationTransaction } from '../transactions';

export async function refreshObligationCommand(
  connection: Connection,
  obligationPubkey: PublicKey,
  payer: Keypair
): Promise<void> {
  const obligationAccountInfo = await connection.getAccountInfo(
    obligationPubkey
  );

  if (obligationAccountInfo === null) {
    throw 'Error: cannot find the obligation account';
  }

  const obligationParsed = ObligationParser(
    obligationPubkey,
    obligationAccountInfo
  );

  console.log(obligationParsed.info);

  const depositsReserves = obligationParsed.info.deposits;
  const borrowsReserves = obligationParsed.info.borrows;

  const depositsReservesParsed = await Promise.all(
    depositsReserves.map(async reserve => {
      const reserveAccountInfo = await connection.getAccountInfo(
        reserve.depositReserve
      );

      if (reserveAccountInfo === null) {
        throw 'Error: cannot find the reserve account from obligation deposits';
      }

      return ReserveParser(reserve.depositReserve, reserveAccountInfo);
    })
  );

  const borrowsReservesParsed = await Promise.all(
    depositsReserves.map(async reserve => {
      const reserveAccountInfo = await connection.getAccountInfo(
        reserve.depositReserve
      );

      if (reserveAccountInfo === null) {
        throw 'Error: cannot find the reserve account from obligation deposits';
      }

      return ReserveParser(reserve.depositReserve, reserveAccountInfo);
    })
  );

  const borrowsReservesAndOraclesInfos = borrowsReservesParsed.map(reserve => ({
    reservePubkey: reserve.pubkey,
    oraclePubkey: reserve.info.liquidity.oraclePubkey,
  }));

  const depositsReservesAndOraclesInfos = depositsReservesParsed.map(
    reserve => ({
      reservePubkey: reserve.pubkey,
      oraclePubkey: reserve.info.liquidity.oraclePubkey,
    })
  );

  console.log(depositsReservesParsed);
  const newRefreshObligationTransaction = refreshObligationTransaction(
    obligationPubkey,
    depositsReservesAndOraclesInfos,
    borrowsReservesAndOraclesInfos
  );

  await sendAndConfirmTransaction(
    connection,
    newRefreshObligationTransaction,
    [payer],
    {
      commitment: 'singleGossip',
      preflightCommitment: 'singleGossip',
    }
  );
}
