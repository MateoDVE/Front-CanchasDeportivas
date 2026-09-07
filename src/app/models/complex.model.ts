export interface Complex {
  id: number;
  name: string;
  location: string;
  contactInfo: string;
  paymentQrUrl: string | null;
  isActive: boolean;
  // Compatibilidad con templates
  address?: string;
  city?: string;
  phone?: string;
  openingTime?: string;
  closingTime?: string;
  cancellationPolicy?: string;
}

export interface ComplexQr {
  complexId: number;
  qrImageUrl: string | null;
}
