import { TestBed } from '@angular/core/testing';
import { SecretaryDashboardComponent } from './secretary-dashboard';
import { SecretaryService } from '../../services/secretary.service';
import { CourtService } from '../../services/court.service';

describe('Cash reconciliation', () => {
  let component: SecretaryDashboardComponent;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [
      { provide: SecretaryService, useValue: {} },
      { provide: CourtService, useValue: {} },
    ] });
    component = TestBed.runInInjectionContext(() => new SecretaryDashboardComponent());
    component.shiftSummary.set({ secretaryId: 'staff', date: '2026-09-07', totalCash: 450,
      totalQr: 90, totalCollected: 540, transactionsCount: 2, payments: [] });
  });
  afterEach(() => component.ngOnDestroy());

  it('requires a valid count instead of treating an empty field as zero', () => {
    expect(component.cashDifference()).toBeNull();
    component.declaredCash.set(-1);
    expect(component.cashDifference()).toBeNull();
    component.declaredCash.set(NaN);
    expect(component.cashDifference()).toBeNull();
  });

  it('compares physical cash with cash payments only, excluding QR', () => {
    component.declaredCash.set(450);
    expect(component.cashDifference()).toBe(0);
    component.declaredCash.set(400);
    expect(component.cashDifference()).toBe(-50);
    component.declaredCash.set(460);
    expect(component.cashDifference()).toBe(10);
  });

  it('accepts an explicit zero and rounds currency differences to cents', () => {
    component.declaredCash.set(0);
    expect(component.cashDifference()).toBe(-450);
    component.declaredCash.set(450.12);
    expect(component.cashDifference()).toBe(0.12);
  });
});
