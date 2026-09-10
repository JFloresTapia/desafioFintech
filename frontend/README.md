# Frontend · ProntoPaga Score SPA

Frontend de la prueba técnica desarrollado como una **SPA con React 19, TypeScript, Vite 8 y React Router 7**.

La aplicación permite iniciar sesión y consultar el score de riesgo financiero asociado a un RUT. La implementación busca mantener una estructura sencilla, evitando incorporar dependencias innecesarias para manejo de estado o componentes visuales.

Para el estado de autenticación se utiliza **React Context**, mientras que las llamadas al backend se realizan utilizando `fetch` y se utiliza CSS propio para la interfaz.

---

## Requisitos

* Node.js `>= 20`.
* Backend ejecutándose en `http://localhost:3000`.

Para conocer cómo levantar el backend, revisar `../backend/README.md`.

---

## Scripts disponibles

Desde la carpeta `frontend`:

```bash
npm run dev        # Inicia Vite en http://localhost:5173
npm run build      # Ejecuta typecheck y genera el build de producción
npm run preview    # Sirve localmente el build generado
npm run typecheck  # Verifica los tipos de TypeScript
npm test           # Ejecuta las pruebas con Vitest
npm run lint       # Ejecuta ESLint
```

Para comenzar el desarrollo:

```bash
npm install
npm run dev
```

La aplicación quedará disponible en:

```text
http://localhost:5173
```

---

## Proxy de desarrollo

Durante el desarrollo, Vite está configurado para enviar las llamadas de la aplicación hacia el backend:

```ts
proxy: {
  '/login': 'http://localhost:3000',
  '/score': 'http://localhost:3000',
}
```

Esto permite que el frontend trabaje con rutas relativas, por ejemplo:

```text
/login
/score/12.345.678-5
```

en lugar de tener que definir directamente la URL del backend en cada servicio.

Además de simplificar la configuración local, este enfoque evita problemas de CORS entre el frontend y backend durante el desarrollo.

En un ambiente productivo, la URL de la API puede configurarse mediante `VITE_API_BASE_URL` o resolverse mediante un reverse proxy/CDN.

La estrategia de despliegue y las alternativas consideradas están documentadas en:

```text
../docs/EVOLUCION-PRODUCCION.md
```

---

## Estructura del proyecto

La estructura busca separar las responsabilidades principales de la aplicación sin introducir una arquitectura innecesariamente compleja.

```text
src/
├── main.tsx
│   └── Punto de entrada de la aplicación y estilos globales
│
├── App.tsx
│   └── Composición principal de la aplicación
│
├── routes/
│   └── AppRoutes.tsx
│       └── Definición de rutas y navegación
│
├── contexts/
│   └── AuthContext.tsx
│       └── Estado global de autenticación
│
├── hooks/
│   ├── useAuth.ts
│   │   └── Acceso tipado al contexto de autenticación
│   │
│   └── useScoreQuery.ts
│       └── Estado de la consulta de score
│
├── components/
│   ├── ProtectedRoute
│   ├── Navbar
│   ├── ErrorMessage
│   ├── LoginForm
│   └── ScoreCard
│
├── pages/
│   ├── LoginPage
│   ├── DashboardPage
│   └── NotFoundPage
│
├── services/
│   ├── apiClient.ts
│   │   └── Cliente HTTP común
│   │
│   ├── authService.ts
│   │   └── Operaciones relacionadas con autenticación
│   │
│   ├── scoreService.ts
│   │   └── Consulta del score
│   │
│   └── sessionStorage.ts
│       └── Persistencia y lectura segura de la sesión
│
├── types/
│   └── Tipos utilizados por autenticación, score y API
│
└── utils/
    ├── rut.ts
    │   └── Formateo y validación del RUT
    │
    └── errors.ts
        └── Normalización de mensajes de error
```

---

## Capa HTTP

Las comunicaciones con el backend están centralizadas en:

```text
src/services/apiClient.ts
```

La idea es evitar que cada componente tenga que implementar por separado lógica relacionada con autenticación, headers o manejo de errores.

El cliente HTTP se encarga principalmente de:

* Agregar `Content-Type: application/json` cuando corresponde.
* Incorporar el header `Authorization: Bearer <token>` cuando existe una sesión.
* Diferenciar errores de red de errores HTTP.
* Convertir los errores en una instancia común de `ApiClientError`.
* Detectar respuestas `401` y notificar que la sesión dejó de ser válida.

Los errores de red se representan con status `0`, mientras que las respuestas HTTP conservan su código correspondiente, por ejemplo `400`, `401`, `403` o `500`.

### Manejo centralizado de `401`

Una decisión importante fue evitar que cada componente tuviera que preocuparse por manejar individualmente una sesión expirada.

Cuando el backend responde `401`, `ApiClient` genera el evento:

```text
auth:unauthorized
```

`AuthContext` escucha este evento y se encarga de:

1. Limpiar la sesión.
2. Eliminar los datos almacenados.
3. Redirigir al usuario hacia `/login`.

De esta forma, el comportamiento frente a una sesión inválida queda centralizado.

---

## Manejo de sesión

La sesión se administra mediante `AuthContext`.

La información necesaria para mantener la sesión está compuesta principalmente por:

```text
{
  token,
  user
}
```

Para persistir estos datos durante la navegación se utiliza `sessionStorage` en lugar de `localStorage`.

Las claves utilizadas son:

```text
pp_token
pp_user
```

### ¿Por qué `sessionStorage`?

Para este MVP se prefirió `sessionStorage` porque la información almacenada desaparece al cerrar la pestaña del navegador.

Esto reduce la permanencia del token en el navegador frente a utilizar `localStorage`, aunque no elimina los riesgos asociados al almacenamiento de tokens en el cliente.

Es una decisión con un trade-off claro: se prioriza una sesión de duración más acotada y una implementación sencilla para el alcance de la prueba.

La decisión está documentada en:

```text
../docs/DECISIONES-TECNICAS.md
```

---

## Protección de rutas

La aplicación utiliza `ProtectedRoute` para evitar que un usuario sin sesión acceda directamente al dashboard.

Por ejemplo:

```text
/dashboard
```

requiere una sesión válida.

Es importante diferenciar esta protección de la autorización real.

`ProtectedRoute` existe principalmente para mejorar la experiencia de navegación en el frontend. **No constituye un mecanismo de seguridad por sí mismo.**

La autorización real se realiza en el backend.

Por ejemplo, aunque un usuario modifique manualmente la URL o las peticiones desde las herramientas del navegador, el backend seguirá validando el token y los permisos correspondientes.

---

## Páginas principales

### LoginPage

Es el punto de entrada para usuarios no autenticados.

El formulario permite ingresar:

* RUT.
* Contraseña.

Antes de realizar la petición se valida el formato del RUT para entregar feedback inmediato al usuario.

Si las credenciales son correctas, se almacena la sesión y el usuario es redirigido al dashboard.

Los errores devueltos por la API también se presentan al usuario mediante mensajes controlados.

---

### DashboardPage

El comportamiento del dashboard depende del rol del usuario autenticado.

#### Usuario `user`

El RUT asociado a la sesión se muestra directamente y no puede ser modificado desde la interfaz.

De esta forma, la experiencia de usuario deja claro que este perfil consulta únicamente su propio score.

La restricción de seguridad, de todas formas, se vuelve a aplicar en el backend.

#### Usuario `admin`

El administrador puede ingresar un RUT diferente para realizar consultas.

Antes de enviar la petición se valida el dígito verificador para detectar errores de ingreso de forma anticipada.

---

### ScoreCard

El resultado se presenta mediante una tarjeta que permite identificar rápidamente el nivel de riesgo.

Los rangos definidos para el MVP son:

|      Score | Nivel |
| ---------: | ----- |
|   `0 - 49` | Bajo  |
|  `50 - 74` | Medio |
| `75 - 100` | Alto  |

En este modelo, un score mayor representa un mayor nivel de riesgo.

Los rangos corresponden exclusivamente a la lógica definida para este MVP y no representan una clasificación financiera real.

---

## Validación del RUT

La lógica relacionada con el RUT está centralizada en:

```text
src/utils/rut.ts
```

Esta utilidad permite:

* Normalizar el valor ingresado.
* Aplicar formato visual al RUT.
* Validar el dígito verificador.
* Entregar validaciones tempranas en los formularios.

La validación realizada en el frontend tiene como objetivo principal mejorar la experiencia de usuario.

**El frontend no es la fuente de verdad.**

El backend vuelve a validar el RUT antes de procesar cualquier operación, ya que las validaciones realizadas en el navegador pueden ser modificadas o directamente omitidas.

---

## Testing

Las pruebas utilizan:

* **Vitest** como framework de testing.
* **Testing Library** para probar componentes desde la perspectiva del usuario.
* **jsdom** para proporcionar el entorno de navegador necesario durante las pruebas.
* **jest-dom** para contar con matchers específicos para elementos del DOM.

El archivo:

```text
tests/setup.ts
```

se encarga de preparar el entorno de pruebas y limpiar el estado entre ejecuciones, incluyendo `sessionStorage`.

### Pruebas unitarias

Se cubren principalmente:

* Formateo y validación de RUT.
* Comportamiento de `ApiClient`.
* Manejo de respuestas y errores HTTP.
* Comportamiento frente a errores de red.

En las pruebas del cliente HTTP, `fetch` se encuentra mockeado para poder controlar las distintas respuestas del backend sin depender de un servidor externo.

### Pruebas de integración de componentes

También se prueban componentes y flujos relevantes de la aplicación, entre ellos:

* `LoginPage`.
* `DashboardPage`.
* `ProtectedRoute`.
* `AuthContext`.

El objetivo no es solamente verificar funciones aisladas, sino comprobar que las distintas piezas del frontend funcionan correctamente en conjunto.

---

## Estado actual

Al cierre del desarrollo:

* **26 tests OK.**
* Typecheck OK.
* ESLint OK.
* Build OK.
* Flujo integrado contra el backend real validado mediante el proxy de Vite.

El flujo completo de autenticación y consulta también fue probado utilizando el frontend y backend en conjunto.

La información general del proyecto y las instrucciones para ejecutar ambas capas se encuentran en:

```text
../README.md
```

---


