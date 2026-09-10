# Fintech · MVP Consulta de Score de Riesgo Financiero

MVP desarrollado como parte de la prueba técnica Fullstack para **ProntoPaga / YOL1**.

El proyecto permite consultar un **score de riesgo financiero asociado a un RUT chileno**, utilizando una API REST y una SPA desarrollada en React.

La aplicación incluye autenticación mediante **JWT**, autorización basada en roles (`admin` y `user`) y un algoritmo de cálculo de score determinista.

> **Nota:** Este MVP no utiliza una base de datos real. Los usuarios son datos mock y el score se genera de forma determinista a partir del RUT. La idea es mantener el foco de la prueba en la arquitectura, seguridad, validaciones, experiencia de usuario y calidad del código.

---

## Stack tecnológico

| Capa     | Tecnología                                                                                                         |
| -------- | ------------------------------------------------------------------------------------------------------------------ |
| Backend  | Node.js 20+, Express 5, TypeScript 6, bcryptjs, jsonwebtoken, helmet, cors, express-rate-limit, swagger-ui-express |
| Frontend | React 19, TypeScript 6, Vite 8, React Router 7                                                                     |
| Testing  | Vitest, Supertest · Testing Library + jsdom                                                                        |
| Lint     | ESLint 10 + typescript-eslint                                                                                      |

### Estructura del proyecto

```text
fintech/
├── backend/   # API REST
├── frontend/  # SPA React
└── docs/      # Documentación y decisiones técnicas
```

Por defecto, el backend utiliza el puerto `3000` y el frontend el `5173`.

---

## Requisitos

* Node.js **>= 20**. El proyecto fue probado con Node `22.15.1`.
* npm `10` o superior.

---

## Puesta en marcha

### 1. Backend

Desde la raíz del proyecto:

```bash
cd backend
npm install
```

Crear el archivo `.env` a partir del ejemplo:

```bash
copy .env.example .env
```

En Linux/macOS:

```bash
cp .env.example .env
```

Luego iniciar el servidor en modo desarrollo:

```bash
npm run dev
```

La API quedará disponible en:

```text
http://localhost:3000
```

Otros comandos disponibles:

```bash
npm run build   # Compila TypeScript a dist/
npm start       # Ejecuta la versión compilada
```

### Variables de entorno

Las variables disponibles se encuentran en `backend/.env.example`.

| Variable         | Por defecto             | Descripción                                                              |
| ---------------- | ----------------------- | ------------------------------------------------------------------------ |
| `PORT`           | `3000`                  | Puerto utilizado por la API                                              |
| `NODE_ENV`       | `development`           | Entorno de ejecución. En `test` se desactiva el rate limiting            |
| `JWT_SECRET`     | Obligatoria             | Secreto utilizado para firmar los JWT. Debe tener al menos 16 caracteres |
| `JWT_EXPIRES_IN` | `1h`                    | Tiempo de vigencia del token                                             |
| `CORS_ORIGIN`    | `http://localhost:5173` | Orígenes permitidos por CORS, separados por coma                         |

---

### 2. Frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

La aplicación estará disponible en:

```text
http://localhost:5173
```

Durante el desarrollo, Vite utiliza un proxy para redirigir las llamadas de la aplicación hacia el backend en `http://localhost:3000`.

No es necesario crear un `.env` para ejecutar el proyecto localmente. Si se necesita utilizar otra URL para la API, se puede configurar `VITE_API_BASE_URL` tomando como referencia `frontend/.env.example`.

---

## Usuarios de prueba

Para facilitar la revisión del proyecto se incluyen dos usuarios mock:

| Rol     | RUT            | Password   |
| ------- | -------------- | ---------- |
| `user`  | `12.345.678-5` | `password` |
| `admin` | `99.999.999-9` | `admin123` |

### Sobre el RUT utilizado

Durante la implementación se detectó que el RUT indicado originalmente en el enunciado, `12.345.678-9`, no tiene un dígito verificador válido según el algoritmo de validación de RUT chileno.

Para evitar incorporar un dato inválido al sistema, se utilizó:

```text
12.345.678-5
```

Esta situación está documentada con mayor detalle en `docs/DECISIONES-TECNICAS.md` (D6).

---

## API

| Método | Ruta            | Auth   | Rol permitido                             | Descripción                                                |
| ------ | --------------- | ------ | ----------------------------------------- | ---------------------------------------------------------- |
| `POST` | `/login`        | No     | —                                         | Autentica al usuario y devuelve un JWT junto con sus datos |
| `GET`  | `/score/:rut`   | Bearer | `user` (RUT propio), `admin` (cualquiera) | Obtiene el score asociado al RUT                           |
| `GET`  | `/openapi.json` | No     | —                                         | Especificación OpenAPI 3.0                                 |
| `GET`  | `/api-docs`     | No     | —                                         | Interfaz Swagger para explorar y probar la API             |

### Principales códigos de respuesta

* `400` — Datos de entrada inválidos.
* `401` — Falta el token, el token no es válido/expiró o las credenciales son incorrectas.
* `403` — El usuario autenticado no tiene permisos para consultar ese RUT.
* `404` — Recurso o ruta no encontrada.
* `429` — Se superó el límite de solicitudes.
* `500` — Error interno del servidor.

---

## Swagger / OpenAPI

Con el backend ejecutándose, la documentación interactiva está disponible en:

```text
http://localhost:3000/api-docs
```

La especificación OpenAPI también puede consultarse directamente en:

```text
http://localhost:3000/openapi.json
```

Para probar un endpoint protegido desde Swagger:

1. Ejecutar `POST /login`.
2. Copiar el `token` recibido en la respuesta.
3. Seleccionar **Authorize**.
4. Ingresar el token utilizando el formato:

```text
Bearer <token>
```

5. Ejecutar `GET /score/{rut}`.

Un usuario con rol `user` puede consultar únicamente su propio RUT, mientras que un usuario `admin` puede consultar cualquier RUT.

### Ejemplo utilizando curl

Login:

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"rut":"12.345.678-5","password":"password"}'
```

Respuesta esperada:

```json
{
  "token": "eyJ...",
  "expiresIn": "1h",
  "user": {
    "id": "user-001",
    "rut": "12.345.678-5",
    "role": "user"
  }
}
```

Consulta del score:

```bash
curl http://localhost:3000/score/12.345.678-5 \
  -H "Authorization: Bearer <token>"
```

Ejemplo de respuesta:

```json
{
  "rut": "12.345.678-5",
  "score": 33,
  "fecha": "2026-09-09T00:21:21.522Z"
}
```

---

## Algoritmo de score

Para este MVP se necesitaba un cálculo que fuera:

* Determinista.
* Reproducible.
* Independiente de servicios externos.
* Fácil de entender y probar.
* Suficiente para representar el comportamiento esperado del producto sin incorporar una fuente real de información financiera.

Por eso se utilizó **FNV-1a de 32 bits** sobre el RUT normalizado y posteriormente se aplica un módulo `101` para obtener un resultado entre `0` y `100`.

En este MVP:

> Un score más alto representa un mayor nivel de riesgo.

El algoritmo no pretende representar un modelo financiero real. Es simplemente una implementación determinista para efectos de la prueba técnica.

Ejemplos:

| RUT            | Score |
| -------------- | ----: |
| `12.345.678-5` |    33 |
| `11.111.111-1` |    84 |

La decisión está documentada en `docs/DECISIONES-TECNICAS.md` (D7).

---

## Calidad y pruebas

Antes de cerrar la implementación se ejecutaron las verificaciones de tipado, linting, pruebas y build en ambas capas.

### Backend

```bash
cd backend

npm run typecheck
npm run lint
npm test
npm run build
```

### Frontend

```bash
cd frontend

npm run typecheck
npm run lint
npm test
npm run build
```

Estado al cierre del desarrollo:

* **Backend:** 45 tests OK.
* **Frontend:** 26 tests OK.
* Typecheck OK.
* ESLint OK.
* Build OK.
* Flujo E2E integrado mediante el proxy de Vite hacia Express OK.

---

## Seguridad

Aunque se trata de un MVP sin persistencia real, se incorporaron algunas medidas para acercar la implementación a un escenario real.

### Contraseñas

Las contraseñas de los usuarios mock no se almacenan en texto plano. Se utilizan hashes generados con **bcrypt**.

Durante el login, la contraseña recibida se compara utilizando bcrypt y se entrega una respuesta genérica `401` tanto para usuarios inexistentes como para contraseñas incorrectas.

### JWT

La autenticación utiliza JWT firmado mediante `HS256`.

El payload contiene información mínima para identificar al usuario y su rol:

```text
{
  sub,
  role,
  rut?
}
```

La duración del token es configurable mediante `JWT_EXPIRES_IN` y por defecto es de `1h`.

Para un entorno productivo se recomienda evaluar un esquema basado en claves asimétricas y una estrategia formal de gestión y rotación de secretos. Esto se aborda en `docs/EVOLUCION-PRODUCCION.md`.

### Autorización

La autorización se realiza en el backend y no depende de información enviada por el frontend.

Un usuario con rol `user` solamente puede consultar el RUT asociado a su propio token.

Por ejemplo, modificar manualmente la URL desde:

```text
/score/12.345.678-5
```

a:

```text
/score/11.111.111-1
```

no permite acceder al segundo RUT si el usuario autenticado no tiene permisos.

El rol `admin`, en cambio, puede consultar cualquier RUT.

### Rate limiting

Se configuraron límites de solicitudes por IP:

* `/login`: 30 intentos cada 15 minutos.
* `/score`: 120 solicitudes por minuto.

El rate limiting se desactiva automáticamente cuando `NODE_ENV=test` para no interferir con las pruebas automatizadas.

### Otras medidas

También se incorporaron:

* `helmet` para configurar headers HTTP relacionados con seguridad.
* CORS restringido a los orígenes configurados.
* Manejo centralizado de errores.
* Respuestas de error sin exponer stack traces al cliente.

---

## Documentación adicional

El proyecto incluye documentación complementaria para explicar no solo **qué** se implementó, sino también **por qué** se tomaron determinadas decisiones.

| Archivo                          | Contenido                                                                           |
| -------------------------------- | ----------------------------------------------------------------------------------- |
| `docs/DECISIONES-TECNICAS.md`    | Decisiones D1–D10, alternativas evaluadas y motivos de las elecciones realizadas    |
| `ai_interactions.md`             | Registro del uso de herramientas de IA durante el desarrollo                        |
| `README.md`                      | Guía general de ejecución, funcionamiento y estado del proyecto                     |
| `backend/README.md`              | Información específica del backend                                                  |
| `frontend/README.md`             | Información específica del frontend                                                 |

---

## Uso de IA

La inteligencia artificial fue utilizada como **herramienta de apoyo durante el desarrollo**, principalmente para consultar información sobre librerías, componentes y algunas tecnologías con las que no se tenía experiencia previa o cuyo funcionamiento específico era necesario revisar.

La estructura del proyecto, las decisiones técnicas finales y la integración de sus componentes fueron realizadas durante el desarrollo.

El detalle de las interacciones y del uso de IA se encuentra en:

```text
ai_interactions.md
```

---

## Estado del proyecto

El MVP se encuentra funcional y preparado para su revisión.

Actualmente permite:

* Autenticar usuarios.
* Generar y validar JWT.
* Aplicar autorización por roles.
* Consultar el score asociado a un RUT.
* Validar RUT y datos de entrada.
* Aplicar rate limiting.
* Consultar la API mediante Swagger.
* Ejecutar pruebas unitarias e integración.
* Ejecutar el frontend y backend de forma independiente.
* Mantener documentación de las principales decisiones técnicas.


