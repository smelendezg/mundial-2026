# Explicacion para sustentar el frontend

Este documento explica como funciona el frontend del proyecto Mundial 2026, que hace cada parte y como se conecta con el backend.

## 1. Idea general del proyecto

El frontend es una aplicacion React con TypeScript. Esta organizado por pantallas, tipos de datos y servicios de API.

La aplicacion permite:

- Registrar e iniciar sesion.
- Manejar tres roles: usuario, administrador y soporte.
- Ver partidos del Mundial.
- Crear y unirse a pollas.
- Hacer pronosticos.
- Ver ranking.
- Usar album de laminas.
- Abrir sobres.
- Convertir repetidas en monedas.
- Usar mercado de laminas.
- Crear intercambios.
- Reservar entradas.
- Manejar pagos.
- Ver mapa de estadios.
- Crear solicitudes de soporte.
- Atender solicitudes desde el rol soporte.
- Administrar partidos desde el rol admin.

## 2. Tecnologias usadas

- React: construye las pantallas.
- TypeScript: ayuda a que los datos tengan tipos claros.
- Vite: levanta y compila el proyecto.
- Material UI: componentes visuales como botones, alertas, formularios y tarjetas.
- React Router: maneja rutas como `/login`, `/home`, `/admin`, `/support`.
- Fetch API: hace peticiones HTTP al backend.

## 3. Estructura principal de carpetas

### `src/pages`

Aqui estan las pantallas completas.

Ejemplos:

- `Login.tsx`: inicio de sesion.
- `Register.tsx`: registro.
- `Home.tsx`: inicio del usuario.
- `Matches.tsx`: listado y filtros de partidos.
- `Pools.tsx`: crear o unirse a pollas.
- `PollDetail.tsx`: detalle de una polla y pronosticos.
- `Album.tsx`: album de laminas.
- `Marketplace.tsx`: mercado de laminas repetidas.
- `Trades.tsx`: intercambios entre usuarios.
- `Tickets.tsx`: reservas de entradas.
- `Payments.tsx`: metodos de pago e historial.
- `Checkout.tsx`: proceso de pago.
- `Admin.tsx`: panel del administrador.
- `Support.tsx`: soporte para usuario o mesa de soporte.
- `Maps.tsx`: mapa real de estadios.

### `src/api`

Aqui esta la capa que habla con el backend.

La idea es que las pantallas no llamen `fetch` directamente. En vez de eso llaman funciones como:

- `loginApi`
- `getMatches`
- `getPools`
- `upsertPrediction`
- `reserveTicket`
- `createSupportRequest`

Esto es una buena practica porque si el backend cambia una ruta, se cambia en un solo archivo de `src/api`, no en todas las pantallas.

### `src/types`

Aqui estan los tipos de datos.

Ejemplos:

- `Match`: estructura de un partido.
- `Pool`: estructura de una polla.
- `Prediction`: estructura de un pronostico.
- `Sticker`: estructura de una lamina.
- `Ticket`: estructura de una entrada.
- `PaymentTx`: estructura de una transaccion.
- `SupportRequest`: estructura de una solicitud de soporte.

Esto ayuda a que frontend y backend hablen el mismo idioma.

### `src/context`

Aqui esta `AppContext.tsx`, que guarda la sesion actual:

- usuario logueado.
- rol.
- pool activa.
- funcion `login`.
- funcion `logout`.
- estado de carga de autenticacion.

Asi cualquier pantalla puede saber quien esta logueado usando:

```ts
const { user } = useApp();
```

### `src/utils`

Aqui estan utilidades compartidas.

Por ejemplo:

- `validation.ts`: validaciones de formularios.
- `countries.ts`: banderas y nombres de selecciones.

### `src/theme`

Aqui esta la configuracion visual y el archivo de banners.

En `bannerImages.ts` se centralizan las imagenes:

```ts
export const bannerImages = {
  login: "...",
  matches: "...",
  admin: "...",
  support: "...",
};
```

Si quiero cambiar la foto de un banner, cambio la URL ahi y no tengo que buscar en toda la app.

## 4. Como se conecta con el backend

La conexion esta centralizada en:

```txt
src/api/http.ts
```

Ese archivo tiene una funcion interna `request`, que arma la peticion:

```ts
fetch(`${API_BASE_URL}${path}`, {
  method,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify(body),
});
```

La URL base sale de:

```txt
src/api/config.ts
```

```ts
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
```

Para conectarlo al backend real:

```env
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://localhost:8000
```

Cuando `VITE_USE_MOCK=true`, el frontend usa datos simulados para poder presentar sin backend.

Cuando `VITE_USE_MOCK=false`, usa endpoints reales.

## 5. Por que hay mock en el frontend

El mock existe para desarrollo y demostracion. No es la logica final del sistema.

Por ejemplo, en modo mock se simulan:

- puntos de pollas.
- monedas.
- pagos.
- entradas.
- album.
- soporte.

Pero en modo real esas reglas deben vivir en backend. El frontend solo envia acciones y muestra respuestas.

Esta separacion permite que el companero de backend conecte Spring Boot sin rehacer las pantallas.

## 6. Roles y rutas

Los roles son:

```ts
type Role = "user" | "admin" | "support";
```

### Usuario

Puede entrar a:

- `/home`
- `/matches`
- `/profile`
- `/pools`
- `/album`
- `/marketplace`
- `/trades`
- `/tickets`
- `/payments`
- `/notifications`
- `/support`
- `/maps`

### Admin

Puede entrar a:

- `/admin`

Admin sirve para:

- crear partidos.
- cambiar estados.
- publicar resultados.
- ver pollas y rankings.
- ver eventos del sistema.

### Soporte

Puede entrar a:

- `/support`

Soporte sirve para:

- ver todas las solicitudes.
- filtrar por estado o categoria.
- cambiar estado de solicitudes.

## 7. Flujo de autenticacion

### Login

Pantalla:

```txt
src/pages/Login.tsx
```

API:

```txt
src/api/authApi.ts
```

Funcion:

```ts
loginApi(usernameOrEmail, password)
```

Endpoint:

```http
POST /auth/login
```

Body:

```json
{
  "usernameOrEmail": "correo@correo.com",
  "password": "ClaveSegura2026*"
}
```

El backend responde:

```json
{
  "token": "jwt",
  "user": {
    "id": "u1",
    "name": "Sarah",
    "role": "user"
  }
}
```

El token se guarda en localStorage y luego se manda en cada request privada.

### Rehidratacion de sesion

Cuando se recarga la pagina, `AppContext.tsx` llama:

```ts
getMeApi()
```

Endpoint:

```http
GET /auth/me
```

Eso permite que la sesion no se pierda al actualizar el navegador.

## 8. Registro y validaciones

Pantalla:

```txt
src/pages/Register.tsx
```

Valida:

- nombre obligatorio.
- apellido obligatorio.
- correo valido.
- contrasena segura.
- avatar JPG, PNG o WEBP.
- avatar maximo 1 MB.

La contrasena debe tener:

- minimo 8 caracteres.
- una mayuscula.
- una minuscula.
- un numero.
- un simbolo.

Funcion de validacion:

```txt
src/utils/validation.ts
```

Endpoint:

```http
POST /auth/register
```

## 9. Perfil

Pantalla:

```txt
src/pages/Profile.tsx
```

Permite editar:

- nombre.
- apellido.
- correo.
- avatar.
- selecciones favoritas.
- ciudades favoritas.
- notificaciones activas.

Endpoints:

```http
GET /profile/me
PATCH /profile/me
```

El frontend valida los campos antes de enviarlos.

## 10. Partidos

Pantalla:

```txt
src/pages/Matches.tsx
```

API:

```txt
src/api/matchesApi.ts
```

Endpoint:

```http
GET /matches
```

La pantalla permite filtrar por:

- seleccion.
- ciudad.
- estadio.
- estado.

Este filtro es visual. El backend puede enviar todos los partidos y el front filtra localmente.

Si el backend prefiere filtrar desde servidor, mas adelante se podrian agregar query params.

## 11. Admin

Pantalla:

```txt
src/pages/Admin.tsx
```

Rol:

```txt
admin
```

Endpoints usados:

```http
GET /admin/matches
POST /admin/matches
PATCH /admin/matches/{matchId}/status
POST /admin/matches/{matchId}/result
GET /pools
GET /events
```

### Crear partido

El formulario valida:

- equipo local obligatorio.
- equipo visitante obligatorio.
- local y visitante no pueden ser iguales.
- ciudad obligatoria.
- estadio obligatorio.
- fecha obligatoria.
- fecha futura.

El body enviado:

```json
{
  "home": { "id": "team_1", "name": "Colombia", "code": "COL" },
  "away": { "id": "team_2", "name": "Mexico", "code": "MEX" },
  "city": "New Jersey",
  "stadium": "MetLife Stadium",
  "startTimeISO": "2026-06-12T20:00:00.000Z",
  "status": "SCHEDULED",
  "assignToAllPools": true
}
```

### Publicar resultado

Valida:

- goles enteros.
- minimo 0.
- maximo 20.

Body:

```json
{
  "homeScore": 2,
  "awayScore": 1
}
```

Cuando se publica el resultado, el backend debe recalcular puntos.

## 12. Pollas

Pantalla:

```txt
src/pages/Pools.tsx
```

API:

```txt
src/api/poolsApi.ts
```

Endpoints:

```http
GET /pools
POST /pools
POST /pools/join
```

Validaciones:

- nombre de polla obligatorio.
- nombre minimo 4 caracteres.
- codigo obligatorio.
- codigo entre 4 y 20 caracteres.
- codigo solo letras, numeros y guion.

El frontend muestra solo las pollas donde el usuario es miembro.

## 13. Detalle de polla y pronosticos

Pantalla:

```txt
src/pages/PollDetail.tsx
```

Endpoints:

```http
GET /pools
GET /matches
GET /pools/{poolId}/predictions
GET /pools/{poolId}/predictions/me
POST /pools/{poolId}/predictions
```

Esta pantalla:

- busca la polla por codigo.
- carga los partidos de esa polla.
- carga los pronosticos del usuario.
- carga pronosticos del grupo.
- permite guardar marcador.
- muestra ranking.

Validaciones:

- marcador local entero.
- marcador visitante entero.
- rango 0 a 20.
- no deja editar si el partido esta cerrado.

Regla de cierre visible:

```ts
CLOSE_MINUTES_BEFORE = 10;
```

Importante: el backend tambien debe validar el cierre. El front lo muestra para experiencia de usuario, pero la seguridad real debe estar en backend.

## 14. Album

Pantalla:

```txt
src/pages/Album.tsx
```

Endpoints:

```http
GET /album/{poolCode}/me
POST /album/{poolCode}/packs/open
POST /album/{poolCode}/convert
GET /album/{poolCode}/events
```

La pantalla muestra:

- laminas por pais.
- progreso del album.
- repetidas.
- monedas.
- sobres disponibles.
- historial.

Reglas que debe manejar backend:

- limite diario de sobres.
- si una lamina es nueva o repetida.
- conversion de repetidas a monedas.
- historial de eventos.

## 15. Mercado

Pantalla:

```txt
src/pages/Marketplace.tsx
```

Endpoints:

```http
GET /album/{poolCode}/market/listings
POST /album/{poolCode}/market/listings
POST /album/{poolCode}/market/listings/{listingId}/buy
POST /album/{poolCode}/market/listings/{listingId}/cancel
```

Validaciones de front:

- precio minimo.
- precio maximo.
- debe seleccionar lamina repetida.
- si el mercado es de grupo, debe haber grupo.

Reglas de backend:

- validar que la lamina si sea repetida.
- descontar monedas al comprador.
- sumar monedas al vendedor.
- mover lamina al inventario del comprador.
- cancelar solo publicaciones propias.

## 16. Intercambios

Pantalla:

```txt
src/pages/Trades.tsx
```

Endpoints:

```http
GET /album/{poolCode}/trades
POST /album/{poolCode}/trades
POST /album/{poolCode}/trades/{tradeId}/accept
```

Validaciones:

- debe existir otro usuario.
- debe seleccionar lamina que entrega.
- debe seleccionar lamina que quiere.
- no puede enviarse intercambio a si mismo.
- no puede intercambiar la misma lamina por ella misma.
- evita duplicar una oferta pendiente igual.

Reglas de backend:

- validar que ambos usuarios pertenezcan al grupo/polla.
- validar inventarios.
- actualizar laminas de ambos.
- registrar evento.

## 17. Entradas

Pantalla:

```txt
src/pages/Tickets.tsx
```

Endpoints:

```http
GET /tickets/me
GET /tickets/{ticketId}
POST /tickets/reserve
PATCH /tickets/{ticketId}/cancel
POST /tickets/{ticketId}/paid
POST /tickets/{ticketId}/refund
```

Validaciones:

- cantidad minima.
- cantidad maxima.
- debe seleccionar partido.

Reglas de backend:

- no reservar partidos iniciados.
- no reservar partidos finalizados.
- expirar reservas.
- no cancelar tickets pagados si no corresponde.
- manejar estados de ticket.

## 18. Pagos

Pantallas:

```txt
src/pages/Payments.tsx
src/pages/Checkout.tsx
```

Endpoints:

```http
GET /payments?userId={userId}
POST /payments
PATCH /payments/{paymentId}/default
GET /payments/txs?userId={userId}
POST /payments/txs/ticket
POST /payments/txs/coins
POST /payments/txs/{txId}/confirm
POST /payments/txs/{txId}/refund
```

Validaciones en metodos de pago:

- nombre obligatorio.
- nombre entre 4 y 40 caracteres.
- referencia obligatoria.
- referencia entre 4 y 40 caracteres.
- referencia solo con letras, numeros, espacios, puntos, guiones o asteriscos.
- si es tarjeta debe incluir al menos 4 numeros.

Validaciones en checkout:

- metodo de pago obligatorio.
- valor entre $1.000 y $20.000.000 COP.
- ticketId valido si es pago de entrada.
- monedas enteras entre 1 y 500 si es compra de monedas.

Reglas de backend:

- crear transaccion.
- confirmar con proveedor.
- cambiar estado de ticket.
- sumar monedas si compra monedas.
- permitir reembolso solo si aplica.

## 19. Soporte

Pantalla:

```txt
src/pages/Support.tsx
```

Funciona diferente segun rol:

### Usuario

Puede:

- crear solicitud.
- ver sus solicitudes.

Endpoint:

```http
GET /support/me
POST /support
```

Validaciones:

- asunto minimo 6 caracteres.
- descripcion minimo 20 caracteres.
- categoria obligatoria.

### Soporte

Puede:

- ver todas las solicitudes.
- filtrar por estado.
- filtrar por categoria.
- cambiar estado.

Endpoints:

```http
GET /support
PATCH /support/{requestId}
```

## 20. Notificaciones

Pantalla:

```txt
src/pages/Notifications.tsx
```

Endpoints:

```http
GET /notifications
POST /notifications
PATCH /notifications/{id}/read
DELETE /notifications/{id}
DELETE /notifications
```

Validaciones:

- titulo minimo 5 caracteres.
- mensaje minimo 10 caracteres.

## 21. Mapas

Pantalla:

```txt
src/pages/Maps.tsx
```

Endpoint:

```http
GET /maps/stadiums
```

La pantalla usa OpenStreetMap con las coordenadas que entrega el backend:

```json
{
  "lat": 40.8135,
  "lng": -74.0745
}
```

El frontend arma el iframe del mapa.

## 22. Eventos y auditoria

Pantalla:

```txt
src/pages/Admin.tsx
```

Endpoint:

```http
GET /events
```

La idea es que el backend registre eventos importantes:

- login.
- logout.
- registro.
- partido creado.
- estado de partido cambiado.
- resultado publicado.
- ticket reservado.
- ticket cancelado.
- pago creado.
- pago confirmado.
- pago fallido.
- soporte creado.
- soporte actualizado.

El front solo los muestra.

## 23. Relacion con los diagramas

Segun los diagramas del trabajo, el frontend encaja asi:

- AuthModule: `authApi.ts`, `Login.tsx`, `Register.tsx`, `AppContext.tsx`.
- PreferenciasModule: `profileApi.ts`, `Profile.tsx`.
- PartidoModule: `matchesApi.ts`, `adminApi.ts`, `Matches.tsx`, `Admin.tsx`.
- PollasModule: `poolsApi.ts`, `predictionsApi.ts`, `Pools.tsx`, `PollDetail.tsx`.
- AlbumModule: `albumApi.ts`, `marketApi.ts`, `tradesApi.ts`, `Album.tsx`, `Marketplace.tsx`, `Trades.tsx`.
- EntradaModule: `ticketsApi.ts`, `Tickets.tsx`.
- PagosModule: `paymentsApi.ts`, `Payments.tsx`, `Checkout.tsx`.
- SoporteModule: `supportApi.ts`, `Support.tsx`.
- Logs/AuditoriaModule: `eventsApi.ts`, parte de `Admin.tsx`.
- MapsModule: `mapsApi.ts`, `Maps.tsx`.
- NotificacionesModule/Firebase: `notificationApi.ts`, `Notifications.tsx`.

## 24. Que logica queda en frontend y por que

En frontend queda:

- Validacion visual de formularios.
- Filtros de busqueda.
- Ordenamiento para mostrar listas.
- Mensajes de error.
- Render de pantallas.
- Proteccion de rutas por rol para experiencia de usuario.

Eso es normal en frontend.

Lo que no debe depender solo del frontend:

- permisos reales.
- puntos.
- pagos.
- inventarios.
- monedas.
- bloqueo de pronosticos.
- expiracion de tickets.
- auditoria real.

Esas reglas deben repetirse o vivir definitivamente en backend.

## 25. Como explicar el modo mock

Puedes decir:

> El modo mock se hizo para poder presentar y probar el frontend sin esperar a que el backend estuviera listo. Cuando `VITE_USE_MOCK=false`, las funciones de `src/api` cambian a llamadas HTTP reales. Por eso las pantallas ya estan preparadas para conectarse al backend.

## 26. Como correr el proyecto

Instalar dependencias:

```bash
npm install
```

Levantar desarrollo:

```bash
npm run dev
```

Compilar:

```bash
npm run build
```

Revisar lint:

```bash
npm run lint
```

## 27. Como conectar con backend

Cambiar `.env`:

```env
VITE_USE_MOCK=false
VITE_API_BASE_URL=http://localhost:8000
```

Luego levantar:

```bash
npm run dev
```

El backend debe permitir CORS para el puerto de Vite, por ejemplo:

```txt
http://localhost:5173
http://127.0.0.1:5173
```

Si Vite usa otro puerto, tambien debe agregarse.

## 28. Archivos que conviene mostrar en la sustentacion

- `src/App.tsx`: rutas y proteccion por rol.
- `src/context/AppContext.tsx`: sesion global.
- `src/api/http.ts`: conexion HTTP y token.
- `src/api/authApi.ts`: login, registro y roles.
- `src/pages/Admin.tsx`: panel admin.
- `src/pages/Support.tsx`: soporte por rol.
- `src/pages/PollDetail.tsx`: pronosticos.
- `src/utils/validation.ts`: validaciones.
- `BACKEND_HANDOFF.md`: contrato con backend.

## 29. Resumen corto para decirlo oralmente

El frontend esta separado por responsabilidades. Las pantallas muestran y validan datos, pero no deberian quedarse con la logica real del negocio. La comunicacion con backend esta centralizada en `src/api`, y todas las rutas reales estan documentadas en `BACKEND_HANDOFF.md`. El proyecto maneja tres roles: usuario, admin y soporte. Usuario usa la app normal, admin gestiona partidos y auditoria, y soporte atiende solicitudes. Para conectar con Spring Boot solo se cambia `VITE_USE_MOCK=false` y se implementan los endpoints con los DTOs documentados.
