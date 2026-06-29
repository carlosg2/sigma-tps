import type { SpecArticle, SpecificationV2, SpecComponentValue, SpecV2State } from './types';
import { makeSpecAuthorizations } from './constants';

// --- Catalogo propio de articulos de especificacion ---
type SA = Omit<SpecArticle, 'createdAt' | 'updatedAt' | 'status'> & Partial<Pick<SpecArticle, 'status'>>;

function a(s: SA): SpecArticle {
	return {
		status: 'activo',
		createdAt: '2025-01-15',
		updatedAt: '2025-06-01',
		...s
	};
}

const specArticles: SpecArticle[] = [
	// CRISTALES (CRIS)
	a({ id: 'sa1', code: 'ESP-CRIS-WS-001', description: 'Parabrisas blindado NIII 38mm', grupoCont: '500', grupoMayor: 'CRIS', grupoMenor: 'WS', udm: 'pieza', unitWeight: 62, price: 48000, currency: 'MXN' }),
	a({ id: 'sa2', code: 'ESP-CRIS-WS-002', description: 'Parabrisas blindado NIV 55mm con resaque', grupoCont: '500', grupoMayor: 'CRIS', grupoMenor: 'WS', udm: 'pieza', unitWeight: 88, price: 72000, currency: 'MXN' }),
	a({ id: 'sa3', code: 'ESP-CRIS-FD-001', description: 'Cristal puerta delantera NIII', grupoCont: '500', grupoMayor: 'CRIS', grupoMenor: 'FD', udm: 'pieza', unitWeight: 28, price: 16500, currency: 'MXN' }),
	a({ id: 'sa4', code: 'ESP-CRIS-RD-001', description: 'Cristal puerta trasera NIII', grupoCont: '500', grupoMayor: 'CRIS', grupoMenor: 'RD', udm: 'pieza', unitWeight: 26, price: 15800, currency: 'MXN' }),
	a({ id: 'sa5', code: 'ESP-CRIS-BL-001', description: 'Medallon trasero blindado NIII', grupoCont: '500', grupoMayor: 'CRIS', grupoMenor: 'BL', udm: 'pieza', unitWeight: 40, price: 26000, currency: 'MXN' }),
	a({ id: 'sa6', code: 'ESP-CRIS-MAMP-001', description: 'Mampara blindada divisoria NIII', grupoCont: '500', grupoMayor: 'CRIS', grupoMenor: 'MAMP', udm: 'pieza', unitWeight: 55, price: 31000, currency: 'MXN' }),
	a({ id: 'sa7', code: 'ESP-CRIS-VPV-001', description: 'Mirilla escotilla blindada', grupoCont: '500', grupoMayor: 'CRIS', grupoMenor: 'VPV', udm: 'pieza', unitWeight: 12, price: 8900, currency: 'MXN' }),
	// BLINDAJE OPACO (BLIND)
	a({ id: 'sa8', code: 'ESP-BLIND-III-001', description: 'Placa acero balistico NIII 6mm', grupoCont: '300', grupoMayor: 'BLIND', grupoMenor: 'III', udm: 'placa', unitWeight: 95, price: 18500, currency: 'MXN' }),
	a({ id: 'sa9', code: 'ESP-BLIND-IV-001', description: 'Placa acero balistico NIV 8mm', grupoCont: '300', grupoMayor: 'BLIND', grupoMenor: 'IV', udm: 'placa', unitWeight: 126, price: 24500, currency: 'MXN' }),
	a({ id: 'sa10', code: 'ESP-BLIND-V-001', description: 'Placa acero balistico NV 12mm', grupoCont: '300', grupoMayor: 'BLIND', grupoMenor: 'V', udm: 'placa', unitWeight: 188, price: 35800, currency: 'MXN' }),
	a({ id: 'sa11', code: 'ESP-BLIND-IIIPS-001', description: 'Panel sintetico NIII+ ultraligero', grupoCont: '300', grupoMayor: 'BLIND', grupoMenor: 'III PS', udm: 'placa', unitWeight: 42, price: 28000, currency: 'MXN' }),
	a({ id: 'sa12', code: 'ESP-BLIND-IIIUL-001', description: 'Acero balistico ultraligero NIII', grupoCont: '300', grupoMayor: 'BLIND', grupoMenor: 'III UL', udm: 'placa', unitWeight: 64, price: 22500, currency: 'MXN' }),
	// SINTETICOS (SINT)
	a({ id: 'sa13', code: 'ESP-SINT-KEVL-001', description: 'Panel de kevlar 1.5m x 1m', grupoCont: '500', grupoMayor: 'SINT', grupoMenor: 'KEVL', udm: 'metro_cuadrado', unitWeight: 8, price: 4200, currency: 'MXN' }),
	a({ id: 'sa14', code: 'ESP-SINT-POLI-001', description: 'Panel de polietileno balistico', grupoCont: '500', grupoMayor: 'SINT', grupoMenor: 'POLI', udm: 'metro_cuadrado', unitWeight: 6, price: 5600, currency: 'MXN' }),
	a({ id: 'sa15', code: 'ESP-SINT-MANT-001', description: 'Manta balistica multicapa', grupoCont: '500', grupoMayor: 'SINT', grupoMenor: 'MANT', udm: 'pieza', unitWeight: 5, price: 3100, currency: 'MXN' }),
	// MAQUINADOS (MAQU)
	a({ id: 'sa16', code: 'ESP-MAQU-BISAGR-001', description: 'Bisagra maquinada reforzada con freno', grupoCont: '305', grupoMayor: 'MAQU', grupoMenor: 'BISAGR', udm: 'pieza', unitWeight: 3.2, price: 2800, currency: 'MXN' }),
	a({ id: 'sa17', code: 'ESP-MAQU-CONTRA-001', description: 'Contrabisagra placa fijadora', grupoCont: '305', grupoMayor: 'MAQU', grupoMenor: 'CONTRA', udm: 'pieza', unitWeight: 2.1, price: 1900, currency: 'MXN' }),
	a({ id: 'sa18', code: 'ESP-MAQU-PLACFIJ-001', description: 'Placa fijadora puerta delantera', grupoCont: '305', grupoMayor: 'MAQU', grupoMenor: 'PLAC-FIJ', udm: 'pieza', unitWeight: 1.4, price: 950, currency: 'MXN' }),
	a({ id: 'sa19', code: 'ESP-MAQU-TRONER-001', description: 'Tronera lateral maquinada', grupoCont: '305', grupoMayor: 'MAQU', grupoMenor: 'TRONER', udm: 'pieza', unitWeight: 4.5, price: 3600, currency: 'MXN' }),
	a({ id: 'sa20', code: 'ESP-MAQU-PRESUR-001', description: 'Presurizador de puerta', grupoCont: '305', grupoMayor: 'MAQU', grupoMenor: 'PRESUR', udm: 'pieza', unitWeight: 1.8, price: 2200, currency: 'MXN' }),
	a({ id: 'sa21', code: 'ESP-MAQU-TACTPTA-001', description: 'Puerta tactica blindada', grupoCont: '305', grupoMayor: 'MAQU', grupoMenor: 'TACT-PTA', udm: 'pieza', unitWeight: 78, price: 45000, currency: 'MXN' }),
	// SUSPENSION (SUSP)
	a({ id: 'sa22', code: 'ESP-SUSP-AMOR-001', description: 'Amortiguador reforzado delantero', grupoCont: '500', grupoMayor: 'SUSP', grupoMenor: 'AMOR', udm: 'pieza', unitWeight: 6.5, price: 5400, currency: 'MXN' }),
	a({ id: 'sa23', code: 'ESP-SUSP-RESO-001', description: 'Resorte reforzado delantero', grupoCont: '500', grupoMayor: 'SUSP', grupoMenor: 'RESO', udm: 'pieza', unitWeight: 9.2, price: 3800, currency: 'MXN' }),
	a({ id: 'sa24', code: 'ESP-SUSP-MUEL-001', description: 'Muelle trasero reforzado (hoja)', grupoCont: '500', grupoMayor: 'SUSP', grupoMenor: 'MUEL', udm: 'pieza', unitWeight: 14, price: 4200, currency: 'MXN' }),
	a({ id: 'sa25', code: 'ESP-SUSP-BRAZ-001', description: 'Brazo de suspension reforzado', grupoCont: '500', grupoMayor: 'SUSP', grupoMenor: 'BRAZ', udm: 'pieza', unitWeight: 7.8, price: 6100, currency: 'MXN' }),
	a({ id: 'sa26', code: 'ESP-SUSP-COMP-001', description: 'Compresor de suspension de aire', grupoCont: '500', grupoMayor: 'SUSP', grupoMenor: 'COMP', udm: 'pieza', unitWeight: 3.4, price: 8900, currency: 'MXN' }),
	// RUEDAS (RUED)
	a({ id: 'sa27', code: 'ESP-RUED-RUNF-001', description: 'Run flat insert R18', grupoCont: '500', grupoMayor: 'RUED', grupoMenor: 'RUNF', udm: 'juego', unitWeight: 22, price: 28000, currency: 'MXN' }),
	a({ id: 'sa28', code: 'ESP-RUED-RUNF-002', description: 'Run flat insert R20', grupoCont: '500', grupoMayor: 'RUED', grupoMenor: 'RUNF', udm: 'juego', unitWeight: 26, price: 33000, currency: 'MXN' }),
	a({ id: 'sa29', code: 'ESP-RUED-FLAT-001', description: 'Flatover R19', grupoCont: '500', grupoMayor: 'RUED', grupoMenor: 'FLAT', udm: 'juego', unitWeight: 30, price: 41000, currency: 'MXN' }),
	a({ id: 'sa30', code: 'ESP-RUED-RINE-001', description: 'Rin artilleria R20', grupoCont: '500', grupoMayor: 'RUED', grupoMenor: 'RINE', udm: 'pieza', unitWeight: 18, price: 9500, currency: 'MXN' }),
	a({ id: 'sa31', code: 'ESP-RUED-LLAN-001', description: 'Llanta tipo run flat 285/60 R18', grupoCont: '500', grupoMayor: 'RUED', grupoMenor: 'LLAN', udm: 'pieza', unitWeight: 24, price: 12000, currency: 'MXN' }),
	// ELECTRICO (ELEC)
	a({ id: 'sa32', code: 'ESP-ELEC-FARO-001', description: 'Faro LED reforzado', grupoCont: '500', grupoMayor: 'ELEC', grupoMenor: 'FARO', udm: 'pieza', unitWeight: 2.2, price: 4800, currency: 'MXN' }),
	a({ id: 'sa33', code: 'ESP-ELEC-MOTO-001', description: 'Motor electrico de cristal reforzado', grupoCont: '500', grupoMayor: 'ELEC', grupoMenor: 'MOTO', udm: 'pieza', unitWeight: 1.6, price: 3200, currency: 'MXN' }),
	a({ id: 'sa34', code: 'ESP-ELEC-BATE-001', description: 'Bateria auxiliar 48V', grupoCont: '500', grupoMayor: 'ELEC', grupoMenor: 'BATE', udm: 'pieza', unitWeight: 16, price: 14500, currency: 'MXN' }),
	a({ id: 'sa35', code: 'ESP-ELEC-CAMA-001', description: 'Camara de vision trasera', grupoCont: '500', grupoMayor: 'ELEC', grupoMenor: 'CAMA', udm: 'pieza', unitWeight: 0.4, price: 2600, currency: 'MXN' }),
	// FRENOS (FREN)
	a({ id: 'sa36', code: 'ESP-FREN-BALA-001', description: 'Balata reforzada delantera', grupoCont: '500', grupoMayor: 'FREN', grupoMenor: 'BALA', udm: 'juego', unitWeight: 3.8, price: 3400, currency: 'MXN' }),
	a({ id: 'sa37', code: 'ESP-FREN-DISC-001', description: 'Disco de freno reforzado', grupoCont: '500', grupoMayor: 'FREN', grupoMenor: 'DISC', udm: 'pieza', unitWeight: 9.5, price: 4900, currency: 'MXN' }),
	a({ id: 'sa38', code: 'ESP-FREN-BREM-001', description: 'Kit Brembo 6 pistones', grupoCont: '500', grupoMayor: 'FREN', grupoMenor: 'BREM', udm: 'juego', unitWeight: 18, price: 32000, currency: 'MXN' }),
	// PINTURA (PINT)
	a({ id: 'sa39', code: 'ESP-PINT-PINT-001', description: 'Pintura automotriz poliuretano', grupoCont: '500', grupoMayor: 'PINT', grupoMenor: 'PINT', udm: 'galon', unitWeight: 4, price: 1200, currency: 'MXN' }),
	a({ id: 'sa40', code: 'ESP-PINT-SELL-001', description: 'Sellador estructural balistico', grupoCont: '500', grupoMayor: 'PINT', grupoMenor: 'SELL', udm: 'tubo', unitWeight: 0.5, price: 280, currency: 'MXN' }),
	// CYC
	a({ id: 'sa41', code: 'ESP-CYC-ASIE-001', description: 'Asiento con anclaje reforzado', grupoCont: '500', grupoMayor: 'CYC', grupoMenor: 'ASIE', udm: 'pieza', unitWeight: 22, price: 18000, currency: 'MXN' }),
	a({ id: 'sa42', code: 'ESP-CYC-PIEL-001', description: 'Piel automotriz premium', grupoCont: '500', grupoMayor: 'CYC', grupoMenor: 'PIEL', udm: 'metro', unitWeight: 1.2, price: 1900, currency: 'MXN' }),
	a({ id: 'sa43', code: 'ESP-CYC-ALFO-001', description: 'Alfombra moldeada con aislante', grupoCont: '500', grupoMayor: 'CYC', grupoMenor: 'ALFO', udm: 'juego', unitWeight: 8, price: 5400, currency: 'MXN' }),
	// CORTE (CORT)
	a({ id: 'sa44', code: 'ESP-CORT-ACEBAL-001', description: 'Corte laser acero balistico', grupoCont: '500', grupoMayor: 'CORT', grupoMenor: 'ACE-BAL', udm: 'pieza', unitWeight: 0, price: 850, currency: 'MXN' }),
	a({ id: 'sa45', code: 'ESP-CORT-DOBL-001', description: 'Pieza doblada a medida', grupoCont: '500', grupoMayor: 'CORT', grupoMenor: 'DOBL', udm: 'pieza', unitWeight: 0, price: 620, currency: 'MXN' }),
	// ACCESORIOS BLINDAJE (ACC BLIND)
	a({ id: 'sa46', code: 'ESP-ACC-SIRENA-001', description: 'Sirena bidireccional 100W', grupoCont: '400', grupoMayor: 'ACC BLIND', grupoMenor: 'KACCE', udm: 'pieza', unitWeight: 2.4, price: 6800, currency: 'MXN' }),
	a({ id: 'sa47', code: 'ESP-ACC-TORRE-001', description: 'Torreta LED estroboscopica', grupoCont: '400', grupoMayor: 'ACC BLIND', grupoMenor: 'KACCE', udm: 'pieza', unitWeight: 3.1, price: 9200, currency: 'MXN' }),
	a({ id: 'sa48', code: 'ESP-ACC-INTER-001', description: 'Intercomunicador exterior', grupoCont: '400', grupoMayor: 'ACC BLIND', grupoMenor: 'KACCE', udm: 'pieza', unitWeight: 0.8, price: 4100, currency: 'MXN' })
];

// --- Helper para componentes capturados ---
function c(
	seccion: string,
	subSeccion: string,
	componente: string,
	descripcion: string,
	value: string,
	specArticleId: string | null = null,
	quantity = 0
): SpecComponentValue {
	return { seccion, subSeccion, componente, descripcion, value, specArticleId, quantity, notes: '' };
}

const spec1Components: SpecComponentValue[] = [
	c('01', '01', '50', 'Peso Original del Vehiculo', '2,650 kg'),
	c('01', '01', '90', 'Peso Total del Vehiculo Blindado', '3,980 kg'),
	c('01', '01', '80', 'Peso de Blindaje y Accesorios', '1,330 kg'),
	c('02', '02', '110', 'Tipo de blindaje', 'Acero balistico + sintetico'),
	c('02', '03', '150', 'Blindaje en techo', '6mm acero balistico', 'sa8', 4),
	c('02', '06', '390', 'Puertas delanteras', 'Acero 6mm + kevlar', 'sa8', 2),
	c('02', '06', '504', 'Bisagras', 'Bisagra maquinada reforzada con freno', 'sa16', 8),
	c('03', '10', '790', 'Parabrisas', 'NIII 38mm', 'sa1', 1),
	c('03', '10', '800', 'Cristales de puertas delanteras', 'NIII', 'sa3', 2),
	c('03', '10', '810', 'Cristales de puertas traseras', 'NIII', 'sa4', 2),
	c('03', '10', '833', 'Medallon', 'NIII', 'sa5', 1),
	c('04', '11', '861', '4 Run flat', 'Run flat insert R18', 'sa27', 1),
	c('04', '11', '920', 'Amortiguadores delanteros', 'Reforzados', 'sa22', 2)
];

const spec2Components: SpecComponentValue[] = [
	c('01', '01', '50', 'Peso Original del Vehiculo', '2,900 kg'),
	c('01', '01', '90', 'Peso Total del Vehiculo Blindado', '4,550 kg'),
	c('02', '02', '110', 'Tipo de blindaje', 'Acero balistico NIV'),
	c('02', '03', '150', 'Blindaje en techo', '8mm acero balistico', 'sa9', 5),
	c('02', '06', '390', 'Puertas delanteras', 'Acero 8mm + kevlar', 'sa9', 2),
	c('03', '10', '790', 'Parabrisas', 'NIV 55mm con resaque', 'sa2', 1),
	c('04', '11', '862', '5 Run flat', 'Run flat insert R20', 'sa28', 1)
];

function rev(version: number, by: string, at: string, reason: string) {
	return { id: `srev-${version}-${Math.random().toString(36).slice(2, 7)}`, version, changedBy: by, changedAt: at, reason };
}

// --- Especificacion real (formato TPS): B-E6N-AMG-GD-172 / Mercedes Benz GLE 63 AMG ---
// Helper: el codigo de designacion (DAB072, DPS228, ...) se guarda en notes.
function rc(seccion: string, subSeccion: string, componente: string, descripcion: string, code: string, value: string): SpecComponentValue {
	return { seccion, subSeccion, componente, descripcion, value, specArticleId: null, quantity: 0, notes: code };
}

const realComponents: SpecComponentValue[] = [
	// 01 INFORMACION GENERAL
	rc('01', '01', '10', 'Altura de Eje Delantero Izquierdo', 'DAL029', '8 1/2"'),
	rc('01', '01', '20', 'Altura de Eje Delantero Derecho', 'DAL029', '8 1/2"'),
	rc('01', '01', '30', 'Altura de Eje Trasero Izquierdo', 'DAL035', '9 3/4"'),
	rc('01', '01', '40', 'Altura de Eje Trasero Derecho', 'DAL040', '10"'),
	rc('01', '01', '50', 'Peso Original del Vehiculo', 'DPS228', '2370'),
	rc('01', '01', '60', 'Peso Original del Eje Trasero', 'DPS102', '1100'),
	rc('01', '01', '70', 'Peso de Cristales', 'DPS406', 'ND'),
	rc('01', '01', '80', 'Peso de Blindaje y Accesorios', 'DPS404', '860'),
	rc('01', '01', '90', 'Peso Total del Vehiculo Blindado', 'DPS302', '3230'),
	rc('01', '01', '100', 'Peso del Eje Trasero Blindado', 'DPS156', '1650'),
	// 02 BLINDAJE OPACO / 02 INFORMACION DE BLINDAJE
	rc('02', '02', '110', 'Tipo de blindaje', 'DTB002', 'DIV 2DA FILA'),
	rc('02', '02', '120', 'Tipo de traslape', 'DTT001', 'EN MARCO DE POSTES'),
	// 03 TECHO
	rc('02', '03', '150', 'Blindaje en techo', 'DAB072', 'A.B. 5 MM HH'),
	rc('02', '03', '160', 'Roll bar en techo', 'DAB072', 'A.B. 5 MM HH'),
	rc('02', '03', '170', 'Corona', 'DAB072', 'A.B. 5 MM HH'),
	// 04 TOLVA DE PARABRISAS Y PARED DE FUEGO
	rc('02', '04', '190', 'Proteccion de resaque de camara de parabrisas', 'DAB072', 'A.B. 5 MM HH'),
	rc('02', '04', '200', '1er marco de parabrisas', 'DAB072', 'A.B. 5 MM HH'),
	rc('02', '04', '210', '2do marco de parabrisas', 'DAB072', 'A.B. 5 MM HH'),
	rc('02', '04', '220', 'Toldo de parabrisas', 'DAB072', 'A.B. 5 MM HH'),
	rc('02', '04', '230', 'Tolva inferior de parabrisas', 'DAB072', 'A.B. 5 MM HH'),
	rc('02', '04', '240', 'Pared de fuego', 'DAB072', 'A.B. 5 MM HH'),
	rc('02', '04', '250', 'Entrada de Aire a Sistema de A/C', 'DAB072', 'A.B. 5 MM HH'),
	// 05 POSTES, BISELES Y PISO
	rc('02', '05', '280', 'Poste A inferior', 'DAB072', 'A.B. 5 MM HH'),
	rc('02', '05', '290', 'Poste A superior', 'DAB072', 'A.B. 5 MM HH'),
	rc('02', '05', '301', 'Poste B y C', 'DAB072', 'A.B. 5 MM HH'),
	rc('02', '05', '320', 'Correderas de cinturon en poste B', 'DAB072', 'A.B. 5 MM HH'),
	rc('02', '05', '340', 'Caja de cinturones y trampas', 'DAB072', 'A.B. 5 MM HH'),
	rc('02', '05', '352', 'Biseles de cristales', 'DAB072', 'A.B. 5 MM HH'),
	rc('02', '05', '362', 'Traslape en marco de postes', 'DAB072', 'A.B. 5 MM HH'),
	rc('02', '05', '370', 'Proteccion en piso', 'DST003', 'MANTA ANTIFRAGMENTACION 2 DM51'),
	rc('02', '05', '380', 'Costados de piso', 'DAB031', 'A.B 3 MM'),
	// 06 PUERTAS
	rc('02', '06', '390', 'Puertas delanteras', 'DAB072', 'A.B. 5 MM HH'),
	rc('02', '06', '400', 'Puertas traseras', 'DAB072', 'A.B. 5 MM HH'),
	rc('02', '06', '410', 'Perímetro de puertas', 'DAB072', 'A.B. 5 MM HH'),
	rc('02', '06', '420', 'Proteccion de Jaladeras', 'DAB072', 'A.B. 5 MM HH'),
	rc('02', '06', '430', 'Trampa de Arneses', 'DAB072', 'A.B. 5 MM HH'),
	rc('02', '06', '440', 'Traslape de cristal en area de espejo', 'DAB072', 'A.B. 5 MM HH'),
	rc('02', '06', '480', 'Tirantes en puertas delanteras', 'DST011', 'NYLON CUBIERTO CON PIEL'),
	rc('02', '06', '500', 'Contrachapas', 'DAB031', 'A.B 3 MM'),
	rc('02', '06', '504', 'Bisagras', 'DBS009', 'BISAGRAS ORIGINALES'),
	rc('02', '06', '520', 'Contrabisagras', 'DAB072', 'A.B. 5 MM HH'),
	// 07 DIVISORIO / MAMPARA / RESPALDO
	rc('02', '07', '540', 'Conchas interiores', 'DAB072', 'A.B. 5 MM HH'),
	rc('02', '07', '550', 'Division 2da fila', 'DAB072', 'A.B. 5 MM HH'),
	rc('02', '07', '552', 'Marco de division', 'DAB072', 'A.B. 5 MM HH'),
	rc('02', '07', '553', 'Marco soporte de division', 'DAB072', 'A.B. 5 MM HH'),
	// 08 PROTECCION DE MOTOR / PERIFERIA
	rc('02', '08', '590', 'Defensas delanteras', 'DAB031', 'A.B 3 MM'),
	rc('02', '08', '610', 'Polveras delanteras', 'DAB071', 'A.B. 4 MM'),
	rc('02', '08', '620', 'Proteccion de lineas de clima', 'DAB071', 'A.B. 4 MM'),
	rc('02', '08', '630', 'Proteccion de booster', 'DAB071', 'A.B. 4 MM'),
	rc('02', '08', '650', 'Proteccion de caja de fusibles', 'DAB071', 'A.B. 4 MM'),
	rc('02', '08', '660', 'Proteccion de bateria', 'DAB031', 'A.B 3 MM'),
	rc('02', '08', '670', 'Proteccion de tanque de combustible', 'DST014', 'KEVLAR 7C'),
	rc('02', '08', '690', 'Trampa en mofle', 'DEP028', 'LOGO TPS'),
	// 03 BLINDAJE TRANSPARENTE / 10
	rc('03', '10', '780', 'Espesor de cristales', 'DEC007', '32 MM'),
	rc('03', '10', '790', 'Parabrisas', 'DCT002', 'TONO CLARO'),
	rc('03', '10', '800', 'Cristales de puertas delanteras', 'DCT002', 'TONO CLARO'),
	rc('03', '10', '810', 'Cristales de puertas traseras', 'DCT011', 'TONO AL 14%'),
	rc('03', '10', '820', 'Aletas de puertas traseras', 'DCT011', 'TONO AL 14%'),
	rc('03', '10', '830', 'Inserto division', 'DCT002', 'TONO CLARO'),
	rc('03', '10', '840', 'Recorrido cristal delantero izquierdo', 'DRC081', '13"'),
	rc('03', '10', '850', 'Recorrido cristal delantero derecho', 'DRC025', '6"'),
	// 04 EQUIPO PERFORMANCE / 11
	rc('04', '11', '860', 'Rodado Seguro', 'DEP061', 'SUJETO A FACTIBILIDAD'),
	rc('04', '11', '890', 'Gato hidraulico', 'DEP007', 'GATO HIDRAULICO 6 TONELADAS'),
	rc('04', '11', '900', 'Barra estabilizadora delantera', 'DEP061', 'SUJETO A FACTIBILIDAD')
];

const spvReal: SpecificationV2 = {
	id: 'spv-real-gle63',
	code: 'B-E6N-AMG-GD-172',
	brand: 'Mercedes Benz',
	model: 'GLE 63 AMG',
	year: '2022 UP',
	armorLevel: 'NIV_plus',
	designType: 'alto_volumen',
	version: 4,
	status: 'autorizada',
	producto: 'BLINDAJE MB GLE 63 SUV AMG N-IV DIV 2DA FILA 2022 UP',
	disenoBlindaje: 'DIV 2DA FILA',
	planta: 'PLANTA 1',
	diasFabricacion: '12 SEMANAS SEGUN PROGRAMACION',
	comentariosIngenieria: [
		'VIN EN PARABRISAS',
		'QUEMACOCOS CANCELADO',
		'PROTECCION EN PISO EN SUJECION DE SOLERA DE 1"',
		'SALIDA DE AIRE EN RESPALDO OCULTO',
		'EN SUSPENSION NEUMATICA NO APLICA SUSPENSION REFORZADA',
		'RIN 23 NO ES FACTIBLE PARA RUN FLAT NI FLAT OVER',
		'NO APLICA RODADO SEGURO CUANDO LAS LLANTAS TENGAN LAS SIGUIENTES MEDIDAS: 285 / 40 R22 Y 325 / 35 R22',
		'CUANDO LA UNIDAD CUENTA CON BARRAS ESTABILIZADORAS ELECTRONICAS, NO APLICAN REFORZADAS',
		'FUNCION DE LUCES AUTOMATICAS ACTIVA - LIMPIA PARABRISAS AUTOMATICO CANCELADO'
	],
	accesoriosEstandar: [{ code: 'K-ESTROBOS', description: 'KIT DE ESTROBOS' }],
	accesoriosOpcionales: [
		{ code: 'K-GAS-CHILE', description: 'KIT SISTEMA DE GAS CHILE' },
		{ code: 'K-SIR-E-INTER', description: 'KIT SIRENA E INTERCOMUNICADOR' }
	],
	components: realComponents,
	authorizations: [
		{ department: 'Elaboro', status: 'autorizado', authorizedBy: 'ALAN T. / JOSELIN B. / ING JULIO RDZ', authorizedAt: '2025-10-27', notes: '' },
		{ department: 'Gerente General', status: 'autorizado', authorizedBy: 'ENRIQUE HERRERA', authorizedAt: '2025-10-27', notes: '' },
		{ department: 'Gerente de Ingenieria', status: 'autorizado', authorizedBy: 'ING. JUAN CARLOS ACOSTA', authorizedAt: '2025-10-27', notes: '' },
		{ department: 'Gerente de Calidad / Ingenieria', status: 'autorizado', authorizedBy: 'ING. EDGARDO LOERA', authorizedAt: '2025-10-27', notes: '' },
		{ department: 'Validacion de Materiales Balisticos', status: 'autorizado', authorizedBy: 'LIC. ABIGAIL HERNANDEZ', authorizedAt: '2025-10-27', notes: 'Materiales aprobados' },
		{ department: 'Gerente de Produccion', status: 'autorizado', authorizedBy: 'ING. DIEGO TAMEZ', authorizedAt: '2025-10-27', notes: '' },
		{ department: 'Planeacion y Ctrl de Prod', status: 'autorizado', authorizedBy: 'ING. FELIPE CALDERON', authorizedAt: '2025-10-27', notes: '' }
	],
	revisions: [
		rev(1, 'Ingenieria TPS', '2025-06-01', 'Creacion inicial'),
		rev(2, 'Ingenieria TPS', '2025-08-15', 'Ajuste de blindaje opaco'),
		rev(3, 'Ingenieria TPS', '2025-09-30', 'Actualizacion de blindaje transparente'),
		rev(4, 'Ingenieria TPS', '2025-10-27', 'A) Se modifica equipo performance. B) Se actualizan comentarios de ingenieria')
	],
	notes: 'Especificacion real de referencia importada del formato TPS (config. B-E6N-AMG-GD-172).',
	createdAt: '2025-06-01',
	updatedAt: '2025-10-27',
	createdBy: 'u3'
};

// --- Especificacion real (formato TPS): B-SBN-000-MD-182 / Chevrolet Suburban Comun B7 PLUS ---
const suburbanComponents: SpecComponentValue[] = [
	// 01 INFORMACION GENERAL
	rc('01', '01', '10', 'Altura de Eje Delantero Izquierdo', 'DAL103', '21 1/2"'),
	rc('01', '01', '20', 'Altura de Eje Delantero Derecho', 'DAL103', '21 1/2"'),
	rc('01', '01', '30', 'Altura de Eje Trasero Izquierdo', 'DAL104', '22 1/2"'),
	rc('01', '01', '40', 'Altura de Eje Trasero Derecho', 'DAL104', '22 1/2"'),
	rc('01', '01', '50', 'Peso Original del Vehiculo', 'DPS263', '2720'),
	rc('01', '01', '60', 'Peso Original del Eje Trasero', 'DPS125', '1320'),
	rc('01', '01', '70', 'Peso de Cristales', 'DPS406', 'ND'),
	rc('01', '01', '80', 'Peso de Blindaje y Accesorios', 'DPS216', '2230'),
	rc('01', '01', '90', 'Peso Total del Vehiculo Blindado', 'DPS419', '4950'),
	rc('01', '01', '100', 'Peso del Eje Trasero Blindado', 'DPS239', '2480'),
	// 02 BLINDAJE OPACO / 02 INFORMACION DE BLINDAJE
	rc('02', '02', '110', 'Tipo de blindaje', 'DTB002', 'DIV 2DA FILA'),
	rc('02', '02', '120', 'Tipo de traslape', 'DTT001', 'EN MARCO DE POSTES'),
	// 03 TECHO
	rc('02', '03', '150', 'Blindaje en techo', 'DAB008', 'A.B 6 MM HH'),
	rc('02', '03', '160', 'Roll bar en techo', 'DAB008', 'A.B 6 MM HH'),
	rc('02', '03', '170', 'Corona', 'DAB028', 'A.B 10 MM HH'),
	// 04 TOLVA DE PARABRISAS Y PARED DE FUEGO
	rc('02', '04', '190', 'Proteccion de resaque de camara de parabrisas', 'DAB028', 'A.B 10 MM HH'),
	rc('02', '04', '200', '1er marco de parabrisas', 'DAB028', 'A.B 10 MM HH'),
	rc('02', '04', '210', '2do marco de parabrisas', 'DAB008', 'A.B 6 MM HH'),
	rc('02', '04', '220', 'Toldo de parabrisas', 'DAB028', 'A.B 10 MM HH'),
	rc('02', '04', '230', 'Tolva inferior de parabrisas', 'DAB028', 'A.B 10 MM HH'),
	rc('02', '04', '240', 'Pared de fuego', 'DAB069', 'A.B. 10 MM HH Y 6 MM HH'),
	rc('02', '04', '250', 'Entrada de Aire a Sistema de A/C', 'DAB028', 'A.B 10 MM HH'),
	// 05 POSTES, BISELES Y PISO
	rc('02', '05', '280', 'Poste A inferior', 'DAB028', 'A.B 10 MM HH'),
	rc('02', '05', '290', 'Poste A superior', 'DAB028', 'A.B 10 MM HH'),
	rc('02', '05', '301', 'Poste B y C', 'DAB028', 'A.B 10 MM HH'),
	rc('02', '05', '310', 'Laterales interiores en postes', 'DAB008', 'A.B 6 MM HH'),
	rc('02', '05', '320', 'Correderas de cinturon en poste B', 'DAB028', 'A.B 10 MM HH'),
	rc('02', '05', '340', 'Caja de cinturones y trampas', 'DAB028', 'A.B 10 MM HH'),
	rc('02', '05', '350', 'Biseles de cristales en postes', 'DAB008', 'A.B 6 MM HH'),
	rc('02', '05', '362', 'Traslape en marco de postes', 'DAB028', 'A.B 10 MM HH'),
	rc('02', '05', '370', 'Proteccion en piso', 'DST003', 'MANTA ANTIFRAGMENTACION 2 DM51'),
	rc('02', '05', '380', 'Costados de piso', 'DAB031', 'A.B 3 MM'),
	// 06 PUERTAS
	rc('02', '06', '390', 'Puertas delanteras', 'DAB028', 'A.B 10 MM HH'),
	rc('02', '06', '400', 'Puertas traseras', 'DAB028', 'A.B 10 MM HH'),
	rc('02', '06', '410', 'Perímetro de puertas', 'DAB076', 'A.B. 4 MM Y 6 MM HH'),
	rc('02', '06', '440', 'Traslape de cristal en area de espejo', 'DAB028', 'A.B 10 MM HH'),
	rc('02', '06', '460', 'Traslapes corridos', 'DAB028', 'A.B 10 MM HH'),
	rc('02', '06', '480', 'Tirantes en puertas delanteras', 'DST015', 'NYLON DE 2" CUBIERTOS DE PIEL'),
	rc('02', '06', '490', 'Tirantes en puertas traseras', 'DST015', 'NYLON DE 2" CUBIERTOS DE PIEL'),
	rc('02', '06', '491', 'Presurizador en puertas', 'DPR016', 'PRESURIZADOR EN PUERTAS'),
	rc('02', '06', '500', 'Contrachapas', 'DAB031', 'A.B 3 MM'),
	rc('02', '06', '504', 'Bisagras', 'DBS001', 'BISAGRAS REFORZADAS DISEÑO TPS'),
	rc('02', '06', '520', 'Contrabisagras', 'DAB008', 'A.B 6 MM HH'),
	// 07 DIVISORIO / MAMPARA / RESPALDO
	rc('02', '07', '540', 'Conchas interiores', 'DAB028', 'A.B 10 MM HH'),
	rc('02', '07', '550', 'Division 2da fila', 'DAB028', 'A.B 10 MM HH'),
	rc('02', '07', '552', 'Marco de division', 'DAB028', 'A.B 10 MM HH'),
	rc('02', '07', '553', 'Marco soporte de division', 'DAB008', 'A.B 6 MM HH'),
	// 08 PROTECCION DE MOTOR / PERIFERIA
	rc('02', '08', '590', 'Defensas delanteras', 'DAB031', 'A.B 3 MM'),
	rc('02', '08', '600', 'Defensas traseras', 'DAB031', 'A.B 3 MM'),
	rc('02', '08', '610', 'Polveras delanteras', 'DAB008', 'A.B 6 MM HH'),
	rc('02', '08', '620', 'Proteccion de lineas de clima', 'DAB091', 'PROTEGIDO POR COFRE'),
	rc('02', '08', '630', 'Proteccion de booster', 'DAB091', 'PROTEGIDO POR COFRE'),
	rc('02', '08', '632', 'Proteccion arnes principal', 'DAB091', 'PROTEGIDO POR COFRE'),
	rc('02', '08', '640', 'Proteccion de computadora maestra', 'DAB008', 'A.B 6 MM HH'),
	rc('02', '08', '650', 'Proteccion de caja de fusibles', 'DAB091', 'PROTEGIDO POR COFRE'),
	rc('02', '08', '660', 'Proteccion de bateria', 'DAB091', 'PROTEGIDO POR COFRE'),
	rc('02', '08', '661', 'Proteccion de cofre', 'DAB072', 'A.B. 5 MM HH'),
	// 03 BLINDAJE TRANSPARENTE / 10
	rc('03', '10', '780', 'Espesor de cristales', 'DEC021', '67 MM'),
	rc('03', '10', '790', 'Parabrisas', 'DCT002', 'TONO CLARO'),
	rc('03', '10', '800', 'Cristales de puertas delanteras', 'DCT002', 'TONO CLARO'),
	rc('03', '10', '810', 'Cristales de puertas traseras', 'DCT011', 'TONO AL 14%'),
	rc('03', '10', '830', 'Inserto division', 'DCT002', 'TONO CLARO'),
	rc('03', '10', '840', 'Recorrido cristal delantero izquierdo', 'DRC124', 'LO MAXIMO POSIBLE'),
	rc('03', '10', '850', 'Recorrido cristal delantero derecho', 'DRC124', 'LO MAXIMO POSIBLE'),
	// 04 EQUIPO PERFORMANCE / 11
	rc('04', '11', '860', 'Rodado Seguro', 'DEP057', '5 FLAT OVER'),
	rc('04', '11', '890', 'Gato hidraulico', 'DEP010', 'GATO HIDRAULICO 12 TONELADAS'),
	rc('04', '11', '910', 'Barra estabilizadora trasera', 'DEP051', 'REFORZADO'),
	rc('04', '11', '920', 'Amortiguadores delanteros', 'DEP037', 'REFORZADOS'),
	rc('04', '11', '930', 'Amortiguadores traseros', 'DEP037', 'REFORZADOS'),
	rc('04', '11', '940', 'Resortes delanteros', 'DEP037', 'REFORZADOS'),
	rc('04', '11', '950', 'Resortes traseros', 'DEP037', 'REFORZADOS')
];

const spvSuburban: SpecificationV2 = {
	id: 'spv-real-suburban-b7',
	code: 'B-SBN-000-MD-182',
	brand: 'Chevrolet',
	model: 'Suburban Comun',
	year: '2022 UP',
	armorLevel: 'B7_plus',
	designType: 'alto_volumen',
	version: 8,
	status: 'autorizada',
	producto: 'BLINDAJE CHEVROLET SUBURBAN B7 PLUS DIV 2DA FILA 2022 UP',
	disenoBlindaje: 'DIV 2DA FILA',
	planta: 'PLANTA 1',
	diasFabricacion: '120 DIAS HABILES SEGUN PROGRAMACION',
	comentariosIngenieria: [
		'PRESURIZADORES DE APOYO EN LAS 4 PUERTAS',
		'LÍNEAS DE FRENO ACERADAS',
		'CAMBIO DE LIQUIDO DE FRENOS A DOT 5.1',
		'EMPAQUE DE PUERTAS CON RELLENO DE 1/4"',
		'VIN EN TABLERO PARTE ORIGINAL',
		'DEFENSA REFUERZO ANTIBARRICADA CHASIS',
		'CÓDIGO AZUL Y ROJO EN PARRILLA Y EN MEDALLON (1 DE CADA UNO)',
		'SISTEMA SUPRESOR DE FUEGO CON 8 ESPREAS: 2 ESPREAS EN MOTOR, 2 EN AREA DE CARGO Y UNA EN CADA LODERA',
		'JALADERAS DE PUERTAS LATERALES REFORZADAS DE ALUMINIO',
		'MOLDURAS CROMADAS ORIGINALES EN MARCOS EXTERIORES DE CRISTALES',
		'CAMBIO DE TACONES DE CARROCERÍA - TODOS ROJOS',
		'APERTURA Y CIERRE DE COMPUERTA DE ESCAPE CON PRESURIZADORES',
		'ADAPTADORES DELANTEROS Y TRASEROS PARA 8 BIRLOS (BIRLOS M14 X 1.5 GRADO 10.9)',
		'BIRLOS DE LLANTAS ORIGINALES (M14 X 1.5 X80 MAQUINADO D)',
		'RIN 20" POLISHED BLACK (84830459) CON COPA GMC (84465267)',
		'LLANTA 285/60 R20 125/122S CONTINENTAL TARRAIN CONTACT HT LRE',
		'CAMBIO DE DEFLECTORES Y CALIPERS DELANTEROS Y TRASEROS BREMBO',
		'CAMBIAR TORNILLO Y TUERCA ORIGINALES DEL DIFERENCIAL TRASERO POR LOS SIGUIENTES: TORNILLO (TRTFG18100) Y TUERCA (TRTF1825)',
		'REFUERZO DE CHASIS',
		'REFUERZO DE PUENTE INFERIOR PARA USO DE GATO',
		'APERTURA MANUAL EN 5TA PUERTA DESDE EL INTERIOR',
		'MANIJAS EN POSTES B OPERABLES',
		'SE CANCELA QUEMACOCOS',
		'SE ELIMINAN ASIENTOS DE 3RA FILA',
		'TACONES DE ALUMINIO',
		'REUBICACIÓN DE BOCINAS EN PUERTAS',
		'SUSPENSIÓN FOX NO APLICA BARRA ESTABILIZADORA DELANTERA',
		'AUMENTOS EN AMORTIGUADORES DELANTEROS Y TRASEROS FOX.',
		'SISTEMA DE ABASTECIMIENTO DE AIRE LIMPIO',
		'EXTINTOR MANUAL EN RESPALDO DE LA DIVISIÓN, DETRAS DE ASIENTO IZQUIERDO DE 2° FILA',
		'POLARIZADO DE SEGURIDAD EN CUARTOS Y MEDALLON',
		'ESTROBOS',
		'SALIDA DE EMERGENCIA EN RESPALDO',
		'ETIQUETAS E IDENTIFICADORES (ID: BRAKE, EXIT, FIRE SUPRESOR, PULL TO OPEN / ETIQUETAS: FIRE SUPRESOR, FLASH MODE, STROBES LIGHTS)',
		'CAMBIAR HORQUILLAS INFERIORES DELANTERAS',
		'INSTALACIÓN DE SUPER CARGADOR'
	],
	accesoriosEstandar: [
		{ code: 'K-ADO-COD-ESTR-INT', description: 'KIT ARMADO CÓDIGOS, ESTROBOS E INTERCOMUNICADOR' },
		{ code: 'K-SUPR-INC-GMC-B7', description: 'KIT SISTEMA SUPRESOR DE INCENDIOS GMC B7' },
		{ code: 'K-AB-AIRE-LMP-GMC-B7', description: 'KIT SISTEMA ABASTECIMIENTO DE AIRE LIMPIO GMC B7' },
		{ code: 'K-ADO-BAT-SPR-CARG', description: 'KIT ARMADO BATERIA SUPER CARGADOR SUBURBAN TACTICA C/MAMPARA 2025 UP' }
	],
	accesoriosOpcionales: [
		{ code: 'K-VID-SUB-DIV-2F-B7', description: 'KIT VIDRIOS ISOCLIMA SUBURBAN DIVISION 2DA FILA N-B7' },
		{ code: 'K-GAS-CHILE', description: 'KIT SISTEMA DE GAS CHILE' },
		{ code: 'K-INST-CAJA-CLAV', description: 'KIT INSTALACION CAJA DE CLAVOS' }
	],
	components: suburbanComponents,
	authorizations: [
		{ department: 'Elaboro', status: 'autorizado', authorizedBy: 'ALAN T. / JOSELIN B. / ING JULIO RDZ', authorizedAt: '2026-02-06', notes: '' },
		{ department: 'Gerente General', status: 'autorizado', authorizedBy: 'ENRIQUE HERRERA', authorizedAt: '2026-02-06', notes: '' },
		{ department: 'Gerente de Ingenieria', status: 'autorizado', authorizedBy: 'ING. JUAN CARLOS ACOSTA', authorizedAt: '2026-02-06', notes: '' },
		{ department: 'Gerente de Calidad / Ingenieria', status: 'autorizado', authorizedBy: 'ING. EDGARDO LOERA', authorizedAt: '2026-02-06', notes: '' },
		{ department: 'Validacion de Materiales Balisticos', status: 'autorizado', authorizedBy: 'LIC. ABIGAIL HERNANDEZ', authorizedAt: '2026-02-06', notes: 'Materiales aprobados' },
		{ department: 'Gerente de Produccion', status: 'autorizado', authorizedBy: 'ING. DIEGO TAMEZ', authorizedAt: '2026-02-06', notes: '' },
		{ department: 'Planeacion y Ctrl de Prod', status: 'autorizado', authorizedBy: 'ING. FELIPE CALDERON', authorizedAt: '2026-02-06', notes: '' }
	],
	revisions: [
		rev(1, 'Ingenieria TPS', '2024-09-01', 'Creacion inicial'),
		rev(8, 'Ingenieria TPS', '2026-02-06', 'A) En proteccion de computadora se cambia protegida por cofre por A.B 6 MM. B) Se actualizan comentarios de ingenieria')
	],
	notes: 'Especificacion real de referencia importada del formato TPS (config. B-SBN-000-MD-182).',
	createdAt: '2024-09-01',
	updatedAt: '2026-02-06',
	createdBy: 'u3'
};

const specifications: SpecificationV2[] = [
	spvReal,
	spvSuburban,
	{
		id: 'spv1',
		code: 'ESPV2-LC300-NIII-2025',
		brand: 'Toyota',
		model: 'Land Cruiser 300',
		year: '2022-2025',
		armorLevel: 'NIII',
		designType: 'alto_volumen',
		version: 2,
		status: 'autorizada',
		components: spec1Components,
		authorizations: [
			{ department: 'Ingenieria', status: 'autorizado', authorizedBy: 'Roberto Silva', authorizedAt: '2025-05-02', notes: '' },
			{ department: 'Calidad', status: 'autorizado', authorizedBy: 'Sofia Morales', authorizedAt: '2025-05-03', notes: '' },
			{ department: 'Manufactura', status: 'autorizado', authorizedBy: 'Laura Garcia', authorizedAt: '2025-05-03', notes: '' },
			{ department: 'Direccion Tecnica', status: 'autorizado', authorizedBy: 'Carlos Mendoza', authorizedAt: '2025-05-05', notes: 'Liberada para serie' }
		],
		revisions: [rev(1, 'Roberto Silva', '2025-01-20', 'Creacion inicial'), rev(2, 'Roberto Silva', '2025-05-01', 'Ajuste de cristales y pesos')],
		notes: 'Especificacion base de alto volumen.',
		createdAt: '2025-01-20',
		updatedAt: '2025-05-05',
		createdBy: 'u3'
	},
	{
		id: 'spv2',
		code: 'ESPV2-SUBURBAN-NIV-2025',
		brand: 'Chevrolet',
		model: 'Suburban',
		year: '2021-2025',
		armorLevel: 'NIV',
		designType: 'alto_volumen',
		version: 1,
		status: 'en_revision',
		components: spec2Components,
		authorizations: [
			{ department: 'Ingenieria', status: 'autorizado', authorizedBy: 'Roberto Silva', authorizedAt: '2025-06-02', notes: '' },
			{ department: 'Calidad', status: 'pendiente', authorizedBy: null, authorizedAt: null, notes: '' },
			{ department: 'Manufactura', status: 'pendiente', authorizedBy: null, authorizedAt: null, notes: '' },
			{ department: 'Direccion Tecnica', status: 'pendiente', authorizedBy: null, authorizedAt: null, notes: '' }
		],
		revisions: [rev(1, 'Roberto Silva', '2025-06-01', 'Creacion inicial')],
		notes: '',
		createdAt: '2025-06-01',
		updatedAt: '2025-06-02',
		createdBy: 'u3'
	},
	{
		id: 'spv3',
		code: 'ESPV2-MAMBA-V-2025',
		brand: 'TPS',
		model: 'Mamba',
		year: '2024-2025',
		armorLevel: 'NV',
		designType: 'tactico',
		version: 1,
		status: 'borrador',
		components: [
			c('01', '01', '5', 'ALACRAN', 'Configuracion tactica 5 pasajeros'),
			c('02', '03', '150', 'Blindaje en techo', '12mm acero balistico', 'sa10', 6)
		],
		authorizations: [
			{ department: 'Ingenieria', status: 'pendiente', authorizedBy: null, authorizedAt: null, notes: '' },
			{ department: 'Calidad', status: 'pendiente', authorizedBy: null, authorizedAt: null, notes: '' },
			{ department: 'Manufactura', status: 'pendiente', authorizedBy: null, authorizedAt: null, notes: '' },
			{ department: 'Direccion Tecnica', status: 'pendiente', authorizedBy: null, authorizedAt: null, notes: '' }
		],
		revisions: [rev(1, 'Fernando Diaz', '2025-06-10', 'Creacion inicial')],
		notes: 'Vehiculo tactico en desarrollo.',
		createdAt: '2025-06-10',
		updatedAt: '2025-06-10',
		createdBy: 'u9'
	}
];

export function createInitialSpecV2State(): SpecV2State {
	return {
		specArticles,
		specifications,
		lastUpdated: new Date().toISOString()
	};
}
