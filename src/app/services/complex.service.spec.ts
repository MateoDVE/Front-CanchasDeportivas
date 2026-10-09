import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { ComplexService } from './complex.service';
import { environment } from '../../environments/environment';

describe('ComplexService', () => {
  let service: ComplexService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ComplexService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(ComplexService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get active complexes', () => {
    const mock = [
      {
        id: 1,
        name: 'Complejo Central',
        location: 'Centro',
        contactInfo: '70000000',
        paymentQrUrl: null,
        isActive: true,
      },
    ];

    service.getActiveComplexes().subscribe(result => {
      expect(result).toEqual(mock);
    });

    const req = httpMock.expectOne(
      `${environment.apiUrl}/complexes`
    );

    expect(req.request.method).toBe('GET');

    req.flush(mock);
  });

  it('should get complex QR', () => {
    const mock = {
      complexId: 1,
      qrImageUrl: 'qr.png',
    };

    service.getComplexQr(1).subscribe(result => {
      expect(result).toEqual(mock);
    });

    const req = httpMock.expectOne(
      `${environment.apiUrl}/complexes/1/qr`
    );

    expect(req.request.method).toBe('GET');

    req.flush(mock);
  });
});