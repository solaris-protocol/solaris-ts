import {
  PublicKey,
  TransactionInstruction,
  SYSVAR_CLOCK_PUBKEY,
} from '@solana/web3.js';

import * as BufferLayout from 'buffer-layout';
import { LendingInstructions } from './lendingInstructions';
import { LENDING_PROGRAM_ID } from '../constants';

// 3
/// Accrue interest and update market price of liquidity on a reserve.
///
/// Accounts expected by this instruction:
///
///   0. `[writable]` Reserve account.
///   1. `[]` Reserve liquidity oracle account.
///           Must be the Pyth price account specified at InitReserve.
///   2. `[]` Clock sysvar.
export const refreshReserveInstruction = (
  reservePubkey: PublicKey,
  pythPricePubkey: PublicKey
): TransactionInstruction => {
  const dataLayout = BufferLayout.u8('instruction');

  const data = Buffer.alloc(dataLayout.span);
  dataLayout.encode(LendingInstructions.RefreshReserve, data);

  const keys = [
    { pubkey: reservePubkey, isSigner: false, isWritable: true },
    { pubkey: pythPricePubkey, isSigner: false, isWritable: false },
    { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
  ];

  return new TransactionInstruction({
    keys,
    programId: LENDING_PROGRAM_ID,
    data,
  });
};
