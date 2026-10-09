import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { PaymentComponent } from './payment';
import { ReservationService } from '../../services/reservation.service';
import { PaymentService } from '../../services/payment.service';

describe('Plazo del anticipo', () => {
  let component: PaymentComponent;
  let reservations: jasmine.SpyObj<ReservationService>;
  let payments: jasmine.SpyObj<PaymentService>;
  let summary: any;
  beforeEach(() => {
    summary = { reservationId: 'r1', courtId: 1, courtName: 'Cancha', complexName: 'Complejo', totalPrice: 40, advanceRequired: 10, pendingBalance: 40, status: 'TEMPORAL', expiresAt: new Date(Date.now() + 90000).toISOString() };
    reservations = jasmine.createSpyObj('ReservationService', ['resolveRoute', 'navigateToReservation']);
    payments = jasmine.createSpyObj('PaymentService', ['uploadReceipt']);
    reservations.resolveRoute.and.callFake(() => of(summary));
    reservations.navigateToReservation.and.returnValue(of(true));
    payments.uploadReceipt.and.returnValue(of({} as any));
    TestBed.configureTestingModule({ providers: [
      { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
      { provide: ActivatedRoute, useValue: { queryParamMap: of(convertToParamMap({ token: 'signed-token', totalPrice: '1', expiresAt: new Date(Date.now() + 9999999).toISOString() })) } },
      { provide: ReservationService, useValue: reservations },
      { provide: PaymentService, useValue: payments },
    ] });
    component = TestBed.runInInjectionContext(() => new PaymentComponent());
  });
  afterEach(() => component.ngOnDestroy());
  it('usa el vencimiento y precio del servidor y bloquea al llegar a cero', fakeAsync(() => {
    component.ngOnInit();
    expect(component.secondsRemaining).toBe(90); expect(component.totalPrice).toBe(40);
    tick(31000); expect(component.secondsRemaining).toBe(59);
    tick(59000); expect(component.isExpired).toBeTrue();
    component.fileDataUrl = 'data:image/png;base64,AA'; component.submitPayment();
    expect(payments.uploadReceipt).not.toHaveBeenCalled();
  }));
  it('enviar el comprobante aceptado detiene la expiración', fakeAsync(() => {
    component.ngOnInit(); component.fileDataUrl = 'data:image/png;base64,AA'; component.submitPayment();
    tick(100000); expect(component.submitted).toBeTrue(); expect(component.isExpired).toBeFalse();
  }));
  it('una recarga no reinicia una reserva vencida', () => {
    summary.expiresAt = new Date(Date.now() - 5000).toISOString();
    component.ngOnInit(); expect(component.isExpired).toBeTrue(); expect(component.secondsRemaining).toBe(0);
  });
  it('no muestra formulario si el token fue rechazado', () => {
    reservations.resolveRoute.and.returnValue(throwError(() => ({ error: { message: 'Enlace inválido' } })));
    component.ngOnInit(); expect(component.ready).toBeFalse(); expect(component.errorMessage).toBe('Enlace inválido');
  });
  it('una reserva pendiente de validación no vuelve al contador', () => {
    summary.status = 'PENDING_VALIDATION'; summary.expiresAt = null;
    component.ngOnInit(); expect(reservations.navigateToReservation).toHaveBeenCalledWith('/booking-confirmation', 'r1');
  });
});
