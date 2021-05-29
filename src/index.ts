import {
  Keypair,
  Connection,
  sendAndConfirmTransaction,
} from '@solana/web3.js';

import { LendingMarketLayout } from './models';

import {
  initLendingMarketTransaction,
  setLendingMarketOwnerTransaction,
} from './transactions';
import { WRAPPED_SOL_MINT } from './constants';

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
  const lendingMarketOwner = getPayer();
  const lendingMarketNewOwner = getPayer();
  //create connection
  const connection = getConnection();

  //airdrop SOL
  await makeAirdrop(connection, lendingMarketOwner, 10000000);
  await makeAirdrop(connection, lendingMarketNewOwner, 10000000);

  //create Lending Market Account
  const balanceNeeded = await connection.getMinimumBalanceForRentExemption(
    LendingMarketLayout.span
  );

  const LendingMarketAccount = Keypair.generate();

  //make it RentExempt by sending enough lamports
  //init LendingMarket by sending initLendingMarketTransaction and making payer an owner
  const initTransaction = initLendingMarketTransaction(
    LendingMarketAccount.publicKey,
    WRAPPED_SOL_MINT,
    lendingMarketOwner.publicKey,
    balanceNeeded
  );

  const newOwnerTransaction = setLendingMarketOwnerTransaction(
    LendingMarketAccount.publicKey,
    lendingMarketOwner.publicKey,
    lendingMarketNewOwner.publicKey
  );

  try {
    await sendAndConfirmTransaction(
      connection,
      initTransaction,
      [lendingMarketOwner, LendingMarketAccount],
      { commitment: 'singleGossip', preflightCommitment: 'singleGossip' }
    );

    await sendAndConfirmTransaction(
      connection,
      newOwnerTransaction,
      [lendingMarketOwner, lendingMarketOwner],
      { commitment: 'singleGossip', preflightCommitment: 'singleGossip' }
    );
  } catch (e) {
    console.log(e);
  }
}

run();
