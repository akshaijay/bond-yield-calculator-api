export type CouponFrequency = "annual" | "semi-annual";

export interface BondInput {
  faceValue: number;
  annualCouponRate: number; // percentage, e.g. 5 for 5%
  marketPrice: number;
  yearsToMaturity: number;
  couponFrequency: CouponFrequency;
}

export interface BondOutput {
  currentYield: number; // percentage
  ytm: number; // percentage (annualised)
  totalInterest: number; // absolute $
  premiumDiscount: "premium" | "discount" | "par";
  premiumDiscountAmount: number; // absolute difference
}

export interface CashFlowRow {
  period: number;
  date: string; // formatted date string
  couponPayment: number;
  cumulativeInterest: number;
  remainingPrincipal: number;
}
