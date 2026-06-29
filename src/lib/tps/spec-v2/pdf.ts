import type { SpecificationV2, SpecArticle } from './types';
import { SPEC_SECTIONS } from './catalog-sections';
import { SPEC_V2_STATUS_LABELS, SPEC_AUTH_STATUS_LABELS } from './constants';
import { ARMOR_LEVEL_LABELS } from '$lib/tps/constants';

const PRIMARY = '#1d4ed8';
const MUTED = '#6b7280';

function sectionDesc(seccion: string): string {
	return SPEC_SECTIONS.find((s) => s.seccion === seccion)?.descripcion ?? seccion;
}
function subSectionDesc(seccion: string, subSeccion: string): string {
	const sec = SPEC_SECTIONS.find((s) => s.seccion === seccion);
	return sec?.subSecciones.find((ss) => ss.subSeccion === subSeccion)?.descripcion ?? subSeccion;
}

/**
 * Genera y descarga/abre el PDF de una especificacion v2.
 * pdfmake se importa dinamicamente para evitar problemas de SSR.
 */
export async function exportSpecPdf(
	spec: SpecificationV2,
	articles: SpecArticle[],
	mode: 'download' | 'open' = 'download'
) {
	const pdfMakeModule: any = await import('pdfmake/build/pdfmake');
	const pdfFontsModule: any = await import('pdfmake/build/vfs_fonts');
	const pdfMake = pdfMakeModule.default ?? pdfMakeModule;
	const vfs =
		pdfFontsModule.default?.pdfMake?.vfs ??
		pdfFontsModule.default?.vfs ??
		pdfFontsModule.pdfMake?.vfs ??
		pdfFontsModule.vfs;
	if (vfs) pdfMake.vfs = vfs;

	const articleById = new Map(articles.map((a) => [a.id, a]));

	// Agrupar componentes capturados por seccion -> subseccion
	const bySec = new Map<string, Map<string, typeof spec.components>>();
	for (const c of spec.components) {
		if (!bySec.has(c.seccion)) bySec.set(c.seccion, new Map());
		const subMap = bySec.get(c.seccion)!;
		if (!subMap.has(c.subSeccion)) subMap.set(c.subSeccion, []);
		subMap.get(c.subSeccion)!.push(c);
	}

	const content: any[] = [];

	// Encabezado
	const leftStack: any[] = [
		{ text: `${spec.brand} ${spec.model}`, style: 'h2' },
		{ text: `Año: ${spec.year}`, style: 'meta' },
		{ text: `Nivel: ${ARMOR_LEVEL_LABELS[spec.armorLevel] ?? spec.armorLevel}`, style: 'meta' }
	];
	if (spec.producto) leftStack.push({ text: `Producto: ${spec.producto}`, style: 'meta' });
	if (spec.disenoBlindaje) leftStack.push({ text: `Diseño de blindaje: ${spec.disenoBlindaje}`, style: 'meta' });
	if (spec.planta) leftStack.push({ text: `Planta: ${spec.planta}`, style: 'meta' });
	if (spec.diasFabricacion) leftStack.push({ text: `Dias de fabricacion: ${spec.diasFabricacion}`, style: 'meta' });

	content.push(
		{ text: 'Especificacion Tecnica de Blindaje', style: 'title' },
		{ text: spec.code, style: 'code', margin: [0, 0, 0, 8] },
		{
			columns: [
				{
					width: '*',
					stack: leftStack
				},
				{
					width: 'auto',
					stack: [
						{ text: `Version: v${spec.version}`, style: 'meta', alignment: 'right' },
						{ text: `Estatus: ${SPEC_V2_STATUS_LABELS[spec.status]}`, style: 'meta', alignment: 'right' },
						{ text: `Generado: ${new Date().toLocaleDateString('es-MX')}`, style: 'meta', alignment: 'right' }
					]
				}
			],
			margin: [0, 0, 0, 12]
		}
	);

	// Secciones (en orden del catalogo)
	for (const sec of SPEC_SECTIONS) {
		const subMap = bySec.get(sec.seccion);
		if (!subMap || subMap.size === 0) continue;
		content.push({ text: `${sec.seccion}. ${sec.descripcion}`, style: 'section', margin: [0, 10, 0, 4] });

		for (const sub of sec.subSecciones) {
			const comps = subMap.get(sub.subSeccion);
			if (!comps || comps.length === 0) continue;
			content.push({ text: subSectionDesc(sec.seccion, sub.subSeccion), style: 'subsection', margin: [0, 6, 0, 2] });
			const body = [
				[
					{ text: '#', style: 'th' },
					{ text: 'Componente', style: 'th' },
					{ text: 'Cod.', style: 'th' },
					{ text: 'Valor', style: 'th' },
					{ text: 'Articulo', style: 'th' },
					{ text: 'Cant.', style: 'th', alignment: 'right' }
				],
				...comps.map((c) => {
					const art = c.specArticleId ? articleById.get(c.specArticleId) : undefined;
					return [
						{ text: c.componente, style: 'td' },
						{ text: c.descripcion, style: 'td' },
						{ text: c.notes || '—', style: 'tdMuted' },
						{ text: c.value || '—', style: 'td' },
						{ text: art ? `${art.code}` : '—', style: 'tdMuted' },
						{ text: c.quantity > 0 ? String(c.quantity) : '—', style: 'td', alignment: 'right' }
					];
				})
			];
			content.push({
				table: { headerRows: 1, widths: [24, '*', 54, '*', 80, 26], body },
				layout: {
					hLineWidth: (i: number) => (i === 1 ? 0.8 : 0.4),
					hLineColor: () => '#e5e7eb',
					vLineWidth: () => 0,
					paddingTop: () => 3,
					paddingBottom: () => 3
				},
				margin: [0, 0, 0, 6]
			});
		}
	}

	if (spec.components.length === 0) {
		content.push({ text: 'Esta especificacion no tiene componentes capturados.', style: 'meta', margin: [0, 10, 0, 0] });
	}

	// Comentarios de ingenieria
	if (spec.comentariosIngenieria && spec.comentariosIngenieria.length > 0) {
		content.push({ text: 'Comentarios de ingenieria', style: 'section', margin: [0, 14, 0, 4] });
		content.push({
			ol: spec.comentariosIngenieria.map((t) => ({ text: t, style: 'td' })),
			margin: [0, 0, 0, 4]
		});
	}

	// Accesorios
	const accStd = spec.accesoriosEstandar ?? [];
	const accOpt = spec.accesoriosOpcionales ?? [];
	if (accStd.length > 0 || accOpt.length > 0) {
		content.push({ text: 'Accesorios', style: 'section', margin: [0, 14, 0, 4] });
		if (accStd.length > 0) {
			content.push({ text: 'Estandar', style: 'subsection', margin: [0, 4, 0, 2] });
			content.push({ ul: accStd.map((a) => ({ text: `${a.code} — ${a.description}`, style: 'td' })) });
		}
		if (accOpt.length > 0) {
			content.push({ text: 'Opcionales', style: 'subsection', margin: [0, 4, 0, 2] });
			content.push({ ul: accOpt.map((a) => ({ text: `${a.code} — ${a.description}`, style: 'td' })) });
		}
	}

	// Autorizaciones
	content.push({ text: 'Autorizaciones', style: 'section', margin: [0, 14, 0, 4] });
	content.push({
		table: {
			headerRows: 1,
			widths: ['*', 'auto', '*', 'auto'],
			body: [
				[
					{ text: 'Departamento', style: 'th' },
					{ text: 'Estatus', style: 'th' },
					{ text: 'Autorizo', style: 'th' },
					{ text: 'Fecha', style: 'th' }
				],
				...spec.authorizations.map((a) => [
					{ text: a.department, style: 'td' },
					{ text: SPEC_AUTH_STATUS_LABELS[a.status], style: 'td' },
					{ text: a.authorizedBy ?? '—', style: 'tdMuted' },
					{ text: a.authorizedAt ?? '—', style: 'tdMuted' }
				])
			]
		},
		layout: {
			hLineWidth: (i: number) => (i === 1 ? 0.8 : 0.4),
			hLineColor: () => '#e5e7eb',
			vLineWidth: () => 0,
			paddingTop: () => 4,
			paddingBottom: () => 4
		}
	});

	const docDefinition = {
		pageSize: 'LETTER',
		pageMargins: [40, 48, 40, 48],
		content,
		defaultStyle: { fontSize: 9, color: '#111827' },
		styles: {
			title: { fontSize: 18, bold: true, color: PRIMARY },
			code: { fontSize: 11, bold: true, color: MUTED },
			h2: { fontSize: 13, bold: true },
			meta: { fontSize: 9, color: MUTED },
			section: { fontSize: 12, bold: true, color: PRIMARY },
			subsection: { fontSize: 10, bold: true, color: '#374151' },
			th: { fontSize: 8, bold: true, color: '#374151', fillColor: '#f3f4f6' },
			td: { fontSize: 8 },
			tdMuted: { fontSize: 8, color: MUTED }
		},
		footer: (currentPage: number, pageCount: number) => ({
			columns: [
				{ text: `TPS ERP — ${spec.code}`, style: 'meta', margin: [40, 0, 0, 0] },
				{ text: `Pagina ${currentPage} de ${pageCount}`, style: 'meta', alignment: 'right', margin: [0, 0, 40, 0] }
			],
			fontSize: 7,
			color: MUTED
		})
	};

	const pdf = pdfMake.createPdf(docDefinition);
	if (mode === 'download') pdf.download(`${spec.code}.pdf`);
	else pdf.open();
}
