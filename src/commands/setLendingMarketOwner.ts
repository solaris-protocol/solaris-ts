import {
  Connection,
  PublicKey,
  Keypair,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import { setLendingMarketOwnerTransaction } from '../transactions';

export async function setLendingMarketOwnerCommand(
  connection: Connection,
  lendingMarketPubkey: PublicKey,
  lendingMarketOwnerAccount: Keypair,
  lendingMarketNewOwnerPubkey: PublicKey,
  payer: Keypair
): Promise<void> {
  const newOwnerTransaction = setLendingMarketOwnerTransaction(
    lendingMarketPubkey,
    lendingMarketOwnerAccount.publicKey,
    lendingMarketNewOwnerPubkey
  );

  await sendAndConfirmTransaction(
    connection,
    newOwnerTransaction,
    [lendingMarketOwnerAccount, payer],
    {
      commitment: 'singleGossip',
      preflightCommitment: 'singleGossip',
    }
  );
}
