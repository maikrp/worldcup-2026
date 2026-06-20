# Estado del proyecto — World Cup 2026

Última actualización: 20 de junio de 2026

## Estado general

El proyecto está activo, compila correctamente para producción y está preparado como PWA. Es una
SPA construida con React 18 y Vite 5.1.4 para seguir el Mundial 2026 con calendario, resultados,
tablas, goleadores, pronósticos y llaves.

## Realizado hasta ahora

- Dashboard principal con resumen del torneo y navegación por secciones.
- “Partidos de la fecha” abre automáticamente en la fecha actual de Costa Rica.
- Conversión centralizada de fechas y horas mediante la zona `America/Costa_Rica`.
- Horarios no confirmados identificados como “Hora por confirmar”, sin presentar horas de relleno
  como oficiales.
- Listado general de partidos con búsqueda, filtro por fecha y orden ascendente/descendente.
- Calendario completo de fase de grupos: 72 partidos, 48 selecciones y tres encuentros por equipo.
- Tablas calculadas para los 12 grupos (A–L).
- Llaves actualizadas con la estructura oficial FIFA de los partidos M73–M104.
- Ronda de 32 formada por 12 primeros, 12 segundos y los ocho mejores terceros.
- Posiciones actuales mostradas como provisionales hasta que finalice cada grupo.
- Detección de clasificados matemáticamente; México y Estados Unidos aparecen como clasificados con
  los resultados disponibles al 20 de junio.
- Pronósticos mediante modelo de fuerza internacional, forma local y distribución Poisson.
- Pronósticos con xG estimado, nivel de confianza, fuente y probabilidades que suman 100%.
- Goleadores calculados desde los eventos de anotación recibidos por la API.
- Normalización de alias de jugadores y exclusión de autogoles conocidos.
- Líderes contrastados con la tabla pública del 20 de junio: Lionel Messi y Jonathan David con tres
  goles.
- Detalle de goles por rival, resultado y minuto.
- Minuto en vivo tomado de `time_elapsed` del proveedor; se eliminó la estimación basada en restar
  la hora de inicio y el valor artificial `90+2`.
- Estados explícitos para descanso, tiempo extra, penales y finalizado.
- Los partidos con datos remotos ya no cambian a “en vivo” únicamente porque su horario local haya
  pasado.
- Sincronización mediante el proxy propio `/api/live`, evitando llamadas CORS directas desde el
  navegador.
- Actualización cada 60 segundos, timeout cliente de 28 segundos y función Vercel con máximo de 30
  segundos para tolerar la latencia real del proveedor.
- Conservación de los últimos datos válidos cuando una actualización posterior falla.
- Respaldo local y señal visual diferenciada entre datos en línea, guardados y sin conexión.
- PWA instalable con manifest, service worker, caché offline e iconos propios.
- Metadatos Open Graph y Twitter con tarjeta social de 1200 × 630.
- ESLint 9 y Prettier configurados localmente.

## Arquitectura actual

- `src/App.jsx`: composición principal, carga de datos, estado de sincronización y navegación.
- `src/components/`: partidos, grupos, llaves, goleadores, estadísticas y predicciones.
- `src/constants/`: calendario de respaldo, códigos de selecciones y normalización de goleadores.
- `src/services/liveMatches.js`: sincronización y unión de resultados remotos con el calendario.
- `src/utils/dateTime.js`: fechas y horas en zona Costa Rica.
- `src/utils/matchStatus.js`: estado y minuto oficial informado por el proveedor.
- `src/utils/standings.js`: cálculo de posiciones por grupo.
- `api/live.js`: proxy serverless del proveedor de resultados.
- `public/`: recursos visuales y archivos PWA.

## Validaciones realizadas

- `npm run format:check`: aprobado el 20 de junio de 2026.
- `npm run lint`: aprobado sin errores.
- `npm run build`: aprobado; Vite procesó 1487 módulos.
- Salida principal: JavaScript gzip aproximado de 62.6 KB y CSS gzip aproximado de 6.2 KB.
- PWA generada correctamente con 32 recursos precargados.
- `/api/live` respondió correctamente con 104 partidos.
- Prueba renderizada en Edge: fecha “20 de junio · Hoy”.
- Prueba renderizada en Edge: estado final “Datos en vivo”, sin falso aviso de desconexión.
- Búsqueda estructural: eliminadas todas las referencias a `getLiveMinute` y `90+2`.
- Cruces de Ronda de 32 contrastados con la estructura oficial FIFA M73–M88.
- `.env` y los archivos auxiliares existentes se preservaron y quedaron fuera de esta actualización.

## Pendientes recomendados

- Agregar pruebas unitarias para fechas, minuto en vivo, clasificación matemática y goleadores.
- Agregar una prueba E2E que navegue por Inicio, Goleadores y Llaves.
- Incorporar los criterios disciplinarios cuando la API proporcione tarjetas, necesarios para
  desempates completos FIFA y para ordenar los mejores terceros.
- Implementar la tabla completa del Anexo C de FIFA para asignar automáticamente los ocho mejores
  terceros a sus cruces cuando finalice la fase de grupos.
- Añadir fotografías y alias de los goleadores nuevos que actualmente usan la imagen genérica.
- Retirar `remove_bg.py` y `public/wc2026-logo.jpg` si se confirma que ya no son necesarios.
- Agregar `README.md` con instalación, arquitectura y comandos.

## Nota de Git

El repositorio Git está ubicado en `C:\Python`, por encima de este proyecto. Los commits de World Cup
2026 deben prepararse usando rutas limitadas a `Web-Projects/worldcup-2026` para evitar incluir otros
proyectos o archivos del ecosistema.
