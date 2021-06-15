import { AccountInfo, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import * as BufferLayout from 'buffer-layout';
import * as Layout from '../utils/layouts';
import { LastUpdate } from './lastUpdate';

type Decimal = BN;

export interface ObligationCollateral {
  // Reserve collateral is deposited to
  depositReserve: PublicKey;
  // Amount of collateral deposited
  depositedAmount: BN;
  // Collateral market value in quote currency
  marketValue: Decimal;
}

export interface ObligationLiquidity {
  //Reserve liquidity is borrowed from
  borrowReserve: PublicKey;
  //Borrow rate used for calculating interest
  cumulativeBorrowRateWads: Decimal;
  //Amount of liquidity borrowed plus interest
  borrowedAmountWads: Decimal;
  //Liquidity market value in quote currency
  marketValue: Decimal;
}

export interface Obligation {
  /// Version of the struct
  version: number;
  /// Last slot when supply and rates updated
  lastUpdate: LastUpdate;
  /// Lending market address
  lendingMarket: PublicKey;
  /// Owner authority which can borrow liquidity
  owner: PublicKey;
  /// Deposited collateral for the obligation, unique by deposit reserve address
  deposits: Array<ObligationCollateral>;
  /// Borrowed liquidity for the obligation, unique by borrow reserve address
  borrows: Array<ObligationLiquidity>;
  /// Market value of deposits
  depositedValue: Decimal;
  /// Market value of borrows
  borrowedValue: Decimal;
  /// The maximum borrow value at the weighted average loan to value ratio
  allowedBorrowValue: Decimal;
  /// The dangerous borrow value at the weighted average liquidation threshold
  unhealthyBorrowValue: Decimal;
}

export interface ObligationHead {
  /// Version of the struct
  version: number;
  /// Last slot when supply and rates updated
  lastUpdate: LastUpdate;
  /// Lending market address
  lendingMarket: PublicKey;
  /// Owner authority which can borrow liquidity
  owner: PublicKey;
  /// Market value of deposits
  depositedValue: Decimal;
  /// Market value of borrows
  borrowedValue: Decimal;
  /// The maximum borrow value at the weighted average loan to value ratio
  allowedBorrowValue: Decimal;
  /// The dangerous borrow value at the weighted average liquidation threshold
  unhealthyBorrowValue: Decimal;
  //number of deposit Reserves
  depositsLen: number;
  //number of borrow Reserves
  borrowsLen: number;
}

export interface InitObligationParams {
  obligationPubkey: PublicKey;
  lendingMarketPubkey: PublicKey;
  obligationOwnerPubkey: PublicKey;
}

export interface depositObligatonCollateralParams {
  collateralAmount: number;
  sourceCollateralPubkey: PublicKey;
  destinationReserveCollateralPubkey: PublicKey;
  reservePubkey: PublicKey;
  obligationPubkey: PublicKey;
  lendingMarketPubkey: PublicKey;
  lendingMarketDerivedAuthorityPubkey: PublicKey;
  obligationOwnerPubkey: PublicKey;
  userTransferAuthorityPubkey: PublicKey;
  pythPricePubkey: PublicKey;
}

export interface withdrawObligationCollateralParams {
  collateralAmount: number;
  sourceReserveCollateralPubkey: PublicKey;
  destinationCollateralPubkey: PublicKey;
  reservePubkey: PublicKey;
  obligationPubkey: PublicKey;
  lendingMarketPubkey: PublicKey;
  lendingMarketDerivedAuthorityPubkey: PublicKey;
  obligationOwnerPubkey: PublicKey;
}

export interface borrowObligationLiquidityParams {
	liquidityAmount: number;
	borrowReserveLiquiditySupplyPubkey: PublicKey;
  destinationLiquidityPubkey: PublicKey;
  borrowReservePubkey: PublicKey;
  borrowReserveLiquidityFeeReceiverPubkey: PublicKey;
  obligationPubkey: PublicKey;
  lendingMarketPubkey: PublicKey;
  lendingMarketDerivedAuthorityPubkey: PublicKey;
  obligationOwnerPubkey: PublicKey;
}

export interface repayObligationLiquidityParams {
  liquidityAmount: number;
  sourceLiquidityPubkey: PublicKey;
  reserveLiquiditySupplyPubkey: PublicKey;
  reservePubkey: PublicKey;
  obligationPubkey: PublicKey;
  lendingMarketPubkey: PublicKey;
  userTransferAuthorityPubkey: PublicKey;
}

export const MAX_OBLIGATION_RESERVES = 10;
export const OBLIGATION_COLLATERAL_LEN = 56; // 32 + 8 + 16
export const OBLIGATION_LIQUIDITY_LEN = 80; // 32 + 16 + 16 + 16
export const OBLIGATION_LEN = 916;

export const ObligationLayout: typeof BufferLayout.Structure = BufferLayout.struct(
  [
    BufferLayout.u8('version'),
    BufferLayout.struct(
      [Layout.uint64('slot'), BufferLayout.u8('stale')],
      'last_update'
    ),
    Layout.publicKey('lendingMarket'),
    Layout.publicKey('owner'),
    Layout.uint128('depositedValue'),
    Layout.uint128('borrowedValue'),
    Layout.uint128('allowedBorrowValue'),
    Layout.uint128('unhealthyBorrowValue'),
    BufferLayout.u8('depositsLen'),
    BufferLayout.u8('borrowsLen'),
    //deposits + borrows arrays encoded
    BufferLayout.blob(
      OBLIGATION_COLLATERAL_LEN +
        OBLIGATION_LIQUIDITY_LEN * (MAX_OBLIGATION_RESERVES - 1),
      'padding'
    ),
  ]
);

export const ObligationHeadLayout: typeof BufferLayout.Structure = BufferLayout.struct(
  [
    BufferLayout.u8('version'),
    BufferLayout.struct(
      [Layout.uint64('slot'), BufferLayout.u8('stale')],
      'last_update'
    ),
    Layout.publicKey('lendingMarket'),
    Layout.publicKey('owner'),
    Layout.uint128('depositedValue'),
    Layout.uint128('borrowedValue'),
    Layout.uint128('allowedBorrowValue'),
    Layout.uint128('unhealthyBorrowValue'),
    BufferLayout.u8('depositsLen'),
    BufferLayout.u8('borrowsLen'),
  ]
);

export const getObligationDepositsBorrowsLayout = (
  depositsNum: number,
  borrowsNum: number
): typeof BufferLayout.Structure => {
  return BufferLayout.struct([
    BufferLayout.seq(
      BufferLayout.struct([
        Layout.publicKey('depositReserve'),
        Layout.uint64('depositedAmount'),
        Layout.uint128('marketValue'),
      ]),
      depositsNum,
      'deposits'
    ),
    BufferLayout.seq(
      BufferLayout.struct([
        Layout.publicKey('borrowReserve'),
        Layout.uint128('cumulativeBorrowRateWads'),
        Layout.uint128('borrowedAmountWads'),
        Layout.uint128('marketValue'),
      ]),
      borrowsNum,
      'borrows'
    ),
  ]);
};

export const isObligation = (info: AccountInfo<Buffer>) => {
  return info.data.length === ObligationLayout.span;
};

export const ObligationParser = (
  pubKey: PublicKey,
  info: AccountInfo<Buffer>
) => {
  const buffer = Buffer.from(info.data);

  const obligationHeadLength =
    OBLIGATION_LEN -
    (OBLIGATION_COLLATERAL_LEN +
      OBLIGATION_LIQUIDITY_LEN * (MAX_OBLIGATION_RESERVES - 1));
  const obligationHeadBuffer = buffer.slice(0, obligationHeadLength);
  const obligationDepositsBorrowsInfoBuffer = buffer.slice(
    obligationHeadLength
  );

  const obligationHeadData = ObligationHeadLayout.decode(
    obligationHeadBuffer
  ) as ObligationHead;

  const obligationArraysLayout = getObligationDepositsBorrowsLayout(
    obligationHeadData.depositsLen,
    obligationHeadData.borrowsLen
  );

  const obligationDepositsBorrowsData = obligationArraysLayout.decode(
    obligationDepositsBorrowsInfoBuffer
  );

  const data = {
    ...obligationHeadData,
    ...obligationDepositsBorrowsData,
  } as Obligation;

  const details = {
    pubkey: pubKey,
    account: {
      ...info,
    },
    info: data,
  };

  return details;
};
