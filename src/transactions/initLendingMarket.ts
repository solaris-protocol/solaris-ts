import { Transaction, PublicKey, SystemProgram } from '@solana/web3.js';

import { initLendingMarketInstruction } from '../instructions';

import { LENDING_PROGRAM_ID } from '../constants';

import { LendingMarketLayout } from '../models';

export const initLendingMarketTransaction = (
  lendingMarketPubKey: PublicKey,
  quoteCurrency: string,
  owner: PublicKey,
  balanceNeeded: number
): Transaction => {
  return new Transaction()
    .add(
      SystemProgram.createAccount({
        fromPubkey: owner,
        newAccountPubkey: lendingMarketPubKey,
        lamports: balanceNeeded,
        space: LendingMarketLayout.span,
        programId: LENDING_PROGRAM_ID,
      })
    )
    .add(
      initLendingMarketInstruction(
        lendingMarketPubKey,
        quoteCurrency,
        owner
      )
    );
};
