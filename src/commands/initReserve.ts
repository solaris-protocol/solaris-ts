import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
	sendAndConfirmTransaction,
  SystemProgram,
} from '@solana/web3.js';
import { AccountLayout, Token, MintLayout } from '@solana/spl-token';

import { TOKEN_PROGRAM_ID, LENDING_PROGRAM_ID } from '../constants';
import {
  ReserveConfig,
  LendingMarketParser,
  ReserveLayout,
  InitReserveParams,
} from '../models';
import { initReserveTransaction } from '../transactions';

export async function initReserveCommand(
  connection: Connection,
  liquidityAmount: number,
  reserveConfig: ReserveConfig,
  sourceLiquidityPubkey: PublicKey,
  lendingMarketPubkey: PublicKey,
  pythProductPubkey: PublicKey,
  pythPricePubkey: PublicKey,
  payer: Keypair
): Promise<PublicKey> {
  const sourceLiquidityAccountInfo = await connection.getAccountInfo(
    sourceLiquidityPubkey
  );

  const lendingMarketAccountInfo = await connection.getAccountInfo(
    lendingMarketPubkey
  );

  if (sourceLiquidityAccountInfo === null) {
    throw 'Error: cannot find the source liquidity account';
  }

  if (lendingMarketAccountInfo === null) {
    throw 'Error: cannot find the lending market account';
  }

  const sourceLiquidityAccountData = AccountLayout.decode(
    Buffer.from(sourceLiquidityAccountInfo.data)
  );

  const reserveLiquidityMintPubkey = new PublicKey(
    sourceLiquidityAccountData.mint
  );

  const lendingMarketParsed = LendingMarketParser(
    lendingMarketPubkey,
    lendingMarketAccountInfo
  );

  const reserveKeypair = Keypair.generate();

  //create reserve liquidity token account
  const reserveLiquiditySupplyKeypair = Keypair.generate();
  //create reserve collateral token mint
  const reserveCollateralMintKeypair = Keypair.generate();
  //create reserve collaterall supply account
  const reserveCollateralSupplyKeypair = Keypair.generate();
  //create reserve liquidity fee receiver account
  const reserveLiquidityFeeReceiverKeypair = Keypair.generate();
  //create user collateral account
  const destinationCollateralKeypair = Keypair.generate();
  //create user transfer authority account
  const userTransferAuthorityKeypair = Keypair.generate();

	const [lendingMarketDerivedAuthorityPubkey, _bumpSeed] = await PublicKey.findProgramAddress(
    [lendingMarketPubkey.toBytes()],
    LENDING_PROGRAM_ID
	);
	
  const newReserveParams: InitReserveParams = {
    liquidityAmount,
    reserveConfig,
    sourceLiquidityPubkey: sourceLiquidityPubkey,
    destinationCollateralPubkey: destinationCollateralKeypair.publicKey,
    reservePubkey: reserveKeypair.publicKey,
    reserveLiquidityMintPubkey: reserveLiquidityMintPubkey,
    reserveLiquiditySupplyPubkey: reserveLiquiditySupplyKeypair.publicKey,
    reserveLiquidityFeeReceiverPubkey:
      reserveLiquidityFeeReceiverKeypair.publicKey,
    reserveCollateralMintPubkey: reserveCollateralMintKeypair.publicKey,
    reserveCollateralSupplyPubkey: reserveCollateralSupplyKeypair.publicKey,
    pythProductPubkey: pythProductPubkey,
    pythPricePubkey: pythPricePubkey,
    lendingMarketPubkey,
    lendingMarketDerivedAuthorityPubkey,
    lendingMarketOwnerPubkey: lendingMarketParsed.info.owner,
    userTransferAuthorityPubkey: userTransferAuthorityKeypair.publicKey,
  };

  //calculate reserve init balance needed
  //it should include fees for creating all accounts

  const reserveInitBalanceNeeded = await connection.getMinimumBalanceForRentExemption(
    ReserveLayout.span
  );

  const tokenAccountInitBalanceNeeded = await Token.getMinBalanceRentForExemptAccount(
    connection
  );

  const mintAccountInitBalanceNeeded = await Token.getMinBalanceRentForExemptMint(
    connection
  );

  //transactions for creating all accounts
  const init_reserve_accounts_transaction_1 = new Transaction();

  init_reserve_accounts_transaction_1
    .add(
      SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: reserveKeypair.publicKey,
        lamports: reserveInitBalanceNeeded,
        space: ReserveLayout.span,
        programId: LENDING_PROGRAM_ID,
      })
    )
    .add(
      SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: reserveCollateralMintKeypair.publicKey,
        lamports: mintAccountInitBalanceNeeded,
        space: MintLayout.span,
        programId: TOKEN_PROGRAM_ID,
      })
    )
    .add(
      SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: reserveCollateralSupplyKeypair.publicKey,
        lamports: tokenAccountInitBalanceNeeded,
        space: AccountLayout.span,
        programId: TOKEN_PROGRAM_ID,
      })
    )
    .add(
      SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: destinationCollateralKeypair.publicKey,
        lamports: tokenAccountInitBalanceNeeded,
        space: AccountLayout.span,
        programId: TOKEN_PROGRAM_ID,
      })
    );

  const init_reserve_accounts_transaction_2 = new Transaction();

  init_reserve_accounts_transaction_2
    .add(
      SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: reserveLiquiditySupplyKeypair.publicKey,
        lamports: tokenAccountInitBalanceNeeded,
        space: AccountLayout.span,
        programId: TOKEN_PROGRAM_ID,
      })
    )
    .add(
      SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: reserveLiquidityFeeReceiverKeypair.publicKey,
        lamports: tokenAccountInitBalanceNeeded,
        space: AccountLayout.span,
        programId: TOKEN_PROGRAM_ID,
      })
    );

  //initReserve transaction
  const newReserveTransaction = initReserveTransaction(
    newReserveParams,
    payer.publicKey
  );

  try {
    await sendAndConfirmTransaction(
      connection,
      init_reserve_accounts_transaction_1,
      [
        payer,
        reserveKeypair,
        reserveCollateralMintKeypair,
        reserveCollateralSupplyKeypair,
        destinationCollateralKeypair,
      ],
      {
        commitment: 'singleGossip',
        preflightCommitment: 'singleGossip',
      }
    );

    await sendAndConfirmTransaction(
      connection,
      init_reserve_accounts_transaction_2,
      [
        payer,
        reserveLiquiditySupplyKeypair,
        reserveLiquidityFeeReceiverKeypair,
      ],
      {
        commitment: 'singleGossip',
        preflightCommitment: 'singleGossip',
      }
    );

    await sendAndConfirmTransaction(
      connection,
      newReserveTransaction,
      [payer, userTransferAuthorityKeypair],
      {
        commitment: 'singleGossip',
        preflightCommitment: 'singleGossip',
      }
    );
  } catch (e) {
    console.log(`InitReserve Error: ${e}`);
  }

  return reserveKeypair.publicKey;
}
