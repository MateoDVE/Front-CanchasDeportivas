import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { CourtDetailComponent } from './court-detail';
import { CourtService } from '../../services/court.service';
import { ComplexService } from '../../services/complex.service';
import { ReservationService } from '../../services/reservation.service';
import { AuthService } from '../../services/auth.service';

describe('Court detail time range', () => {
  let component: CourtDetailComponent;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [
      ...[Router, ActivatedRoute, CourtService, ComplexService, ReservationService, AuthService]
        .map(provide => ({ provide, useValue: {} })),
    ] });
    component = TestBed.runInInjectionContext(() => new CourtDetailComponent());
    component.serverAvailability = {
      courtId: 1, courtName: 'Cancha', date: '2026-10-15', dayOfWeek: 4,
      isOpen: true, openTime: '08:00', closeTime: '10:00',
      slots: ['08:00', '08:30', '09:00', '09:30'].map(startTime => ({
        startTime, endTime: component.getEndTime(startTime, 0.5),
        isAvailable: true, status: 'AVAILABLE',
      })),
    };
  });

  it('selects independent endpoints and calculates 90 minutes', () => {
    component.selectTime('08:00');
    expect(component.selectedEnd).toBeNull();
    expect(component.duration).toBe(0);
    component.selectTime('09:30');
    expect(component.duration).toBe(1.5);
    expect(component.isInRange('08:30')).toBeTrue();
    expect(component.isInRange('09:30')).toBeFalse();
  });

  it('allows closing time as the end but not as the start', () => {
    expect(component.canSelectTime('10:00')).toBeFalse();
    component.selectTime('09:30');
    component.selectTime('10:00');
    expect(component.selectedEnd).toBe('10:00');
  });

  it('can end at an occupied slot boundary but cannot cross it', () => {
    component.serverAvailability!.slots[2].status = 'OCCUPIED';
    component.serverAvailability!.slots[2].isAvailable = false;
    component.selectTime('08:00');
    expect(component.canSelectTime('09:00')).toBeTrue();
    expect(component.canSelectTime('09:30')).toBeFalse();
  });

  it('rejects missing availability and maintenance inside the range', () => {
    component.serverAvailability!.slots.splice(1, 1);
    expect(component.isRangeAvailable('08:00', '09:30')).toBeFalse();
    component.serverAvailability!.slots[0].status = 'BLOCKED';
    expect(component.canStartAt('08:00')).toBeFalse();
  });

  it('starts a new range after completion and clears both endpoints', () => {
    component.selectTime('08:00');
    component.selectTime('09:00');
    component.selectTime('08:30');
    expect(component.selectedStart).toBe('08:30');
    expect(component.selectedEnd).toBeNull();
    component.clearTimeRange();
    expect(component.selectedStart).toBeNull();
    expect(component.selectedEnd).toBeNull();
  });
});
