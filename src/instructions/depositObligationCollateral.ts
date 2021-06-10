import { TransactionInstruction, SYSVAR_CLOCK_PUBKEY } from '@solana/web3.js';
import BN from 'bn.js';
import * as BufferLayout from 'buffer-layout';
import * as Layout from '../utils/layouts';
import { depositObligatonCollateralParams } from '../models';
import { LENDING_PROGRAM_ID, TOKEN_PROGRAM_ID } from '../constants';
import { LendingInstructions } from './lendingInstructions';

// 8
/// Deposit collateral to an obligation. Requires a refreshed reserve.
///
/// Accounts expected by this instruction:
///
///   0. `[writable]` Source collateral token account.
///                     Minted by deposit reserve collateral mint.
///                     $authority can transfer $collateral_amount.
///   1. `[writable]` Destination deposit reserve collateral supply SPL Token account.
///   2. `[]` Deposit reserve account - refreshed.
///   3. `[writable]` Obligation account.
///   4. `[]` Lending market account.
///   5. `[]` Derived lending market authority.
///   6. `[signer]` Obligation owner.
///   7. `[signer]` User transfer authority ($authority).
///   8. `[]` Clock sysvar.
///   9. `[]` Token program id.
export const depositObligationCollateralInstruction = (
  params: depositObligatonCollateralParams
): TransactionInstruction => {
  const dataLayout = BufferLayout.struct([
    BufferLayout.u8('instruction'),
    Layout.uint64('collateralAmount'),
  ]);

  const data = Buffer.alloc(dataLayout.span);
  dataLayout.encode(
    {
      instruction: LendingInstructions.DepositObligationCollateral,
      collateralAmount: new BN(params.collateralAmount),
    },
    data
  );

  const keys = [
    {
      pubkey: params.sourceCollateralPubkey,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: params.destinationReserveCollateralPubkey,
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
