import { Connection, PublicKey } from '@solana/web3.js';

import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';

import { getPayer } from './accounts';

import { RESERVE_CONFIG_DEFAULTS, WRAPPED_SOL_MINT } from './constants';
import { initLendingMarketCommand, initReserveCommand } from './commands';

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
  const reserveConfig = RESERVE_CONFIG_DEFAULTS;

  const liquidityAmount: number = 10000;

  //create source liquidity user account
  const sourceLiquidityPubkey = await Token.createWrappedNativeAccount(
    connection,
    TOKEN_PROGRAM_ID,
    payer.publicKey,
    payer,
    liquidityAmount
  );

  const lendingMarketPubkey = new PublicKey(
    '9cu7LXZYJ6oNNi7X4anv2LP8NP58h8zKiE61LMcgJt5h'
  );

  const pythProductPubkey = new PublicKey(
    '8yrQMUyJRnCJ72NWwMiPV9dNGw465Z8bKUvnUC8P5L6F'
  );

  const pythPricePubkey = new PublicKey(
    'BdgHsXrH1mXqhdosXavYxZgX6bGqTdj5mh2sxDhF8bJy'
  );

  const newReserve = await initReserveCommand(
    connection,
    liquidityAmount,
    reserveConfig,
    sourceLiquidityPubkey,
    lendingMarketPubkey,
    pythProductPubkey,
    pythPricePubkey,
    payer
  );

  //Bfs6BTc2t6Epb9hjGpLpQcSmQ1ZycKsEv6mV3QuV3VzZ
  console.log(newReserve.toBase58());
}

run();
