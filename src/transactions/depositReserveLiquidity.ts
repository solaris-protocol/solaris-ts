import { Transaction, PublicKey } from '@solana/web3.js';
import { Token } from '@solana/spl-token';
import { TOKEN_PROGRAM_ID } from '../constants';
import {
  depositReserveLiquidityInstruction,
  refreshReserveInstruction,
} from '../instructions';
import { depositReserveLiquidityParams } from '../models/reserve';

export const depositReserveLiquidityTransaction = (
  params: depositReserveLiquidityParams,
  payerPubkey: PublicKey
): Transaction => {
  return new Transaction()
    .add(
      Token.createApproveInstruction(
        TOKEN_PROGRAM_ID,
        params.sourceLiquidityPubkey,
        params.userTransferAuthorityPubkey,
        payerPubkey,
        [],
        params.liquidityAmount
      )
    )
    .add(
      refreshReserveInstruction(params.reservePubkey, params.pythPricePubkey)
    )
    .add(depositReserveLiquidityInstruction(params));
};
