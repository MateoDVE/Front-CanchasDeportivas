import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { PaymentService } from './payment.service';
import { environment } from '../../environments/environment';

describe('PaymentService', () => {
  let service: PaymentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PaymentService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(PaymentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should upload receipt', () => {
    const response: any = {
      paymentId: 1,
      reservationId: 'R1',
      amount: 25,
      paymentType: 'ADVANCE',
      paymentMethod: 'QR',
      receiptImageUrl: 'receipt.png',
      paymentStatus: 'PENDING',
      reservationStatus: 'TEMPORAL',
      createdAt: '2026-10-08',
    };

    service
      .uploadReceipt('R1', 'receipt.png')
      .subscribe(result => {
        expect(result).toEqual(response);
      });

    const req = httpMock.expectOne(
      `${environment.apiUrl}/payments/R1/receipt`
    );

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      receiptImageUrl: 'receipt.png',
    });

    req.flush(response);
  });
});