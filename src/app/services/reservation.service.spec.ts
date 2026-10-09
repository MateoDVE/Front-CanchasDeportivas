import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { ReservationService } from './reservation.service';
import { environment } from '../../environments/environment';

describe('ReservationService', () => {
  let service: ReservationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ReservationService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(ReservationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create temporal reservation', () => {
    const payload = {
      courtId: 1,
      date: '2026-10-08',
      startTime: '10:00',
      endTime: '11:00',
    };

    const response: any = {
      reservationId: 'R1',
      clientId: 'C1',
      courtId: 1,
      reservationDate: '2026-10-08',
      startTime: '10:00',
      endTime: '11:00',
      durationHours: 1,
      pricePerHour: 100,
      totalPrice: 100,
      advanceRequired: 25,
      pendingBalance: 75,
      status: 'TEMPORAL',
      expiresAt: null,
      secondsRemaining: 600,
    };

    service.createTemporal(payload).subscribe(result => {
      expect(result).toEqual(response);
    });

    const req = httpMock.expectOne(
      `${environment.apiUrl}/reservations`
    );

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);

    req.flush(response);
  });

  it('should get reservation summary', () => {
    const response: any = {
      reservationId: 'R1',
      status: 'TEMPORAL',
    };

    service.getSummary('R1').subscribe(result => {
      expect(result).toEqual(response);
    });

    const req = httpMock.expectOne(
      `${environment.apiUrl}/reservations/R1/summary`
    );

    expect(req.request.method).toBe('GET');

    req.flush(response);
  });

  it('should get reservation status', () => {
    const response = {
      id: 'R1',
      status: 'CONFIRMED',
      expiresAt: null,
      isExpired: false,
    };

    service.getStatus('R1').subscribe(result => {
      expect(result).toEqual(response);
    });

    const req = httpMock.expectOne(
      `${environment.apiUrl}/reservations/R1/status`
    );

    expect(req.request.method).toBe('GET');

    req.flush(response);
  });

  it('should get my reservations', () => {
    const response = {
      upcoming: [],
      history: [],
    };

    service.getMyReservations().subscribe(result => {
      expect(result).toEqual(response);
    });

    const req = httpMock.expectOne(
      `${environment.apiUrl}/client/my-reservations`
    );

    expect(req.request.method).toBe('GET');

    req.flush(response);
  });
});