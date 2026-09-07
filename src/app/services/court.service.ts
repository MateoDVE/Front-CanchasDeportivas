import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Court, CourtAvailability, CourtType } from '../models/court.model';

const DEFAULT_IMAGES: Record<string, string[]> = {
  Futsal: [
    'https://images.unsplash.com/photo-1763775468707-573c7cd6b0da?w=800&h=500&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1712325485668-6b6830ba814e?w=800&h=500&fit=crop&auto=format',
  ],
  Wally: [
    'https://images.unsplash.com/photo-1728971121170-2c8bae90d6fb?w=800&h=500&fit=crop&auto=format',
  ],
  Racket: [
    'https://images.unsplash.com/photo-1646649853703-7645147474ba?w=800&h=500&fit=crop&auto=format',
  ],
};

const DEFAULT_DETAILS: Record<string, { surface: string; maxPlayers: number; description: string; features: string[] }> = {
  Futsal: {
    surface: 'Césped sintético / Cemento pulido',
    maxPlayers: 10,
    description: 'Cancha reglamentaria con iluminación LED, vestuarios y graderías.',
    features: ['Iluminación LED', 'Vestuarios', 'Estacionamiento', 'Wifi'],
  },
  Wally: {
    surface: 'Madera flotante',
    maxPlayers: 8,
    description: 'Cancha de wally profesional con paredes alfombradas e iluminación adecuada.',
    features: ['Piso madera', 'Vestidores', 'Lockers'],
  },
  Racket: {
    surface: 'Parquet con muros reglamentarios',
    maxPlayers: 4,
    description: 'Cancha de racket profesional con paredes frontales de alta resistencia y visor posterior.',
    features: ['Paredes de cristal', 'Climatización', 'Camerinos'],
  },
};

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
    const typeKey = court.courtType || 'Futsal';
    const defaults = DEFAULT_DETAILS[typeKey] || DEFAULT_DETAILS['Futsal'];
    const images = DEFAULT_IMAGES[typeKey] || DEFAULT_IMAGES['Futsal'];

    return {
      ...court,
      type: typeKey,
      images: court.images && court.images.length ? court.images : images,
      description: court.description || defaults.description,
      surface: court.surface || defaults.surface,
      maxPlayers: court.maxPlayers || defaults.maxPlayers,
      features: court.features || defaults.features,
    };
  }
}
