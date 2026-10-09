import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MyReservationsComponent } from './my-reservations';
import { ReservationService } from '../../services/reservation.service';
import { AuthService } from '../../services/auth.service';

describe('Ordenación y filtros de Mis reservas', () => {
  let component: MyReservationsComponent;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [
      { provide: Router, useValue: {} }, { provide: ReservationService, useValue: {} },
      { provide: AuthService, useValue: { currentUser: () => null } },
    ] });
    component = TestBed.runInInjectionContext(() => new MyReservationsComponent());
    component.reservations = [
      { id: 'bbbbbbbb-b', courtName: 'Wally', status: 'PENDING_VALIDATION', reservationDate: '2030-01-02', startTime: '10:00', endTime: '11:00', totalPrice: 80, createdAt: '2029-12-01' },
      { id: 'aaaaaaaa-a', courtName: 'Futsal', status: 'TEMPORAL', reservationDate: '2030-01-01', startTime: '10:00', endTime: '10:30', totalPrice: 40, createdAt: '2029-12-02' },
    ] as any;
  });
  it('ordena próximas y cambia el criterio de importe', () => {
    expect(component.visibleReservations[0].id).toBe('aaaaaaaa-a');
    component.sortOrder = 'price'; expect(component.visibleReservations[0].id).toBe('bbbbbbbb-b');
  });
  it('separa validación de pagos temporales', () => {
    component.changeFilter('pending');
    expect(component.visibleReservations.map(r => r.status)).toEqual(['PENDING_VALIDATION']);
    component.changeFilter('temporal');
    expect(component.visibleReservations.map(r => r.status)).toEqual(['TEMPORAL']);
  });
  it('valida el rango de fechas', () => {
    component.dateFrom = '2030-01-03'; component.dateTo = '2030-01-01';
    expect(component.invalidDates).toBeTrue(); expect(component.visibleReservations).toEqual([]);
  });
  it('encuentra una reserva por código corto sin cambiar su identificador', () => {
    component.search = 'AAAAAAAA';
    expect(component.visibleReservations.map(r => r.id)).toEqual(['aaaaaaaa-a']);
  });
});
