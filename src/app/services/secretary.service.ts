import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface OperationalCourt {
  courtId: number;
  courtName: string;
  sportType: string;
  pricePerHour: number;
  reservations: {
    id: string;
    startTime: string;
    endTime: string;
    status: string;
    clientName: string;
    clientPhone?: string;
    totalAmount: number;
    advancePaymentAmount: number;
    pendingBalance: number;
    isAuthorized: boolean;
  }[];
}

export interface OperationalBoardOutput {
  date: string;
  courts: OperationalCourt[];
  totalReservations: number;
  confirmedCount: number;
  pendingValidationCount: number;
  completedCount: number;
}

export interface PendingPaymentItem {
  paymentId: number;
  reservationId: string;
  clientName: string;
  clientCi?: string;
  courtName: string;
  complexName: string;
  reservationDate: string;
  startTime: string;
  endTime: string;
  amount: number;
  paymentMethod: string;
  receiptImageUrl: string;
  createdAt: string;
}

export interface ShiftSummaryOutput {
  secretaryId: string;
  date: string;
  totalCollected: number;
  totalCash: number;
  totalQr: number;
  transactionsCount: number;
  payments: {
    id: number;
    amount: number;
    paymentType: string;
    paymentMethod: string;
    createdAt: string;
    reservationId: string;
  }[];
}

export interface ClientSearchResult {
  id: string;
  name: string;
  ci: string;
  phone: string;
  email: string;
}

export interface ManualReservationPayload {
  clientId?: string;
  courtId: number;
  reservationDate: string;
  startTime: string;
  endTime: string;
  origin: 'MANUAL' | 'WHATSAPP';
}

export interface ReschedulePayload {
  newDate: string;
  newStartTime: string;
  newEndTime: string;
  newCourtId?: number;
  reason?: string;
}

export interface FinalPaymentPayload {
  amount: number;
  paymentMethod: 'EFECTIVO' | 'QR' | 'CASH';
}

export interface CloseCashShiftPayload {
  totalDeclaredCash: number;
  notes?: string;
  date?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SecretaryService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/secretary`;
  private readonly apiRoot = environment.apiUrl;

  // HU-SEC-02: Tablero Operativo Diario
  getOperationalBoard(date?: string): Observable<OperationalBoardOutput> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    return this.http.get<OperationalBoardOutput>(`${this.baseUrl}/operational-board`, { params });
  }

  // HU-SEC-03: Búsqueda de reservas
  searchReservations(filters: {
    date?: string;
    courtId?: number;
    complexId?: number;
    status?: string;
    clientId?: string;
  }): Observable<any[]> {
    let params = new HttpParams();
    if (filters.date) params = params.set('date', filters.date);
    if (filters.courtId) params = params.set('courtId', filters.courtId.toString());
    if (filters.complexId) params = params.set('complexId', filters.complexId.toString());
    if (filters.status) params = params.set('status', filters.status);
    if (filters.clientId) params = params.set('clientId', filters.clientId);
    return this.http.get<any[]>(`${this.baseUrl}/reservations`, { params });
  }

  // HU-SEC-11: Reservas Temporales Activas
  getTemporalReservations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/reservations/temporal`);
  }

  // HU-SEC-12: Liberar horario expirado
  releaseExpiredReservation(reservationId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/reservations/${reservationId}/release-expired`, {});
  }

  // HU-SEC-13: Búsqueda rápida de check-in (por CI o ID)
  quickSearch(query: string): Observable<any[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<any[]>(`${this.baseUrl}/checkin/search`, { params });
  }

  // HU-SEC-04: Detalle de reserva
  getReservationDetail(reservationId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/reservations/${reservationId}`);
  }

  // HU-SEC-05 & HU-SEC-06: Crear reserva manual / WhatsApp
  searchClients(query: string): Observable<ClientSearchResult[]> {
    return this.http.get<ClientSearchResult[]>(this.baseUrl + '/clients/search', {
      params: new HttpParams().set('q', query),
    });
  }

  createManualReservation(payload: ManualReservationPayload): Observable<any> {
    return this.http.post(`${this.baseUrl}/reservations/manual`, payload);
  }

  // HU-SEC-16: Autorizar ingreso a cancha
  authorizeEntry(reservationId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/reservations/${reservationId}/authorize-entry`, {});
  }

  // HU-SEC-17: Candidatos No-Show
  getNoShowCandidates(date?: string): Observable<any[]> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    return this.http.get<any[]>(`${this.baseUrl}/reservations/no-show-candidates`, { params });
  }

  // HU-SEC-18: Marcar No-Show
  markNoShow(reservationId: string, reason: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/reservations/${reservationId}/no-show`, { reason });
  }

  // HU-SEC-19: Cancelar reserva
  cancelReservation(reservationId: string, reason: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/reservations/${reservationId}/cancel`, { reason });
  }

  // HU-SEC-20: Reprogramar reserva
  rescheduleReservation(reservationId: string, payload: ReschedulePayload): Observable<any> {
    return this.http.post(`${this.baseUrl}/reservations/${reservationId}/reschedule`, payload);
  }

  // HU-SEC-07 & HU-SEC-08: Pagos pendientes de validación
  getPendingPayments(): Observable<PendingPaymentItem[]> {
    return this.http.get<PendingPaymentItem[]>(`${this.baseUrl}/payments/pending`);
  }

  // HU-SEC-09: Validar anticipo
  validatePayment(paymentId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/payments/${paymentId}/validate`, {});
  }

  // HU-SEC-10: Rechazar comprobante
  rejectPayment(paymentId: number, reason: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/payments/${paymentId}/reject`, { reason });
  }

  // HU-SEC-15: Registrar pago restante (75%)
  registerFinalPayment(reservationId: string, payload: FinalPaymentPayload): Observable<any> {
    const normalizedPayload = {
      ...payload,
      paymentMethod: payload.paymentMethod === 'CASH' ? 'EFECTIVO' : payload.paymentMethod,
    };
    return this.http.post(`${this.baseUrl}/reservations/${reservationId}/final-payment`, normalizedPayload);
  }

  // HU-SEC-21: Registrar excepción de devolución
  registerRefundException(
    reservationId: string,
    payload: { amount: number; reason: string; authorizedBy: string },
  ): Observable<any> {
    return this.http.post(`${this.baseUrl}/reservations/${reservationId}/refund-exception`, payload);
  }

  // HU-SEC-25: Consultar ingresos de la jornada
  getCurrentShiftSummary(date?: string): Observable<ShiftSummaryOutput> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    return this.http.get<ShiftSummaryOutput>(`${this.baseUrl}/shifts/current-summary`, { params });
  }

  // HU-SEC-26: Realizar cierre de caja
  closeShift(payload: CloseCashShiftPayload): Observable<any> {
    return this.http.post(`${this.baseUrl}/shifts/close`, payload);
  }

  // HU-SEC-22 / HU-ADM-12: Reservas afectadas por incidente
  getAffectedReservations(incidentId: number): Observable<any> {
    return this.http.get(`${this.apiRoot}/incidents/${incidentId}/affected-reservations`);
  }

  // HU-SEC-23: Reprogramar por incidente
  rescheduleIncident(
    reservationId: string,
    payload: { newCourtId?: number; newDate: string; newStartTime: string; newEndTime: string },
  ): Observable<any> {
    return this.http.post(`${this.baseUrl}/reservations/${reservationId}/reschedule-incident`, payload);
  }
}
