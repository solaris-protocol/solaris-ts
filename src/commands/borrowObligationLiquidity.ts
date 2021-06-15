import {
  Connection,
  PublicKey,
  Keypair,
  sendAndConfirmTransaction,
} from '@solana/web3.js';

import { LENDING_PROGRAM_ID } from '../constants';
import {
  borrowObligationLiquidityParams,
  ReserveParser,
  ObligationParser,
} from '../models';
import { borrowObligationLiquidityTransaction } from '../transactions';

export async function borrowObligationLiquidityCommand(
  connection: Connection,
  liquidityAmount: number,
  destinationLiquidityPubkey: PublicKey,
  borrowReservePubkey: PublicKey,
  obligationPubkey: PublicKey,
  payer: Keypair
): Promise<void> {
  const borrowReserveAccountInfo = await connection.getAccountInfo(
    borrowReservePubkey
  );

  const obligationAccountInfo = await connection.getAccountInfo(
    obligationPubkey
  );

  if (borrowReserveAccountInfo === null) {
    throw 'Error: cannot find the reserve account';
  }

  if (obligationAccountInfo === null) {
    throw 'Error: cannot find the obligation account';
  }

  const borrowReserveParsed = ReserveParser(
    borrowReservePubkey,
    borrowReserveAccountInfo
  );

  const borrowReserveLiquiditySupplyPubkey =
    borrowReserveParsed.info.liquidity.supplyPubkey;

  const borrowReserveLiquidityFeeReceiverPubkey =
    borrowReserveParsed.info.liquidity.feeReceiver;

  const lendingMarketPubkey = borrowReserveParsed.info.lendingMarket;

  const obligationParsed = ObligationParser(
    obligationPubkey,
    obligationAccountInfo
  );

  const obligationReservesPubkeys = [
    ...obligationParsed.info.deposits.map(deposit => deposit.depositReserve),
    ...obligationParsed.info.borrows.map(borrow => borrow.borrowReserve),
  ];

  const obligationReservesAndOraclesPubkeys = await Promise.all(
    obligationReservesPubkeys.map(async reservePubkey => {
      const reserveAccountInfo = await connection.getAccountInfo(reservePubkey);

      if (reserveAccountInfo === null) {
        throw 'Error: cannot find the reserve account';
      }

      const reserveParsed = ReserveParser(reservePubkey, reserveAccountInfo);

      return {
        reservePubkey: reservePubkey,
        oraclePubkey: reserveParsed.info.liquidity.oraclePubkey,
      };
    })
  );

  const [
    lendingMarketDerivedAuthorityPubkey,
    _bumpSeed,
  ] = await PublicKey.findProgramAddress(
    [lendingMarketPubkey.toBytes()],
    LENDING_PROGRAM_ID
  );

  const newBorrowObligationLiquidityParams: borrowObligationLiquidityParams = {
    liquidityAmount,
    borrowReserveLiquiditySupplyPubkey,
    destinationLiquidityPubkey,
    borrowReservePubkey,
    borrowReserveLiquidityFeeReceiverPubkey,
    obligationPubkey,
    lendingMarketPubkey,
    lendingMarketDerivedAuthorityPubkey,
    obligationOwnerPubkey: payer.publicKey,
  };

  //initReserve transaction
  const newBorrowObligationLiquidityTransaction = borrowObligationLiquidityTransaction(
    newBorrowObligationLiquidityParams,
    obligationReservesAndOraclesPubkeys
  );

  try {
    await sendAndConfirmTransaction(
      connection,
      newBorrowObligationLiquidityTransaction,
      [payer],
      {
        commitment: 'singleGossip',
        preflightCommitment: 'singleGossip',
      }
    );
    console.log('Successfull borrow obligation liquidity');
  } catch (e) {
    console.log(`Borrow Obligation Liquidity Error: ${e}`);
  }
}
