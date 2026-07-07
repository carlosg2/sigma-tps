/* ============================================================
   BLINDADOS PREMIUM — app.js
   GAP-RNT-001 Cotizador + GAP-RNT-003 Compliance/Stop-Gate
   ============================================================ */
'use strict';

// ─── CATÁLOGOS DEMO ─────────────────────────────────────────
const VEHICULOS = [
  {
    vin: 'VIN-AX90',
    modelo: 'Mercedes S600 Guard VR7+',
    nivel: 'VR7+',
    tarifa: 22000,
    // Mismo fotógrafo (mintosko), misma sesión, mismo Mercedes negro AMG Clase S
    fotos: [
      'https://images.unsplash.com/photo-1629019879059-2a0345f93aea?w=900&q=85',
      'https://images.unsplash.com/photo-1629019879070-11fceb18ed61?w=900&q=85',
      'https://images.unsplash.com/photo-1629019878464-5a7ef877716f?w=900&q=85',
    ],
    // periodos ocupados demo: { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD', tipo: 'occupied'|'maintenance' }
    ocupacion: [
      { start: offsetDate(5),  end: offsetDate(8),  tipo: 'occupied' },
      { start: offsetDate(15), end: offsetDate(17), tipo: 'maintenance' },
    ],
  },
  {
    vin: 'VIN-BM11',
    modelo: 'BMW 760Li Protect',
    nivel: 'VR6',
    tarifa: 19500,
    // BMW M3 negro confirmado — 3 fotógrafos distintos, mismo modelo y color
    fotos: [
      'https://images.unsplash.com/photo-1627936354732-ffbe552799d8?w=900&q=85',
      'https://images.unsplash.com/photo-1610099610040-ab19f3a5ec35?w=900&q=85',
      'https://images.unsplash.com/photo-1638980703460-8e542eb75007?w=900&q=85',
    ],
    ocupacion: [
      { start: offsetDate(2),  end: offsetDate(4),  tipo: 'occupied' },
      { start: offsetDate(20), end: offsetDate(22), tipo: 'occupied' },
    ],
  },
  {
    vin: 'VIN-CH33',
    modelo: 'Cadillac Escalade ESV Blindado',
    nivel: 'B6',
    tarifa: 15000,
    // Mismo fotógrafo (Rana Singh, Atlanta GA), mismo día 6-ene-2026, mismo Cadillac Escalade negro
    fotos: [
      'https://images.unsplash.com/photo-1767749995450-7b63ab7cd4fd?w=900&q=85',
      'https://images.unsplash.com/photo-1767749995462-9fe0890d5960?w=900&q=85',
      'https://images.unsplash.com/photo-1767749995458-b0927324e4d0?w=900&q=85',
    ],
    ocupacion: [
      { start: offsetDate(10), end: offsetDate(12), tipo: 'maintenance' },
    ],
  },
];

const EXTRAS = [
  { id: 'conductor',   label: 'Conductor certificado',  precio: 3500 },
  { id: 'escolta',     label: 'Escolta armado',          precio: 5000 },
  { id: 'km_extra',   label: 'Kilometraje adicional (500 km)', precio: 1200 },
  { id: 'rastreo',    label: 'Rastreo satelital activo', precio: 800  },
  { id: 'seguro_ext', label: 'Seguro extenso viaje',    precio: 2500 },
  { id: 'lavado',     label: 'Lavado/Detailing salida', precio: 600  },
];

const DOCUMENTOS_OBLIGATORIOS = [
  'Acta constitutiva',
  'Poder legal notariado',
  'Comprobante de domicilio (máx. 3 meses)',
  'Estados de cuenta (últimos 3)',
  'Referencias comerciales (mín. 2)',
  'Actas de asamblea relevantes',
  'Identificaciones con poderes (2 representantes)',
];

const LISTA_NEGRA = ['Riesgo Total SA', 'Fraude Global LLC', 'Cliente Vetado 99'];

// ─── ESTADO GLOBAL ──────────────────────────────────────────
let state = buildInitialState();

function buildInitialState() {
  return {
    cotizaciones: [],        // cotizaciones guardadas
    cotizacionActiva: null,  // folio activo en flujo
    version: 1,
    calFotoIdx: {},           // índice de foto por VIN
    calMonth: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    calSelStart: null,
    calSelEnd: null,
    occupancyVIN: null,
    occupancyMonth: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    compliance: {},           // keyed by folio
  };
}

// ─── HELPERS ────────────────────────────────────────────────
function offsetDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function fmtMXN(n) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n || 0);
}

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso + 'T00:00:00').toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

function nowStr() {
  return new Date().toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function generateFolio() {
  const n = String(state.cotizaciones.length + 1).padStart(4, '0');
  return `RNT-${n}`;
}

function getVehiculo(vin) { return VEHICULOS.find(v => v.vin === vin) || null; }

function isDateInRange(dateStr, start, end) {
  return dateStr >= start && dateStr <= end;
}

function isVinOccupied(vin, startStr, endStr) {
  const v = getVehiculo(vin);
  if (!v || !startStr || !endStr) return false;
  // check existing cotizaciones
  const conflicto = state.cotizaciones.find(c =>
    c.vin === vin &&
    c.folio !== state.cotizacionActiva &&
    c.fechaInicio && c.fechaFin &&
    !(endStr < c.fechaInicio || startStr > c.fechaFin)
  );
  if (conflicto) return { tipo: 'cotizacion', folio: conflicto.folio };
  // check demo schedule
  const ocupado = v.ocupacion.find(o => !(endStr < o.start || startStr > o.end));
  if (ocupado) return { tipo: ocupado.tipo };
  return false;
}

function getDayStatus(vin, dateStr) {
  if (!vin) return 'available';
  const v = getVehiculo(vin);
  if (!v) return 'available';
  for (const o of v.ocupacion) {
    if (isDateInRange(dateStr, o.start, o.end)) return o.tipo;
  }
  for (const c of state.cotizaciones) {
    if (c.vin === vin && c.fechaInicio && c.fechaFin) {
      if (isDateInRange(dateStr, c.fechaInicio, c.fechaFin)) return 'occupied';
    }
  }
  return 'available';
}

function getExtrasSeleccionados() {
  return EXTRAS.filter(e => {
    const cb = document.querySelector(`#extras-list .extra-item[data-id="${e.id}"] input`);
    return cb && cb.checked;
  });
}

function calcTotal(dias, tarifa, extras) {
  const baseTotal = dias * tarifa;
  const extrasTotal = extras.reduce((s, e) => s + e.precio * dias, 0);
  return { baseTotal, extrasTotal, total: baseTotal + extrasTotal };
}

// ─── TOAST ──────────────────────────────────────────────────
let toastTimer = null;
function toast(msg, tipo = 'info') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast show ${tipo}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.className = 'toast'; }, 3800);
}

// ─── KPIs ───────────────────────────────────────────────────
function refreshKPIs() {
  const total = VEHICULOS.length;
  const hoy = new Date().toISOString().slice(0, 10);
  const ocupadosHoy = VEHICULOS.filter(v => getDayStatus(v.vin, hoy) !== 'available').length;
  const disponibles = total - ocupadosHoy;

  document.getElementById('kpi-disponibilidad').textContent =
    total ? Math.round((disponibles / total) * 100) + '%' : '0%';
  document.getElementById('kpi-utilizacion').textContent =
    total ? Math.round((ocupadosHoy / total) * 100) + '%' : '0%';

  const pipeline = state.cotizaciones.reduce((s, c) => s + (c.total || 0), 0);
  document.getElementById('kpi-valor').textContent = fmtMXN(pipeline);

  // riesgo compliance
  const pendientes = state.cotizaciones.filter(c => {
    const comp = state.compliance[c.folio];
    return !comp || comp.liberacion !== 'Liberada';
  });
  const riesgoEl = document.getElementById('kpi-riesgo');
  if (pendientes.length === 0) { riesgoEl.textContent = 'Bajo'; riesgoEl.className = 'pulse-value'; }
  else if (pendientes.length <= 2) { riesgoEl.textContent = 'Medio'; riesgoEl.className = 'pulse-value warn'; }
  else { riesgoEl.textContent = 'Alto'; riesgoEl.className = 'pulse-value danger'; }

  refreshFlowKPI();
}

// ─── FLOW CONTROL ───────────────────────────────────────────
const FLOW_STEPS = [
  { id: 'cliente',        label: 'Cliente seleccionado' },
  { id: 'vin',            label: 'Unidad seleccionada' },
  { id: 'fechas',         label: 'Fechas capturadas' },
  { id: 'disponibilidad', label: 'Disponibilidad validada' },
  { id: 'total',          label: 'Total calculado' },
  { id: 'guardada',       label: 'Cotización guardada' },
  { id: 'antifraude',     label: 'Antifraude verificado' },
  { id: 'expediente',     label: 'Expediente completo' },
  { id: 'calidad',        label: 'Calidad aprobada' },
  { id: 'liberacion',     label: 'Unidad liberada' },
];

function getFlowStatus() {
  const cot = state.cotizacionActiva
    ? state.cotizaciones.find(c => c.folio === state.cotizacionActiva)
    : null;
  const comp = cot ? (state.compliance[cot.folio] || {}) : {};

  return {
    cliente:        !!(cot && cot.cliente),
    vin:            !!(cot && cot.vin),
    fechas:         !!(cot && cot.fechaInicio && cot.fechaFin),
    disponibilidad: !!(cot && cot.disponibilidadOk),
    total:          !!(cot && cot.total > 0),
    guardada:       !!cot,
    antifraude:     comp.antifraude === 'Limpio',
    expediente:     comp.expediente === 'Completo',
    calidad:        comp.calidad === 'Aprobado',
    liberacion:     comp.liberacion === 'Liberada',
  };
}

function refreshFlowUI() {
  // Solo actualiza si el modal compliance está visible
  const modalVisible = document.getElementById('compliance-modal').getAttribute('aria-hidden') !== 'true';
  if (!modalVisible) { refreshFlowKPI(); return; }

  const folio = activeComplianceFolio || state.cotizacionActiva;
  const cot   = folio ? state.cotizaciones.find(c => c.folio === folio) : null;
  const comp  = folio ? (state.compliance[folio] || {}) : {};
  const status = {
    cliente:        !!(cot && cot.cliente),
    vin:            !!(cot && cot.vin),
    fechas:         !!(cot && cot.fechaInicio && cot.fechaFin),
    disponibilidad: !!(cot && cot.disponibilidadOk),
    total:          !!(cot && cot.total > 0),
    guardada:       !!cot,
    antifraude:     comp.antifraude === 'Limpio',
    expediente:     comp.expediente === 'Completo',
    calidad:        comp.calidad === 'Aprobado',
    liberacion:     comp.liberacion === 'Liberada',
  };

  const steps = FLOW_STEPS;
  const done  = steps.filter(s => status[s.id]).length;
  const pct   = Math.round((done / steps.length) * 100);

  document.getElementById('flow-progress-fill').style.width = pct + '%';
  document.getElementById('flow-progress-percent').textContent = pct + '%';
  document.getElementById('flow-progress-count').textContent = `${done}/${steps.length} pasos`;

  const container = document.getElementById('flow-checklist');
  container.innerHTML = steps.map(s => {
    const ok = status[s.id];
    return `<span class="flow-step ${ok ? 'done' : ''}">
      <span class="step-icon">${ok ? '✅' : '⬜'}</span> ${s.label}
    </span>`;
  }).join('');

  // siguiente paso
  const next = steps.find(s => !status[s.id]);
  document.getElementById('flow-next-step').textContent =
    next ? `→ Próximo paso: ${next.label}` : '✅ Flujo completado. Unidad lista para salida.';

  refreshFlowKPI();
}

function refreshFlowKPI() {
  // pulse-big fue removido; no hay elementos KPI de flujo que actualizar
}

// ─── CALENDARIO DE RESERVA ──────────────────────────────────
const WEEKDAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function renderCalendar(gridId, weekdaysId, labelId, month, vin, selStart, selEnd, onDayClick) {
  const wdEl = document.getElementById(weekdaysId);
  if (wdEl) wdEl.innerHTML = WEEKDAYS.map(d => `<span class="cal-weekday">${d}</span>`).join('');

  document.getElementById(labelId).textContent =
    `${MESES[month.getMonth()]} ${month.getFullYear()}`;

  const grid = document.getElementById(gridId);
  grid.innerHTML = '';

  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const lastDay  = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  // Lunes=0 offset
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  const today = new Date().toISOString().slice(0, 10);

  // Celdas vacías
  for (let i = 0; i < startOffset; i++) {
    const el = document.createElement('div');
    el.className = 'cal-day empty';
    grid.appendChild(el);
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const dateStr = `${month.getFullYear()}-${String(month.getMonth()+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const dayStatus = vin ? getDayStatus(vin, dateStr) : 'available';

    let cls = 'cal-day ' + dayStatus;
    if (selStart && selEnd && dateStr > selStart && dateStr < selEnd) cls += ' in-range';
    if (dateStr === selStart || dateStr === selEnd) cls += ' selected';
    if (dateStr === today) cls += ' today';

    const el = document.createElement('div');
    el.className = cls;
    el.textContent = d;
    el.dataset.date = dateStr;

    if (dayStatus === 'available' && onDayClick) {
      el.addEventListener('click', () => onDayClick(dateStr));
    }
    grid.appendChild(el);
  }
}

function renderBookingCalendar() {
  const vin = document.getElementById('vin-select').value;
  renderCalendar(
    'booking-calendar-grid',
    'calendar-weekdays',
    'calendar-month-label',
    state.calMonth,
    vin,
    state.calSelStart,
    state.calSelEnd,
    (dateStr) => {
      if (!state.calSelStart || (state.calSelStart && state.calSelEnd)) {
        state.calSelStart = dateStr;
        state.calSelEnd = null;
      } else {
        if (dateStr <= state.calSelStart) {
          state.calSelStart = dateStr;
          state.calSelEnd = null;
        } else {
          state.calSelEnd = dateStr;
          // propagate to form
          const fi = document.getElementById('fecha-inicio');
          const ff = document.getElementById('fecha-fin');
          const hs = document.getElementById('cal-time-start').value || '09:00';
          const he = document.getElementById('cal-time-end').value || '18:00';
          fi.value = `${state.calSelStart}T${hs}`;
          ff.value = `${state.calSelEnd}T${he}`;
          autoDias();
        }
      }
      renderBookingCalendar();
      updateCalSummary();
    }
  );
  updateCalSummary();
}

function updateCalSummary() {
  const el = document.getElementById('calendar-selection-summary');
  if (!state.calSelStart) { el.textContent = 'Selecciona fecha inicio y fin.'; return; }
  if (!state.calSelEnd)   { el.textContent = `Inicio: ${fmtDate(state.calSelStart)} — selecciona fecha fin.`; return; }
  const dias = Math.max(1, Math.ceil((new Date(state.calSelEnd) - new Date(state.calSelStart)) / 86400000));
  el.textContent = `Del ${fmtDate(state.calSelStart)} al ${fmtDate(state.calSelEnd)} — ${dias} día(s)`;
}

function autoDias() {
  const fi = document.getElementById('fecha-inicio').value;
  const ff = document.getElementById('fecha-fin').value;
  if (fi && ff) {
    const d = Math.max(1, Math.ceil((new Date(ff) - new Date(fi)) / 86400000));
    document.getElementById('dias-estimados').value = d;
  }
}

// ─── EXTRAS ─────────────────────────────────────────────────
function renderExtras() {
  const container = document.getElementById('extras-list');
  container.innerHTML = EXTRAS.map(e => `
    <label class="extra-item" data-id="${e.id}">
      <input type="checkbox" data-id="${e.id}" />
      <span>${e.label}</span>
      <span class="extra-price">${fmtMXN(e.precio)}/día</span>
    </label>
  `).join('');
  container.querySelectorAll('input[type=checkbox]').forEach(cb => {
    cb.addEventListener('change', () => {
      cb.closest('.extra-item').classList.toggle('selected', cb.checked);
    });
  });
}

// ─── VEHÍCULO PREVIEW ───────────────────────────────────────
function renderVehiclePreview(vin) {
  const v = getVehiculo(vin);
  const idx = state.calFotoIdx[vin] || 0;
  const fotoEl = document.getElementById('vehiculo-foto');
  const modeloEl = document.getElementById('vehiculo-modelo');
  const vinEl = document.getElementById('vehiculo-vin');
  const cntEl = document.getElementById('vehiculo-foto-contador');
  const thumbsEl = document.getElementById('vehiculo-thumbs');
  const dispEl = document.getElementById('vehiculo-disponibilidad');

  if (!v) {
    fotoEl.src = '';
    modeloEl.textContent = 'Sin selección';
    vinEl.textContent = 'VIN —';
    cntEl.textContent = '0/0';
    thumbsEl.innerHTML = '';
    dispEl.textContent = 'Disponibilidad pendiente';
    dispEl.className = 'vehicle-chip';
    document.getElementById('tarifa-base').value = 18000;
    return;
  }

  fotoEl.src = v.fotos[idx] || '';
  modeloEl.textContent = v.modelo;
  vinEl.textContent = `VIN: ${v.vin} | Nivel: ${v.nivel}`;
  cntEl.textContent = `${idx + 1}/${v.fotos.length}`;
  document.getElementById('tarifa-base').value = v.tarifa;

  thumbsEl.innerHTML = v.fotos.map((f, i) =>
    `<img src="${f}" class="vehicle-thumb ${i === idx ? 'active' : ''}" data-idx="${i}" alt="foto ${i+1}" />`
  ).join('');
  thumbsEl.querySelectorAll('.vehicle-thumb').forEach(img => {
    img.addEventListener('click', () => {
      state.calFotoIdx[vin] = parseInt(img.dataset.idx);
      renderVehiclePreview(vin);
    });
  });

  const hoy = new Date().toISOString().slice(0, 10);
  const stat = getDayStatus(vin, hoy);
  if (stat === 'available') { dispEl.textContent = '✅ Disponible hoy'; dispEl.className = 'vehicle-chip available'; }
  else if (stat === 'occupied') { dispEl.textContent = '🔴 Ocupada hoy'; dispEl.className = 'vehicle-chip occupied'; }
  else { dispEl.textContent = '⚠ En mantenimiento'; dispEl.className = 'vehicle-chip blocked'; }
}

// ─── TABLA FLOTA ────────────────────────────────────────────
function renderTablaFlota() {
  const tbody = document.getElementById('tabla-flota');
  const fi = document.getElementById('fecha-inicio').value?.slice(0, 10);
  const ff = document.getElementById('fecha-fin').value?.slice(0, 10);
  const hoy = new Date().toISOString().slice(0, 10);

  tbody.innerHTML = VEHICULOS.map(v => {
    const estadoHoy = getDayStatus(v.vin, hoy);
    const badgeHoy = estadoHoy === 'available'
      ? '<span class="badge badge-success">Disponible</span>'
      : estadoHoy === 'occupied'
        ? '<span class="badge badge-danger">Ocupada</span>'
        : '<span class="badge badge-warn">Mantenimiento</span>';

    let periodoCell = '—';
    if (fi && ff) {
      const conflict = isVinOccupied(v.vin, fi, ff);
      periodoCell = conflict
        ? `<span class="badge badge-danger">Conflicto${conflict.folio ? ' ('+conflict.folio+')' : ''}</span>`
        : '<span class="badge badge-success">Libre en periodo</span>';
    }

    return `<tr>
      <td><strong>${v.modelo}</strong><br><small style="color:var(--text-muted)">${v.vin}</small></td>
      <td><img src="${v.fotos[0]}" style="width:54px;height:36px;object-fit:cover;border-radius:4px;border:1px solid var(--border)"></td>
      <td>${badgeHoy}</td>
      <td>${periodoCell}</td>
      <td><button class="outline-btn btn-ver-ocupacion" data-vin="${v.vin}" style="font-size:.72rem;padding:4px 10px">Ver calendario</button></td>
    </tr>`;
  }).join('');

  tbody.querySelectorAll('.btn-ver-ocupacion').forEach(btn => {
    btn.addEventListener('click', () => openOccupancyModal(btn.dataset.vin));
  });
}

// ─── COTIZAR ────────────────────────────────────────────────
function buildCotizacionDraft() {
  const cliente = document.getElementById('cliente-select').value;
  const vin     = document.getElementById('vin-select').value;
  const fi      = document.getElementById('fecha-inicio').value?.slice(0,10);
  const ff      = document.getElementById('fecha-fin').value?.slice(0,10);
  const dias    = parseInt(document.getElementById('dias-estimados').value) || 1;
  const tarifa  = parseFloat(document.getElementById('tarifa-base').value) || 0;
  const extras  = getExtrasSeleccionados();
  const { baseTotal, extrasTotal, total } = calcTotal(dias, tarifa, extras);
  return { cliente, vin, fechaInicio: fi, fechaFin: ff, dias, tarifa, extras, baseTotal, extrasTotal, total };
}

function validateCotizacion(draft) {
  if (!draft.cliente) return 'Selecciona un cliente.';
  if (!draft.vin)     return 'Selecciona una unidad (VIN).';
  if (!draft.fechaInicio || !draft.fechaFin) return 'Captura las fechas de inicio y fin.';
  if (draft.fechaFin <= draft.fechaInicio) return 'La fecha fin debe ser posterior al inicio.';
  return null;
}

// ─── TABLA COTIZACIONES ────────────────────────────────────
function renderTablaCotizaciones() {
  const tbody = document.getElementById('tabla-cotizaciones');
  if (!state.cotizaciones.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:18px">Sin cotizaciones guardadas.</td></tr>`;
    return;
  }
  tbody.innerHTML = state.cotizaciones.map(c => {
    const status = getFlowStatusFor(c.folio);
    const done = Object.values(status).filter(Boolean).length;
    const pct  = Math.round((done / FLOW_STEPS.length) * 100);
    const badge = c.disponibilidadOk
      ? '<span class="badge badge-success">Disponible</span>'
      : '<span class="badge badge-warn">Sin validar</span>';

    return `<tr>
      <td><strong>${c.folio}</strong></td>
      <td>${c.cliente}</td>
      <td>${c.vin}</td>
      <td>
        <div style="display:flex;align-items:center;gap:6px">
          <div style="flex:1;height:6px;background:var(--bg-4);border-radius:99px;overflow:hidden">
            <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,var(--gold-dk),var(--gold));border-radius:99px"></div>
          </div>
          <span style="font-size:.72rem;color:var(--gold)">${pct}%</span>
        </div>
      </td>
      <td>${c.version}</td>
      <td>${fmtMXN(c.total)}</td>
      <td style="display:flex;gap:4px;flex-wrap:wrap">
        <button class="outline-btn btn-activar-cot" data-folio="${c.folio}" style="font-size:.7rem;padding:4px 8px">Abrir</button>
        <button class="outline-btn btn-compliance-cot" data-folio="${c.folio}" style="font-size:.7rem;padding:4px 8px">Compliance</button>
      </td>
    </tr>`;
  }).join('');

  tbody.querySelectorAll('.btn-activar-cot').forEach(btn => {
    btn.addEventListener('click', () => activarCotizacion(btn.dataset.folio));
  });
  tbody.querySelectorAll('.btn-compliance-cot').forEach(btn => {
    btn.addEventListener('click', () => openComplianceModal(btn.dataset.folio));
  });
}

function getFlowStatusFor(folio) {
  const cot  = state.cotizaciones.find(c => c.folio === folio);
  const comp = state.compliance[folio] || {};
  if (!cot) return {};
  return {
    cliente:        !!cot.cliente,
    vin:            !!cot.vin,
    fechas:         !!(cot.fechaInicio && cot.fechaFin),
    disponibilidad: !!cot.disponibilidadOk,
    total:          cot.total > 0,
    guardada:       true,
    antifraude:     comp.antifraude === 'Limpio',
    expediente:     comp.expediente === 'Completo',
    calidad:        comp.calidad === 'Aprobado',
    liberacion:     comp.liberacion === 'Liberada',
  };
}

function activarCotizacion(folio) {
  state.cotizacionActiva = folio;
  const cot = state.cotizaciones.find(c => c.folio === folio);
  if (!cot) return;
  // cargar en formulario
  document.getElementById('cliente-select').value = cot.cliente;
  document.getElementById('vin-select').value = cot.vin;
  document.getElementById('fecha-inicio').value = cot.fechaInicio ? cot.fechaInicio + 'T09:00' : '';
  document.getElementById('fecha-fin').value    = cot.fechaFin    ? cot.fechaFin    + 'T18:00' : '';
  document.getElementById('dias-estimados').value = cot.dias;
  document.getElementById('tarifa-base').value   = cot.tarifa;
  state.version = parseInt(cot.version.replace('v', ''));
  renderVehiclePreview(cot.vin);
  renderBookingCalendar();
  renderTablaFlota();
  updateSummary(cot);
  refreshFlowUI();
  refreshKPIs();
  toast(`Cotización ${folio} cargada (${cot.version})`, 'info');
}

function updateSummary(cot) {
  document.getElementById('version-actual').textContent = cot ? cot.version : 'v01';
  document.getElementById('total-cotizacion').textContent = cot ? fmtMXN(cot.total) : '$0.00';
  document.getElementById('estatus-disponibilidad').textContent = cot
    ? (cot.disponibilidadOk ? '✅ Disponible' : '⚠ Sin validar')
    : 'Sin validar';
  document.getElementById('estatus-disponibilidad').className = 'stat ' +
    (cot?.disponibilidadOk ? 'success' : 'muted');
  document.getElementById('estatus-cotizacion').textContent = cot
    ? (cot.total > 0 ? 'Calculada' : 'Borrador')
    : 'Borrador';
}

function renderHistorial(folio) {
  const cot = state.cotizaciones.find(c => c.folio === folio);
  const ul = document.getElementById('historial-versiones');
  if (!cot || !cot.historial) { ul.innerHTML = ''; return; }
  ul.innerHTML = cot.historial.map(h => `
    <li class="${h.version === cot.version ? 'active' : ''}">
      <span class="tl-icon">📄</span>
      <div class="tl-body">
        <p class="tl-title">${h.version} — ${fmtMXN(h.total)}</p>
        <p class="tl-meta">${h.fecha} · ${h.cliente} · ${h.vin}</p>
      </div>
    </li>
  `).join('');
}

// ─── COMPLIANCE ─────────────────────────────────────────────
function getOrCreateCompliance(folio) {
  if (!state.compliance[folio]) {
    state.compliance[folio] = {
      cliente: '',
      riesgo: 'bajo',
      antifraude: 'Pendiente',
      expediente: 'Pendiente',
      calidad: 'Sin revisar',
      liberacion: 'Bloqueada',
      documentos: DOCUMENTOS_OBLIGATORIOS.map(d => ({ nombre: d, estatus: 'Pendiente', obs: '' })),
      bitacora: [],
    };
  }
  return state.compliance[folio];
}

function renderTablaDocumentos(folio) {
  const comp = getOrCreateCompliance(folio);
  const tbody = document.getElementById('tabla-documentos');
  tbody.innerHTML = comp.documentos.map((doc, i) => {
    const badgeCls = doc.estatus === 'Validado' ? 'badge-success'
      : doc.estatus === 'Rechazado' ? 'badge-danger'
      : doc.estatus === 'Recibido'  ? 'badge-info'
      : 'badge-muted';
    return `<tr>
      <td>${doc.nombre}</td>
      <td>
        <select class="doc-estatus-sel" data-idx="${i}">
          <option ${doc.estatus==='Pendiente'?'selected':''}>Pendiente</option>
          <option ${doc.estatus==='Recibido'?'selected':''}>Recibido</option>
          <option ${doc.estatus==='Validado'?'selected':''}>Validado</option>
          <option ${doc.estatus==='Observaciones'?'selected':''}>Observaciones</option>
          <option ${doc.estatus==='Rechazado'?'selected':''}>Rechazado</option>
        </select>
      </td>
      <td><input type="text" class="doc-obs-inp" data-idx="${i}" value="${doc.obs}" placeholder="Notas..." /></td>
    </tr>`;
  }).join('');

  tbody.querySelectorAll('.doc-estatus-sel').forEach(sel => {
    sel.addEventListener('change', () => {
      comp.documentos[sel.dataset.idx].estatus = sel.value;
      checkExpediente(folio);
    });
  });
  tbody.querySelectorAll('.doc-obs-inp').forEach(inp => {
    inp.addEventListener('input', () => {
      comp.documentos[inp.dataset.idx].obs = inp.value;
    });
  });
}

function checkExpediente(folio) {
  const comp = getOrCreateCompliance(folio);
  const allValid = comp.documentos.every(d => d.estatus === 'Validado');
  const anyRejected = comp.documentos.some(d => d.estatus === 'Rechazado');
  if (anyRejected) {
    comp.expediente = 'Rechazado';
    document.getElementById('estatus-expediente').textContent = '❌ Rechazado';
    document.getElementById('estatus-expediente').className = 'stat danger';
  } else if (allValid) {
    comp.expediente = 'Completo';
    document.getElementById('estatus-expediente').textContent = '✅ Completo';
    document.getElementById('estatus-expediente').className = 'stat success';
  } else {
    comp.expediente = 'Pendiente';
    document.getElementById('estatus-expediente').textContent = 'Pendiente';
    document.getElementById('estatus-expediente').className = 'stat muted';
  }
  refreshFlowUI();
  refreshKPIs();
  checkLiberacion(folio);
}

function checkLiberacion(folio) {
  const comp = getOrCreateCompliance(folio);
  const ok = comp.antifraude === 'Limpio' && comp.expediente === 'Completo' && comp.calidad === 'Aprobado';
  if (ok && comp.liberacion !== 'Liberada') {
    comp.liberacion = 'Liberada';
    document.getElementById('estatus-liberacion').textContent = '🟢 Liberada';
    document.getElementById('estatus-liberacion').className = 'stat success';
    toast('🟢 Unidad liberada. Stop-Gate superado.', 'success');
  } else if (!ok && comp.liberacion !== 'Bloqueada') {
    comp.liberacion = 'Bloqueada';
    document.getElementById('estatus-liberacion').textContent = '🔒 Bloqueada';
    document.getElementById('estatus-liberacion').className = 'stat danger';
  }
  refreshFlowUI();
  refreshKPIs();
}

function renderComplianceStopGate(folio) {
  const comp = getOrCreateCompliance(folio);
  document.getElementById('estatus-antifraude').textContent = comp.antifraude;
  document.getElementById('estatus-antifraude').className = 'stat ' +
    (comp.antifraude === 'Limpio' ? 'success' : comp.antifraude === 'En lista negra' ? 'danger' : 'muted');
  document.getElementById('estatus-expediente').textContent = comp.expediente;
  document.getElementById('estatus-expediente').className = 'stat ' +
    (comp.expediente === 'Completo' ? 'success' : comp.expediente === 'Rechazado' ? 'danger' : 'muted');
  document.getElementById('estatus-calidad').textContent = comp.calidad;
  document.getElementById('estatus-calidad').className = 'stat ' +
    (comp.calidad === 'Aprobado' ? 'success' : comp.calidad === 'Rechazado' ? 'danger' : 'muted');
  document.getElementById('estatus-liberacion').textContent =
    comp.liberacion === 'Liberada' ? '🟢 Liberada' : '🔒 Bloqueada';
  document.getElementById('estatus-liberacion').className = 'stat ' +
    (comp.liberacion === 'Liberada' ? 'success' : 'danger');
}

function renderBitacora(folio) {
  const comp = getOrCreateCompliance(folio);
  const ul = document.getElementById('bitacora-validaciones');
  if (!comp.bitacora.length) { ul.innerHTML = '<li style="color:var(--text-muted);font-size:.8rem;padding:8px">Sin registros.</li>'; return; }
  ul.innerHTML = comp.bitacora.slice().reverse().map(b => `
    <li class="${b.tipo === 'success' ? 'done' : b.tipo === 'danger' ? 'danger' : 'active'}">
      <span class="tl-icon">${b.tipo === 'success' ? '✅' : b.tipo === 'danger' ? '❌' : '🔔'}</span>
      <div class="tl-body">
        <p class="tl-title">${b.msg}</p>
        <p class="tl-meta">${b.fecha}</p>
      </div>
    </li>
  `).join('');
}

function logBitacora(folio, msg, tipo = 'info') {
  const comp = getOrCreateCompliance(folio);
  comp.bitacora.push({ msg, tipo, fecha: nowStr() });
  renderBitacora(folio);
}

// ─── MODAL OCCUPANCY ────────────────────────────────────────
function openOccupancyModal(vin) {
  state.occupancyVIN = vin;
  state.occupancyMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const v = getVehiculo(vin);
  document.getElementById('occupancy-modal-title').textContent = `Calendario: ${v ? v.modelo : vin}`;
  document.getElementById('occupancy-modal-subtitle').textContent = `VIN: ${vin}`;
  renderOccupancyCalendar();
  document.getElementById('occupancy-modal').removeAttribute('aria-hidden');
}

function renderOccupancyCalendar() {
  renderCalendar(
    'occupancy-calendar-grid',
    'occupancy-weekdays',
    'occupancy-month-label',
    state.occupancyMonth,
    state.occupancyVIN,
    null, null, null
  );
}

// ─── MODAL COMPLIANCE ───────────────────────────────────────
let activeComplianceFolio = null;

function openComplianceModal(folio) {
  if (!folio) {
    if (!state.cotizacionActiva) { toast('Selecciona o guarda una cotización primero.', 'warn'); return; }
    folio = state.cotizacionActiva;
  }
  activeComplianceFolio = folio;
  const cot = state.cotizaciones.find(c => c.folio === folio);
  document.getElementById('compliance-active-quote').textContent =
    `Cotización activa en cumplimiento: ${folio}${cot ? ' — '+cot.cliente : ''}`;
  if (cot) {
    document.getElementById('compliance-cliente-select').value = cot.cliente;
  }
  renderTablaDocumentos(folio);
  renderComplianceStopGate(folio);
  renderBitacora(folio);
  document.getElementById('compliance-modal').removeAttribute('aria-hidden');
  refreshFlowUI();
}

// ─── MODAL QUOTE PROCESS ────────────────────────────────────
let activeQPFolio = null;

function openQuoteProcessModal(folio) {
  if (!folio) return;
  activeQPFolio = folio;
  const cot = state.cotizaciones.find(c => c.folio === folio);
  document.getElementById('quote-process-modal-subtitle').textContent =
    `Folio: ${folio}${cot ? ' | '+cot.cliente+' | '+cot.vin : ''}`;

  // summary
  const sumEl = document.getElementById('quote-process-summary');
  if (cot) {
    sumEl.innerHTML = `
      <div class="qps-item"><small>Folio</small><strong>${cot.folio}</strong></div>
      <div class="qps-item"><small>Cliente</small><strong>${cot.cliente}</strong></div>
      <div class="qps-item"><small>VIN</small><strong>${cot.vin}</strong></div>
      <div class="qps-item"><small>Periodo</small><strong>${fmtDate(cot.fechaInicio)} – ${fmtDate(cot.fechaFin)}</strong></div>
      <div class="qps-item"><small>Días</small><strong>${cot.dias}</strong></div>
      <div class="qps-item"><small>Total</small><strong>${fmtMXN(cot.total)}</strong></div>
    `;
    document.getElementById('qp-cliente-select').value = cot.cliente;
    document.getElementById('qp-vin-select').value = cot.vin;
    document.getElementById('qp-dias-estimados').value = cot.dias;
    document.getElementById('qp-tarifa-base').value = cot.tarifa;
  }

  refreshQPChecklist(folio);
  document.getElementById('quote-process-modal').removeAttribute('aria-hidden');
}

function refreshQPChecklist(folio) {
  const status = getFlowStatusFor(folio);
  const done = Object.values(status).filter(Boolean).length;
  const pct  = Math.round((done / FLOW_STEPS.length) * 100);

  document.getElementById('quote-process-progress-fill').style.width = pct + '%';
  document.getElementById('quote-process-progress-percent').textContent = pct + '%';
  document.getElementById('quote-process-progress-count').textContent = `${done}/${FLOW_STEPS.length} pasos`;

  document.getElementById('quote-process-checklist').innerHTML = FLOW_STEPS.map(s => `
    <li class="${status[s.id] ? 'done' : ''}">
      <span class="tl-icon">${status[s.id] ? '✅' : '⬜'}</span>
      <div class="tl-body"><p class="tl-title">${s.label}</p></div>
    </li>
  `).join('');
}

// ─── GENERAR PDF ─────────────────────────────────────────────
function generarPDF(folio) {
  const cot = state.cotizaciones.find(c => c.folio === folio);
  if (!cot) { toast('Guarda la cotización primero.', 'warn'); return; }
  if (!window.jspdf) { toast('Librería PDF no disponible.', 'danger'); return; }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'letter' });

  const W  = 216;
  const PH = 279;
  const M  = 14;
  const CW = W - M * 2;

  // ── Paleta ──────────────────────────────────────────────────
  const C = {
    bg:      [13,  13,  15],
    bg2:     [20,  20,  24],
    bg3:     [28,  28,  34],
    bg4:     [36,  36,  46],
    border:  [52,  52,  66],
    gold:    [201, 168, 76],
    goldDk:  [140, 110, 40],
    goldLt:  [232, 200, 110],
    white:   [232, 230, 224],
    muted:   [140, 140, 150],
    dim:     [80,  80,  90],
    success: [39,  174, 96],
    dark:    [10,  10,  12],
  };

  // Helpers
  const fill  = (r,g,b) => doc.setFillColor(r,g,b);
  const ink   = (r,g,b) => doc.setTextColor(r,g,b);
  const stroke= (r,g,b) => doc.setDrawColor(r,g,b);
  const bold  = () => doc.setFont('helvetica','bold');
  const normal= () => doc.setFont('helvetica','normal');
  const sz    = n  => doc.setFontSize(n);
  const rect  = (x,y,w,h,s='F') => doc.rect(x,y,w,h,s);
  const hline = (x1,x2,y,w=0.3) => { stroke(...C.border); doc.setLineWidth(w); doc.line(x1,y,x2,y); };
  const label = (txt,x,y) => { ink(...C.muted); sz(6.5); normal(); doc.text(txt,x,y); };
  const val   = (txt,x,y,opts={}) => { ink(...C.white); sz(8.5); bold(); doc.text(String(txt),x,y,opts); };
  const gold  = (txt,x,y,opts={}) => { ink(...C.gold); sz(8.5); bold(); doc.text(String(txt),x,y,opts); };

  const veh = getVehiculo(cot.vin);

  // ═══════════════════════════════════════════════════════════
  // FONDO DE PÁGINA COMPLETO
  // ═══════════════════════════════════════════════════════════
  fill(...C.bg); rect(0, 0, W, PH);

  // ═══════════════════════════════════════════════════════════
  // HEADER (0–46mm)
  // ═══════════════════════════════════════════════════════════
  fill(...C.bg2); rect(0, 0, W, 46);

  // Franja dorada lateral izquierda del header
  fill(...C.gold); rect(0, 0, 3, 46);

  // Logo box
  fill(...C.bg4); doc.roundedRect(M, 6, 24, 24, 2, 2, 'F');
  fill(...C.goldDk); doc.roundedRect(M+1, 7, 22, 22, 2, 2, 'F');
  ink(...C.dark); sz(10); bold();
  doc.text('B', M+12, 16.5, { align:'center' });
  ink(...C.bg2); sz(7); normal();
  doc.text('P', M+12, 22, { align:'center' });

  // Nombre empresa
  ink(...C.gold); sz(18); bold();
  doc.text('BLINDADOS PREMIUM', M+30, 16);
  ink(...C.muted); sz(7.5); normal();
  doc.text('PROPUESTA COMERCIAL DE RENTA DE VEHÍCULOS BLINDADOS', M+30, 22);

  // Tag "CONFIDENCIAL"
  fill(...C.goldDk); doc.roundedRect(M+30, 26, 30, 6, 1, 1, 'F');
  ink(...C.dark); sz(6); bold();
  doc.text('CONFIDENCIAL', M+45, 30.2, { align:'center' });

  // Folio + versión (right)
  ink(...C.muted); sz(6.5); normal();
  doc.text('FOLIO', W-M, 10, { align:'right' });
  ink(...C.gold); sz(13); bold();
  doc.text(cot.folio, W-M, 17, { align:'right' });
  ink(...C.muted); sz(6.5); normal();
  doc.text(`Versión: ${cot.version}`, W-M, 23, { align:'right' });
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-MX',{day:'2-digit',month:'long',year:'numeric'})}`, W-M, 29, { align:'right' });

  // Línea dorada separadora
  fill(...C.gold); rect(0, 46, W, 0.8);

  let y = 54;

  // ═══════════════════════════════════════════════════════════
  // SECCIÓN 1 — CLIENTE + UNIDAD (dos columnas)
  // ═══════════════════════════════════════════════════════════
  const col = (CW - 5) / 2;

  // Card cliente
  fill(...C.bg3); doc.roundedRect(M, y, col, 38, 2, 2, 'F');
  fill(...C.goldDk); doc.roundedRect(M, y, col, 7.5, 2, 2, 'F');
  // Esquinas inferiores rectas en encabezado
  fill(...C.goldDk); rect(M, y+4, col, 3.5);
  ink(...C.dark); sz(7); bold();
  doc.text('CLIENTE', M + col/2, y+5.4, { align:'center' });

  label('NOMBRE / RAZÓN SOCIAL', M+4, y+15);
  val(cot.cliente, M+4, y+21);
  label('FOLIO COTIZACIÓN', M+4, y+29);
  gold(cot.folio, M+4, y+35);

  // Card unidad
  const rx = M + col + 5;
  fill(...C.bg3); doc.roundedRect(rx, y, col, 38, 2, 2, 'F');
  fill(...C.goldDk); doc.roundedRect(rx, y, col, 7.5, 2, 2, 'F');
  fill(...C.goldDk); rect(rx, y+4, col, 3.5);
  ink(...C.dark); sz(7); bold();
  doc.text('UNIDAD ASIGNADA', rx + col/2, y+5.4, { align:'center' });

  label('MODELO / NIVEL', rx+4, y+15);
  const modeloText = veh ? veh.modelo : cot.vin;
  const modeloLines = doc.splitTextToSize(modeloText, col-8);
  ink(...C.white); sz(8.5); bold(); doc.text(modeloLines, rx+4, y+21);
  label('VIN', rx+4, y+30);
  val(cot.vin, rx+4, y+36);
  label('NIVEL BLINDAJE', rx+4+30, y+30);
  gold(veh ? veh.nivel : '—', rx+4+30, y+36);

  y += 46;

  // ═══════════════════════════════════════════════════════════
  // SECCIÓN 2 — PERIODO DE RENTA
  // ═══════════════════════════════════════════════════════════
  fill(...C.bg3); doc.roundedRect(M, y, CW, 30, 2, 2, 'F');
  fill(...C.bg2); doc.roundedRect(M, y, CW, 8, 2, 2, 'F');
  fill(...C.bg2); rect(M, y+4, CW, 4);
  ink(...C.gold); sz(7); bold();
  doc.text('PERIODO DE RENTA', M+CW/2, y+5.6, { align:'center' });

  const cols4 = CW / 4;
  const periodos = [
    { lbl:'FECHA INICIO', v: fmtDate(cot.fechaInicio) },
    { lbl:'FECHA FIN',    v: fmtDate(cot.fechaFin) },
    { lbl:'DÍAS TOTALES', v: String(cot.dias) },
    { lbl:'TARIFA / DÍA', v: fmtMXN(cot.tarifa) },
  ];
  periodos.forEach((p, i) => {
    const px = M + i * cols4 + cols4 / 2;
    label(p.lbl, px, y+15, { align:'center' });
    ink(...C.white); sz(9.5); bold();
    doc.text(p.v, px, y+24, { align:'center' });
    if (i < 3) {
      stroke(...C.border); doc.setLineWidth(0.25);
      doc.line(M + (i+1)*cols4, y+9, M + (i+1)*cols4, y+28);
    }
  });

  y += 38;

  // ═══════════════════════════════════════════════════════════
  // SECCIÓN 3 — EXTRAS
  // ═══════════════════════════════════════════════════════════
  const extras = cot.extras || [];
  const extrasH = extras.length ? 10 + extras.length * 9 + 4 : 22;
  fill(...C.bg3); doc.roundedRect(M, y, CW, extrasH, 2, 2, 'F');
  fill(...C.bg2); doc.roundedRect(M, y, CW, 8, 2, 2, 'F');
  fill(...C.bg2); rect(M, y+4, CW, 4);
  ink(...C.gold); sz(7); bold();
  doc.text('SERVICIOS EXTRAS INCLUIDOS', M+CW/2, y+5.6, { align:'center' });

  if (!extras.length) {
    ink(...C.dim); sz(7.5); normal();
    doc.text('Sin extras adicionales.', M+CW/2, y+16, { align:'center' });
  } else {
    // Cabecera tabla
    let ey = y + 13;
    ink(...C.muted); sz(6); bold();
    doc.text('CONCEPTO', M+4, ey);
    doc.text('PRECIO/DÍA', M + CW*0.55, ey);
    doc.text('DÍAS', M + CW*0.72, ey);
    doc.text('SUBTOTAL', M+CW-2, ey, { align:'right' });
    hline(M, M+CW, ey+2, 0.25);

    extras.forEach((e, i) => {
      const ry = ey + 7 + i * 9;
      // Fila alternada
      if (i % 2 === 0) { fill(...C.bg4); rect(M, ry-4.5, CW, 8.5); }
      ink(...C.white); sz(7.5); normal(); doc.text(e.label, M+4, ry);
      ink(...C.muted); sz(7.5); normal();
      doc.text(fmtMXN(e.precio), M + CW*0.55, ry);
      doc.text(String(cot.dias), M + CW*0.73, ry);
      ink(...C.goldLt); sz(7.5); bold();
      doc.text(fmtMXN(e.precio * cot.dias), M+CW-2, ry, { align:'right' });
    });
  }

  y += extrasH + 8;

  // ═══════════════════════════════════════════════════════════
  // SECCIÓN 4 — RESUMEN FINANCIERO
  // ═══════════════════════════════════════════════════════════
  fill(...C.bg3); doc.roundedRect(M, y, CW, 44, 2, 2, 'F');
  fill(...C.bg2); doc.roundedRect(M, y, CW, 8, 2, 2, 'F');
  fill(...C.bg2); rect(M, y+4, CW, 4);
  ink(...C.gold); sz(7); bold();
  doc.text('RESUMEN FINANCIERO', M+CW/2, y+5.6, { align:'center' });

  const finRows = [
    { lbl: 'Subtotal renta base', val: fmtMXN(cot.baseTotal || cot.dias * cot.tarifa) },
    { lbl: 'Subtotal extras',     val: fmtMXN(cot.extrasTotal || 0) },
  ];
  finRows.forEach((r, i) => {
    const ry = y + 16 + i * 8;
    ink(...C.muted); sz(7.5); normal(); doc.text(r.lbl, M+6, ry);
    ink(...C.white); sz(7.5); bold();   doc.text(r.val, M+CW-4, ry, { align:'right' });
  });

  hline(M+4, M+CW-4, y+32, 0.5);

  // Caja total
  fill(...C.goldDk); doc.roundedRect(M+4, y+33, CW-8, 9, 1.5, 1.5, 'F');
  ink(...C.dark); sz(8); bold();
  doc.text('TOTAL DE LA PROPUESTA', M+8, y+39);
  sz(10); doc.text(fmtMXN(cot.total), M+CW-8, y+39, { align:'right' });

  y += 52;

  // ═══════════════════════════════════════════════════════════
  // SECCIÓN 5 — CONDICIONES
  // ═══════════════════════════════════════════════════════════
  const termsH = 52;
  fill(...C.bg2); doc.roundedRect(M, y, CW, termsH, 2, 2, 'F');
  // Franja dorada izquierda
  fill(...C.goldDk); rect(M, y, 2.5, termsH);

  ink(...C.gold); sz(7); bold();
  doc.text('CONDICIONES GENERALES DEL SERVICIO (NO EDITABLE)', M+7, y+7);
  hline(M+7, M+CW-2, y+9, 0.25);

  const terms = [
    '1.  El arrendatario es responsable de cualquier daño no cubierto por el seguro contratado durante el periodo de renta.',
    '2.  La unidad incluye seguro de cobertura amplia; el deducible corre por cuenta del cliente arrendatario.',
    '3.  La cancelación con menos de 24 horas de anticipación genera un cargo equivalente al 50% del monto total pactado.',
    '4.  La liberación de la unidad queda bloqueada hasta que el área de Calidad valide el expediente documental completo.',
    '5.  La renta está sujeta a disponibilidad confirmada por el sistema ERP al momento de firma del presente contrato.',
    '6.  Queda expresamente prohibido el uso del vehículo fuera del territorio nacional sin autorización escrita previa.',
  ];
  terms.forEach((t, i) => {
    const lines = doc.splitTextToSize(t, CW - 12);
    ink(...C.muted); sz(6.8); normal();
    doc.text(lines, M+7, y+15 + i*6.2);
  });

  // ═══════════════════════════════════════════════════════════
  // FOOTER
  // ═══════════════════════════════════════════════════════════
  fill(...C.bg2); rect(0, PH-14, W, 14);
  fill(...C.gold); rect(0, PH-14, W, 0.6);

  ink(...C.dim); sz(6); normal();
  doc.text(`Generado: ${new Date().toLocaleString('es-MX')}`, M, PH-7);
  doc.text(`${cot.folio}  ·  ${cot.version}  ·  BLINDADOS PREMIUM`, W/2, PH-7, { align:'center' });
  doc.text('Página 1 de 1', W-M, PH-7, { align:'right' });

  // ── Guardar ────────────────────────────────────────────────
  // Abrir PDF en el navegador (el usuario decide qué hace con él)
  const pdfBlob = doc.output('blob');
  const pdfUrl  = URL.createObjectURL(pdfBlob);
  const link    = document.createElement('a');
  link.href   = pdfUrl;
  link.target = '_blank';
  link.rel    = 'noopener';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  toast(`✅ Propuesta abierta: ${cot.folio} ${cot.version}`, 'success');
}

// ─── EXPORTAR ESTADO ─────────────────────────────────────────
function exportarEstado() {
  const data = JSON.stringify({ cotizaciones: state.cotizaciones, compliance: state.compliance }, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `RentasEstado_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  toast('Estado exportado como JSON.', 'success');
}

function exportarEvidenciaFlujo() {
  const lines = ['EVIDENCIA DE FLUJO — BLINDADOS PREMIUM', `Fecha: ${nowStr()}`, ''];
  state.cotizaciones.forEach(cot => {
    const status = getFlowStatusFor(cot.folio);
    const done = Object.values(status).filter(Boolean).length;
    lines.push(`--- ${cot.folio} | ${cot.cliente} | ${cot.vin} | ${cot.version} ---`);
    lines.push(`Total: ${fmtMXN(cot.total)} | Avance: ${done}/${FLOW_STEPS.length}`);
    FLOW_STEPS.forEach(s => lines.push(`  [${status[s.id] ? 'X' : ' '}] ${s.label}`));
    lines.push('');
  });
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `EvidenciaFlujo_${new Date().toISOString().slice(0,10)}.txt`;
  a.click();
  toast('Evidencia de flujo descargada.', 'success');
}

// ─── DEMO DATA ───────────────────────────────────────────────
function cargarDemoData() {
  // Cotización 1 — Flujo casi completo (solo falta liberación)
  const folio1 = 'RNT-0001';
  const cot1 = {
    folio: folio1,
    version: 'v02',
    cliente: 'Grupo Alfa',
    vin: 'VIN-AX90',
    fechaInicio: offsetDate(3),
    fechaFin: offsetDate(10),
    dias: 7,
    tarifa: 22000,
    extras: [EXTRAS[0], EXTRAS[1]],   // conductor + escolta
    baseTotal: 7 * 22000,
    extrasTotal: 7 * (EXTRAS[0].precio + EXTRAS[1].precio),
    total: 7 * 22000 + 7 * (EXTRAS[0].precio + EXTRAS[1].precio),
    disponibilidadOk: true,
    historial: [
      { version: 'v01', total: 7 * 20000, fecha: '05 Jul, 10:15', cliente: 'Grupo Alfa', vin: 'VIN-AX90' },
    ],
  };
  state.cotizaciones.push(cot1);

  // Compliance folio1 — antifraude OK, expediente casi completo (6/7 validados), calidad pendiente
  const comp1 = getOrCreateCompliance(folio1);
  comp1.cliente = 'Grupo Alfa';
  comp1.antifraude = 'Limpio';
  comp1.documentos.forEach((d, i) => { if (i < 6) d.estatus = 'Validado'; });
  comp1.expediente = 'Pendiente'; // falta 1 doc
  comp1.calidad = 'Sin revisar';
  comp1.liberacion = 'Bloqueada';
  comp1.bitacora.push(
    { msg: 'Cotización v01 creada.', tipo: 'info', fecha: '05 Jul, 10:15' },
    { msg: 'Antifraude OK: "Grupo Alfa" sin registros negativos.', tipo: 'success', fecha: '05 Jul, 11:02' },
    { msg: 'Nueva versión v02 generada tras ajuste de tarifa.', tipo: 'info', fecha: '05 Jul, 14:30' },
    { msg: '6 de 7 documentos validados. Pendiente: Actas de asamblea.', tipo: 'info', fecha: '06 Jul, 09:10' },
  );

  // Cotización 2 — solo captura (sin compliance aún)
  const folio2 = 'RNT-0002';
  const cot2 = {
    folio: folio2,
    version: 'v01',
    cliente: 'Gobierno de NL',
    vin: 'VIN-CH33',
    fechaInicio: offsetDate(14),
    fechaFin: offsetDate(21),
    dias: 7,
    tarifa: 15000,
    extras: [EXTRAS[3]],   // rastreo satelital
    baseTotal: 7 * 15000,
    extrasTotal: 7 * EXTRAS[3].precio,
    total: 7 * 15000 + 7 * EXTRAS[3].precio,
    disponibilidadOk: true,
    historial: [],
  };
  state.cotizaciones.push(cot2);

  // Cotización 3 — flujo 100% completo (liberada)
  const folio3 = 'RNT-0003';
  const cot3 = {
    folio: folio3,
    version: 'v01',
    cliente: 'Constructora Coppel',
    vin: 'VIN-BM11',
    fechaInicio: offsetDate(-5),
    fechaFin: offsetDate(-1),
    dias: 4,
    tarifa: 19500,
    extras: [EXTRAS[0], EXTRAS[4]],
    baseTotal: 4 * 19500,
    extrasTotal: 4 * (EXTRAS[0].precio + EXTRAS[4].precio),
    total: 4 * 19500 + 4 * (EXTRAS[0].precio + EXTRAS[4].precio),
    disponibilidadOk: true,
    historial: [],
  };
  state.cotizaciones.push(cot3);

  const comp3 = getOrCreateCompliance(folio3);
  comp3.cliente = 'Constructora Coppel';
  comp3.antifraude = 'Limpio';
  comp3.documentos.forEach(d => { d.estatus = 'Validado'; });
  comp3.expediente = 'Completo';
  comp3.calidad = 'Aprobado';
  comp3.liberacion = 'Liberada';
  comp3.bitacora.push(
    { msg: 'Cotización creada.', tipo: 'info', fecha: '01 Jul, 08:00' },
    { msg: 'Antifraude OK.', tipo: 'success', fecha: '01 Jul, 09:15' },
    { msg: 'Expediente completo — 7/7 documentos validados.', tipo: 'success', fecha: '01 Jul, 11:00' },
    { msg: 'Calidad: expediente APROBADO.', tipo: 'success', fecha: '01 Jul, 12:30' },
    { msg: '🟢 Unidad liberada. Stop-Gate superado.', tipo: 'success', fecha: '01 Jul, 12:31' },
  );

  // Activar cotización 1 en el formulario
  // NO se pre-carga el form: las 3 cotizaciones quedan en la tabla
  // y el usuario puede abrir cualquiera o crear una nueva desde cero
  state.cotizacionActiva = null;
  state.version = 1;

  renderVehiclePreview('');
  state.calSelStart = null;
  state.calSelEnd   = null;
  renderBookingCalendar();
  renderTablaFlota();
  renderTablaCotizaciones();
  refreshFlowUI();
  refreshKPIs();
}

// ─── WIRING ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // Render inicial
  renderExtras();
  renderBookingCalendar();
  renderTablaFlota();
  renderTablaCotizaciones();
  refreshFlowUI();
  refreshKPIs();
  cargarDemoData();

  // ── VIN change → actualizar preview + calendario + flota
  document.getElementById('vin-select').addEventListener('change', () => {
    renderVehiclePreview(document.getElementById('vin-select').value);
    renderBookingCalendar();
    renderTablaFlota();
  });

  // ── Fechas → auto días + flota
  ['fecha-inicio','fecha-fin'].forEach(id => {
    document.getElementById(id).addEventListener('change', () => {
      autoDias();
      renderTablaFlota();
    });
  });

  // ── Calendario nav
  document.getElementById('btn-cal-prev-month').addEventListener('click', () => {
    state.calMonth = new Date(state.calMonth.getFullYear(), state.calMonth.getMonth() - 1, 1);
    renderBookingCalendar();
  });
  document.getElementById('btn-cal-next-month').addEventListener('click', () => {
    state.calMonth = new Date(state.calMonth.getFullYear(), state.calMonth.getMonth() + 1, 1);
    renderBookingCalendar();
  });
  document.getElementById('btn-cal-clear').addEventListener('click', () => {
    state.calSelStart = null;
    state.calSelEnd = null;
    document.getElementById('fecha-inicio').value = '';
    document.getElementById('fecha-fin').value = '';
    document.getElementById('dias-estimados').value = 1;
    renderBookingCalendar();
    renderTablaFlota();
  });

  // ── Fotos nav
  document.getElementById('btn-foto-prev').addEventListener('click', () => {
    const vin = document.getElementById('vin-select').value;
    const v = getVehiculo(vin);
    if (!v) return;
    const idx = state.calFotoIdx[vin] || 0;
    state.calFotoIdx[vin] = (idx - 1 + v.fotos.length) % v.fotos.length;
    renderVehiclePreview(vin);
  });
  document.getElementById('btn-foto-next').addEventListener('click', () => {
    const vin = document.getElementById('vin-select').value;
    const v = getVehiculo(vin);
    if (!v) return;
    const idx = state.calFotoIdx[vin] || 0;
    state.calFotoIdx[vin] = (idx + 1) % v.fotos.length;
    renderVehiclePreview(vin);
  });

  // ── Validar disponibilidad (candado anti-solapamiento)
  document.getElementById('btn-validar-disponibilidad').addEventListener('click', () => {
    const draft = buildCotizacionDraft();
    const err = validateCotizacion(draft);
    if (err) { toast(err, 'warn'); return; }
    const conflicto = isVinOccupied(draft.vin, draft.fechaInicio, draft.fechaFin);
    if (conflicto) {
      const msg = conflicto.folio
        ? `🔒 VIN bloqueado: ya reservado en ${conflicto.folio}.`
        : `🔒 VIN en ${conflicto.tipo} en el periodo seleccionado.`;
      document.getElementById('estatus-disponibilidad').textContent = '❌ No disponible';
      document.getElementById('estatus-disponibilidad').className = 'stat danger';
      toast(msg, 'danger');
    } else {
      document.getElementById('estatus-disponibilidad').textContent = '✅ Disponible';
      document.getElementById('estatus-disponibilidad').className = 'stat success';
      toast('✅ Unidad disponible en el periodo.', 'success');
      if (state.cotizacionActiva) {
        const cot = state.cotizaciones.find(c => c.folio === state.cotizacionActiva);
        if (cot) { cot.disponibilidadOk = true; refreshFlowUI(); refreshKPIs(); }
      }
    }
    renderTablaFlota();
  });

  // ── Calcular total
  document.getElementById('btn-calcular').addEventListener('click', () => {
    const draft = buildCotizacionDraft();
    const err = validateCotizacion(draft);
    if (err) { toast(err, 'warn'); return; }
    document.getElementById('total-cotizacion').textContent = fmtMXN(draft.total);
    document.getElementById('estatus-cotizacion').textContent = 'Calculada';
    document.getElementById('estatus-cotizacion').className = 'stat success';
    toast(`Total calculado: ${fmtMXN(draft.total)}`, 'success');
    if (state.cotizacionActiva) {
      const cot = state.cotizaciones.find(c => c.folio === state.cotizacionActiva);
      if (cot) {
        cot.total = draft.total;
        cot.baseTotal = draft.baseTotal;
        cot.extrasTotal = draft.extrasTotal;
        cot.extras = draft.extras;
        cot.dias = draft.dias;
        cot.tarifa = draft.tarifa;
        renderTablaCotizaciones();
        refreshFlowUI();
        refreshKPIs();
      }
    }
  });

  // ── Nueva versión
  document.getElementById('btn-nueva-version').addEventListener('click', () => {
    if (!state.cotizacionActiva) { toast('Abre una cotización primero.', 'warn'); return; }
    const cot = state.cotizaciones.find(c => c.folio === state.cotizacionActiva);
    if (!cot) return;
    state.version++;
    const nueva = `v${String(state.version).padStart(2,'0')}`;
    cot.historial = cot.historial || [];
    cot.historial.push({ version: cot.version, total: cot.total, fecha: nowStr(), cliente: cot.cliente, vin: cot.vin });
    cot.version = nueva;
    document.getElementById('version-actual').textContent = nueva;
    renderHistorial(cot.folio);
    renderTablaCotizaciones();
    toast(`Nueva versión: ${nueva}`, 'info');
  });

  // ── Guardar cotización
  document.getElementById('btn-guardar-cotizacion').addEventListener('click', () => {
    const draft = buildCotizacionDraft();
    const err = validateCotizacion(draft);
    if (err) { toast(err, 'warn'); return; }

    if (state.cotizacionActiva) {
      // actualizar existente
      const cot = state.cotizaciones.find(c => c.folio === state.cotizacionActiva);
      if (cot) {
        Object.assign(cot, { ...draft, folio: cot.folio, version: cot.version, historial: cot.historial });
        toast(`Cotización ${cot.folio} actualizada.`, 'success');
      }
    } else {
      // cotización nueva — siempre crear y agregar al listado
      const folio = generateFolio();
      const nueva = {
        folio,
        version: `v${String(state.version).padStart(2,'0')}`,
        historial: [],
        disponibilidadOk: false,
        ...draft,
      };
      state.cotizaciones.push(nueva);
      state.cotizacionActiva = folio;
      toast(`✅ Cotización guardada: ${folio}`, 'success');
    }

    // Siempre re-renderizar la tabla completa para que aparezca la nueva fila
    renderTablaCotizaciones();
    // Forzar scroll hacia la tabla para que el usuario la vea
    const tablaEl = document.getElementById('tabla-cotizaciones');
    if (tablaEl) tablaEl.closest('article').scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    const cot = state.cotizaciones.find(c => c.folio === state.cotizacionActiva);
    if (cot) { updateSummary(cot); renderHistorial(cot.folio); }
    refreshFlowUI();
    refreshKPIs();
  });

  // ── Generar PDF
  document.getElementById('btn-generar-pdf').addEventListener('click', () => {
    const draft = buildCotizacionDraft();
    const err = validateCotizacion(draft);
    if (err) { toast(err, 'warn'); return; }

    // Auto-guardar si no existe cotización activa
    if (!state.cotizacionActiva) {
      const folio = generateFolio();
      const nueva = {
        folio,
        version: `v${String(state.version).padStart(2,'0')}`,
        historial: [],
        disponibilidadOk: false,
        ...draft,
      };
      state.cotizaciones.push(nueva);
      state.cotizacionActiva = folio;
    } else {
      // Actualizar cotización existente con datos actuales
      const cot = state.cotizaciones.find(c => c.folio === state.cotizacionActiva);
      if (cot) Object.assign(cot, { ...draft, folio: cot.folio, version: cot.version, historial: cot.historial });
    }

    renderTablaCotizaciones();
    const cot = state.cotizaciones.find(c => c.folio === state.cotizacionActiva);
    if (cot) { updateSummary(cot); renderHistorial(cot.folio); }
    refreshFlowUI();
    refreshKPIs();
    generarPDF(state.cotizacionActiva);
  });

  // ── Limpiar cotización
  document.getElementById('btn-limpiar-cotizacion').addEventListener('click', () => {
    state.cotizacionActiva = null;
    state.version = 1;
    state.calSelStart = null;
    state.calSelEnd = null;
    document.getElementById('cliente-select').value = '';
    document.getElementById('vin-select').value = '';
    document.getElementById('fecha-inicio').value = '';
    document.getElementById('fecha-fin').value = '';
    document.getElementById('dias-estimados').value = 1;
    document.getElementById('tarifa-base').value = 18000;
    document.getElementById('total-cotizacion').textContent = '$0.00';
    document.getElementById('version-actual').textContent = 'v01';
    document.getElementById('estatus-disponibilidad').textContent = 'Sin validar';
    document.getElementById('estatus-disponibilidad').className = 'stat muted';
    document.getElementById('estatus-cotizacion').textContent = 'Borrador';
    document.getElementById('estatus-cotizacion').className = 'stat muted';
    document.getElementById('historial-versiones').innerHTML = '';
    renderVehiclePreview('');
    renderBookingCalendar();
    renderTablaFlota();
    refreshFlowUI();
    refreshKPIs();
    toast('Formulario limpiado.', 'info');
  });

  // ── Exportar
  document.getElementById('btn-export-state').addEventListener('click', exportarEstado);
  document.getElementById('btn-export-evidence').addEventListener('click', exportarEvidenciaFlujo);

  // ── Occupancy modal
  document.getElementById('btn-occupancy-close').addEventListener('click', () => {
    document.getElementById('occupancy-modal').setAttribute('aria-hidden', 'true');
  });
  document.getElementById('occupancy-modal-backdrop').addEventListener('click', () => {
    document.getElementById('occupancy-modal').setAttribute('aria-hidden', 'true');
  });
  document.getElementById('btn-occupancy-prev-month').addEventListener('click', () => {
    state.occupancyMonth = new Date(state.occupancyMonth.getFullYear(), state.occupancyMonth.getMonth() - 1, 1);
    renderOccupancyCalendar();
  });
  document.getElementById('btn-occupancy-next-month').addEventListener('click', () => {
    state.occupancyMonth = new Date(state.occupancyMonth.getFullYear(), state.occupancyMonth.getMonth() + 1, 1);
    renderOccupancyCalendar();
  });

  // ── Compliance modal
  document.getElementById('btn-compliance-modal-backdrop') ||
  document.getElementById('compliance-modal-backdrop').addEventListener('click', () => {
    document.getElementById('compliance-modal').setAttribute('aria-hidden', 'true');
  });
  ['btn-compliance-close','btn-compliance-close-alt'].forEach(id => {
    document.getElementById(id).addEventListener('click', () => {
      document.getElementById('compliance-modal').setAttribute('aria-hidden', 'true');
    });
  });

  document.getElementById('btn-verificar-lista-negra').addEventListener('click', () => {
    const folio = activeComplianceFolio;
    if (!folio) { toast('Sin cotización activa en compliance.', 'warn'); return; }
    const comp = getOrCreateCompliance(folio);
    const cliente = document.getElementById('compliance-cliente-select').value || comp.cliente;
    if (!cliente) { toast('Selecciona un cliente.', 'warn'); return; }
    const enLista = LISTA_NEGRA.some(n => n.toLowerCase() === cliente.toLowerCase());
    if (enLista) {
      comp.antifraude = 'En lista negra';
      document.getElementById('estatus-antifraude').textContent = '❌ En lista negra';
      document.getElementById('estatus-antifraude').className = 'stat danger';
      logBitacora(folio, `ALERTA: "${cliente}" encontrado en lista negra.`, 'danger');
      toast(`🚨 "${cliente}" está en lista negra.`, 'danger');
    } else {
      comp.antifraude = 'Limpio';
      document.getElementById('estatus-antifraude').textContent = '✅ Limpio';
      document.getElementById('estatus-antifraude').className = 'stat success';
      logBitacora(folio, `Antifraude OK: "${cliente}" sin registros en lista negra.`, 'success');
      toast(`✅ "${cliente}" sin registros negativos.`, 'success');
    }
    refreshFlowUI();
    refreshKPIs();
    checkLiberacion(folio);
  });

  document.getElementById('btn-marcar-recibidos').addEventListener('click', () => {
    const folio = activeComplianceFolio;
    if (!folio) { toast('Sin cotización activa.', 'warn'); return; }
    const comp = getOrCreateCompliance(folio);
    comp.documentos.forEach(d => { if (d.estatus === 'Pendiente') d.estatus = 'Recibido'; });
    renderTablaDocumentos(folio);
    logBitacora(folio, 'Todos los documentos marcados como Recibido.', 'info');
    toast('Documentos marcados como Recibido.', 'info');
  });

  document.getElementById('btn-guardar-validacion').addEventListener('click', () => {
    const folio = activeComplianceFolio;
    if (!folio) { toast('Sin cotización activa.', 'warn'); return; }
    checkExpediente(folio);
    logBitacora(folio, 'Validación de expediente guardada.', 'info');
    renderTablaCotizaciones();
    toast('Validación guardada.', 'success');
  });

  document.getElementById('btn-enviar-calidad').addEventListener('click', () => {
    const folio = activeComplianceFolio;
    if (!folio) { toast('Sin cotización activa.', 'warn'); return; }
    const comp = getOrCreateCompliance(folio);
    if (comp.expediente !== 'Completo') { toast('Completa el expediente antes de enviar a Calidad.', 'warn'); return; }
    logBitacora(folio, 'Expediente enviado a revisión de Calidad.', 'info');
    toast('Expediente enviado a Calidad.', 'info');
  });

  document.getElementById('btn-aprobar-calidad').addEventListener('click', () => {
    const folio = activeComplianceFolio;
    if (!folio) { toast('Sin cotización activa.', 'warn'); return; }
    const comp = getOrCreateCompliance(folio);
    if (comp.expediente !== 'Completo') { toast('El expediente debe estar completo para aprobar.', 'warn'); return; }
    comp.calidad = 'Aprobado';
    document.getElementById('estatus-calidad').textContent = '✅ Aprobado';
    document.getElementById('estatus-calidad').className = 'stat success';
    logBitacora(folio, 'Calidad: expediente APROBADO.', 'success');
    checkLiberacion(folio);
    renderTablaCotizaciones();
    toast('✅ Calidad aprobada.', 'success');
  });

  document.getElementById('btn-rechazar-calidad').addEventListener('click', () => {
    const folio = activeComplianceFolio;
    if (!folio) return;
    const comp = getOrCreateCompliance(folio);
    comp.calidad = 'Rechazado';
    document.getElementById('estatus-calidad').textContent = '❌ Rechazado';
    document.getElementById('estatus-calidad').className = 'stat danger';
    logBitacora(folio, 'Calidad: expediente RECHAZADO.', 'danger');
    checkLiberacion(folio);
    renderTablaCotizaciones();
    toast('❌ Calidad rechazada.', 'danger');
  });

  document.getElementById('btn-reutilizar-historial').addEventListener('click', () => {
    const folio = activeComplianceFolio;
    if (!folio) return;
    const comp = getOrCreateCompliance(folio);
    const cliente = document.getElementById('compliance-cliente-select').value;
    // buscar cliente validado en otras cotizaciones
    const prevFolio = Object.keys(state.compliance).find(f =>
      f !== folio &&
      state.compliance[f].calidad === 'Aprobado' &&
      state.cotizaciones.find(c => c.folio === f && c.cliente === cliente)
    );
    if (prevFolio) {
      const prev = state.compliance[prevFolio];
      comp.documentos = prev.documentos.map(d => ({ ...d }));
      comp.antifraude = prev.antifraude;
      renderTablaDocumentos(folio);
      renderComplianceStopGate(folio);
      logBitacora(folio, `Historial de validación reutilizado de ${prevFolio}.`, 'info');
      toast(`Historial de ${prevFolio} reutilizado.`, 'success');
    } else {
      toast('No hay historial previo aprobado para este cliente.', 'warn');
    }
  });

  // ── Quote Process modal
  ['btn-quote-process-close','btn-quote-process-close-alt'].forEach(id => {
    document.getElementById(id).addEventListener('click', () => {
      document.getElementById('quote-process-modal').setAttribute('aria-hidden', 'true');
    });
  });
  document.getElementById('quote-process-modal-backdrop').addEventListener('click', () => {
    document.getElementById('quote-process-modal').setAttribute('aria-hidden', 'true');
  });

  document.getElementById('qp-btn-validar-disponibilidad').addEventListener('click', () => {
    if (!activeQPFolio) return;
    const vin = document.getElementById('qp-vin-select').value;
    const fi  = document.getElementById('qp-fecha-inicio').value?.slice(0,10);
    const ff  = document.getElementById('qp-fecha-fin').value?.slice(0,10);
    if (!vin || !fi || !ff) { toast('Completa VIN y fechas.', 'warn'); return; }
    const conflict = isVinOccupied(vin, fi, ff);
    if (conflict) {
      toast('🔒 VIN no disponible en el periodo.', 'danger');
    } else {
      const cot = state.cotizaciones.find(c => c.folio === activeQPFolio);
      if (cot) { cot.disponibilidadOk = true; }
      toast('✅ Disponible.', 'success');
      refreshQPChecklist(activeQPFolio);
      refreshFlowUI();
    }
  });

  document.getElementById('qp-btn-calcular').addEventListener('click', () => {
    if (!activeQPFolio) return;
    const dias   = parseInt(document.getElementById('qp-dias-estimados').value) || 1;
    const tarifa = parseFloat(document.getElementById('qp-tarifa-base').value) || 0;
    const total  = dias * tarifa;
    const cot = state.cotizaciones.find(c => c.folio === activeQPFolio);
    if (cot) { cot.total = total; cot.dias = dias; cot.tarifa = tarifa; }
    toast(`Total: ${fmtMXN(total)}`, 'success');
    refreshQPChecklist(activeQPFolio);
    refreshFlowUI();
    renderTablaCotizaciones();
    refreshKPIs();
  });

  document.getElementById('qp-btn-guardar-cotizacion').addEventListener('click', () => {
    if (!activeQPFolio) return;
    const cot = state.cotizaciones.find(c => c.folio === activeQPFolio);
    if (cot) {
      cot.cliente = document.getElementById('qp-cliente-select').value || cot.cliente;
      cot.vin     = document.getElementById('qp-vin-select').value     || cot.vin;
    }
    toast('Cotización actualizada.', 'success');
    refreshQPChecklist(activeQPFolio);
    refreshFlowUI();
    renderTablaCotizaciones();
  });

  // ── Demo reset
  document.getElementById('btn-demo-reset').addEventListener('click', () => {
    state = buildInitialState();
    document.getElementById('cliente-select').value = '';
    document.getElementById('vin-select').value = '';
    document.getElementById('fecha-inicio').value = '';
    document.getElementById('fecha-fin').value = '';
    document.getElementById('dias-estimados').value = 1;
    document.getElementById('tarifa-base').value = 18000;
    document.getElementById('total-cotizacion').textContent = '$0.00';
    document.getElementById('version-actual').textContent = 'v01';
    document.getElementById('historial-versiones').innerHTML = '';
    document.getElementById('estatus-disponibilidad').textContent = 'Sin validar';
    document.getElementById('estatus-disponibilidad').className = 'stat muted';
    document.getElementById('estatus-cotizacion').textContent = 'Borrador';
    document.getElementById('estatus-cotizacion').className = 'stat muted';
    renderExtras();
    renderVehiclePreview('');
    renderBookingCalendar();
    renderTablaFlota();
    renderTablaCotizaciones();
    refreshFlowUI();
    refreshKPIs();
    toast('Sesión reiniciada.', 'info');
  });

});
