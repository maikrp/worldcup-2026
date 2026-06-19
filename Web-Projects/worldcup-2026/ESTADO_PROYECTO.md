# Estado del proyecto — World Cup 2026

Última actualización: 19 de junio de 2026

## Estado general

El proyecto está activo y compila correctamente para producción. Es una SPA construida con React 18 y Vite 5.1.4, orientada al seguimiento del Mundial 2026.

## Realizado hasta ahora

- Dashboard principal con resumen del torneo y navegación por secciones.
- Calendario diario con navegación entre fechas.
- Listado general de partidos con búsqueda, filtro por fecha y orden ascendente/descendente.
- Tablas para los 12 grupos (A–L).
- Bracket completo y navegable para la fase eliminatoria.
- Módulo de predicciones basado en estadísticas disponibles.
- Separación del antiguo componente monolítico en componentes reutilizables.
- Constantes y utilidades extraídas a módulos independientes.
- Cálculo de posiciones y predicciones separado de la capa visual.
- Identidad visual actualizada con logo local y fondo WebP.
- Estilos responsivos con tratamiento específico para móvil, tablet y escritorio.

## Arquitectura actual

- `src/App.jsx`: composición principal, carga de datos y navegación.
- `src/components/`: componentes de partidos, grupos, bracket, estadísticas y predicciones.
- `src/constants/`: datos de respaldo y códigos de selecciones.
- `src/utils/`: cálculos de posiciones y probabilidades.
- `public/`: recursos visuales utilizados por la interfaz.

## Validaciones realizadas

- `npm run build`: aprobado el 19 de junio de 2026.
- Vite procesó 1481 módulos sin errores.
- Salida principal: JavaScript gzip aproximado de 55 KB y CSS gzip aproximado de 4 KB.
- La importación de los nuevos módulos quedó validada por el build.
- Se verificó la existencia de `C:\Python\Toolbox\ebs_audit_master.py`.

## Pendientes recomendados

- ESLint 9 y Prettier configurados localmente con scripts de validación y corrección.
- Agregar pruebas unitarias y una prueba E2E de humo.
- Ejecutar validación visual manual en 320 px, 375 px, tablet y escritorio.
- Sustituir o retirar cualquier asset fuente redundante que no utilice la aplicación.
- Definir una estrategia de datos en vivo estable y manejo visible de errores de red.
- Agregar `README.md` con instalación, arquitectura y comandos.

## Nota de Git

El repositorio Git está ubicado en `C:\Python`, por encima de este proyecto. Los commits de World Cup 2026 deben prepararse usando rutas limitadas a `Web-Projects/worldcup-2026` para evitar incluir otros proyectos o archivos del ecosistema.
