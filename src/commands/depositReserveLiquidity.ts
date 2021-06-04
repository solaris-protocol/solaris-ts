import {
  Connection,
  PublicKey,
  Keypair,
  sendAndConfirmTransaction,
} from '@solana/web3.js';

import { LENDING_PROGRAM_ID } from '../constants';
import { depositReserveLiquidityParams, ReserveParser } from '../models';
import { depositReserveLiquidityTransaction } from '../transactions';

export async function depositReserveLiquidityCommand(
  connection: Connection,
  liquidityAmount: number,
  sourceLiquidityPubkey: PublicKey,
  destinationCollateralPubkey: PublicKey,
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

  const newDepositParams: depositReserveLiquidityParams = {
    liquidityAmount,
    sourceLiquidityPubkey,
    destinationCollateralPubkey,
    reservePubkey,
    reserveLiquiditySupplyPubkey,
    reserveCollateralMintPubkey,
    lendingMarketPubkey,
    lendingMarketDerivedAuthorityPubkey,
    userTransferAuthorityPubkey,
    pythPricePubkey,
  };

  //initReserve transaction
  const newDepositTransaction = depositReserveLiquidityTransaction(
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
    console.log('Successfull reserve deposit');
  } catch (e) {
    console.log(`InitReserve Error: ${e}`);
  }
}
