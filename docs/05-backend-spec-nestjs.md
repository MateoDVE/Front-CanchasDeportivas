# ⚙️ Especificación Técnica del Backend (NestJS)

Esta guía detalla la implementación del backend con **NestJS 11**, estructurado por capas y gobernado por los principios **SOLID**. Provee lineamientos para módulos, DTOs, casos de uso, filtros de excepción y la conexión con **Supabase**.

---

## 1. Módulos del Sistema

El backend se organiza en los siguientes módulos de dominio:

```
src/
├── common/                     # Componentes transversales
│   ├── decorators/             # @Roles(), @CurrentUser()
│   ├── filters/                # DomainExceptionFilter
│   ├── guards/                 # JwtAuthGuard, RolesGuard
│   ├── interceptors/           # TransformResponseInterceptor, LoggingInterceptor
│   └── supabase/               # SupabaseModule y SupabaseClient provider
│
└── modules/
    ├── auth/                   # Autenticación, JWT, registro y verificación (HU-CLI-01..03, HU-SEC-01, HU-ADM-01)
    ├── users/                  # Gestión de clientes y personal interno (HU-ADM-02)
    ├── complexes/              # Complejos deportivos y QR (HU-CLI-04, HU-ADM-03..05, HU-ADM-24..25)
    ├── courts/                 # Canchas, tarifas e incidentes (HU-CLI-05..07, HU-ADM-06..12)
    ├── schedules/              # Horarios regulares y especiales (HU-ADM-13..14)
    ├── reservations/           # Motor de reservas, bloqueo 5 min y calendario (HU-CLI-08..13, HU-SEC-03..06, HU-SEC-11..12)
    ├── payments/               # Anticipos, comprobantes, validación y saldos (HU-CLI-14..17, HU-SEC-07..10, HU-SEC-13..16)
    ├── cash-shifts/            # Control de caja, arqueo y cierre (HU-SEC-25..26, HU-ADM-19)
    └── analytics/              # Métricas, horarios pico y ocupación (HU-ADM-17..18, HU-ADM-20..23)
```

---

## 2. Implementación de una Funcionalidad por Capas (Ejemplo Canónico)

A continuación se muestra el ciclo de vida completo de una petición (`Crear Reserva Temporal`) atravesando las cuatro capas.

### A. Capa de Dominio (Pure TypeScript)

#### 1. Entidad de Dominio
```typescript
// src/modules/reservations/domain/entities/reservation.entity.ts
export class Reservation {
  constructor(
    public readonly id: string,
    public readonly clientId: string,
    public readonly courtId: number,
    public readonly reservationDate: string,
    public readonly startTime: string,
    public readonly endTime: string,
    public readonly pricePerHour: number,
    public readonly totalPrice: number,
    public readonly advanceRequired: number,
    private _status: ReservationStatus,
    public readonly expiresAt: Date | null,
    public readonly createdBy: string,
    public readonly parentReservationId?: string,
    public cancellationReason?: string,
  ) {}

  public static createTemporal(props: {
    clientId: string;
    courtId: number;
    date: string;
    startTime: string;
    endTime: string;
    pricePerHour: number;
    durationHours: number;
    createdBy: string;
  }): Reservation {
    if (props.durationHours < 1 || !Number.isInteger(props.durationHours)) {
      throw new InvalidReservationDurationException('La duración debe ser de al menos 1 hora y en bloques enteros.');
    }

    const totalPrice = Number((props.durationHours * props.pricePerHour).toFixed(2));
    const advanceRequired = Number((totalPrice * 0.25).toFixed(2));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos de bloqueo

    return new Reservation(
      crypto.randomUUID(),
      props.clientId,
      props.courtId,
      props.date,
      props.startTime,
      props.endTime,
      props.pricePerHour,
      totalPrice,
      advanceRequired,
      ReservationStatus.TEMPORAL,
      expiresAt,
      props.createdBy,
    );
  }

  get status(): ReservationStatus {
    return this._status;
  }

  public markAsPendingValidation(): void {
    if (this._status !== ReservationStatus.TEMPORAL) {
      throw new DomainException('Solo una reserva temporal puede pasar a pendiente de validación.');
    }
    this._status = ReservationStatus.PENDING_VALIDATION;
  }

  public confirm(): void {
    this._status = ReservationStatus.CONFIRMED;
  }
}
```

#### 2. Puerto de Repositorio (Interface de Dominio)
```typescript
// src/modules/reservations/domain/repositories/reservation.repository.interface.ts
export interface IReservationRepository {
  findById(id: string): Promise<Reservation | null>;
  save(reservation: Reservation): Promise<void>;
  findConflicting(courtId: number, date: string, start: string, end: string): Promise<Reservation[]>;
  updateStatus(id: string, status: ReservationStatus, reason?: string): Promise<void>;
}
```

---

### B. Capa de Aplicación (Caso de Uso)

```typescript
// src/modules/reservations/application/use-cases/create-temporal-reservation.use-case.ts
@Injectable()
export class CreateTemporalReservationUseCase {
  constructor(
    @Inject('IReservationRepository')
    private readonly reservationRepo: IReservationRepository,
    @Inject('ICourtRepository')
    private readonly courtRepo: ICourtRepository,
  ) {}

  async execute(input: CreateTemporalReservationInput): Promise<ReservationOutputDto> {
    // 1. Validar cancha
    const court = await this.courtRepo.findById(input.courtId);
    if (!court || !court.isActive) {
      throw new CourtNotFoundException(`La cancha ${input.courtId} no está disponible.`);
    }

    // 2. Verificar traslapes en fecha y horario
    const conflicts = await this.reservationRepo.findConflicting(
      input.courtId,
      input.date,
      input.startTime,
      input.endTime,
    );

    if (conflicts.length > 0) {
      throw new CourtSlotOccupiedException('El horario seleccionado ya se encuentra ocupado o bloqueado.');
    }

    // 3. Crear entidad de Dominio aplicando reglas matemáticas
    const reservation = Reservation.createTemporal({
      clientId: input.clientId,
      courtId: input.courtId,
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      pricePerHour: court.pricePerHour,
      durationHours: input.durationHours,
      createdBy: input.clientId,
    });

    // 4. Persistir a través de la abstracción
    await this.reservationRepo.save(reservation);

    return ReservationMapper.toOutput(reservation);
  }
}
```

---

### C. Capa de Infraestructura (Adaptador de Supabase)

```typescript
// src/modules/reservations/infrastructure/repositories/supabase-reservation.repository.ts
@Injectable()
export class SupabaseReservationRepository implements IReservationRepository {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
  ) {}

  async save(reservation: Reservation): Promise<void> {
    const { error } = await this.supabase.from('reservations').upsert({
      id: reservation.id,
      client_id: reservation.clientId,
      court_id: reservation.courtId,
      reservation_date: reservation.reservationDate,
      start_time: reservation.startTime,
      end_time: reservation.endTime,
      price_per_hour: reservation.pricePerHour,
      total_price: reservation.totalPrice,
      advance_required: reservation.advanceRequired,
      status: reservation.status,
      expires_at: reservation.expiresAt ? reservation.expiresAt.toISOString() : null,
      created_by: reservation.createdBy,
      parent_reservation_id: reservation.parentReservationId || null,
      cancellation_reason: reservation.cancellationReason || null,
    });

    if (error) {
      throw new DatabaseException(`Error al persistir la reserva: ${error.message}`);
    }
  }

  async findConflicting(courtId: number, date: string, start: string, end: string): Promise<Reservation[]> {
    // Consulta reservas activas que se traslapen en horario
    const now = new Date().toISOString();
    const { data, error } = await this.supabase
      .from('reservations')
      .select('*')
      .eq('court_id', courtId)
      .eq('reservation_date', date)
      .not('status', 'in', '("CANCELLED","EXPIRED","NO_SHOW")')
      .lt('start_time', end)
      .gt('end_time', start);

    if (error) throw new DatabaseException(error.message);

    // Filtrar temporales que ya hayan expirado en memoria si no corrió el cron
    return (data || [])
      .filter((row) => !(row.status === 'TEMPORAL' && new Date(row.expires_at) < new Date()))
      .map(ReservationMapper.toDomain);
  }
}
```

---

### D. Capa de Presentación (Controlador y DTO)

#### 1. DTO de Petición con Validaciones
```typescript
// src/modules/reservations/presentation/dtos/create-reservation.request.dto.ts
export class CreateReservationRequestDto {
  @IsInt()
  @IsPositive()
  courtId: number;

  @IsDateString()
  date: string; // Formato YYYY-MM-DD

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'El formato de hora debe ser HH:mm' })
  startTime: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'El formato de hora debe ser HH:mm' })
  endTime: string;

  @IsInt()
  @Min(1)
  durationHours: number;
}
```

#### 2. Controlador NestJS
```typescript
// src/modules/reservations/presentation/controllers/reservations.controller.ts
@Controller('api/v1/reservations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReservationsController {
  constructor(
    private readonly createTemporalReservationUseCase: CreateTemporalReservationUseCase,
  ) {}

  @Post()
  @Roles('CLIENTE')
  @HttpCode(HttpStatus.CREATED)
  async createTemporal(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateReservationRequestDto,
  ): Promise<ReservationResponseDto> {
    return this.createTemporalReservationUseCase.execute({
      ...dto,
      clientId: user.id,
    });
  }
}
```

---

## 3. Manejo Global de Excepciones y Filtro HTTP

Para evitar acoplar el Dominio con decoradores de NestJS (`@HttpException`), las excepciones de dominio son clases normales de TypeScript. Un filtro global las intercepta y mapea al código HTTP correspondiente:

```typescript
// src/common/filters/domain-exception.filter.ts
@Catch()
export class GlobalDomainExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof CourtSlotOccupiedException) {
      return response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        error: 'Conflict',
        message: exception.message,
      });
    }

    if (exception instanceof InvalidReservationDurationException) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: exception.message,
      });
    }

    if (exception instanceof EntityNotFoundException) {
      return response.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        error: 'Not Found',
        message: exception.message,
      });
    }

    // Default 500
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
    });
  }
}
```

---

## 4. Tarea Programada de Limpieza de Bloqueos de 5 Minutos

```typescript
// src/modules/reservations/infrastructure/cron/expiration.cron.ts
@Injectable()
export class ReservationExpirationCron {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient,
    private readonly logger: Logger,
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async releaseExpiredReservations(): Promise<void> {
    const { data, error } = await this.supabase
      .from('reservations')
      .update({ status: 'EXPIRED' })
      .eq('status', 'TEMPORAL')
      .lt('expires_at', new Date().toISOString())
      .select('id');

    if (error) {
      this.logger.error(`Error en cron de expiración: ${error.message}`);
    } else if (data && data.length > 0) {
      this.logger.log(`Liberadas ${data.length} reservas temporales expiradas.`);
    }
  }
}
```

---

## 5. Variables de Entorno Requeridas (`.env`)

```env
# Servidor
PORT=3000
NODE_ENV=development

# Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-secreta
SUPABASE_ANON_KEY=tu-anon-key-publica

# Autenticación JWT
JWT_SECRET=clave-secreta-para-firmar-jwt-del-backend
JWT_EXPIRATION=7d

# Storage Buckets
STORAGE_RECEIPTS_BUCKET=payment-receipts
STORAGE_QRS_BUCKET=complex-qrs
```
