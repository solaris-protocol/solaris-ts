import {
  Connection,
  PublicKey,
  Keypair,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import { LendingMarketLayout } from '../models';
import { initLendingMarketTransaction } from '../transactions';

export async function initLendingMarketCommand(
  connection: Connection,
  ownerPubkey: PublicKey,
  quoteCurrency: string,
  payer: Keypair
): Promise<PublicKey> {
  //create Lending Market Account
  const LendingMarketInitBalanceNeeded = await connection.getMinimumBalanceForRentExemption(
    LendingMarketLayout.span
  );

  const lendingMarketAccount = Keypair.generate();

  //init LendingMarket by sending initLendingMarketTransaction and making payer an owner
  const initTransaction = initLendingMarketTransaction(
    lendingMarketAccount.publicKey,
    quoteCurrency,
    ownerPubkey,
    LendingMarketInitBalanceNeeded
  );

  await sendAndConfirmTransaction(
    connection,
    initTransaction,
    [payer, lendingMarketAccount],
    {
      commitment: 'singleGossip',
      preflightCommitment: 'singleGossip',
    }
  );

  return lendingMarketAccount.publicKey;
}
