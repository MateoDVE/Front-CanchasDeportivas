import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { CourtService } from './court.service';
import { environment } from '../../environments/environment';

describe('CourtService', () => {
  let service: CourtService;
  let httpMock: HttpTestingController;

  const rawCourt: any = {
    id: 1,
    complexId: 1,
    name: 'Cancha 1',
    courtType: 'Futsal',
    pricePerHour: 100,
    isActive: true,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CourtService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(CourtService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get and enrich all courts', () => {
    service.getAllCourts().subscribe(courts => {
      expect(courts.length).toBe(1);
      expect(courts[0].type).toBe('Futsal');
      expect(courts[0].images).toEqual([]);
      expect(courts[0].features).toEqual([]);
    });

    const req = httpMock.expectOne(
      `${environment.apiUrl}/courts`
    );

    expect(req.request.method).toBe('GET');

    req.flush([rawCourt]);
  });

  it('should get court by id and enrich it', () => {
    service.getCourtById(1).subscribe(court => {
      expect(court.id).toBe(1);
      expect(court.type).toBe('Futsal');
      expect(court.images).toEqual([]);
      expect(court.features).toEqual([]);
    });

    const req = httpMock.expectOne(
      `${environment.apiUrl}/courts/1`
    );

    expect(req.request.method).toBe('GET');

    req.flush(rawCourt);
  });

  it('should get courts by complex', () => {
    service.getCourtsByComplex(2).subscribe(courts => {
      expect(courts.length).toBe(1);
      expect(courts[0].type).toBe('Futsal');
    });

    const req = httpMock.expectOne(
      `${environment.apiUrl}/complexes/2/courts`
    );

    expect(req.request.method).toBe('GET');

    req.flush([rawCourt]);
  });

  it('should get court availability', () => {
    const mock: any = {
      courtId: 1,
      courtName: 'Cancha 1',
      date: '2026-10-08',
      dayOfWeek: 4,
      isOpen: true,
      openTime: '08:00',
      closeTime: '22:00',
      slots: [],
    };

    service
      .getCourtAvailability(1, '2026-10-08')
      .subscribe(result => {
        expect(result).toEqual(mock);
      });

    const req = httpMock.expectOne(request =>
      request.url ===
        `${environment.apiUrl}/courts/1/availability` &&
      request.params.get('date') === '2026-10-08'
    );

    expect(req.request.method).toBe('GET');

    req.flush(mock);
  });
});