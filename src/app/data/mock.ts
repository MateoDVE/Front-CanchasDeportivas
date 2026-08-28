export type Page =
  | 'landing' | 'login' | 'register'
  | 'courts' | 'court-detail' | 'booking' | 'payment' | 'confirmation'
  | 'my-reservations'
  | 'admin-dashboard' | 'admin-calendar' | 'admin-courts'
  | 'admin-schedules' | 'admin-reservations' | 'admin-payments'
  | 'admin-clients' | 'admin-reports';

export interface Court {
  id: string;
  name: string;
  type: 'Futsal' | 'Vóley' | 'Racket' | 'Pádel' | 'Básquet';
  establishmentId: string;
  description: string;
  pricePerHour: number;
  status: 'active' | 'inactive' | 'blocked';
  images: string[];
  features: string[];
  surface: string;
  maxPlayers: number;
}

export interface Establishment {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  image: string;
  courts: string[];
  courtTypes: string[];
  priceFrom: number;
  rating: number;
}

export interface Reservation {
  id: string;
  courtId: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  date: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  totalPrice: number;
  advanceAmount: number;
  advancePaid: number;

  paymentStatus:
    | 'pending'
    | 'advance-pending-verification'
    | 'advance-verified'
    | 'paid'
    | 'rejected';

  reservationStatus:
    | 'confirmed'
    | 'pending'
    | 'cancelled'
    | 'finished'
    | 'no-show';

  paymentMethod?: string;
  paymentReference?: string;
  paymentDate?: string;
  notes?: string;
}

export const establishments: Establishment[] = [
  {
    id: 'est-1',
    name: 'SportCenter Norte',
    address: 'Av. Libertad 1250',
    city: 'La Paz',
    phone: '+591 2 234-5678',
    image: 'https://images.unsplash.com/photo-1775993167393-f2add1f8eec2?w=600&h=400&fit=crop&auto=format',
    courts: ['c-1', 'c-2', 'c-3'],
    courtTypes: ['Futsal', 'Vóley', 'Racket'],
    priceFrom: 60,
    rating: 4.8,
  },
  {
    id: 'est-2',
    name: 'Arena Sports Club',
    address: 'Calle Murillo 890',
    city: 'Cochabamba',
    phone: '+591 4 456-7890',
    image: 'https://images.unsplash.com/photo-1770085057829-97e7a45e1916?w=600&h=400&fit=crop&auto=format',
    courts: ['c-4', 'c-5'],
    courtTypes: ['Futsal', 'Pádel'],
    priceFrom: 75,
    rating: 4.6,
  },
  {
    id: 'est-3',
    name: 'Complejo Deportivo Sur',
    address: 'Av. Villazón 340',
    city: 'Santa Cruz',
    phone: '+591 3 678-9012',
    image: 'https://images.unsplash.com/photo-1768554630751-6448593749eb?w=600&h=400&fit=crop&auto=format',
    courts: ['c-6', 'c-7'],
    courtTypes: ['Básquet', 'Vóley'],
    priceFrom: 55,
    rating: 4.5,
  }
];

export const courts: Court[] = [
  {
    id: 'c-1',
    name: 'Cancha Futsal A',
    type: 'Futsal',
    establishmentId: 'est-1',
    description: 'Cancha de futsal profesional con piso de cemento pulido, iluminación LED y tribunas para espectadores.',
    pricePerHour: 80,
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1763775468707-573c7cd6b0da?w=800&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1712325485668-6b6830ba814e?w=800&h=500&fit=crop&auto=format'
    ],
    features: [
      'Iluminación LED',
      'Vestuarios',
      'Estacionamiento',
      'Wifi',
      'Cafetería'
    ],
    surface: 'Cemento pulido',
    maxPlayers: 10
  },
  {
    id: 'c-2',
    name: 'Cancha Vóley 1',
    type: 'Vóley',
    establishmentId: 'est-1',
    description: 'Cancha de vóley con piso de madera flotante, red oficial y buena iluminación.',
    pricePerHour: 60,
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1728971121170-2c8bae90d6fb?w=800&h=500&fit=crop&auto=format'
    ],
    features: ['Piso madera', 'Vestidores', 'Locker'],
    surface: 'Madera flotante',
    maxPlayers: 12
  },
  {
    id: 'c-3',
    name: 'Cancha Racket Pro',
    type: 'Racket',
    establishmentId: 'est-1',
    description: 'Cancha de racket con paredes de cristal, iluminación profesional y piso antideslizante.',
    pricePerHour: 70,
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1646649853703-7645147474ba?w=800&h=500&fit=crop&auto=format',
      'https://images.unsplash.com/photo-1658723826297-fe4d1b1e6600?w=800&h=500&fit=crop&auto=format'
    ],
    features: [
      'Paredes vidrio',
      'Iluminación LED',
      'Aire acondicionado',
      'Tribuna'
    ],
    surface: 'Madera barnizada',
    maxPlayers: 4
  },
  {
    id: 'c-4',
    name: 'Futsal Premium',
    type: 'Futsal',
    establishmentId: 'est-2',
    description: 'Cancha de futsal techada con gramado sintético de última generación.',
    pricePerHour: 100,
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1762025721967-76b6280f8e04?w=800&h=500&fit=crop&auto=format'
    ],
    features: [
      'Gramado sintético',
      'Techada',
      'Iluminación 4K',
      'Vestuarios premium'
    ],
    surface: 'Gramado sintético',
    maxPlayers: 10
  },
  {
    id: 'c-5',
    name: 'Cancha Pádel 1',
    type: 'Pádel',
    establishmentId: 'est-2',
    description: 'Cancha de pádel panorámica con paredes de cristal y equipamiento oficial.',
    pricePerHour: 90,
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1612534847738-b3af9bc31f0c?w=800&h=500&fit=crop&auto=format'
    ],
    features: [
      'Paredes panorámicas',
      'Equipamiento incluido',
      'Aire acondicionado'
    ],
    surface: 'Hierba artificial',
    maxPlayers: 4
  },
  {
    id: 'c-6',
    name: 'Cancha Básquet',
    type: 'Básquet',
    establishmentId: 'est-3',
    description: 'Cancha de básquetbol reglamentaria con tableros oficiales y piso parquet.',
    pricePerHour: 65,
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1768842407056-6c64fe629c2e?w=800&h=500&fit=crop&auto=format'
    ],
    features: [
      'Piso parquet',
      'Tableros oficiales',
      'Gradas',
      'Wifi'
    ],
    surface: 'Parquet',
    maxPlayers: 10
  },
  {
    id: 'c-7',
    name: 'Vóley Playa',
    type: 'Vóley',
    establishmentId: 'est-3',
    description: 'Cancha de vóley playa con arena importada y ambiente tropical.',
    pricePerHour: 55,
    status: 'active',
    images: [
      'https://images.unsplash.com/photo-1771909715670-083a55b7f354?w=800&h=500&fit=crop&auto=format'
    ],
    features: [
      'Arena importada',
      'Iluminación nocturna',
      'Red oficial'
    ],
    surface: 'Arena',
    maxPlayers: 12
  }
];

export const reservations: Reservation[] = [
  {
    id: 'R-001',
    courtId: 'c-1',
    clientId: 'u-1',
    clientName: 'Carlos Mendoza',
    clientPhone: '+591 70123456',
    date: '2026-08-20',
    startTime: '09:00',
    endTime: '10:00',
    durationHours: 1,
    totalPrice: 80,
    advanceAmount: 20,
    advancePaid: 20,
    paymentStatus: 'advance-verified',
    reservationStatus: 'confirmed',
    paymentMethod: 'QR',
    paymentReference: 'TRX-20240820-001',
    paymentDate: '2026-08-19'
  },
  {
    id: 'R-002',
    courtId: 'c-3',
    clientId: 'u-2',
    clientName: 'Ana Quiroga',
    clientPhone: '+591 72345678',
    date: '2026-08-20',
    startTime: '10:00',
    endTime: '11:00',
    durationHours: 1,
    totalPrice: 70,
    advanceAmount: 17.5,
    advancePaid: 17.5,
    paymentStatus: 'advance-pending-verification',
    reservationStatus: 'pending',
    paymentMethod: 'Transferencia',
    paymentReference: 'TRF-2024-445'
  },
  {
    id: 'R-003',
    courtId: 'c-2',
    clientId: 'u-3',
    clientName: 'Luis Torrez',
    clientPhone: '+591 75987654',
    date: '2026-08-20',
    startTime: '11:00',
    endTime: '12:00',
    durationHours: 1,
    totalPrice: 60,
    advanceAmount: 15,
    advancePaid: 0,
    paymentStatus: 'pending',
    reservationStatus: 'pending'
  },
  {
    id: 'R-004',
    courtId: 'c-1',
    clientId: 'u-4',
    clientName: 'María Flores',
    clientPhone: '+591 68456123',
    date: '2026-08-21',
    startTime: '14:00',
    endTime: '16:00',
    durationHours: 2,
    totalPrice: 160,
    advanceAmount: 40,
    advancePaid: 40,
    paymentStatus: 'advance-verified',
    reservationStatus: 'confirmed',
    paymentMethod: 'QR',
    paymentReference: 'TRX-20240821-002',
    paymentDate: '2026-08-20'
  },
  {
    id: 'R-005',
    courtId: 'c-4',
    clientId: 'u-1',
    clientName: 'Carlos Mendoza',
    clientPhone: '+591 70123456',
    date: '2026-08-19',
    startTime: '18:00',
    endTime: '19:00',
    durationHours: 1,
    totalPrice: 100,
    advanceAmount: 25,
    advancePaid: 25,
    paymentStatus: 'paid',
    reservationStatus: 'finished',
    paymentMethod: 'QR',
    paymentReference: 'TRX-20240819-005',
    paymentDate: '2026-08-18'
  },
  {
    id: 'R-006',
    courtId: 'c-3',
    clientId: 'u-5',
    clientName: 'Pedro Quispe',
    clientPhone: '+591 71234567',
    date: '2026-08-22',
    startTime: '08:00',
    endTime: '09:00',
    durationHours: 1,
    totalPrice: 70,
    advanceAmount: 17.5,
    advancePaid: 0,
    paymentStatus: 'pending',
    reservationStatus: 'confirmed'
  }
];

export const timeSlots = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
  '22:00'
];

export function getCourtAvailability(
  courtId: string,
  date: string
): Record<string, 'available' | 'occupied' | 'blocked'> {

  const result: Record<
    string,
    'available' | 'occupied' | 'blocked'
  > = {};

  timeSlots.forEach(slot => {
    result[slot] = 'available';
  });

  if (courtId === 'c-1' && date === '2026-08-20') {
    result['09:00'] = 'occupied';
    result['13:00'] = 'occupied';
    result['14:00'] = 'occupied';
    result['20:00'] = 'blocked';
    result['21:00'] = 'blocked';
  }

  if (courtId === 'c-1' && date === '2026-08-21') {
    result['14:00'] = 'occupied';
    result['15:00'] = 'occupied';
    result['10:00'] = 'occupied';
  }

  if (courtId === 'c-3' && date === '2026-08-20') {
    result['10:00'] = 'occupied';
    result['16:00'] = 'occupied';
    result['17:00'] = 'occupied';
  }

  return result;
}

export const adminKPIs = {
  reservationsToday: 8,
  pendingReservations: 5,
  dailyIncome: 620,
  pendingAdvances: 3,
  availableCourts: 5,
  occupiedCourts: 2
};

export const weeklyData = [
  { day: 'Lun', reservations: 12, income: 840 },
  { day: 'Mar', reservations: 8, income: 560 },
  { day: 'Mié', reservations: 15, income: 1050 },
  { day: 'Jue', reservations: 10, income: 700 },
  { day: 'Vie', reservations: 18, income: 1260 },
  { day: 'Sáb', reservations: 24, income: 1680 },
  { day: 'Dom', reservations: 20, income: 1400 }
];

export const courtTypeDistribution = [
  { type: 'Futsal', count: 45, color: '#059669' },
  { type: 'Vóley', count: 28, color: '#2563eb' },
  { type: 'Racket', count: 32, color: '#d97706' },
  { type: 'Pádel', count: 19, color: '#7c3aed' },
  { type: 'Básquet', count: 14, color: '#dc2626' }
];