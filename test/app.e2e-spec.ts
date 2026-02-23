import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('App E2E', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/bond/calculate (POST) - valid input', async () => {
    const payload = {
      faceValue: 1000,
      annualCouponRate: 5,
      marketPrice: 950,
      yearsToMaturity: 10,
      couponFrequency: 'semi-annual',
    };

    const response = await request(app.getHttpServer())
      .post('/bond/calculate')
      .send(payload)
      .expect(201);

    expect(response.body).toHaveProperty('currentYield');
    expect(response.body).toHaveProperty('ytm');
    expect(response.body).toHaveProperty('totalInterest', 500);
    expect(response.body).toHaveProperty('premiumDiscount', 'discount');
    expect(response.body).toHaveProperty('premiumDiscountAmount', 50);
  });

  it('/bond/cash-flow-schedule (POST) - valid input', async () => {
    const payload = {
      faceValue: 1000,
      annualCouponRate: 5,
      marketPrice: 950,
      yearsToMaturity: 2,
      couponFrequency: 'annual',
    };

    const response = await request(app.getHttpServer())
      .post('/bond/cash-flow-schedule')
      .send(payload)
      .expect(201);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);

    const first = response.body[0];
    expect(first).toHaveProperty('period', 1);
    expect(first).toHaveProperty('couponPayment', 50);

    const last = response.body[response.body.length - 1];
    expect(last).toHaveProperty('period', 2);
    expect(last).toHaveProperty('remainingPrincipal', 0);
  });
});
