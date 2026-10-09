import { Component, OnInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription, switchMap, throwError } from 'rxjs';
import { PaymentService } from '../../services/payment.service';
import { ReservationService } from '../../services/reservation.service';

@Component({ selector: 'app-payment', standalone: true, imports: [CommonModule, FormsModule],
  templateUrl: './payment.html', styleUrls: ['./payment.scss'] })
export class PaymentComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private payments = inject(PaymentService);
  private reservations = inject(ReservationService);
  private platform = inject(PLATFORM_ID);
  private subscription?: Subscription;
  private interval?: ReturnType<typeof setInterval>;
  private deadline = 0;
  reservationId = ''; courtId = 0;
  court = { name: '' }; establishment = { name: '' }; qrImageUrl = '';
  date = ''; startTime = ''; endTime = '';
  totalPrice = 0; advance = 0; balance = 0; amount = 0;
  paymentMethod = 'QR'; reference = ''; fileName = ''; fileDataUrl = '';
  methods = [{ id: 'QR', label: 'Pago QR', icon: '📱' }];
  submitted = false; loading = false; ready = false; errorMessage = '';
  secondsRemaining = 0; isExpired = false;

  ngOnInit(): void {
    this.subscription = this.route.queryParamMap.pipe(switchMap(params => {
      this.ready = false; this.errorMessage = ''; this.submitted = false; this.isExpired = false;
      clearInterval(this.interval);
      const token = params.get('token');
      return token ? this.reservations.resolveRoute(token) : throwError(() => new Error('Abre el pago desde Mis reservas.'));
    })).subscribe({
      next: summary => {
        this.reservationId = summary.reservationId; this.courtId = summary.courtId;
        this.court = { name: summary.courtName }; this.establishment = { name: summary.complexName };
        this.qrImageUrl = summary.complexQrUrl || '';
        this.date = summary.reservationDate; this.startTime = summary.startTime; this.endTime = summary.endTime;
        this.totalPrice = summary.totalPrice; this.advance = summary.advanceRequired;
        this.amount = this.advance; this.balance = summary.pendingBalance;
        if (['PENDING_VALIDATION', 'CONFIRMED', 'COMPLETED'].includes(summary.status)) {
          this.reservations.navigateToReservation('/booking-confirmation', this.reservationId).subscribe({ error: () => this.goReservations() });
          return;
        }
        if (summary.status !== 'TEMPORAL' || !summary.expiresAt) { this.isExpired = true; return; }
        this.deadline = Date.parse(String(summary.expiresAt));
        this.ready = Number.isFinite(this.deadline);
        if (!this.ready) { this.errorMessage = 'No se pudo verificar el vencimiento de la reserva.'; return; }
        this.tick();
        if (isPlatformBrowser(this.platform) && !this.isExpired) this.interval = setInterval(() => this.tick(), 1000);
      },
      error: err => { this.errorMessage = err.error?.message || err.message || 'No se pudo cargar la reserva.'; },
    });
  }
  ngOnDestroy(): void { clearInterval(this.interval); this.subscription?.unsubscribe(); }
  private tick(): void {
    this.secondsRemaining = Math.max(0, Math.ceil((this.deadline - Date.now()) / 1000));
    if (!this.secondsRemaining) { this.isExpired = true; clearInterval(this.interval); }
  }
  get formattedCountdown(): string {
    return `${Math.floor(this.secondsRemaining / 60).toString().padStart(2, '0')}:${(this.secondsRemaining % 60).toString().padStart(2, '0')}`;
  }
  selectFile(event: Event): void {
    this.fileDataUrl = ''; this.fileName = '';
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      this.errorMessage = 'Adjunta una imagen JPG, PNG o WebP de hasta 5 MB.'; return;
    }
    const reader = new FileReader();
    reader.onload = () => { this.fileDataUrl = String(reader.result); this.fileName = file.name; };
    reader.readAsDataURL(file);
  }
  submitPayment(): void {
    if (this.loading || !this.ready) return;
    this.tick();
    if (this.isExpired) { this.errorMessage = 'Tu reserva venció. Selecciona otro horario.'; return; }
    if (!this.fileDataUrl) { this.errorMessage = 'Adjunta el comprobante antes de enviarlo.'; return; }
    this.loading = true; this.errorMessage = '';
    this.payments.uploadReceipt(this.reservationId, this.fileDataUrl).subscribe({
      next: () => { this.loading = false; this.submitted = true; this.isExpired = false; clearInterval(this.interval); },
      error: err => { this.loading = false; this.errorMessage = err.error?.message || 'No se pudo enviar el comprobante.'; this.tick(); },
    });
  }
  goConfirmation(): void {
    this.reservations.navigateToReservation('/booking-confirmation', this.reservationId).subscribe({ error: () => this.goReservations() });
  }
  goReservations(): void { this.router.navigate(['/my-reservations']); }
  goCourts(): void { this.router.navigate(['/courts']); }
  goBack(): void { this.router.navigate(this.courtId ? ['/court-detail', this.courtId] : ['/courts']); }
}
