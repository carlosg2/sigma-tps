import { browser } from '$app/environment';

export const load = async ({ params }) => {
  let cotizacionGenerada;

  // Intentar cargar datos reales de la configuración
  if (browser) {
    const datosGuardados = sessionStorage.getItem(`cotizacion-${params.id}`);
    if (datosGuardados) {
      try {
        const datosConfiguracion = JSON.parse(datosGuardados);
        
        // Generar lista de materiales basada en la configuración real
        const listaMateriales = generarListaMateriales(datosConfiguracion);
        
        cotizacionGenerada = {
          solicitudId: params.id,
          clienteInfo: {
            cliente: datosConfiguracion.solicitud.cliente || "C01447",
            nombre: datosConfiguracion.solicitud.cliente_nombre || "Cliente de Ejemplo", 
            telefono: datosConfiguracion.solicitud.cliente_telefono || "+52 844 123 4567",
            email: datosConfiguracion.solicitud.cliente_email || "cliente@email.com"
          },
          vehiculoInfo: {
            marca: datosConfiguracion.solicitud.marca || "Marca",
            modelo: datosConfiguracion.solicitud.modelo || "Modelo", 
            año: datosConfiguracion.solicitud.año || "2024",
            uso: datosConfiguracion.solicitud.uso || "Ejecutivo",
            amenazas: datosConfiguracion.solicitud.amenazas || "Arma Larga",
            cobertura: datosConfiguracion.solicitud.cobertura || "Total"
          },
          configuracion: datosConfiguracion.configuracion,
          precios: {
            subtotal: datosConfiguracion.precios.subtotal,
            iva: datosConfiguracion.precios.iva,
            total: datosConfiguracion.precios.total,
            pesoAproximadoBlindaje: calcularPesoBlindaje(datosConfiguracion.configuracion)
          },
          fechaGeneracion: new Date().toISOString(),
          listaMateriales: listaMateriales
        };
      } catch (error) {
        console.error('Error cargando datos de configuración:', error);
        // Fallback a datos de ejemplo
        cotizacionGenerada = generarDatosEjemplo(params.id);
      }
    } else {
      // No hay datos guardados, usar datos de ejemplo
      cotizacionGenerada = generarDatosEjemplo(params.id);
    }
  } else {
    // En servidor, usar datos de ejemplo
    cotizacionGenerada = generarDatosEjemplo(params.id);
  }

  return {
    cotizacion: cotizacionGenerada
  };
};

function generarListaMateriales(datosConfiguracion: any) {
  const materiales = [];

  // Materiales base del blindaje estructural
  const materialesBase = [
    { categoria: "Blindaje Estructural", descripcion: "Techo", cantidad: 1, unidad: "PZA", precioUnitario: 45000, importe: 45000 },
    { categoria: "Blindaje Estructural", descripcion: "Marco de Parabrisas", cantidad: 1, unidad: "PZA", precioUnitario: 28000, importe: 28000 },
    { categoria: "Blindaje Estructural", descripcion: "Postes", cantidad: 6, unidad: "PZA", precioUnitario: 9667, importe: 58000 },
    { categoria: "Blindaje Estructural", descripcion: "Piso", cantidad: 1, unidad: "PZA", precioUnitario: 65000, importe: 65000 },
    { categoria: "Blindaje Estructural", descripcion: "Costados de Piso", cantidad: 2, unidad: "PZA", precioUnitario: 12500, importe: 25000 },
    { categoria: "Blindaje Estructural", descripcion: "Puertas Delanteras", cantidad: 2, unidad: "PZA", precioUnitario: 26000, importe: 52000 },
    { categoria: "Blindaje Estructural", descripcion: "Puertas Traseras", cantidad: 2, unidad: "PZA", precioUnitario: 24000, importe: 48000 },
    { categoria: "Blindaje Estructural", descripcion: "Pared de Fuego", cantidad: 1, unidad: "PZA", precioUnitario: 22000, importe: 22000 }
  ];

  materiales.push(...materialesBase);

  const config = datosConfiguracion.configuracion;

  // Roll Bar en techo (opcional)
  if (config.rollBarTecho) {
    materiales.push({
      categoria: "Blindaje Estructural", 
      descripcion: "Roll Bar en Techo", 
      cantidad: 1, 
      unidad: "PZA", 
      precioUnitario: 35000, 
      importe: 35000
    });
  }

  // Protección de tanque (opcional)
  if (config.proteccionTanque) {
    materiales.push({
      categoria: "Blindaje Estructural", 
      descripcion: "Tanque de Combustible", 
      cantidad: 1, 
      unidad: "PZA", 
      precioUnitario: 35000, 
      importe: 35000
    });
  }

  // Cristales según configuración
  const espesorCristales = config.cristalesEspeciales;
  const precioParabrisas = espesorCristales === "32mm" ? 35000 : espesorCristales === "40mm" ? 45000 : 55000;
  const precioDelanteros = espesorCristales === "32mm" ? 18000 : espesorCristales === "40mm" ? 23000 : 28000;
  const precioTraseros = espesorCristales === "32mm" ? 12000 : espesorCristales === "40mm" ? 16000 : 20000;

  materiales.push(
    { categoria: "Blindaje Transparente", descripcion: `Parabrisas ${espesorCristales.toUpperCase()} Tono Claro`, cantidad: 1, unidad: "PZA", precioUnitario: precioParabrisas, importe: precioParabrisas },
    { categoria: "Blindaje Transparente", descripcion: `Cristales Puertas Delanteras ${espesorCristales.toUpperCase()}`, cantidad: 2, unidad: "PZA", precioUnitario: precioDelanteros, importe: precioDelanteros * 2 },
    { categoria: "Blindaje Transparente", descripcion: `Cristales Puertas Traseras ${espesorCristales.toUpperCase()} Tono 14%`, cantidad: 2, unidad: "PZA", precioUnitario: precioTraseros, importe: precioTraseros * 2 }
  );

  // Material según tipo de blindaje
  if (config.tipoBlindaje === "ceramico") {
    materiales.push({
      categoria: "Material Especial", 
      descripcion: "Blindaje Cerámico Compuesto", 
      cantidad: 1, 
      unidad: "LOTE", 
      precioUnitario: 45000, 
      importe: 45000
    });
  } else if (config.tipoBlindaje === "acero") {
    materiales.push({
      categoria: "Material Especial", 
      descripcion: "Blindaje Acero Balístico", 
      cantidad: 1, 
      unidad: "LOTE", 
      precioUnitario: 35000, 
      importe: 35000
    });
  }

  // Suspensión según configuración
  if (config.suspensionReforzada === "neumatica") {
    materiales.push({
      categoria: "Suspensión", 
      descripcion: "Sistema Suspensión Neumática", 
      cantidad: 1, 
      unidad: "KIT", 
      precioUnitario: 85000, 
      importe: 85000
    });
  } else if (config.suspensionReforzada === "hidraulica") {
    materiales.push({
      categoria: "Suspensión", 
      descripcion: "Sistema Suspensión Hidráulica", 
      cantidad: 1, 
      unidad: "KIT", 
      precioUnitario: 95000, 
      importe: 95000
    });
  } else {
    materiales.push({
      categoria: "Suspensión", 
      descripcion: "Suspensión Reforzada Mecánica", 
      cantidad: 1, 
      unidad: "KIT", 
      precioUnitario: 65000, 
      importe: 65000
    });
  }

  // Opciones adicionales según configuración
  if (config.proteccionBateria) {
    materiales.push({
      categoria: "Equipo Adicional", 
      descripcion: "Protección de Batería", 
      cantidad: 1, 
      unidad: "PZA", 
      precioUnitario: 8500, 
      importe: 8500
    });
  }

  if (config.runFlatTires) {
    materiales.push({
      categoria: "Equipo Adicional", 
      descripcion: "4 Run Flat Tires", 
      cantidad: 4, 
      unidad: "PZA", 
      precioUnitario: 11250, 
      importe: 45000
    });
  }

  if (config.cortinaCubreEquipaje) {
    materiales.push({
      categoria: "Equipo Adicional", 
      descripcion: "Cortina Cubre Equipaje Operable", 
      cantidad: 1, 
      unidad: "PZA", 
      precioUnitario: 12000, 
      importe: 12000
    });
  }

  if (config.sistemaAudio) {
    materiales.push({
      categoria: "Equipo Adicional", 
      descripcion: "Sistema Audio Premium", 
      cantidad: 1, 
      unidad: "KIT", 
      precioUnitario: 25000, 
      importe: 25000
    });
  }

  if (config.proteccionComputadora) {
    materiales.push({
      categoria: "Equipo Adicional", 
      descripcion: "Protección Computadora Maestra", 
      cantidad: 1, 
      unidad: "PZA", 
      precioUnitario: 15000, 
      importe: 15000
    });
  }

  if (config.defensaReforzada) {
    materiales.push({
      categoria: "Equipo Adicional", 
      descripcion: "Defensa Delantera Reforzada", 
      cantidad: 1, 
      unidad: "PZA", 
      precioUnitario: 18000, 
      importe: 18000
    });
  }

  return materiales;
}

function calcularPesoBlindaje(configuracion: any) {
  let pesoBase = 650; // Peso base del blindaje
  
  // Ajustes según tipo de blindaje
  if (configuracion.tipoBlindaje === "ceramico") pesoBase += 100;
  if (configuracion.tipoBlindaje === "compuesto") pesoBase += 50;
  
  // Ajustes según cristales
  if (configuracion.cristalesEspeciales === "40mm") pesoBase += 75;
  if (configuracion.cristalesEspeciales === "50mm") pesoBase += 150;
  
  // Roll bar añade peso
  if (configuracion.rollBarTecho) pesoBase += 45;
  
  return pesoBase;
}

function generarDatosEjemplo(id: string) {
  return {
    solicitudId: id,
    clienteInfo: {
      cliente: "C01446",
      nombre: "Daniel Roldán Soria", 
      telefono: "+52 844 123 4567",
      email: "daniel.roldan@email.com"
    },
    vehiculoInfo: {
      marca: "Jeep",
      modelo: "Grand Cherokee", 
      año: "2022",
      uso: "Ejecutivo",
      amenazas: "Arma Larga",
      cobertura: "Total"
    },
    configuracion: {
      nivelProteccion: "IV-PLUS",
      tipoBlindaje: "ceramico",
      suspensionReforzada: "neumatica",
      cristalesEspeciales: "32mm",
      rollBarTecho: true,
      proteccionBateria: true,
      runFlatTires: true,
      proteccionTanque: true,
      cortinaCubreEquipaje: true,
      sistemaAudio: false,
      proteccionComputadora: true,
      defensaReforzada: true
    },
    precios: {
      subtotal: 758000,
      iva: 121280,
      total: 879280,
      pesoAproximadoBlindaje: 750
    },
    fechaGeneracion: new Date().toISOString(),
    listaMateriales: [
      // Blindaje estructural y complementario
      { categoria: "Blindaje Estructural", descripcion: "Techo", cantidad: 1, unidad: "PZA", precioUnitario: 45000, importe: 45000 },
      { categoria: "Blindaje Estructural", descripcion: "Roll Bar en Techo", cantidad: 1, unidad: "PZA", precioUnitario: 35000, importe: 35000 },
      { categoria: "Blindaje Estructural", descripcion: "Marco de Parabrisas", cantidad: 1, unidad: "PZA", precioUnitario: 28000, importe: 28000 },
      { categoria: "Blindaje Estructural", descripcion: "Postes", cantidad: 6, unidad: "PZA", precioUnitario: 9667, importe: 58000 },
      { categoria: "Blindaje Estructural", descripcion: "Piso", cantidad: 1, unidad: "PZA", precioUnitario: 65000, importe: 65000 },
      { categoria: "Blindaje Estructural", descripcion: "Costados de Piso", cantidad: 2, unidad: "PZA", precioUnitario: 12500, importe: 25000 },
      { categoria: "Blindaje Estructural", descripcion: "Puertas Delanteras", cantidad: 2, unidad: "PZA", precioUnitario: 26000, importe: 52000 },
      { categoria: "Blindaje Estructural", descripcion: "Puertas Traseras", cantidad: 2, unidad: "PZA", precioUnitario: 24000, importe: 48000 },
      { categoria: "Blindaje Estructural", descripcion: "Pared de Fuego", cantidad: 1, unidad: "PZA", precioUnitario: 22000, importe: 22000 },
      { categoria: "Blindaje Estructural", descripcion: "Tanque de Combustible", cantidad: 1, unidad: "PZA", precioUnitario: 35000, importe: 35000 },
      
      // Blindaje transparente
      { categoria: "Blindaje Transparente", descripcion: "Parabrisas 32MM Tono Claro", cantidad: 1, unidad: "PZA", precioUnitario: 35000, importe: 35000 },
      { categoria: "Blindaje Transparente", descripcion: "Cristales Puertas Delanteras 32MM", cantidad: 2, unidad: "PZA", precioUnitario: 18000, importe: 36000 },
      { categoria: "Blindaje Transparente", descripcion: "Cristales Puertas Traseras 32MM Tono 14%", cantidad: 2, unidad: "PZA", precioUnitario: 12000, importe: 24000 },
      
      // Material cerámico adicional
      { categoria: "Material Especial", descripcion: "Blindaje Cerámico Compuesto", cantidad: 1, unidad: "LOTE", precioUnitario: 45000, importe: 45000 },
      
      // Suspensión neumática
      { categoria: "Suspensión", descripcion: "Sistema Suspensión Neumática", cantidad: 1, unidad: "KIT", precioUnitario: 85000, importe: 85000 },
      
      // Opciones adicionales seleccionadas
      { categoria: "Equipo Adicional", descripcion: "Protección de Batería", cantidad: 1, unidad: "PZA", precioUnitario: 8500, importe: 8500 },
      { categoria: "Equipo Adicional", descripcion: "4 Run Flat Tires", cantidad: 4, unidad: "PZA", precioUnitario: 11250, importe: 45000 },
      { categoria: "Equipo Adicional", descripcion: "Cortina Cubre Equipaje Operable", cantidad: 1, unidad: "PZA", precioUnitario: 12000, importe: 12000 },
      { categoria: "Equipo Adicional", descripcion: "Protección Computadora Maestra", cantidad: 1, unidad: "PZA", precioUnitario: 15000, importe: 15000 },
      { categoria: "Equipo Adicional", descripcion: "Defensa Delantera Reforzada", cantidad: 1, unidad: "PZA", precioUnitario: 18000, importe: 18000 }
    ]
  };
}
