import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { step6Schema as lastStep } from "./schema.js";
import { server } from '$lib/siteConfig';
export const ssr = false;

export const load = async ({ fetch, params }) => {

	const [RutaAnexo] = await Promise.all([
		
		fetch(
			server.api + 'sp/spWebRutaAnexoVehiculo',
			{
				method: 'POST',
				body: JSON.stringify({ Modulo: "COMS", ID: "19216" }),
				headers: {
					'Content-Type': 'application/json',
					Authorization:
					'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6Ik1BU0VSUCIsIm5iZiI6MTcwNDczOTg5MiwiZXhwIjoxNzk0NzM5ODkyLCJpYXQiOjE3MDQ3Mzk4OTIsImlzcyI6IkFQSSBSRVNUIiwiYXVkIjoiTUFTIEVSUCJ9.FjzsgDNyQRodwo_vk1UgJ8RcC0xh27SSZm7NoLotIok'
				}
			}
		)
	]);

	// Obtener la ruta dinámica del response
	const rutaAnexoData = await RutaAnexo.json();
	const rutaDinamica = rutaAnexoData[0]?.Ruta || 'D:\\PruebaCG\\VehicleReception'; // fallback por defecto

	// Configuración de la API con ruta dinámica
	const API_CONFIG = {
		url: 'https://api.maserp.mx/api/upload',
		token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6ImFkbWluQHNlcHJvYmFuLmNvbS5teCIsIm5iZiI6MTc1MzczMjcwMywiZXhwIjoxODQzNzMyNzAzLCJpYXQiOjE3NTM3MzI3MDMsImlzcyI6IkFQSSBSRVNUIiwiYXVkIjoiTUFTIEVSUCJ9.OYPiY9HXvSyY4L_Je-Cf0wmbE2oKzC8V5VNUVfI1-u4',
		path: rutaDinamica,
		timeout: 30000, // 30 segundos
		maxFileSize: 5 * 1024 * 1024, // 5MB
		acceptedTypes: ['image/jpeg', 'image/png', 'image/webp']
	};

	return {
		app: "AppNomina",
		form: await superValidate(zod(lastStep)),
		API_CONFIG
	};
};