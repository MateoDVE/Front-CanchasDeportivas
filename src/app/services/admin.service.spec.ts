import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { AdminService } from './admin.service';
import { environment } from '../../environments/environment';

describe('AdminService', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;

  const baseUrl = `${environment.apiUrl}/admin`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdminService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get KPI summary', () => {
    const mock = {
      totalRevenue: 1000,
      totalReservations: 10,
      completedReservations: 8,
      cancelledReservations: 1,
      pendingReceivables: 100,
      averageTicket: 100,
      occupancyRate: 75,
    };

    service.getKpiSummary().subscribe(result => {
      expect(result).toEqual(mock);
    });

    const req = httpMock.expectOne(
      `${baseUrl}/analytics/kpi-summary`
    );

    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('should send revenue filters', () => {
    service.getRevenueReport({
      startDate: '2026-10-01',
      endDate: '2026-10-08',
      courtId: 2,
    }).subscribe();

    const req = httpMock.expectOne(r =>
      r.url === `${baseUrl}/analytics/revenue`
    );

    expect(req.request.params.get('startDate'))
      .toBe('2026-10-01');

    expect(req.request.params.get('endDate'))
      .toBe('2026-10-08');

    expect(req.request.params.get('courtId'))
      .toBe('2');

    req.flush({});
  });

  it('should get pending balances', () => {
    service.getPendingBalances(3).subscribe();

    const req = httpMock.expectOne(r =>
      r.url === `${baseUrl}/analytics/pending-balances`
    );

    expect(req.request.params.get('courtId')).toBe('3');

    req.flush([]);
  });

  it('should get court occupancy', () => {
    service
      .getCourtOccupancy('2026-10-01', '2026-10-08')
      .subscribe();

    const req = httpMock.expectOne(r =>
      r.url === `${baseUrl}/analytics/court-occupancy`
    );

    expect(req.request.params.get('startDate'))
      .toBe('2026-10-01');

    expect(req.request.params.get('endDate'))
      .toBe('2026-10-08');

    req.flush([]);
  });

  it('should create complex', () => {
    const payload = {
      name: 'Complejo Central',
      address: 'Av. Principal',
      openingTime: '08:00',
      closingTime: '22:00',
    };

    service.createComplex(payload).subscribe();

    const req = httpMock.expectOne(
      `${baseUrl}/complexes`
    );

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);

    req.flush({});
  });

  it('should create court', () => {
    const payload = {
      complexId: 1,
      name: 'Cancha 1',
      courtType: 'FUTSAL',
      pricePerHour: 100,
    };

    service.createCourt(payload).subscribe();

    const req = httpMock.expectOne(
      `${baseUrl}/courts`
    );

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);

    req.flush({});
  });

  it('should update court price', () => {
    service.updateCourtPrice(4, 150).subscribe();

    const req = httpMock.expectOne(
      `${baseUrl}/courts/4/price`
    );

    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({
      pricePerHour: 150,
    });

    req.flush({});
  });

  it('should convert Sunday 0 to 7 in weekly schedules', () => {
    service.setWeeklySchedules(1, [
      {
        dayOfWeek: 0,
        openTime: '08:00:00',
        closeTime: '22:00:00',
        isClosed: false,
      },
      {
        dayOfWeek: 1,
        openTime: '08:00:00',
        closeTime: '22:00:00',
        isClosed: true,
      },
    ]).subscribe();

    const req = httpMock.expectOne(
      `${baseUrl}/courts/1/schedules/weekly`
    );

    expect(req.request.method).toBe('PUT');

    expect(req.request.body).toEqual({
      schedules: [
        {
          dayOfWeek: 7,
          openTime: '08:00',
          closeTime: '22:00',
        },
      ],
    });

    req.flush([]);
  });

  it('should list staff', () => {
    service.listStaff().subscribe();

    const req = httpMock.expectOne(
      `${baseUrl}/staff`
    );

    expect(req.request.method).toBe('GET');

    req.flush([]);
  });

  it('should update staff status', () => {
    service
      .updateStaffStatus('abc', 'INACTIVE')
      .subscribe();

    const req = httpMock.expectOne(
      `${baseUrl}/staff/abc/status`
    );

    expect(req.request.method).toBe('PATCH');

    expect(req.request.body).toEqual({
      status: 'INACTIVE',
    });

    req.flush({});
  });

  it('should send reservation filters', () => {
    service.getAllReservations({
      date: '2026-10-08',
      courtId: 2,
      complexId: 3,
      status: 'CONFIRMED',
      clientId: 'C1',
    }).subscribe();

    const req = httpMock.expectOne(r =>
      r.url === `${baseUrl}/reservations`
    );

    expect(req.request.params.get('date'))
      .toBe('2026-10-08');

    expect(req.request.params.get('courtId'))
      .toBe('2');

    expect(req.request.params.get('complexId'))
      .toBe('3');

    expect(req.request.params.get('status'))
      .toBe('CONFIRMED');

    expect(req.request.params.get('clientId'))
      .toBe('C1');

    req.flush([]);
  });
});