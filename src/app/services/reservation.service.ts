import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CreateReservationRequest,
  TemporalReservationOutput,
  ReservationSummary,
  ClientReservationsGrouped,
} from '../models/reservation.model';

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  createTemporal(data: CreateReservationRequest): Observable<TemporalReservationOutput> {
    return this.http.post<TemporalReservationOutput>(`${this.baseUrl}/reservations`, data);
  }

  getSummary(id: string): Observable<ReservationSummary> {
    return this.http.get<ReservationSummary>(`${this.baseUrl}/reservations/${id}/summary`);
  }

  getStatus(id: string): Observable<{ id: string; status: string; expiresAt: Date | null; isExpired: boolean }> {
    return this.http.get<{ id: string; status: string; expiresAt: Date | null; isExpired: boolean }>(
      `${this.baseUrl}/reservations/${id}/status`,
    );
  }

  getMyReservations(): Observable<ClientReservationsGrouped> {
    return this.http.get<ClientReservationsGrouped>(`${this.baseUrl}/client/my-reservations`);
  }
}
