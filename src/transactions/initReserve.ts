import { Transaction, PublicKey, SystemProgram } from '@solana/web3.js';

import { initLendingMarketInstruction } from '../instructions';

import { LENDING_PROGRAM_ID } from '../constants';
import { initReserveInstruction } from '../instructions';

import { LendingReserveLayout } from '../models';
import { InitReserveParams } from '../models/reserve';

export const initReserveTransaction = (
  params: InitReserveParams,
  payerPubkey: PublicKey,
  balanceNeeded: number
): Transaction => {
  return (
    new Transaction()
      //@TODO add approval for the source liquidity transfer
      .add(initReserveInstruction(params))
  );
};
