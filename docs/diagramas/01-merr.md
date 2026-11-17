# Modelo Entidad–Relación Extendido — SportReserva

Basado en el esquema y diccionario locales del 24/09/2026. No se consultó la base remota en esta tarea.

## Vista conceptual extendida

Notación compacta: rectángulos = entidades; rombos = relaciones; óvalos = atributos identificadores; círculo `d` = especialización disjunta. Las etiquetas junto a cada entidad indican cuántas veces puede participar una instancia de esa entidad en la relación. `N` significa muchos. Se muestran atributos principales; el anexo relacional incluye las columnas.

```mermaid
flowchart TB
    U["USUARIO<br/>nombre, email, teléfono, CI<br/>rol, estado"]
    UID(["id_usuario · identificador"])
    UID --- U
    U === D(("d"))
    D --- CLI["CLIENTE"]
    D --- SEC["SECRETARIA"]
    D --- ADM["ADMINISTRADOR"]

    C["COMPLEJO<br/>nombre, ubicación, contacto, QR"]
    CID(["id_complejo · identificador"])
    CID --- C
    C ---|"0..N"| CONT{contiene}
    CONT ---|"1..1"| CAN["CANCHA<br/>nombre, precio/hora, activa, portada"]
    CANID(["id_cancha · identificador"])
    CANID --- CAN
    T["TIPO DE CANCHA<br/>código identificador, descripción, activo"] ---|"0..N"| CLA{clasifica}
    CLA ---|"1..1"| CAN
    CAN ---|"0..N"| HOR{dispone de}
    HOR ---|"1..1"| H["HORARIO<br/>id, día semana O fecha<br/>hora apertura, hora cierre"]
    CAN ---|"0..N"| INC{registra}
    INC ---|"1..1"| I["INCIDENTE<br/>id, inicio, fin, motivo"]
    CAN ---|"0..N"| REC{recibe}
    REC ---|"1..1"| R["RESERVA<br/>fecha, inicio, fin, precio histórico<br/>total, anticipo, estado, origen, expiración"]
    RID(["id_reserva · identificador"])
    RID --- R
    CLI ---|"0..N"| SOL{solicita}
    SOL ---|"1..1"| R
    U ---|"0..N"| CRE{crea}
    CRE ---|"1..1"| R
    R ---|"0..1 como padre"| REP{reprogramación}
    REP ---|"0..1 como sucesora"| R
    R ---|"0..N"| IMP{imputación actual}
    IMP ---|"1..1"| P["PAGO<br/>id, monto, tipo, método, estado<br/>comprobante, procesamiento, motivo devolución"]
    R ---|"0..N"| ORI{origen inmutable}
    ORI ---|"1..1"| P
    U ---|"0..N"| PRO{procesa}
    PRO ---|"0..1"| P
    U ---|"0..N"| AUT{autoriza devolución}
    AUT ---|"0..1"| P
    SEC ---|"0..N"| CAJ{responsable de}
    CAJ ---|"1..1"| CS["CIERRE DE CAJA<br/>id, fecha, total efectivo, total QR<br/>efectivo declarado, diferencia, cierre"]
    R ---|"0..N"| HIS{tiene historial}
    HIS ---|"1..1"| E["EVENTO DE RESERVA<br/>id, estado anterior, estado nuevo<br/>instante, motivo"]
    U ---|"0..N"| ACT{actúa en}
    ACT ---|"0..1"| E
    R ---|"0..N"| REL{referenciada por}
    REL ---|"0..1"| E
    classDef entity fill:#eaf3ff,stroke:#245a81,color:#142b40;
    classDef relation fill:#fff3d6,stroke:#aa771c,color:#4b350c;
    class U,CLI,SEC,ADM,C,CAN,T,H,I,R,P,CS,E entity;
    class CONT,CLA,HOR,INC,REC,SOL,CRE,REP,IMP,ORI,PRO,AUT,CAJ,HIS,ACT,REL relation;
```

## Cómo interpretar y defender el modelo

- **Especialización total y disjunta:** cada usuario tiene exactamente un rol: CLIENTE, SECRETARIA o ADMIN. La línea gruesa representa participación total en la especialización. Es una representación conceptual de `users.role`; no implica tres tablas adicionales ni herencia en TypeScript.
- **Roles de negocio y claves foráneas:** Cliente solicita y Secretaria cierra caja según el negocio. Las FK reales apuntan a `users`; una FK por sí sola no exige un rol concreto. Creador, procesador y autorizador se relacionan con Usuario porque las acciones dependen de permisos.
- **Reserva es una entidad asociativa:** resuelve la relación entre cliente y cancha a lo largo del tiempo y conserva fecha, horario y precio contratado.
- **Reprogramación:** una reserva tiene cero o una antecesora y cero o una sucesora directa. Pueden existir cadenas; no varias sucesoras directas de la misma reserva.
- **Dos relaciones Reserva–Pago:** `reservation_id` indica la imputación actual y `original_reservation_id` conserva el origen. No representan dos pagos.
- **Opcionalidad condicionada:** un pago pendiente puede carecer de procesador. Una devolución exige autorizador y motivo. Un evento de expiración automática puede carecer de actor.
- **Horario:** día semanal y fecha específica son excluyentes; se informa exactamente uno.
- **Atributos calculados:** total y anticipo se almacenan con restricciones de coherencia. El saldo pendiente se calcula a partir de pagos netos; no existe como columna. La diferencia de caja corresponde al efectivo declarado menos el efectivo del sistema.
- **Caja y pagos:** no existe `cash_shift_id` en pagos. El cierre agrupa movimientos por responsable y fecha de procesamiento; no se dibuja una FK inexistente.

## Fuentes

- [Esquema SQL](../../back-canchas-deportivas/database/schema.sql).
- [Diccionario de datos y restricciones](../../back-canchas-deportivas/docs/inspeccion/diccionario-datos.md).
- [Modelo relacional documentado](../02-database-supabase.md).

## Anexo: modelo relacional completo

La siguiente vista usa pata de cuervo: `||` = uno; `o|` = cero o uno; `o{` = cero o muchos. PK = clave primaria; FK = clave foránea; UK = unicidad. Complementa la vista conceptual con nombres físicos para cotejar la implementación.

```mermaid
erDiagram
    users ||--o{ reservations : "cliente client_id"
    users ||--o{ reservations : "creador created_by"
    users o|--o{ payments : "procesa handled_by"
    users o|--o{ payments : "autoriza authorized_by"
    users ||--o{ cash_shifts : "responsable secretary_id"
    users o|--o{ reservation_events : "actor o sistema"
    complexes ||--o{ courts : contiene
    court_types ||--o{ courts : clasifica
    courts ||--o{ court_schedules : atiende
    courts ||--o{ court_incidents : registra
    courts ||--o{ reservations : recibe
    reservations o|--o| reservations : "padre y sucesora"
    reservations ||--o{ payments : "imputacion actual"
    reservations ||--o{ payments : "origen inmutable"
    reservations ||--o{ reservation_events : historial
    reservations o|--o{ reservation_events : "reserva relacionada"
    users {
        uuid id PK
        varchar name
        varchar email UK
        varchar phone
        varchar ci UK
        varchar password_hash
        varchar role
        varchar status
        timestamptz created_at
    }
    complexes {
        integer id PK
        varchar name
        varchar location
        text contact_info
        varchar payment_qr_url
        boolean is_active
    }
    court_types {
        varchar code PK
        text description
        boolean is_active
    }
    courts {
        integer id PK
        integer complex_id FK
        varchar name
        varchar court_type FK
        numeric price_per_hour
        boolean is_active
        text cover_image_url
        jsonb images
    }
    court_schedules {
        integer id PK
        integer court_id FK
        integer day_of_week
        date specific_date
        time open_time
        time close_time
    }
    court_incidents {
        integer id PK
        integer court_id FK
        timestamptz start_datetime
        timestamptz end_datetime
        text reason
    }
    reservations {
        uuid id PK
        uuid client_id FK
        integer court_id FK
        date reservation_date
        time start_time
        time end_time
        numeric price_per_hour
        numeric total_price
        numeric advance_required
        varchar status
        timestamptz expires_at
        uuid created_by FK
        uuid parent_reservation_id FK,UK
        text cancellation_reason
        timestamptz created_at
        varchar origin
    }
    payments {
        integer id PK
        uuid reservation_id FK
        uuid original_reservation_id FK
        numeric amount
        varchar payment_type
        varchar payment_method
        varchar receipt_image_url
        varchar status
        uuid handled_by FK
        text rejection_reason
        timestamptz created_at
        timestamptz processed_at
        uuid authorized_by FK
        text refund_reason
    }
    cash_shifts {
        integer id PK
        uuid secretary_id FK
        date shift_date
        numeric total_system
        numeric total_system_cash
        numeric total_system_qr
        numeric total_declared_cash
        numeric difference
        text notes
        boolean is_closed
        timestamptz closed_at
        timestamptz created_at
    }
    reservation_events {
        bigint id PK
        uuid reservation_id FK
        varchar from_status
        varchar to_status
        uuid actor_id FK
        timestamptz occurred_at
        text reason
        uuid related_reservation_id FK
    }
```
