import { TransactionInstruction, SYSVAR_CLOCK_PUBKEY } from '@solana/web3.js';
import BN from 'bn.js';
import * as BufferLayout from 'buffer-layout';
import * as Layout from '../utils/layouts';
import { repayObligationLiquidityParams } from '../models';
import { LENDING_PROGRAM_ID, TOKEN_PROGRAM_ID } from '../constants';
import { LendingInstructions } from './lendingInstructions';

// 11
/// Repay borrowed liquidity to a reserve. Requires a refreshed obligation and reserve.
///
/// Accounts expected by this instruction:
///
///   0. `[writable]` Source liquidity token account.
///                     Minted by repay reserve liquidity mint.
///                     $authority can transfer $liquidity_amount.
///   1. `[writable]` Destination repay reserve liquidity supply SPL Token account.
///   2. `[writable]` Repay reserve account - refreshed.
///   3. `[writable]` Obligation account - refreshed.
///   4. `[]` Lending market account.
///   5. `[signer]` User transfer authority ($authority).
///   6. `[]` Clock sysvar.
///   7. `[]` Token program id.
export const repayObligationLiquidityInstruction = (
  params: repayObligationLiquidityParams
): TransactionInstruction => {
  const dataLayout = BufferLayout.struct([
    BufferLayout.u8('instruction'),
    Layout.uint64('liquidityAmount'),
  ]);

  const data = Buffer.alloc(dataLayout.span);
  dataLayout.encode(
    {
      instruction: LendingInstructions.RepayObligationLiquidity,
      liquidityAmount: new BN(params.liquidityAmount),
    },
    data
  );

  const keys = [
    {
      pubkey: params.sourceLiquidityPubkey,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: params.reserveLiquiditySupplyPubkey,
      isSigner: false,
      isWritable: true,
    },
    { pubkey: params.reservePubkey, isSigner: false, isWritable: true },
    {
      pubkey: params.obligationPubkey,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: params.lendingMarketPubkey,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: params.userTransferAuthorityPubkey,
      isSigner: true,
      isWritable: false,
    },
    { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
  ];

  return new TransactionInstruction({
    keys,
    programId: LENDING_PROGRAM_ID,
    data,
  });
};
