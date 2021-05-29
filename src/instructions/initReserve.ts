import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import BN from 'bn.js';
import * as BufferLayout from 'buffer-layout';
import * as Layout from '../utils/layouts';
import { initReserveParams } from '../models/reserve';
import { LENDING_PROGRAM_ID, TOKEN_PROGRAM_ID } from '../constants';
import { LendingInstructions } from './lendingInstructions';

// 2
/// Initializes a new lending market reserve.
///
/// Accounts expected by this instruction:
///
///   0. `[writable]` Source liquidity token account.
///                     $authority can transfer $liquidity_amount.
///   1. `[writable]` Destination collateral token account - uninitialized.
///   2. `[writable]` Reserve account - uninitialized.
///   3. `[]` Reserve liquidity SPL Token mint.
///   4. `[writable]` Reserve liquidity supply SPL Token account - uninitialized.
///   5. `[writable]` Reserve liquidity fee receiver - uninitialized.
///   6. `[]` Pyth product account.
///   7. `[]` Pyth price account.
///             This will be used as the reserve liquidity oracle account.
///   8. `[writable]` Reserve collateral SPL Token mint - uninitialized.
///   9. `[writable]` Reserve collateral token supply - uninitialized.
///   10 `[]` Lending market account.
///   11 `[]` Derived lending market authority.
///   12 `[signer]` Lending market owner.
///   13 `[signer]` User transfer authority ($authority).
///   14 `[]` Clock sysvar.
///   15 `[]` Rent sysvar.
///   16 `[]` Token program id.
export const initReserveInstruction = (
  params: initReserveParams
): TransactionInstruction => {
  const dataLayout = BufferLayout.struct([
    BufferLayout.u8('instruction'),
    Layout.uint64('liquidityAmount'),
    BufferLayout.struct(
      [
        BufferLayout.u8('optimalUtilizationRate'),
        BufferLayout.u8('loanToValueRatio'),
        BufferLayout.u8('liquidationBonus'),
        BufferLayout.u8('liquidationThreshold'),
        BufferLayout.u8('minBorrowRate'),
        BufferLayout.u8('optimalBorrowRate'),
        BufferLayout.u8('maxBorrowRate'),

        BufferLayout.struct(
          [
            Layout.uint64('borrowFeeWad'),
            Layout.uint64('flashLoanFeeWad'),
            BufferLayout.u8('hostFeePercentage'),
          ],
          'fees'
        ),
      ],
      'config'
    ),
  ]);

  const data = Buffer.alloc(dataLayout.span);
  dataLayout.encode(
    {
      instruction: LendingInstructions.InitReserve,
      liquidityAmount: new BN(params.liquidityAmount),
      config: params.reserveConfig,
    },
    data
  );

  const keys = [
    { pubkey: from, isSigner: false, isWritable: true },
    { pubkey: to, isSigner: false, isWritable: true },
    { pubkey: reserveAccount, isSigner: false, isWritable: true },
    { pubkey: liquidityMint, isSigner: false, isWritable: false },
    { pubkey: liquiditySupply, isSigner: false, isWritable: true },
    { pubkey: collateralMint, isSigner: false, isWritable: true },
    { pubkey: collateralSupply, isSigner: false, isWritable: true },
    // NOTE: Why lending market needs to be a signer?
    { pubkey: lendingMarket, isSigner: true, isWritable: true },
    { pubkey: lendingMarketAuthority, isSigner: false, isWritable: false },
    { pubkey: transferAuthority, isSigner: true, isWritable: false },
    { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
    { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
  ];

  return new TransactionInstruction({
    keys,
    programId: LENDING_PROGRAM_ID,
    data,
  });
};
