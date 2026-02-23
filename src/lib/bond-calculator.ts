/**
 * Bond Yield Calculator — pure calculation module.
 * No framework dependencies. Can be used in React or NestJS.
 */

import type { CouponFrequency, BondInput, BondOutput, CashFlowRow } from '../interfaces/bond.interfaces';

export type { CouponFrequency, BondInput, BondOutput, CashFlowRow };

// ─── Calculations ───────────────────────────────────────────

export function periodsPerYear(freq: CouponFrequency): number {
  return freq === "semi-annual" ? 2 : 1;
}

export function calculateCurrentYield(input: BondInput): number {
  const annualCoupon = (input.annualCouponRate / 100) * input.faceValue;
  return (annualCoupon / input.marketPrice) * 100;
}

/**
 * Yield to Maturity via Newton-Raphson.
 * Solves for r in: Price = Σ C/(1+r)^t + F/(1+r)^N
 */
export function calculateYTM(input: BondInput, maxIterations = 200, tolerance = 1e-10): number {
  const n = periodsPerYear(input.couponFrequency);
  const totalPeriods = input.yearsToMaturity * n;
  const coupon = (input.annualCouponRate / 100) * input.faceValue / n;
  const price = input.marketPrice;
  const face = input.faceValue;

  // Initial guess
  let r = ((coupon * n) + (face - price) / input.yearsToMaturity) / ((face + price) / 2) / n;

  for (let i = 0; i < maxIterations; i++) {
    let pv = 0;
    let dpv = 0; // derivative

    for (let t = 1; t <= totalPeriods; t++) {
      const df = Math.pow(1 + r, t);
      pv += coupon / df;
      dpv -= t * coupon / Math.pow(1 + r, t + 1);
    }
    pv += face / Math.pow(1 + r, totalPeriods);
    dpv -= totalPeriods * face / Math.pow(1 + r, totalPeriods + 1);

    const diff = pv - price;
    if (Math.abs(diff) < tolerance) break;

    r -= diff / dpv;

    // Guard against divergence
    if (r <= -1) r = 0.001;
  }

  // Annualise: periodic rate × periods per year
  return r * n * 100;
}

export function calculateTotalInterest(input: BondInput): number {
  const annualCoupon = (input.annualCouponRate / 100) * input.faceValue;
  return annualCoupon * input.yearsToMaturity;
}

export function determinePremiumDiscount(input: BondInput): {
  status: "premium" | "discount" | "par";
  amount: number;
} {
  const diff = input.marketPrice - input.faceValue;
  if (Math.abs(diff) < 0.01) return { status: "par", amount: 0 };
  return {
    status: diff > 0 ? "premium" : "discount",
    amount: Math.abs(diff),
  };
}

export function calculateBond(input: BondInput): BondOutput {
  const { status, amount } = determinePremiumDiscount(input);
  return {
    currentYield: calculateCurrentYield(input),
    ytm: calculateYTM(input),
    totalInterest: calculateTotalInterest(input),
    premiumDiscount: status,
    premiumDiscountAmount: amount,
  };
}

// ─── Cash Flow Schedule ─────────────────────────────────────

export function generateCashFlowSchedule(input: BondInput): CashFlowRow[] {
  const n = periodsPerYear(input.couponFrequency);
  const totalPeriods = input.yearsToMaturity * n;
  const coupon = (input.annualCouponRate / 100) * input.faceValue / n;
  const today = new Date();

  const rows: CashFlowRow[] = [];
  let cumulative = 0;

  for (let t = 1; t <= totalPeriods; t++) {
    cumulative += coupon;
    const monthsToAdd = (12 / n) * t;
    const paymentDate = new Date(today);
    paymentDate.setMonth(paymentDate.getMonth() + monthsToAdd);

    rows.push({
      period: t,
      date: paymentDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      couponPayment: coupon,
      cumulativeInterest: cumulative,
      remainingPrincipal: input.faceValue, // principal returned at maturity
    });
  }

  // Last period includes principal return
  if (rows.length > 0) {
    rows[rows.length - 1].remainingPrincipal = 0;
  }

  return rows;
}
