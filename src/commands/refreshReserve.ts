import {
  Connection,
  PublicKey,
  Keypair,
  sendAndConfirmTransaction,
} from '@solana/web3.js';

import * as Layouts from '../utils/layouts';
import { ReserveParser, ReserveLayout } from '../models';
import { refreshReserveTransaction } from '../transactions';
import BN from 'bn.js';

export async function refreshReserveCommand(
  connection: Connection,
  reservePubkey: PublicKey,
  payer: Keypair
): Promise<void> {
  const reserveAccountInfo = await connection.getAccountInfo(reservePubkey);

  if (reserveAccountInfo === null) {
    throw 'Error: cannot find the reserve account';
  }

  const reserve = ReserveLayout.decode(Buffer.from(reserveAccountInfo.data));
  const reserveParsed = ReserveParser(reservePubkey, reserveAccountInfo);

  console.log(reserveParsed.info.liquidity.oraclePubkey.toBase58());

  const newRefreshReserveTransaction = refreshReserveTransaction(
    reservePubkey,
    reserveParsed.info.liquidity.oraclePubkey
  );

  await sendAndConfirmTransaction(
    connection,
    newRefreshReserveTransaction,
    [payer],
    {
      commitment: 'singleGossip',
      preflightCommitment: 'singleGossip',
    }
  );
}
