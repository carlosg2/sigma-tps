import { superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import { step1Schema, type VehicleRequestSchema } from "./schema.js";
import { server } from '$lib/siteConfig';

export const ssr = false;

// Token de autorización común
const AUTH_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6Ik1BU0VSUCIsIm5iZiI6MTcwNDczOTg5MiwiZXhwIjoxNzk0NzM5ODkyLCJpYXQiOjE3MDQ3Mzk4OTIsImlzcyI6IkFQSSBSRVNUIiwiYXVkIjoiTUFTIEVSUCJ9.FjzsgDNyQRodwo_vk1UgJ8RcC0xh27SSZm7NoLotIok';

// Headers comunes para las peticiones
const createHeaders = () => ({
	'Content-Type': 'application/json',
	Authorization: AUTH_TOKEN
});

// Función para mapear datos del cliente al schema del paso 1
const mapearDatosCliente = (cliente: any) => {
	if (!cliente) return null;
	
	return {
		// Mapear datos del cliente a los campos existentes en el schema
		cliente: cliente.Cliente || "",           // "C01549" - ID del cliente
		compania: cliente.Nombre || "",          // "ROGELIO CEBALLOS ALANIS"
		cliente_nombre: cliente.Contacto || "",  // "ROGELIO CEBALLOS ALANIS"
		cliente_telefono: cliente.Telefonos || "", // "936 9887"
		cliente_email: cliente.Email || "",      // "rogelio.ceballos@gmail.com"
		
		// Datos del vehículo - vacíos para que el usuario los complete
		marca: "",
		modelo: "",
		año: "",
		
		// Inicializar campos de seguridad - vacíos
		uso: undefined,
		amenazas: undefined,
		cobertura: undefined,
		requisitos: "",
		ubicacion: ""
	};
};

export const load = async ({ fetch, params }) => {
	const headers = createHeaders();

	// Obtener lista de clientes
	const [clientesResponse] = await Promise.all([
		fetch(server.api + 'sp/spWebClienteLista', {
			method: 'POST',
			body: JSON.stringify({ Usuario: "MASERP"}),
			headers
		}),
	]);

	const clientes = await clientesResponse.json();
	
	// Buscar el cliente específico por ID
	const clienteSeleccionado = clientes.find((cliente: any) => cliente.Cliente === params.id);
	
	if (!clienteSeleccionado) {
		throw new Error(`Cliente con ID ${params.id} no encontrado`);
	}

	// Mapear datos del cliente para precarga del paso 1
	const datosPreCargados = mapearDatosCliente(clienteSeleccionado);

	return {
		app: "AppCotizacion",
		form: await superValidate(datosPreCargados, zod(step1Schema), { errors: false }),
		formPaso1: await superValidate(
			datosPreCargados, 
			zod(step1Schema),
			{ errors: false }
		),
		
		ID: params.id,
		clienteSeleccionado,
		clientes
	};
};