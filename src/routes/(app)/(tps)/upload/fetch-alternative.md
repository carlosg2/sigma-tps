# Alternativa con Fetch

Si prefieres usar `fetch()` en lugar de `XMLHttpRequest`, aquí tienes una versión alternativa (sin progreso de upload):

```typescript
const uploadFileToAPIWithFetch = async (file: File): Promise<void> => {
  const formData = new FormData();
  formData.append('archivo', file);
  formData.append('path', 'E:\\version\\SEPRONET\\Anexos\\Documentos');

  const response = await fetch('https://api.maserp.mx/api/upload', {
    method: 'POST',
    headers: {
      'accept': '*/*',
      'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6ImFkbWluQHNlcHJvYmFuLmNvbS5teCIsIm5iZiI6MTc1MzczMjcwMywiZXhwIjoxODQzNzMyNzAzLCJpYXQiOjE3NTM3MzI3MDMsImlzcyI6IkFQSSBSRVNUIiwiYXVkIjoiTUFTIEVSUCJ9.OYPiY9HXvSyY4L_Je-Cf0wmbE2oKzC8V5VNUVfI1-u4',
    },
    body: formData,
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json().catch(() => {
    // Si no es JSON válido, asumir éxito
    return {};
  });
};
```

**Nota**: Con `fetch()` no es fácil mostrar el progreso de upload en tiempo real. Para eso es mejor usar `XMLHttpRequest` como en la implementación principal.
