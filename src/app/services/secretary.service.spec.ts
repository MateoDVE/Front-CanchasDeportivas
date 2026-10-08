import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import {
  provideHttpClient,
} from '@angular/common/http';

import { SecretaryService } from './secretary.service';
import { environment } from '../../environments/environment';

describe('SecretaryService', () => {
  let service: SecretaryService;
  let httpMock: HttpTestingController;

  const baseUrl = `${environment.apiUrl}/secretary`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SecretaryService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(SecretaryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get operational board with date', () => {
    service
      .getOperationalBoard('2026-10-08')
      .subscribe();

    const req = httpMock.expectOne(r =>
      r.url === `${baseUrl}/operational-board`
    );

    expect(req.request.method).toBe('GET');

    expect(req.request.params.get('date'))
      .toBe('2026-10-08');

    req.flush({
      date: '2026-10-08',
      courts: [],
      totalReservations: 0,
      confirmedCount: 0,
      pendingValidationCount: 0,
      completedCount: 0,
    });
  });

  it('should search reservations with filters', () => {
    service.searchReservations({
      date: '2026-10-08',
      courtId: 1,
      complexId: 2,
      status: 'CONFIRMED',
      clientId: 'CLIENT1',
    }).subscribe();

    const req = httpMock.expectOne(r =>
      r.url === `${baseUrl}/reservations`
    );

    expect(req.request.params.get('date'))
      .toBe('2026-10-08');

    expect(req.request.params.get('courtId'))
      .toBe('1');

    expect(req.request.params.get('complexId'))
      .toBe('2');

    expect(req.request.params.get('status'))
      .toBe('CONFIRMED');

    expect(req.request.params.get('clientId'))
      .toBe('CLIENT1');

    req.flush([]);
  });

  it('should get temporal reservations', () => {
    service.getTemporalReservations().subscribe();

    const req = httpMock.expectOne(
      `${baseUrl}/reservations/temporal`
    );

    expect(req.request.method).toBe('GET');

    req.flush([]);
  });

  it('should release expired reservation', () => {
    service
      .releaseExpiredReservation('R1')
      .subscribe();

    const req = httpMock.expectOne(
      `${baseUrl}/reservations/R1/release-expired`
    );

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});

    req.flush({});
  });

  it('should quick search reservation', () => {
    service.quickSearch('123456').subscribe();

    const req = httpMock.expectOne(r =>
      r.url === `${baseUrl}/checkin/search`
    );

    expect(req.request.params.get('q'))
      .toBe('123456');

    req.flush([]);
  });

  it('should search clients', () => {
    service.searchClients('Juan').subscribe();

    const req = httpMock.expectOne(r =>
      r.url === `${baseUrl}/clients/search`
    );

    expect(req.request.params.get('q'))
      .toBe('Juan');

    req.flush([]);
  });

  it('should create manual reservation', () => {
    const payload = {
      clientId: 'C1',
      courtId: 1,
      reservationDate: '2026-10-08',
      startTime: '10:00',
      endTime: '11:00',
      origin: 'MANUAL' as const,
    };

    service
      .createManualReservation(payload)
      .subscribe();

    const req = httpMock.expectOne(
      `${baseUrl}/reservations/manual`
    );

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);

    req.flush({});
  });

  it('should authorize entry', () => {
    service.authorizeEntry('R1').subscribe();

    const req = httpMock.expectOne(
      `${baseUrl}/reservations/R1/authorize-entry`
    );

    expect(req.request.method).toBe('POST');

    req.flush({});
  });

  it('should mark no show', () => {
    service.markNoShow('R1', 'No llegó').subscribe();

    const req = httpMock.expectOne(
      `${baseUrl}/reservations/R1/no-show`
    );

    expect(req.request.body).toEqual({
      reason: 'No llegó',
    });

    req.flush({});
  });

  it('should cancel reservation', () => {
    service
      .cancelReservation('R1', 'Cliente canceló')
      .subscribe();

    const req = httpMock.expectOne(
      `${baseUrl}/reservations/R1/cancel`
    );

    expect(req.request.method).toBe('POST');

    expect(req.request.body).toEqual({
      reason: 'Cliente canceló',
    });

    req.flush({});
  });

  it('should validate payment', () => {
    service.validatePayment(10).subscribe();

    const req = httpMock.expectOne(
      `${baseUrl}/payments/10/validate`
    );

    expect(req.request.method).toBe('POST');

    req.flush({});
  });

  it('should reject payment', () => {
    service
      .rejectPayment(10, 'Imagen ilegible')
      .subscribe();

    const req = httpMock.expectOne(
      `${baseUrl}/payments/10/reject`
    );

    expect(req.request.body).toEqual({
      reason: 'Imagen ilegible',
    });

    req.flush({});
  });

  it('should convert CASH to EFECTIVO', () => {
    service.registerFinalPayment('R1', {
      amount: 75,
      paymentMethod: 'CASH',
    }).subscribe();

    const req = httpMock.expectOne(
      `${baseUrl}/reservations/R1/final-payment`
    );

    expect(req.request.body).toEqual({
      amount: 75,
      paymentMethod: 'EFECTIVO',
    });

    req.flush({});
  });

  it('should keep QR payment method', () => {
    service.registerFinalPayment('R1', {
      amount: 75,
      paymentMethod: 'QR',
    }).subscribe();

    const req = httpMock.expectOne(
      `${baseUrl}/reservations/R1/final-payment`
    );

    expect(req.request.body.paymentMethod)
      .toBe('QR');

    req.flush({});
  });

  it('should close shift', () => {
    const payload = {
      totalDeclaredCash: 500,
      notes: 'Todo correcto',
    };

    service.closeShift(payload).subscribe();

    const req = httpMock.expectOne(
      `${baseUrl}/shifts/close`
    );

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);

    req.flush({});
  });
});