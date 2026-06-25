import { server } from '$lib/siteConfig';
import { error } from '@sveltejs/kit';
export const ssr = false;

export const load = async ({ fetch, params }) => {
  try {
    // Cargar la lista de cotizaciones desde el procedimiento almacenado
    const cotizacionesResponse = await fetch(
      server.api + 'sp/spVentaCotizacionBlindajeLista',
      {
        method: 'POST',
        body: JSON.stringify({ Usuario: "MASERP" }),
        headers: {
          'Content-Type': 'application/json',
          Authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6Ik1BU0VSUCIsIm5iZiI6MTcwNDczOTg5MiwiZXhwIjoxNzk0NzM5ODkyLCJpYXQiOjE3MDQ3Mzk4OTIsImlzcyI6IkFQSSBSRVNUIiwiYXVkIjoiTUFTIEVSUCJ9.FjzsgDNyQRodwo_vk1UgJ8RcC0xh27SSZm7NoLotIok'
        }
      }
    );

    if (!cotizacionesResponse.ok) {
      throw error(500, 'Error al cargar las cotizaciones');
    }

    const cotizaciones = await cotizacionesResponse.json();
    
    // Buscar la solicitud específica por ID
    const cotizacionRaw = cotizaciones.find((cotizacion: any) => 
      cotizacion.ID === parseInt(params.id) || 
      String(cotizacion.ID) === params.id
    );

    if (!cotizacionRaw) {
      throw error(404, `Solicitud de cotización con ID ${params.id} no encontrada`);
    }

    // Parsear los comentarios para extraer los datos
    function parseComentarios(comentarios: string) {
      const datos: Record<string, string> = {};
      if (!comentarios) return datos;
      
      const lineas = comentarios.split('\r\n').filter(linea => linea.trim());
      for (const linea of lineas) {
        const match = linea.match(/^\s*(\w+):\s*(.+)$/);
        if (match) {
          datos[match[1].toLowerCase()] = match[2].trim();
        }
      }
      return datos;
    }

    const datosParsed = parseComentarios(cotizacionRaw.Comentarios || '');

    // Mapear los datos al formato esperado por la interfaz
    const solicitud = {
      cliente: cotizacionRaw.Cliente || '',
      cliente_nombre: cotizacionRaw.Nombre || '',
      cliente_telefono: datosParsed.telefono || '',
      cliente_email: datosParsed.email || '',
      marca: datosParsed.marca || cotizacionRaw.Empresa || '',
      modelo: datosParsed.modelo || '',
      año: String(cotizacionRaw.Año || ''), // Usar el campo Año directo de la API
      uso: datosParsed.uso || '',
      amenazas: datosParsed.amenazas || '',
      cobertura: datosParsed.cobertura || '',
      requisitos: datosParsed.requisitos || '',
      ubicacion: datosParsed.ubicacion || '',
      // Datos adicionales del API
      estatus: cotizacionRaw.Estatus || '',
      situacion: cotizacionRaw.Situacion || '',
      fechaEmision: cotizacionRaw.FechaEmision || '',
      concepto: cotizacionRaw.Concepto || ''
    };

    return {
      solicitud,
      id: params.id
    };
  } catch (err) {
    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }
    throw error(500, 'Error al cargar la solicitud de cotización');
  }
};
