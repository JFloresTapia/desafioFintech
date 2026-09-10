# Registro de uso de IA

Este documento describe de forma transparente cómo se utilizaron herramientas de inteligencia artificial durante el desarrollo del MVP de ProntoPaga.

La IA fue utilizada como una **herramienta de apoyo al desarrollo**, principalmente para consultar información, contrastar alternativas, resolver dudas técnicas y acelerar tareas repetitivas. Las decisiones finales sobre la solución fueron tomadas durante el desarrollo y posteriormente verificadas mediante pruebas y revisión del código.

---

## Principios utilizados

### Las decisiones técnicas fueron tomadas durante el desarrollo

La arquitectura, las reglas de negocio, los criterios de seguridad y la estructura general del proyecto fueron definidos a partir de los requerimientos de la prueba y de las decisiones tomadas durante la implementación.

La IA fue utilizada principalmente para **contrastar alternativas, investigar opciones y apoyar la implementación** cuando era necesario.

Las decisiones relevantes están documentadas en:

```text
docs/DECISIONES-TECNICAS.md
```

---

### La IA se utilizó principalmente como apoyo técnico

Entre los usos principales estuvieron:

* Búsqueda y consulta de información sobre librerías y componentes.
* Revisión de documentación técnica.
* Exploración de alternativas de implementación.
* Configuración inicial de herramientas.
* Sugerencias para pruebas.
* Ayuda en la interpretación y corrección de errores de compilación o lint.
* Revisión de algunos aspectos del código.
* Apoyo en la redacción y organización de la documentación.

Esto fue especialmente útil en algunas tecnologías y librerías con las que no se tenía experiencia completa o cuyo funcionamiento específico era necesario revisar durante la implementación.

La IA no se utilizó como sustituto de la revisión técnica del desarrollador.

---

### El código fue revisado y probado

Las sugerencias generadas durante el desarrollo fueron revisadas antes de incorporarse al proyecto.

La validación se realizó mediante:

* Typecheck.
* ESLint.
* Tests unitarios y de integración.
* Build de backend y frontend.
* Pruebas de integración entre frontend y backend.
* Pruebas manuales de los principales flujos.
* Validación de Swagger/OpenAPI.

El objetivo fue comprobar que el código generado o sugerido funcionara correctamente dentro de la arquitectura definida y cumpliera con los requerimientos de la prueba.

---

## Alcance del uso de IA

Una parte importante del código del proyecto fue desarrollada con asistencia de IA. Esto incluye código de aplicación, pruebas, configuraciones y código repetitivo.

Sin embargo, el código generado no fue considerado automáticamente como código terminado. Se incorporó al proyecto después de revisar su funcionamiento y adaptarlo a las necesidades específicas de la solución.

En términos generales, el proceso utilizado fue:

```text
Requerimiento
     ↓
Análisis de alternativas
     ↓
Implementación con apoyo de IA
     ↓
Revisión y ajustes
     ↓
Tests / Typecheck / Lint / Build
     ↓
Validación funcional
```

Esto permitió utilizar la IA como herramienta de productividad sin delegar en ella la validación final del resultado.

---

## Decisiones técnicas

Las decisiones más relevantes del proyecto se encuentran documentadas de forma independiente en:

```text
docs/DECISIONES-TECNICAS.md
```

Ese documento explica las principales alternativas consideradas, la opción finalmente utilizada y el motivo de cada decisión.

Entre ellas se encuentran aspectos relacionados con:

* Arquitectura.
* Autenticación.
* Autorización por roles.
* Validación de RUT.
* Persistencia de sesión.
* Algoritmo de score.
* Manejo de errores.
* Seguridad.
* Testing.
* Documentación de API.
* Evolución hacia producción.

La intención es que estas decisiones puedan ser revisadas y explicadas independientemente del uso de herramientas de IA.

---

## Reflexión final

El uso de IA permitió reducir tiempo en tareas repetitivas y facilitar la consulta de información sobre tecnologías y librerías que no eran completamente conocidas al momento de desarrollar la prueba.

Al mismo tiempo, el desarrollo se utilizó como una instancia para **entender y validar las decisiones**, y no solamente para obtener código funcional.

La IA fue una herramienta de apoyo dentro de ese proceso, mientras que la revisión, integración y validación final del proyecto fueron parte del trabajo de desarrollo.
