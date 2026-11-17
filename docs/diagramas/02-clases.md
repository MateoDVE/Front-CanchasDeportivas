# Diagrama de clases de dominio — SportReserva

Vista UML de las ocho entidades implementadas y el objeto de valor `TimeSlot`, revisada contra el código local el 24/09/2026. Incluye atributos y operaciones principales; omite constructores y auxiliares privados. Las asociaciones representan referencias por identificador, no propiedades que contengan objetos cargados.

```mermaid
classDiagram
    direction TB
    class User {
        +string id
        +string name
        +string email
        +string phone
        +string ci
        +string passwordHash
        +UserRole role
        +UserStatus status
        +Date createdAt
        +isActive() boolean
        +activate() void
        +deactivate() void
    }
    class Complex {
        +number id
        +string name
        +string location
        +string contactInfo
        +string paymentQrUrl
        +boolean isActive
        +activate() void
        +deactivate() void
    }
    class Court {
        +number id
        +number complexId
        +string name
        +CourtType courtType
        -number _pricePerHour
        +boolean isActive
        +string[] images
        +pricePerHour number
        +updatePrice(newPrice) void
        +activate() void
        +deactivate() void
    }
    class CourtSchedule {
        +number id
        +number courtId
        +number dayOfWeek
        +string specificDate
        +string openTime
        +string closeTime
    }
    class CourtIncident {
        +number id
        +number courtId
        +Date startDatetime
        +Date endDatetime
        +string reason
        +Date createdAt
        +isActiveAt(date) boolean
    }
    class Reservation {
        +string id
        +string clientId
        +number courtId
        +string reservationDate
        +string startTime
        +string endTime
        +number pricePerHour
        +number totalPrice
        +number advanceRequired
        -ReservationStatus _status
        -Date _expiresAt
        +string createdBy
        +string parentReservationId
        +string cancellationReason
        +string origin
        +Date createdAt
        +ReservationStatus persistedStatus
        -number paidAmount
        +boolean isEntryAuthorized
        +boolean isFinalPaymentPaid
        +status ReservationStatus
        +expiresAt Date
        +pendingBalance number
        +createTemporal(props)$ Reservation
        +createManual(props)$ Reservation
        +applyPaidAmount(amount) void
        +isExpired() boolean
        +secondsRemaining() number
        +markAsPendingValidation() void
        +confirm() void
        +cancel(reason) void
        +expire() void
        +markFinalPaymentPaid() void
        +authorizeEntry() void
        +markNoShow() void
        +markReprogrammed() void
    }
    class Payment {
        +number id
        +string reservationId
        +string originalReservationId
        +number amount
        +PaymentType paymentType
        +PaymentMethod paymentMethod
        +string receiptImageUrl
        -PaymentStatus _status
        -string _handledBy
        -string _rejectionReason
        +Date createdAt
        +Date processedAt
        +string authorizedBy
        +string refundReason
        +status PaymentStatus
        +handledBy string
        +rejectionReason string
        +validate(handledByUserId) void
        +reject(handledByUserId, reason) void
    }
    class CashShift {
        +number id
        +string secretaryId
        +string shiftDate
        +number totalSystemCash
        +number totalSystemQr
        +number totalSystem
        +number totalDeclaredCash
        +number difference
        +string notes
        -boolean _isClosed
        -Date _closedAt
        +Date createdAt
        +isClosed boolean
        +closedAt Date
        +close(totalDeclaredCash, notes) void
    }
    class TimeSlot {
        <<ValueObject>>
        +string startTime
        +string endTime
        -number _durationHours
        +durationHours number
        +overlapsWith(otherStart, otherEnd) boolean
    }
    Complex "1" -- "0..*" Court : complexId
    Court "1" -- "0..*" CourtSchedule : courtId
    Court "1" -- "0..*" CourtIncident : courtId
    Court "1" -- "0..*" Reservation : courtId
    User "1" -- "0..*" Reservation : clientId
    User "1" -- "0..*" Reservation : createdBy
    Reservation "0..1 padre" -- "0..1 sucesora" Reservation : parentReservationId
    Reservation "1" -- "0..*" Payment : reservationId
    Reservation "1" -- "0..*" Payment : originalReservationId
    User "0..1" -- "0..*" Payment : handledBy
    User "0..1" -- "0..*" Payment : authorizedBy
    User "1" -- "0..*" CashShift : secretaryId
    Reservation ..> TimeSlot : fábricas reciben y usan
```

## Convenciones y alcance

`+` significa público; `-`, privado. Las fábricas `createTemporal` y `createManual` son estáticas. Los miembros `status`, `expiresAt`, `pendingBalance`, `pricePerHour`, `handledBy`, `rejectionReason`, `isClosed`, `closedAt` y `durationHours` representan getters. Para mantener legibilidad, las firmas resumen los parámetros; el código conserva sus tipos exactos y modificadores `readonly`.

Los tipos de los atributos se muestran sin la unión `null` ni `undefined`. Son opcionales o anulables: `Complex.paymentQrUrl`; `CourtSchedule.dayOfWeek/specificDate`; `Reservation._expiresAt/parentReservationId/cancellationReason/paidAmount`; `Payment.receiptImageUrl/_handledBy/_rejectionReason/processedAt/authorizedBy/refundReason`; `CashShift.notes/_closedAt`, además de sus getters correspondientes. Las cardinalidades hacen explícita la opcionalidad de las asociaciones.

| Tipo | Valores implementados |
|---|---|
| UserRole | CLIENTE, SECRETARIA, ADMIN |
| UserStatus | ACTIVE, INACTIVE, PENDING_VERIFICATION |
| ReservationStatus | TEMPORAL, PENDING_VALIDATION, CONFIRMED, CANCELLED, REPROGRAMMED, EXPIRED, NO_SHOW, COMPLETED |
| PaymentType | ANTICIPO, SALDO_FINAL, DEVOLUCION |
| PaymentMethod | QR, EFECTIVO |
| PaymentStatus | PENDING, VALIDATED, REJECTED, REFUNDED |
| CourtType | Alias de string; catálogo validado en persistencia |

## Diferencias respecto del diagrama de base de datos

- `User` representa todos los roles. No existen clases `Cliente`, `Secretaria` o `Administrador` que hereden de ella.
- `court_types` y `reservation_events` son tablas; no hay clases de entidad homónimas en los archivos de dominio revisados.
- `TimeSlot` es un objeto de valor usado por las fábricas de `Reservation`; no es tabla ni objeto almacenado como propiedad de la reserva. Por eso se representa una dependencia, no composición.
- `CourtIncident.createdAt` existe en la clase, pero no figura como columna en el diccionario físico revisado.
- `Court.images` expone la compatibilidad de imágenes; la base contiene `cover_image_url` y el espejo legado `images`.
- `Reservation.pendingBalance`, `paidAmount`, `isEntryAuthorized`, `isFinalPaymentPaid` y `persistedStatus` corresponden al comportamiento en memoria; no se deben convertir automáticamente en columnas. El getter de saldo tiene una alternativa de cotización cuando no se ha aplicado un monto pagado.
- Esta es una vista de dominio. Controladores, DTO, repositorios y casos de uso quedan fuera del alcance de este diagrama.

## Fuentes

Las clases se encuentran en `back-canchas-deportivas/src/modules/<módulo>/domain/entities/`. El objeto de valor está en [time-slot.vo.ts](../../back-canchas-deportivas/src/modules/reservations/domain/value-objects/time-slot.vo.ts).
