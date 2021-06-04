import {
  PublicKey,
  TransactionInstruction,
  SYSVAR_CLOCK_PUBKEY,
} from '@solana/web3.js';
import BN from 'bn.js';
import * as BufferLayout from 'buffer-layout';
import * as Layout from '../utils/layouts';
import { depositReserveLiquidityParams } from '../models';
import { LENDING_PROGRAM_ID, TOKEN_PROGRAM_ID } from '../constants';
import { LendingInstructions } from './lendingInstructions';

// 4
/// Deposit liquidity into a reserve in exchange for collateral. Collateral represents a share
/// of the reserve liquidity pool.
///
/// Accounts expected by this instruction:
///
///   0. `[writable]` Source liquidity token account.
///                     $authority can transfer $liquidity_amount.
///   1. `[writable]` Destination collateral token account.
///   2. `[writable]` Reserve account.
///   3. `[writable]` Reserve liquidity supply SPL Token account.
///   4. `[writable]` Reserve collateral SPL Token mint.
///   5. `[]` Lending market account.
///   6. `[]` Derived lending market authority.
///   7. `[signer]` User transfer authority ($authority).
///   8. `[]` Clock sysvar.
///   9. `[]` Token program id.
export const depositReserveLiquidityInstruction = (
  params: depositReserveLiquidityParams
): TransactionInstruction => {
  const dataLayout = BufferLayout.struct([
    BufferLayout.u8('instruction'),
    Layout.uint64('liquidityAmount'),
  ]);

  const data = Buffer.alloc(dataLayout.span);
  dataLayout.encode(
    {
      instruction: LendingInstructions.DepositReserveLiquidity,
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
      pubkey: params.destinationCollateralPubkey,
      isSigner: false,
      isWritable: true,
    },
    { pubkey: params.reservePubkey, isSigner: false, isWritable: true },
    {
      pubkey: params.reserveLiquiditySupplyPubkey,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: params.reserveCollateralMintPubkey,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: params.lendingMarketPubkey,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: params.lendingMarketDerivedAuthorityPubkey,
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
