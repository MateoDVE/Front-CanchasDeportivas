import { Component, OnInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PaymentService } from '../../services/payment.service';
import { ReservationService } from '../../services/reservation.service';
import { ComplexService } from '../../services/complex.service';
import { CourtService } from '../../services/court.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment.html',
  styleUrls: ['./payment.scss'],
})
export class PaymentComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private paymentService = inject(PaymentService);
  private reservationService = inject(ReservationService);
  private complexService = inject(ComplexService);
  private courtService = inject(CourtService);
  private platformId = inject(PLATFORM_ID);

  reservationId = '';
  courtId = 1;
  complexId = 1;
  court: any = { name: 'Cancha Deportiva' };
  establishment: any = { name: 'Complejo Deportivo' };
  qrImageUrl: string = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=SPORT_RESERVA_ANTICIPO';

  date = '';
  startTime = '10:00';
  endTime = '11:00';
  duration = 1;
  totalPrice = 80;
  advance = 20;
  balance = 60;

  paymentMethod = 'QR';
  reference = '';
  amount: number = 20;
  payDate = new Date().toISOString().split('T')[0];
  fileName = '';
  fileDataUrl: string = '';

  submitted = false;
  loading = false;
  errorMessage = '';

  // Control del temporizador de 5 minutos (300 segundos)
  secondsRemaining = 300;
  isExpired = false;
  private timerInterval: any = null;

  methods = [
    { id: 'QR', label: 'Pago QR', icon: '📱' },
    { id: 'transfer', label: 'Transferencia', icon: '🏦' },
    { id: 'cash', label: 'Efectivo', icon: '💵' },
  ];

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.reservationId = params['reservationId'] || '';
      this.courtId = Number(params['courtId']) || 1;
      this.complexId = Number(params['complexId']) || 1;
      this.date = params['date'] || this.date;
      this.startTime = params['startTime'] || this.startTime;
      this.endTime = params['endTime'] || this.endTime;
      this.duration = Number(params['duration']) || 1;
      this.totalPrice = Number(params['totalPrice']) || 80;
      this.advance = Number(params['advance']) || Number((this.totalPrice * 0.25).toFixed(2));
      this.balance = Number(params['balance']) || Number((this.totalPrice - this.advance).toFixed(2));
      this.amount = this.advance;

      this.secondsRemaining = 300;

      this.loadCourtAndComplex();
      this.loadComplexQr();

      if (this.reservationId) {
        this.loadReservationSummary();
      }

      this.startCountdown();
    });
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  private loadCourtAndComplex(): void {
    this.courtService.getCourtById(this.courtId).subscribe({
      next: (court) => {
        this.court = court;
      },
    });

    this.complexService.getActiveComplexes().subscribe({
      next: (complexes) => {
        const found = complexes.find((c) => c.id === this.complexId);
        if (found) {
          this.establishment = found;
          if (found.paymentQrUrl) {
            this.qrImageUrl = found.paymentQrUrl;
          }
        }
      },
    });
  }

  private loadComplexQr(): void {
    this.complexService.getComplexQr(this.complexId).subscribe({
      next: (res) => {
        if (res.qrImageUrl) {
          this.qrImageUrl = res.qrImageUrl;
        }
      },
    });
  }

  private loadReservationSummary(): void {
    this.reservationService.getSummary(this.reservationId).subscribe({
      next: (summary: any) => {
        if (!summary) return;
        const courtName = summary.court?.name || summary.courtName || this.court?.name || 'Cancha Deportiva';
        this.court = { name: courtName };

        const complexName = summary.complex?.name || summary.complexName || this.establishment?.name || 'Complejo Deportivo';
        const complexAddress = summary.complex?.location || summary.complexAddress || '';
        this.establishment = {
          name: complexName,
          address: complexAddress,
        };

        if (summary.reservationDate) this.date = summary.reservationDate;
        if (summary.startTime) this.startTime = summary.startTime;
        if (summary.endTime) this.endTime = summary.endTime;

        if (summary.totalPrice !== undefined) this.totalPrice = summary.totalPrice;
        if (summary.advanceRequired !== undefined) this.advance = summary.advanceRequired;
        if (summary.pendingBalance !== undefined) this.balance = summary.pendingBalance;
        this.amount = this.advance;

        const qr = summary.complex?.paymentQrUrl || summary.complexQrUrl;
        if (qr) {
          this.qrImageUrl = qr;
        }

        const isExp =
          summary.status === 'EXPIRED' ||
          summary.isExpired === true ||
          (summary.secondsRemaining !== undefined && summary.secondsRemaining <= 0);

        if (isExp) {
          this.isExpired = true;
          this.secondsRemaining = 0;
          if (this.timerInterval) clearInterval(this.timerInterval);
        } else if (typeof summary.secondsRemaining === 'number') {
            this.secondsRemaining = Math.min(
            summary.secondsRemaining,
           300
          );
        }
      },
      error: (err) => {
        console.error('Error al cargar resumen de reserva:', err);
      },
    });
  }

  private startCountdown(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.timerInterval) clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => {
      if (this.secondsRemaining > 0) {
        this.secondsRemaining--;
      } else {
        this.isExpired = true;
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  get formattedCountdown(): string {
    const mins = Math.floor(this.secondsRemaining / 60);
    const secs = this.secondsRemaining % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  getEndTime(): string {
    return this.endTime;
  }

  selectFile(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.fileName = file.name;
      const reader = new FileReader();
      reader.onload = () => {
        this.fileDataUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  submitPayment(): void {
    if (this.isExpired) {
      this.errorMessage = 'El tiempo de reserva ha expirado. Por favor selecciona otro horario.';
      return;
    }

    if (!this.reservationId) {
      this.errorMessage = 'No se encontró la reserva asociada para registrar el pago.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    // URL o imagen del comprobante
    const receiptUrl =
      this.fileDataUrl ||
      `https://storage.canchas.com/receipts/${this.reservationId}-${this.reference || 'qr'}.png`;

    this.paymentService.uploadReceipt(this.reservationId, receiptUrl).subscribe({
      next: () => {
        this.loading = false;
        this.submitted = true;
        if (this.timerInterval) clearInterval(this.timerInterval);
      },
      error: (err) => {
        this.loading = false;
        const rawMsg = err.error?.message;
        const msg = Array.isArray(rawMsg)
          ? rawMsg.join(', ')
          : rawMsg || 'Error al enviar el comprobante de pago al servidor.';
        this.errorMessage = msg;
        if (
          msg.toLowerCase().includes('expir') ||
          (err.status === 400 && msg.toLowerCase().includes('temporal'))
        ) {
          this.isExpired = true;
          this.secondsRemaining = 0;
          if (this.timerInterval) clearInterval(this.timerInterval);
        }
      },
    });
  }

  goConfirmation(): void {
    this.router.navigate(['/booking-confirmation'], {
      queryParams: {
        reservationId: this.reservationId,
        courtName: this.court.name,
        establishmentName: this.establishment.name,
        date: this.date,
        startTime: this.startTime,
        endTime: this.endTime,
        totalPrice: this.totalPrice,
        advance: this.advance,
      },
    });
  }

  goReservations(): void {
    this.router.navigate(['/my-reservations']);
  }

  goCourts(): void {
    this.router.navigate(['/courts']);
  }

  goBack(): void {
    this.router.navigate(['/court-detail', this.courtId]);
  }
}