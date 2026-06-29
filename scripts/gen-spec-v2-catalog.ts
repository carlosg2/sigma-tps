// Parser one-off: genera los catálogos de spec-v2 desde documentacion/especificaciones/Observaciones.txt
// Uso: node --experimental-strip-types scripts/gen-spec-v2-catalog.ts
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const srcTxt = resolve(root, 'documentacion/especificaciones/Observaciones.txt');
const outDir = resolve(root, 'src/lib/tps/spec-v2');
mkdirSync(outDir, { recursive: true });

const text = readFileSync(srcTxt, 'utf8');
const lines = text.split(/\r?\n/);

// ---- Grupos Mayor ----
type GMayor = { grupoCont: string; grupoMayor: string; descripcion: string };
type GMenor = { grupoCont: string; grupoMayor: string; grupoMenor: string; descripcion: string };
const gmayor: GMayor[] = [];
const gmenor: GMenor[] = [];

let mode: 'none' | 'mayor' | 'menor' | 'spec' = 'none';

type CompDef = { componente: string; descripcion: string };
type SubDef = { subSeccion: string; descripcion: string; orden: number; componentes: CompDef[] };
type SecDef = { seccion: string; descripcion: string; orden: number; subSecciones: SubDef[] };
const sections: SecDef[] = [];
const secMap = new Map<string, SecDef>();
const subMap = new Map<string, SubDef>();

for (const raw of lines) {
	const line = raw.replace(/\u00a0/g, ' ');
	if (line.includes('Tabla ArtGrupoMayor')) { mode = 'mayor'; continue; }
	if (line.includes('Tabla ArtGrupoMenor')) { mode = 'menor'; continue; }
	if (line.startsWith('Catalogo de Especificaciones')) { mode = 'spec'; continue; }
	const cols = line.split('\t').map((c) => c.trim());
	if (mode === 'mayor') {
		if (cols.length < 3) continue;
		if (cols[0] === 'GrupoCont') continue; // header
		if (!/^\d+$/.test(cols[0])) continue;
		gmayor.push({ grupoCont: cols[0], grupoMayor: cols[1], descripcion: cols[2] });
	} else if (mode === 'menor') {
		if (cols.length < 4) continue;
		if (cols[0] === 'GrupoCont') continue;
		if (!/^\d+$/.test(cols[0])) continue;
		gmenor.push({ grupoCont: cols[0], grupoMayor: cols[1], grupoMenor: cols[2], descripcion: cols[3] });
	} else if (mode === 'spec') {
		// Seccion, SeccionDesc, SeccionOrden, SubSeccion, SubSeccionDesc, SubSeccionOrden, Componente, Descripcion
		if (cols.length < 8) continue;
		if (cols[0] === 'Seccion') continue; // header
		const [seccion, seccionDesc, seccionOrden, subSeccion, subSeccionDesc, subSeccionOrden, componente, descripcion] = cols;
		if (!seccion || !componente) continue;
		let sec = secMap.get(seccion);
		if (!sec) {
			sec = { seccion, descripcion: seccionDesc, orden: Number(seccionOrden) || 0, subSecciones: [] };
			secMap.set(seccion, sec);
			sections.push(sec);
		}
		const subKey = `${seccion}::${subSeccion}`;
		let sub = subMap.get(subKey);
		if (!sub) {
			sub = { subSeccion, descripcion: subSeccionDesc, orden: Number(subSeccionOrden) || 0, componentes: [] };
			subMap.set(subKey, sub);
			sec.subSecciones.push(sub);
		}
		sub.componentes.push({ componente, descripcion });
	}
}

// Ordenar
sections.sort((a, b) => a.orden - b.orden || a.seccion.localeCompare(b.seccion));
for (const sec of sections) {
	sec.subSecciones.sort((a, b) => a.orden - b.orden || a.subSeccion.localeCompare(b.subSeccion));
	for (const sub of sec.subSecciones) {
		sub.componentes.sort((a, b) => Number(a.componente) - Number(b.componente) || a.componente.localeCompare(b.componente));
	}
}

const sectionsTs = `// AUTO-GENERADO por scripts/gen-spec-v2-catalog.ts — no editar a mano.
// Catalogo jerarquico de especificaciones: Seccion -> SubSeccion -> Componente.

export interface SpecComponentDef {
	/** numero de componente (clave dentro del catalogo) */
	componente: string;
	descripcion: string;
}

export interface SpecSubSectionDef {
	subSeccion: string;
	descripcion: string;
	orden: number;
	componentes: SpecComponentDef[];
}

export interface SpecSectionDef {
	seccion: string;
	descripcion: string;
	orden: number;
	subSecciones: SpecSubSectionDef[];
}

export const SPEC_SECTIONS: SpecSectionDef[] = ${JSON.stringify(sections, null, '\t')};

export const SPEC_COMPONENT_COUNT = ${sections.reduce((n, s) => n + s.subSecciones.reduce((m, ss) => m + ss.componentes.length, 0), 0)};
`;

const gruposTs = `// AUTO-GENERADO por scripts/gen-spec-v2-catalog.ts — no editar a mano.
// Agrupadores jerarquicos del catalogo de articulos de especificacion.

export interface GrupoMayorDef {
	grupoCont: string;
	grupoMayor: string;
	descripcion: string;
}

export interface GrupoMenorDef {
	grupoCont: string;
	grupoMayor: string;
	grupoMenor: string;
	descripcion: string;
}

export const GRUPOS_MAYOR: GrupoMayorDef[] = ${JSON.stringify(gmayor, null, '\t')};

export const GRUPOS_MENOR: GrupoMenorDef[] = ${JSON.stringify(gmenor, null, '\t')};
`;

writeFileSync(resolve(outDir, 'catalog-sections.ts'), sectionsTs);
writeFileSync(resolve(outDir, 'catalog-grupos.ts'), gruposTs);

console.log('Secciones:', sections.length);
console.log('Subsecciones:', sections.reduce((n, s) => n + s.subSecciones.length, 0));
console.log('Componentes:', sections.reduce((n, s) => n + s.subSecciones.reduce((m, ss) => m + ss.componentes.length, 0), 0));
console.log('Grupos Mayor:', gmayor.length);
console.log('Grupos Menor:', gmenor.length);
