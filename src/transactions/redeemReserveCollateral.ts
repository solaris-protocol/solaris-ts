import { Transaction, PublicKey } from '@solana/web3.js';
import { Token } from '@solana/spl-token';
import { TOKEN_PROGRAM_ID } from '../constants';
import {
  redeemReserveCollateralInstruction,
  refreshReserveInstruction,
} from '../instructions';
import { redeemReserveCollateralParams } from '../models/reserve';

export const redeemReserveCollateralTransaction = (
  params: redeemReserveCollateralParams,
  payerPubkey: PublicKey
): Transaction => {
  return new Transaction()
    .add(
      Token.createApproveInstruction(
        TOKEN_PROGRAM_ID,
        params.sourceCollateralPubkey,
        params.userTransferAuthorityPubkey,
        payerPubkey,
        [],
        params.collateralAmount
      )
    )
    .add(redeemReserveCollateralInstruction(params))
    .add(
      refreshReserveInstruction(params.reservePubkey, params.pythPricePubkey)
    );
};
