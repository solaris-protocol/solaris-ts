import {
  Keypair,
  Connection,
  sendAndConfirmTransaction,
} from '@solana/web3.js';

import {
  LendingMarketLayout,
  LendingReserveLayout,
  InitReserveParams,
} from './models';

import {
  initLendingMarketTransaction,
  setLendingMarketOwnerTransaction,
} from './transactions';
import {
  WRAPPED_SOL_MINT,
  RESERVE_CONFIG_DEFAULTS,
  LENDING_PROGRAM_ID,
} from './constants';
import { initReserveTransaction } from './transactions/initReserve';
import BN from 'bn.js';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';

function getRpcUrl(): string {
  return 'http://localhost:8899';
}

function getPayer(): Keypair {
  return Keypair.generate();
}

function getConnection(): Connection {
  const rpcUrl = getRpcUrl();
  return new Connection(rpcUrl, 'confirmed');
}

async function makeAirdrop(
  connection: Connection,
  account: Keypair,
  lamports = 1000000
): Promise<void> {
  const signature = await connection.requestAirdrop(
    account.publicKey,
    lamports
  );

  await connection.confirmTransaction(signature);
}

async function run() {
  //create payer account
  const payer = Keypair.generate();
  const lendingMarketOwner = Keypair.generate();
  const lendingMarketNewOwner = Keypair.generate();
  //create connection
  const connection = getConnection();

  //airdrop SOL
  await makeAirdrop(connection, payer, 10000000);
  await makeAirdrop(connection, lendingMarketOwner, 10000000);
  await makeAirdrop(connection, lendingMarketNewOwner, 10000000);

  //create Lending Market Account
  const LendingMarketInitBalanceNeeded = await connection.getMinimumBalanceForRentExemption(
    LendingMarketLayout.span
  );

  const lendingMarketAccount = Keypair.generate();

  //init LendingMarket by sending initLendingMarketTransaction and making payer an owner
  const initTransaction = initLendingMarketTransaction(
    lendingMarketAccount.publicKey,
    WRAPPED_SOL_MINT,
    lendingMarketOwner.publicKey,
    LendingMarketInitBalanceNeeded
  );

  const newOwnerTransaction = setLendingMarketOwnerTransaction(
    lendingMarketAccount.publicKey,
    lendingMarketOwner.publicKey,
    lendingMarketNewOwner.publicKey
  );

  //init new Reserve
  const reserveAccount = Keypair.generate();
  //create source liquidity user account
  const sourceLiquidityAccount = Keypair.generate();
  //create reserve liquidity token mint,
  //WRAPPED_SOL by default
  const reserveLiquidityMintPubkey = WRAPPED_SOL_MINT;
  //create reserve liquidity token account
  const reserveLiquiditySupplyAccount = Keypair.generate();
  //create reserve collateral token mint
  const reserveCollateralMintAccount = Keypair.generate();
  //create reserve collaterall supply account
  const reserveCollateralSupplyAccount = Keypair.generate();
  //create reserve liquidity fee receiver account
  const reserveLiquidityFeeReceiverAccount = Keypair.generate();
  //create user collateral account
  const destinationCollateralAccount = Keypair.generate();
  //create user transfer authority account
  const userTransferAuthorityAccount = Keypair.generate();
  //create pyth product account
  const pythProductAccount = Keypair.generate();
  //create pyth price account
  const pythPriceAccount = Keypair.generate();

  //setup reserve config
  const reserveConfig = RESERVE_CONFIG_DEFAULTS;

  const liquidityAmount: number = 10000;

  const newReserveParams: InitReserveParams = {
    liquidityAmount,
    reserveConfig,
    sourceLiquidityPubkey: sourceLiquidityAccount.publicKey,
    destinationCollateralPubkey: destinationCollateralAccount.publicKey,
    reservePubkey: reserveAccount.publicKey,
    reserveLiquidityMintPubkey: reserveLiquidityMintPubkey,
    reserveLiquiditySupplyPubkey: reserveLiquiditySupplyAccount.publicKey,
    reserveLiquidityFeeReceiverPubkey:
      reserveLiquidityFeeReceiverAccount.publicKey,
    reserveCollateralMintPubkey: reserveCollateralMintAccount.publicKey,
    reserveCollateralSupplyPubkey: reserveCollateralSupplyAccount.publicKey,
    pythProductPubkey: pythProductAccount.publicKey,
    pythPricePubkey: pythPriceAccount.publicKey,
    lendingMarketPubkey: lendingMarketAccount.publicKey,
    lendingMarketDerivedAuthorityPubkey: LENDING_PROGRAM_ID,
    lendingMarketOwnerPubkey: lendingMarketNewOwner.publicKey,
    userTransferAuthorityPubkey: userTransferAuthorityAccount.publicKey,
  };

  //calculate reserve init balance needed
  //it should include fees for creating all accounts

  const ReserveInitBalanceNeeded = await connection.getMinimumBalanceForRentExemption(
    LendingReserveLayout.span
  );

  //transactions for creating all accounts
  const reserveLiquidityToken = new Token(
    connection,
    reserveLiquidityMintPubkey,
    TOKEN_PROGRAM_ID,
    payer
  );

  const reserveCollateralToken = await Token.createMint(
    connection,
    payer,
    payer.publicKey,
    null,
    6,
    TOKEN_PROGRAM_ID
  );

  await Token.createWrappedNativeAccount(
    connection,
    TOKEN_PROGRAM_ID,
    newReserveParams.sourceLiquidityPubkey,
    payer,
    newReserveParams.liquidityAmount
  );

  await reserveLiquidityToken.createAccount(
    newReserveParams.reserveLiquiditySupplyPubkey
  );

  await reserveCollateralToken.createAccount(
    newReserveParams.reserveCollateralSupplyPubkey
  );

  //initReserve transaction
  const newReserveTransaction = initReserveTransaction(
    newReserveParams,
    lendingMarketNewOwner.publicKey,
    ReserveInitBalanceNeeded
  );

  try {
    await sendAndConfirmTransaction(
      connection,
      initTransaction,
      [lendingMarketOwner, lendingMarketAccount],
      { commitment: 'singleGossip', preflightCommitment: 'singleGossip' }
    );

    await sendAndConfirmTransaction(
      connection,
      newOwnerTransaction,
      [lendingMarketOwner, lendingMarketOwner],
      { commitment: 'singleGossip', preflightCommitment: 'singleGossip' }
    );

    await sendAndConfirmTransaction(
      connection,
      newReserveTransaction,
      [lendingMarketNewOwner, userTransferAuthorityAccount],
      { commitment: 'singleGossip', preflightCommitment: 'singleGossip' }
    );
  } catch (e) {
    console.log(e);
  }
}

run();
