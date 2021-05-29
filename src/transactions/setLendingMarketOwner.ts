import { Transaction, PublicKey, SystemProgram } from '@solana/web3.js';

import { setLendingMarketOwnerInstruction } from '../instructions';

export const setLendingMarketOwnerTransaction = (
  lendingMarketPubKey: PublicKey,
  oldOwner: PublicKey,
  newOwner: PublicKey
): Transaction => {
  return new Transaction().add(
    setLendingMarketOwnerInstruction(lendingMarketPubKey, oldOwner, newOwner)
  );
};
