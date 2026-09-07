import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReservationService } from '../../services/reservation.service';
import { AuthService } from '../../services/auth.service';
import { ClientReservationItem } from '../../models/reservation.model';

@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-reservations.html',
  styleUrls: ['./my-reservations.scss'],
})
export class MyReservationsComponent implements OnInit {
  private router = inject(Router);
  private reservationService = inject(ReservationService);
  authService = inject(AuthService);

  activeFilter = 'all';
  loading = true;
  selectedReservation: ClientReservationItem | null = null;
  showCancelModal = false;

  user = computed(() => this.authService.currentUser());
  userInitials = computed(() => {
    const u = this.user();
    if (!u || !u.name) return 'U';
    const parts = u.name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  });

  filters = [
    { key: 'all', label: 'Todas' },
    { key: 'confirmed', label: 'Confirmadas' },
    { key: 'pending', label: 'En validación' },
    { key: 'finished', label: 'Finalizadas' },
    { key: 'cancelled', label: 'Canceladas / Expiradas' },
  ];

  reservations: ClientReservationItem[] = [];

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/my-reservations' } });
      return;
    }
    this.loadReservations();
  }

  loadReservations(): void {
    this.loading = true;
    this.reservationService.getMyReservations().subscribe({
      next: (grouped) => {
        this.reservations = [...grouped.upcoming, ...grouped.history];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar reservas:', err);
        this.loading = false;
      },
    });
  }

  get totalCount(): number {
    return this.reservations.length;
  }

  get activeCount(): number {
    return this.reservations.filter((r) =>
      ['CONFIRMED', 'PENDING_VALIDATION', 'TEMPORAL'].includes(r.status),
    ).length;
  }

  get historyCount(): number {
    return this.reservations.filter(
      (r) => !['CONFIRMED', 'PENDING_VALIDATION', 'TEMPORAL'].includes(r.status),
    ).length;
  }

  get visibleReservations(): ClientReservationItem[] {
    return this.reservations.filter((r) => {
      if (this.activeFilter === 'all') return true;
      if (this.activeFilter === 'confirmed') return r.status === 'CONFIRMED';
      if (this.activeFilter === 'pending')
        return r.status === 'PENDING_VALIDATION' || r.status === 'TEMPORAL';
      if (this.activeFilter === 'finished')
        return r.status === 'COMPLETED' || r.status === 'FINISHED';
      if (this.activeFilter === 'cancelled')
        return r.status === 'CANCELLED' || r.status === 'EXPIRED';
      return true;
    });
  }

  changeFilter(filter: string): void {
    this.activeFilter = filter;
  }

  formatCode(id: string): string {
    if (!id) return '';
    return id.length > 8 ? id.substring(0, 8).toUpperCase() : id.toUpperCase();
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T12:00:00');
    if (isNaN(date.getTime())) return dateStr;
    const formatted = date.toLocaleDateString('es-BO', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  }

  getStatusBadge(status: string): { label: string; bg: string; text: string; lineColor: string } {
    switch (status) {
      case 'CONFIRMED':
        return { label: 'Confirmada', bg: 'bg-emerald-100', text: 'text-emerald-800', lineColor: '#10b981' };
      case 'PENDING_VALIDATION':
        return { label: 'En validación', bg: 'bg-amber-100', text: 'text-amber-800', lineColor: '#f59e0b' };
      case 'TEMPORAL':
        return { label: 'Bloqueo temporal', bg: 'bg-blue-100', text: 'text-blue-800', lineColor: '#3b82f6' };
      case 'CANCELLED':
        return { label: 'Cancelada', bg: 'bg-rose-100', text: 'text-rose-800', lineColor: '#f43f5e' };
      case 'EXPIRED':
        return { label: 'Expirada', bg: 'bg-slate-100', text: 'text-slate-600', lineColor: '#cbd5e1' };
      case 'COMPLETED':
      case 'FINISHED':
        return { label: 'Finalizada', bg: 'bg-purple-100', text: 'text-purple-800', lineColor: '#a855f7' };
      default:
        return { label: status, bg: 'bg-slate-100', text: 'text-slate-700', lineColor: '#94a3b8' };
    }
  }

  newReservation(): void {
    this.router.navigate(['/courts']);
  }

  goDetail(courtId: number): void {
    this.router.navigate(['/court-detail', courtId]);
  }
}