import { Transaction, PublicKey, SystemProgram } from '@solana/web3.js';

import { initObligationInstruction } from '../instructions';

import { LENDING_PROGRAM_ID } from '../constants';

import { InitObligationParams, ObligationLayout } from '../models';

export const initObligationTransaction = (
  params: InitObligationParams,
  balanceNeeded: number
): Transaction => {
  return new Transaction()
    .add(
      SystemProgram.createAccount({
        fromPubkey: params.obligationOwnerPubkey,
        newAccountPubkey: params.obligationPubkey,
        lamports: balanceNeeded,
        space: ObligationLayout.span,
        programId: LENDING_PROGRAM_ID,
      })
    )
    .add(initObligationInstruction(params));
};
