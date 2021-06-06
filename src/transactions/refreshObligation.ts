import {
  Transaction,
  PublicKey,
  TransactionInstruction,
} from '@solana/web3.js';

import {
  refreshReserveInstruction,
  refreshObligationInstruction,
} from '../instructions';

import { ReserveAndOracleInfo } from '../models';

export const refreshObligationTransaction = (
  obligationPubkey: PublicKey,
  depositsReservesAndOraclesInfos: Array<ReserveAndOracleInfo>,
  borrowsReservesAndOraclesInfos: Array<ReserveAndOracleInfo>
): Transaction => {
  const reservesToRefreshInfos = [
    ...depositsReservesAndOraclesInfos,
    ...borrowsReservesAndOraclesInfos,
  ];

  const reserveRefreshInstructions: Array<TransactionInstruction> = reservesToRefreshInfos.map(
    reserveAndOracleInfo =>
      refreshReserveInstruction(
        reserveAndOracleInfo.reservePubkey,
        reserveAndOracleInfo.oraclePubkey
      )
  );

  const newRefreshObligationInstruction = refreshObligationInstruction(
    obligationPubkey,
    depositsReservesAndOraclesInfos.map(
      reserveAndOracleInfo => reserveAndOracleInfo.reservePubkey
    ),
    borrowsReservesAndOraclesInfos.map(
      reserveAndOracleInfo => reserveAndOracleInfo.reservePubkey
    )
  );

  const obligationRefreshInstructions: Array<TransactionInstruction> = [
    ...reserveRefreshInstructions,
    newRefreshObligationInstruction,
  ];

  return new Transaction().add(...obligationRefreshInstructions);
};
