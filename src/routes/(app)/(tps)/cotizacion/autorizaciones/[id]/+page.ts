import { server } from '$lib/siteConfig';
export const ssr = false;


export const load = async ({ fetch, params }) => {

  const [cotizacion] = await Promise.all([
    
    fetch(
      server.api + 'sp/spVentaCotizacionBlindajeDetalle',
      {
        method: 'POST',
        body: JSON.stringify({ ID: params.id }),
        headers: {
          'Content-Type': 'application/json',
          Authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6Ik1BU0VSUCIsIm5iZiI6MTcwNDczOTg5MiwiZXhwIjoxNzk0NzM5ODkyLCJpYXQiOjE3MDQ3Mzk4OTIsImlzcyI6IkFQSSBSRVNUIiwiYXVkIjoiTUFTIEVSUCJ9.FjzsgDNyQRodwo_vk1UgJ8RcC0xh27SSZm7NoLotIok'
        }
      }
    ),

  ]);


  return {
    cotizacion: await cotizacion.json(),

  };
};
