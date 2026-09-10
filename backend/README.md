# Backend · Desafui Fintech

API REST desarrollada con **Node.js, Express 5 y TypeScript** para consultar un score de riesgo asociado a un RUT.

La implementación utiliza autenticación mediante JWT y autorización basada en roles. Para este desafío se trabajó con información mock, por lo que no existe conexión a una base de datos.

## Requisitos

* Node.js >= 20.
* Copiar `.env.example` a `.env`.
* Definir la variable `JWT_SECRET`, con un mínimo de 16 caracteres.

La aplicación valida esta configuración al iniciar. Si `JWT_SECRET` no está definida (fuera del entorno de test), la aplicación no inicia.

## Scripts

```bash
npm run dev       # Inicia el servidor en modo desarrollo con recarga automática
npm run build     # Compila TypeScript y genera la carpeta dist/
npm start         # Inicia la aplicación compilada
npm run typecheck # Ejecuta las validaciones de TypeScript, incluyendo los tests
npm test          # Ejecuta los tests unitarios y de integración
npm run lint      # Ejecuta ESLint
```

## Arquitectura

La estructura del proyecto busca mantener separadas las responsabilidades y evitar que la lógica de negocio quede directamente acoplada a Express o a alguna librería específica.

```text
src/

├── app.ts                  # Configuración principal de Express
│                           # middlewares, rutas y manejo de errores
│
├── server.ts               # Punto de entrada de la aplicación
│
├── config/
│   ├── env.ts              # Carga y validación de variables de entorno
│   └── di.ts               # Composition root y configuración de dependencias
│
├── domain/
│   ├── user.ts             # Modelo de usuario
│   ├── role.ts             # Roles disponibles
│   └── rut.ts              # Conceptos relacionados con el RUT
│
├── data/
│   └── mock-users.ts       # Usuarios mock utilizados por la aplicación
│
├── repositories/
│   ├── user.repository.ts  # Contrato del repositorio
│   └── mock-user.repository.ts
│
├── services/
│   ├── auth.service.ts     # Lógica de autenticación
│   ├── score.service.ts    # Lógica asociada al score
│   └── jwt.service.ts      # Encapsula el manejo de JWT
│
├── controllers/            # Capa que recibe las peticiones HTTP
│
├── openapi/
│   └── spec.ts             # Definición OpenAPI 3.0
│
├── middlewares/
│   ├── authenticate.ts     # Validación del token JWT
│   ├── authorize-score.ts  # Validación de permisos sobre el RUT
│   ├── error-handler.ts    # Manejo centralizado de errores
│   ├── not-found.ts        # Manejo de rutas inexistentes
│   └── rate-limiter.ts     # Control de cantidad de solicitudes
│
├── routes/
│   ├── auth.routes.ts
│   ├── score.routes.ts
│   └── index.ts
│
├── validators/             # Validaciones de entrada
│
├── errors/                 # Errores HTTP tipados
│
├── types/                  # DTOs, payload JWT y extensiones de Express
│
└── utils/
    ├── rut-utils.ts
    ├── score-calculator.ts
    ├── password.ts
    └── logger.ts
```

### Principales decisiones de diseño

**Composition Root**

Las dependencias de la aplicación se construyen desde `config/di.ts`. De esta manera, los servicios no necesitan conocer directamente las implementaciones concretas que utilizan.

Por ejemplo, `ScoreService` trabaja con la abstracción `ScoreCalculator`, mientras que `AuthService` utiliza `UserRepository`. Esto facilita cambiar una implementación posteriormente sin tener que modificar toda la lógica de negocio.

**Separación de responsabilidades**

La aplicación sigue una separación sencilla entre repositorios, servicios, controladores, rutas y middlewares.

La idea es que cada capa tenga una responsabilidad clara:

```text
Request
   ↓
Route
   ↓
Middleware
   ↓
Controller
   ↓
Service
   ↓
Repository / Domain
```

La lógica relacionada con el RUT, roles y cálculo del score se mantiene fuera de los controladores.

**Encapsulamiento de JWT**

El manejo de `jsonwebtoken` está concentrado en `JwtService`.

El resto de la aplicación no necesita conocer los detalles de la librería. El servicio se encarga de generar y validar tokens y transforma errores como tokens inválidos o vencidos en errores de autenticación de la API.

**Manejo centralizado de errores**

Los errores controlados utilizan `ApiError`, permitiendo mantener una respuesta HTTP consistente.

Los errores no controlados se registran internamente y se responde con un `500` genérico, evitando exponer información interna o stack traces al consumidor de la API.

**Uso de Express 5**

Se aprovecha el manejo de errores de promesas incorporado en Express 5, por lo que los controladores asíncronos pueden propagar sus errores directamente al middleware global de errores sin utilizar wrappers adicionales como `asyncHandler`.

## Autenticación y autorización

El endpoint de login recibe un RUT y una contraseña:

```http
POST /login
```

El flujo es:

1. Se valida la estructura del request.
2. Se normaliza y valida el RUT.
3. Se busca el usuario en el repositorio mock.
4. Se compara la contraseña utilizando `bcrypt`.
5. Si las credenciales son correctas, se genera un JWT.
6. El token contiene la información necesaria para posteriormente validar los permisos.

Cuando las credenciales son incorrectas, se devuelve la misma respuesta `401`, independientemente de si el usuario no existe o si la contraseña es incorrecta. Esto evita entregar información que permita identificar usuarios válidos.

El payload utilizado por el token es:

```json
{
  "sub": "user-001",
  "role": "user",
  "rut": "12345678-5"
}
```

El RUT se incluye en el token para los usuarios que necesitan consultar su propio score.

### Autorización del score

El endpoint:

```http
GET /score/:rut
```

utiliza tres middlewares principales:

1. **Rate limiter:** limita las solicitudes a 120 por minuto por IP.
2. **Autenticación:** valida que exista un `Bearer Token` válido y que no esté vencido.
3. **Autorización:** verifica si el usuario tiene permiso para consultar el RUT solicitado.

La regla de autorización es sencilla:

* `admin`: puede consultar cualquier RUT.
* `user`: solamente puede consultar el RUT asociado a su propio token.
* Un RUT con formato inválido genera `400`, independiente del rol.

## API

### `POST /login`

Permite autenticar a un usuario.

Request:

```json
{
  "rut": "12.345.678-5",
  "password": "password"
}
```

Respuesta `200`:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": "1h",
  "user": {
    "id": "user-001",
    "rut": "12.345.678-5",
    "role": "user"
  }
}
```

Posibles respuestas:

* `400` — Request o RUT inválido.
* `401` — Credenciales incorrectas.
* `429` — Se superó el límite de solicitudes.

### `GET /score/:rut`

Permite obtener el score asociado a un RUT.

Requiere:

```http
Authorization: Bearer <token>
```

Respuesta `200`:

```json
{
  "rut": "12.345.678-5",
  "score": 33,
  "fecha": "2026-09-09T00:21:21.522Z"
}
```

Posibles respuestas:

* `400` — RUT inválido.
* `401` — Token inexistente, inválido o vencido.
* `403` — El usuario no tiene permisos para consultar ese RUT.
* `404` — Ruta inexistente.
* `429` — Se superó el límite de solicitudes.
* `500` — Error interno no controlado.

## Swagger / OpenAPI

La API incluye documentación mediante OpenAPI 3.0.

* `GET /openapi.json` — Entrega la especificación OpenAPI.
* `GET /api-docs` — Abre la interfaz Swagger para consultar y probar los endpoints.

La especificación se mantiene en `src/openapi/spec.ts`, evitando tener una definición separada de la API que pueda quedar desactualizada.

## Validación del RUT chileno

La validación del RUT está separada en dos responsabilidades:

* `utils/rut-utils.ts`: normalización y cálculo del dígito verificador.
* `validators/rut.validator.ts`: validación del formato y del dígito verificador.

El RUT se normaliza a un formato canónico para que distintas representaciones del mismo RUT sean tratadas de manera consistente.

Por ejemplo:

```text
12345678-5
12.345.678-5
```

representan el mismo RUT y son normalizados antes de realizar las comparaciones.

Durante la implementación también se verificó el cálculo del dígito verificador. Como resultado de esa validación, se documentó que `12.345.678-9` no corresponde a un RUT válido; para `12.345.678`, el dígito verificador correcto es `5`.

## Cálculo del Score

Para este desafío no existe una fuente externa de información de riesgo, por lo que se implementó un cálculo determinista que permite obtener siempre el mismo resultado para un mismo RUT.

La implementación se encuentra en:

```text
utils/score-calculator.ts
```

Se definió una interfaz `ScoreCalculator` y una implementación `Fnv1aScoreCalculator`.

El cálculo utiliza **FNV-1a de 32 bits** sobre el RUT normalizado y posteriormente obtiene un valor entre `0` y `100`.

La principal razón para encapsular este cálculo detrás de una interfaz es mantener desacoplada la lógica de la API. En un escenario real, el algoritmo podría ser reemplazado por una consulta a un servicio externo, una base de datos o un modelo de scoring sin modificar el resto de la aplicación.

## Configuración

Las variables de configuración se centralizan en `config/env.ts`.

La configuración utilizada actualmente es:

| Variable         | Default                          |
| ---------------- | -------------------------------- |
| `PORT`           | `3000`                           |
| `NODE_ENV`       | `development`                    |
| `JWT_SECRET`     | Requerida (mínimo 16 caracteres) |
| `JWT_EXPIRES_IN` | `1h`                             |
| `CORS_ORIGIN`    | `http://localhost:5173`          |

En el entorno de test se utiliza un `JWT_SECRET` específico para evitar depender de una configuración externa.

La validación de configuración se realiza al iniciar la aplicación para detectar rápidamente errores de configuración.

## Testing

Los tests están separados entre pruebas unitarias y de integración.

### Tests unitarios

En `tests/unit/` se prueban componentes de manera aislada, entre ellos:

* Normalización y validación de RUT.
* Cálculo del score.
* `JwtService`.
* `MockUserRepository`.

### Tests de integración

En `tests/integration/` se utiliza **Supertest** sobre `createApp()` para validar el comportamiento de la API completa.

Entre los escenarios cubiertos se encuentran:

* Login exitoso.
* Credenciales incorrectas.
* Control de acceso por roles.
* Consulta del propio score.
* Intento de consultar un RUT diferente.
* Tokens vencidos.
* Tokens inválidos.
* RUT inválido.
* Determinismo del score.
* Manejo de rutas inexistentes.

Durante los tests, el rate limiting y algunos logs se neutralizan para evitar que interfieran con las pruebas.

### Resultado

Al finalizar la implementación:

* **45 tests OK**
* Lint OK
* Typecheck OK
* Build OK

Esto permite validar no solamente el funcionamiento de los casos principales, sino también aspectos relacionados con seguridad, autorización y comportamiento ante errores.
