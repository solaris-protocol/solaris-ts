import { Transaction, PublicKey } from '@solana/web3.js';

import { refreshReserveInstruction } from '../instructions';

export const refreshReserveTransaction = (
  reservePubkey: PublicKey,
  pythPricePubkey: PublicKey
): Transaction => {
  return new Transaction().add(
    refreshReserveInstruction(reservePubkey, pythPricePubkey)
  );
};
