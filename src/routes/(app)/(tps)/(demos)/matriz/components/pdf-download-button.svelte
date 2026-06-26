<script lang="ts">
	import { Button } from "$lib/components/ui/button/index.js";
	import DownloadIcon from "@lucide/svelte/icons/download";
	import LoaderIcon from "@lucide/svelte/icons/loader";
	import type { MatrizMaterial, Revision } from "../data/schemas.js";
	import type { TDocumentDefinitions, Content, TableCell } from "pdfmake/interfaces";

	let { data, revisiones = [] }: { data: MatrizMaterial[]; revisiones?: Revision[] } = $props();

	let isGenerating = $state(false);

	// Colores del tema TPS
	const colors = {
		primary: "#B54709", // Naranja TPS
		primaryDark: "#B54709",
		headerBg: "#2D2D2D",
		headerText: "#FFFFFF",
		categoryBg: "#F5F5F5",
		categoryText: "#333333",
		borderColor: "#DDDDDD",
		lightGray: "#F9F9F9",
	};

	// Agrupar materiales por categoría
	function groupByCategory(materials: MatrizMaterial[]): Map<string, MatrizMaterial[]> {
		const grouped = new Map<string, MatrizMaterial[]>();
		
		// Orden predefinido de categorías (basado en las imágenes)
		const categoryOrder = [
			"INFORMACIÓN GENERAL",
			"BLINDAJE OPACO",
			"TECHO",
			"TOLVA DE PARABRISAS Y PARED DE FUEGO",
			"POSTES, BISELES Y PISO",
			"PUERTAS",
			"DIVISORIO / MAMPARA / RESPALDO",
			"PROTECCION DE MOTOR / PERIFERIA",
			"5TA PUERTA",
			"BLINDAJE TRANSPARENTE",
			"EQUIPO PERFORMANCE",
		];

		// Primero agrupar
		for (const material of materials) {
			const category = material.categoria;
			if (!grouped.has(category)) {
				grouped.set(category, []);
			}
			grouped.get(category)!.push(material);
		}

		// Ordenar según el orden predefinido
		const orderedMap = new Map<string, MatrizMaterial[]>();
		for (const cat of categoryOrder) {
			if (grouped.has(cat)) {
				orderedMap.set(cat, grouped.get(cat)!);
			}
		}
		// Agregar categorías que no estén en el orden predefinido
		for (const [cat, items] of grouped) {
			if (!orderedMap.has(cat)) {
				orderedMap.set(cat, items);
			}
		}

		return orderedMap;
	}

	// Generar la tabla de especificaciones para una categoría
	function generateCategoryTable(categoryName: string, materials: MatrizMaterial[]): Content[] {
		const tableBody: TableCell[][] = [];
		
		// Header de la categoría (fila que abarca todo el ancho)
		tableBody.push([
			{
				text: categoryName,
				colSpan: 4,
				style: "categoryHeader",
				fillColor: colors.categoryBg,
				margin: [5, 8, 5, 8],
			},
			{},
			{},
			{},
		]);

		// Header de columnas
		tableBody.push([
			{ text: "#", style: "tableHeader", fillColor: colors.headerBg, alignment: "center" },
			{ text: "DESCRIPCIÓN", style: "tableHeader", fillColor: colors.headerBg },
			{ text: "CÓDIGO", style: "tableHeader", fillColor: colors.headerBg, alignment: "center" },
			{ text: "ESPECIFICACIÓN", style: "tableHeader", fillColor: colors.headerBg },
		]);

		// Filas de datos
		materials.forEach((material, index) => {
			const isEven = index % 2 === 0;
			const rowFillColor = isEven ? colors.lightGray : "#FFFFFF";
			
			tableBody.push([
				{ 
					text: (index + 1).toString(), 
					style: "tableCell", 
					fillColor: rowFillColor,
					alignment: "center",
				},
				{ 
					text: material.descripcion, 
					style: "tableCell", 
					fillColor: rowFillColor,
				},
				{ 
					text: material.codigo_material, 
					style: "tableCell", 
					fillColor: rowFillColor,
					alignment: "center",
				},
				{ 
					text: material.especificacion, 
					style: "tableCell", 
					fillColor: rowFillColor,
				},
			]);
		});

		return [
			{
				table: {
					headerRows: 2,
					widths: [30, "*", 60, "*"],
					body: tableBody,
				},
				layout: {
					hLineWidth: () => 0.5,
					vLineWidth: () => 0.5,
					hLineColor: () => colors.borderColor,
					vLineColor: () => colors.borderColor,
				},
				margin: [0, 0, 0, 15],
			},
		];
	}

	// Generar el documento PDF
	async function generatePDF() {
		if (data.length === 0) return;
		
		isGenerating = true;

		try {
			// Importar pdfmake dinámicamente (solo en cliente)
			const pdfMakeModule = await import("pdfmake/build/pdfmake");
			const pdfFontsModule = await import("pdfmake/build/vfs_fonts");
			const pdfMake = pdfMakeModule.default;
			const pdfFonts = pdfFontsModule.default;
			
			// @ts-expect-error - pdfmake types are incomplete
			pdfMake.addVirtualFileSystem(pdfFonts);

			// Información del vehículo del primer registro
			const vehiculo = data[0];
			const fechaActual = new Date().toLocaleDateString("es-MX", {
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
			});

			// Agrupar por categoría
			const groupedMaterials = groupByCategory(data);

			// Construir contenido del documento
			const content: Content[] = [];

			// Cabecero del documento
			content.push({
				columns: [
					{
						width: 100,
						stack: [
							{
								text: "TPS",
								style: "logoText",
								color: colors.primary,
							},
							{
								text: "ARMORING",
								style: "logoSubtext",
								color: colors.primaryDark,
							},
						],
					},
					{
						width: "*",
						stack: [
							{
								text: "ESPECIFICACIONES TÉCNICAS DE BLINDAJE",
								style: "mainTitle",
								alignment: "center",
							},
						],
						margin: [0, 10, 0, 0],
					},
					{
						width: 120,
						stack: [
							{
								text: "CONFIG. MODELO",
								style: "configLabel",
								alignment: "right",
							},
							{
								text: vehiculo.clave_vehiculo,
								style: "configValue",
								alignment: "right",
								color: colors.primary,
							},
						],
					},
				],
				margin: [0, 0, 0, 15],
			});

			// Información general del vehículo
			content.push({
				table: {
					widths: [100, "*", 100, "*"],
					body: [
						[
							{ text: "config. Modelo", style: "infoLabel" },
							{ text: vehiculo.clave_vehiculo, style: "infoValue", colSpan: 1 },
							{ text: "Nivel de Blindaje", style: "infoLabel" },
							{ text: vehiculo.nivel_nombre, style: "infoValue" },
						],
						[
							{ text: "Producto", style: "infoLabel" },
							{ text: vehiculo.nombre_vehiculo, style: "infoValue" },
							{ text: "Diseño de Blindaje", style: "infoLabel" },
							{ text: vehiculo.diseno_nombre, style: "infoValue" },
						],
						[
							{ text: "Marca, Modelo y Versión", style: "infoLabel" },
							{ text: `${vehiculo.marca} ${vehiculo.modelo}`, style: "infoValueBold", color: colors.primary },
							{ text: "Planta", style: "infoLabel" },
							{ text: "PLANTA 1", style: "infoValueBold" },
						],
						[
							{ text: "Año del Modelo", style: "infoLabel" },
							{ text: vehiculo.anio.toString(), style: "infoValueBold", color: colors.primary },
							{ text: "Días Fabricación", style: "infoLabel" },
							{ text: "15 SEMANAS SEGÚN PROGRAMACIÓN", style: "infoValue", color: colors.primary },
						],
					],
				},
				layout: {
					hLineWidth: () => 0.5,
					vLineWidth: () => 0.5,
					hLineColor: () => colors.borderColor,
					vLineColor: () => colors.borderColor,
					paddingTop: () => 5,
					paddingBottom: () => 5,
				},
				margin: [0, 0, 0, 20],
			});

			// Tabla de revisiones (dinámicas)
			const revisionTableBody: TableCell[][] = [
				[
					{ text: "REVISIÓN", style: "revisionHeader", fillColor: colors.primary, color: "#FFFFFF", alignment: "center" },
					{ text: "DESCRIPCIÓN", style: "revisionHeader", fillColor: colors.primary, color: "#FFFFFF", alignment: "center" },
					{ text: "USUARIO", style: "revisionHeader", fillColor: colors.primary, color: "#FFFFFF", alignment: "center" },
					{ text: "FECHA", style: "revisionHeader", fillColor: colors.primary, color: "#FFFFFF", alignment: "center" },
				],
			];

			// Agregar todas las revisiones
			for (const revision of revisiones) {
				revisionTableBody.push([
					{ text: revision.numero.toString().padStart(2, "0"), style: "revisionCell", alignment: "center" },
					{ text: revision.descripcion, style: "revisionCell", alignment: "left" },
					{ text: revision.usuario, style: "revisionCell", alignment: "center" },
					{ text: revision.fecha, style: "revisionCell", alignment: "center" },
				]);
			}

			content.push({
				table: {
					widths: [50, "*", 80, 70],
					body: revisionTableBody,
				},
				layout: {
					hLineWidth: () => 0.5,
					vLineWidth: () => 0.5,
					hLineColor: () => colors.borderColor,
					vLineColor: () => colors.borderColor,
				},
				margin: [0, 0, 0, 20],
			});

			// Tablas por categoría
			for (const [categoryName, materials] of groupedMaterials) {
				content.push(...generateCategoryTable(categoryName, materials));
			}

			// Sección de comentarios de ingeniería
			content.push({
				text: "COMENTARIOS DE INGENIERÍA",
				style: "sectionTitle",
				margin: [0, 10, 0, 5],
			});

			content.push({
				ul: [
					"Documento generado automáticamente desde el sistema INTELISIS",
					"Las especificaciones pueden variar según disponibilidad de materiales",
					"Consultar con el departamento de ingeniería para modificaciones",
				],
				style: "commentsList",
				margin: [0, 0, 0, 20],
			});

			// Sección de firmas
			content.push({
				text: "FIRMAS DE AUTORIZACIÓN",
				style: "sectionTitle",
				margin: [0, 10, 0, 15],
			});

			content.push({
				columns: [
					{
						width: "*",
						stack: [
							{ text: "________________________", alignment: "center" },
							{ text: "Elaboró", style: "signatureLabel", alignment: "center", margin: [0, 5, 0, 0] },
							{ text: "Nombre y Firma", style: "signatureSubLabel", alignment: "center" },
						],
					},
					{
						width: "*",
						stack: [
							{ text: "________________________", alignment: "center" },
							{ text: "Gerente General", style: "signatureLabel", alignment: "center", margin: [0, 5, 0, 0] },
							{ text: "Nombre y Firma", style: "signatureSubLabel", alignment: "center" },
						],
					},
					{
						width: "*",
						stack: [
							{ text: "________________________", alignment: "center" },
							{ text: "Gerente de Ingeniería", style: "signatureLabel", alignment: "center", margin: [0, 5, 0, 0] },
							{ text: "Nombre y Firma", style: "signatureSubLabel", alignment: "center" },
						],
					},
				],
				margin: [0, 0, 0, 30],
			});

			content.push({
				columns: [
					{
						width: "*",
						stack: [
							{ text: "________________________", alignment: "center" },
							{ text: "Gerente de Calidad / Ingeniería", style: "signatureLabel", alignment: "center", margin: [0, 5, 0, 0] },
							{ text: "Nombre y Firma", style: "signatureSubLabel", alignment: "center" },
						],
					},
					{
						width: "*",
						stack: [
							{ text: "________________________", alignment: "center" },
							{ text: "Validación de Materiales", style: "signatureLabel", alignment: "center", margin: [0, 5, 0, 0] },
							{ text: "Nombre y Firma", style: "signatureSubLabel", alignment: "center" },
						],
					},
					{
						width: "*",
						stack: [
							{ text: "________________________", alignment: "center" },
							{ text: "Gerente de Producción", style: "signatureLabel", alignment: "center", margin: [0, 5, 0, 0] },
							{ text: "Nombre y Firma", style: "signatureSubLabel", alignment: "center" },
						],
					},
				],
			});

			// Definición del documento
			const docDefinition: TDocumentDefinitions = {
				pageSize: "LETTER",
				pageMargins: [40, 40, 40, 60],
				content,
				footer: (currentPage: number, pageCount: number) => ({
					columns: [
						{
							text: `Generado el ${fechaActual} desde INTELISIS`,
							style: "footerText",
							alignment: "left",
							margin: [40, 0, 0, 0],
						},
						{
							text: `Página ${currentPage} de ${pageCount}`,
							style: "footerText",
							alignment: "right",
							margin: [0, 0, 40, 0],
						},
					],
					margin: [0, 20, 0, 0],
				}),
				styles: {
					logoText: {
						fontSize: 24,
						bold: true,
					},
					logoSubtext: {
						fontSize: 8,
						bold: true,
					},
					mainTitle: {
						fontSize: 14,
						bold: true,
						color: colors.primary,
					},
					configLabel: {
						fontSize: 8,
						bold: true,
					},
					configValue: {
						fontSize: 10,
						bold: true,
					},
					infoLabel: {
						fontSize: 8,
						color: colors.primary,
					},
					infoValue: {
						fontSize: 9,
					},
					infoValueBold: {
						fontSize: 9,
						bold: true,
					},
					revisionHeader: {
						fontSize: 9,
						bold: true,
					},
					revisionCell: {
						fontSize: 9,
					},
					categoryHeader: {
						fontSize: 10,
						bold: true,
						color: colors.categoryText,
					},
					tableHeader: {
						fontSize: 8,
						bold: true,
						color: colors.headerText,
					},
					tableCell: {
						fontSize: 8,
					},
					sectionTitle: {
						fontSize: 10,
						bold: true,
						color: colors.primary,
					},
					commentsList: {
						fontSize: 8,
					},
					signatureLabel: {
						fontSize: 9,
						bold: true,
					},
					signatureSubLabel: {
						fontSize: 7,
						color: "#666666",
					},
					footerText: {
						fontSize: 7,
						color: "#888888",
					},
				},
				defaultStyle: {
					font: "Roboto",
				},
			};

			// Generar y descargar
			const fileName = `Especificaciones_${vehiculo.clave_vehiculo}_${fechaActual.replace(/\//g, "-")}.pdf`;
			pdfMake.createPdf(docDefinition).download(fileName);
		} catch (error) {
			console.error("Error generando PDF:", error);
		} finally {
			isGenerating = false;
		}
	}
</script>

<Button
	variant="default"
	size="sm"
	onclick={generatePDF}
	disabled={isGenerating || data.length === 0}
	class="h-8"
>
	{#if isGenerating}
		<LoaderIcon class="size-4 animate-spin" />
		Generando...
	{:else}
		<DownloadIcon class="size-4" />
		Descargar PDF
	{/if}
</Button>
