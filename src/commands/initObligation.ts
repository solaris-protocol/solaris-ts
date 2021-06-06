import {
  Connection,
  PublicKey,
  Keypair,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import { InitObligationParams, ObligationLayout } from '../models';
import { initObligationTransaction } from '../transactions';

export async function initObligationCommand(
  connection: Connection,
  lendingMarketPubkey: PublicKey,
  payer: Keypair
): Promise<PublicKey> {
  //create Obligation
  const ObligationInitBalanceNeeded = await connection.getMinimumBalanceForRentExemption(
    ObligationLayout.span
  );

  const obligationKeypair: Keypair = Keypair.generate();

  const obligationParams: InitObligationParams = {
    obligationPubkey: obligationKeypair.publicKey,
    lendingMarketPubkey,
    obligationOwnerPubkey: payer.publicKey,
  };

  //init Obligation by sending initObligationTransaction and making payer an owner
  const initTransaction = initObligationTransaction(
    obligationParams,
    ObligationInitBalanceNeeded
  );

  await sendAndConfirmTransaction(
    connection,
    initTransaction,
    [payer, obligationKeypair],
    {
      commitment: 'singleGossip',
      preflightCommitment: 'singleGossip',
    }
  );

  return obligationKeypair.publicKey;
}
