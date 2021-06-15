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
    borrowsReserves.map(async reserve => {
      const reserveAccountInfo = await connection.getAccountInfo(
        reserve.borrowReserve
      );

      if (reserveAccountInfo === null) {
        throw 'Error: cannot find the reserve account from obligation deposits';
      }

      return ReserveParser(reserve.borrowReserve, reserveAccountInfo);
    })
  );

  const borrowsReservesAndOraclesPubkeys = borrowsReservesParsed.map(
    reserve => ({
      reservePubkey: reserve.pubkey,
      oraclePubkey: reserve.info.liquidity.oraclePubkey,
    })
  );

  const depositsReservesAndOraclesPubkeys = depositsReservesParsed.map(
    reserve => ({
      reservePubkey: reserve.pubkey,
      oraclePubkey: reserve.info.liquidity.oraclePubkey,
    })
  );

  const obligationReservesAndOraclesPubkeys = [
    ...depositsReservesAndOraclesPubkeys,
    ...borrowsReservesAndOraclesPubkeys,
  ];

  const newRefreshObligationTransaction = refreshObligationTransaction(
    obligationPubkey,
    obligationReservesAndOraclesPubkeys
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
