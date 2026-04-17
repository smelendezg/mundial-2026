# Entrega para backend - Frontend Mundial 2026

Este documento resume lo que necesita el backend para conectarse con el frontend.

## Configuracion

Archivo `.env` del frontend:

```env
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://localhost:8000
```

Mientras `VITE_USE_MOCK=true`, el frontend usa datos simulados en `src/api/mockDb.ts`.
Para probar contra Spring Boot hay que poner `VITE_USE_MOCK=false`.

Todas las rutas privadas deben aceptar:

```http
Authorization: Bearer <token>
Content-Type: application/json
```

El token se guarda en `localStorage` con la clave `mundial_token_v1`.

## Roles

El frontend maneja tres roles:

```ts
type Role = "user" | "admin" | "support";
```

Tambien normaliza estas variantes si el backend las envia:

- `USER`, `ADMIN`, `SUPPORT`
- `ROLE_USER`, `ROLE_ADMIN`, `ROLE_SUPPORT`

Redireccion esperada:

- `user` entra a `/home`
- `admin` entra a `/admin`
- `support` entra a `/support`

## Logica de negocio

En modo real, la logica de negocio debe quedar en backend. El frontend solo debe:

- Validar formularios para mejorar experiencia de usuario.
- Mostrar datos.
- Filtrar listas visualmente cuando ya fueron cargadas.
- Enviar acciones al backend.

Reglas que debe validar el backend aunque el front tambien las revise:

- Contraseña segura en registro.
- Roles y permisos.
- Cierre de pronosticos antes del partido.
- Puntos de pollas.
- Bloqueo de predicciones.
- Limite diario de sobres.
- Monedas y billetera.
- Intercambios solo entre usuarios validos.
- Compra/cancelacion de laminas del mercado.
- Reservas, expiracion, pagos y reembolsos de entradas.
- Auditoria/logs de acciones importantes.

La logica simulada que aparece en `src/api` existe solo para demo con `VITE_USE_MOCK=true`.

## DTOs principales

### CurrentUser

```json
{
  "id": "u1",
  "name": "Sarah",
  "lastName": "Melendez",
  "email": "sarah@correo.com",
  "avatarUrl": "https://...",
  "role": "user"
}
```

### Team

```json
{
  "id": "t_col",
  "name": "Colombia",
  "code": "COL"
}
```

### Match

```json
{
  "id": "m1",
  "home": { "id": "t_col", "name": "Colombia", "code": "COL" },
  "away": { "id": "t_mex", "name": "Mexico", "code": "MEX" },
  "stadium": "MetLife Stadium",
  "city": "New Jersey",
  "startTimeISO": "2026-06-12T20:00:00.000Z",
  "status": "SCHEDULED",
  "score": { "home": 2, "away": 1 }
}
```

Estados de partido:

```ts
"SCHEDULED" | "LIVE" | "FINISHED" | "PENDING_DATA"
```

### Pool

```json
{
  "id": "p1",
  "name": "Polla de Sarah",
  "code": "ABC12345",
  "matchIds": ["m1", "m2"],
  "members": [
    {
      "user": {
        "id": "u1",
        "name": "Sarah",
        "stickers": [],
        "repeated": []
      },
      "points": 12
    }
  ]
}
```

### Prediction

```json
{
  "id": "pr1",
  "poolId": "p1",
  "userId": "u1",
  "matchId": "m1",
  "homeScore": 2,
  "awayScore": 1,
  "createdAt": "2026-04-17T12:00:00.000Z",
  "updatedAt": "2026-04-17T12:30:00.000Z",
  "locked": false,
  "lockedAt": null,
  "points": 3,
  "result": "WIN"
}
```

### Sticker

```json
{
  "id": "s1",
  "name": "Messi",
  "team": "Argentina",
  "rarity": "legend"
}
```

Rarezas:

```ts
"common" | "rare" | "legend"
```

### UserAlbum

```json
{
  "stickers": [],
  "repeated": [],
  "coins": 10,
  "packsLeft": 2
}
```

### MarketListing

```json
{
  "id": "ml1",
  "poolCode": "ABC12345",
  "sellerId": "u1",
  "sticker": { "id": "s1", "name": "Messi", "team": "Argentina", "rarity": "legend" },
  "price": 5,
  "status": "ACTIVE",
  "createdAtISO": "2026-04-17T12:00:00.000Z",
  "scope": "GLOBAL",
  "groupId": null
}
```

### FriendGroup

```json
{
  "id": "g1",
  "poolCode": "ABC12345",
  "name": "Amigos",
  "code": "GRUPO123",
  "ownerId": "u1",
  "memberIds": ["u1", "u2"],
  "createdAt": "2026-04-17T12:00:00.000Z"
}
```

### TradeOffer

```json
{
  "id": "tr1",
  "fromUserId": "u1",
  "toUserId": "u2",
  "give": { "id": "s2", "name": "Mbappe", "team": "France", "rarity": "rare" },
  "want": { "id": "s3", "name": "James", "team": "Colombia", "rarity": "rare" },
  "status": "PENDING",
  "createdAtISO": "2026-04-17T12:00:00.000Z"
}
```

### Ticket

```json
{
  "id": "tk1",
  "userId": "u1",
  "matchId": "m1",
  "quantity": 2,
  "status": "RESERVED",
  "createdAt": "2026-04-17T12:00:00.000Z",
  "expiresAt": "2026-04-17T12:10:00.000Z",
  "paidAt": null,
  "refundedAt": null,
  "paymentRef": null
}
```

Estados de ticket:

```ts
"RESERVED" | "PAID" | "CANCELLED" | "EXPIRED" | "REFUNDED" | "TRANSFERRED"
```

### PaymentMethod

```json
{
  "id": "pm1",
  "userId": "u1",
  "type": "CARD",
  "label": "Visa terminada en 1234",
  "details": "Banco",
  "isDefault": true,
  "createdAt": "2026-04-17T12:00:00.000Z"
}
```

Tipos:

```ts
"CARD" | "PSE" | "CASH" | "TRANSFER"
```

### PaymentTx

```json
{
  "id": "tx1",
  "userId": "u1",
  "kind": "TICKET",
  "ticketId": "tk1",
  "coins": null,
  "paymentMethodId": "pm1",
  "amount": 150000,
  "currency": "COP",
  "status": "PENDING",
  "createdAt": "2026-04-17T12:00:00.000Z",
  "confirmedAt": null,
  "refundAt": null,
  "provider": "MOCK_STRIPE",
  "providerRef": "stripe_ref",
  "failReason": null
}
```

Estados de pago:

```ts
"PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED"
```

### SupportRequest

```json
{
  "id": "sr1",
  "userId": "u1",
  "title": "No aparece mi reserva",
  "category": "TICKET",
  "description": "Reserve una entrada y no aparece.",
  "status": "OPEN",
  "createdAt": "2026-04-17T12:00:00.000Z",
  "updatedAt": "2026-04-17T12:00:00.000Z"
}
```

Categorias:

```ts
"TICKET" | "NOTIFICATION" | "PAYMENT" | "TRANSFER" | "OTHER"
```

Estados:

```ts
"OPEN" | "IN_REVIEW" | "CLOSED"
```

### SystemEvent

```json
{
  "id": "ev1",
  "type": "MATCH_CREATED",
  "actorId": "u_admin",
  "actorName": "Admin",
  "entityId": "m1",
  "entityType": "MATCH",
  "message": "Partido creado",
  "createdAt": "2026-04-17T12:00:00.000Z",
  "data": {}
}
```

## Endpoints

### Auth

| Metodo | Ruta | Rol | Uso |
| --- | --- | --- | --- |
| POST | `/auth/login` | publico | Iniciar sesion |
| POST | `/auth/register` | publico | Crear cuenta |
| GET | `/auth/me` | user/admin/support | Rehidratar sesion |
| POST | `/auth/logout` | user/admin/support | Cerrar sesion |

`POST /auth/login`

```json
{
  "usernameOrEmail": "sarah@correo.com",
  "password": "ClaveSegura2026*"
}
```

Respuesta:

```json
{
  "token": "jwt",
  "user": { "id": "u1", "name": "Sarah", "role": "user" }
}
```

`POST /auth/register`

```json
{
  "name": "Sarah",
  "lastName": "Melendez",
  "email": "sarah@correo.com",
  "password": "ClaveSegura2026*",
  "avatarUrl": "https://...",
  "role": "user"
}
```

### Perfil

| Metodo | Ruta | Rol | Uso |
| --- | --- | --- | --- |
| GET | `/profile/me` | user | Obtener perfil |
| PATCH | `/profile/me` | user | Actualizar perfil |

`PATCH /profile/me`

```json
{
  "name": "Sarah",
  "lastName": "Melendez",
  "email": "sarah@correo.com",
  "avatarUrl": "https://...",
  "favoriteTeams": ["Colombia"],
  "favoriteCities": ["New York"],
  "notificationsEnabled": true
}
```

### Partidos

| Metodo | Ruta | Rol | Uso |
| --- | --- | --- | --- |
| GET | `/matches` | user | Listar partidos |
| GET | `/admin/matches` | admin | Listar partidos para administracion |
| POST | `/admin/matches` | admin | Crear partido |
| PATCH | `/admin/matches/{matchId}/status` | admin | Cambiar estado |
| POST | `/admin/matches/{matchId}/result` | admin | Publicar resultado |

`POST /admin/matches`

```json
{
  "home": { "id": "team_home", "name": "Colombia", "code": "COL" },
  "away": { "id": "team_away", "name": "Mexico", "code": "MEX" },
  "city": "New Jersey",
  "stadium": "MetLife Stadium",
  "startTimeISO": "2026-06-12T20:00:00.000Z",
  "status": "SCHEDULED",
  "assignToAllPools": true
}
```

`PATCH /admin/matches/{matchId}/status`

```json
{
  "status": "LIVE"
}
```

`POST /admin/matches/{matchId}/result`

```json
{
  "homeScore": 2,
  "awayScore": 1
}
```

Al publicar resultado, el backend debe recalcular puntos de pollas.

### Pollas y pronosticos

| Metodo | Ruta | Rol | Uso |
| --- | --- | --- | --- |
| GET | `/pools` | user/admin | Listar pollas visibles |
| POST | `/pools` | user | Crear polla |
| POST | `/pools/join` | user | Unirse por codigo |
| GET | `/pools/{poolId}/predictions` | user | Ver pronosticos del pool |
| GET | `/pools/{poolId}/predictions/me` | user | Ver mis pronosticos |
| POST | `/pools/{poolId}/predictions` | user | Crear/editar pronostico |

`POST /pools`

```json
{
  "name": "Polla del curso"
}
```

`POST /pools/join`

```json
{
  "code": "ABC12345"
}
```

`POST /pools/{poolId}/predictions`

```json
{
  "matchId": "m1",
  "homeScore": 2,
  "awayScore": 1
}
```

Reglas esperadas:

- El backend identifica al usuario por el token.
- El backend bloquea pronosticos cerrados.
- El backend valida marcadores entre `0` y `20`.
- `Prediction.points` debe venir calculado si el partido ya termino.

### Grupos

| Metodo | Ruta | Rol | Uso |
| --- | --- | --- | --- |
| GET | `/groups?poolCode={poolCode}` | user | Mis grupos en una polla |
| POST | `/groups` | user | Crear grupo |
| POST | `/groups/join` | user | Unirse a grupo |
| POST | `/groups/leave` | user | Salir de grupo |

`POST /groups`

```json
{
  "poolCode": "ABC12345",
  "ownerId": "u1",
  "name": "Amigos"
}
```

`POST /groups/join`

```json
{
  "poolCode": "ABC12345",
  "userId": "u2",
  "code": "GRUPO123"
}
```

`POST /groups/leave`

```json
{
  "poolCode": "ABC12345",
  "userId": "u2",
  "groupId": "g1"
}
```

Idealmente `ownerId` y `userId` se deberian tomar del token, aunque el front hoy tambien los envia en estos endpoints.

### Album

| Metodo | Ruta | Rol | Uso |
| --- | --- | --- | --- |
| GET | `/album/{poolCode}/me` | user | Estado del album |
| POST | `/album/{poolCode}/packs/open` | user | Abrir sobre |
| POST | `/album/{poolCode}/convert` | user | Convertir repetida a monedas |
| GET | `/album/{poolCode}/events` | user | Historial del album |

`POST /album/{poolCode}/packs/open`

Body vacio:

```json
{}
```

Respuesta:

```json
[
  { "id": "s1", "name": "Messi", "team": "Argentina", "rarity": "legend" }
]
```

`POST /album/{poolCode}/convert`

```json
{
  "stickerId": "s1"
}
```

### Mercado de laminas

| Metodo | Ruta | Rol | Uso |
| --- | --- | --- | --- |
| GET | `/album/{poolCode}/market/listings` | user | Listar publicaciones activas |
| POST | `/album/{poolCode}/market/listings` | user | Publicar repetida |
| POST | `/album/{poolCode}/market/listings/{listingId}/buy` | user | Comprar lamina |
| POST | `/album/{poolCode}/market/listings/{listingId}/cancel` | user | Cancelar publicacion |

`POST /album/{poolCode}/market/listings`

```json
{
  "stickerId": "s1",
  "price": 5,
  "scope": "GLOBAL",
  "groupId": null
}
```

Reglas esperadas:

- El vendedor se toma del token.
- Solo se puede vender una lamina repetida.
- Si `scope` es `GROUP`, `groupId` es obligatorio.
- El backend mueve monedas y laminas.

### Intercambios

| Metodo | Ruta | Rol | Uso |
| --- | --- | --- | --- |
| GET | `/album/{poolCode}/trades` | user | Listar intercambios |
| POST | `/album/{poolCode}/trades` | user | Crear oferta |
| POST | `/album/{poolCode}/trades/{tradeId}/accept` | user | Aceptar oferta |

`POST /album/{poolCode}/trades`

```json
{
  "toUserId": "u2",
  "giveStickerId": "s1",
  "wantStickerId": "s2"
}
```

Reglas esperadas:

- Solo usuarios del mismo grupo/polla pueden intercambiar.
- El backend valida que las laminas existan y sean repetidas cuando aplique.
- El backend actualiza inventarios y eventos.

### Entradas

| Metodo | Ruta | Rol | Uso |
| --- | --- | --- | --- |
| GET | `/tickets/me` | user | Mis entradas |
| GET | `/tickets/{ticketId}` | user | Ver entrada |
| POST | `/tickets/reserve` | user | Reservar entradas |
| PATCH | `/tickets/{ticketId}/cancel` | user | Cancelar reserva |
| POST | `/tickets/{ticketId}/paid` | user/backend | Marcar pagada |
| POST | `/tickets/{ticketId}/refund` | user/backend | Reembolsar |

`POST /tickets/reserve`

```json
{
  "matchId": "m1",
  "quantity": 2
}
```

Reglas esperadas:

- No permitir reservar partidos en vivo/finalizados.
- No permitir reservar partidos ya iniciados.
- Cantidad recomendada: `1` a `10`.
- Reservas `RESERVED` deben expirar si no se pagan.

### Pagos

| Metodo | Ruta | Rol | Uso |
| --- | --- | --- | --- |
| GET | `/payments?userId={userId}` | user | Metodos de pago |
| POST | `/payments` | user | Agregar metodo |
| PATCH | `/payments/{paymentId}/default` | user | Marcar metodo por defecto |
| GET | `/payments/txs?userId={userId}` | user | Historial de transacciones |
| POST | `/payments/txs/ticket` | user | Crear pago de entrada |
| POST | `/payments/txs/coins` | user | Crear pago de monedas |
| POST | `/payments/txs/{txId}/confirm` | user/backend | Confirmar pago |
| POST | `/payments/txs/{txId}/refund` | user/backend | Reembolsar pago |

`POST /payments`

```json
{
  "userId": "u1",
  "type": "CARD",
  "label": "Visa terminada en 1234",
  "details": "Bancolombia"
}
```

`POST /payments/txs/ticket`

```json
{
  "userId": "u1",
  "ticketId": "tk1",
  "paymentMethodId": "pm1",
  "amount": 150000,
  "provider": "MOCK_STRIPE"
}
```

`POST /payments/txs/coins`

```json
{
  "userId": "u1",
  "coins": 10,
  "paymentMethodId": "pm1",
  "amount": 20000,
  "provider": "MOCK_STRIPE"
}
```

`POST /payments/txs/{txId}/confirm`

```json
{
  "userId": "u1"
}
```

`POST /payments/txs/{txId}/refund`

```json
{
  "userId": "u1"
}
```

Idealmente `userId` se toma del token en backend.

### Notificaciones

| Metodo | Ruta | Rol | Uso |
| --- | --- | --- | --- |
| GET | `/notifications` | user/admin/support | Listar notificaciones |
| POST | `/notifications` | admin | Crear notificacion |
| PATCH | `/notifications/{id}/read` | user/admin/support | Marcar leida |
| DELETE | `/notifications/{id}` | admin | Eliminar una |
| DELETE | `/notifications` | admin | Eliminar todas |

`POST /notifications`

```json
{
  "title": "Cambio de horario",
  "body": "El partido cambio de hora."
}
```

### Soporte

| Metodo | Ruta | Rol | Uso |
| --- | --- | --- | --- |
| GET | `/support/me` | user | Mis solicitudes |
| GET | `/support` | support | Bandeja completa |
| POST | `/support` | user | Crear solicitud |
| PATCH | `/support/{requestId}` | support | Cambiar estado |

`POST /support`

```json
{
  "title": "No aparece mi reserva",
  "category": "TICKET",
  "description": "Reserve una entrada y no aparece en mi historial."
}
```

`PATCH /support/{requestId}`

```json
{
  "status": "IN_REVIEW"
}
```

### Mapas

| Metodo | Ruta | Rol | Uso |
| --- | --- | --- | --- |
| GET | `/maps/stadiums` | user | Listar estadios |

Respuesta:

```json
[
  {
    "id": "st1",
    "name": "MetLife Stadium",
    "city": "New Jersey",
    "country": "USA",
    "lat": 40.8135,
    "lng": -74.0745
  }
]
```

### Eventos y auditoria

| Metodo | Ruta | Rol | Uso |
| --- | --- | --- | --- |
| GET | `/events` | admin | Ver eventos |
| POST | `/events` | backend/admin | Registrar evento |

`POST /events`

```json
{
  "type": "MATCH_CREATED",
  "actorId": "u_admin",
  "actorName": "Admin",
  "entityType": "MATCH",
  "entityId": "m1",
  "message": "Partido creado",
  "data": {}
}
```

Tipos usados por el frontend:

```ts
"AUTH_LOGIN"
| "AUTH_LOGOUT"
| "USER_REGISTERED"
| "PROFILE_UPDATED"
| "MATCH_CREATED"
| "MATCH_STATUS_CHANGED"
| "MATCH_RESULT_PUBLISHED"
| "TICKET_RESERVED"
| "TICKET_CANCELLED"
| "PAYMENT_CREATED"
| "PAYMENT_CONFIRMED"
| "PAYMENT_FAILED"
| "PAYMENT_REFUNDED"
| "SUPPORT_REQUEST_CREATED"
| "SUPPORT_REQUEST_UPDATED"
```

## Permisos recomendados

| Rol | Puede entrar a | Acciones |
| --- | --- | --- |
| `user` | app normal, soporte propio | perfil, partidos, pollas, album, entradas, pagos |
| `admin` | `/admin` | crear partidos, cambiar estados, publicar resultados, ver eventos |
| `support` | `/support` | ver solicitudes, cambiar estado |

## Codigos HTTP esperados

- `200`: consulta o actualizacion correcta.
- `201`: creacion correcta.
- `204`: logout o eliminaciones sin body.
- `400`: validacion incorrecta.
- `401`: no autenticado.
- `403`: rol no autorizado.
- `404`: recurso no existe.
- `409`: conflicto de negocio, por ejemplo pronostico cerrado o ticket expirado.

Cuando haya error, el frontend muestra el texto del body si el backend lo envia.

Ejemplo:

```http
409 Conflict
El pronostico ya esta cerrado.
```

## Observaciones para combinar con los diagramas

- AuthModule: cubre login, registro, logout y `/auth/me`.
- PreferenciasModule: cubre `/profile/me`.
- Match/PartidoModule: cubre `/matches` y `/admin/matches`.
- PollasModule: cubre `/pools` y `/pools/{poolId}/predictions`.
- AlbumModule: cubre `/album/{poolCode}/...`.
- EntradaModule: cubre `/tickets`.
- Pagos/Stripe sandbox: cubre `/payments` y `/payments/txs`.
- SoporteModule: cubre `/support`.
- Logs/AuditoriaModule: cubre `/events`.
- MapsModule: cubre `/maps/stadiums`.

## Pendientes recomendados para backend

- Tomar `userId` desde JWT en endpoints donde el front aun lo envia.
- Mantener nombres de campos iguales a los DTOs anteriores para evitar adaptadores.
- Devolver fechas en ISO string.
- Devolver `points` calculados en `Prediction` y `PoolMember`.
- Hacer auditoria desde backend para que no dependa del cliente.
- Validar permisos por rol en cada endpoint.
