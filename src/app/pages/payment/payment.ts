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

      if (params['secondsRemaining']) {
        this.secondsRemaining = Math.max(0, Number(params['secondsRemaining']));
      }

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
      next: (summary) => {
        this.court = { name: summary.courtName };
        this.establishment = {
          name: summary.complexName,
          address: summary.complexAddress,
        };
        this.totalPrice = summary.totalPrice;
        this.advance = summary.advanceRequired;
        this.balance = summary.pendingBalance;
        this.amount = this.advance;
        if (summary.complexQrUrl) {
          this.qrImageUrl = summary.complexQrUrl;
        }
        if (summary.isExpired) {
          this.isExpired = true;
          this.secondsRemaining = 0;
        }
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
        if (err.error && err.error.message) {
          this.errorMessage = Array.isArray(err.error.message)
            ? err.error.message.join(', ')
            : err.error.message;
        } else {
          this.errorMessage = 'Error al enviar el comprobante de pago al servidor.';
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