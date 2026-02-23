import { Controller, Post, Body } from '@nestjs/common';
import { BondService } from './bond.service';
import type { BondInput, BondOutput, CashFlowRow } from '../interfaces/bond.interfaces';

@Controller('bond')
export class BondController {
  constructor(private readonly bondService: BondService) {}

  @Post('calculate')
  calculate(@Body() input: BondInput): BondOutput {
    return this.bondService.calculate(input);
  }

  @Post('cash-flow-schedule')
  generateCashFlowSchedule(@Body() input: BondInput): CashFlowRow[] {
    return this.bondService.generateCashFlowSchedule(input);
  }
}
