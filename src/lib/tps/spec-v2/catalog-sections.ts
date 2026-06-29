// AUTO-GENERADO por scripts/gen-spec-v2-catalog.ts — no editar a mano.
// Catalogo jerarquico de especificaciones: Seccion -> SubSeccion -> Componente.

export interface SpecComponentDef {
	/** numero de componente (clave dentro del catalogo) */
	componente: string;
	descripcion: string;
}

export interface SpecSubSectionDef {
	subSeccion: string;
	descripcion: string;
	orden: number;
	componentes: SpecComponentDef[];
}

export interface SpecSectionDef {
	seccion: string;
	descripcion: string;
	orden: number;
	subSecciones: SpecSubSectionDef[];
}

export const SPEC_SECTIONS: SpecSectionDef[] = [
	{
		"seccion": "01",
		"descripcion": "INFORMACIÓN GENERAL",
		"orden": 1,
		"subSecciones": [
			{
				"subSeccion": "01",
				"descripcion": "INFORMACIÓN GENERAL",
				"orden": 1,
				"componentes": [
					{
						"componente": "2",
						"descripcion": "SAND CAT CORTO"
					},
					{
						"componente": "3",
						"descripcion": "QRV 5 PASAJEROS"
					},
					{
						"componente": "4",
						"descripcion": "SAND CAT LARGO"
					},
					{
						"componente": "5",
						"descripcion": "ALACRAN"
					},
					{
						"componente": "6",
						"descripcion": "COBRA"
					},
					{
						"componente": "7",
						"descripcion": "PUMA"
					},
					{
						"componente": "8",
						"descripcion": "PITBULL"
					},
					{
						"componente": "9",
						"descripcion": "RHINO"
					},
					{
						"componente": "10",
						"descripcion": "Altura de Eje Delantero Izquierdo"
					},
					{
						"componente": "20",
						"descripcion": "Altura de Eje Delantero Derecho"
					},
					{
						"componente": "30",
						"descripcion": "Altura de Eje Trasero Izquierdo"
					},
					{
						"componente": "40",
						"descripcion": "Altura de Eje Trasero Derecho"
					},
					{
						"componente": "50",
						"descripcion": "Peso Original del Vehiculo"
					},
					{
						"componente": "60",
						"descripcion": "Peso Original del Eje Trasero"
					},
					{
						"componente": "70",
						"descripcion": "Peso de Cristales"
					},
					{
						"componente": "71",
						"descripcion": "Capacidad de carga"
					},
					{
						"componente": "80",
						"descripcion": "Peso de Blindaje y Accesorios"
					},
					{
						"componente": "90",
						"descripcion": "Peso Total del Vehiculo Blindado"
					},
					{
						"componente": "100",
						"descripcion": "Peso del Eje Trasero Blindado"
					}
				]
			}
		]
	},
	{
		"seccion": "02",
		"descripcion": "BLINDAJE OPACO",
		"orden": 2,
		"subSecciones": [
			{
				"subSeccion": "02",
				"descripcion": "INFORMACION DE BLINDAJE",
				"orden": 2,
				"componentes": [
					{
						"componente": "110",
						"descripcion": "Tipo de blindaje"
					},
					{
						"componente": "120",
						"descripcion": "Tipo de traslape"
					},
					{
						"componente": "121",
						"descripcion": "Canal de quemacocos"
					},
					{
						"componente": "130",
						"descripcion": "Disposicion de quemacocos"
					},
					{
						"componente": "140",
						"descripcion": "Canal de quemacocos"
					}
				]
			},
			{
				"subSeccion": "03",
				"descripcion": "TECHO",
				"orden": 3,
				"componentes": [
					{
						"componente": "150",
						"descripcion": "Blindaje en techo"
					},
					{
						"componente": "151",
						"descripcion": "Escotilla giratoria en techo / fija"
					},
					{
						"componente": "152",
						"descripcion": "Escotilla fija en techo"
					},
					{
						"componente": "153",
						"descripcion": "Tapa de escotilla"
					},
					{
						"componente": "154",
						"descripcion": "Laterales de tapa de escotilla"
					},
					{
						"componente": "155",
						"descripcion": "Techo cabina principal"
					},
					{
						"componente": "156",
						"descripcion": "COMPLEMENTO DE ESCOTILLA"
					},
					{
						"componente": "157",
						"descripcion": "Escotilla giratoria en techo"
					},
					{
						"componente": "160",
						"descripcion": "Roll bar en techo"
					},
					{
						"componente": "170",
						"descripcion": "Corona"
					},
					{
						"componente": "171",
						"descripcion": "Traslape en techo"
					},
					{
						"componente": "172",
						"descripcion": "Corona de techo"
					},
					{
						"componente": "173",
						"descripcion": "Traslape en corona"
					}
				]
			},
			{
				"subSeccion": "04",
				"descripcion": "TOLVA DE PARABRISAS Y PARED DE FUEGO",
				"orden": 4,
				"componentes": [
					{
						"componente": "180",
						"descripcion": "Placa debajo de parabrisas"
					},
					{
						"componente": "190",
						"descripcion": "Proteccion de resaque de camara de parabrisas"
					},
					{
						"componente": "191",
						"descripcion": "Proteccion de camara de parabrisas"
					},
					{
						"componente": "198",
						"descripcion": "Marco de parabrisas"
					},
					{
						"componente": "199",
						"descripcion": "Cajon desmontable marco de parabrisas"
					},
					{
						"componente": "200",
						"descripcion": "1er marco de parabrisas"
					},
					{
						"componente": "210",
						"descripcion": "2do marco de parabrisas"
					},
					{
						"componente": "211",
						"descripcion": "2do marco de parabrisas lateral desmontable"
					},
					{
						"componente": "219",
						"descripcion": "Tapa de tronera"
					},
					{
						"componente": "220",
						"descripcion": "Toldo de parabrisas"
					},
					{
						"componente": "221",
						"descripcion": "Toldo en area de carga"
					},
					{
						"componente": "230",
						"descripcion": "Tolva inferior de parabrisas"
					},
					{
						"componente": "231",
						"descripcion": "Tolva inferior de parabrisas exterior"
					},
					{
						"componente": "232",
						"descripcion": "Marco de parabrisas en ceja superior"
					},
					{
						"componente": "233",
						"descripcion": "Base central marco ws (tolva)"
					},
					{
						"componente": "234",
						"descripcion": "Tolva lado piloto"
					},
					{
						"componente": "235",
						"descripcion": "Complemento de tolva lado piloto"
					},
					{
						"componente": "236",
						"descripcion": "Tolva lado copiloto"
					},
					{
						"componente": "237",
						"descripcion": "Complemento de tolva lado copiloto"
					},
					{
						"componente": "238",
						"descripcion": "Trampa de clima"
					},
					{
						"componente": "239",
						"descripcion": "Pared de fuego por área de motor"
					},
					{
						"componente": "240",
						"descripcion": "Pared de fuego"
					},
					{
						"componente": "241",
						"descripcion": "Faldones laterales"
					},
					{
						"componente": "242",
						"descripcion": "Traslapes de union de placas"
					},
					{
						"componente": "243",
						"descripcion": "Union pared de fuego"
					},
					{
						"componente": "244",
						"descripcion": "Proteccion de luces principales en frente"
					},
					{
						"componente": "245",
						"descripcion": "Union pared de fuego pared laterl"
					},
					{
						"componente": "246",
						"descripcion": "Refuerzo de piecera"
					},
					{
						"componente": "247",
						"descripcion": "Complemento de faldon"
					},
					{
						"componente": "248",
						"descripcion": "Pared de fuego central"
					},
					{
						"componente": "249",
						"descripcion": "Pared de fuego piloto"
					},
					{
						"componente": "250",
						"descripcion": "Entrada de Aire a Sistema de A/C"
					},
					{
						"componente": "251",
						"descripcion": "Entrada de Aire a Sistema de A/C EXTERIOR"
					},
					{
						"componente": "252",
						"descripcion": "Pared de fuego copiloto"
					},
					{
						"componente": "253",
						"descripcion": "Complemento de piso de pared de fuego"
					},
					{
						"componente": "254",
						"descripcion": "Frente"
					},
					{
						"componente": "255",
						"descripcion": "Parrilla"
					}
				]
			},
			{
				"subSeccion": "05",
				"descripcion": "POSTES, BISELES Y PISO",
				"orden": 5,
				"componentes": [
					{
						"componente": "280",
						"descripcion": "Poste A inferior"
					},
					{
						"componente": "281",
						"descripcion": "Poste A inferior exterior"
					},
					{
						"componente": "282",
						"descripcion": "Poste A inferior pegado y atornillado"
					},
					{
						"componente": "283",
						"descripcion": "Poste A inferior copiloto"
					},
					{
						"componente": "285",
						"descripcion": "Poste A inferior piloto"
					},
					{
						"componente": "286",
						"descripcion": "Complemento de poste A"
					},
					{
						"componente": "290",
						"descripcion": "Poste A superior"
					},
					{
						"componente": "291",
						"descripcion": "Poste A superior pegado y atornillado"
					},
					{
						"componente": "292",
						"descripcion": "Poste A superior con traslape"
					},
					{
						"componente": "293",
						"descripcion": "Poste A inferior con traslape"
					},
					{
						"componente": "294",
						"descripcion": "Poste A tapa"
					},
					{
						"componente": "295",
						"descripcion": "Poste A"
					},
					{
						"componente": "300",
						"descripcion": "Poste B, C y D"
					},
					{
						"componente": "301",
						"descripcion": "Poste B y C"
					},
					{
						"componente": "302",
						"descripcion": "Poste B, C y D en base de postes"
					},
					{
						"componente": "303",
						"descripcion": "Costado"
					},
					{
						"componente": "304",
						"descripcion": "Traslape en costado"
					},
					{
						"componente": "305",
						"descripcion": "Poste B"
					},
					{
						"componente": "306",
						"descripcion": "Poste C"
					},
					{
						"componente": "307",
						"descripcion": "Poste B, C y D visibles en LINE-X desmontables"
					},
					{
						"componente": "310",
						"descripcion": "Laterales interiores en postes"
					},
					{
						"componente": "320",
						"descripcion": "Correderas de cinturon en poste B"
					},
					{
						"componente": "321",
						"descripcion": "Correderas de cinturon en poste B exterior"
					},
					{
						"componente": "330",
						"descripcion": "Ceja de empaque seccion sup (zona caliente)"
					},
					{
						"componente": "340",
						"descripcion": "Caja de cinturones y trampas"
					},
					{
						"componente": "341",
						"descripcion": "Ceja de empaque seccion sup (zona caliente)"
					},
					{
						"componente": "342",
						"descripcion": "Caja de Cinturones"
					},
					{
						"componente": "343",
						"descripcion": "Trampas"
					},
					{
						"componente": "350",
						"descripcion": "Biseles de cristales en postes"
					},
					{
						"componente": "351",
						"descripcion": "Biseles de cristales en marco de puertas"
					},
					{
						"componente": "352",
						"descripcion": "Biseles de cristales"
					},
					{
						"componente": "360",
						"descripcion": "Protección de 45° entre postes y puertas"
					},
					{
						"componente": "361",
						"descripcion": "Proteccion de 45° en postes"
					},
					{
						"componente": "362",
						"descripcion": "Traslape en marco de postes"
					},
					{
						"componente": "363",
						"descripcion": "Traslapes en marcos"
					},
					{
						"componente": "364",
						"descripcion": "Traslapes"
					},
					{
						"componente": "365",
						"descripcion": "Traslape 360° en marco de postes"
					},
					{
						"componente": "369",
						"descripcion": "Cejas y costillas de piso"
					},
					{
						"componente": "370",
						"descripcion": "Proteccion en piso"
					},
					{
						"componente": "371",
						"descripcion": "Lados de piso"
					},
					{
						"componente": "372",
						"descripcion": "Piso parte inferior 2da fila"
					},
					{
						"componente": "373",
						"descripcion": "Piso cabina principal"
					},
					{
						"componente": "374",
						"descripcion": "Protección en piso bases de postes"
					},
					{
						"componente": "375",
						"descripcion": "Tapas de piso"
					},
					{
						"componente": "376",
						"descripcion": "Piso"
					},
					{
						"componente": "377",
						"descripcion": "Complemento de piso central"
					},
					{
						"componente": "378",
						"descripcion": "Bases de Postes B"
					},
					{
						"componente": "379",
						"descripcion": "Bases de Postes A y B"
					},
					{
						"componente": "380",
						"descripcion": "Costados de piso"
					},
					{
						"componente": "381",
						"descripcion": "Costados de piso en base de postes"
					},
					{
						"componente": "382",
						"descripcion": "Proteccion en tolvas parte inferior"
					},
					{
						"componente": "383",
						"descripcion": "Protección en escalón de piso"
					}
				]
			},
			{
				"subSeccion": "06",
				"descripcion": "PUERTAS",
				"orden": 6,
				"componentes": [
					{
						"componente": "353",
						"descripcion": "Contrabisagras"
					},
					{
						"componente": "388",
						"descripcion": "Puertas exteriores"
					},
					{
						"componente": "389",
						"descripcion": "Contornos de puertas"
					},
					{
						"componente": "390",
						"descripcion": "Puertas delanteras"
					},
					{
						"componente": "391",
						"descripcion": "Blindaje en parte superior de ventanas delanteras"
					},
					{
						"componente": "392",
						"descripcion": "Troneras laterales"
					},
					{
						"componente": "394",
						"descripcion": "Presurizador en 4 puertas"
					},
					{
						"componente": "395",
						"descripcion": "Puertas Laterales"
					},
					{
						"componente": "400",
						"descripcion": "Puertas traseras"
					},
					{
						"componente": "401",
						"descripcion": "Puertas delanteras visible en láminas"
					},
					{
						"componente": "402",
						"descripcion": "Puertas traseras visible en láminas"
					},
					{
						"componente": "403",
						"descripcion": "Blindaje en parte superior de ventanas traseras"
					},
					{
						"componente": "410",
						"descripcion": "Perímetro de puertas"
					},
					{
						"componente": "411",
						"descripcion": "Perimetro puerta delantera lado bisagras"
					},
					{
						"componente": "412",
						"descripcion": "Perimetro puerta trasera seccion chapa"
					},
					{
						"componente": "413",
						"descripcion": "Perimetro puerta trasera piso"
					},
					{
						"componente": "414",
						"descripcion": "Perimetro solo frontal de puerta delantera"
					},
					{
						"componente": "420",
						"descripcion": "Proteccion de Jaladeras"
					},
					{
						"componente": "421",
						"descripcion": "Trampa de arneses"
					},
					{
						"componente": "430",
						"descripcion": "Trampa de Arneses"
					},
					{
						"componente": "440",
						"descripcion": "Traslape de cristal en area de espejo"
					},
					{
						"componente": "441",
						"descripcion": "Aletas en puertas traseras"
					},
					{
						"componente": "442",
						"descripcion": "Traslape de vidrio en puerta trasera"
					},
					{
						"componente": "450",
						"descripcion": "Aletas de puertas delanteras"
					},
					{
						"componente": "451",
						"descripcion": "Refuerzo lateral en puertas delanteras"
					},
					{
						"componente": "460",
						"descripcion": "Traslapes corridos"
					},
					{
						"componente": "461",
						"descripcion": "Traslape corrido en parte de panel"
					},
					{
						"componente": "462",
						"descripcion": "Traslape corrido en postes"
					},
					{
						"componente": "470",
						"descripcion": "Traslapes en marcos"
					},
					{
						"componente": "471",
						"descripcion": "Traslape en marco parte superior"
					},
					{
						"componente": "472",
						"descripcion": "Traslape en marco de postes"
					},
					{
						"componente": "473",
						"descripcion": "Complementos en marcos de puertas"
					},
					{
						"componente": "480",
						"descripcion": "Tirantes en puertas delanteras"
					},
					{
						"componente": "490",
						"descripcion": "Tirantes en puertas traseras"
					},
					{
						"componente": "491",
						"descripcion": "Presurizador en puertas"
					},
					{
						"componente": "492",
						"descripcion": "Tirantes retractiles en puertas delanteras"
					},
					{
						"componente": "496",
						"descripcion": "Contra marco de cristales de parabrisas"
					},
					{
						"componente": "497",
						"descripcion": "Protección de chapas de puertas"
					},
					{
						"componente": "498",
						"descripcion": "Marcos cajones de cristales de puertas"
					},
					{
						"componente": "499",
						"descripcion": "Contra marcos cristales de puertas"
					},
					{
						"componente": "500",
						"descripcion": "Contrachapas"
					},
					{
						"componente": "504",
						"descripcion": "Bisagras"
					},
					{
						"componente": "505",
						"descripcion": "Bisagras maquinadas con freno"
					},
					{
						"componente": "506",
						"descripcion": "Bisagras reforzadas placa fijadora"
					},
					{
						"componente": "507",
						"descripcion": "Bisagras reforzadas y frenos"
					},
					{
						"componente": "508",
						"descripcion": "bisagras maquinadas con Diseño TPS"
					},
					{
						"componente": "509",
						"descripcion": "Bisagras superiores placas fijadoras"
					},
					{
						"componente": "510",
						"descripcion": "Bisagras maquinadas reforzadas"
					},
					{
						"componente": "511",
						"descripcion": "Bisagras reforzadas"
					},
					{
						"componente": "512",
						"descripcion": "Bisagras diseño TPS"
					},
					{
						"componente": "513",
						"descripcion": "Bisagras originales"
					},
					{
						"componente": "514",
						"descripcion": "Bisagras remanufacturadas"
					},
					{
						"componente": "515",
						"descripcion": "Placas fijadoras puertas delanteras"
					},
					{
						"componente": "516",
						"descripcion": "Placas fijadoras puertas traseras"
					},
					{
						"componente": "517",
						"descripcion": "Bisagras originales y placas fijadoras"
					},
					{
						"componente": "518",
						"descripcion": "Bisagras reforzadas diseño TPS"
					},
					{
						"componente": "519",
						"descripcion": "Bisagras reforzadas"
					},
					{
						"componente": "520",
						"descripcion": "Contrabisagras"
					},
					{
						"componente": "521",
						"descripcion": "Protección de 45° en Puertas"
					},
					{
						"componente": "522",
						"descripcion": "Bisagras superiores"
					}
				]
			},
			{
				"subSeccion": "07",
				"descripcion": "DIVISORIO / MAMPARA/RESPALDO",
				"orden": 7,
				"componentes": [
					{
						"componente": "530",
						"descripcion": "Conchas exteriores"
					},
					{
						"componente": "531",
						"descripcion": "Conchas interiores visibles en LINE-X desmontables"
					},
					{
						"componente": "532",
						"descripcion": "Marco de division"
					},
					{
						"componente": "540",
						"descripcion": "Conchas interiores"
					},
					{
						"componente": "541",
						"descripcion": "Conchas delanteras"
					},
					{
						"componente": "542",
						"descripcion": "Conchas traseras"
					},
					{
						"componente": "543",
						"descripcion": "Pared trasera"
					},
					{
						"componente": "544",
						"descripcion": "Pared habitaculo"
					},
					{
						"componente": "549",
						"descripcion": "Division 1ra fila"
					},
					{
						"componente": "550",
						"descripcion": "Division 2da fila"
					},
					{
						"componente": "551",
						"descripcion": "Division 3ra fila"
					},
					{
						"componente": "552",
						"descripcion": "Marco de division"
					},
					{
						"componente": "553",
						"descripcion": "Marco soporte de division"
					},
					{
						"componente": "554",
						"descripcion": "2do marco cuartos traseros"
					},
					{
						"componente": "555",
						"descripcion": "Cuartos traseros"
					},
					{
						"componente": "556",
						"descripcion": "Division 4ta fila"
					},
					{
						"componente": "560",
						"descripcion": "Mampara abatible"
					},
					{
						"componente": "561",
						"descripcion": "Marco de mampara abatible"
					},
					{
						"componente": "562",
						"descripcion": "Marco soporte de mampara abatible"
					},
					{
						"componente": "563",
						"descripcion": "Complemento de mampara abatible"
					},
					{
						"componente": "564",
						"descripcion": "Mampara desmontable en LINE-X"
					},
					{
						"componente": "565",
						"descripcion": "Traslape de mampara"
					},
					{
						"componente": "570",
						"descripcion": "Media mampara"
					},
					{
						"componente": "571",
						"descripcion": "Marco de media mampara"
					},
					{
						"componente": "572",
						"descripcion": "Marco soporte de media mampara"
					},
					{
						"componente": "580",
						"descripcion": "Respaldo"
					},
					{
						"componente": "581",
						"descripcion": "Completo"
					},
					{
						"componente": "582",
						"descripcion": "2do Marco soporte de medallon"
					},
					{
						"componente": "583",
						"descripcion": "1er Marco de medallon"
					},
					{
						"componente": "584",
						"descripcion": "2do Marco soporte de medallon lateral desmontable"
					},
					{
						"componente": "585",
						"descripcion": "Blindaje en área superior de respaldo"
					}
				]
			},
			{
				"subSeccion": "08",
				"descripcion": "PROTECCION DE MOTOR / PERIFERIA",
				"orden": 8,
				"componentes": [
					{
						"componente": "590",
						"descripcion": "Defensas delanteras"
					},
					{
						"componente": "600",
						"descripcion": "Defensas traseras"
					},
					{
						"componente": "601",
						"descripcion": "Refuerzo de motor"
					},
					{
						"componente": "610",
						"descripcion": "Polveras delanteras"
					},
					{
						"componente": "611",
						"descripcion": "Aletas en polveras delanteras"
					},
					{
						"componente": "612",
						"descripcion": "Protección de polveras delanteras"
					},
					{
						"componente": "620",
						"descripcion": "Proteccion de lineas de clima"
					},
					{
						"componente": "630",
						"descripcion": "Proteccion de booster"
					},
					{
						"componente": "631",
						"descripcion": "Proteccion de booster arnes principal"
					},
					{
						"componente": "632",
						"descripcion": "Proteccion arnes principal"
					},
					{
						"componente": "640",
						"descripcion": "Proteccion de computadora maestra"
					},
					{
						"componente": "641",
						"descripcion": "Protección de batería 12 v"
					},
					{
						"componente": "642",
						"descripcion": "Protección de batería de 48v"
					},
					{
						"componente": "650",
						"descripcion": "Proteccion de caja de fusibles"
					},
					{
						"componente": "651",
						"descripcion": "Proteccion de lineas de clima"
					},
					{
						"componente": "652",
						"descripcion": "Troneras"
					},
					{
						"componente": "653",
						"descripcion": "Marco de Mirilla"
					},
					{
						"componente": "654",
						"descripcion": "Aletas Exteriores en poste A inferior"
					},
					{
						"componente": "656",
						"descripcion": "Protección Batea"
					},
					{
						"componente": "657",
						"descripcion": "Marco de Mirilla"
					},
					{
						"componente": "658",
						"descripcion": "Protección de Roll Bar"
					},
					{
						"componente": "659",
						"descripcion": "Soporte de Buje"
					},
					{
						"componente": "660",
						"descripcion": "Protección de batería"
					},
					{
						"componente": "661",
						"descripcion": "Protección de cofre"
					},
					{
						"componente": "662",
						"descripcion": "Protección de cárter"
					},
					{
						"componente": "663",
						"descripcion": "Riñonera"
					},
					{
						"componente": "664",
						"descripcion": "Piso Escotilla"
					},
					{
						"componente": "665",
						"descripcion": "Cartabon Riñonera"
					},
					{
						"componente": "666",
						"descripcion": "Base Balero"
					},
					{
						"componente": "667",
						"descripcion": "Base Escotilla"
					},
					{
						"componente": "668",
						"descripcion": "Protección Perímetros Escotilla"
					},
					{
						"componente": "669",
						"descripcion": "Soporte Escotilla"
					},
					{
						"componente": "670",
						"descripcion": "Proteccion de tanque de combustible"
					},
					{
						"componente": "671",
						"descripcion": "Tapa de toma de combustible"
					},
					{
						"componente": "672",
						"descripcion": "Escalon"
					},
					{
						"componente": "673",
						"descripcion": "Estribos"
					},
					{
						"componente": "674",
						"descripcion": "Soporte Candado de Balero"
					},
					{
						"componente": "675",
						"descripcion": "Aro Perforado"
					},
					{
						"componente": "676",
						"descripcion": "Soporte Porta Armas"
					},
					{
						"componente": "677",
						"descripcion": "Protección Lateral Batea"
					},
					{
						"componente": "678",
						"descripcion": "Soporte Roll Bar"
					},
					{
						"componente": "680",
						"descripcion": "Proteccion de radiador"
					},
					{
						"componente": "681",
						"descripcion": "Cofre / tapa de bahia de motor"
					},
					{
						"componente": "682",
						"descripcion": "Proteccion de entrada de clima"
					},
					{
						"componente": "683",
						"descripcion": "Proteccion de faros laterales"
					},
					{
						"componente": "684",
						"descripcion": "Proteccion de antena"
					},
					{
						"componente": "685",
						"descripcion": "Proteccion de filtro de aire"
					},
					{
						"componente": "686",
						"descripcion": "Proteccion de clima"
					},
					{
						"componente": "687",
						"descripcion": "Proteccion de liquido de booster"
					},
					{
						"componente": "688",
						"descripcion": "Proteccion de def"
					},
					{
						"componente": "689",
						"descripcion": "Complemento de polvera"
					},
					{
						"componente": "690",
						"descripcion": "Trampa en mofle"
					},
					{
						"componente": "691",
						"descripcion": "Escudo anti - explosivos"
					},
					{
						"componente": "692",
						"descripcion": "Cantonera"
					},
					{
						"componente": "693",
						"descripcion": "Base de estribo"
					},
					{
						"componente": "694",
						"descripcion": "Tapa de winch"
					},
					{
						"componente": "695",
						"descripcion": "Cofre"
					},
					{
						"componente": "696",
						"descripcion": "Topes de cofre"
					},
					{
						"componente": "697",
						"descripcion": "Toma de combustible"
					},
					{
						"componente": "698",
						"descripcion": "Lodera"
					},
					{
						"componente": "699",
						"descripcion": "Traslape de lodera"
					},
					{
						"componente": "978",
						"descripcion": "Desagüe de mofle"
					}
				]
			},
			{
				"subSeccion": "09",
				"descripcion": "5TA PUERTA",
				"orden": 9,
				"componentes": [
					{
						"componente": "700",
						"descripcion": "Blindaje interior de 5ta pta"
					},
					{
						"componente": "710",
						"descripcion": "Area de cargo"
					},
					{
						"componente": "711",
						"descripcion": "Proteccion de motor de limpiaparabrisas"
					},
					{
						"componente": "713",
						"descripcion": "Base de presurizador"
					},
					{
						"componente": "720",
						"descripcion": "Traslape de 5ta pta"
					},
					{
						"componente": "721",
						"descripcion": "Marco inserto de 5ta pta"
					},
					{
						"componente": "722",
						"descripcion": "Proteccion motir de limpiaparabrisas 5ta pta"
					},
					{
						"componente": "723",
						"descripcion": "Ceja de empaque de 5ta pta"
					},
					{
						"componente": "730",
						"descripcion": "Biseles de 5ta pta"
					},
					{
						"componente": "740",
						"descripcion": "Marco inserto de 5ta pta"
					},
					{
						"componente": "750",
						"descripcion": "Proteccion motor limpia parabrisas de 5ta pta"
					},
					{
						"componente": "760",
						"descripcion": "Bisagras reforzadas de 5ta puerta"
					},
					{
						"componente": "770",
						"descripcion": "Base de presurizador reforzadas"
					}
				]
			},
			{
				"subSeccion": "13",
				"descripcion": "TECHO EN AREAS A MODIFICAR",
				"orden": 13,
				"componentes": [
					{
						"componente": "971",
						"descripcion": "BLINDAJE EN TECHO"
					}
				]
			},
			{
				"subSeccion": "14",
				"descripcion": "TOLVA DE PARABRISAS Y PARED DE FUEGO EN AREAS A MODIFICAR",
				"orden": 14,
				"componentes": [
					{
						"componente": "972",
						"descripcion": "TOLVA DE PARABRISAS Y PARED DE FUEGO EN AREAS A MODIFICAR"
					},
					{
						"componente": "973",
						"descripcion": "Tolva lado copiloto"
					},
					{
						"componente": "974",
						"descripcion": "Trampa de clima"
					},
					{
						"componente": "975",
						"descripcion": "Pared de fuego piloto"
					},
					{
						"componente": "976",
						"descripcion": "Pared de fuego copiloto"
					},
					{
						"componente": "977",
						"descripcion": "Unión pared de fuego copiloto"
					}
				]
			}
		]
	},
	{
		"seccion": "03",
		"descripcion": "BLINDAJE TRANSPARENTE",
		"orden": 3,
		"subSecciones": [
			{
				"subSeccion": "10",
				"descripcion": "BLINDAJE TRANSPARENTE",
				"orden": 10,
				"componentes": [
					{
						"componente": "780",
						"descripcion": "Espesor de cristales"
					},
					{
						"componente": "790",
						"descripcion": "Parabrisas"
					},
					{
						"componente": "791",
						"descripcion": "Parabrisas con resaque"
					},
					{
						"componente": "800",
						"descripcion": "Cristales de puertas delanteras"
					},
					{
						"componente": "801",
						"descripcion": "Cristales planos de puertas delanteras"
					},
					{
						"componente": "810",
						"descripcion": "Cristales de puertas traseras"
					},
					{
						"componente": "811",
						"descripcion": "Aletas de puertas delanteras"
					},
					{
						"componente": "812",
						"descripcion": "Cristales planos de puertas traseras"
					},
					{
						"componente": "820",
						"descripcion": "Aletas de puertas traseras"
					},
					{
						"componente": "821",
						"descripcion": "Cuartos traseros"
					},
					{
						"componente": "822",
						"descripcion": "Cuartos traseros delanteros"
					},
					{
						"componente": "823",
						"descripcion": "cuartos traseros traseros"
					},
					{
						"componente": "824",
						"descripcion": "Costados traseros curvos tipo OEM"
					},
					{
						"componente": "825",
						"descripcion": "Inserto de Aletas de puertas traseras"
					},
					{
						"componente": "830",
						"descripcion": "Inserto division"
					},
					{
						"componente": "831",
						"descripcion": "Inserto de mampara"
					},
					{
						"componente": "832",
						"descripcion": "Inserto de cuartos traseros"
					},
					{
						"componente": "833",
						"descripcion": "Medallon"
					},
					{
						"componente": "834",
						"descripcion": "Inserto de medallon"
					},
					{
						"componente": "835",
						"descripcion": "Mirillas"
					},
					{
						"componente": "836",
						"descripcion": "Mirillas de torreta"
					},
					{
						"componente": "837",
						"descripcion": "Costados delanteros"
					},
					{
						"componente": "838",
						"descripcion": "Cristal de 5ta puerta"
					},
					{
						"componente": "839",
						"descripcion": "Costados traseros"
					},
					{
						"componente": "840",
						"descripcion": "Recorrido cristal delantero izquierdo"
					},
					{
						"componente": "841",
						"descripcion": "Costados laterales"
					},
					{
						"componente": "842",
						"descripcion": "Mirilla de puerta media"
					},
					{
						"componente": "843",
						"descripcion": "Cristal puerta media"
					},
					{
						"componente": "844",
						"descripcion": "Recorrido de tijera para cristal delantero izquierdo"
					},
					{
						"componente": "850",
						"descripcion": "Recorrido cristal delantero derecho"
					},
					{
						"componente": "851",
						"descripcion": "Recorrido cristales Puertas Traseras"
					},
					{
						"componente": "855",
						"descripcion": "Presurizador en Recorrido de Cristales"
					},
					{
						"componente": "856",
						"descripcion": "Mirillas planas"
					}
				]
			}
		]
	},
	{
		"seccion": "04",
		"descripcion": "EQUIPO PERFORMANCE",
		"orden": 4,
		"subSecciones": [
			{
				"subSeccion": "11",
				"descripcion": "EQUIPO PERFORMANCE",
				"orden": 11,
				"componentes": [
					{
						"componente": "859",
						"descripcion": "Llanta RF o flat over 19"
					},
					{
						"componente": "860",
						"descripcion": "Rodado Seguro"
					},
					{
						"componente": "861",
						"descripcion": "4 Run flat"
					},
					{
						"componente": "862",
						"descripcion": "5 Run flat"
					},
					{
						"componente": "863",
						"descripcion": "4 Flat over"
					},
					{
						"componente": "864",
						"descripcion": "5 Falt over"
					},
					{
						"componente": "865",
						"descripcion": "En rin 19 y 21 Flat over"
					},
					{
						"componente": "866",
						"descripcion": "En rin 19 llantas tipo run flat"
					},
					{
						"componente": "867",
						"descripcion": "En rin 20 llanta tipo run flat"
					},
					{
						"componente": "868",
						"descripcion": "En rin 20 cambio de rin, para flat over"
					},
					{
						"componente": "869",
						"descripcion": "En rin 21 falt over"
					},
					{
						"componente": "870",
						"descripcion": "Llantas tipo run flat"
					},
					{
						"componente": "871",
						"descripcion": "Rodado Seguro sujeto a Factibilidad"
					},
					{
						"componente": "880",
						"descripcion": "Llanta original"
					},
					{
						"componente": "890",
						"descripcion": "Gato hidraulico"
					},
					{
						"componente": "891",
						"descripcion": "Gato hidraulico original misma ubicación"
					},
					{
						"componente": "892",
						"descripcion": "Gato hidraulico 4 toneladas"
					},
					{
						"componente": "893",
						"descripcion": "Gato hidraulico 4 toneladas y original"
					},
					{
						"componente": "894",
						"descripcion": "Gato hidraulico 6 toneladas"
					},
					{
						"componente": "895",
						"descripcion": "Gato hidraulico 10 toneladas"
					},
					{
						"componente": "896",
						"descripcion": "Gato hidraulico 12 toneladas"
					},
					{
						"componente": "900",
						"descripcion": "Barra estabilizadora delantera"
					},
					{
						"componente": "910",
						"descripcion": "Barra estabilizadora trasera"
					},
					{
						"componente": "911",
						"descripcion": "Barra estabilizadora delantera"
					},
					{
						"componente": "920",
						"descripcion": "Amortiguadores delanteros"
					},
					{
						"componente": "921",
						"descripcion": "Bases de Amortiguadores delanteros"
					},
					{
						"componente": "922",
						"descripcion": "Amortiguadores"
					},
					{
						"componente": "930",
						"descripcion": "Amortiguadores traseros"
					},
					{
						"componente": "931",
						"descripcion": "Bolsa de aire base de metal"
					},
					{
						"componente": "940",
						"descripcion": "Resortes delanteros"
					},
					{
						"componente": "942",
						"descripcion": "Resortes"
					},
					{
						"componente": "950",
						"descripcion": "Resortes traseros"
					},
					{
						"componente": "951",
						"descripcion": "Muelles traseros"
					},
					{
						"componente": "952",
						"descripcion": "Soporte de bolsa de aire"
					},
					{
						"componente": "953",
						"descripcion": "Key lift"
					},
					{
						"componente": "954",
						"descripcion": "Aumento para muelle"
					},
					{
						"componente": "955",
						"descripcion": "Base de aumentos para piernas"
					},
					{
						"componente": "956",
						"descripcion": "Ensamble de rin artilleria y llanta R20"
					},
					{
						"componente": "957",
						"descripcion": "Key lifts ref en barra de torsion"
					},
					{
						"componente": "958",
						"descripcion": "2 Hojas de muelles extras"
					},
					{
						"componente": "959",
						"descripcion": "Muelles delanteros"
					},
					{
						"componente": "960",
						"descripcion": "Ensamble de rin artilleria y llanta R19.5"
					},
					{
						"componente": "970",
						"descripcion": "Suspensión"
					}
				]
			}
		]
	}
];

export const SPEC_COMPONENT_COUNT = 375;
