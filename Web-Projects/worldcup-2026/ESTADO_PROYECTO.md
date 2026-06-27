# Estado del proyecto — World Cup 2026

Última actualización: 27 de junio de 2026

## Estado general

El proyecto está activo, compila correctamente para producción y está preparado como PWA. Es una
SPA construida con React 18 y Vite 5.1.4 para seguir el Mundial 2026 con calendario, resultados,
tablas, goleadores, pronósticos y llaves.

## Realizado hasta ahora

- Dashboard principal con resumen del torneo y navegación por secciones.
- “Partidos de la fecha” abre automáticamente en la fecha actual de Costa Rica.
- Modal interactivo de alineación simulada al hacer clic sobre la bandera de un equipo en la sección "Partidos de la Fecha".
- Conversión centralizada de fechas y horas mediante la zona `America/Costa_Rica`.
- Horarios visibles en formato de 24 horas.
- Jornada del 20 de junio corregida contra el calendario FIFA: 11:00, 14:00, 18:00 y 22:00 en
  Costa Rica.
- Banderas de los equipos colocadas sobre el nombre de la selección en las tarjetas principales.
- Horarios no confirmados identificados como “Hora por confirmar”, sin presentar horas de relleno
  como oficiales.
- Sincronización de horarios corregida (22 de junio de 2026): integración automática de los horarios confirmados y kickoff de la API en vivo a los partidos locales, convirtiendo los horarios locales del estadio a UTC según el huso correspondiente.
- Listado general de partidos con búsqueda, filtro por fecha y orden ascendente/descendente.
- Calendario completo de fase de grupos: 72 partidos, 48 selecciones y tres encuentros por equipo.
- Tablas calculadas para los 12 grupos (A–L).
- Llaves actualizadas con la estructura oficial FIFA de los partidos M73–M104.
- Ronda de 32 formada por 12 primeros, 12 segundos y los ocho mejores terceros.
- Posiciones actuales mostradas como provisionales hasta que finalice cada grupo.
- Detección de clasificados matemáticamente; México y Estados Unidos aparecen como clasificados con
  los resultados disponibles al 20 de junio.
- Pronósticos mediante puntos FIFA reales para las 48 selecciones, forma local y distribución
  Poisson.
- Pronósticos con xG estimado, nivel de confianza, fuente y probabilidades que suman 100%.
- El peso de los puntos FIFA disminuye conforme se juegan partidos; puntos por partido y diferencia
  de gol ganan peso progresivamente.
- Favoritos al título calculados mediante 5.000 simulaciones completas del torneo.
- La simulación utiliza resultados finalizados, marcador y minuto en vivo, partidos pendientes,
  clasificación de grupos, mejores terceros, eliminatorias, prórroga y penales.
- Simulación ejecutada en un Web Worker para no bloquear la interfaz.
- Goleadores calculados desde los eventos de anotación recibidos por la API.
- Normalización de alias de jugadores y exclusión de autogoles conocidos.
- Líderes contrastados con la tabla pública del 20 de junio: Lionel Messi y Jonathan David con tres
  goles.
- Detalle de goles por rival, resultado y minuto.
- Fotografías locales añadidas para los principales goleadores actuales, con créditos de Wikimedia
  Commons y respaldo genérico para jugadores todavía no identificados.
- Minuto en vivo tomado de `time_elapsed` del proveedor; se eliminó la estimación basada en restar
  la hora de inicio y el valor artificial `90+2`.
- El marcador destacado de Inicio muestra ahora marcador y minuto oficial (`74'`, `90+2'`,
  `Descanso`, etc.).
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
- `src/utils/tournamentSimulation.js`: simulación Monte Carlo completa del torneo.
- `src/workers/titleSimulation.worker.js`: ejecución en segundo plano de las probabilidades.
- `api/live.js`: proxy serverless del proveedor de resultados.
- `public/`: recursos visuales y archivos PWA.

## Validaciones realizadas

- `npm run format:check`: aprobado el 22 de junio de 2026.
- `npm run lint`: aprobado sin errores el 22 de junio de 2026.
- `npm run build`: aprobado y compilado correctamente el 22 de junio de 2026; Vite procesó 1487 módulos y generó el worker de simulación.
- Salida principal: JavaScript gzip aproximado de 63.1 KB y CSS gzip aproximado de 6.2 KB.
- PWA generada correctamente con 41 recursos precargados.
- Prueba matemática: 5.000 simulaciones completadas y probabilidades de campeones sumando 100%.
- Prueba ampliada: 20.000 simulaciones, 35 campeones distintos y menor concentración artificial;
  Argentina 20.0%, Francia 17.7%, Inglaterra 11.8% y España 9.4%.
- Prueba visual: la interfaz aparece inmediatamente y sustituye el estado de cálculo por los tres
  favoritos sin errores de consola.
- Prueba visual: banderas colocadas sobre los nombres y horarios 11:00, 14:00, 18:00 y 22:00.
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
- Sustituir la asignación compatible de mejores terceros de la simulación por la tabla literal del
  Anexo C de FIFA cuando se publique la versión reglamentaria definitiva.
- Añadir fotografías y alias para goleadores nuevos que todavía usan la imagen genérica.
- Retirar `remove_bg.py` y `public/wc2026-logo.jpg` si se confirma que ya no son necesarios.
- Agregar `README.md` con instalación, arquitectura y comandos.

## Nota de Git

El repositorio Git está ubicado en `C:\Python`, por encima de este proyecto. Los commits de World Cup
2026 deben prepararse usando rutas limitadas a `Web-Projects/worldcup-2026` para evitar incluir otros
proyectos o archivos del ecosistema.
