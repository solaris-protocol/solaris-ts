import { Transaction, PublicKey } from '@solana/web3.js';
import { Token } from '@solana/spl-token';
import { TOKEN_PROGRAM_ID } from '../constants';
import {
  depositObligationCollateralInstruction,
  refreshReserveInstruction,
} from '../instructions';
import { depositObligatonCollateralParams } from '../models';

export const depositObligationCollateralTransaction = (
  params: depositObligatonCollateralParams,
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
    .add(depositObligationCollateralInstruction(params));
};
