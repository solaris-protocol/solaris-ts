import BN from 'bn.js';
import { PublicKey } from '@solana/web3.js';

export const WRAPPED_SOL_MINT = new PublicKey(
  'So11111111111111111111111111111111111111112'
);

export const TOKEN_PROGRAM_ID = new PublicKey(
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
);

// export const LENDING_PROGRAM_ID = new PublicKey(
//   'TokenLending1111111111111111111111111111111'
// );

export const LENDING_PROGRAM_ID = new PublicKey(
  '6h5geweHee42FbxZrYAcYJ8SGVAjG6sGow5dtzcKtrJw'
);

export const RESERVE_CONFIG_DEFAULTS = {
  optimalUtilizationRate: 80,
  loanToValueRatio: 50,
  liquidationBonus: 5,
  liquidationThreshold: 55,
  minBorrowRate: 0,
  optimalBorrowRate: 4,
  maxBorrowRate: 30,
  fees: {
    borrowFeeWad: new BN('100000000000'),
    flashLoanFeeWad: new BN('3000000000000000'),
    hostFeePercentage: 20,
  },
};
