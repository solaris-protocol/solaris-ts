import {
  Transaction,
  PublicKey,
  TransactionInstruction,
} from '@solana/web3.js';

import {
  refreshReserveInstruction,
  refreshObligationInstruction,
} from '../instructions';

import { ReserveAndOraclePubkeys } from '../models';

export const refreshObligationTransaction = (
  obligationPubkey: PublicKey,
  obligationReservesAndOraclesPubkeys: Array<ReserveAndOraclePubkeys>
): Transaction => {
  const reserveRefreshInstructions: Array<TransactionInstruction> = obligationReservesAndOraclesPubkeys.map(
    reserveAndOraclePubkeys =>
      refreshReserveInstruction(
        reserveAndOraclePubkeys.reservePubkey,
        reserveAndOraclePubkeys.oraclePubkey
      )
  );

  const newRefreshObligationInstruction = refreshObligationInstruction(
    obligationPubkey,
    obligationReservesAndOraclesPubkeys.map(
      reserveAndOraclePubkeys => reserveAndOraclePubkeys.reservePubkey
    )
  );

  const obligationRefreshInstructions: Array<TransactionInstruction> = [
    ...reserveRefreshInstructions,
    newRefreshObligationInstruction,
  ];

  return new Transaction().add(...obligationRefreshInstructions);
};
