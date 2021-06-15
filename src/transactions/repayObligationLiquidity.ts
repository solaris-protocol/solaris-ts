import {
  Transaction,
  TransactionInstruction,
  PublicKey,
} from '@solana/web3.js';
import { Token } from '@solana/spl-token';
import { TOKEN_PROGRAM_ID } from '../constants';
import {
  repayObligationLiquidityInstruction,
  refreshReserveInstruction,
  refreshObligationInstruction,
} from '../instructions';
import {
  repayObligationLiquidityParams,
  ReserveAndOraclePubkeys,
} from '../models';

export const repayObligationLiquidityTransaction = (
  params: repayObligationLiquidityParams,
  obligationReservesAndOraclesPubkeys: Array<ReserveAndOraclePubkeys>,
  payerPubkey: PublicKey
): Transaction => {
  const reserveRefreshInstructions: Array<TransactionInstruction> = obligationReservesAndOraclesPubkeys.map(
    reserveAndOraclePubkeys =>
      refreshReserveInstruction(
        reserveAndOraclePubkeys.reservePubkey,
        reserveAndOraclePubkeys.oraclePubkey
      )
  );

  return new Transaction()
    .add(
      ...reserveRefreshInstructions,
      refreshObligationInstruction(
        params.obligationPubkey,
        obligationReservesAndOraclesPubkeys.map(item => item.reservePubkey)
      )
    )
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
    .add(repayObligationLiquidityInstruction(params));
};
