import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import {
  reservations,
  courts,
  establishments,
  Reservation,
  Court,
  Establishment
} from '../../data/mock';

@Component({
  selector: 'app-my-reservations',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl:
    './my-reservations.html',

  styleUrls: [
    './my-reservations.scss'
  ]
})
export class MyReservationsComponent {

  activeFilter = 'all';

  showCancelModal = false;

  selectedReservation:
    Reservation | null = null;

  cancelledIds: string[] = [];

  filters = [

    {
      key: 'all',
      label: 'Todas'
    },

    {
      key: 'confirmed',
      label: 'Confirmadas'
    },

    {
      key: 'pending',
      label: 'Pendientes'
    },

    {
      key: 'finished',
      label: 'Finalizadas'
    },

    {
      key: 'cancelled',
      label: 'Canceladas'
    }

  ];

  reservations: Reservation[] =
    reservations;

  courts: Court[] =
    courts;

  establishments: Establishment[] =
    establishments;

  constructor(
    private router: Router
  ) {}

  get visibleReservations(): Reservation[] {

    const updated =
      this.reservations.map(r => {

        if (
          this.cancelledIds.includes(r.id)
        ) {

          return {
            ...r,
            reservationStatus:
              'cancelled' as const
          };
        }

        return r;
      });

    if (
      this.activeFilter === 'all'
    ) {

      return updated;
    }

    return updated.filter(
      r =>
        r.reservationStatus ===
        this.activeFilter
    );
  }

  changeFilter(
    filter: string
  ): void {

    this.activeFilter =
      filter;
  }

  getCourt(
    courtId: string
  ): Court | undefined {

    return this.courts.find(
      c => c.id === courtId
    );
  }

  getEstablishment(
    courtId: string
  ): Establishment | undefined {

    const court =
      this.getCourt(courtId);

    if (!court) {
      return undefined;
    }

    return this.establishments.find(
      e =>
        e.id ===
        court.establishmentId
    );
  }

  getEndTime(
    start: string,
    duration: number
  ): string {

    const [h, m] =
      start.split(':')
        .map(Number);

    const total =
      h * 60 +
      m +
      duration * 60;

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

  openCancel(
    reservation: Reservation
  ): void {

    this.selectedReservation =
      reservation;

    this.showCancelModal =
      true;
  }

  closeModal(): void {

    this.showCancelModal =
      false;

    this.selectedReservation =
      null;
  }

  cancelReservation(): void {

    if (
      this.selectedReservation
    ) {

      this.cancelledIds.push(
        this.selectedReservation.id
      );
    }

    this.closeModal();
  }

  goCourts(): void {

    this.router.navigate([
      '/courts'
    ]);
  }

  goDetail(
    courtId: string
  ): void {

    this.router.navigate([
      '/court-detail',
      courtId
    ]);
  }
}