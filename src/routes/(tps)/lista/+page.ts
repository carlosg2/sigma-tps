export const ssr = false;

const API = 'https://api.maserp.mx/api/TPS/';
const TOKEN =
  'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6Ik1BU0VSUCIsIm5iZiI6MTcwNDczOTg5MiwiZXhwIjoxNzk0NzM5ODkyLCJpYXQiOjE3MDQ3Mzk4OTIsImlzcyI6IkFQSSBSRVNUIiwiYXVkIjoiTUFTIEVSUCJ9.FjzsgDNyQRodwo_vk1UgJ8RcC0xh27SSZm7NoLotIok';

export const load = async ({ fetch }) => {
  const res = await fetch(API + 'sp/spWebArtMaterialLista', {
    method: 'POST',
    body: JSON.stringify({ WebUsuario: 'MASERP' }),
    headers: {
      'Content-Type': 'application/json',
      Authorization: TOKEN
    }
  });

  return {
    materiales: await res.json()
  };
};
