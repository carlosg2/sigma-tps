import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { step6Schema as lastStep, step1Schema } from "./schema.js";
import { server } from '$lib/siteConfig';
import { z } from "zod";

export const ssr = false;

// Schema modificado para el paso 1 cuando hay datos precargados
// Permite campos vacíos en los datos que no vienen de la orden de compra
const step1SchemaConPrecarga = step1Schema.extend({
	marca: z.string().min(0, "").optional().or(z.literal("")),
	placas: z.string().min(0, "").optional().or(z.literal("")), 
	color: z.string().min(0, "").optional().or(z.literal("")),
	kilometraje: z.string().min(0, "").optional().or(z.literal(""))
});

// Token de autorización común
const AUTH_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6Ik1BU0VSUCIsIm5iZiI6MTcwNDczOTg5MiwiZXhwIjoxNzk0NzM5ODkyLCJpYXQiOjE3MDQ3Mzk4OTIsImlzcyI6IkFQSSBSRVNUIiwiYXVkIjoiTUFTIEVSUCJ9.FjzsgDNyQRodwo_vk1UgJ8RcC0xh27SSZm7NoLotIok';

// Headers comunes para las peticiones
const createHeaders = () => ({
	'Content-Type': 'application/json',
	Authorization: AUTH_TOKEN
});

// Función para mapear datos de orden de compra al schema del paso 1
const mapearDatosOrdenCompra = (ordenCompra: any[]) => {
	if (!ordenCompra || ordenCompra.length === 0) return null;
	
	const datos = ordenCompra[0];
	return {
		// Datos del cliente (del proveedor) - ESTOS SÍ vienen de la orden
		cliente_nombre: datos.Nombre || "",
		cliente_telefono: datos.Telefonos || "",
		cliente_email: datos.EMail || "",
		
		// Datos del vehículo que SÍ vienen de la orden
		modelo: datos.Descripcion1 || "",
		año: datos.Modelo || "",
		numero_serie: datos.VIN || "",
		
		// Datos que NO vienen en la orden - se dejan completamente vacíos
		// para que el usuario los complete sin confusión
		marca: "",
		placas: "",
		color: "",
		kilometraje: "",
	};
};

export const load = async ({ fetch, params }) => {
	const headers = createHeaders();

	const [rutaAnexoResponse, ordenCompraResponse] = await Promise.all([
		fetch(server.api + 'sp/spWebRutaAnexoVehiculo', {
			method: 'POST',
			body: JSON.stringify({ Modulo: "COMS", ID: params.id }),
			headers
		}),
		fetch(server.api + 'sp/spOrdenCompraIdentificar', {
			method: 'POST',
			body: JSON.stringify({ ID: params.id }),
			headers
		})
	]);

	// Procesar respuestas
	const [rutaAnexoData, ordenCompraData] = await Promise.all([
		rutaAnexoResponse.json(),
		ordenCompraResponse.json()
	]);

	// Obtener ruta dinámica
	const rutaDinamica = rutaAnexoData[0]?.Ruta || 'D:\\PruebaCG\\VehicleReception';

	// Mapear datos para precarga del paso 1
	const datosPreCargados = mapearDatosOrdenCompra(ordenCompraData);

	// Configuración de la API
	const API_CONFIG = {
		url: 'https://api.maserp.mx/api/upload',
		token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6ImFkbWluQHNlcHJvYmFuLmNvbS5teCIsIm5iZiI6MTc1MzczMjcwMywiZXhwIjoxODQzNzMyNzAzLCJpYXQiOjE3NTM3MzI3MDMsImlzcyI6IkFQSSBSRVNUIiwiYXVkIjoiTUFTIEVSUCJ9.OYPiY9HXvSyY4L_Je-Cf0wmbE2oKzC8V5VNUVfI1-u4',
		path: rutaDinamica,
		timeout: 30000,
		maxFileSize: 5 * 1024 * 1024,
		acceptedTypes: ['image/jpeg', 'image/png', 'image/webp']
	};

	return {
		app: "AppNomina",
		form: await superValidate(zod(lastStep)),
		formPaso1: await superValidate(
			datosPreCargados, 
			zod(datosPreCargados ? step1SchemaConPrecarga : step1Schema)
		),
		API_CONFIG,
		Modulo: "COMS",
		ID: params.id,
		Title: params.id ? `Recepción ${params.id}` : 'Nueva Recepción',
		ordenCompra: ordenCompraData
	};
};