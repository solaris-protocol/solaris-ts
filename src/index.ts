import { Connection, PublicKey, Keypair, AccountInfo } from '@solana/web3.js';

import { Token, TOKEN_PROGRAM_ID, AccountLayout } from '@solana/spl-token';

import { getPayer } from './accounts';

import {
  RESERVE_CONFIG_DEFAULTS,
  WRAPPED_SOL_MINT,
  LENDING_PROGRAM_ID,
} from './constants';
import {
  initLendingMarketCommand,
  initReserveCommand,
  refreshReserveCommand,
  depositReserveLiquidityCommand,
  redeemReserveCollateralCommand,
  refreshObligationCommand,
  depositObligationCollateralCommand,
} from './commands';

import * as BufferLayout from 'buffer-layout';
import * as Layout from './utils/layouts';

import { ReserveParser } from './models';
import { initObligationCommand } from './commands/initObligation';
import BN from 'bn.js';

function getRpcUrl(): string {
  return 'https://api.devnet.solana.com';
}

function getConnection(): Connection {
  const rpcUrl = getRpcUrl();
  return new Connection(rpcUrl, 'confirmed');
}

async function run() {
  //create payer account
  const payer = getPayer();
  //create user transfer authority account
  const userTransferAuthorityKeypair = Keypair.generate();

  //get connection
  const connection = getConnection();

  // //init Lending Market
  // const lendingMarketOwner = payer;

  // const quoteCurrency = 'USD';

  // const newLendingMarketPubkey = await initLendingMarketCommand(
  //   connection,
  //   lendingMarketOwner.publicKey,
  //   quoteCurrency,
  //   payer
  // );

  // // 9cu7LXZYJ6oNNi7X4anv2LP8NP58h8zKiE61LMcgJt5h
  // console.log('New Lending Market Pubkey:', newLendingMarketPubkey.toBase58());

  //init new Reserve

  //setup reserve config
  // const reserveConfig = RESERVE_CONFIG_DEFAULTS;

  // const liquidityAmount: number = 10000;

  // //create source liquidity user account
  // const sourceLiquidityPubkey = await Token.createWrappedNativeAccount(
  //   connection,
  //   TOKEN_PROGRAM_ID,
  //   payer.publicKey,
  //   payer,
  //   liquidityAmount
  // );

  // const lendingMarketPubkey = new PublicKey(
  //   '9cu7LXZYJ6oNNi7X4anv2LP8NP58h8zKiE61LMcgJt5h'
  // );

  // const pythProductPubkey = new PublicKey(
  //   '8yrQMUyJRnCJ72NWwMiPV9dNGw465Z8bKUvnUC8P5L6F'
  // );

  // const pythPricePubkey = new PublicKey(
  //   'BdgHsXrH1mXqhdosXavYxZgX6bGqTdj5mh2sxDhF8bJy'
  // );

  // const newReserve = await initReserveCommand(
  //   connection,
  //   liquidityAmount,
  //   reserveConfig,
  //   sourceLiquidityPubkey,
  //   lendingMarketPubkey,
  //   pythProductPubkey,
  //   pythPricePubkey,
  //   payer
  // );

  // //Bfs6BTc2t6Epb9hjGpLpQcSmQ1ZycKsEv6mV3QuV3VzZ
  // console.log(newReserve.toBase58());

  // Refresh reserve

  // await refreshReserveCommand(
  //   connection,
  //   new PublicKey('Bfs6BTc2t6Epb9hjGpLpQcSmQ1ZycKsEv6mV3QuV3VzZ'),
  //   payer
  // );

  // // Deposit to reserve
  // const reservePubkey = new PublicKey(
  //   'Bfs6BTc2t6Epb9hjGpLpQcSmQ1ZycKsEv6mV3QuV3VzZ'
  // );

  // const depositAmount = 1000000;

  // //create source liquidity user account
  // const sourceLiquidityPubkey = await Token.createWrappedNativeAccount(
  //   connection,
  //   TOKEN_PROGRAM_ID,
  //   payer.publicKey,
  //   payer,
  //   depositAmount
  // );

  // //create destination collateral user account
  // const reserveAccountInfo = await connection.getAccountInfo(reservePubkey);

  // if (reserveAccountInfo === null) {
  //   throw 'Error: cannot find the reserve account';
  // }

  // const reserveParsed = ReserveParser(reservePubkey, reserveAccountInfo);

  // const reserveCollateralMintPubkey = reserveParsed.info.collateral.mintPubkey;

  // const collateralToken = new Token(
  //   connection,
  //   reserveCollateralMintPubkey,
  //   TOKEN_PROGRAM_ID,
  //   payer
  // );

  // const destinationCollateralPubkey = await collateralToken.createAccount(
  //   payer.publicKey
  // );

  // await depositReserveLiquidityCommand(
  //   connection,
  //   depositAmount,
  //   sourceLiquidityPubkey,
  //   destinationCollateralPubkey,
  //   reservePubkey,
  //   userTransferAuthorityKeypair,
  //   payer
  // );

  // // redeem collateral from a reserve

  // const collateralAmount = 1000000;

  // await redeemReserveCollateralCommand(
  //   connection,
  //   collateralAmount,
  //   destinationCollateralPubkey,
  //   sourceLiquidityPubkey,
  //   reservePubkey,
  //   userTransferAuthorityKeypair,
  //   payer
  // );

  // init Obligation
  // const lendingMarketPubkey = new PublicKey(
  //   '9cu7LXZYJ6oNNi7X4anv2LP8NP58h8zKiE61LMcgJt5h'
  // );
  // const newObligation = await initObligationCommand(
  //   connection,
  //   lendingMarketPubkey,
  //   payer
  // );
  //G5Bk28JbUqYzBVNjP1qZkq4yLxfuREVzoWwBbTQ6qa81
  // console.log('###: newObligation', newObligation.toBase58());

  //Refresh obligation
  // const obligationPubkey = new PublicKey(
  //   'G5Bk28JbUqYzBVNjP1qZkq4yLxfuREVzoWwBbTQ6qa81'
  // );

  // await refreshObligationCommand(connection, obligationPubkey, payer);

  //deposit obligation collateral
  const reservePubkey = new PublicKey(
    'Bfs6BTc2t6Epb9hjGpLpQcSmQ1ZycKsEv6mV3QuV3VzZ'
  );

  const reserveAccountInfo = await connection.getAccountInfo(reservePubkey);

  if (reserveAccountInfo === null) {
    throw 'Error: cannot find the reserve account';
  }

  const reserveParsed = ReserveParser(reservePubkey, reserveAccountInfo);

  const collateralAmount = 100;

  const obligationPubkey = new PublicKey(
    'G5Bk28JbUqYzBVNjP1qZkq4yLxfuREVzoWwBbTQ6qa81'
  );

  const lendingMarketPubkey = new PublicKey(
    '9cu7LXZYJ6oNNi7X4anv2LP8NP58h8zKiE61LMcgJt5h'
  );

  const payerCollateralTokenAccounts = await connection.getTokenAccountsByOwner(
    payer.publicKey,
    { mint: reserveParsed.info.collateral.mintPubkey }
  );

  const payerCollateralTokenAccountPubkey =
    payerCollateralTokenAccounts.value.find(
      item =>
        new BN(AccountLayout.decode(item.account.data).amount).cmp(
          new BN('0')
        ) === 1
    )?.pubkey || payer.publicKey;

  console.log(payerCollateralTokenAccountPubkey.toBase58());

  await depositObligationCollateralCommand(
    connection,
    collateralAmount,
    payerCollateralTokenAccountPubkey,
    reservePubkey,
    obligationPubkey,
    userTransferAuthorityKeypair,
    payer
  );
}

run();
