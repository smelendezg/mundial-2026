# Contrato de integración Backend - Frontend Mundial 2026

Este frontend está preparado para trabajar en dos modos:

- `VITE_USE_MOCK=true`: usa datos simulados locales.
- `VITE_USE_MOCK=false`: consume el backend definido en `VITE_API_BASE_URL`.

El backend esperado corresponde a la arquitectura de los diagramas: React App + Spring Boot + MySQL, con integraciones a API Football, Firebase/FCM, Stripe/sandbox y servicio de mapas.

## Configuración

```env
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://localhost:8000
```

Todas las rutas privadas deben aceptar:

```http
Authorization: Bearer <token>
Content-Type: application/json
```

## AuthModule

### POST `/auth/login`

Request:

```json
{
  "usernameOrEmail": "sarah@correo.com",
  "password": "ClaveSegura2026*"
}
```

Response:

```json
{
  "token": "jwt-token",
  "user": {
    "id": "u1",
    "name": "Sarah",
    "lastName": "Melendez",
    "email": "sarah@correo.com",
    "avatarUrl": "data-or-url",
    "role": "user"
  }
}
```

Roles esperados por el frontend: `user`, `admin`, `support`.
También se aceptan respuestas tipo `USER`, `ADMIN`, `SUPPORT`, `ROLE_USER`, `ROLE_ADMIN` o `ROLE_SUPPORT`; el front las normaliza.

### POST `/auth/register`

Request:

```json
{
  "name": "Sarah",
  "lastName": "Melendez",
  "email": "sarah@correo.com",
  "password": "ClaveSegura2026*",
  "avatarUrl": "data-or-url",
  "role": "user"
}
```

Response: igual a login.

### GET `/auth/me`

Response: objeto `user`.

### POST `/auth/logout`

Response: `204 No Content`.

## PreferenciasModule

### GET `/profile/me`

Response:

```json
{
  "userId": "u1",
  "name": "Sarah",
  "lastName": "Melendez",
  "email": "sarah@correo.com",
  "avatarUrl": "data-or-url",
  "favoriteTeams": ["Colombia", "Argentina"],
  "favoriteCities": ["Ciudad de México"],
  "notificationsEnabled": true,
  "updatedAt": "2026-04-16T20:00:00Z"
}
```

### PATCH `/profile/me`

Request: campos parciales del perfil.

## MatchModule / PartidoModule

### GET `/matches`

Response: lista de partidos:

```json
{
  "id": "m1",
  "home": { "id": "t_col", "name": "Colombia", "code": "COL" },
  "away": { "id": "t_mex", "name": "México", "code": "MEX" },
  "stadium": "Estadio Azteca",
  "city": "Ciudad de México",
  "startTimeISO": "2026-06-10T20:00:00Z",
  "status": "SCHEDULED",
  "score": { "home": 0, "away": 0 },
  "events": []
}
```

Estados válidos: `SCHEDULED`, `LIVE`, `FINISHED`, `PENDING_DATA`.

## Admin / Operador

### GET `/admin/matches`

Lista todos los partidos.

### POST `/admin/matches`

Crea un partido.

### PATCH `/admin/matches/{matchId}/status`

Request:

```json
{ "status": "LIVE" }
```

### POST `/admin/matches/{matchId}/result`

Request:

```json
{ "homeScore": 2, "awayScore": 1 }
```

## PollasModule

### GET `/pools`

Response: lista de pollas:

```json
{
  "id": "p1",
  "name": "Familia Mundialista",
  "code": "ABC12345",
  "matchIds": ["m1", "m2"],
  "members": [
    {
      "user": { "id": "u1", "name": "Sarah", "stickers": [], "repeated": [] },
      "points": 0
    }
  ]
}
```

### POST `/pools`

Request:

```json
{ "name": "Familia Mundialista" }
```

### POST `/pools/join`

Request:

```json
{ "code": "ABC12345" }
```

### GET `/pools/{poolId}/predictions`

Lista pronósticos de la polla.

### GET `/pools/{poolId}/predictions/me`

Lista pronósticos del usuario autenticado.

### POST `/pools/{poolId}/predictions`

Request:

```json
{
  "matchId": "m1",
  "homeScore": 2,
  "awayScore": 1
}
```

## Grupos de amigos

### GET `/groups?poolCode=AMIGOS2026`

Lista grupos del usuario autenticado dentro de la polla.

### POST `/groups`

Request:

```json
{
  "poolCode": "AMIGOS2026",
  "ownerId": "u1",
  "name": "Los cracks"
}
```

### POST `/groups/join`

Request:

```json
{
  "poolCode": "AMIGOS2026",
  "userId": "u1",
  "code": "A1B2C3D4"
}
```

### POST `/groups/leave`

Request:

```json
{
  "poolCode": "AMIGOS2026",
  "userId": "u1",
  "groupId": "g1"
}
```

## AlbumModule

### GET `/album/{poolCode}/me`

Response:

```json
{
  "stickers": [],
  "repeated": [],
  "coins": 0,
  "packsLeft": 3
}
```

### POST `/album/{poolCode}/packs/open`

Response: lista de láminas.

### POST `/album/{poolCode}/convert`

Request:

```json
{ "stickerId": "s1" }
```

### GET `/album/{poolCode}/events`

Lista eventos del álbum.

## Marketplace del álbum

### GET `/album/{poolCode}/market/listings`

Lista publicaciones activas.

### POST `/album/{poolCode}/market/listings`

Request:

```json
{
  "stickerId": "s1",
  "price": 5,
  "scope": "GLOBAL",
  "groupId": null
}
```

### POST `/album/{poolCode}/market/listings/{listingId}/buy`

Compra una publicación.

### POST `/album/{poolCode}/market/listings/{listingId}/cancel`

Cancela una publicación propia.

## Intercambios

### GET `/album/{poolCode}/trades`

Lista ofertas de intercambio.

### POST `/album/{poolCode}/trades`

Request:

```json
{
  "toUserId": "u2",
  "giveStickerId": "s3",
  "wantStickerId": "s4"
}
```

### POST `/album/{poolCode}/trades/{tradeId}/accept`

Acepta la oferta.

## EntradaModule

### GET `/tickets/me`

Lista entradas del usuario autenticado.

### GET `/tickets/{ticketId}`

Obtiene una entrada.

### POST `/tickets/reserve`

Request:

```json
{
  "matchId": "m1",
  "quantity": 2
}
```

### PATCH `/tickets/{ticketId}/cancel`

Cancela reserva.

### POST `/tickets/{ticketId}/paid`

Request:

```json
{ "paymentRef": "stripe-ref" }
```

### POST `/tickets/{ticketId}/refund`

Marca entrada como reembolsada.

## Pagos / Stripe sandbox

### GET `/payments?userId={userId}`

Lista métodos de pago.

### POST `/payments`

Agrega método de pago.

### PATCH `/payments/{paymentId}/default`

Marca método por defecto.

### GET `/payments/txs?userId={userId}`

Lista transacciones.

### POST `/payments/txs/ticket`

Crea transacción para ticket.

### POST `/payments/txs/coins`

Crea transacción para monedas.

### POST `/payments/txs/{txId}/confirm`

Confirma pago.

### POST `/payments/txs/{txId}/refund`

Reembolsa pago.

## Notificaciones / Firebase

### GET `/notifications`

Lista notificaciones.

### POST `/notifications`

Request:

```json
{
  "title": "Cambio de horario",
  "body": "El partido se movió a las 8:00 PM"
}
```

### PATCH `/notifications/{id}/read`

Marca como leída.

### DELETE `/notifications/{id}`

Elimina una notificación.

## Soporte / Trazabilidad

### GET `/support/me`

Lista solicitudes del usuario.

### GET `/support`

Lista todas las solicitudes para el rol `support`.

### POST `/support`

Request:

```json
{
  "title": "No aparece mi reserva",
  "category": "TICKET",
  "description": "Reservé una entrada y no aparece en mi historial."
}
```

### PATCH `/support/{requestId}`

Request:

```json
{ "status": "IN_REVIEW" }
```

## Eventos / Logs

### POST `/events`

Registra evento.

### GET `/events`

Lista eventos para auditoría.

## Servicio de mapas

### GET `/maps/stadiums`

Response:

```json
[
  {
    "id": "azteca",
    "name": "Estadio Azteca",
    "city": "Ciudad de México",
    "country": "México",
    "lat": 19.3029,
    "lng": -99.1505
  }
]
```

## Notas importantes para combinar

- El frontend espera fechas en ISO string.
- El frontend espera `role` como `user`, `admin` o `support`.
- Para producción, el backend debe mapear sus entidades Java a DTOs con estos nombres o el frontend necesitará adaptadores.
- Si algún endpoint aún no existe, se puede mantener `VITE_USE_MOCK=true` por módulo durante la entrega.
