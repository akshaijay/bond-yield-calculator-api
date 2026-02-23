import { Test, TestingModule } from '@nestjs/testing';
import { BondController } from './bond.controller';
import { BondService } from './bond.service';
import type { BondInput, BondOutput, CashFlowRow } from '../interfaces/bond.interfaces';

describe('BondController', () => {
  let controller: BondController;
  let service: BondService;

  const mockBondService = {
    calculate: jest.fn(),
    generateCashFlowSchedule: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BondController],
      providers: [
        {
          provide: BondService,
          useValue: mockBondService,
        },
      ],
    }).compile();

    controller = module.get<BondController>(BondController);
    service = module.get<BondService>(BondService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('calculate', () => {
    it('should return bond calculation result', () => {
      const input: BondInput = {
        faceValue: 1000,
        annualCouponRate: 5,
        marketPrice: 950,
        yearsToMaturity: 10,
        couponFrequency: 'semi-annual',
      };

      const expectedOutput: BondOutput = {
        currentYield: 5.263157894736842,
        ytm: 5.58,
        totalInterest: 500,
        premiumDiscount: 'discount',
        premiumDiscountAmount: 50,
      };

      mockBondService.calculate.mockReturnValue(expectedOutput);

      const result = controller.calculate(input);

      expect(service.calculate).toHaveBeenCalledWith(input);
      expect(result).toEqual(expectedOutput);
    });

    it('should handle premium bond', () => {
      const input: BondInput = {
        faceValue: 1000,
        annualCouponRate: 5,
        marketPrice: 1050,
        yearsToMaturity: 10,
        couponFrequency: 'annual',
      };

      const expectedOutput: BondOutput = {
        currentYield: 4.761904761904762,
        ytm: 4.5,
        totalInterest: 500,
        premiumDiscount: 'premium',
        premiumDiscountAmount: 50,
      };

      mockBondService.calculate.mockReturnValue(expectedOutput);

      const result = controller.calculate(input);

      expect(service.calculate).toHaveBeenCalledWith(input);
      expect(result.premiumDiscount).toBe('premium');
    });

    it('should handle par bond', () => {
      const input: BondInput = {
        faceValue: 1000,
        annualCouponRate: 5,
        marketPrice: 1000,
        yearsToMaturity: 10,
        couponFrequency: 'annual',
      };

      const expectedOutput: BondOutput = {
        currentYield: 5.0,
        ytm: 5.0,
        totalInterest: 500,
        premiumDiscount: 'par',
        premiumDiscountAmount: 0,
      };

      mockBondService.calculate.mockReturnValue(expectedOutput);

      const result = controller.calculate(input);

      expect(service.calculate).toHaveBeenCalledWith(input);
      expect(result.premiumDiscount).toBe('par');
      expect(result.premiumDiscountAmount).toBe(0);
    });
  });

  describe('generateCashFlowSchedule', () => {
    it('should return cash flow schedule for annual coupon', () => {
      const input: BondInput = {
        faceValue: 1000,
        annualCouponRate: 5,
        marketPrice: 950,
        yearsToMaturity: 2,
        couponFrequency: 'annual',
      };

      const expectedSchedule: CashFlowRow[] = [
        {
          period: 1,
          date: 'Jan 1, 2026',
          couponPayment: 50,
          cumulativeInterest: 50,
          remainingPrincipal: 1000,
        },
        {
          period: 2,
          date: 'Jan 1, 2027',
          couponPayment: 50,
          cumulativeInterest: 100,
          remainingPrincipal: 0,
        },
      ];

      mockBondService.generateCashFlowSchedule.mockReturnValue(expectedSchedule);

      const result = controller.generateCashFlowSchedule(input);

      expect(service.generateCashFlowSchedule).toHaveBeenCalledWith(input);
      expect(result).toEqual(expectedSchedule);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return cash flow schedule for semi-annual coupon', () => {
      const input: BondInput = {
        faceValue: 1000,
        annualCouponRate: 5,
        marketPrice: 950,
        yearsToMaturity: 1,
        couponFrequency: 'semi-annual',
      };

      const expectedSchedule: CashFlowRow[] = [
        {
          period: 1,
          date: 'Jul 1, 2025',
          couponPayment: 25,
          cumulativeInterest: 25,
          remainingPrincipal: 1000,
        },
        {
          period: 2,
          date: 'Jan 1, 2026',
          couponPayment: 25,
          cumulativeInterest: 50,
          remainingPrincipal: 0,
        },
      ];

      mockBondService.generateCashFlowSchedule.mockReturnValue(expectedSchedule);

      const result = controller.generateCashFlowSchedule(input);

      expect(service.generateCashFlowSchedule).toHaveBeenCalledWith(input);
      expect(result).toEqual(expectedSchedule);
      expect(result.length).toBe(2);
    });

    it('should return empty array for zero years to maturity', () => {
      const input: BondInput = {
        faceValue: 1000,
        annualCouponRate: 5,
        marketPrice: 950,
        yearsToMaturity: 0,
        couponFrequency: 'annual',
      };

      mockBondService.generateCashFlowSchedule.mockReturnValue([]);

      const result = controller.generateCashFlowSchedule(input);

      expect(service.generateCashFlowSchedule).toHaveBeenCalledWith(input);
      expect(result).toEqual([]);
    });
  });
});
