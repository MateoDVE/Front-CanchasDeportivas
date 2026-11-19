# Validación técnica del diseño de altas

Revisión del 18/11/2026 contra el esquema versionado `back-canchas-deportivas/database/schema.sql`, entidades, interfaces y casos de uso locales. Estos diagramas cubren las dos tablas del bloque; complementan el modelo general del informe. No se afirma una nueva inspección del esquema del servidor ni se ejecutan migraciones.

## Modelo relacional del bloque

```mermaid
erDiagram
  complexes ||--o{ courts : contiene
  court_types ||--o{ courts : clasifica
  courts ||--o{ court_schedules : atiende
  courts ||--o{ court_incidents : registra
  courts ||--o{ reservations : recibe
  complexes {
    integer id PK
    varchar name "100 caracteres"
    varchar location "255 caracteres"
    varchar contact_info "255 caracteres en contrato actual"
    varchar payment_qr_url "opcional 255 caracteres"
    boolean is_active
  }
  courts {
    integer id PK
    integer complex_id FK
    varchar name "50 caracteres en API y BD"
    varchar court_type FK
    numeric price_per_hour "10 digitos 2 decimales positivo"
    boolean is_active
    text cover_image_url "opcional maximo 2800000 caracteres"
    jsonb images "espejo legado de portada"
  }
  court_types {
    varchar code PK
    text description
    boolean is_active
  }
  court_schedules {
    integer id PK
    integer court_id FK
  }
  court_incidents {
    integer id PK
    integer court_id FK
  }
  reservations {
    uuid id PK
    integer court_id FK
  }
```

Un complejo puede tener cero o muchas canchas; cada cancha pertenece a un complejo. El catálogo contiene Futsal, Wally, Racket y Padel. La portada se persiste en `cover_image_url`; el campo `images` se mantiene sincronizado por el esquema. Los nombres no se modelan como claves únicas. La baja de datos de prueba es lógica para conservar reservas y trazabilidad.

## Diagrama de clases de Crear

```mermaid
classDiagram
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
    +string courtType
    -number _pricePerHour
    +boolean isActive
    +string[] images
    +updatePrice(newPrice) void
    +activate() void
    +deactivate() void
  }
  class IComplexRepository {
    <<interface>>
    +findById(id)
    +findAll(onlyActive)
    +save(complex)
    +update(complex)
  }
  class ICourtRepository {
    <<interface>>
    +findById(id)
    +findByComplex(complexId, onlyActive)
    +findAll(onlyActive)
    +findTypes()
    +save(court)
    +update(court)
    +updatePrice(id, newPrice)
  }
  class CreateComplexUseCase {
    +execute(input)
  }
  class CreateCourtUseCase {
    +execute(input)
  }
  class SupabaseComplexRepository
  class SupabaseCourtRepository
  Complex "1" --> "0..*" Court : complexId
  IComplexRepository <|.. SupabaseComplexRepository
  ICourtRepository <|.. SupabaseCourtRepository
  CreateComplexUseCase --> IComplexRepository
  CreateCourtUseCase --> IComplexRepository
  CreateCourtUseCase --> ICourtRepository
  SupabaseComplexRepository --> Complex
  SupabaseCourtRepository --> Court
```

Se verifica la separación entre presentación (DTO/controlador), aplicación (caso de uso), dominio e infraestructura. La notación simplifica tipos de retorno Promise para legibilidad y omite controladores del gráfico. `paymentQrUrl` es nullable en Complex. La relación Complex–Court es por identificador, no por una colección de objetos almacenada en Complex.

## Observaciones para integrar el informe

- El límite visual del nombre de cancha es 30, aunque API/BD admiten 50. Debe explicarse como discrepancia, no modificar el modelo relacional para copiar el HTML.
- El atributo visual `min=1` no demuestra rechazo efectivo de importes inferiores; los tests verifican el recorrido completo. El contrato de backend exige importe positivo con dos decimales.
- El diagrama general de reservas debe revisarse con el responsable de transiciones antes de exportar el PDF; este bloque no certifica políticas ajenas de reprogramación ni el esquema desplegado completo.
- Robert puede integrar estos diagramas con [el modelo general](../../../../docs/02-database-supabase.md) y [arquitectura](../../../../docs/01-architecture-solid.md). Verificar legibilidad de las imágenes en el PDF final.
