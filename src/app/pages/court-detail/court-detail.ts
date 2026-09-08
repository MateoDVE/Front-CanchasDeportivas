import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { CourtService } from '../../services/court.service';
import { ComplexService } from '../../services/complex.service';
import { ReservationService } from '../../services/reservation.service';
import { AuthService } from '../../services/auth.service';
import { Court, CourtAvailability } from '../../models/court.model';
import { Complex } from '../../models/complex.model';

@Component({
  selector: 'app-court-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './court-detail.html',
  styleUrls: ['./court-detail.scss'],
})
export class CourtDetailComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private courtService = inject(CourtService);
  private complexService = inject(ComplexService);
  private reservationService = inject(ReservationService);
  private authService = inject(AuthService);

  court: Court | null = null;
  establishment: Complex | null = null;
  serverAvailability: CourtAvailability | null = null;

  today = new Date();
  calendarMonth = this.today.getMonth();
  calendarYear = this.today.getFullYear();
  selectedDate = this.formatDate(this.today);
  selectedStart: string | null = null;

  duration = 1;
  imgIndex = 0;

  loading = true;
  bookingLoading = false;
  bookingError = '';

  months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  timeSlots: string[] = [];

  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('id');
    const courtId = Number(rawId);
    if (!Number.isInteger(courtId) || courtId < 1) { this.loading = false; this.bookingError = "La cancha solicitada no existe."; return; }

    this.loadCourt(courtId);
  }

  loadCourt(courtId: number): void {
    this.loading = true;

    this.courtService.getCourtById(courtId).subscribe({
      next: (court) => {
        this.court = court;
        this.loadEstablishment(court.complexId);
        this.loadAvailability(court.id, this.selectedDate);
      },
      error: () => {
        this.loading = false;
        this.bookingError = "No se pudo cargar la cancha solicitada.";
      },
    });
  }

  loadEstablishment(complexId: number): void {
    this.complexService.getActiveComplexes().subscribe({ next: (complexes) => {
      const found = complexes.find((c) => c.id === complexId) || null;
      if (found) {
        this.establishment = {
          ...found,
          address: found.location,
          city: found.city,
          phone: found.contactInfo,
        };
      }
      this.loading = false;
      if (!found) this.bookingError = "El complejo no está disponible.";
    }, error: () => { this.loading = false; this.bookingError = "No se pudo cargar el complejo."; } });
  }

  loadAvailability(courtId: number, date: string): void {
    this.serverAvailability = null;
    this.timeSlots = [];
    this.selectedStart = null;
    this.courtService.getCourtAvailability(courtId, date).subscribe({
      next: (avail) => {
        if (date !== this.selectedDate) return;
        this.serverAvailability = avail;
        if (avail && Array.isArray(avail.slots) && avail.slots.length > 0) {
          this.timeSlots = avail.slots
            .filter((s) => s && s.startTime)
            .map((s) => s.startTime);
        }
      },
      error: (err) => {
        console.error('Error al cargar disponibilidad:', err);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/courts']);
  }

  get availability(): Record<string, 'available' | 'occupied' | 'blocked'> {
    const map: Record<string, 'available' | 'occupied' | 'blocked'> = {};
    if (this.serverAvailability && Array.isArray(this.serverAvailability.slots)) {
      for (const slot of this.serverAvailability.slots) {
        if (!slot || !slot.startTime) continue;
        if (slot.status === 'AVAILABLE') {
          map[slot.startTime] = 'available';
        } else if (slot.status === 'TEMPORAL_HOLD') {
          map[slot.startTime] = 'blocked';
        } else {
          map[slot.startTime] = 'occupied';
        }
      }
    }
    return map;
  }

  get totalPrice(): number {
    return (this.court?.pricePerHour || 0) * this.duration;
  }

  get advance(): number {
    return Number((this.totalPrice * 0.25).toFixed(2));
  }

  get pendingBalance(): number {
    return Number((this.totalPrice - this.advance).toFixed(2));
  }

  get calendarDays(): (number | null)[] {
    const firstDay = new Date(this.calendarYear, this.calendarMonth, 1).getDay();
    const totalDays = new Date(this.calendarYear, this.calendarMonth + 1, 0).getDate();

    return [
      ...Array(firstDay).fill(null),
      ...Array.from({ length: totalDays }, (_, i) => i + 1),
    ];
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  selectDay(day: number): void {
    const date = new Date(this.calendarYear, this.calendarMonth, day, 12);
    if (this.isPast(day)) return;

    this.selectedDate = this.formatDate(date);
    this.selectedStart = null;
    if (this.court) {
      this.loadAvailability(this.court.id, this.selectedDate);
    }
  }

  isSelectedDay(day: number): boolean {
    const date = new Date(this.calendarYear, this.calendarMonth, day, 12);
    return this.selectedDate === this.formatDate(date);
  }

  isPast(day: number): boolean {
    const date = new Date(this.calendarYear, this.calendarMonth, day, 12);
    const today = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate(), 12);
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

  getEndTime(start: string, duration: number): string {
    if (!start) return '11:00';
    const [hours, minutes] = start.split(':').map(Number);
    const totalMinutes = (hours || 0) * 60 + (minutes || 0) + duration * 60;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;

    return (
      String(endHours).padStart(2, '0') + ':' + String(endMinutes).padStart(2, '0')
    );
  }

  timeToMinutes(time: string): number {
    if (!time) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return (hours || 0) * 60 + (minutes || 0);
  }

  canBookSlot(start: string): boolean {
    if (!this.availability[start] || this.availability[start] !== 'available') {
      return false;
    }

    const startMinutes = this.timeToMinutes(start);
    const endMinutes = startMinutes + this.duration * 60;
    const closingMinutes = this.timeToMinutes(this.serverAvailability?.closeTime || '00:00');

    if (endMinutes > closingMinutes) {
      return false;
    }

    const slotsToCheck = this.timeSlots.filter((slot) => {
      const slotMinutes = this.timeToMinutes(slot);
      return slotMinutes >= startMinutes && slotMinutes < endMinutes;
    });

    return slotsToCheck.every((slot) => this.availability[slot] === 'available');
  }

  setDuration(value: number): void {
    if (!Number.isInteger(value) || value < 1 || value > 3) return;
    this.duration = value;
    this.selectedStart = null;
  }

  selectTime(time: string): void {
    if (!this.canBookSlot(time)) {
      return;
    }

    this.selectedStart = this.selectedStart === time ? null : time;
  }

  selectImage(index: number): void {
    this.imgIndex = index;
  }

  get formattedSelectedDate(): string {
    const date = new Date(this.selectedDate + 'T12:00:00');
    return date.toLocaleDateString('es-BO', { day: 'numeric', month: 'short' });
  }

  get formattedLongDate(): string {
    const date = new Date(this.selectedDate + 'T12:00:00');
    return date.toLocaleDateString('es-BO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }

  getSlotStatusText(slot: string): string {
    if (this.serverAvailability?.slots.find(s => s.startTime === slot)?.status === 'BLOCKED') return 'Mantenimiento';
    const status = this.availability[slot];
    if (status === 'occupied') return 'Ocupado';
    if (status === 'blocked') return 'En reserva';
    if (!this.canBookSlot(slot)) return 'No disp.';

    return this.getEndTime(slot, this.duration);
  }

  continueBooking(): void {
    if (!this.selectedStart || !this.court) {
      return;
    }

    if (!this.canBookSlot(this.selectedStart)) {
      this.selectedStart = null;
      return;
    }

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: `/court-detail/${this.court.id}` },
      });
      return;
    }

    this.bookingLoading = true;
    this.bookingError = '';

    const endTime = this.getEndTime(this.selectedStart, this.duration);

    this.reservationService
      .createTemporal({
        courtId: this.court.id,
        date: this.selectedDate,
        startTime: this.selectedStart,
        endTime: endTime,
      })
      .subscribe({
        next: (res) => {
          this.bookingLoading = false;
          this.router.navigate(['/payment'], {
            queryParams: {
              reservationId: res.reservationId,
              courtId: this.court!.id,
              complexId: this.court!.complexId,
              date: res.reservationDate,
              startTime: res.startTime,
              endTime: res.endTime,
              duration: res.durationHours,
              totalPrice: res.totalPrice,
              advance: res.advanceRequired,
              balance: res.pendingBalance,
              expiresAt: res.expiresAt,
              secondsRemaining: res.secondsRemaining,
            },
          });
        },
        error: (err) => {
          this.bookingLoading = false;
          if (err.error && err.error.message) {
            this.bookingError = Array.isArray(err.error.message)
              ? err.error.message.join(', ')
              : err.error.message;
          } else {
            this.bookingError = 'El horario seleccionado ya no está disponible.';
          }
          this.loadAvailability(this.court!.id, this.selectedDate);
        },
      });
  }
}
