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
      location: 'Av. Principal',
      contactInfo: '70123456',
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
    it('should get revenue report without filters', () => {
    service.getRevenueReport().subscribe();

    const req = httpMock.expectOne(r =>
      r.url === `${baseUrl}/analytics/revenue`
    );

    expect(req.request.method).toBe('GET');
    expect(req.request.params.keys().length).toBe(0);

    req.flush({});
  });

  it('should get pending balances without court filter', () => {
    service.getPendingBalances().subscribe();

    const req = httpMock.expectOne(r =>
      r.url === `${baseUrl}/analytics/pending-balances`
    );

    expect(req.request.method).toBe('GET');
    expect(req.request.params.has('courtId')).toBeFalse();

    req.flush([]);
  });

  it('should get court occupancy without dates', () => {
    service.getCourtOccupancy().subscribe();

    const req = httpMock.expectOne(r =>
      r.url === `${baseUrl}/analytics/court-occupancy`
    );

    expect(req.request.method).toBe('GET');
    expect(req.request.params.keys().length).toBe(0);

    req.flush([]);
  });

  it('should get peak hours without courtId', () => {
    service.getPeakHours().subscribe();

    const req = httpMock.expectOne(r =>
      r.url === `${baseUrl}/analytics/peak-hours`
    );

    expect(req.request.method).toBe('GET');
    expect(req.request.params.has('courtId')).toBeFalse();

    req.flush([]);
  });

  it('should get peak hours with courtId', () => {
    service.getPeakHours(5).subscribe();

    const req = httpMock.expectOne(r =>
      r.url === `${baseUrl}/analytics/peak-hours`
    );

    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('courtId')).toBe('5');

    req.flush([]);
  });

  it('should get court performance', () => {
    service.getCourtPerformance().subscribe();

    const req = httpMock.expectOne(
      `${baseUrl}/analytics/court-performance`
    );

    expect(req.request.method).toBe('GET');

    req.flush([]);
  });

  it('should get all complexes', () => {
    service.getAllComplexes().subscribe();

    const req = httpMock.expectOne(
      `${baseUrl}/complexes`
    );

    expect(req.request.method).toBe('GET');

    req.flush([]);
  });

  it('should update complex', () => {
    const payload = {
      name: 'Complejo Actualizado',
      location: 'Zona Central',
      contactInfo: '70000001',
    };

    service.updateComplex(2, payload).subscribe();

    const req = httpMock.expectOne(
      `${baseUrl}/complexes/2`
    );

    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);

    req.flush({});
  });

  it('should deactivate complex', () => {
    service.deactivateComplex(2).subscribe();

    const req = httpMock.expectOne(
      `${baseUrl}/complexes/2`
    );

    expect(req.request.method).toBe('DELETE');

    req.flush(null);
  });

  it('should toggle complex', () => {
    service.toggleComplex(3).subscribe();

    const req = httpMock.expectOne(
      `${baseUrl}/complexes/3/toggle`
    );

    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({});

    req.flush({});
  });

  it('should update business info', () => {
    const payload = {
      businessName: 'Canchas Deportivas',
      taxId: '123456789',
      address: 'Av. Principal',
      phone: '70000000',
      email: 'admin@test.com',
      primaryColor: '#000000',
    };

    service.updateBusinessInfo(payload).subscribe();

    const req = httpMock.expectOne(
      `${baseUrl}/business-info`
    );

    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);

    req.flush({});
  });

  it('should upload complex QR', () => {
    service.uploadComplexQr(
      2,
      'https://test.com/qr.png'
    ).subscribe();

    const req = httpMock.expectOne(
      `${baseUrl}/complexes/2/qr`
    );

    expect(req.request.method).toBe('POST');

    expect(req.request.body).toEqual({
      paymentQrUrl: 'https://test.com/qr.png',
    });

    req.flush({});
  });

  it('should get all courts', () => {
    service.getAllCourts().subscribe();

    const req = httpMock.expectOne(
      `${baseUrl}/courts`
    );

    expect(req.request.method).toBe('GET');

    req.flush([]);
  });

  it('should update court', () => {
    const payload = {
      name: 'Cancha Modificada',
      images: ['imagen.png'],
    };

    service.updateCourt(4, payload).subscribe();

    const req = httpMock.expectOne(
      `${baseUrl}/courts/4`
    );

    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);

    req.flush({});
  });

  it('should toggle court', () => {
    service.toggleCourt(4).subscribe();

    const req = httpMock.expectOne(
      `${baseUrl}/courts/4/toggle`
    );

    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({});

    req.flush({});
  });

  it('should schedule maintenance', () => {
    const payload = {
      startDatetime: '2026-10-20T10:00:00.000Z',
      endDatetime: '2026-10-20T12:00:00.000Z',
      reason: 'Mantenimiento',
    };

    service.scheduleMaintenance(
      4,
      payload
    ).subscribe();

    const req = httpMock.expectOne(
      `${baseUrl}/courts/4/incidents`
    );

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);

    req.flush({});
  });

  it('should register immediate incident', () => {
    const payload = {
      reason: 'Lluvia intensa',
      durationHours: 3,
    };

    service.registerImmediateIncident(
      4,
      payload
    ).subscribe();

    const req = httpMock.expectOne(
      `${baseUrl}/courts/4/incidents/immediate`
    );

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);

    req.flush({});
  });

  it('should save weekly schedules normally', () => {
    service.setWeeklySchedules(1, [
      {
        dayOfWeek: 1,
        openTime: '09:00:00',
        closeTime: '21:00:00',
        isClosed: false,
      },
    ]).subscribe();

    const req = httpMock.expectOne(
      `${baseUrl}/courts/1/schedules/weekly`
    );

    expect(req.request.method).toBe('PUT');

    expect(req.request.body).toEqual({
      schedules: [
        {
          dayOfWeek: 1,
          openTime: '09:00',
          closeTime: '21:00',
        },
      ],
    });

    req.flush([]);
  });

  it('should create special schedule', () => {
    const payload = {
      specificDate: '2026-12-25',
      openTime: '10:00',
      closeTime: '18:00',
    };

    service.setSpecialSchedule(
      2,
      payload
    ).subscribe();

    const req = httpMock.expectOne(
      `${baseUrl}/courts/2/schedules/special`
    );

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);

    req.flush({});
  });

  it('should get court schedules', () => {
    service.getCourtSchedules(2).subscribe();

    const req = httpMock.expectOne(
      `${baseUrl}/courts/2/schedules`
    );

    expect(req.request.method).toBe('GET');

    req.flush([]);
  });

  it('should create staff', () => {
    const payload = {
      email: 'nuevo@test.com',
      password: '123456',
      name: 'Nuevo Usuario',
      phone: '70000000',
    };

    service.createStaff(payload).subscribe();

    const req = httpMock.expectOne(
      `${baseUrl}/staff`
    );

    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);

    req.flush({
      id: 'S1',
      email: payload.email,
      name: payload.name,
      phone: payload.phone,
      role: 'SECRETARY',
      status: 'ACTIVE',
      createdAt: '2026-10-14',
    });
  });

  it('should get reservations without filters', () => {
    service.getAllReservations().subscribe();

    const req = httpMock.expectOne(r =>
      r.url === `${baseUrl}/reservations`
    );

    expect(req.request.method).toBe('GET');
    expect(req.request.params.keys().length).toBe(0);

    req.flush([]);
  });

  it('should get master calendar without date', () => {
    service.getMasterCalendar().subscribe();

    const req = httpMock.expectOne(r =>
      r.url === `${baseUrl}/calendar-master`
    );

    expect(req.request.method).toBe('GET');
    expect(req.request.params.has('date')).toBeFalse();

    req.flush({});
  });

  it('should get master calendar with date', () => {
    service.getMasterCalendar(
      '2026-10-14'
    ).subscribe();

    const req = httpMock.expectOne(r =>
      r.url === `${baseUrl}/calendar-master`
    );

    expect(req.request.method).toBe('GET');

    expect(req.request.params.get('date'))
      .toBe('2026-10-14');

    req.flush({});
  });

  it('should audit cash shifts without filters', () => {
    service.auditCashShifts().subscribe();

    const req = httpMock.expectOne(r =>
      r.url === `${baseUrl}/analytics/cash-shifts`
    );

    expect(req.request.method).toBe('GET');
    expect(req.request.params.keys().length).toBe(0);

    req.flush([]);
  });

  it('should audit cash shifts with filters', () => {
    service.auditCashShifts({
      startDate: '2026-10-01',
      endDate: '2026-10-14',
      secretaryId: 'S1',
    }).subscribe();

    const req = httpMock.expectOne(r =>
      r.url === `${baseUrl}/analytics/cash-shifts`
    );

    expect(req.request.method).toBe('GET');

    expect(req.request.params.get('startDate'))
      .toBe('2026-10-01');

    expect(req.request.params.get('endDate'))
      .toBe('2026-10-14');

    expect(req.request.params.get('secretaryId'))
      .toBe('S1');

    req.flush([]);
  });
});