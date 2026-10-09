import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, switchMap, from } from 'rxjs';
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
  private router = inject(Router);
  private readonly baseUrl = environment.apiUrl;

  createTemporal(data: CreateReservationRequest): Observable<TemporalReservationOutput> {
    return this.http.post<TemporalReservationOutput>(`${this.baseUrl}/reservations`, data);
  }

  navigateToReservation(path: '/payment' | '/booking-confirmation' | '/booking-flow', id: string): Observable<boolean> {
    return this.http.get<{ token: string }>(this.baseUrl + '/reservations/' + id + '/route-token').pipe(
      switchMap(result => from(this.router.navigate([path], { queryParams: { token: result.token } }))),
    );
  }

  resolveRoute(token: string): Observable<ReservationSummary> {
    return this.http.post<ReservationSummary>(this.baseUrl + '/reservations/resolve-route', { token });
  }

  getDetail(id: string): Observable<any> {
    return this.http.get(this.baseUrl + '/reservations/' + id);
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
