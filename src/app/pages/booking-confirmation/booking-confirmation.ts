import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ReservationService } from '../../services/reservation.service';

@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-confirmation.html',
  styleUrls: ['./booking-confirmation.scss'],
})
export class BookingConfirmationComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private reservationService = inject(ReservationService);

  reservationId = '';
  courtName = 'Cancha Deportiva';
  establishmentName = 'Complejo Deportivo';
  establishmentAddress = '';
  date = '';
  startTime = '';
  endTime = '';
  totalPrice = 0;
  advance = 0;
  balance = 0;

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.reservationId = params['reservationId'] || '';
      this.courtName = params['courtName'] || this.courtName;
      this.establishmentName = params['establishmentName'] || this.establishmentName;
      this.date = params['date'] || this.date;
      this.startTime = params['startTime'] || this.startTime;
      this.endTime = params['endTime'] || this.endTime;
      this.totalPrice = Number(params['totalPrice']) || 0;
      this.advance = Number(params['advance']) || 0;
      this.balance = Number((this.totalPrice - this.advance).toFixed(2));

      if (this.reservationId) {
        this.reservationService.getSummary(this.reservationId).subscribe({
          next: (summary: any) => {
            if (!summary) return;
            this.courtName = summary.court?.name || summary.courtName || this.courtName;
            this.establishmentName = summary.complex?.name || summary.complexName || this.establishmentName;
            this.establishmentAddress = summary.complex?.location || summary.complexAddress || this.establishmentAddress;
            this.date = summary.reservationDate || this.date;
            this.startTime = summary.startTime || this.startTime;
            this.endTime = summary.endTime || this.endTime;
            this.totalPrice = summary.totalPrice ?? this.totalPrice;
            this.advance = summary.advanceRequired ?? this.advance;
            this.balance = summary.pendingBalance ?? this.balance;
          },
        });
      }
    });
  }

  goReservations(): void {
    this.router.navigate(['/my-reservations']);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}