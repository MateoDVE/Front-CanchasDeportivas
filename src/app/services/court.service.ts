import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Court, CourtAvailability, CourtType } from '../models/court.model';

@Injectable({
  providedIn: 'root',
})
export class CourtService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getAllCourts(): Observable<Court[]> {
    return this.http.get<Court[]>(`${this.baseUrl}/courts`).pipe(
      map((courts) => courts.map((c) => this.enrichCourt(c))),
    );
  }

  getCourtById(id: number): Observable<Court> {
    return this.http.get<Court>(`${this.baseUrl}/courts/${id}`).pipe(
      map((c) => this.enrichCourt(c)),
    );
  }

  getCourtsByComplex(complexId: number): Observable<Court[]> {
    return this.http
      .get<Court[]>(`${this.baseUrl}/complexes/${complexId}/courts`)
      .pipe(map((courts) => courts.map((c) => this.enrichCourt(c))));
  }

  getCourtAvailability(courtId: number, date: string): Observable<CourtAvailability> {
    return this.http.get<CourtAvailability>(
      `${this.baseUrl}/courts/${courtId}/availability`,
      { params: { date } },
    );
  }

  private enrichCourt(court: Court): Court {
    return { ...court, type: court.courtType, images: court.images || [], features: court.features || [] };
  }
}
