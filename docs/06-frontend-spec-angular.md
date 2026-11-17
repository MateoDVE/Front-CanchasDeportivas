# 💻 Especificación Técnica del Frontend (Angular 20)

Esta guía detalla la arquitectura, estándares de diseño de componentes, gestión de estado reactivo con **Signals** y organización de vistas en **Angular 20** para los tres portales del sistema: **Cliente**, **Secretaria** y **Administrador**.

---

## 1. Stack y Principios de Diseño Frontend

- **Framework**: Angular 20 (Arquitectura Standalone estricta, sin `NgModule`).
- **Reactividad**: Angular Signals (`signal`, `computed`, `effect`) para un flujo de datos unidireccional y predecible sin sobrecarga de suscripciones RxJS innecesarias.
- **Enrutamiento**: Carga perezosa (*Lazy Loading*) de componentes standalone protegidos por `CanActivateFn`.
- **Estilos**: SCSS modular, diseño responsivo móvil-primero para clientes y adaptable a pantallas de escritorio para el personal operativo y gerencial.

---

## 2. Estructura de Carpetas en `FrontCanchasDeportivas/src/app`

```
src/app/
├── core/                           # Servicios globales singleton y configuración
│   ├── auth/                       # AuthService, token storage, user signal
│   ├── guards/                     # auth.guard.ts, role.guard.ts
│   ├── interceptors/               # jwt.interceptor.ts, error.interceptor.ts
│   └── services/                   # api-client.service.ts, notification.service.ts
│
├── shared/                         # Componentes y pipes reusables en toda la app
│   ├── components/
│   │   ├── countdown-timer/        # Temporizador de 5 minutos con alertas visuales
│   │   ├── receipt-uploader/       # Arrastrar y soltar comprobantes con previsualización
│   │   ├── status-badge/           # Badges de colores por estado de reserva y pago
│   │   └── modal-dialog/           # Diálogos modales accesibles
│   └── pipes/
│       ├── boliviano-currency.pipe.ts  # Formato: "Bs 100.00"
│       └── time-range.pipe.ts          # Formato: "08:30 - 09:30"
│
└── features/                       # Módulos funcionales organizados por rol
    ├── auth/                       # Login, registro y verificación de email
    │   ├── login.component.ts
    │   ├── register.component.ts
    │   └── verify-email.component.ts
    │
    ├── client/                     # Portal del Cliente (Móvil / Web)
    │   ├── complexes/              # Catálogo de complejos y canchas
    │   ├── availability/           # Calendario interactivo y selector de horas
    │   ├── checkout/               # Resumen, visualización de QR y subida de comprobante
    │   └── my-reservations/        # Próximas reservas, historial y detalles
    │
    ├── secretary/                  # Portal de la Secretaria / Cajera (Operativo)
    │   ├── operational-board/      # Panel del día (reservas activas, pendientes)
    │   ├── manual-booking/         # Registro de reservas presenciales / WhatsApp
    │   ├── payment-validation/     # Bandeja de revisión de comprobantes QR
    │   ├── check-in/               # Búsqueda rápida, cobro de saldo final y pase a cancha
    │   ├── incidents/              # Reubicación de clientes por canchas cerradas
    │   └── cash-close/             # Arqueo de efectivo y cierre formal de turno
    │
    └── admin/                      # Portal Administrativo / Propietario
        ├── dashboard/              # Métricas clave, horarios pico y canchas vacías
        ├── complexes-admin/        # Gestión de complejos y carga de QR
        ├── courts-admin/           # Configuración de canchas y tarifas por hora
        ├── schedules-admin/        # Horarios semanales y días especiales
        └── staff-admin/            # Gestión de cuentas de secretarias
```

---

## 3. Manejo de Estado con Angular Signals

Para evitar la complejidad de librerías externas de estado, el frontend utiliza Signals en servicios dedicados de vista (*Component Store Pattern*).

### Ejemplo: Gestión del Flujo de Reserva Temporal y Timer

```typescript
// src/app/features/client/checkout/booking-state.service.ts
import { Injectable, signal, computed } from '@angular/core';

export interface BookingState {
  reservationId: string | null;
  courtName: string;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  advanceRequired: number;
  expiresAt: Date | null;
  status: 'IDLE' | 'TEMPORAL' | 'PENDING_VALIDATION' | 'EXPIRED';
}

@Injectable({ providedIn: 'root' })
export class BookingStateService {
  private state = signal<BookingState>({
    reservationId: null,
    courtName: '',
    date: '',
    startTime: '',
    endTime: '',
    totalPrice: 0,
    advanceRequired: 0,
    expiresAt: null,
    status: 'IDLE',
  });

  // Selectores calculados (Computed Signals)
  readonly reservation = computed(() => this.state());
  readonly pendingBalance = computed(() => this.state().totalPrice - this.state().advanceRequired);
  readonly isExpired = computed(() => this.state().status === 'EXPIRED');

  setTemporalReservation(reservation: any): void {
    this.state.set({
      reservationId: reservation.id,
      courtName: reservation.courtName,
      date: reservation.date,
      startTime: reservation.startTime,
      endTime: reservation.endTime,
      totalPrice: reservation.totalPrice,
      advanceRequired: reservation.advanceRequired,
      expiresAt: new Date(reservation.expiresAt),
      status: 'TEMPORAL',
    });
  }

  markReceiptUploaded(): void {
    this.state.update((current) => ({
      ...current,
      status: 'PENDING_VALIDATION',
    }));
  }

  markExpired(): void {
    this.state.update((current) => ({
      ...current,
      status: 'EXPIRED',
    }));
  }
}
```

---

## 4. Componente Clave: Temporizador de 5 Minutos (`CountdownTimerComponent`)

Este componente asegura el cumplimiento visual y reactivo de la regla de bloqueo de 5 minutos (**HU-CLI-12** y **HU-SEC-11**):

```typescript
// src/app/shared/components/countdown-timer/countdown-timer.component.ts
import { Component, input, output, signal, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-countdown-timer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="timer-container" [class.urgent]="secondsLeft() < 60">
      <span class="icon">⏱️</span>
      <div class="time-display">
        <p class="label">Tiempo restante para pagar anticipo:</p>
        <p class="countdown">{{ formattedTime() }}</p>
      </div>
    </div>
  `,
  styleUrls: ['./countdown-timer.component.scss'],
})
export class CountdownTimerComponent implements OnDestroy {
  targetDate = input.required<Date>();
  expired = output<void>();

  secondsLeft = signal<number>(0);
  private intervalId: any;

  formattedTime = () => {
    const total = this.secondsLeft();
    if (total <= 0) return '00:00';
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  constructor() {
    effect(() => {
      const target = this.targetDate();
      this.startCountdown(target);
    });
  }

  private startCountdown(target: Date): void {
    clearInterval(this.intervalId);
    this.updateSeconds(target);

    this.intervalId = setInterval(() => {
      this.updateSeconds(target);
    }, 1000);
  }

  private updateSeconds(target: Date): void {
    const diff = Math.floor((target.getTime() - Date.now()) / 1000);
    if (diff <= 0) {
      this.secondsLeft.set(0);
      clearInterval(this.intervalId);
      this.expired.emit();
    } else {
      this.secondsLeft.set(diff);
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }
}
```

---

## 5. Control de Acceso por Roles (Guards de Angular)

```typescript
// src/app/core/guards/role.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const currentUser = authService.currentUser();

    if (!currentUser) {
      router.navigate(['/auth/login']);
      return false;
    }

    if (allowedRoles.includes(currentUser.role)) {
      return true;
    }

    // Redireccionar al panel que le corresponde
    if (currentUser.role === 'SECRETARIA') router.navigate(['/secretary']);
    else if (currentUser.role === 'ADMIN') router.navigate(['/admin']);
    else router.navigate(['/client']);

    return false;
  };
};
```

---

## 6. Configuración de Rutas Principales (`app.routes.ts`)

```typescript
// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'client', pathMatch: 'full' },

  // Módulo de Autenticación
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },

  // Portal Cliente
  {
    path: 'client',
    loadChildren: () => import('./features/client/client.routes').then((m) => m.CLIENT_ROUTES),
  },

  // Portal Secretaria / Cajera
  {
    path: 'secretary',
    canActivate: [roleGuard(['SECRETARIA', 'ADMIN'])],
    loadChildren: () => import('./features/secretary/secretary.routes').then((m) => m.SECRETARY_ROUTES),
  },

  // Portal Administrador / Propietario
  {
    path: 'admin',
    canActivate: [roleGuard(['ADMIN'])],
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },

  { path: '**', redirectTo: 'client' },
];
```
