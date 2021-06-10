import { Transaction, PublicKey } from '@solana/web3.js';
import { Token } from '@solana/spl-token';
import { TOKEN_PROGRAM_ID } from '../constants';
import {
  redeemReserveCollateralInstruction,
  refreshReserveInstruction,
} from '../instructions';
import { withdrawObligationCollateraParams } from '../models';

export const withdrawObligationCollateralTransaction = (
  params: withdrawObligationCollateraParams,
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
    .add(
      refreshReserveInstruction(params.reservePubkey, params.pythPricePubkey)
    )
    .add(redeemReserveCollateralInstruction(params));
};
