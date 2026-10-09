import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription, switchMap, throwError } from 'rxjs';
import { ReservationService } from '../../services/reservation.service';

@Component({ selector: 'app-booking-confirmation', standalone: true, imports: [CommonModule],
  templateUrl: './booking-confirmation.html', styleUrls: ['./booking-confirmation.scss'] })
export class BookingConfirmationComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private reservations = inject(ReservationService);
  private subscription?: Subscription;
  reservationId = ''; courtName = ''; establishmentName = ''; establishmentAddress = '';
  date = ''; startTime = ''; endTime = ''; status = '';
  totalPrice = 0; advance = 0; balance = 0;
  errorMessage = ''; loaded = false;
  get confirmed(): boolean { return ['CONFIRMED', 'COMPLETED'].includes(this.status); }
  get title(): string {
    if (this.status === 'PENDING_VALIDATION') return 'Reserva pendiente de validación';
    if (this.confirmed) return 'Reserva confirmada';
    const labels: Record<string, string> = { TEMPORAL: 'pendiente de pago', EXPIRED: 'expirada', CANCELLED: 'cancelada', NO_SHOW: 'inasistencia', REPROGRAMMED: 'reprogramada' };
    return 'Estado de tu reserva: ' + (labels[this.status] || this.status);
  }
  ngOnInit(): void {
    this.subscription = this.route.queryParamMap.pipe(switchMap(params => {
      this.loaded = false;
      const token = params.get('token');
      return token ? this.reservations.resolveRoute(token) : throwError(() => new Error('Abre la reserva desde Mis reservas.'));
    })).subscribe({ next: summary => {
      this.reservationId = summary.reservationId; this.courtName = summary.courtName;
      this.establishmentName = summary.complexName; this.establishmentAddress = summary.complexAddress;
      this.date = summary.reservationDate; this.startTime = summary.startTime; this.endTime = summary.endTime;
      this.totalPrice = summary.totalPrice; this.advance = summary.advanceRequired;
      this.balance = summary.pendingBalance; this.status = summary.status; this.loaded = true;
    }, error: err => { this.errorMessage = err.error?.message || err.message || 'No se pudo consultar la reserva.'; } });
  }
  ngOnDestroy(): void { this.subscription?.unsubscribe(); }
  goReservations(): void { this.router.navigate(['/my-reservations']); }
  goHome(): void { this.router.navigate(['/']); }
}
