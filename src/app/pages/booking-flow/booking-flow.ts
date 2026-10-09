import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ReservationService } from '../../services/reservation.service';
import { AuthService } from '../../services/auth.service';
import { CourtService } from '../../services/court.service';
import { ComplexService } from '../../services/complex.service';

@Component({
  selector: 'app-booking-flow',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking-flow.html',
  styleUrls: ['./booking-flow.scss'],
})
export class BookingFlowComponent implements OnInit {
  private router = inject(Router);
  private reservations = inject(ReservationService);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private courtService = inject(CourtService);
  private complexService = inject(ComplexService);

  step = 1;
  reservationId = '';

  form = {
    name: '',
    phone: '',
    email: '',
    notes: '',
  };

  court: any = null;

  establishment: any = null;
  loadError = "";

  date = '';
  startTime = '';
  endTime = '';
  duration = 1;
  totalPrice = 80;
  advance = 20;

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.form.name = user.name || '';
      this.form.phone = user.phone || '';
      this.form.email = user.email || '';
    }

    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) { this.loadError = 'Abre la reserva desde Mis reservas.'; return; }
    this.reservations.resolveRoute(token).subscribe({ next: summary => {
      this.reservationId = summary.reservationId;
      this.date = summary.reservationDate; this.startTime = summary.startTime; this.endTime = summary.endTime;
      this.totalPrice = summary.totalPrice; this.advance = summary.advanceRequired;
      this.court = { id: summary.courtId, name: summary.courtName };
      this.establishment = { name: summary.complexName };
    }, error: () => { this.loadError = 'El enlace de reserva es inválido o ha vencido.'; } });
  }

  getEndTime(): string {
    if (this.endTime) return this.endTime;
    const [h, m] = this.startTime.split(':').map(Number);
    const total = h * 60 + m + this.duration * 60;
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  }

  continue(): void {
    this.step = 2;
  }

  back(): void {
    this.step = 1;
  }

  goPayment(): void {
    this.reservations.navigateToReservation('/payment', this.reservationId).subscribe({
      error: () => { this.loadError = 'No se pudo abrir el pago.'; },
    });
  }

  goBack(): void {
    this.router.navigate(this.court ? ['/court-detail', this.court.id] : ['/courts']);
  }
}