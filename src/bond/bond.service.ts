import { Injectable } from '@nestjs/common';
import { calculateBond, generateCashFlowSchedule } from '../lib/bond-calculator';
import type { BondInput, BondOutput, CashFlowRow } from '../interfaces/bond.interfaces';

@Injectable()
export class BondService {
  calculate(input: BondInput): BondOutput {
    return calculateBond(input);
  }

  generateCashFlowSchedule(input: BondInput): CashFlowRow[] {
    return generateCashFlowSchedule(input);
  }
}
