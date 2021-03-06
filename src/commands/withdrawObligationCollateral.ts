import {
  Connection,
  PublicKey,
  Keypair,
  sendAndConfirmTransaction,
} from '@solana/web3.js';

import { LENDING_PROGRAM_ID } from '../constants';
import {
  withdrawObligationCollateralParams,
  ObligationParser,
  ReserveParser,
} from '../models';
import { withdrawObligationCollateralTransaction } from '../transactions';

export async function withdrawObligationCollateralCommand(
  connection: Connection,
  collateralAmount: number,
  reservePubkey: PublicKey,
  obligationPubkey: PublicKey,
  destinationCollateralPubkey: PublicKey,
  payer: Keypair
): Promise<void> {
  const reserveAccountInfo = await connection.getAccountInfo(reservePubkey);
  const obligationAccountInfo = await connection.getAccountInfo(
    obligationPubkey
  );

  if (reserveAccountInfo === null) {
    throw 'Error: cannot find the reserve account';
  }

  if (obligationAccountInfo === null) {
    throw 'Error: cannot find the obligation account';
  }

  const reserveParsed = ReserveParser(reservePubkey, reserveAccountInfo);
  const obligationParsed = ObligationParser(
    obligationPubkey,
    obligationAccountInfo
  );

  const obligationReservesPubkeys = [
    ...obligationParsed.info.deposits.map(deposit => deposit.depositReserve),
    ...obligationParsed.info.borrows.map(borrow => borrow.borrowReserve),
  ];

  const obligationReservesAndOraclesPubkeys = await Promise.all(
    obligationReservesPubkeys.map(async reservePubkey => {
      const reserveAccountInfo = await connection.getAccountInfo(reservePubkey);

      if (reserveAccountInfo === null) {
        throw 'Error: cannot find the reserve account';
      }

      const reserveParsed = ReserveParser(reservePubkey, reserveAccountInfo);

      return {
        reservePubkey: reservePubkey,
        oraclePubkey: reserveParsed.info.liquidity.oraclePubkey,
      };
    })
  );

  const sourceReserveCollateralPubkey =
    reserveParsed.info.collateral.supplyPubkey;
  const lendingMarketPubkey = reserveParsed.info.lendingMarket;

  const [
    lendingMarketDerivedAuthorityPubkey,
    _bumpSeed,
  ] = await PublicKey.findProgramAddress(
    [lendingMarketPubkey.toBytes()],
    LENDING_PROGRAM_ID
  );

  const newWithdrawObligationCollateralParams: withdrawObligationCollateralParams = {
    collateralAmount,
    sourceReserveCollateralPubkey,
    destinationCollateralPubkey,
    reservePubkey,
    obligationPubkey,
    lendingMarketPubkey,
    lendingMarketDerivedAuthorityPubkey,
    obligationOwnerPubkey: payer.publicKey,
  };

  //withdraw obligation collateral transaction
  const newWithdrawObligationCollateralTransaction = withdrawObligationCollateralTransaction(
    newWithdrawObligationCollateralParams,
    obligationReservesAndOraclesPubkeys
  );

  try {
    await sendAndConfirmTransaction(
      connection,
      newWithdrawObligationCollateralTransaction,
      [payer],
      {
        commitment: 'singleGossip',
        preflightCommitment: 'singleGossip',
      }
    );
    console.log('Successfull obligation collateral withdraw');
  } catch (e) {
    console.log(`InitReserve Error: ${e}`);
  }
}
