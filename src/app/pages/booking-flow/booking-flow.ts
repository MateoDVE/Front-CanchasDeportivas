import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
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

    this.route.queryParams.subscribe((params) => {
      this.reservationId = params['reservationId'] || '';
      this.date = params['date'] || this.date;
      this.startTime = params['startTime'] || this.startTime;
      this.endTime = params['endTime'] || this.endTime;
      this.duration = Number(params['duration']) || 1;
      this.totalPrice = Number(params['totalPrice']) || 80;
      this.advance = Number(params['advance']) || Number((this.totalPrice * 0.25).toFixed(2));

      const courtId = Number(params['courtId']);
      if (!Number.isInteger(courtId) || courtId < 1) { this.loadError = 'Selecciona una cancha para continuar.'; return; }
      this.courtService.getCourtById(courtId).subscribe({
        next: (court) => {
          this.court = court;
          this.complexService.getActiveComplexes().subscribe({next: (complexes) => {
            const found = complexes.find((c) => c.id === court.complexId);
            if (found) {
              this.establishment = found;
            } else { this.loadError = "El complejo no está disponible."; }
          }, error: () => { this.loadError = "No se pudo cargar el complejo."; }});
        },
        error: () => { this.loadError = "No se pudo cargar la cancha."; }
      });
    });
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
    this.router.navigate(['/payment'], {
      queryParams: {
        reservationId: this.reservationId,
        courtId: this.court.id,
        complexId: this.court.complexId,
        date: this.date,
        startTime: this.startTime,
        endTime: this.getEndTime(),
        duration: this.duration,
        totalPrice: this.totalPrice,
        advance: this.advance,
        clientName: this.form.name,
        clientPhone: this.form.phone,
        clientEmail: this.form.email,
      },
    });
  }

  goBack(): void {
    this.router.navigate(this.court ? ['/court-detail', this.court.id] : ['/courts']);
  }
}