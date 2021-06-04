import {
  PublicKey,
  TransactionInstruction,
  SYSVAR_RENT_PUBKEY,
} from '@solana/web3.js';

import * as BufferLayout from 'buffer-layout';
import * as Layouts from '../utils/layouts';
import { LENDING_PROGRAM_ID, TOKEN_PROGRAM_ID } from '../constants';
import { LendingInstructions } from './lendingInstructions';

// 0
/// Initializes a new lending market.
///
/// Accounts expected by this instruction:
///
///   0. `[writable]` Lending market account - uninitialized.
///   1. `[]` Quote currency SPL Token mint.
///   2. `[]` Rent sysvar.
///   3. `[]` Token program id.
export const initLendingMarketInstruction = (
  lendingMarketPubkey: PublicKey,
  quoteCurrency: string = 'USD',
  owner: PublicKey
): TransactionInstruction => {
  const dataLayout = BufferLayout.struct([
    BufferLayout.u8('instruction'),
    Layouts.publicKey('owner'),
    BufferLayout.blob(32, 'quote_currency'),
  ]);

  const quote_currency =
    quoteCurrency === 'USD'
      ? Buffer.from(
          'USD\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0'
        )
      : Buffer.from(quoteCurrency);

  const data = Buffer.alloc(dataLayout.span);
  dataLayout.encode(
    {
      instruction: LendingInstructions.InitLendingMarket,
      owner,
      quote_currency: quote_currency,
    },
    data
  );

  const keys = [
    { pubkey: lendingMarketPubkey, isSigner: false, isWritable: true },
    // { pubkey: quoteTokenMintPubkey, isSigner: false, isWritable: false },
    { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
  ];

  return new TransactionInstruction({
    keys,
    programId: LENDING_PROGRAM_ID,
    data,
  });
};
