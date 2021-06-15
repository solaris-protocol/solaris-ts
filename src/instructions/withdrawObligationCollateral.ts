import {
  PublicKey,
  TransactionInstruction,
  SYSVAR_CLOCK_PUBKEY,
} from '@solana/web3.js';
import BN from 'bn.js';
import * as BufferLayout from 'buffer-layout';
import * as Layout from '../utils/layouts';
import { withdrawObligationCollateralParams } from '../models';
import { LENDING_PROGRAM_ID, TOKEN_PROGRAM_ID } from '../constants';
import { LendingInstructions } from './lendingInstructions';

// 9
/// Withdraw collateral from an obligation. Requires a refreshed obligation and reserve.
///
/// Accounts expected by this instruction:
///
///   0. `[writable]` Source withdraw reserve collateral supply SPL Token account.
///   1. `[writable]` Destination collateral token account.
///                     Minted by withdraw reserve collateral mint.
///   2. `[]` Withdraw reserve account - refreshed.
///   3. `[writable]` Obligation account - refreshed.
///   4. `[]` Lending market account.
///   5. `[]` Derived lending market authority.
///   6. `[signer]` Obligation owner.
///   7. `[]` Clock sysvar.
///   8. `[]` Token program id.
export const withdrawObligationCollateralInstruction = (
  params: withdrawObligationCollateralParams
): TransactionInstruction => {
  const dataLayout = BufferLayout.struct([
    BufferLayout.u8('instruction'),
    Layout.uint64('collateralAmount'),
  ]);

  const data = Buffer.alloc(dataLayout.span);
  dataLayout.encode(
    {
      instruction: LendingInstructions.WithdrawObligationCollateral,
      collateralAmount: new BN(params.collateralAmount),
    },
    data
  );

  const keys = [
    {
      pubkey: params.sourceReserveCollateralPubkey,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: params.destinationCollateralPubkey,
      isSigner: false,
      isWritable: true,
    },
    { pubkey: params.reservePubkey, isSigner: false, isWritable: false },
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
