import { server } from '$lib/siteConfig';
import { get } from 'svelte/store';
/* import { user, calendario } from "$lib/stores/user"; */
export const ssr = false;



export const load = async ({ fetch, params }) => {

  const [ESCOLTAS] = await Promise.all([
    
    fetch(
      server.api + 'sp/spArtCategoriaLista',
      {
        method: 'POST',
        body: JSON.stringify({ Usuario: "MASERP", Categoria: "ESCOLTAS" }),
        headers: {
          'Content-Type': 'application/json',
          Authorization:
            'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6Ik1BU0VSUCIsIm5iZiI6MTcwNDczOTg5MiwiZXhwIjoxNzk0NzM5ODkyLCJpYXQiOjE3MDQ3Mzk4OTIsImlzcyI6IkFQSSBSRVNUIiwiYXVkIjoiTUFTIEVSUCJ9.FjzsgDNyQRodwo_vk1UgJ8RcC0xh27SSZm7NoLotIok'
        }
      }
    )
  ]);


  return {
    data: await ESCOLTAS.json(),
  };
};
