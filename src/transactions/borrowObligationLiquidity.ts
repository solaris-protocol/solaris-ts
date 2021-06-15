import {
  Transaction,
  PublicKey,
  TransactionInstruction,
} from '@solana/web3.js';
import {
  borrowObligationLiquidityInstruction,
  refreshReserveInstruction,
  refreshObligationInstruction,
} from '../instructions';
import {
  borrowObligationLiquidityParams,
  ReserveAndOraclePubkeys,
} from '../models';

export const borrowObligationLiquidityTransaction = (
  params: borrowObligationLiquidityParams,
  obligationReservesAndOraclesPubkeys: Array<ReserveAndOraclePubkeys>
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
    .add(borrowObligationLiquidityInstruction(params));
};
