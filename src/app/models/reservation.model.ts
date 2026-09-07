export interface CreateReservationRequest {
  courtId: number;
  date: string;
  startTime: string;
  endTime: string;
}

export interface TemporalReservationOutput {
  reservationId: string;
  clientId: string;
  courtId: number;
  reservationDate: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  pricePerHour: number;
  totalPrice: number;
  advanceRequired: number;
  pendingBalance: number;
  status: string;
  expiresAt: string | Date | null;
  secondsRemaining: number;
}

export interface ReservationSummary {
  reservationId: string;
  clientId: string;
  courtId: number;
  courtName: string;
  complexName: string;
  complexAddress: string;
  complexQrUrl: string | null;
  reservationDate: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  pricePerHour: number;
  totalPrice: number;
  advanceRequired: number;
  pendingBalance: number;
  status: string;
  expiresAt: string | Date | null;
  isExpired: boolean;
}

export interface ClientReservationItem {
  id: string;
  courtId: number;
  courtName: string;
  reservationDate: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  advanceRequired: number;
  pendingBalance: number;
  status: string;
  expiresAt: string | Date | null;
  secondsRemaining: number;
  createdAt: string | Date;
}

export interface ClientReservationsGrouped {
  upcoming: ClientReservationItem[];
  history: ClientReservationItem[];
}