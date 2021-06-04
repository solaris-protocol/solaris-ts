import {
  Connection,
  PublicKey,
  Keypair,
  sendAndConfirmTransaction,
} from '@solana/web3.js';

import { LENDING_PROGRAM_ID } from '../constants';
import { redeemReserveCollateralParams, ReserveParser } from '../models';
import { redeemReserveCollateralTransaction } from '../transactions';

export async function redeemReserveCollateralCommand(
  connection: Connection,
  collateralAmount: number,
  sourceCollateralPubkey: PublicKey,
  destinationLiquidityPubkey: PublicKey,
  reservePubkey: PublicKey,
  userTransferAuthorityKeypair: Keypair,
  payer: Keypair
): Promise<void> {
  const reserveAccountInfo = await connection.getAccountInfo(reservePubkey);

  if (reserveAccountInfo === null) {
    throw 'Error: cannot find the reserve account';
  }

  const reserveParsed = ReserveParser(reservePubkey, reserveAccountInfo);

  const reserveLiquiditySupplyPubkey =
    reserveParsed.info.liquidity.supplyPubkey;
  const reserveCollateralMintPubkey = reserveParsed.info.collateral.mintPubkey;
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

  const newDepositParams: redeemReserveCollateralParams = {
    collateralAmount,
    sourceCollateralPubkey,
    destinationLiquidityPubkey,
    reservePubkey,
    reserveCollateralMintPubkey,
    reserveLiquiditySupplyPubkey,
    lendingMarketPubkey,
    lendingMarketDerivedAuthorityPubkey,
    userTransferAuthorityPubkey,
    pythPricePubkey,
  };

  //initReserve transaction
  const newDepositTransaction = redeemReserveCollateralTransaction(
    newDepositParams,
    payer.publicKey
  );

  try {
    await sendAndConfirmTransaction(
      connection,
      newDepositTransaction,
      [payer, userTransferAuthorityKeypair],
      {
        commitment: 'singleGossip',
        preflightCommitment: 'singleGossip',
      }
    );
    console.log('Successfull reserve redeem');
  } catch (e) {
    console.log(`InitReserve Error: ${e}`);
  }
}
