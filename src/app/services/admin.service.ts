import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Court } from '../models/court.model';

export interface KpiSummary {
  totalRevenue: number;
  totalReservations: number;
  completedReservations: number;
  cancelledReservations: number;
  pendingReceivables: number;
  averageTicket: number;
  occupancyRate: number;
}

export interface RevenueReport {
  totalRevenue: number;
  advancePaymentsTotal: number;
  finalPaymentsTotal: number;
  byPaymentMethod: {
    CASH: number;
    QR: number;
  };
  byCourt: {
    courtId: number;
    courtName: string;
    totalAmount: number;
    count: number;
  }[];
}

export interface StaffItem {
  id: string;
  email: string;
  name: string;
  phone: string;
  ci: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface CreateStaffDto {
  email: string;
  password: string;
  name: string;
  phone: string;
  ci: string;
}

export interface CourtScheduleItem {
  id?: number;
  courtId: number;
  dayOfWeek?: number;
  specificDate?: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface CashShiftAuditItem {
  shiftId: number;
  secretaryId: string;
  secretaryName: string;
  date: string;
  openedAt: string;
  closedAt: string;
  totalCollected: number;
  totalCash: number;
  totalQr: number;
  totalDeclaredCash: number;
  difference: number;
  hasDiscrepancy: boolean;
  notes?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/admin`;

  // === ANALYTICS ===
  getKpiSummary(): Observable<KpiSummary> {
    return this.http.get<KpiSummary>(`${this.baseUrl}/analytics/kpi-summary`);
  }

  getRevenueReport(filters?: { startDate?: string; endDate?: string; courtId?: number }): Observable<RevenueReport> {
    let params = new HttpParams();
    if (filters?.startDate) params = params.set('startDate', filters.startDate);
    if (filters?.endDate) params = params.set('endDate', filters.endDate);
    if (filters?.courtId) params = params.set('courtId', filters.courtId.toString());
    return this.http.get<RevenueReport>(`${this.baseUrl}/analytics/revenue`, { params });
  }

  getPendingBalances(courtId?: number): Observable<any[]> {
    let params = new HttpParams();
    if (courtId) params = params.set('courtId', courtId.toString());
    return this.http.get<any[]>(`${this.baseUrl}/analytics/pending-balances`, { params });
  }

  getCourtOccupancy(startDate?: string, endDate?: string): Observable<any[]> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get<any[]>(`${this.baseUrl}/analytics/court-occupancy`, { params });
  }

  getPeakHours(courtId?: number): Observable<any[]> {
    let params = new HttpParams();
    if (courtId) params = params.set('courtId', courtId.toString());
    return this.http.get<any[]>(`${this.baseUrl}/analytics/peak-hours`, { params });
  }

  getCourtPerformance(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/analytics/court-performance`);
  }

  // === COMPLEXES ===
  createComplex(payload: {
    name: string;
    address: string;
    phone?: string;
    openingTime: string;
    closingTime: string;
    cancellationPolicy?: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/complexes`, payload);
  }

  updateComplex(
    id: number,
    payload: {
      name?: string;
      address?: string;
      phone?: string;
      openingTime?: string;
      closingTime?: string;
      cancellationPolicy?: string;
    },
  ): Observable<any> {
    return this.http.put(`${this.baseUrl}/complexes/${id}`, payload);
  }

  toggleComplex(id: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/complexes/${id}/toggle`, {});
  }

  updateBusinessInfo(payload: {
    businessName: string;
    taxId: string;
    address: string;
    phone: string;
    email: string;
    primaryColor?: string;
  }): Observable<any> {
    return this.http.put(`${this.baseUrl}/business-info`, payload);
  }

  uploadComplexQr(complexId: number, paymentQrUrl: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/complexes/${complexId}/qr`, { paymentQrUrl });
  }

  // === COURTS ===
  getAllCourts(): Observable<Court[]> {
    return this.http.get<Court[]>(`${this.baseUrl}/courts`);
  }

  createCourt(payload: {
    complexId: number;
    name: string;
    courtType: string;
    pricePerHour: number;
    images?: string[];
    sportType?: string;
    surfaceType?: string;
    hasLighting?: boolean;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/courts`, payload);
  }

  updateCourt(id: number, payload: Partial<any>): Observable<any> {
    return this.http.put(`${this.baseUrl}/courts/${id}`, payload);
  }

  updateCourtPrice(id: number, pricePerHour: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/courts/${id}/price`, { pricePerHour });
  }

  toggleCourt(id: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/courts/${id}/toggle`, {});
  }

  scheduleMaintenance(
    courtId: number,
    payload: { startDatetime: string; endDatetime: string; reason: string },
  ): Observable<any> {
    return this.http.post(`${this.baseUrl}/courts/${courtId}/incidents`, payload);
  }

  registerImmediateIncident(
    courtId: number,
    payload: { reason: string; durationHours: number },
  ): Observable<any> {
    return this.http.post(`${this.baseUrl}/courts/${courtId}/incidents/immediate`, payload);
  }

  // === SCHEDULES ===
  setWeeklySchedules(
    courtId: number,
    schedules: { dayOfWeek: number; openTime: string; closeTime: string; isClosed: boolean }[],
  ): Observable<CourtScheduleItem[]> {
    const payload = schedules.filter(day => !day.isClosed).map(day => ({
      dayOfWeek: day.dayOfWeek === 0 ? 7 : day.dayOfWeek,
      openTime: day.openTime.slice(0, 5),
      closeTime: day.closeTime.slice(0, 5),
    }));
    return this.http.put<CourtScheduleItem[]>(`${this.baseUrl}/courts/${courtId}/schedules/weekly`, { schedules: payload });
  }

  setSpecialSchedule(
    courtId: number,
    payload: { specificDate: string; openTime: string; closeTime: string },
  ): Observable<CourtScheduleItem> {
    return this.http.post<CourtScheduleItem>(`${this.baseUrl}/courts/${courtId}/schedules/special`, payload);
  }

  getCourtSchedules(courtId: number): Observable<CourtScheduleItem[]> {
    return this.http.get<CourtScheduleItem[]>(`${this.baseUrl}/courts/${courtId}/schedules`);
  }

  // === STAFF (SECRETARIAS) ===
  listStaff(): Observable<StaffItem[]> {
    return this.http.get<StaffItem[]>(`${this.baseUrl}/staff`);
  }

  createStaff(payload: CreateStaffDto): Observable<StaffItem> {
    return this.http.post<StaffItem>(`${this.baseUrl}/staff`, payload);
  }

  updateStaffStatus(id: string, status: 'ACTIVE' | 'INACTIVE'): Observable<StaffItem> {
    return this.http.patch<StaffItem>(`${this.baseUrl}/staff/${id}/status`, { status });
  }

  // === RESERVATIONS & CALENDAR MASTER ===
  getAllReservations(filters?: {
    date?: string;
    courtId?: number;
    complexId?: number;
    status?: string;
    clientId?: string;
  }): Observable<any[]> {
    let params = new HttpParams();
    if (filters?.date) params = params.set('date', filters.date);
    if (filters?.courtId) params = params.set('courtId', filters.courtId.toString());
    if (filters?.complexId) params = params.set('complexId', filters.complexId.toString());
    if (filters?.status) params = params.set('status', filters.status);
    if (filters?.clientId) params = params.set('clientId', filters.clientId);
    return this.http.get<any[]>(`${this.baseUrl}/reservations`, { params });
  }

  getMasterCalendar(date?: string): Observable<any> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    return this.http.get(`${this.baseUrl}/calendar-master`, { params });
  }

  // === CASH SHIFTS AUDIT ===
  auditCashShifts(filters?: {
    startDate?: string;
    endDate?: string;
    secretaryId?: string;
  }): Observable<CashShiftAuditItem[]> {
    let params = new HttpParams();
    if (filters?.startDate) params = params.set('startDate', filters.startDate);
    if (filters?.endDate) params = params.set('endDate', filters.endDate);
    if (filters?.secretaryId) params = params.set('secretaryId', filters.secretaryId);
    return this.http.get<CashShiftAuditItem[]>(`${this.baseUrl}/analytics/cash-shifts`, { params });
  }
}
