import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AdminService } from './admin.service';

describe('Weekly schedules API payload', () => {
  let service: AdminService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(AdminService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('sends only API fields, normalizes times and Sunday, and omits closed days', () => {
    const days = [
      { dayOfWeek: 1, name: 'Lunes', openTime: '08:00:00', closeTime: '23:00:00', isClosed: false },
      { dayOfWeek: 2, name: 'Martes', openTime: '', closeTime: '', isClosed: true },
      { dayOfWeek: 0, name: 'Domingo', openTime: '09:00', closeTime: '20:00', isClosed: false },
    ];
    service.setWeeklySchedules(1, days).subscribe();
    const request = http.expectOne(r => r.url.endsWith('/courts/1/schedules/weekly'));
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ schedules: [
      { dayOfWeek: 1, openTime: '08:00', closeTime: '23:00' },
      { dayOfWeek: 7, openTime: '09:00', closeTime: '20:00' },
    ] });
    request.flush([]);
  });
  it('sends an empty schedule when all days are closed', () => {
    service.setWeeklySchedules(1, [{ dayOfWeek: 1, openTime: '', closeTime: '', isClosed: true }]).subscribe();
    const request = http.expectOne(r => r.url.endsWith('/schedules/weekly'));
    expect(request.request.body).toEqual({ schedules: [] });
    request.flush([]);
  });
});
