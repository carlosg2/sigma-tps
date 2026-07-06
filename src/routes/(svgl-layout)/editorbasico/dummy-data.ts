export type FileId = string;

export type FileNode = {
	id: FileId;
	name: string;
	type: 'file' | 'folder';
	parentId: FileId | null;
};

export const DUMMY_FILES: FileNode[] = [
	{ id: 'root', name: 'Vault', type: 'folder', parentId: null },

	// Notas
	{ id: 'folder-notas', name: 'Notas', type: 'folder', parentId: 'root' },
	{ id: 'file-diario', name: 'diario.md', type: 'file', parentId: 'folder-notas' },
	{ id: 'file-ideas', name: 'ideas.md', type: 'file', parentId: 'folder-notas' },
	{
		id: 'folder-reuniones',
		name: 'Reuniones',
		type: 'folder',
		parentId: 'folder-notas'
	},
	{
		id: 'file-reunion-1',
		name: '2024-01-15.md',
		type: 'file',
		parentId: 'folder-reuniones'
	},
	{
		id: 'file-reunion-2',
		name: '2024-01-22.md',
		type: 'file',
		parentId: 'folder-reuniones'
	},

	// Proyectos
	{
		id: 'folder-proyectos',
		name: 'Proyectos',
		type: 'folder',
		parentId: 'root'
	},
	{
		id: 'folder-alpha',
		name: 'proyecto-alpha',
		type: 'folder',
		parentId: 'folder-proyectos'
	},
	{
		id: 'file-alpha-readme',
		name: 'README.md',
		type: 'file',
		parentId: 'folder-alpha'
	},
	{
		id: 'file-alpha-tareas',
		name: 'tareas.md',
		type: 'file',
		parentId: 'folder-alpha'
	},
	{
		id: 'file-beta',
		name: 'proyecto-beta.md',
		type: 'file',
		parentId: 'folder-proyectos'
	},

	// Scripts
	{ id: 'folder-scripts', name: 'scripts', type: 'folder', parentId: 'root' },
	{
		id: 'file-setup',
		name: 'setup.sh',
		type: 'file',
		parentId: 'folder-scripts'
	},
	{
		id: 'file-utils',
		name: 'utils.ts',
		type: 'file',
		parentId: 'folder-scripts'
	},

	// Root files
	{ id: 'file-config', name: 'config.json', type: 'file', parentId: 'root' }
];

export const DUMMY_CONTENTS: Record<FileId, string> = {
	'file-diario': `# Diario de Trabajo

## Viernes, 19 de enero de 2024

Hoy fue un día productivo. Terminé de refactorizar el módulo de autenticación
y actualicé las pruebas unitarias.

### Lo que hice
- [x] Revisar pull requests pendientes
- [x] Actualizar documentación del API
- [x] Reunión de sincronización con el equipo
- [ ] Revisar métricas de rendimiento

### Notas
El equipo acordó adoptar TypeScript estricto en todos los módulos nuevos.
Necesito actualizar el linter para que lo refleje.

---

## Jueves, 18 de enero de 2024

Trabajé en la integración con el nuevo proveedor de pagos. Hay algunos
comportamientos inesperados con el webhook que debo investigar más a fondo.
`,

	'file-ideas': `# Ideas y Proyectos Futuros

## Producto
- Sistema de notificaciones en tiempo real usando WebSockets
- Dashboard de métricas con gráficos interactivos
- Modo offline con sincronización automática
- Exportar notas como PDF con estilos personalizados

## Técnicas
- Migrar a arquitectura de micro-frontends
- Implementar lazy loading en rutas pesadas
- Cache inteligente con Service Workers
- Explorar Svelte 5 runes para estado reactivo

## Aprender
- Diseño de sistemas distribuidos
- Algoritmos de sincronización CRDT
- Optimización de consultas SQL avanzada
- Técnicas de accesibilidad web (WCAG 2.1)

## Lectura pendiente
- "A Philosophy of Software Design" - John Ousterhout
- "Database Internals" - Alex Petrov
- "Designing Data-Intensive Applications" - Martin Kleppmann
`,

	'file-reunion-1': `# Reunión de Sincronización — 15 de enero de 2024

**Participantes:** Carlos, María, Andrés, Elena
**Duración:** 45 minutos
**Moderador:** Carlos

## Agenda

1. Estado del sprint actual
2. Bloqueos e impedimentos
3. Planificación próxima semana

## Resumen

### Estado del Sprint
- El 80% de las tareas planificadas están completadas
- Quedan 3 tickets pendientes del módulo de reportes
- La velocidad del equipo se mantiene estable

### Bloqueos
- **Andrés:** Necesita acceso al servidor de staging
- **Elena:** Esperando respuesta del cliente sobre el formulario de pagos

### Decisiones
- Mover los tickets de reportes al siguiente sprint
- Carlos coordinará el acceso al servidor con DevOps
- Reunión de revisión con cliente programada para el viernes

## Próximos pasos
- [ ] Carlos: solicitar acceso servidor (hoy)
- [ ] Elena: enviar correo de seguimiento al cliente
- [ ] Todos: actualizar estimaciones en el tablero
`,

	'file-reunion-2': `# Reunión de Revisión con Cliente — 22 de enero de 2024

**Participantes:** Carlos, Elena, Roberto (cliente), Ana (cliente)
**Duración:** 1 hora

## Demo presentada
Mostramos los nuevos módulos:
- Panel de administración
- Generación de reportes
- Integración con terceros

## Feedback del cliente

### Positivo
- La nueva interfaz es más intuitiva
- La velocidad de carga mejoró notablemente
- Los reportes tienen exactamente la información que necesitan

### Cambios solicitados
1. El botón de exportar debe ser más visible
2. Agregar filtro por fecha en el dashboard
3. El módulo de usuarios necesita paginación

## Acuerdos
- Entrega de correcciones: próximas 2 semanas
- Siguiente demo: 5 de febrero
- Ajustes de alcance documentados en el contrato
`,

	'file-alpha-readme': `# Proyecto Alpha

Sistema de gestión de contenidos para equipos distribuidos.

## Descripción
Proyecto Alpha es una plataforma colaborativa que permite a equipos
crear, organizar y compartir documentación técnica en tiempo real.

## Stack Tecnológico
- **Frontend:** SvelteKit + TypeScript
- **Backend:** Hono.js en Cloudflare Workers
- **Base de datos:** SQLite (Turso)
- **Autenticación:** Better Auth
- **Despliegue:** Cloudflare Pages

## Inicio Rápido

\`\`\`bash
# Clonar repositorio
git clone https://github.com/empresa/proyecto-alpha

# Instalar dependencias
bun install

# Variables de entorno
cp .env.example .env.local

# Iniciar en desarrollo
bun dev
\`\`\`

## Estructura del Proyecto

\`\`\`
src/
├── routes/          # Rutas de SvelteKit
├── lib/
│   ├── components/  # Componentes UI
│   ├── services/    # Lógica de negocio
│   └── utils/       # Utilidades
└── app.d.ts         # Tipos globales
\`\`\`

## Contribuir
Ver CONTRIBUTING.md para guías de desarrollo.
`,

	'file-alpha-tareas': `# Tareas — Proyecto Alpha

## En Progreso
- [ ] Implementar sincronización en tiempo real (#127)
- [ ] Migración de datos históricos (#134)
- [ ] Pruebas de carga en staging (#141)

## Por Hacer — Sprint 4
- [ ] Panel de administración de usuarios
- [ ] Sistema de permisos por rol
- [ ] Exportación a múltiples formatos
- [ ] Integración con Slack

## Completado ✓
- [x] Autenticación con OAuth (GitHub, Google)
- [x] Editor de markdown con preview
- [x] Búsqueda de texto completo
- [x] Historial de versiones
- [x] API pública documentada
- [x] Modo oscuro / claro

## Backlog
- Aplicación móvil (React Native)
- Importar desde Notion / Obsidian
- Plugins de terceros
- Análisis de uso con PostHog
`,

	'file-beta': `# Proyecto Beta

## Estado: En planificación

Este proyecto está actualmente en fase de investigación.

## Objetivo
Construir un sistema de análisis de datos en tiempo real para monitorear
métricas clave del negocio.

## Requerimientos Preliminares

### Funcionales
- Ingesta de datos desde múltiples fuentes
- Visualizaciones interactivas y personalizables
- Alertas configurables por umbral
- Exportación a CSV / Excel / PDF
- Acceso basado en roles

### No Funcionales
- Latencia < 100ms en consultas
- Disponibilidad 99.9%
- Datos cifrados en tránsito y en reposo
- GDPR compliant

## Investigación Pendiente
- Evaluar ClickHouse vs TimescaleDB
- Proof of concept con Apache Kafka
- Revisar costos en AWS vs GCP

## Timeline Estimado
- Fase 1 — Investigación: enero - febrero 2024
- Fase 2 — MVP: marzo - mayo 2024
- Fase 3 — Beta: junio 2024
`,

	'file-setup': `#!/bin/bash
# setup.sh — Configuración inicial del entorno de desarrollo

set -e

echo "Iniciando configuración del entorno..."

# Verificar dependencias
command -v bun >/dev/null 2>&1 || { echo "Error: bun no está instalado"; exit 1; }
command -v git >/dev/null 2>&1 || { echo "Error: git no está instalado"; exit 1; }

# Instalar dependencias
echo "Instalando dependencias..."
bun install

# Configurar variables de entorno
if [ ! -f .env.local ]; then
  echo "Creando .env.local desde template..."
  cp .env.example .env.local
  echo "Por favor edita .env.local con tus credenciales"
fi

# Ejecutar migraciones
echo "Ejecutando migraciones de base de datos..."
bun run db:migrate

# Verificar configuración
echo "Verificando configuración..."
bun run check

echo ""
echo "Entorno configurado correctamente!"
echo "Ejecuta 'bun dev' para iniciar el servidor de desarrollo"
`,

	'file-utils': `// utils.ts — Utilidades de desarrollo

/**
 * Formatea una fecha al estilo español (DD/MM/YYYY)
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

/**
 * Espera un número de milisegundos
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Trunca un texto a N caracteres
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Genera un ID único basado en timestamp + random
 */
export function generateId(prefix = 'id'): string {
  return \`\${prefix}-\${Date.now()}-\${Math.random().toString(36).slice(2, 9)}\`;
}

/**
 * Agrupa un array por una clave
 */
export function groupBy<T>(
  arr: T[],
  key: (item: T) => string
): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = key(item);
    (acc[k] ??= []).push(item);
    return acc;
  }, {} as Record<string, T[]>);
}
`,

	'file-config': `{
  "app": {
    "name": "Proyecto Alpha",
    "version": "2.1.0",
    "environment": "development",
    "debug": true
  },
  "server": {
    "host": "localhost",
    "port": 5173,
    "cors": {
      "origin": ["http://localhost:3000", "https://app.example.com"],
      "credentials": true
    }
  },
  "database": {
    "provider": "turso",
    "url": "libsql://proyecto-alpha.turso.io",
    "syncInterval": 60
  },
  "auth": {
    "sessionDuration": 604800,
    "providers": ["github", "google"],
    "trustedOrigins": ["https://app.example.com"]
  },
  "features": {
    "realtime": true,
    "offline": false,
    "analytics": true,
    "betaFeatures": false
  }
}
`
};
