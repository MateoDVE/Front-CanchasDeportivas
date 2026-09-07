import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Complex, ComplexQr } from '../models/complex.model';

@Injectable({
  providedIn: 'root',
})
export class ComplexService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/complexes`;

  getActiveComplexes(): Observable<Complex[]> {
    return this.http.get<Complex[]>(this.apiUrl);
  }

  getComplexQr(id: number): Observable<ComplexQr> {
    return this.http.get<ComplexQr>(`${this.apiUrl}/${id}/qr`);
  }
}
