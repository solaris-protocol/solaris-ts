import {
  Connection,
  PublicKey,
  Keypair,
  sendAndConfirmTransaction,
} from '@solana/web3.js';

import BN from 'bn.js';

import { LENDING_PROGRAM_ID } from '../constants';
import { depositObligatonCollateralParams, ReserveParser } from '../models';
import { depositObligationCollateralTransaction } from '../transactions';

export async function depositObligationCollateralCommand(
  connection: Connection,
  collateralAmount: number,
  sourceCollateralPubkey: PublicKey,
  reservePubkey: PublicKey,
  obligationPubkey: PublicKey,
  userTransferAuthorityKeypair: Keypair,
  payer: Keypair
): Promise<void> {
  const reserveAccountInfo = await connection.getAccountInfo(reservePubkey);

  if (reserveAccountInfo === null) {
    throw 'Error: cannot find the reserve account';
  }

  const reserveParsed = ReserveParser(reservePubkey, reserveAccountInfo);

  const destinationReserveCollateralPubkey =
    reserveParsed.info.collateral.supplyPubkey;
  const lendingMarketPubkey = reserveParsed.info.lendingMarket;
  const pythPricePubkey = reserveParsed.info.liquidity.oraclePubkey;

  const [
    lendingMarketDerivedAuthorityPubkey,
    _bumpSeed,
  ] = await PublicKey.findProgramAddress(
    [lendingMarketPubkey.toBytes()],
    LENDING_PROGRAM_ID
  );

  const userTransferAuthorityPubkey = userTransferAuthorityKeypair.publicKey;

  const newDepositObligationCollateralParams: depositObligatonCollateralParams = {
    collateralAmount,
    sourceCollateralPubkey,
    destinationReserveCollateralPubkey,
    reservePubkey,
    obligationPubkey,
    lendingMarketPubkey,
    lendingMarketDerivedAuthorityPubkey,
    obligationOwnerPubkey: payer.publicKey,
    userTransferAuthorityPubkey,
    pythPricePubkey,
  };

  //initReserve transaction
  const newDepositObligationCollateralTransaction = depositObligationCollateralTransaction(
    newDepositObligationCollateralParams,
    payer.publicKey
  );

  try {
    await sendAndConfirmTransaction(
      connection,
      newDepositObligationCollateralTransaction,
      [payer, userTransferAuthorityKeypair],
      {
        commitment: 'singleGossip',
        preflightCommitment: 'singleGossip',
      }
    );
    console.log('Successfull obligation collateral deposit');
  } catch (e) {
    console.log(`DepositObligationCollateral Error: ${e}`);
  }
}
