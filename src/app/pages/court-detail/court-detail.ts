import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

import {
  Court,
  Establishment,
  courts,
  establishments,
  timeSlots,
  getCourtAvailability
} from '../../data/mock';

@Component({
  selector: 'app-court-detail',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './court-detail.html',
  styleUrls: [
    './court-detail.scss'
  ]
})
export class CourtDetailComponent {

  court!: Court;

  establishment!: Establishment;

  selectedDate = '2026-08-20';

  selectedStart: string | null = null;

  duration = 1;

  imgIndex = 0;

  today = new Date('2026-08-19');

  calendarMonth = 7;

  calendarYear = 2026;

  months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre'
  ];

  days = [
    'Dom',
    'Lun',
    'Mar',
    'Mié',
    'Jue',
    'Vie',
    'Sáb'
  ];

  timeSlots = timeSlots;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {

    this.loadCourt();
  }

  loadCourt(): void {

    const courtId =
      this.route.snapshot.paramMap.get('id') ?? 'c-1';

    this.court =
      courts.find(c => c.id === courtId) ??
      courts[0];

    this.establishment =
      establishments.find(
        e => e.id === this.court.establishmentId
      ) ??
      establishments[0];
  }

  goBack(): void {

    this.router.navigate([
      '/courts'
    ]);
  }

  get totalPrice(): number {

    return this.court.pricePerHour *
      this.duration;
  }

  get advance(): number {

    return this.totalPrice * 0.25;
  }

  get availability() {

    return getCourtAvailability(
      this.court.id,
      this.selectedDate
    );
  }

  get calendarDays(): (number | null)[] {

    const firstDay =
      new Date(
        this.calendarYear,
        this.calendarMonth,
        1
      ).getDay();

    const total =
      new Date(
        this.calendarYear,
        this.calendarMonth + 1,
        0
      ).getDate();

    return [
      ...Array(firstDay).fill(null),

      ...Array.from(
        { length: total },
        (_, i) => i + 1
      )
    ];
  }

  selectDay(day: number): void {

    const date =
      new Date(
        this.calendarYear,
        this.calendarMonth,
        day
      );

    if (date < this.today) {
      return;
    }

    this.selectedDate =
      this.formatDate(date);

    this.selectedStart = null;
  }

  formatDate(date: Date): string {

    const year =
      date.getFullYear();

    const month =
      String(date.getMonth() + 1)
        .padStart(2, '0');

    const day =
      String(date.getDate())
        .padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  isSelectedDay(day: number): boolean {

    const date =
      new Date(
        this.calendarYear,
        this.calendarMonth,
        day
      );

    return this.selectedDate ===
      this.formatDate(date);
  }

  isPast(day: number): boolean {

    return new Date(
      this.calendarYear,
      this.calendarMonth,
      day
    ) < this.today;
  }

  nextMonth(): void {

    if (this.calendarMonth === 11) {

      this.calendarMonth = 0;

      this.calendarYear++;

    } else {

      this.calendarMonth++;
    }
  }

  prevMonth(): void {

    if (this.calendarMonth === 0) {

      this.calendarMonth = 11;

      this.calendarYear--;

    } else {

      this.calendarMonth--;
    }
  }

  getEndTime(
    start: string,
    hours: number
  ): string {

    const [h, m] =
      start.split(':').map(Number);

    const total =
      h * 60 +
      m +
      hours * 60;

    return (
      String(
        Math.floor(total / 60)
      ).padStart(2, '0')
      +
      ':'
      +
      String(
        total % 60
      ).padStart(2, '0')
    );
  }

  selectTime(time: string): void {

    if (
      this.availability[time] !==
      'available'
    ) {
      return;
    }

    this.selectedStart =
      this.selectedStart === time
        ? null
        : time;
  }

  continueBooking(): void {

    if (!this.selectedStart) {
      return;
    }

    this.router.navigate(
      ['/booking-flow'],
      {
        queryParams: {

          courtId: this.court.id,

          date: this.selectedDate,

          startTime:
            this.selectedStart,

          duration:
            this.duration,

          totalPrice:
            this.totalPrice,

          advance:
            this.advance
        }
      }
    );
  }
}