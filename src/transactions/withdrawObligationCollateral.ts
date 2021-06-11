import {
  Transaction,
  PublicKey,
  TransactionInstruction,
} from '@solana/web3.js';
import { Token } from '@solana/spl-token';
import { TOKEN_PROGRAM_ID } from '../constants';
import {
  withdrawObligationCollateralInstruction,
  refreshReserveInstruction,
  refreshObligationInstruction,
} from '../instructions';
import {
  withdrawObligationCollateraParams,
  ReserveAndOraclePubkeys,
} from '../models';

export const withdrawObligationCollateralTransaction = (
  params: withdrawObligationCollateraParams,
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
    .add(withdrawObligationCollateralInstruction(params));
};
