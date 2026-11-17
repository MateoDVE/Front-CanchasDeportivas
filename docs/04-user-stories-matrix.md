# 🎯 Matriz Completa de Historias de Usuario y Trazabilidad

Este documento consolida las **74 Historias de Usuario (HU)** del sistema, clasificadas por rol de usuario y épicas. Cada historia incluye sus criterios de aceptación originales y su respectivo mapeo técnico hacia Casos de Uso, Endpoints REST y Componentes Frontend.

---

## Índice Rápido
1. [Historias de Usuario — Cliente (25 HUs)](#1-historias-de-usuario--cliente)
2. [Historias de Usuario — Secretaria / Cajera (26 HUs)](#2-historias-de-usuario--secretaria--cajera)
3. [Historias de Usuario — Administrador / Propietario (25 HUs)](#3-historias-de-usuario--administrador--propietario)

---

## 1. Historias de Usuario — Cliente

### Épica 1: Acceso y Cuenta

#### HU-CLI-01 — Registro
- **Historia**: Como cliente, quiero registrarme en la plataforma proporcionando mis datos personales, para poder realizar reservas de canchas.
- **Criterios de Aceptación**:
  1. Debe proporcionar nombre completo, correo electrónico, número de celular y CI.
  2. El sistema valida campos obligatorios completos.
  3. No se permite registrar un correo o CI ya existente.
- **Mapeo Técnico**:
  - *Backend*: `AuthModule` -> `RegisterClientUseCase` | `POST /api/v1/auth/register`
  - *Frontend*: `RegisterComponent` (`features/auth/register`)

#### HU-CLI-02 — Validación de correo electrónico
- **Historia**: Como cliente, quiero validar mi correo electrónico, para garantizar que la cuenta me pertenece y poder utilizar la plataforma.
- **Criterios de Aceptación**:
  1. Envío de mecanismo de validación (código/token) al correo registrado.
  2. El cliente puede completar la validación.
  3. Una cuenta no validada no puede realizar reservas.
  4. Mensaje de confirmación al validar exitosamente.
- **Mapeo Técnico**:
  - *Backend*: `AuthModule` -> `VerifyEmailUseCase` | `POST /api/v1/auth/verify-email`
  - *Frontend*: `VerifyEmailComponent`

#### HU-CLI-03 — Inicio de sesión
- **Historia**: Como cliente, quiero iniciar sesión con mi cuenta, para acceder a las funcionalidades de la plataforma.
- **Criterios de Aceptación**:
  1. Ingreso de correo y contraseña.
  2. Validación de credenciales; acceso si son válidas o mensaje de error si no.
  3. Opción de cerrar sesión y destruir token JWT.
- **Mapeo Técnico**:
  - *Backend*: `AuthModule` -> `LoginUseCase` | `POST /api/v1/auth/login`
  - *Frontend*: `LoginComponent`

---

### Épica 2: Exploración de Canchas

#### HU-CLI-04 — Consultar complejos deportivos
- **Historia**: Como cliente, quiero visualizar los complejos deportivos disponibles, para elegir dónde quiero realizar mi reserva.
- **Criterios de Aceptación**:
  1. Muestra complejos activos con nombre, ubicación y contacto.
  2. Permite seleccionar un complejo y navegar a sus canchas.
- **Mapeo Técnico**:
  - *Backend*: `ComplexesModule` -> `GetActiveComplexesUseCase` | `GET /api/v1/complexes`
  - *Frontend*: `ComplexCatalogComponent`

#### HU-CLI-05 — Consultar canchas
- **Historia**: Como cliente, quiero visualizar las canchas disponibles dentro de un complejo, para elegir la cancha que quiero reservar.
- **Criterios de Aceptación**:
  1. Muestra canchas pertenecientes al complejo seleccionado.
  2. Muestra información básica: nombre, tipo, precio/hora y disponibilidad.
- **Mapeo Técnico**:
  - *Backend*: `CourtsModule` -> `GetCourtsByComplexUseCase` | `GET /api/v1/complexes/:id/courts`
  - *Frontend*: `CourtListComponent`

#### HU-CLI-06 — Consultar tipo de cancha
- **Historia**: Como cliente, quiero identificar el tipo de cada cancha, para elegir una cancha adecuada al deporte que quiero practicar.
- **Criterios de Aceptación**:
  1. Muestra con claridad el tipo (`Futsal`, `Wally`, `Racket`).
  2. Filtrado por tipo de deporte.
- **Mapeo Técnico**:
  - *Backend*: `CourtsModule` -> `GetCourtTypesUseCase` | `GET /api/v1/courts/types`
  - *Frontend*: Filtros en `CourtListComponent`

#### HU-CLI-07 — Consultar precio
- **Historia**: Como cliente, quiero conocer el precio por hora de una cancha, para saber cuánto costará mi reserva.
- **Criterios de Aceptación**:
  1. Muestra precio por hora antes de reservar.
  2. Calcula el precio total estimado según la cantidad de horas elegidas.
- **Mapeo Técnico**:
  - *Backend*: Calculado por `Court` entity / `CalculateReservationCostUseCase`
  - *Frontend*: `CourtDetailComponent` / `PriceSummaryBadge`

---

### Épica 3: Disponibilidad

#### HU-CLI-08 — Consultar disponibilidad por fecha
- **Historia**: Como cliente, quiero consultar la disponibilidad de una cancha para una fecha determinada, para encontrar un horario disponible.
- **Criterios de Aceptación**:
  1. Selección de fecha en calendario.
  2. Muestra horarios disponibles y ocupados (reservados o en mantenimiento).
  3. No permite seleccionar horarios ya ocupados ni canchas inhabilitadas.
- **Mapeo Técnico**:
  - *Backend*: `ReservationsModule` -> `GetCourtAvailabilityUseCase` | `GET /api/v1/courts/:id/availability?date=YYYY-MM-DD`
  - *Frontend*: `CourtCalendarViewComponent`

#### HU-CLI-09 — Consultar disponibilidad mediante calendario
- **Historia**: Como cliente, quiero visualizar la disponibilidad mediante un calendario, para seleccionar fácilmente la fecha y horario que deseo reservar.
- **Criterios de Aceptación**:
  1. Calendario interactivo con vista diaria/semanal.
  2. Franjas horarias coloreadas según estado (disponible / ocupado / bloqueado).
- **Mapeo Técnico**:
  - *Backend*: `ReservationsModule` -> `GetCourtCalendarUseCase` | `GET /api/v1/courts/:id/calendar-month`
  - *Frontend*: `AvailabilityCalendarComponent` (Angular Signals)

#### HU-CLI-10 — Seleccionar horario
- **Historia**: Como cliente, quiero seleccionar un horario disponible, para realizar una reserva.
- **Criterios de Aceptación**:
  1. Solo permite seleccionar franjas libres.
  2. Duración mínima: 1 hora.
  3. No se permiten fracciones de hora (solo múltiplos enteros de 1h).
  4. Se permite inicio no exacto si se preserva duración completa (ej. `08:30 -> 09:30` ✅, `08:00 -> 08:30` ❌).
- **Mapeo Técnico**:
  - *Backend*: Validación de dominio en `TimeSlot.create(start, end)`
  - *Frontend*: `TimeSlotPickerComponent`

---

### Épica 4: Realizar Reserva

#### HU-CLI-11 — Solicitar reserva
- **Historia**: Como cliente, quiero seleccionar una cancha, fecha y horario disponible, para solicitar una reserva.
- **Criterios de Aceptación**:
  1. Cliente autenticado.
  2. Verificación de disponibilidad al momento del clic.
  3. Cálculo automático de costo total y anticipo del 25%.
- **Mapeo Técnico**:
  - *Backend*: `ReservationsModule` -> `CreateTemporalReservationUseCase` | `POST /api/v1/reservations`
  - *Frontend*: `ReservationBookingModal`

#### HU-CLI-12 — Bloqueo temporal del horario
- **Historia**: Como cliente, quiero que el horario seleccionado quede reservado temporalmente mientras realizo el pago del anticipo, para evitar que otra persona lo reserve simultáneamente.
- **Criterios de Aceptación**:
  1. Horario bloqueado temporalmente por 5 minutos exactos (`status = 'TEMPORAL'`).
  2. Ningún otro cliente puede tomar ese horario mientras esté activo.
  3. Cronómetro visible informando el tiempo restante.
  4. Liberación automática si no se paga en 5 minutos.
- **Mapeo Técnico**:
  - *Backend*: `Reservation.expiresAt = now() + 5 min`
  - *Frontend*: `CountdownTimerComponent`

#### HU-CLI-13 — Consultar resumen de reserva
- **Historia**: Como cliente, quiero visualizar un resumen de mi reserva antes de realizar el pago, para verificar que la información sea correcta.
- **Criterios de Aceptación**:
  1. Muestra complejo, cancha, tipo, fecha, hora inicio/fin, duración, precio/h, precio total, anticipo requerido y saldo pendiente.
- **Mapeo Técnico**:
  - *Backend*: `ReservationsModule` -> `GetReservationSummaryUseCase` | `GET /api/v1/reservations/:id/summary`
  - *Frontend*: `BookingSummaryCard`

---

### Épica 5: Anticipo

#### HU-CLI-14 — Consultar anticipo requerido
- **Historia**: Como cliente, quiero conocer el monto del anticipo requerido, para saber cuánto debo pagar para solicitar la reserva.
- **Criterios de Aceptación**:
  1. Anticipo calculado exactamente al 25% del total.
  2. Desglose claro: Total, Anticipo (25%), Saldo (75%).
- **Mapeo Técnico**:
  - *Backend*: Entidad de Dominio `Reservation.calculateAdvance()`
  - *Frontend*: `PaymentBreakdownView`

#### HU-CLI-15 — Realizar pago del anticipo
- **Historia**: Como cliente, quiero realizar el pago del anticipo mediante el QR proporcionado por el establecimiento, para continuar con mi solicitud de reserva.
- **Criterios de Aceptación**:
  1. Visualización del código QR del complejo.
  2. Posibilidad de descargar o escanear QR desde app bancaria del cliente.
  3. Sin integración bancaria directa en V1.
- **Mapeo Técnico**:
  - *Backend*: `ComplexesModule` -> `GetComplexQrUrlUseCase`
  - *Frontend*: `QrDisplayComponent`

#### HU-CLI-16 — Adjuntar comprobante
- **Historia**: Como cliente, quiero adjuntar el comprobante de pago del anticipo, para que la secretaria pueda verificar mi pago.
- **Criterios de Aceptación**:
  1. Subida de imagen (PNG, JPG, PDF) a Supabase Storage.
  2. Se asocia la URL del comprobante al pago de la reserva.
  3. Reserva cambia a `PENDING_VALIDATION` (pausando el timer de expiración).
- **Mapeo Técnico**:
  - *Backend*: `PaymentsModule` -> `UploadReceiptUseCase` | `POST /api/v1/payments/:reservationId/receipt`
  - *Frontend*: `ReceiptUploaderComponent`

#### HU-CLI-17 — Consultar estado del pago
- **Historia**: Como cliente, quiero consultar el estado de mi anticipo, para saber si la secretaria ya verificó mi pago.
- **Criterios de Aceptación**:
  1. Estados visualizables: `Pendiente`, `Comprobante Enviado`, `Validado`, `Rechazado`.
- **Mapeo Técnico**:
  - *Backend*: `PaymentsModule` -> `GetPaymentStatusUseCase` | `GET /api/v1/payments/:reservationId/status`
  - *Frontend*: `PaymentStatusBadge`

---

### Épica 6: Confirmación y Seguimiento

#### HU-CLI-18 — Consultar estado de reserva
- **Historia**: Como cliente, quiero consultar el estado de mi reserva, para saber si está confirmada.
- **Criterios de Aceptación**:
  1. Estados: `Pendiente de Pago`, `Pendiente de Validación`, `Confirmada`, `Cancelada`, `Reprogramada`, `Finalizada`.
- **Mapeo Técnico**:
  - *Backend*: `ReservationsModule` -> `GetReservationStatusUseCase`
  - *Frontend*: `ReservationStatusIndicator`

#### HU-CLI-19 — Consultar mis reservas
- **Historia**: Como cliente, quiero visualizar mis reservas, para consultar mis próximas actividades y reservas anteriores.
- **Criterios de Aceptación**:
  1. Lista dividida en: "Próximas reservas" e "Historial anterior".
  2. Información principal y estado visible en tarjetas.
- **Mapeo Técnico**:
  - *Backend*: `ReservationsModule` -> `GetClientReservationsUseCase` | `GET /api/v1/client/my-reservations`
  - *Frontend*: `MyReservationsListComponent`

#### HU-CLI-20 — Consultar detalle de reserva
- **Historia**: Como cliente, quiero consultar el detalle de una reserva, para conocer toda la información relacionada con ella.
- **Criterios de Aceptación**:
  1. Todos los datos de cancha, horario, montos, estado de reserva y de pago.
- **Mapeo Técnico**:
  - *Backend*: `ReservationsModule` -> `GetReservationDetailUseCase` | `GET /api/v1/reservations/:id`
  - *Frontend*: `ReservationDetailComponent`

---

### Épica 7: Cancelaciones y Reprogramaciones

#### HU-CLI-21 — Solicitar cancelación
- **Historia**: Como cliente, quiero solicitar la cancelación de una reserva, para informar que ya no utilizaré la cancha.
- **Criterios de Aceptación**:
  1. Solicitud de cancelación desde detalle de reserva.
  2. Registro del motivo en `cancellation_reason`.
  3. No asume devolución del anticipo.
- **Mapeo Técnico**:
  - *Backend*: `ReservationsModule` -> `CancelReservationUseCase` | `POST /api/v1/reservations/:id/cancel`
  - *Frontend*: `CancelReservationDialog`

#### HU-CLI-22 — Consultar política de cancelación
- **Historia**: Como cliente, quiero consultar las condiciones de cancelación, para conocer qué sucede con mi anticipo si no asisto.
- **Criterios de Aceptación**:
  1. Texto claro antes de reservar: anticipo NO reembolsable salvo excepción autorizada.
- **Mapeo Técnico**:
  - *Frontend*: `CancellationPolicyModal` / aviso en checkout.

#### HU-CLI-23 — Consultar reprogramación
- **Historia**: Como cliente, quiero conocer si mi reserva puede ser reprogramada, para poder utilizar el anticipo en otra fecha cuando el establecimiento autorice un cambio.
- **Criterios de Aceptación**:
  1. Reprogramación no automática: requiere aprobación de la administración/secretaria.
  2. Muestra datos de la reserva original asociada.
- **Mapeo Técnico**:
  - *Backend*: Lectura de `parent_reservation_id`
  - *Frontend*: `RescheduleInfoView`

---

### Épica 8: Pago Presencial

#### HU-CLI-24 — Consultar saldo pendiente
- **Historia**: Como cliente, quiero conocer el saldo pendiente de mi reserva, para saber cuánto debo pagar al llegar al complejo.
- **Criterios de Aceptación**:
  1. Total, anticipo pagado y saldo pendiente exacto.
  2. Actualización en tiempo real al registrarse el saldo final.
- **Mapeo Técnico**:
  - *Backend*: `ReservationsModule` -> `GetReservationBalanceUseCase`
  - *Frontend*: `PendingBalanceWidget`

#### HU-CLI-25 — Completar pago antes de ingresar
- **Historia**: Como cliente, quiero poder completar el pago restante al llegar al complejo, para poder ingresar a la cancha.
- **Criterios de Aceptación**:
  1. Pago en recepción antes de ingresar.
  2. Actualización de reserva a 100% pagada.
  3. Habilitación de acceso físico.
- **Mapeo Técnico**:
  - *Backend*: `PaymentsModule` -> `RegisterFinalPaymentUseCase` (ejecutado por Secretaria)
  - *Frontend*: Vista de estado `Acceso Habilitado` en la app del cliente.

---

## 2. Historias de Usuario — Secretaria / Cajera

### Épica 1: Acceso y Operación

#### HU-SEC-01 — Iniciar sesión
- **Criterios**: Acceso con credenciales de secretaria; redirección a dashboard operativo; cierre de sesión.
- **Backend**: `AuthModule` -> `LoginUseCase` (rol `SECRETARIA`) | `POST /api/v1/auth/login`
- **Frontend**: `SecretaryLoginComponent` + `SecretaryGuard`

#### HU-SEC-02 — Consultar panel operativo
- **Criterios**: Vista diaria con reservas pendientes de validación, confirmadas del día y pagos pendientes.
- **Backend**: `ReservationsModule` -> `GetDailyOperationalBoardUseCase` | `GET /api/v1/secretary/operational-board`
- **Frontend**: `SecretaryDashboardComponent`

---

### Épica 2: Gestión de Reservas

#### HU-SEC-03 — Consultar reservas
- **Criterios**: Filtro por fecha, cancha, complejo, cliente y estado.
- **Backend**: `ReservationsModule` -> `SearchReservationsUseCase` | `GET /api/v1/secretary/reservations`
- **Frontend**: `ReservationsTableComponent`

#### HU-SEC-04 — Consultar detalle de una reserva
- **Criterios**: Ver cliente, teléfono, CI, cancha, horario, precio, anticipo, saldo y comprobante.
- **Backend**: `ReservationsModule` -> `GetReservationDetailUseCase`
- **Frontend**: `SecretaryReservationDetailDrawer`

#### HU-SEC-05 — Crear reserva manual
- **Criterios**: Buscar/crear cliente, seleccionar cancha/horario, validar disponibilidad, calcular anticipo.
- **Backend**: `ReservationsModule` -> `CreateManualReservationUseCase` | `POST /api/v1/secretary/reservations/manual`
- **Frontend**: `ManualBookingFormComponent`

#### HU-SEC-06 — Registrar reserva proveniente de WhatsApp
- **Criterios**: Registrar reserva solicitada por mensajería, marcando `created_by = secretary.id` y ocupando horario oficial.
- **Backend**: `CreateManualReservationUseCase` (con metadata de origen `WHATSAPP`)
- **Frontend**: Selector "Origen: WhatsApp" en `ManualBookingFormComponent`

---

### Épica 3: Validación de Anticipos

#### HU-SEC-07 — Consultar solicitudes pendientes
- **Criterios**: Bandeja de entrada de reservas en `PENDING_VALIDATION` con comprobante adjunto.
- **Backend**: `PaymentsModule` -> `GetPendingPaymentsUseCase` | `GET /api/v1/secretary/payments/pending`
- **Frontend**: `PendingPaymentsInboxComponent`

#### HU-SEC-08 — Visualizar comprobante
- **Criterios**: Modal de visualización de imagen en alta resolución con zoom y datos de reserva.
- **Backend**: Supabase Storage URL / CDN
- **Frontend**: `ReceiptViewerModalComponent`

#### HU-SEC-09 — Validar anticipo
- **Criterios**: Botón de aprobación; pago pasa a `VALIDATED`; reserva pasa a `CONFIRMED`; registro de `handled_by` y timestamp.
- **Backend**: `PaymentsModule` -> `ValidateAdvancePaymentUseCase` | `POST /api/v1/secretary/payments/:id/validate`
- **Frontend**: Botón "Aprobar Pago" en `ReceiptViewerModal`

#### HU-SEC-10 — Rechazar comprobante
- **Criterios**: Rechazo con motivo obligatorio; pago a `REJECTED`; reserva cancelada; horario liberado.
- **Backend**: `PaymentsModule` -> `RejectAdvancePaymentUseCase` | `POST /api/v1/secretary/payments/:id/reject`
- **Frontend**: `RejectPaymentDialogComponent` (campo de texto obligatorio)

---

### Épica 4: Control del Tiempo de Reserva

#### HU-SEC-11 — Visualizar reservas temporales
- **Criterios**: Monitoreo de turnos en cuenta regresiva (5 min) y alertas de expiración.
- **Backend**: `ReservationsModule` -> `GetActiveTemporalReservationsUseCase` | `GET /api/v1/secretary/reservations/temporal`
- **Frontend**: `TemporalHoldsMonitorComponent`

#### HU-SEC-12 — Liberar horario por expiración
- **Criterios**: Botón de liberación manual de reservas que hayan superado los 5 minutos sin comprobante.
- **Backend**: `ReservationsModule` -> `ReleaseExpiredReservationUseCase` | `POST /api/v1/secretary/reservations/:id/release-expired`
- **Frontend**: Acción "Liberar Horario Expirado"

---

### Épica 5: Atención del Cliente y Cobro Final

#### HU-SEC-13 — Verificar reserva al ingreso
- **Criterios**: Búsqueda rápida por CI, nombre o código de reserva al llegar el cliente.
- **Backend**: `ReservationsModule` -> `QuickSearchReservationUseCase` | `GET /api/v1/secretary/checkin/search?q=CI`
- **Frontend**: `CheckInSearchComponent`

#### HU-SEC-14 — Consultar saldo pendiente
- **Criterios**: Muestra monto exacto por cobrar antes de permitir acceso.
- **Backend**: Calculado en detalle de reserva (`pending_balance`)
- **Frontend**: `BalanceBadgeComponent`

#### HU-SEC-15 — Registrar pago restante
- **Criterios**: Registro de pago en efectivo o QR del saldo restante; actualiza estado a pagado 100%.
- **Backend**: `PaymentsModule` -> `RegisterFinalPaymentUseCase` | `POST /api/v1/secretary/reservations/:id/final-payment`
- **Frontend**: `FinalPaymentModalComponent`

#### HU-SEC-16 — Autorizar ingreso a la cancha
- **Criterios**: Validación estricta: botón bloqueado si hay saldo pendiente; habilitación de ingreso registrada en sistema.
- **Backend**: `ReservationsModule` -> `AuthorizeEntryUseCase` | `POST /api/v1/secretary/reservations/:id/authorize-entry`
- **Frontend**: `AuthorizeEntryButton` con confirmación visual.

---

### Épica 6: Gestión de Inasistencias (*No-Show*)

#### HU-SEC-17 — Identificar cliente que no se presentó
- **Criterios**: Alerta visual en panel cuando el horario pactado ya inició y no se registró ingreso.
- **Backend**: `ReservationsModule` -> `GetNoShowCandidatesUseCase`
- **Frontend**: Tab "No Presentados" en dashboard operativo.

#### HU-SEC-18 — Liberar horario por inasistencia
- **Criterios**: Decisión humana de la secretaria de liberar la cancha; registro de motivo y autor.
- **Backend**: `ReservationsModule` -> `MarkNoShowAndReleaseUseCase` | `POST /api/v1/secretary/reservations/:id/no-show`
- **Frontend**: Botón "Declarar Inasistencia y Liberar Cancha"

---

### Épica 7: Cancelaciones y Reprogramaciones

#### HU-SEC-19 — Gestionar cancelación de reserva
- **Criterios**: Cancelar con registro de motivo; no devuelve anticipo por defecto; cancha liberada.
- **Backend**: `ReservationsModule` -> `SecretaryCancelReservationUseCase` | `POST /api/v1/secretary/reservations/:id/cancel`
- **Frontend**: `SecretaryCancelDialogComponent`

#### HU-SEC-20 — Gestionar reprogramación
- **Criterios**: Seleccionar nueva fecha/horario disponible, vincular `parent_reservation_id`, conservar anticipo.
- **Backend**: `ReservationsModule` -> `RescheduleReservationUseCase` | `POST /api/v1/secretary/reservations/:id/reschedule`
- **Frontend**: `RescheduleWizardComponent`

#### HU-SEC-21 — Gestionar excepciones de devolución
- **Criterios**: Registrar excepción especial con autorización y motivo auditado en sistema.
- **Backend**: `PaymentsModule` -> `RegisterRefundExceptionUseCase` | `POST /api/v1/secretary/reservations/:id/refund-exception`
- **Frontend**: `RefundExceptionModalComponent`

---

### Épica 8: Incidentes y Mantenimiento

#### HU-SEC-22 — Consultar reservas afectadas por cancha inhabilitada
- **Criterios**: Listado automático de reservas y contactos ante cierre de cancha.
- **Backend**: `CourtsModule` -> `GetAffectedReservationsUseCase` | `GET /api/v1/secretary/incidents/:id/affected-reservations`
- **Frontend**: `IncidentAffectedClientsDrawer`

#### HU-SEC-23 — Gestionar reprogramación por incidente
- **Criterios**: Flujo rápido de reubicación de turnos cancelados por fuerza mayor.
- **Backend**: `RescheduleReservationUseCase` (motivo: `INCIDENTE_CANCHA`)
- **Frontend**: Asistente de reubicación rápida.

#### HU-SEC-24 — Consultar información de contacto del cliente
- **Criterios**: Nombre, teléfono y correo disponibles con un clic para llamada o mensaje directo.
- **Backend**: Datos de usuario protegidos por rol en endpoints operativos.
- **Frontend**: Enlaces directos `tel:` y `mailto:` en tarjetas de reserva.

---

### Épica 9: Control de Caja

#### HU-SEC-25 — Consultar ingresos de la jornada
- **Criterios**: Resumen en tiempo real de cobros en efectivo y QR registrados por la secretaria en su turno.
- **Backend**: `CashShiftsModule` -> `GetCurrentShiftSummaryUseCase` | `GET /api/v1/secretary/shifts/current-summary`
- **Frontend**: `ShiftSummaryWidget`

#### HU-SEC-26 — Realizar cierre de caja
- **Criterios**: Ingreso de monto físico declarado (`total_declared`), cálculo de diferencia vs sistema (`total_system`), bloqueo inmutable del turno.
- **Backend**: `CashShiftsModule` -> `CloseCashShiftUseCase` | `POST /api/v1/secretary/shifts/close`
- **Frontend**: `CloseShiftModalComponent`

---

## 3. Historias de Usuario — Administrador / Propietario

### Épica 1: Acceso y Seguridad

#### HU-ADM-01 — Iniciar sesión
- **Criterios**: Autenticación con rol `ADMIN`; acceso exclusivo al módulo administrativo.
- **Backend**: `AuthModule` -> `LoginUseCase` | `POST /api/v1/auth/login`
- **Frontend**: `AdminLoginComponent` + `AdminGuard`

#### HU-ADM-02 — Gestionar acceso de usuarios internos
- **Criterios**: Crear, listar, activar y desactivar cuentas de secretarias/cajeras.
- **Backend**: `UsersModule` -> `ManageStaffUseCase` | `POST /api/v1/admin/staff`, `PATCH /api/v1/admin/staff/:id/status`
- **Frontend**: `StaffManagementComponent`

---

### Épica 2: Gestión de Complejos Deportivos

#### HU-ADM-03 — Crear complejo deportivo
- **Criterios**: Registro de nombre, ubicación física, información de contacto y URL de QR de cobro.
- **Backend**: `ComplexesModule` -> `CreateComplexUseCase` | `POST /api/v1/admin/complexes`
- **Frontend**: `CreateComplexFormComponent`

#### HU-ADM-04 — Editar complejo deportivo
- **Criterios**: Modificación de datos de complejo sin alterar reservas históricas.
- **Backend**: `ComplexesModule` -> `UpdateComplexUseCase` | `PUT /api/v1/admin/complexes/:id`
- **Frontend**: `EditComplexFormComponent`

#### HU-ADM-05 — Habilitar o deshabilitar complejo
- **Criterios**: Desactivar complejo bloquea nuevas reservas pero preserva las ya agendadas.
- **Backend**: `ComplexesModule` -> `ToggleComplexStatusUseCase` | `PATCH /api/v1/admin/complexes/:id/toggle`
- **Frontend**: Switch activo/inactivo en tabla de complejos.

---

### Épica 3: Gestión de Canchas

#### HU-ADM-06 — Registrar cancha
- **Criterios**: Asignar a complejo, nombre, tipo (`Futsal`, `Wally`, `Racket`) y precio por hora inicial.
- **Backend**: `CourtsModule` -> `CreateCourtUseCase` | `POST /api/v1/admin/courts`
- **Frontend**: `CreateCourtModalComponent`

#### HU-ADM-07 — Editar cancha
- **Criterios**: Modificar nombre, tipo o precio; cambios no afectan reservas pasadas ni confirmadas.
- **Backend**: `CourtsModule` -> `UpdateCourtUseCase` | `PUT /api/v1/admin/courts/:id`
- **Frontend**: `EditCourtModalComponent`

#### HU-ADM-08 — Configurar precio por hora
- **Criterios**: Precio > 0; inmutabilidad histórica garantizada en la tabla `reservations`.
- **Backend**: `CourtsModule` -> `UpdateCourtPriceUseCase` | `PATCH /api/v1/admin/courts/:id/price`
- **Frontend**: Input de tarifa con advertencia de efecto futuro.

#### HU-ADM-09 — Habilitar o deshabilitar cancha
- **Criterios**: Cancha inactiva no se lista como disponible para clientes.
- **Backend**: `CourtsModule` -> `ToggleCourtStatusUseCase` | `PATCH /api/v1/admin/courts/:id/toggle`
- **Frontend**: Switch de habilitación en tabla de canchas.

---

### Épica 4: Mantenimiento e Incidentes

#### HU-ADM-10 — Programar mantenimiento
- **Criterios**: Registrar fecha/hora inicio y fin con motivo; bloquea disponibilidad en el calendario.
- **Backend**: `CourtsModule` -> `ScheduleMaintenanceUseCase` | `POST /api/v1/admin/courts/:id/incidents`
- **Frontend**: `MaintenanceSchedulerModal`

#### HU-ADM-11 — Inhabilitar cancha por incidente
- **Criterios**: Cierre inmediato por avería inesperada; registra motivo; lista turnos en riesgo.
- **Backend**: `CourtsModule` -> `RegisterIncidentUseCase` | `POST /api/v1/admin/courts/:id/incidents/immediate`
- **Frontend**: Botón de emergencia "Inhabilitar Cancha"

#### HU-ADM-12 — Consultar reservas afectadas por mantenimiento
- **Criterios**: Tabla de reservas coincidentes con datos de clientes para coordinación.
- **Backend**: `CourtsModule` -> `GetAffectedReservationsUseCase`
- **Frontend**: `AffectedBookingsReportComponent`

---

### Épica 5: Gestión de Horarios

#### HU-ADM-13 — Configurar horarios de atención
- **Criterios**: Horario por día de la semana (1 a 7) con apertura y cierre personalizable.
- **Backend**: `SchedulesModule` -> `SetWeeklyScheduleUseCase` | `PUT /api/v1/admin/courts/:id/schedules/weekly`
- **Frontend**: `WeeklyScheduleGridComponent`

#### HU-ADM-14 — Configurar disponibilidad especial
- **Criterios**: Horario para fechas específicas (feriados, eventos) usando `specific_date`.
- **Backend**: `SchedulesModule` -> `SetSpecificDateScheduleUseCase` | `POST /api/v1/admin/courts/:id/schedules/special`
- **Frontend**: `SpecialDateScheduleModal`

---

### Épica 6: Supervisión de Reservas

#### HU-ADM-15 — Consultar todas las reservas
- **Criterios**: Búsqueda global multicriterio (fechas, complejos, canchas, estados, cliente).
- **Backend**: `ReservationsModule` -> `AdminListAllReservationsUseCase` | `GET /api/v1/admin/reservations`
- **Frontend**: `AdminReservationsMasterView`

#### HU-ADM-16 — Consultar calendario general
- **Criterios**: Vista de matriz de todos los complejos y canchas en simultáneo.
- **Backend**: `ReservationsModule` -> `GetMasterCalendarGridUseCase` | `GET /api/v1/admin/calendar-master`
- **Frontend**: `MasterTimelineCalendarComponent`

---

### Épica 7: Supervisión Financiera

#### HU-ADM-17 — Consultar ingresos
- **Criterios**: Ingresos por período, complejo, cancha; diferenciando anticipos y saldos presenciales.
- **Backend**: `AnalyticsModule` -> `GetRevenueReportUseCase` | `GET /api/v1/admin/analytics/revenue`
- **Frontend**: `RevenueAnalyticsChartsComponent`

#### HU-ADM-18 — Consultar pagos pendientes
- **Criterios**: Lista de reservas confirmadas que adeudan el 75% final con montos y fechas.
- **Backend**: `AnalyticsModule` -> `GetPendingReceivablesUseCase` | `GET /api/v1/admin/analytics/pending-balances`
- **Frontend**: `PendingReceivablesTableComponent`

#### HU-ADM-19 — Supervisar ingresos de secretaria
- **Criterios**: Detalle de cobros registrados por cajera y comparación con cierres de caja (`cash_shifts`).
- **Backend**: `CashShiftsModule` -> `AuditSecretaryShiftsUseCase` | `GET /api/v1/admin/analytics/cash-shifts`
- **Frontend**: `CashShiftAuditComponent`

---

### Épica 8: Análisis del Negocio (Toma de Decisiones)

#### HU-ADM-20 — Consultar ocupación de canchas
- **Criterios**: Porcentaje de ocupación por cancha y período; identifica las canchas más vacías para promociones.
- **Backend**: `AnalyticsModule` -> `GetCourtOccupancyRankingUseCase` | `GET /api/v1/admin/analytics/court-occupancy`
- **Frontend**: `CourtOccupancyRankingWidget`

#### HU-ADM-21 — Consultar horarios de mayor demanda
- **Criterios**: Histograma de horas más concurridas (ej. 18:00 a 21:00) para ajustar tarifas o personal.
- **Backend**: `AnalyticsModule` -> `GetPeakHoursAnalysisUseCase` | `GET /api/v1/admin/analytics/peak-hours`
- **Frontend**: `PeakHoursBarChartComponent`

#### HU-ADM-22 — Comparar rendimiento de canchas
- **Criterios**: Comparativa multidimensional: horas jugadas vs ingresos generados.
- **Backend**: `AnalyticsModule` -> `CompareCourtsPerformanceUseCase` | `GET /api/v1/admin/analytics/court-performance`
- **Frontend**: `CourtComparisonMatrixComponent`

#### HU-ADM-23 — Consultar indicadores generales (Executive Dashboard)
- **Criterios**: KPIs en tiempo real: ingresos del mes, reservas activas, tasa de ocupación, cancha líder, tasa de cancelación.
- **Backend**: `AnalyticsModule` -> `GetExecutiveKpiSummaryUseCase` | `GET /api/v1/admin/analytics/kpi-summary`
- **Frontend**: `AdminExecutiveDashboardComponent`

---

### Épica 9: Gestión de Información del Negocio

#### HU-ADM-24 — Configurar información del establecimiento
- **Criterios**: Configurar datos generales visibles a los clientes en catálogo y comprobantes.
- **Backend**: `ComplexesModule` -> `UpdateBusinessInfoUseCase` | `PUT /api/v1/admin/business-info`
- **Frontend**: `BusinessSettingsComponent`

#### HU-ADM-25 — Configurar código QR de pago
- **Criterios**: Subir/reemplazar imagen de QR en Supabase Storage por complejo deportivo.
- **Backend**: `ComplexesModule` -> `UploadComplexQrUseCase` | `POST /api/v1/admin/complexes/:id/qr`
- **Frontend**: `QrManagementUploadComponent`
