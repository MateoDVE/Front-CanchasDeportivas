import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

import {
  courts,
  establishments,
  getCourtAvailability,
  timeSlots
} from '../../data/mock';

@Component({
  selector: 'app-court-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './court-detail.html',
  styleUrls: ['./court-detail.scss']
})
export class CourtDetailComponent implements OnInit {

  court: any;
  establishment: any;

  selectedDate = '2026-08-20';
  selectedStart: string | null = null;

  duration = 1;
  imgIndex = 0;

  today = new Date('2026-08-19T12:00:00');

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
  ) {}

  ngOnInit(): void {

    const courtId =
      this.route.snapshot.paramMap.get('id') || 'c-1';

    this.court =
      courts.find(c => c.id === courtId) ||
      courts[0];

    this.establishment =
      establishments.find(
        e => e.id === this.court.establishmentId
      ) ||
      establishments[0];
  }

  goBack(): void {
    this.router.navigate(['/courts']);
  }

  get availability(): Record<
  string,
  'available' | 'occupied' | 'blocked'> {
  return getCourtAvailability(
    this.court.id,
    this.selectedDate
    );
  }

  get totalPrice(): number {
    return this.court.pricePerHour * this.duration;
  }

  get advance(): number {
    return this.totalPrice * 0.25;
  }

  get pendingBalance(): number {
    return this.totalPrice - this.advance;
  }

  get calendarDays(): (number | null)[] {

    const firstDay =
      new Date(
        this.calendarYear,
        this.calendarMonth,
        1
      ).getDay();

    const totalDays =
      new Date(
        this.calendarYear,
        this.calendarMonth + 1,
        0
      ).getDate();

    return [
      ...Array(firstDay).fill(null),
      ...Array.from(
        { length: totalDays },
        (_, i) => i + 1
      )
    ];
  }

  formatDate(date: Date): string {

    const year = date.getFullYear();

    const month =
      String(date.getMonth() + 1)
        .padStart(2, '0');

    const day =
      String(date.getDate())
        .padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  selectDay(day: number): void {

    const date =
      new Date(
        this.calendarYear,
        this.calendarMonth,
        day,
        12
      );

    if (this.isPast(day)) {
      return;
    }

    this.selectedDate =
      this.formatDate(date);

    this.selectedStart = null;
  }

  isSelectedDay(day: number): boolean {

    const date =
      new Date(
        this.calendarYear,
        this.calendarMonth,
        day,
        12
      );

    return (
      this.selectedDate ===
      this.formatDate(date)
    );
  }

  isPast(day: number): boolean {

    const date =
      new Date(
        this.calendarYear,
        this.calendarMonth,
        day,
        12
      );

    const today =
      new Date(
        this.today.getFullYear(),
        this.today.getMonth(),
        this.today.getDate(),
        12
      );

    return date < today;
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
    duration: number
  ): string {

    const [hours, minutes] =
      start.split(':').map(Number);

    const totalMinutes =
      hours * 60 +
      minutes +
      duration * 60;

    const endHours =
      Math.floor(totalMinutes / 60);

    const endMinutes =
      totalMinutes % 60;

    return (
      String(endHours).padStart(2, '0') +
      ':' +
      String(endMinutes).padStart(2, '0')
    );
  }

  timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);

    return hours * 60 + minutes;
  }

  canBookSlot(start: string): boolean {

  if (!this.availability[start]) {
    return false;
  }

  const startMinutes = this.timeToMinutes(start);

  const endMinutes =
    startMinutes + this.duration * 60;

  const closingMinutes = 23 * 60;

  if (endMinutes > closingMinutes) {
    return false;
  }

  const slotsToCheck = this.timeSlots.filter(slot => {

    const slotMinutes =
      this.timeToMinutes(slot);

    return (
      slotMinutes >= startMinutes &&
      slotMinutes < endMinutes
    );
  });

    return slotsToCheck.every(
      slot =>
        this.availability[slot] === 'available'
    );
  }

  setDuration(value: number): void {

    this.duration = value;
    this.selectedStart = null;
  }

  selectTime(time: string): void {

  if (!this.canBookSlot(time)) {
    return;
  }

  this.selectedStart =
    this.selectedStart === time
      ? null
      : time;
  }

  selectImage(index: number): void {
    this.imgIndex = index;
  }

  get formattedSelectedDate(): string {

    const date =
      new Date(
        this.selectedDate + 'T12:00:00'
      );

    return date.toLocaleDateString(
      'es-BO',
      {
        day: 'numeric',
        month: 'short'
      }
    );
  }

  get formattedLongDate(): string {

    const date =
      new Date(
        this.selectedDate + 'T12:00:00'
      );

    return date.toLocaleDateString(
      'es-BO',
      {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      }
    );
  }

  getSlotStatusText(slot: string): string {

  const status = this.availability[slot];

  if (status === 'occupied') {
    return 'Ocupado';
  }

  if (status === 'blocked') {
    return 'Bloqueado';
  }

  if (!this.canBookSlot(slot)) {
    return 'No disponible';
  }

  return this.getEndTime(
    slot,
    this.duration
  );
  }

  continueBooking(): void {

  if (!this.selectedStart) {
    return;
  }

  // Validación final de seguridad
  if (!this.canBookSlot(this.selectedStart)) {
    this.selectedStart = null;
    return;
  }

  this.router.navigate(
    ['/booking-flow'],
    {
      queryParams: {
        courtId: this.court.id,
        date: this.selectedDate,
        startTime: this.selectedStart,
        duration: this.duration,
        totalPrice: this.totalPrice,
        advance: this.advance
      }
    }
  );
 }
}