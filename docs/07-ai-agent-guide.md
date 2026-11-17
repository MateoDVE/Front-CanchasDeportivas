# 🤖 Guía Operativa para Agentes de Inteligencia Artificial

Esta guía está redactada específicamente para **agentes de Inteligencia Artificial** (Claude, Cursor, GitHub Copilot, Gemini, ChatGPT, Antigravity, etc.) y desarrolladores que deban interactuar, generar o refactorizar código en este repositorio.

---

## 1. Protocolo Obligatorio Antes de Generar Código

Antes de escribir una sola línea de código, el agente de IA **DEBE** seguir estos tres pasos de contextualización:

1. **Localizar la Historia de Usuario**:
   - Revisa [`docs/04-user-stories-matrix.md`](./04-user-stories-matrix.md) para identificar el identificador exacto de la HU (ej. `HU-CLI-11`, `HU-SEC-09`, `HU-ADM-08`).
   - Lee con atención todos los **Criterios de Aceptación** de la historia.
2. **Revisar las Reglas de Negocio Involucradas**:
   - Consulta [`docs/03-business-rules.md`](./03-business-rules.md) para asegurar que no se violen las reglas de los 5 minutos, el 25% de anticipo, la inmutabilidad de precios históricos o la duración en bloques de horas enteras.
3. **Respetar la Capa de Destino**:
   - Determina a qué capa pertenece el cambio (Dominio, Aplicación, Infraestructura o Presentación). **Nunca mezcles capas**.

---

## 2. Flujo de Trabajo en 6 Pasos para Implementar una Nueva Funcionalidad

Cuando un usuario solicite implementar o ampliar un caso de uso en el backend, el agente debe construirlo estrictamente en este orden (de adentro hacia afuera):

```
Paso 1: Dominio (Entidad / Value Object / Excepciones)
   │
   ▼
Paso 2: Dominio (Interface de Repositorio / Puerto)
   │
   ▼
Paso 3: Aplicación (Caso de Uso + DTOs de Entrada/Salida)
   │
   ▼
Paso 4: Infraestructura (Implementación de Repositorio con Supabase)
   │
   ▼
Paso 5: Presentación (Controlador NestJS + DTO con validaciones class-validator)
   │
   ▼
Paso 6: Frontend (Servicio Angular + Signals + Componente Standalone)
```

### Detalle de cada paso:

#### Paso 1: Dominio Puro
- Crea o actualiza la entidad en `src/modules/<modulo>/domain/entities/`.
- La entidad contiene los métodos que validan el estado (ej. `Reservation.confirm()`, `Reservation.markAsPendingValidation()`).
- Si se rompe una regla de negocio, lanza una excepción de dominio pura (ej. `throw new InvalidReservationDurationException()`). **No uses `HttpException` aquí**.

#### Paso 2: Puerto de Repositorio
- Define la interfaz en `src/modules/<modulo>/domain/repositories/`.
- Solo declara métodos necesarios para el caso de uso (respetando *Interface Segregation*).

#### Paso 3: Caso de Uso de Aplicación
- Crea una clase en `src/modules/<modulo>/application/use-cases/` con nombre descriptivo: `<accion>-<entidad>.use-case.ts`.
- Inyecta la interfaz del repositorio mediante `@Inject('IToken')`.
- Ejecuta la orquestación en el método `async execute(input: InputDto): Promise<OutputDto>`.

#### Paso 4: Adaptador de Infraestructura
- Crea o actualiza la clase en `src/modules/<modulo>/infrastructure/repositories/`.
- Aquí y **únicamente aquí** se utiliza el cliente de Supabase (`this.supabase.from(...)`).
- Mapea las filas de la base de datos a entidades de dominio antes de retornarlas.

#### Paso 5: Controlador de Presentación
- Expón la ruta HTTP en `src/modules/<modulo>/presentation/controllers/`.
- Protege con `@UseGuards(JwtAuthGuard, RolesGuard)` y `@Roles(...)`.
- Valida los parámetros de entrada con decoradores de `class-validator` en el DTO de entrada.

#### Paso 6: Integración en Frontend
- Si la tarea incluye la interfaz, crea el componente standalone en `FrontCanchasDeportivas/src/app/features/<rol>/`.
- Consume el endpoint a través de un servicio inyectable y gestiona el estado reactivo con Signals.

---

## 3. Convenciones de Nomenclatura y Estilo de Código

| Elemento | Convención | Ejemplo |
| :--- | :--- | :--- |
| **Archivos** | `kebab-case.tipo.ts` | `create-reservation.use-case.ts`, `reservation.entity.ts` |
| **Directorios** | `kebab-case` | `court-schedules/`, `use-cases/`, `operational-board/` |
| **Clases e Interfaces** | `PascalCase` | `ReservationEntity`, `IReservationRepository` |
| **Métodos y Funciones** | `camelCase` | `calculateAdvance()`, `findConflicting()` |
| **Constantes / Enums** | `UPPER_SNAKE_CASE` | `ReservationStatus.CONFIRMED`, `DEFAULT_PAGE_SIZE` |
| **Tablas y Columnas SQL**| `snake_case` | `court_schedules`, `price_per_hour`, `expires_at` |

---

## 4. Checklist de Verificación de Calidad (Pre-Commit para la IA)

Antes de dar por completada una tarea, el agente debe auto-auditar su código contra este checklist:

- [ ] **Aislamiento de Dominio**: ¿Hay alguna importación de `@nestjs/common`, `express`, `@supabase/supabase-js` en la carpeta `domain/`? (Respuesta requerida: **NO**).
- [ ] **Inversión de Dependencias**: ¿Los casos de uso dependen de interfaces y no de clases concretas de Supabase? (Respuesta requerida: **SÍ**).
- [ ] **Validación de Entradas**: ¿Todos los campos del DTO de entrada tienen decoradores como `@IsNotEmpty()`, `@IsUUID()`, `@IsInt()` o `@Min()`? (Respuesta requerida: **SÍ**).
- [ ] **Regla de Media Hora**: ¿Se valida una duración mínima de 30 minutos, múltiplos de media hora y extremos :00/:30? (Respuesta requerida: **SÍ**).
- [ ] **Cálculo de Anticipo**: ¿Se calculó el 25% con dos decimales y el saldo pendiente como el 75% restante? (Respuesta requerida: **SÍ**).
- [ ] **Inmutabilidad del Precio**: ¿Al crear una reserva se congeló el precio por hora de la cancha en `reservations.price_per_hour`? (Respuesta requerida: **SÍ**).
- [ ] **Trazabilidad de Reprogramación**: ¿Si es una reprogramación, se vinculó el `parent_reservation_id`? (Respuesta requerida: **SÍ**).
- [ ] **Seguridad de Roles**: ¿El endpoint tiene el decorador `@Roles('CLIENTE' | 'SECRETARIA' | 'ADMIN')` apropiado? (Respuesta requerida: **SÍ**).

---

## 5. Antipatrones Prohibidos

1. ❌ **Inyectar `SupabaseClient` en Controladores o Casos de Uso**: Rompe la inversión de dependencias y hace imposible testear unitariamente la lógica sin base de datos real.
2. ❌ **Recalcular precios históricos sobre `courts.price_per_hour`**: Las consultas de reservas pasadas o confirmadas deben usar **siempre** `reservations.price_per_hour`.
3. ❌ **Ignorar la expiración de 5 minutos**: Nunca asumas que un turno temporal dura indefinidamente. Siempre verifica `expires_at > NOW()`.
4. ❌ **Permitir ingreso a cancha con saldo pendiente**: Cualquier flujo de check-in debe verificar que `pending_balance == 0`.
