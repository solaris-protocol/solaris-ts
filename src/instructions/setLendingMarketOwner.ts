import { PublicKey, TransactionInstruction } from '@solana/web3.js';

import * as BufferLayout from 'buffer-layout';
import * as Layouts from '../utils/layouts';
import { LENDING_PROGRAM_ID, TOKEN_PROGRAM_ID } from '../constants';
import { LendingInstructions } from './lendingInstructions';

// 1
/// Sets the new owner of a lending market.
///
/// Accounts expected by this instruction:
///
///   0. `[writable]` Lending market account.
///   1. `[signer]` Current owner.
export const setLendingMarketOwnerInstruction = (
  lendingMarketPubkey: PublicKey,
  oldOwnerPubkey: PublicKey,
  newOwnerPubkey: PublicKey
): TransactionInstruction => {
  const dataLayout = BufferLayout.struct([
    BufferLayout.u8('instruction'),
    Layouts.publicKey('new_owner'),
  ]);

  const data = Buffer.alloc(dataLayout.span);
  dataLayout.encode(
    {
      instruction: LendingInstructions.SetLendingMarketOwner,
      new_owner: newOwnerPubkey,
    },
    data
  );

  const keys = [
    { pubkey: lendingMarketPubkey, isSigner: false, isWritable: true },
    { pubkey: oldOwnerPubkey, isSigner: true, isWritable: false },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
  ];

  return new TransactionInstruction({
    keys,
    programId: LENDING_PROGRAM_ID,
    data,
  });
};
