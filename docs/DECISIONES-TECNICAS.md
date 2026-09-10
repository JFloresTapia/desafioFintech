# DECISIONES TÉCNICAS — Fintech Score de Riesgo Financiero

## Contexto

Este documento resume las principales decisiones técnicas tomadas durante el desarrollo del MVP **"Fintech · Score de Riesgo Financiero"**.

El objetivo es dejar documentadas las decisiones que afectan la arquitectura, seguridad, validación, testing, frontend y documentación de la API, junto con algunos criterios de implementación que fueron relevantes durante el desarrollo.

Las decisiones se tomaron considerando los requerimientos del desafío, las restricciones propias del MVP y la necesidad de mantener una solución simple, testeable y fácil de evolucionar.

---

## Hallazgo relevante

### Dígito verificador del RUT

Durante la implementación se detectó que el RUT `12.345.678-9` indicado como ejemplo en el enunciado tiene un dígito verificador inválido.

El RUT válido utilizado como referencia en el proyecto es:

```text
12.345.678-5
```

Este valor se utiliza como RUT canónico en los ejemplos, pruebas y usuario de prueba.

El hallazgo no modifica la lógica de validación: el sistema valida el dígito verificador mediante el algoritmo correspondiente y no acepta el valor inválido indicado originalmente.

---

## Decisiones principales

| #   | Decisión                                 | Descripción                                                                                                                                                                                                                                                             |
| --- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Express 5                                | Se utiliza Express 5 como framework HTTP del backend. La configuración utiliza TypeScript con `verbatimModuleSyntax` y `moduleResolution: NodeNext`, por lo que los imports internos utilizan extensión `.js`.                                                          |
| D2  | Validadores manuales                     | Se optó por validadores propios en lugar de incorporar una librería adicional como Zod. Los validadores se encuentran en `src/validators/` y entregan un resultado simple con la validez y el valor normalizado.                                                        |
| D3  | bcryptjs                                 | Las contraseñas se almacenan mediante hashes bcrypt utilizando `bcryptjs`. Para el MVP se utilizan usuarios mock, por lo que los hashes forman parte de la configuración de datos de prueba y no representan un mecanismo de gestión de usuarios en producción.         |
| D4  | JWT HS256                                | La autenticación utiliza JWT firmado mediante HS256. El payload contiene la identidad del usuario y su rol. `JWT_SECRET` es obligatorio en ambientes normales y debe cumplir una longitud mínima. En tests se utiliza un secreto específico del entorno de pruebas.     |
| D5  | Arquitectura en capas + Composition Root | El backend utiliza una separación por responsabilidades y un `composition root` ubicado en `config/di.ts`. `createContainer()` centraliza la creación y composición de repositorios, servicios y calculadores, evitando acoplar las capas a implementaciones concretas. |
| D6  | Errores tipados y handler central        | Se utiliza `ApiError` como base para los errores HTTP de la aplicación. Existen errores específicos para `400`, `401`, `403` y `404`, mientras que un middleware centralizado se encarga de transformar las excepciones en una respuesta HTTP consistente.              |
| D7  | Score determinista mediante FNV-1a       | El score se calcula utilizando FNV-1a de 32 bits sobre el RUT normalizado y posteriormente se aplica módulo 101. El resultado siempre es un valor entre 0 y 100 para un mismo RUT.                                                                                      |
| D8  | ApiClient único con `fetch`              | El frontend centraliza las llamadas HTTP mediante un `apiClient` basado en `fetch`. Este componente se encarga de incorporar el token de autenticación y manejar respuestas `401`, evitando duplicar esta lógica en cada pantalla.                                      |
| D9  | `sessionStorage` + React Context         | La sesión se mantiene en `sessionStorage` y se expone mediante React Context. Se utiliza `sessionStorage` como una decisión adecuada para el alcance del MVP, ya que limita la persistencia de la sesión al ciclo de vida de la pestaña.                                |
| D10 | Vitest en backend y frontend             | Se utiliza Vitest como framework de pruebas en ambos proyectos. El backend utiliza el entorno `node`, mientras que el frontend utiliza `jsdom`, junto con `jest-dom` y `user-event` para las pruebas de componentes e interacción.                                      |
| D11 | OpenAPI 3.0 manual                       | La documentación de la API se mantiene mediante una especificación OpenAPI 3.0.3 definida manualmente y expuesta mediante `swagger-ui-express`. La documentación está disponible en `GET /api-docs`.                                                                    |

---

## Notas complementarias

### `express-rate-limit`

Se utiliza `express-rate-limit` para limitar solicitudes en endpoints sensibles.

La configuración actual contempla:

* Login: 30 solicitudes cada 15 minutos.
* Score: 120 solicitudes por minuto.
* Uso de `standardHeaders`.
* Desactivación del límite durante los tests mediante `NODE_ENV=test`.

La decisión busca incorporar una medida básica de protección frente a abuso sin agregar infraestructura adicional al MVP.

---

### Tipado de `req.params` en Express 5

Con Express 5, el tipado de los parámetros de ruta puede resultar más amplio que un `string` directo.

Por este motivo, los valores recibidos desde `req.params` se convierten explícitamente a string antes de ser procesados por los validadores.

Ejemplo:

```typescript
const rut = (req.params.rut || '').toString();
```

Esto permite mantener el contrato esperado por el validador y evita propagar tipos innecesariamente complejos hacia las capas de negocio.

---

### Separación de `tsconfig`

El backend utiliza dos configuraciones de TypeScript:

```text
tsconfig.json
tsconfig.build.json
```

`tsconfig.json` se utiliza principalmente para typecheck e incluye código fuente y tests.

`tsconfig.build.json` está orientado a la compilación final del backend, genera los archivos en `dist` y limita el proceso de compilación al código de aplicación.

Esta separación permite realizar typecheck de todo el proyecto sin mezclar los tests con los artefactos de producción.

---

### `NODE_ENV=test`

Durante los tests se utiliza `NODE_ENV=test`.

Entre otras cosas, esto permite desactivar temporalmente el rate limiting para evitar que las pruebas fallen por límites artificiales y no por problemas reales de la aplicación.

Esta excepción está limitada al entorno de pruebas y no se aplica al funcionamiento normal del backend.

---

### Proxy de Vite

El frontend utiliza el proxy de Vite para enrutar las llamadas a la API durante el desarrollo.

Actualmente las rutas principales son:

```text
/login  → http://localhost:3000
/score  → http://localhost:3000
```

Esto permite que el frontend trabaje con rutas relativas y evita depender de URLs absolutas durante el desarrollo local.

---

### Tests de inputs de RUT

En las pruebas de componentes del frontend se utiliza `fireEvent.change` para modificar los inputs de RUT.

Esta decisión se tomó debido al comportamiento observado en el entorno `jsdom` utilizado por la suite de pruebas, donde determinadas interacciones de pegado no reproducían de forma consistente el evento `change` esperado por el componente.

La decisión afecta únicamente a la estrategia de testing y no al comportamiento de la aplicación en el navegador.

---

### Validación del RUT en frontend y backend

La validación del RUT existe tanto en frontend como en backend, pero cumplen responsabilidades diferentes.

El frontend realiza la validación principalmente para entregar feedback inmediato al usuario.

El backend vuelve a validar siempre el RUT recibido y constituye la **fuente de verdad** para las reglas de negocio.

De esta forma, la aplicación no depende de que el cliente haya realizado correctamente las validaciones antes de procesar una solicitud.

En el dashboard administrativo el RUT puede ser ingresado por el usuario y posteriormente validado.

En el dashboard de usuario, el RUT asociado a la sesión se muestra como un valor prefijado y no editable.

---

### Documentación pública de la API

El endpoint:

```text
GET /api-docs
```

no requiere autenticación.

Su objetivo es permitir la consulta de la documentación técnica de la API durante la evaluación y desarrollo del MVP.

La documentación describe los endpoints disponibles, parámetros, respuestas y esquemas utilizados por la API.

---

## Algoritmo de score

El score implementado en este MVP es deliberadamente determinista.

El cálculo utiliza:

```text
RUT normalizado
      ↓
FNV-1a 32-bit
      ↓
Módulo 101
      ↓
Score 0–100
```

Algunos valores conocidos utilizados en las pruebas son:

```text
12.345.678-5 → 33
11.111.111-1 → 84
```

El algoritmo no pretende representar un modelo financiero real. Su objetivo dentro del desafío es entregar un resultado reproducible a partir del RUT, permitiendo validar el flujo completo de autenticación, autorización, consulta y presentación del score.

---

## Consideraciones de seguridad

Las principales medidas implementadas en el MVP son:

* Hash de contraseñas mediante bcrypt.
* Autenticación mediante JWT.
* Autorización basada en roles en el backend.
* Validación de entrada en backend.
* Rate limiting para endpoints sensibles.
* `helmet` para cabeceras HTTP de seguridad.
* Configuración explícita de CORS.
* Manejo centralizado de errores.
* Separación del secreto JWT mediante variables de entorno.
* No exposición de contraseñas ni secretos en las respuestas de la API.

Estas medidas están orientadas al alcance del desafío. Para un escenario productivo sería necesario complementar esta base con gestión real de usuarios, persistencia, rotación de secretos, auditoría, observabilidad y una estrategia de gestión de credenciales más robusta.

---

## Testing y validación

Las decisiones implementadas fueron validadas mediante diferentes niveles de prueba.

Actualmente se cuenta con:

* **Backend:** 45 tests.
* **Frontend:** 26 tests.
* Typecheck del backend y frontend.
* ESLint.
* Build de backend y frontend.
* Pruebas de integración entre frontend y backend.
* Pruebas manuales de los principales flujos.
* Validación de la documentación OpenAPI mediante Swagger UI.

El objetivo no fue solamente comprobar que las funciones individuales funcionaran, sino también validar que las distintas capas y componentes se integraran correctamente.

---

## Criterio general de diseño

Para este MVP se priorizó una arquitectura que fuera:

* Simple de entender.
* Fácil de probar.
* Con responsabilidades separadas.
* Sin dependencias innecesarias.
* Fácil de ejecutar localmente.
* Preparada para evolucionar hacia persistencia y servicios reales.

No todas las decisiones corresponden necesariamente a una solución definitiva para producción. Algunas responden directamente al alcance del desafío y buscan mantener el proyecto acotado sin perder buenas prácticas fundamentales.

---


## Conclusión

Las decisiones técnicas del proyecto buscan equilibrar los requerimientos del desafío con una arquitectura que permita mantener el código organizado, testeable y preparada para evolucionar.

El foco principal estuvo en separar responsabilidades, mantener la lógica de negocio independiente de detalles de infraestructura y validar el comportamiento mediante pruebas automatizadas y funcionales.

La documentación de estas decisiones también permite explicar qué aspectos corresponden al alcance del MVP y cuáles deberían evolucionar antes de considerar una implementación productiva.
