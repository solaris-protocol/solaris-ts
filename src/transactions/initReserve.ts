import { Transaction, PublicKey } from '@solana/web3.js';
import { Token } from '@solana/spl-token';
import { TOKEN_PROGRAM_ID } from '../constants';
import { initReserveInstruction } from '../instructions';
import { InitReserveParams } from '../models/reserve';

export const initReserveTransaction = (
  params: InitReserveParams,
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
    .add(initReserveInstruction(params));
};
