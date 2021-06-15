import {
  PublicKey,
  TransactionInstruction,
  SYSVAR_CLOCK_PUBKEY,
} from '@solana/web3.js';
import BN from 'bn.js';
import * as BufferLayout from 'buffer-layout';
import * as Layout from '../utils/layouts';
import { borrowObligationLiquidityParams } from '../models';
import { LENDING_PROGRAM_ID, TOKEN_PROGRAM_ID } from '../constants';
import { LendingInstructions } from './lendingInstructions';

// 10
/// Borrow liquidity from a reserve by depositing collateral tokens. Requires a refreshed
/// obligation and reserve.
///
/// Accounts expected by this instruction:
///
///   0. `[writable]` Source borrow reserve liquidity supply SPL Token account.
///   1. `[writable]` Destination liquidity token account.
///                     Minted by borrow reserve liquidity mint.
///   2. `[writable]` Borrow reserve account - refreshed.
///   3. `[writable]` Borrow reserve liquidity fee receiver account.
///                     Must be the fee account specified at InitReserve.
///   4. `[writable]` Obligation account - refreshed.
///   5. `[]` Lending market account.
///   6. `[]` Derived lending market authority.
///   7. `[signer]` Obligation owner.
///   8. `[]` Clock sysvar.
///   9. `[]` Token program id.
///   10 `[optional, writable]` Host fee receiver account.
export const borrowObligationLiquidityInstruction = (
  params: borrowObligationLiquidityParams
): TransactionInstruction => {
  const dataLayout = BufferLayout.struct([
    BufferLayout.u8('instruction'),
    Layout.uint64('liquidityAmount'),
  ]);

  const data = Buffer.alloc(dataLayout.span);
  dataLayout.encode(
    {
      instruction: LendingInstructions.BorrowObligationLiquidity,
      liquidityAmount: new BN(params.liquidityAmount),
    },
    data
  );

  const keys = [
    {
      pubkey: params.borrowReserveLiquiditySupplyPubkey,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: params.destinationLiquidityPubkey,
      isSigner: false,
      isWritable: true,
    },
    { pubkey: params.borrowReservePubkey, isSigner: false, isWritable: true },
    {
      pubkey: params.borrowReserveLiquidityFeeReceiverPubkey,
      isSigner: false,
      isWritable: true,
    },
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
      pubkey: params.lendingMarketDerivedAuthorityPubkey,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: params.obligationOwnerPubkey,
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
