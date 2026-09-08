export type CourtType = 'Futsal' | 'Wally' | 'Racket' | 'Padel' | string;

export interface Court {
  id: number;
  complexId: number;
  name: string;
  courtType: CourtType;
  sportType?: string; // alias para compatibilidad
  type?: string; // alias para compatibilidad de vistas
  pricePerHour: number;
  isActive: boolean;
  description?: string;
  images: string[];
  features?: string[];
  surface?: string;
  surfaceType?: string;
  hasLighting?: boolean;
  maxPlayers?: number;
}

export interface SlotAvailability {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  status: 'AVAILABLE' | 'OCCUPIED' | 'TEMPORAL_HOLD' | 'BLOCKED';
}

export interface CourtAvailability {
  courtId: number;
  courtName: string;
  date: string;
  dayOfWeek: number;
  isOpen: boolean;
  openTime: string | null;
  closeTime: string | null;
  slots: SlotAvailability[];
}
