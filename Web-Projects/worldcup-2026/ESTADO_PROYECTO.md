# Estado del proyecto — World Cup 2026

Última actualización: 19 de junio de 2026

## Estado general

El proyecto está activo, compila correctamente para producción y está preparado como PWA. Es una
SPA construida con React 18 y Vite 5.1.4, orientada al seguimiento del Mundial 2026 mediante datos
locales, visualizaciones y pronósticos estadísticos.

## Realizado hasta ahora

- Dashboard principal con resumen del torneo y navegación por secciones.
- Calendario diario con navegación entre fechas.
- Listado general de partidos con búsqueda, filtro por fecha y orden ascendente/descendente.
- Calendario completo de fase de grupos: 72 partidos, 48 selecciones y tres encuentros por equipo.
- Tablas para los 12 grupos (A–L).
- Bracket navegable presentado expresamente como proyección del formato eliminatorio.
- Pronósticos mediante modelo de fuerza internacional + forma local + distribución Poisson.
- Pronósticos con xG estimado, nivel de confianza, fuente, fecha de referencia y probabilidades que
  suman exactamente 100%.
- Filtros de pronósticos por selección, fecha y orden cronológico.
- Sección de goleadores con fotografías locales y popup de detalle por partido y minuto del gol.
- Estado automático de partidos: los encuentros dejan de aparecer en vivo al finalizar su ventana.
- Sincronización de marcadores cada 30 segundos mediante `worldcup26.ir/get/games`.
- Función serverless `/api/live` con caché de 20 segundos, respaldo local y señal visual de conexión.
- Actualización automática de marcador, estado, goleadores, minuto estimado y tablas durante partidos
  activos.
- Tarjeta de próximo partido con banderas, equipos, hora y grupo.
- Separación del antiguo componente monolítico en componentes reutilizables.
- Constantes y utilidades extraídas a módulos independientes.
- Cálculo de posiciones y predicciones separado de la capa visual.
- Identidad visual actualizada con logo local, hero panorámico WebP y mascotas.
- Estilos responsivos con tratamiento específico para móvil, tablet y escritorio.
- PWA instalable con manifest, service worker, caché offline e iconos propios.
- Metadatos Open Graph y Twitter con tarjeta social de 1200 × 630 para compartir enlaces.
- ESLint 9 y Prettier configurados localmente.

## Arquitectura actual

- `src/App.jsx`: composición principal, carga de datos y navegación.
- `src/components/`: componentes de partidos, grupos, bracket, estadísticas y predicciones.
- `src/constants/`: datos de respaldo y códigos de selecciones.
- `src/utils/`: cálculos de posiciones y probabilidades.
- `public/`: recursos visuales utilizados por la interfaz.

## Validaciones realizadas

- `npm run build`: aprobado el 19 de junio de 2026.
- Vite procesó 1485 módulos sin errores.
- Salida principal: JavaScript gzip aproximado de 60 KB y CSS gzip aproximado de 5.5 KB.
- La importación de los nuevos módulos quedó validada por el build.
- `npm run lint`: aprobado sin errores.
- `npm run format:check`: aprobado.
- `npm audit --omit=dev`: cero vulnerabilidades de producción.
- Auditoría estructural: 12 grupos, 48 selecciones, 72 partidos, seis encuentros por grupo y tres
  rivales únicos por selección.
- Sin IDs duplicados, cruces fuera de grupo ni probabilidades inválidas.
- Se verificó la existencia de `C:\Python\Toolbox\ebs_audit_master.py`.
- PWA instalable con manifest, service worker, caché offline e iconos propios.
- Metadatos Open Graph y Twitter configurados con imagen social 1200 × 630.
- Formato oficial confirmado: 48 selecciones, 12 grupos, 104 partidos y ronda de 32.
- Resultados, goleadores y bracket local se identifican expresamente como datos no oficiales o
  simulaciones cuando no existe conexión directa con FIFA.

## Pendientes recomendados

- Agregar pruebas unitarias y una prueba E2E de humo.
- Ejecutar validación visual manual en 320 px, 375 px, tablet y escritorio.
- Retirar los archivos auxiliares no utilizados `remove_bg.py` y `public/wc2026-logo.jpg` si ya no se
  necesitan como fuente.
- Definir una estrategia de datos en vivo estable y manejo visible de errores de red.
- Agregar `README.md` con instalación, arquitectura y comandos.
- Configurar `VITE_SITE_URL` con el dominio público definitivo en producción para que WhatsApp y
  Facebook resuelvan correctamente la tarjeta social.

## Nota de Git

El repositorio Git está ubicado en `C:\Python`, por encima de este proyecto. Los commits de World Cup 2026 deben prepararse usando rutas limitadas a `Web-Projects/worldcup-2026` para evitar incluir otros proyectos o archivos del ecosistema.
