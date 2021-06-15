import {
  Connection,
  PublicKey,
  Keypair,
  sendAndConfirmTransaction,
} from '@solana/web3.js';

import {
  repayObligationLiquidityParams,
  ReserveParser,
  ObligationParser,
} from '../models';
import { repayObligationLiquidityTransaction } from '../transactions';

export async function repayObligationLiquidityCommand(
  connection: Connection,
  liquidityAmount: number,
  sourceLiquidityPubkey: PublicKey,
  reservePubkey: PublicKey,
  obligationPubkey: PublicKey,
  userTransferAuthorityKeypair: Keypair,
  payer: Keypair
): Promise<void> {
  const reserveAccountInfo = await connection.getAccountInfo(reservePubkey);

  const obligationAccountInfo = await connection.getAccountInfo(
    obligationPubkey
  );

  if (reserveAccountInfo === null) {
    throw 'Error: cannot find the reserve account';
  }

  if (obligationAccountInfo === null) {
    throw 'Error: cannot find the obligation account';
  }

  const reserveParsed = ReserveParser(reservePubkey, reserveAccountInfo);

  const reserveLiquiditySupplyPubkey =
    reserveParsed.info.liquidity.supplyPubkey;
  const reserveCollateralMintPubkey = reserveParsed.info.collateral.mintPubkey;
  const lendingMarketPubkey = reserveParsed.info.lendingMarket;
  const pythPricePubkey = reserveParsed.info.liquidity.oraclePubkey;

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

  const userTransferAuthorityPubkey = userTransferAuthorityKeypair.publicKey;

  const newRepayObligationLiquidityParams: repayObligationLiquidityParams = {
    liquidityAmount,
    sourceLiquidityPubkey,
    reserveLiquiditySupplyPubkey,
    reservePubkey,
    obligationPubkey,
    lendingMarketPubkey,
    userTransferAuthorityPubkey,
  };

  //initReserve transaction
  const newRepayObligationTransaction = repayObligationLiquidityTransaction(
    newRepayObligationLiquidityParams,
    obligationReservesAndOraclesPubkeys,
    payer.publicKey
  );

  try {
    await sendAndConfirmTransaction(
      connection,
      newRepayObligationTransaction,
      [payer, userTransferAuthorityKeypair],
      {
        commitment: 'singleGossip',
        preflightCommitment: 'singleGossip',
      }
    );
    console.log('Successfull repay obligation liquidity');
  } catch (e) {
    console.log(`RepayObligationLiquidity Error: ${e}`);
  }
}
