import {
  PublicKey,
  TransactionInstruction,
  SYSVAR_CLOCK_PUBKEY,
} from '@solana/web3.js';

import * as BufferLayout from 'buffer-layout';
import { LendingInstructions } from './lendingInstructions';
import { LENDING_PROGRAM_ID } from '../constants';

// 7
/// Refresh an obligation's accrued interest and collateral and liquidity prices. Requires
/// refreshed reserves, as all obligation collateral deposit reserves in order, followed by all
/// liquidity borrow reserves in order.
///
/// Accounts expected by this instruction:
///
///   0. `[writable]` Obligation account.
///   1. `[]` Clock sysvar.
///   .. `[]` Collateral deposit reserve accounts - refreshed, all, in order.
///   .. `[]` Liquidity borrow reserve accounts - refreshed, all, in order.
export const refreshObligationInstruction = (
  obligationPubkey: PublicKey,
  obligationReserves: Array<PublicKey>,
): TransactionInstruction => {
  const dataLayout = BufferLayout.u8('instruction');

  const data = Buffer.alloc(dataLayout.span);
  dataLayout.encode(LendingInstructions.RefreshObligation, data);

  const keys = [
    { pubkey: obligationPubkey, isSigner: false, isWritable: true },
    { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
    ...obligationReserves.map(reservePubkey => ({
      pubkey: reservePubkey,
      isSigner: false,
      isWritable: false,
    })),
  ];

  return new TransactionInstruction({
    keys,
    programId: LENDING_PROGRAM_ID,
    data,
  });
};
