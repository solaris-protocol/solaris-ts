import {
  TransactionInstruction,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
} from '@solana/web3.js';
import * as BufferLayout from 'buffer-layout';
import { InitObligationParams } from '../models';
import { LENDING_PROGRAM_ID, TOKEN_PROGRAM_ID } from '../constants';
import { LendingInstructions } from './lendingInstructions';

// 6
/// Initializes a new lending market obligation.
///
/// Accounts expected by this instruction:
///
///   0. `[writable]` Obligation account - uninitialized.
///   1. `[]` Lending market account.
///   2. `[signer]` Obligation owner.
///   3. `[]` Clock sysvar.
///   4. `[]` Rent sysvar.
///   5. `[]` Token program id.
export const initObligationInstruction = (
  params: InitObligationParams
): TransactionInstruction => {
  const dataLayout = BufferLayout.u8('instruction');

  const data = Buffer.alloc(dataLayout.span);
  dataLayout.encode(LendingInstructions.InitObligation, data);

  const keys = [
    {
      pubkey: params.obligationPubkey,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: params.lendingMarketPubkey,
      isSigner: false,
      isWritable: false,
    },
    { pubkey: params.obligationOwnerPubkey, isSigner: true, isWritable: false },
    { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
    { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
  ];

  return new TransactionInstruction({
    keys,
    programId: LENDING_PROGRAM_ID,
    data,
  });
};
