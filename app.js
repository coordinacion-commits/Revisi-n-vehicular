// ─── REVISIÓN VEHICULAR FUCESA · app.js (FASE 4: + envío al servidor) ──────
// Todo se guarda en IndexedDB del teléfono. Nada se borra hasta que el
// servidor confirme (envío en la Fase 4).
'use strict';

const APP_VERSION = '4.0.0';
const FOTO_MAX_PX = 1600, FOTO_CALIDAD = 0.72;   // ~250–400 KB por foto
const CFG = window.APP_CONFIG || {};
const SCRIPT_URL = String(CFG.SCRIPT_URL || '').trim();

/* ════════ Catálogos fijos del diseño ════════ */
const STEPS = [
  { k: 'unidad', t: 'Unidad' }, { k: 'carroceria', t: 'Carrocería' }, { k: 'llantas', t: 'Llantas' },
  { k: 'revision', t: 'Revisión' }, { k: 'fotos', t: 'Fotos' }, { k: 'firmas', t: 'Firmas' }, { k: 'terminar', t: 'Terminar' }
];
const DMG = {
  golpe: { l: 'Golpe / abolladura', c: '#c0392b' }, rayon: { l: 'Rayón', c: '#d68910' },
  roto: { l: 'Roto / estrellado', c: '#7d3c98' }, falta: { l: 'Pieza faltante', c: '#1f6fb2' }
};
const TIRES = [
  { k: 'di', t: 'Delantera izquierda', p: 'DI · piloto' }, { k: 'dd', t: 'Delantera derecha', p: 'DD · copiloto' },
  { k: 'ti', t: 'Trasera izquierda', p: 'TI · piloto' }, { k: 'td', t: 'Trasera derecha', p: 'TD · copiloto' },
  { k: 'ref', t: 'Refacción', p: 'REF · bajo la caja' }
];
const FUEL = ['R', '1/4', '1/2', '3/4', 'F'];
const PHOTOS = [['frente', 'Frente'], ['trasera', 'Trasera'], ['lat_izq', 'Lateral izquierdo'], ['lat_der', 'Lateral derecho'], ['tablero', 'Tablero / kilometraje'], ['interior', 'Interior / cabina']];

const SIDE = `<path d="M28,72 L182,72 L186,38 Q189,26 202,26 L266,26 Q280,26 290,38 L314,68 L380,76 Q396,79 396,94 L396,120 L356,120 A30,30 0 0 0 296,120 L124,120 A30,30 0 0 0 64,120 L28,120 Z" fill="var(--body-fill)" stroke="var(--ink)" stroke-width="2.2" stroke-linejoin="round"/>
<path d="M196,34 L262,34 Q274,34 282,44 L298,66 L192,66 Z" fill="var(--glass)" stroke="var(--ink)" stroke-width="1.6"/>
<line x1="238" y1="34" x2="238" y2="66" stroke="var(--ink)" stroke-width="1.6"/>
<path d="M190,70 L190,116 M240,70 L240,116 M290,70 L290,116" stroke="var(--ink)" stroke-width="1.2" fill="none"/>
<path d="M28,82 L182,82" stroke="var(--ink)" stroke-width="1.2"/>
<rect x="28" y="84" width="7" height="16" fill="#c0392b"/>
<rect x="384" y="82" width="12" height="8" rx="2" fill="#f4d03f" stroke="var(--ink)"/>
<rect x="294" y="58" width="12" height="9" rx="2" fill="var(--body-fill)" stroke="var(--ink)" stroke-width="1.2"/>
<circle cx="94" cy="124" r="24" fill="var(--tire)"/><circle cx="94" cy="124" r="11" fill="var(--glass)" stroke="var(--ink)"/>
<circle cx="326" cy="124" r="24" fill="var(--tire)"/><circle cx="326" cy="124" r="11" fill="var(--glass)" stroke="var(--ink)"/>`;
const FRONT = `<rect x="92" y="28" width="116" height="10" rx="4" fill="var(--body-fill)" stroke="var(--ink)" stroke-width="2"/>
<path d="M60,84 L240,84 Q252,86 254,98 L256,150 L44,150 L46,98 Q48,86 60,84 Z" fill="var(--body-fill)" stroke="var(--ink)" stroke-width="2.2" stroke-linejoin="round"/>
<path d="M92,38 L208,38 L226,82 L74,82 Z" fill="var(--glass)" stroke="var(--ink)" stroke-width="2"/>
<rect x="54" y="60" width="18" height="13" rx="3" fill="var(--body-fill)" stroke="var(--ink)" stroke-width="1.5"/><rect x="228" y="60" width="18" height="13" rx="3" fill="var(--body-fill)" stroke="var(--ink)" stroke-width="1.5"/>
<rect x="104" y="102" width="92" height="32" rx="4" fill="var(--glass)" stroke="var(--ink)" stroke-width="1.6"/>
<path d="M104,110 H196 M104,118 H196 M104,126 H196" stroke="var(--ink)" stroke-width="1"/>
<rect x="56" y="100" width="40" height="16" rx="4" fill="#f4d03f" stroke="var(--ink)" stroke-width="1.5"/><rect x="204" y="100" width="40" height="16" rx="4" fill="#f4d03f" stroke="var(--ink)" stroke-width="1.5"/>
<rect x="38" y="148" width="224" height="16" rx="6" fill="var(--steel)" stroke="var(--ink)" stroke-width="1.5"/>
<rect x="128" y="151" width="44" height="10" rx="1" fill="var(--card)" stroke="var(--ink)"/>
<rect x="52" y="164" width="36" height="26" rx="5" fill="var(--tire)"/><rect x="212" y="164" width="36" height="26" rx="5" fill="var(--tire)"/>`;
const REAR = `<rect x="96" y="30" width="108" height="56" rx="6" fill="var(--body-fill)" stroke="var(--ink)" stroke-width="2"/>
<rect x="108" y="38" width="84" height="30" rx="4" fill="var(--glass)" stroke="var(--ink)" stroke-width="1.6"/>
<rect x="44" y="84" width="212" height="66" rx="5" fill="var(--body-fill)" stroke="var(--ink)" stroke-width="2.2"/>
<rect x="60" y="92" width="180" height="50" rx="3" fill="none" stroke="var(--ink)" stroke-width="1.3"/>
<rect x="136" y="96" width="28" height="7" rx="2" fill="var(--ink)"/>
<rect x="46" y="88" width="12" height="38" rx="2" fill="#c0392b"/><rect x="242" y="88" width="12" height="38" rx="2" fill="#c0392b"/>
<rect x="38" y="148" width="224" height="16" rx="6" fill="var(--steel)" stroke="var(--ink)" stroke-width="1.5"/>
<rect x="124" y="114" width="52" height="20" rx="2" fill="var(--card)" stroke="var(--ink)"/>
<rect x="52" y="164" width="36" height="26" rx="5" fill="var(--tire)"/><rect x="212" y="164" width="36" height="26" rx="5" fill="var(--tire)"/>`;
const VIEWS = [
  { k: 'frente', t: 'Frente', vb: [0, 0, 300, 200], g: FRONT, hint: '' },
  { k: 'trasera', t: 'Trasera', vb: [0, 0, 300, 200], g: REAR, hint: '' },
  { k: 'lat_izq', t: 'Lateral izquierdo', vb: [0, 0, 420, 160], g: `<g transform="translate(420,0) scale(-1,1)">${SIDE}</g>`, hint: '◂ frente' },
  { k: 'lat_der', t: 'Lateral derecho', vb: [0, 0, 420, 160], g: SIDE, hint: 'frente ▸' }
];

/* Respuestas por tipo de pregunta. "hallazgo": cuenta como falla. "texto": obliga a escribir. */
const OPCIONES = {
  bfn: [['Bien', 'Bien', 'ok'], ['Falla', 'Falla', 'bad'], ['N/A', 'N/A']],
  sn:  [['Sí', 'Sí', 'ok'], ['No', 'No', 'bad']],
  sni: [['Sí', 'Sí', 'ok'], ['No', 'No', 'bad'], ['Incompleto', 'Incompleto', 'warn']]
};
const esHallazgo = (q, v) => (q.tipo === 'bfn' && v === 'Falla') || ((q.tipo === 'sn' || q.tipo === 'sni') && v === 'No') || (q.tipo === 'sni' && v === 'Incompleto');
const pideTexto = (q, v) => (q.tipo === 'bfn' && v === 'Falla') || (q.tipo === 'sni' && v === 'Incompleto');
const textoPide = (q, v) => v === 'Incompleto' ? '¿Qué le falta? (obligatorio)' : '¿Qué falla? (obligatorio)';

/* ════════ Utilidades ════════ */
const $ = s => document.querySelector(s);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function uuid() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  const b = new Uint8Array(16); (window.crypto || {}).getRandomValues ? crypto.getRandomValues(b) : b.forEach((_, i) => b[i] = Math.random() * 256 | 0);
  b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
  const h = [...b].map(x => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
const refCorta = u => String(u || '').replace(/-/g, '').slice(0, 6).toUpperCase();
// Fecha y hora del TELÉFONO con su zona: 2026-11-06T09:41:05-06:00
function isoLocal(d = new Date()) {
  const p = n => String(Math.abs(n)).padStart(2, '0'), o = -d.getTimezoneOffset();
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}${o >= 0 ? '+' : '-'}${p(Math.trunc(o / 60))}:${p(o % 60)}`;
}
function fmtFecha(iso, conHora = true) {
  if (!iso) return '—';
  const d = new Date(iso); if (isNaN(d)) return String(iso);
  return d.toLocaleString('es-MX', conHora ? { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' } : { day: '2-digit', month: 'short', year: 'numeric' });
}
const fmtKm = v => (v === '' || v == null || isNaN(+v)) ? '—' : Number(v).toLocaleString('es-MX') + ' km';
const normPlacas = v => String(v || '').toUpperCase().replace(/\s+/g, '').trim();

/* ════════ IndexedDB ════════ */
const DB = {
  _db: null,
  open() {
    if (this._db) return Promise.resolve(this._db);
    return new Promise((res, rej) => {
      const r = indexedDB.open('revisiones-fucesa', 1);
      r.onupgradeneeded = () => {
        const db = r.result;
        if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta', { keyPath: 'k' });
        if (!db.objectStoreNames.contains('borradores')) db.createObjectStore('borradores', { keyPath: 'uuid' });
        if (!db.objectStoreNames.contains('pendientes')) db.createObjectStore('pendientes', { keyPath: 'uuid' });
        if (!db.objectStoreNames.contains('archivos')) { const s = db.createObjectStore('archivos', { keyPath: 'uuid' }); s.createIndex('revision', 'revision'); }
      };
      r.onsuccess = () => { this._db = r.result; res(this._db); };
      r.onerror = () => rej(r.error);
    });
  },
  async tx(store, mode, fn) {
    const db = await this.open();
    return new Promise((res, rej) => {
      const t = db.transaction(store, mode); const s = t.objectStore(store);
      let out; const r = fn(s); if (r) r.onsuccess = () => { out = r.result; };
      t.oncomplete = () => res(out); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error);
    });
  },
  get(store, key) { return this.tx(store, 'readonly', s => s.get(key)); },
  put(store, val) { return this.tx(store, 'readwrite', s => s.put(val)); },
  del(store, key) { return this.tx(store, 'readwrite', s => s.delete(key)); },
  all(store) { return this.tx(store, 'readonly', s => s.getAll()); },
  async meta(k, v) {
    if (v === undefined) { const r = await this.get('meta', k); return r ? r.v : null; }
    return this.put('meta', { k, v });
  }
};
// Mueve un borrador a "por enviar" en una sola transacción: nunca queda en los dos ni en ninguno.
async function moverAPendientes(rev) {
  const db = await DB.open();
  return new Promise((res, rej) => {
    const t = db.transaction(['borradores', 'pendientes'], 'readwrite');
    t.objectStore('pendientes').put(rev); t.objectStore('borradores').delete(rev.uuid);
    t.oncomplete = res; t.onerror = () => rej(t.error);
  });
}

/* ════════ Estado ════════ */
const S = {
  token: null, tokenMalo: false, catalogo: null, catFecha: null,
  online: null, ultimaRevisionRed: 0,
  borradores: [], pendientes: [],
  vista: 'inicio', R: null, paso: 0, intento: false, guardado: null, aviso: '', swReg: null,
  unidadQR: null
};

/* ════════ Arranque ════════ */
async function arrancar() {
  try { await DB.open(); } catch (e) {
    $('#app').innerHTML = `<div class="errbox">Este navegador no permite guardar datos (IndexedDB). Abre la app en Chrome o Safari normal, no en modo privado.</div>`;
    return;
  }
  // Pide al navegador no borrar los datos de la app cuando falte espacio.
  try { if (navigator.storage && navigator.storage.persist) await navigator.storage.persist(); } catch (e) { }

  leerParametros_();
  S.token = S.token || await DB.meta('token');
  const cat = await DB.meta('catalogo');
  if (cat) { S.catalogo = cat.data; S.catFecha = cat.fecha; }
  await recargarListas();
  render();
  // Si se abrió con el QR de una unidad, empieza la revisión con esa unidad elegida (se puede cambiar).
  if (S.unidadQR && S.token && S.catalogo) { const u = S.unidadQR; S.unidadQR = null; nuevaRevision(u); }
  registrarSW();
  revisarRed();
  setInterval(revisarRed, 60 * 1000);
  window.addEventListener('online', () => revisarRed(true));
  window.addEventListener('offline', () => { S.online = false; pintarEstado(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) guardarYa(); else revisarRed(); });
  window.addEventListener('pagehide', guardarYa);
}

// ?t=TOKEN&u=PLACAS (también acepta #t=...). Quita el token de la barra de dirección.
function leerParametros_() {
  const q = new URLSearchParams(location.search);
  const h = new URLSearchParams(location.hash.replace(/^#/, ''));
  const t = q.get('t') || h.get('t'); const u = q.get('u') || h.get('u');
  if (t) { S.token = t.trim(); DB.meta('token', S.token); }
  if (u) S.unidadQR = normPlacas(u);
  if (t || u) history.replaceState(null, '', location.pathname);
}

async function recargarListas() {
  S.borradores = (await DB.all('borradores')).sort((a, b) => b.actualizado.localeCompare(a.actualizado));
  S.pendientes = (await DB.all('pendientes')).sort((a, b) => b.fechaFin.localeCompare(a.fechaFin));
  S.enviadas = (await DB.meta('enviadas')) || [];
  pintarEstado();
}

/* ════════ Conexión y catálogos ════════ */
// No se confía en navigator.onLine: se hace una petición real al servidor.
async function revisarRed(forzar) {
  if (!SCRIPT_URL || /PEGA_AQUI/.test(SCRIPT_URL)) { S.online = false; pintarEstado('Falta la URL del servidor en config.js'); return; }
  const ahora = Date.now();
  if (!forzar && ahora - S.ultimaRevisionRed < 20 * 1000) return;
  S.ultimaRevisionRed = ahora;
  const ok = await pedir({ accion: 'ping' }, 8000).then(j => !!(j && j.ok)).catch(() => false);
  S.online = ok; pintarEstado();
  if (ok && S.token) {
    const viejo = !S.catFecha || (ahora - new Date(S.catFecha).getTime() > 10 * 60 * 1000);
    if (viejo || forzar) actualizarCatalogo();
  }
  if (ok && S.swReg) S.swReg.update().catch(() => { });
  if (ok && S.token) sincronizar();
}

async function pedir(params, ms = 15000) {
  const ctrl = new AbortController(); const tm = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(SCRIPT_URL + '?' + new URLSearchParams(params), { cache: 'no-store', signal: ctrl.signal });
    return await r.json();
  } finally { clearTimeout(tm); }
}

async function actualizarCatalogo() {
  try {
    const j = await pedir({ accion: 'catalogos', token: S.token }, 20000);
    if (j && j.error === 'token') { S.tokenMalo = true; render(); return; }
    if (!j || !j.ok) return;
    S.tokenMalo = false; S.catalogo = j; S.catFecha = new Date().toISOString();
    await DB.meta('catalogo', { data: j, fecha: S.catFecha });
    pintarEstado();
    if (S.vista === 'inicio' || (S.vista === 'captura' && S.paso === 0 && !tecleando())) render();
  } catch (e) { /* sin señal: se queda la copia guardada */ }
}

function pintarEstado(msg) {
  const dot = $('#stDot'), net = $('#stNet');
  dot.className = 'dot' + (S.online === true ? ' on' : S.online === false ? ' off' : '');
  net.textContent = msg || (S.online === true ? 'En línea' : S.online === false ? 'Sin conexión' : 'Revisando conexión…');
  $('#stCat').textContent = S.catFecha ? '· Listas del ' + fmtFecha(S.catFecha) : '· Sin listas descargadas';
  const n = S.pendientes.length;
  $('#stPend').textContent = ENVIO.activo ? (ENVIO.progreso || 'Enviando…') : n ? `${n} ${n === 1 ? 'revisión' : 'revisiones'} por enviar` : 'Todo enviado ✓';
}

/* ════════ Service worker y versiones ════════ */
function registrarSW() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('sw.js').then(reg => {
    S.swReg = reg;
    if (reg.waiting && navigator.serviceWorker.controller) avisoVersion();
    reg.addEventListener('updatefound', () => {
      const nw = reg.installing; if (!nw) return;
      nw.addEventListener('statechange', () => { if (nw.state === 'installed' && navigator.serviceWorker.controller) avisoVersion(); });
    });
  }).catch(() => { });
  let recargando = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (recargando) return; recargando = true; location.reload(); });
}
function avisoVersion() {
  $('#banner').innerHTML = `<div class="banner"><span>Hay una versión nueva de la app.</span><button class="btn" id="btnAct" type="button">Actualizar</button></div>`;
  $('#btnAct').onclick = async () => {
    await guardarYa(); // borradores y pendientes viven en IndexedDB y no se tocan
    if (S.swReg && S.swReg.waiting) S.swReg.waiting.postMessage({ tipo: 'ACTUALIZAR' }); else location.reload();
  };
}

/* ════════ Borrador ════════ */
function nuevaRevision(placas) {
  const c = S.catalogo || {};
  const plantilla = (c.plantilla || []).map(p => ({ ...p }));
  const R = {
    uuid: uuid(), version: APP_VERSION, creado: isoLocal(), actualizado: isoLocal(), fechaInicio: isoLocal(),
    revisor: '', codigo: '', movimiento: '', placas: '', unidad: null, manual: false,
    km: '', combustible: '', conductor: '', destino: '', salida: null, kmConfirmado: false,
    danos: [], dmgType: 'golpe',
    llantas: Object.fromEntries(TIRES.map(t => [t.k, { estado: '', mm: '', psi: '' }])),
    plantilla, respuestas: {}, obs: '', fotos: {},
    firmas: { entrega: { nombre: '', archivo: null, fecha: null, rol: '' }, recibe: { nombre: '', archivo: null, fecha: null, rol: '' } }
  };
  const ultimo = S._ultimoRevisor; if (ultimo && (c.personal || []).includes(ultimo)) R.revisor = ultimo;
  S.R = R; S.paso = 0; S.intento = false; S.vista = 'captura'; S.otro = {};
  if (placas) elegirUnidad(placas);
  guardarYa(); render(); window.scrollTo(0, 0);
}
let tGuardar = null;
function cambio() { S.R.actualizado = isoLocal(); clearTimeout(tGuardar); tGuardar = setTimeout(guardarYa, 350); }
async function guardarYa() {
  clearTimeout(tGuardar);
  if (S.vista !== 'captura' || !S.R) return;
  try {
    await DB.put('borradores', S.R);
    S.guardado = new Date();
    const el = $('#saved'); if (el) el.textContent = 'Borrador guardado en el teléfono · ' + S.guardado.toLocaleTimeString('es-MX');
  } catch (e) {
    const el = $('#saved'); if (el) el.textContent = '⚠ No se pudo guardar el borrador. Revisa el espacio del teléfono.';
  }
}

/* ════════ Unidades y salidas abiertas ════════ */
const vehiculos = () => (S.catalogo && S.catalogo.vehiculos) || [];
const personal = () => (S.catalogo && S.catalogo.personal) || [];
function nombreUnidad(u) { return u ? (u.nombre || [u.marca, u.modelo].filter(Boolean).join(' ') || u.placas) : ''; }
// Salida abierta: la del servidor o una guardada en este teléfono que aún no tiene regreso.
function salidaAbierta(placas) {
  const p = normPlacas(placas);
  const locales = S.pendientes.filter(x => x.movimiento === 'Salida' && x.placas === p);
  const cerradas = new Set(S.pendientes.filter(x => x.movimiento === 'Regreso' && x.salida).map(x => x.salida.ref));
  const local = locales.find(x => !cerradas.has(x.uuid));
  const srv = S.catalogo && S.catalogo.abiertas ? S.catalogo.abiertas[p] : null;
  const srvCerrada = srv && (cerradas.has(srv.uuid) || cerradas.has(srv.folio));
  if (local && (!srv || srvCerrada || (local.fechaFin > (srv.fecha || '')))) {
    return { origen: 'telefono', ref: local.uuid, folio: '', etiqueta: 'Ref. ' + refCorta(local.uuid), fecha: local.fechaFin, km: local.km, combustible: local.combustible, conductor: local.conductor, destino: local.destino, danos: local.danos || [] };
  }
  if (srv && !srvCerrada) return { origen: 'servidor', ref: srv.uuid || srv.folio, folio: srv.folio, etiqueta: srv.folio || refCorta(srv.uuid), fecha: srv.fecha, km: srv.km, combustible: srv.combustible, conductor: srv.conductor, destino: srv.destino, danos: srv.danos || [] };
  return null;
}
function kmUltimo(placas) {
  const v = vehiculos().find(x => x.placas === normPlacas(placas));
  let km = v && v.kmUltimo ? +v.kmUltimo : 0;
  S.pendientes.filter(x => x.placas === normPlacas(placas)).forEach(x => { if (+x.km > km) km = +x.km; });
  return km || null;
}
function elegirUnidad(placas) {
  const R = S.R, p = normPlacas(placas);
  const v = vehiculos().find(x => x.placas === p);
  R.manual = false; R.placas = p;
  R.unidad = v ? { placas: v.placas, nombre: v.nombre, tipo: v.tipo, marca: v.marca, modelo: v.modelo, anio: v.anio, color: v.color } : { placas: p, nombre: '', marca: '', modelo: '', anio: '', color: '' };
  if (!v) R.manual = true;
  ligarSalida();
}
function ligarSalida() {
  const R = S.R;
  R.salida = null;
  if (R.movimiento !== 'Regreso' || !R.placas) return;
  const s = salidaAbierta(R.placas);
  if (s) {
    R.salida = { ref: s.ref, folio: s.folio, etiqueta: s.etiqueta, origen: s.origen, fecha: s.fecha, km: s.km, combustible: s.combustible, conductor: s.conductor, danos: s.danos };
    if (!R.conductor) R.conductor = s.conductor || '';
    if (!R.destino) R.destino = s.destino || '';
  }
}

/* ════════ Validación ════════ */
// Devuelve { faltas:[{paso, id, texto}], avisos:[texto] }
function validar(R) {
  const faltas = [], avisos = [];
  const F = (paso, id, texto) => faltas.push({ paso, id, texto });
  if (!R.revisor) F(0, 'f-revisor', 'Quién revisa');
  if (S.catalogo && S.catalogo.ajustes && S.catalogo.ajustes.usarCodigo && !String(R.codigo || '').trim()) F(0, 'f-codigo', 'Código de acceso');
  if (!R.movimiento) F(0, 'f-mov', 'Salida o regreso');
  if (!R.placas) F(0, 'f-unidad', 'Unidad');
  if (R.km === '' || isNaN(+R.km) || +R.km <= 0) F(0, 'f-km', 'Kilometraje');
  else {
    const k = +R.km;
    if (k > 2000000) F(0, 'f-km', 'Kilometraje fuera de rango');
    const ult = kmUltimo(R.placas);
    if (ult && k < ult) avisos.push(`El kilometraje (${fmtKm(k)}) es menor que el último conocido (${fmtKm(ult)}).`);
    const max = (S.catalogo && S.catalogo.ajustes && S.catalogo.ajustes.kmMaxViaje) || 2000;
    if (R.salida && R.salida.km && k - R.salida.km > max) avisos.push(`El recorrido (${fmtKm(k - R.salida.km)}) supera ${fmtKm(max)}. Verifica el número.`);
  }
  if (!R.combustible) F(0, 'f-fuel', 'Nivel de combustible');
  if (R.movimiento === 'Regreso' && !R.salida) avisos.push('No se encontró la salida de esta unidad. El regreso se guardará y el servidor lo ligará al recibirlo.');
  R.danos.forEach((d, i) => { if (!String(d.n || '').trim()) avisos.push(`El daño ${i + 1} no tiene descripción.`); });
  TIRES.forEach(t => { if (!R.llantas[t.k].estado) F(2, 't-' + t.k, 'Estado de llanta: ' + t.t); });
  if (!nFotos(R, 'llanta:ref')) F(2, 'ph-llanta-ref', 'Foto de la llanta de refacción');
  R.plantilla.forEach(q => {
    const a = R.respuestas[q.id] || {};
    const vacio = a.valor === undefined || a.valor === '' || a.valor === null;
    if (q.obligatoria && vacio) F(3, 'q-' + q.id, q.pregunta);
    else if (pideTexto(q, a.valor) && !String(a.comentario || '').trim()) F(3, 'q-' + q.id, (a.valor === 'Incompleto' ? 'Qué falta: ' : 'Comentario de la falla: ') + q.pregunta);
  });
  R.plantilla.forEach(q => { if (q.exigeFoto && !nFotos(R, 'q:' + q.id)) F(3, 'q-' + q.id, 'Foto requerida: ' + q.pregunta); });
  PHOTOS.forEach(([k, l]) => { if (!nFotos(R, 'fijo:' + k)) F(4, 'ph-fijo-' + k, 'Foto: ' + l); });
  ['entrega', 'recibe'].forEach(k => {
    const t = k === 'entrega' ? 'quien entrega' : 'quien recibe', f = R.firmas[k];
    if (!f.nombre.trim()) F(5, 'f-' + k, 'Nombre de ' + t);
    if (!f.archivo) F(5, 'f-' + k, 'Firma de ' + t);
  });
  return { faltas, avisos };
}

/* ════════ Render ════════ */
function render() {
  pintarEstado();
  const bar = $('#bar');
  bar.hidden = S.vista !== 'captura';
  let h = '';
  if (S.vista === 'inicio') h = vistaInicio();
  else if (S.vista === 'pendientes') h = vistaPendientes();
  else if (S.vista === 'detalle') h = vistaDetalle(S.detalle);
  else if (S.vista === 'hecho') h = vistaHecho();
  else if (S.vista === 'captura') h = vistaCaptura();
  $('#app').innerHTML = h;
  if (S.vista === 'captura') pintarBarra();
  pintarMiniaturas();
  if (S.vista === 'captura' && S.paso === 5) iniciarFirmas();
}
function tecleando() { const a = document.activeElement; return a && /INPUT|TEXTAREA|SELECT/.test(a.tagName); }

function vistaInicio() {
  const emp = (S.catalogo && S.catalogo.ajustes && S.catalogo.ajustes.empresa) || CFG.EMPRESA || 'Fucesa';
  let h = `<h1>Revisión vehicular</h1><p class="lead">${esc(emp)} · salida y regreso de unidades</p><div class="stack">`;
  if (!S.token || S.tokenMalo) {
    h += `<section class="panel stack"><h2>${S.tokenMalo ? 'Vuelve a vincular la app' : 'Vincula esta app'}</h2>
      <p class="lead" style="margin:0">${S.tokenMalo ? 'El enlace de esta app ya no es válido.' : 'Falta vincular la app con Fucesa.'} Escanea el <b>QR general</b> con el botón de abajo, o pega el enlace de instalación.</p>
      <button class="btn primary big" type="button" data-act="scan">Escanear QR general</button>
      <label class="f">O pega el enlace o el token<input type="text" id="tokenIn" autocomplete="off" placeholder="https://…?t=…"></label>
      <button class="btn" type="button" data-act="token">Guardar</button></section>`;
  } else if (!S.catalogo) {
    h += `<section class="panel"><h2>Descargando listas…</h2><p class="lead" style="margin:0">La primera vez se necesita señal para bajar las unidades, el personal y las preguntas. Después funciona sin señal.</p></section>`;
  }
  if (S.token && S.catalogo) {
    h += `<button class="btn primary big" type="button" data-act="nueva">Nueva revisión</button>
      <button class="btn" type="button" data-act="scan">Escanear QR de la unidad</button>`;
  }
  if (S.borradores.length) {
    h += `<h3 style="margin-top:8px">Sin terminar (${S.borradores.length})</h3><div class="list">${S.borradores.map(b => `
      <div class="row"><b>${esc(b.movimiento || 'Revisión')} · ${esc(nombreUnidad(b.unidad) || 'sin unidad')}</b><span class="st pend">Borrador</span>
      <span class="meta">Ref. <span class="mono">${refCorta(b.uuid)}</span> · ${esc(b.revisor || 'sin revisor')} · último cambio ${fmtFecha(b.actualizado)}</span>
      <span class="acts"><button class="btn small primary" type="button" data-resume="${b.uuid}">Continuar</button>
      <button class="btn small" type="button" data-delb="${b.uuid}">${S.confirmDel === b.uuid ? '¿Seguro? Toca otra vez' : 'Descartar'}</button></span></div>`).join('')}</div>`;
  }
  h += `<button class="btn" type="button" data-act="pendientes">Envíos · ${S.pendientes.length ? S.pendientes.length + ' por enviar' : 'todo enviado'}</button>`;
  h += `</div><p class="foot">App ${APP_VERSION}${S.catFecha ? ' · listas del ' + fmtFecha(S.catFecha) : ''}</p>`;
  return h;
}

function estadoEnvio(p) {
  const sy = p.sync || {};
  if (ENVIO.activo && ENVIO.actual === p.uuid) return { cls: 'pend', t: ENVIO.progreso || 'Enviando…' };
  if (sy.error && sy.siguiente) return { cls: 'ruta', t: `No se envió: ${sy.error}. Reintenta ${new Date(sy.siguiente).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}` };
  if (sy.folio) return { cls: 'pend', t: `Folio ${sy.folio} · faltan ${(sy.faltan || []).length} archivo(s)` };
  return { cls: 'pend', t: S.online ? 'En espera de envío' : 'Esperando señal' };
}
function vistaPendientes() {
  let h = `<button class="btn small" type="button" data-act="inicio">‹ Inicio</button><h1 style="margin-top:10px">Envíos</h1>
    <p class="lead">Las revisiones se envían solas cuando hay señal. Se borran del teléfono solo cuando el servidor confirma que llegaron completas.</p>`;
  if (S.pendientes.length) h += `<button class="btn primary" type="button" data-act="enviar" ${ENVIO.activo ? 'disabled' : ''} style="width:100%;margin-bottom:6px">${ENVIO.activo ? 'Enviando…' : S.online ? 'Enviar ahora' : 'Reintentar ahora'}</button>
    ${!S.online && !ENVIO.activo ? '<p class="lead" style="font-size:.85rem;margin:0 0 12px">Sin señal. Se enviará solo al reconectar.</p>' : '<div style="height:6px"></div>'}`;
  h += `<h3>Por enviar (${S.pendientes.length})</h3>`;
  if (!S.pendientes.length) h += `<div class="empty" style="margin-top:8px">Todo enviado. No hay nada pendiente en este teléfono.</div>`;
  else h += `<div class="list" style="margin-top:8px">${S.pendientes.map(p => { const e = estadoEnvio(p); return `<div class="row">
    <b>${esc(p.movimiento)} · ${esc(nombreUnidad(p.unidad))}</b><span class="mono" style="font-size:.8rem">${refCorta(p.uuid)}</span>
    <span class="meta">${esc(p.placas)} · ${fmtKm(p.km)} · ${fmtFecha(p.fechaFin)} · ${totalFotos(p)} foto(s)</span>
    <span class="meta"><span class="st ${e.cls}" style="white-space:normal">${esc(e.t)}</span></span>
    <span class="acts"><button class="btn small" type="button" data-ver="${p.uuid}">Ver</button>
    <button class="btn small${S.confirmDescartar === p.uuid ? ' danger go' : ' danger'}" type="button" data-descartar="${p.uuid}" ${ENVIO.activo && ENVIO.actual === p.uuid ? 'disabled' : ''}>${S.confirmDescartar === p.uuid ? '¿Seguro? Toca otra vez' : 'Descartar'}</button></span>
    ${S.confirmDescartar === p.uuid ? `<span class="meta" style="color:var(--bad)">Se borrará del teléfono con sus fotos y no se podrá recuperar.${p.sync && p.sync.folio ? ' Ya tiene folio ' + esc(p.sync.folio) + ': en el Sheet quedará como "Recibiendo" (incompleta).' : ''}</span>` : ''}</div>`; }).join('')}</div>`;
  const env = S.enviadas || [];
  if (env.length) h += `<h3 style="margin-top:18px">Enviadas desde este teléfono</h3><div class="list" style="margin-top:8px">${env.slice(0, 15).map(x => `<div class="row">
    <b>${esc(x.folio)}</b><span class="st disp">${esc(x.estado || 'Recibida')}</span>
    <span class="meta">${esc(x.movimiento)} · ${esc(x.unidad)} · capturada ${fmtFecha(x.fechaFin)} · enviada ${fmtFecha(x.enviado)}</span></div>`).join('')}</div>`;
  return h;
}

function vistaDetalle(p) {
  if (!p) return '';
  const fallas = (p.plantilla || []).filter(q => esHallazgo(q, (p.respuestas[q.id] || {}).valor));
  return `<button class="btn small" type="button" data-act="pendientes">‹ Envíos</button>
  <h1 style="margin-top:10px">${esc(p.movimiento)} · ${esc(nombreUnidad(p.unidad))}</h1>
  <p class="lead">Ref. provisional <span class="mono">${refCorta(p.uuid)}</span> · capturada ${fmtFecha(p.fechaFin)}</p>
  <div class="stack"><section class="panel"><dl class="kv">${[['Placas', p.placas], ['Kilometraje', fmtKm(p.km)], ['Combustible', p.combustible], ['Conductor', p.conductor], ['Destino', p.destino], ['Revisó', p.revisor], ['Entrega', p.firmas.entrega.nombre], ['Recibe', p.firmas.recibe.nombre]].map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v || '—')}</dd></div>`).join('')}</dl></section>
  <section class="panel"><h3>Evidencias</h3><p style="margin:6px 0 0">${totalFotos(p)} foto(s) · firmas: ${['entrega', 'recibe'].map(k => p.firmas[k].archivo ? esc(p.firmas[k].nombre) : 'falta').join(' y ')}</p></section>
  <section class="panel"><h3>Hallazgos</h3><p style="margin:6px 0 0">${p.danos.length} daño(s) marcados · ${fallas.length} falla(s)${fallas.length ? ': ' + esc(fallas.map(q => q.pregunta).join(', ')) : ''} · llantas en mal estado: ${TIRES.filter(t => p.llantas[t.k].estado === 'Malo').map(t => t.t).join(', ') || 'ninguna'}</p></section></div>`;
}

function vistaHecho() {
  const p = S.hecho;
  return `<section class="panel" style="text-align:center"><h2>Revisión guardada</h2>
    <p class="lead" style="margin:6px 0">Referencia provisional</p><div class="ref">${refCorta(p.uuid)}</div>
    ${(() => { const env = (S.enviadas || []).find(x => x.uuid === p.uuid); return env ? `<p class="lead" style="margin:12px auto 4px">Enviada con folio</p><div class="ref">${esc(env.folio)}</div><p class="lead" style="margin:6px auto 18px">Ya está en el Sheet con su PDF.</p>` : `<p class="lead" style="margin:12px auto 18px;max-width:40ch">${ENVIO.activo ? 'Enviando… ' + esc(ENVIO.progreso) : 'Quedó guardada en el teléfono. Se enviará sola cuando haya señal; ahí recibirá su folio definitivo.'}</p>`; })()}
    <div class="stack"><button class="btn primary big" type="button" data-act="nueva">Nueva revisión</button><button class="btn" type="button" data-act="inicio">Ir al inicio</button></div></section>`;
}

/* ── Captura ── */
function vistaCaptura() {
  const R = S.R; const v = S.intento ? validar(R) : null;
  const pasosConError = new Set(v ? v.faltas.map(f => f.paso) : []);
  let h = `<nav class="rail" aria-label="Pasos">${STEPS.map((s, i) => `<button type="button" data-step="${i}" ${i === S.paso ? 'aria-current="step"' : ''} class="${pasosConError.has(i) ? 'err' : ''}"><span class="n">${pasosConError.has(i) ? '!' : i + 1}</span>${s.t}</button>`).join('')}</nav>`;
  h += `<section class="panel stack">${[pasoUnidad, pasoCarroceria, pasoLlantas, pasoRevision, pasoFotos, pasoFirmas, pasoTerminar][S.paso](R, v)}</section>`;
  return h;
}
function seg(name, opts, cur) {
  return `<div class="seg" role="group">${opts.map(([val, l, cls]) => `<button type="button" class="${cls || ''}" data-seg="${name}" data-v="${esc(val)}" aria-pressed="${cur === val}">${esc(l)}</button>`).join('')}</div>`;
}
const miss = (v, id) => v && v.faltas.some(f => f.id === id) ? ' style="outline:2px solid var(--bad);outline-offset:3px;border-radius:8px"' : '';
// Lista desplegable de Personal + "Otra persona (escribir)". Funciona igual en iPhone y Android.
// key: 'f:conductor' o 'sn:entrega' / 'sn:recibe'.
function selPersona(key, valor, idBase) {
  const lista = personal(); S.otro = S.otro || {};
  const otro = (valor && !lista.includes(valor)) || S.otro[key];
  const [tipo, campo] = key.split(':');
  const attr = tipo === 'sn' ? `data-sn="${campo}"` : `data-f="${campo}"`;
  return `<select id="${idBase}" data-psel="${key}"><option value="">Elige un nombre</option>${lista.map(n => `<option ${!otro && valor === n ? 'selected' : ''}>${esc(n)}</option>`).join('')}<option value="__otro" ${otro ? 'selected' : ''}>Otra persona (escribir)</option></select>
    ${otro ? `<input type="text" id="${idBase}-otro" ${attr} value="${esc(valor)}" placeholder="Nombre completo" autocomplete="off" style="margin-top:6px">` : ''}`;
}
function datalistPersonal() { return `<datalist id="dlPersonal">${personal().map(n => `<option value="${esc(n)}">`).join('')}</datalist>`; }

function pasoUnidad(R, v) {
  const c = S.catalogo || {}, aj = c.ajustes || {};
  let h = `<div><h2>Unidad</h2><p class="lead" style="margin:0">Ref. provisional <span class="mono">${refCorta(R.uuid)}</span></p></div>`;
  h += `<label class="f" id="f-revisor"${miss(v, 'f-revisor')}>Quién revisa *<select id="in-revisor" data-f="revisor"><option value="">Elige tu nombre</option>${personal().map(n => `<option ${R.revisor === n ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></label>`;
  if (aj.usarCodigo) h += `<label class="f" id="f-codigo"${miss(v, 'f-codigo')}>Código *<input type="password" inputmode="numeric" id="in-codigo" data-f="codigo" value="${esc(R.codigo)}" autocomplete="off"><span style="text-transform:none;letter-spacing:0;font-weight:400">Se verifica al enviar.</span></label>`;
  h += `<div id="f-mov"${miss(v, 'f-mov')}><div class="mov">
    <button type="button" data-mov="Salida" aria-pressed="${R.movimiento === 'Salida'}"><b>Salida</b><span>La unidad sale a ruta</span></button>
    <button type="button" data-mov="Regreso" aria-pressed="${R.movimiento === 'Regreso'}"><b>Regreso</b><span>La unidad vuelve de ruta</span></button></div></div>`;
  if (!R.movimiento) return h;
  const lista = vehiculos().slice().sort((a, b) => {
    if (R.movimiento !== 'Regreso') return 0;
    return (salidaAbierta(b.placas) ? 1 : 0) - (salidaAbierta(a.placas) ? 1 : 0);
  });
  h += `<div id="f-unidad"${miss(v, 'f-unidad')}><h3 style="margin-bottom:8px">Unidad *</h3>`;
  if (!lista.length) h += `<div class="empty">No hay unidades activas en la lista. Pide a administración que las agregue en la hoja Vehiculos.</div>`;
  else h += `<div class="units">${lista.map(u => {
    const op = salidaAbierta(u.placas);
    return `<button type="button" class="unit" data-unit="${esc(u.placas)}" aria-pressed="${R.placas === u.placas}">
      <span class="st ${op ? 'ruta' : 'disp'}">${op ? 'En ruta' : 'Disponible'}</span><b>${esc(nombreUnidad(u))}</b><span class="pl">${esc(u.placas)}</span>
      <span class="sub">${esc([u.marca, u.modelo, u.anio].filter(Boolean).join(' '))}${u.color ? ' · ' + esc(u.color) : ''}</span>
      ${op ? `<span class="sub">Salió ${fmtFecha(op.fecha)}${op.conductor ? ' · ' + esc(op.conductor) : ''}</span>` : ''}</button>`;
  }).join('')}</div>`;
  h += `<button type="button" class="linkbtn" data-act="scan">Escanear QR de la unidad</button></div>`;
  if (!R.placas) return h;
  const op = salidaAbierta(R.placas);
  if (R.movimiento === 'Salida' && op) h += `<div class="warnbox">Esta unidad aparece <b>en ruta</b> desde ${fmtFecha(op.fecha)}. Si ya regresó, primero registra el regreso. Puedes continuar si estás seguro.</div>`;
  if (R.movimiento === 'Regreso') {
    if (R.salida) h += `<div class="info"><b>Salida ${esc(R.salida.etiqueta)}</b> · ${fmtFecha(R.salida.fecha)}<br>Kilometraje ${fmtKm(R.salida.km)} · Combustible ${esc(R.salida.combustible || '—')} · ${(R.salida.danos || []).length} daño(s) registrados</div>`;
    else h += `<div class="warnbox">No se encontró una salida de esta unidad. Puedes registrar el regreso; el servidor lo ligará al recibirlo.</div>`;
  }
  const ult = kmUltimo(R.placas);
  h += `<div class="grid">
    <label class="f" id="f-km"${miss(v, 'f-km')}>Kilometraje *<input type="number" inputmode="numeric" id="in-km" data-f="km" value="${esc(R.km)}" placeholder="${ult ? 'Último: ' + ult : 'Ej. 85420'}"></label>
    <div class="f" style="display:flex;flex-direction:column;gap:4px;font-size:.78rem;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.04em;min-width:0"><label for="in-conductor">Conductor</label>${selPersona('f:conductor', R.conductor, 'in-conductor')}</div>
    <label class="f">Destino / área<input type="text" id="in-destino" data-f="destino" value="${esc(R.destino)}"></label></div>${datalistPersonal()}`;
  const k = +R.km;
  if (R.km !== '' && ult && k < ult) h += `<div class="warnbox">Es menor que el último kilometraje conocido (${fmtKm(ult)}). Verifica el tablero; puedes continuar.</div>`;
  if (R.km !== '' && R.salida && R.salida.km && k >= R.salida.km) h += `<p class="lead" style="margin:0">Recorrido: <b>${fmtKm(k - R.salida.km)}</b></p>`;
  h += `<div id="f-fuel"${miss(v, 'f-fuel')}><label class="f" style="margin-bottom:6px">Nivel de combustible *</label><div class="seg fuel">${FUEL.map(f => `<button type="button" data-seg="combustible" data-v="${f}" aria-pressed="${R.combustible === f}">${f}</button>`).join('')}</div></div>`;
  return h;
}

function diagram(view, danos, prev) {
  const ms = danos.map((d, i) => ({ ...d, i })).filter(d => d.v === view.k);
  const pv = (prev || []).map((d, i) => ({ ...d, i })).filter(d => d.v === view.k);
  const r = view.vb[2] > 350 ? 12 : 10;
  return `<svg viewBox="${view.vb.join(' ')}" data-view="${view.k}" role="img" aria-label="Vista ${esc(view.t)}">${view.g}
    ${pv.map(d => `<g pointer-events="none"><circle cx="${d.x}" cy="${d.y}" r="${r - 1}" fill="#8a96a3" stroke="#fff" stroke-width="2" opacity=".85"/><text x="${d.x}" y="${d.y + 4}" text-anchor="middle" font-size="${r - 1}" fill="#fff" font-family="monospace">S${d.i + 1}</text></g>`).join('')}
    ${ms.map(d => `<g data-mi="${d.i}"><circle cx="${d.x}" cy="${d.y}" r="${r}" fill="${(DMG[d.t] || DMG.golpe).c}" stroke="#fff" stroke-width="2"/><text x="${d.x}" y="${d.y + 4}" text-anchor="middle" font-size="${r + 1}" fill="#fff" font-weight="700" font-family="monospace">${d.i + 1}</text></g>`).join('')}</svg>`;
}
function pasoCarroceria(R) {
  const prev = R.salida ? R.salida.danos : null;
  let h = `<div><h2>Carrocería</h2><p class="lead" style="margin:0">Elige el tipo de daño y toca el punto exacto en el dibujo. Toca un número para quitarlo.${prev && prev.length ? ' Los puntos grises (S1, S2…) ya venían en la salida: marca solo los nuevos.' : ''}</p></div>`;
  h += `<div class="dmg-tools">${Object.entries(DMG).map(([k, d]) => `<button type="button" class="btn" data-dmgtype="${k}" aria-pressed="${R.dmgType === k}" style="${R.dmgType === k ? `border-color:${d.c};box-shadow:inset 0 0 0 2px ${d.c}` : ''}"><span class="dot2" style="background:${d.c}"></span>${d.l}</button>`).join('')}</div>`;
  h += `<div class="views">${VIEWS.map(vw => `<div class="view"><h3><span>${vw.t}</span><span class="mono" style="font-size:.75rem">${vw.hint}</span></h3>${diagram(vw, R.danos, prev)}</div>`).join('')}</div>`;
  h += R.danos.length ? `<ul class="dmg-list">${R.danos.map((d, i) => `<li><span class="badge" style="background:${DMG[d.t].c}">${i + 1}</span>
    <div style="min-width:0"><div style="font-size:.78rem;color:var(--muted);font-weight:600">${DMG[d.t].l} · ${VIEWS.find(x => x.k === d.v).t}</div>
    <input type="text" id="dn-${i}" data-dn="${i}" value="${esc(d.n)}" placeholder="Descripción (ej. abolladura 10 cm en salpicadera)"></div>
    <button type="button" class="x" data-deldmg="${i}" aria-label="Quitar daño ${i + 1}">×</button></li>`).join('')}</ul>` : `<p class="lead" style="margin:0">Sin daños marcados. Si la carrocería está bien, continúa.</p>`;
  return h;
}
function pasoLlantas(R, v) {
  return `<div><h2>Llantas</h2><p class="lead" style="margin:0">Revisa las 4 llantas y la refacción. La foto de la refacción es obligatoria.</p></div>
  <div class="tires">${TIRES.map(t => { const L = R.llantas[t.k]; return `<div class="tire" id="t-${t.k}"${miss(v, 't-' + t.k)}><header><h3>${t.t} *</h3><span class="pos">${t.p}</span></header>
    ${seg('tire:' + t.k, [['Bueno', 'Bueno', 'ok'], ['Regular', 'Regular', 'warn'], ['Malo', 'Malo', 'bad']], L.estado)}
    ${fotosSlot(R, 'llanta:' + t.k, t.k === 'ref' ? 'Foto de la refacción' : 'Foto de la llanta', { compacto: true, obligatoria: t.k === 'ref', v })}</div>`; }).join('')}</div>`;
}
function pasoRevision(R, v) {
  if (!R.plantilla.length) return `<h2>Revisión general</h2><div class="empty">No hay preguntas en la plantilla. Conéctate para descargar las listas.</div>`;
  const grupos = []; R.plantilla.forEach(q => { let g = grupos.find(x => x.s === q.seccion); if (!g) grupos.push(g = { s: q.seccion, qs: [] }); g.qs.push(q); });
  return `<div><h2>Revisión general</h2><p class="lead" style="margin:0">Marca cada punto. Usa N/A si no aplica a esta unidad. Una falla o un faltante necesita comentario.</p></div>
  <div>${grupos.map(g => `<div class="group-t">${esc(g.s)}</div>${g.qs.map(q => {
    const a = R.respuestas[q.id] || {}; const falta = v && v.faltas.some(f => f.id === 'q-' + q.id);
    let ctl;
    if (q.tipo === 'numero') ctl = `<input type="number" inputmode="decimal" id="qv-${q.id}" data-q="${q.id}" value="${esc(a.valor ?? '')}" style="max-width:180px">`;
    else if (q.tipo === 'texto') ctl = `<input type="text" id="qv-${q.id}" data-q="${q.id}" value="${esc(a.valor ?? '')}">`;
    else ctl = seg('q:' + q.id, OPCIONES[q.tipo] || OPCIONES.bfn, a.valor);
    const enLinea = !!OPCIONES[q.tipo] || !q.tipo;
    return `<div class="q${falta ? ' missing' : ''}" id="q-${q.id}"><div class="qt"><span>${esc(q.pregunta)}${q.obligatoria ? ' <span class="req">*</span>' : ''}</span>${enLinea ? ctl : ''}</div>
      ${!enLinea ? ctl : ''}
      ${pideTexto(q, a.valor) ? `<input type="text" id="qc-${q.id}" data-qc="${q.id}" value="${esc(a.comentario || '')}" placeholder="${textoPide(q, a.valor)}">` : ''}
      ${q.exigeFoto || esHallazgo(q, a.valor) || nFotos(R, 'q:' + q.id) ? fotosSlot(R, 'q:' + q.id, q.exigeFoto ? 'Foto requerida' : 'Foto de evidencia', { obligatoria: q.exigeFoto, compacto: true }) : ''}</div>`;
  }).join('')}`).join('')}</div>
  <label class="f">Observaciones generales<textarea id="in-obs" data-f="obs" placeholder="Fallas, faltantes o comentarios">${esc(R.obs)}</textarea></label>`;
}
function pasoFotos(R, v) {
  return `<div><h2>Fotos de evidencia</h2><p class="lead" style="margin:0">Una foto por lado, el tablero con el kilometraje y la cabina. Las adicionales son para acercamientos de daños.</p></div>
  <div class="photos-grid">${PHOTOS.map(([k, l]) => fotosSlot(R, 'fijo:' + k, l, { obligatoria: true, v })).join('')}</div>
  ${fotosSlot(R, 'extra', 'Fotos adicionales de daños', { v })}`;
}
function rolesFirma(R) {
  const salida = R.movimiento !== 'Regreso';
  return { entrega: salida ? 'Responsable de flotilla' : 'Conductor', recibe: salida ? 'Conductor' : 'Responsable de flotilla' };
}
function pasoFirmas(R, v) {
  const rol = rolesFirma(R);
  return `<div><h2>Firmas de conformidad</h2><p class="lead" style="margin:0">Ambas partes revisan el reporte, escriben su nombre y firman con el dedo.</p></div>
  <div class="grid">${['entrega', 'recibe'].map(k => { const f = R.firmas[k]; const falta = v && v.faltas.some(x => x.id === 'f-' + k);
    return `<div class="stack sig${falta ? ' falta' : ''}" id="f-${k}"><h3>${k === 'entrega' ? 'Entrega' : 'Recibe'} · <span style="color:var(--muted)">${rol[k]}</span></h3>
    <div class="f" style="display:flex;flex-direction:column;gap:4px;font-size:.78rem;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.04em"><label for="sn-${k}">Nombre completo *</label>${selPersona('sn:' + k, f.nombre, 'sn-' + k)}</div>
    <canvas id="pad-${k}" data-pad="${k}" aria-label="Recuadro para firmar: ${k === 'entrega' ? 'entrega' : 'recibe'}"></canvas>
    <div class="line"><span id="sigst-${k}">${f.archivo ? `<span class="firmado">Firmado · ${fmtFecha(f.fecha)}</span>` : 'Firma aquí con el dedo'}</span>
    <button type="button" class="linkbtn" data-clrfirma="${k}">Borrar firma</button></div></div>`; }).join('')}</div>${datalistPersonal()}
  <p class="lead" style="margin:0;font-size:.88rem">Al firmar, ambas partes aceptan que el estado de la unidad descrito en este reporte corresponde a lo observado en la fecha y hora indicadas.</p>`;
}
function pasoTerminar(R) {
  const v = validar(R);
  const fallas = R.plantilla.filter(q => esHallazgo(q, (R.respuestas[q.id] || {}).valor)).length;
  const malas = TIRES.filter(t => R.llantas[t.k].estado === 'Malo').length;
  let h = `<div><h2>Revisar y guardar</h2><p class="lead" style="margin:0">${esc(R.movimiento || 'Revisión')} · ${esc(nombreUnidad(R.unidad) || 'sin unidad')} · Ref. <span class="mono">${refCorta(R.uuid)}</span></p></div>
  <dl class="kv"><div><dt>Kilometraje</dt><dd>${fmtKm(R.km)}</dd></div><div><dt>Daños nuevos</dt><dd>${R.danos.length}</dd></div><div><dt>Fallas</dt><dd>${fallas}</dd></div><div><dt>Llantas malas</dt><dd>${malas}</dd></div><div><dt>Fotos</dt><dd>${totalFotos(R)}</dd></div></dl>`;
  if (v.faltas.length) h += `<div class="errbox"><b>Faltan ${v.faltas.length} dato(s).</b> Toca cada uno para ir directo.</div><ul class="faltas">${v.faltas.map(f => `<li><button type="button" data-ir="${f.paso}|${f.id}"><span>${esc(STEPS[f.paso].t)} · ${esc(f.texto)}</span></button></li>`).join('')}</ul>`;
  else h += `<div class="info"><b>Todo completo.</b> Al guardar, la revisión queda en el teléfono y se envía cuando haya señal.</div>`;
  if (v.avisos.length) h += `<div class="warnbox"><b>Revisa antes de guardar:</b><ul style="margin:6px 0 0;padding-left:18px">${v.avisos.map(a => `<li>${esc(a)}</li>`).join('')}</ul></div>`;
  return h;
}
function pintarBarra() {
  const ult = S.paso === STEPS.length - 1;
  $('#prev').textContent = S.paso === 0 ? 'Salir' : 'Atrás';
  $('#next').textContent = ult ? 'Guardar revisión' : 'Siguiente';
  $('#saved').textContent = S.guardado ? 'Borrador guardado en el teléfono · ' + S.guardado.toLocaleTimeString('es-MX') : 'Se guarda solo en cada cambio';
}
function irPaso(n, id) {
  S.paso = n; render();
  if (id) { const el = document.getElementById(id); if (el) { el.scrollIntoView({ block: 'center' }); const f = el.querySelector('input,select,textarea,button'); if (f) setTimeout(() => f.focus({ preventScroll: true }), 50); } }
  else window.scrollTo(0, 0);
}
function rerender() { const y = window.scrollY; render(); window.scrollTo(0, y); }

/* ════════ Guardar revisión terminada ════════ */
async function terminar() {
  S.intento = true;
  const v = validar(S.R);
  if (v.faltas.length) { irPaso(STEPS.length - 1); return; }
  const R = S.R;
  R.fechaFin = isoLocal(); R.estado = 'por_enviar';
  // Se guarda el texto de cada pregunta tal como se contestó.
  const roles = rolesFirma(R); ['entrega', 'recibe'].forEach(k => { R.firmas[k].rol = roles[k]; });
  R.respuestasFinal = R.plantilla.map(q => ({ id: q.id, seccion: q.seccion, pregunta: q.pregunta, tipo: q.tipo, valor: (R.respuestas[q.id] || {}).valor ?? '', comentario: (R.respuestas[q.id] || {}).comentario || '' }));
  // Imagen del diagrama con los daños marcados (va en el PDF). Si falla, la revisión se guarda igual.
  try {
    const viejos = (await archivosDe(R.uuid)).filter(a => a.slot === 'diagrama'); for (const a of viejos) await DB.del('archivos', a.uuid);
    const blob = await diagramaPNG(R);
    await guardarArchivo({ uuid: uuid(), revision: R.uuid, tipo: 'diagrama', slot: 'diagrama', nota: '', blob, mime: 'image/png', ancho: 900, alto: 560, bytes: blob.size, capturado: isoLocal() });
  } catch (e) { }
  try {
    await moverAPendientes(R);
  } catch (e) { alertaInline('No se pudo guardar en el teléfono. Libera espacio e intenta de nuevo.'); return; }
  S._ultimoRevisor = R.revisor; try { localStorage.setItem('ultimoRevisor', R.revisor); } catch (e) { }
  S.hecho = R; S.R = null; S.vista = 'hecho'; S.intento = false;
  await recargarListas(); render(); window.scrollTo(0, 0);
  sincronizar(true);
}
function alertaInline(t) { const el = $('#saved'); if (el) el.textContent = '⚠ ' + t; }

/* ════════ Envío al servidor ════════ */
// Tres pasos por revisión: crear (datos) → archivo (uno por foto/firma) → cerrar.
// Cada paso se puede repetir sin duplicar: el servidor reconoce el UUID.
const ENVIO = { activo: false, actual: null, progreso: '' };
const esperaReintento = n => Math.min(30000 * Math.pow(2, Math.max(0, n - 1)), 30 * 60000) * (0.8 + Math.random() * 0.4);

async function sincronizar(forzar) {
  if (ENVIO.activo || !S.token || !SCRIPT_URL || /PEGA_AQUI/.test(SCRIPT_URL)) return;
  if (S.online === false && !forzar) return;
  ENVIO.activo = true; pintarEstado();
  try {
    const lista = (await DB.all('pendientes')).sort((a, b) => a.fechaFin.localeCompare(b.fechaFin));
    for (const p of lista) {
      p.sync = p.sync || { intentos: 0 };
      if (!forzar && p.sync.siguiente && Date.now() < p.sync.siguiente) continue;
      try { await enviarUna(p); }
      catch (e) {
        if (e.token) { S.tokenMalo = true; break; }
        p.sync.intentos = (p.sync.intentos || 0) + 1; p.sync.error = e.message || 'error'; p.sync.siguiente = Date.now() + esperaReintento(p.sync.intentos);
        if (await DB.get('pendientes', p.uuid)) await DB.put('pendientes', p);
        if (e.red) { S.online = false; break; }   // sin señal: no tiene caso seguir con las demás
      }
    }
  } finally {
    ENVIO.activo = false; ENVIO.actual = null; ENVIO.progreso = '';
    await recargarListas();
    if (['inicio', 'pendientes', 'hecho'].includes(S.vista)) rerender();
  }
}
function progreso(t) {
  ENVIO.progreso = t; pintarEstado();
  if (S.vista === 'pendientes' || S.vista === 'hecho') rerender();
}
async function postServidor(cuerpo, ms) {
  const ctrl = new AbortController(); const tm = setTimeout(() => ctrl.abort(), ms || 90000);
  let r;
  try { r = await fetch(SCRIPT_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(Object.assign({ token: S.token }, cuerpo)), signal: ctrl.signal }); }
  catch (e) { const err = new Error('sin señal o se cortó la conexión'); err.red = true; throw err; }
  finally { clearTimeout(tm); }
  let j; try { j = await r.json(); } catch (e) { throw new Error('respuesta inválida del servidor'); }
  if (j && j.error === 'token') { const err = new Error('token'); err.token = true; throw err; }
  return j;
}
async function archivosDe(revUuid) {
  const db = await DB.open();
  return new Promise((res, rej) => {
    const q = db.transaction('archivos').objectStore('archivos').index('revision').getAll(IDBKeyRange.only(revUuid));
    q.onsuccess = () => res(q.result || []); q.onerror = () => rej(q.error);
  });
}
function paqueteRevision(p, archivos) {
  return {
    uuid: p.uuid, version: p.version, movimiento: p.movimiento, placas: p.placas, unidad: p.unidad, revisor: p.revisor, codigo: p.codigo,
    km: p.km, combustible: p.combustible, conductor: p.conductor, destino: p.destino,
    salida: p.salida ? { ref: p.salida.ref, folio: p.salida.folio } : null,
    danos: p.danos, llantas: Object.fromEntries(Object.entries(p.llantas || {}).map(([k, l]) => [k, { estado: l.estado }])),
    respuestasFinal: p.respuestasFinal || [], obs: p.obs, fotos: p.fotos || {},
    firmas: Object.fromEntries(['entrega', 'recibe'].map(k => { const f = (p.firmas || {})[k] || {}; return [k, { nombre: f.nombre || '', archivo: f.archivo || null, fecha: f.fecha || null, rol: f.rol || '' }]; })),
    fechaInicio: p.fechaInicio, fechaFin: p.fechaFin,
    archivos: archivos.map(a => ({ uuid: a.uuid, slot: a.slot, tipo: a.tipo, mime: a.mime, nota: a.nota || '', capturado: a.capturado, bytes: a.bytes })),
    dispositivo: (navigator.userAgent || '').slice(0, 140)
  };
}
const aBase64 = blob => new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(String(fr.result).split(',')[1]); fr.onerror = () => rej(fr.error); fr.readAsDataURL(blob); });
async function miniatura(blob) {
  try {
    const bm = await createImageBitmap(blob); const k = Math.min(1, 480 / Math.max(bm.width, bm.height));
    const c = document.createElement('canvas'); c.width = Math.round(bm.width * k); c.height = Math.round(bm.height * k);
    c.getContext('2d').drawImage(bm, 0, 0, c.width, c.height); if (bm.close) bm.close();
    return await aBase64(await new Promise(r => c.toBlob(r, 'image/jpeg', 0.6)));
  } catch (e) { return undefined; }
}
async function enviarUna(p) {
  ENVIO.actual = p.uuid;
  const etiqueta = `${p.movimiento} ${nombreUnidad(p.unidad)}`;
  const archivos = await archivosDe(p.uuid);
  if (!p.sync.folio) {
    progreso(`${etiqueta}: enviando datos…`);
    const j = await postServidor({ accion: 'crear', revision: paqueteRevision(p, archivos) }, 60000);
    if (!j.ok) throw new Error(j.mensaje || 'el servidor no aceptó los datos');
    p.sync.folio = j.folio; p.sync.faltan = j.faltan || archivos.map(a => a.uuid);
    await DB.put('pendientes', p);
  }
  for (let intento = 0; intento < 2; intento++) {
    const faltan = (p.sync.faltan || []).slice();
    for (let i = 0; i < faltan.length; i++) {
      const a = archivos.find(x => x.uuid === faltan[i]);
      if (!a) throw new Error('falta una foto en el teléfono');
      progreso(`${etiqueta}: archivo ${i + 1} de ${faltan.length}…`);
      const blob = a.blob || (a.bytesData ? new Blob([a.bytesData], { type: a.mime }) : null);
      if (!blob) throw new Error('foto dañada en el teléfono');
      const j = await postServidor({ accion: 'archivo', revision: p.uuid, uuid: a.uuid, slot: a.slot, tipo: a.tipo, mime: a.mime, nota: a.nota || '', capturado: a.capturado, data: await aBase64(blob), mini: a.tipo === 'foto' ? await miniatura(blob) : undefined });
      if (!j.ok) throw new Error(j.mensaje || 'el servidor no aceptó una foto');
      p.sync.faltan = p.sync.faltan.filter(u => u !== a.uuid);
      await DB.put('pendientes', p);
    }
    progreso(`${etiqueta}: confirmando…`);
    const c = await postServidor({ accion: 'cerrar', revision: p.uuid }, 120000);
    if (c.ok) { await confirmarEnviada(p, c); return; }
    if (c.error !== 'faltan') throw new Error(c.mensaje || 'el servidor no pudo cerrar la revisión');
    p.sync.faltan = c.faltan || []; await DB.put('pendientes', p);
  }
  throw new Error('el servidor sigue sin recibir todos los archivos');
}
// Solo aquí se borra la copia del teléfono: el servidor ya confirmó.
async function confirmarEnviada(p, c) {
  const env = (await DB.meta('enviadas')) || [];
  env.unshift({ uuid: p.uuid, folio: c.folio, estado: c.estado || 'Recibida', movimiento: p.movimiento, unidad: nombreUnidad(p.unidad), placas: p.placas, fechaFin: p.fechaFin, enviado: isoLocal() });
  await DB.meta('enviadas', env.slice(0, 50));
  await DB.del('pendientes', p.uuid);
  await borrarArchivosDe(p.uuid);
}

/* Diagrama de carrocería como imagen PNG para el PDF (se hace en el teléfono, sin señal). */
const COLORES_PDF = { 'var(--body-fill)': '#f6f8fa', 'var(--ink)': '#18212c', 'var(--glass)': '#cfdbe6', 'var(--tire)': '#2a2f36', 'var(--steel)': '#2f4458', 'var(--card)': '#ffffff' };
async function diagramaPNG(R) {
  const prev = R.salida ? (R.salida.danos || []) : [];
  const c = document.createElement('canvas'); c.width = 900; c.height = 560;
  const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 900, 560);
  const cajas = { frente: [0, 0, 440, 293], trasera: [460, 0, 440, 293], lat_izq: [0, 330, 440, 168], lat_der: [460, 330, 440, 168] };
  for (const vw of VIEWS) {
    let svg = diagram(vw, R.danos, prev).replace('<svg ', `<svg xmlns="http://www.w3.org/2000/svg" width="${vw.vb[2]}" height="${vw.vb[3]}" `);
    Object.entries(COLORES_PDF).forEach(([k, v]) => { svg = svg.split(k).join(v); });
    const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    await img.decode();
    const [x, y, w, h] = cajas[vw.k];
    ctx.fillStyle = '#5b6876'; ctx.font = 'bold 15px Arial'; ctx.fillText(vw.t + (vw.hint ? '  ' + vw.hint : ''), x + 4, y + 18);
    ctx.drawImage(img, x, y + 24, w, h);
  }
  return await new Promise((res, rej) => c.toBlob(b => b ? res(b) : rej(new Error('png')), 'image/png'));
}

/* ════════ Fotos ════════ */
// Cada foto vive en IndexedDB ("archivos") con su propio UUID. El borrador solo guarda la lista de UUID por casilla.
const nFotos = (R, slot) => ((R.fotos || {})[slot] || []).length;
const totalFotos = R => Object.values(R.fotos || {}).reduce((a, l) => a + l.length, 0);
const slotId = slot => 'ph-' + slot.replace(/[^a-z0-9]+/gi, '-');
const URLS = new Map();

function fotosSlot(R, slot, etiqueta, o = {}) {
  const lista = (R.fotos || {})[slot] || [];
  const falta = o.v && o.obligatoria && !lista.length && S.intento;
  return `<div class="ph-slot${falta ? ' falta' : ''}" id="${slotId(slot)}">
    <div class="ph-head"><span>${esc(etiqueta)}${o.obligatoria ? ' <span class="req">*</span>' : ''}</span><span class="c">${lista.length ? lista.length + ' foto' + (lista.length > 1 ? 's' : '') : ''}</span></div>
    <div class="ph-grid">${lista.map(u => `<button type="button" class="ph-th" data-verfoto="${u}" aria-label="Ver foto"><img data-thumb="${u}" alt=""></button>`).join('')}
      <label class="ph-add">Tomar<br>foto<input type="file" accept="image/*" capture="environment" data-slot="${esc(slot)}" aria-label="Tomar foto: ${esc(etiqueta)}"></label>
      ${o.compacto ? '' : `<label class="ph-add sec">Desde<br>galería<input type="file" accept="image/*" multiple data-slot="${esc(slot)}" aria-label="Elegir de la galería: ${esc(etiqueta)}"></label>`}
    </div></div>`;
}

// Reduce a FOTO_MAX_PX por el lado largo, respeta la orientación de la cámara y convierte a JPEG.
async function comprimir(file) {
  let src, w, h;
  try { src = await createImageBitmap(file, { imageOrientation: 'from-image' }); w = src.width; h = src.height; }
  catch (e) {
    src = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('imagen')); i.src = URL.createObjectURL(file); });
    w = src.naturalWidth; h = src.naturalHeight;
  }
  const k = Math.min(1, FOTO_MAX_PX / Math.max(w, h));
  const c = document.createElement('canvas'); c.width = Math.round(w * k); c.height = Math.round(h * k);
  const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(src, 0, 0, c.width, c.height);
  if (src.close) src.close(); else if (src.src) URL.revokeObjectURL(src.src);
  const blob = await new Promise(res => c.toBlob(res, 'image/jpeg', FOTO_CALIDAD));
  if (!blob) throw new Error('imagen');
  return { blob, ancho: c.width, alto: c.height };
}
// Algunos iPhone viejos no guardan Blob en IndexedDB: se guarda como bytes.
async function guardarArchivo(rec) {
  try { await DB.put('archivos', rec); }
  catch (e) {
    if (e && e.name === 'QuotaExceededError') throw new Error('espacio');
    const buf = await rec.blob.arrayBuffer(); const r2 = { ...rec, blob: null, bytesData: buf };
    try { await DB.put('archivos', r2); } catch (e2) { throw new Error(e2 && e2.name === 'QuotaExceededError' ? 'espacio' : 'guardar'); }
  }
}
async function blobDe(uuid) {
  const r = await DB.get('archivos', uuid); if (!r) return null;
  return r.blob || (r.bytesData ? new Blob([r.bytesData], { type: r.mime }) : null);
}
async function agregarFoto(slot, file) {
  const R = S.R; const { blob, ancho, alto } = await comprimir(file);
  const rec = { uuid: uuid(), revision: R.uuid, tipo: 'foto', slot, nota: '', blob, mime: 'image/jpeg', ancho, alto, bytes: blob.size, capturado: isoLocal(), nombreOriginal: file.name || '' };
  await guardarArchivo(rec);
  (R.fotos[slot] = R.fotos[slot] || []).push(rec.uuid);
  URLS.set(rec.uuid, URL.createObjectURL(blob));
  cambio(); await guardarYa();
}
async function pintarMiniaturas() {
  for (const img of document.querySelectorAll('img[data-thumb]')) {
    const u = img.dataset.thumb;
    if (!URLS.has(u)) { const b = await blobDe(u).catch(() => null); if (!b) continue; URLS.set(u, URL.createObjectURL(b)); }
    img.src = URLS.get(u);
    const rec = S._notas && S._notas[u]; if (rec) { const nt = document.createElement('span'); nt.className = 'nt'; nt.textContent = rec; img.after(nt); }
  }
}
async function borrarArchivosDe(revUuid) {
  const db = await DB.open();
  await new Promise(res => {
    const t = db.transaction('archivos', 'readwrite'); const idx = t.objectStore('archivos').index('revision');
    idx.openCursor(IDBKeyRange.only(revUuid)).onsuccess = e => { const c = e.target.result; if (c) { const u = c.value.uuid; if (URLS.has(u)) { URL.revokeObjectURL(URLS.get(u)); URLS.delete(u); } c.delete(); c.continue(); } };
    t.oncomplete = res; t.onerror = res;
  });
}
async function revisarEspacio() {
  try {
    const e = await navigator.storage.estimate();
    if (e.quota && e.quota - e.usage < 60 * 1024 * 1024) mensaje('El teléfono tiene poco espacio para fotos. Envía las revisiones pendientes cuando haya señal o libera espacio.');
  } catch (err) { }
}

/* Visor: ver en grande, escribir nota, borrar. */
async function abrirVisor(u) {
  const rec = await DB.get('archivos', u); if (!rec) return;
  const b = await blobDe(u); if (!URLS.has(u) && b) URLS.set(u, URL.createObjectURL(b));
  const editable = S.vista === 'captura' && S.R && S.R.uuid === rec.revision;
  S.visor = { u, confirmar: false };
  $('#visor').innerHTML = `<div class="visor" role="dialog" aria-label="Foto">
    <div class="img"><img src="${URLS.get(u)}" alt="Foto"></div>
    <div class="pie"><div class="meta">${esc(rec.ancho)}×${esc(rec.alto)} px · ${Math.round(rec.bytes / 1024)} KB · ${fmtFecha(rec.capturado)}</div>
    ${editable ? `<input type="text" id="notaFoto" value="${esc(rec.nota)}" placeholder="Nota (opcional): qué muestra la foto">` : (rec.nota ? `<div>${esc(rec.nota)}</div>` : '')}
    <div class="acts">${editable ? `<button type="button" class="btn danger" id="vBorrar">Borrar foto</button>` : ''}<button type="button" class="btn primary" id="vCerrar">Listo</button></div></div></div>`;
  document.body.style.overflow = 'hidden';
  const cerrar = async () => {
    if (editable) { const n = $('#notaFoto').value.trim(); if (n !== rec.nota) { rec.nota = n; await DB.put('archivos', rec); (S._notas = S._notas || {})[u] = n; } }
    $('#visor').innerHTML = ''; document.body.style.overflow = ''; S.visor = null; rerender();
  };
  $('#vCerrar').onclick = cerrar;
  if (editable) $('#vBorrar').onclick = async e => {
    if (!S.visor.confirmar) { S.visor.confirmar = true; e.target.textContent = '¿Seguro? Toca otra vez'; e.target.classList.add('go'); return; }
    const R = S.R; R.fotos[rec.slot] = (R.fotos[rec.slot] || []).filter(x => x !== u);
    await DB.del('archivos', u); if (URLS.has(u)) { URL.revokeObjectURL(URLS.get(u)); URLS.delete(u); }
    cambio(); await guardarYa(); $('#visor').innerHTML = ''; document.body.style.overflow = ''; S.visor = null; rerender();
  };
}

/* ════════ Firmas ════════ */
// El trazo se guarda como PNG (fondo blanco) en "archivos" al levantar el dedo.
function iniciarFirmas() {
  document.querySelectorAll('canvas[data-pad]').forEach(async cv => {
    const k = cv.dataset.pad, dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = cv.clientWidth, h = cv.clientHeight; cv.width = w * dpr; cv.height = h * dpr;
    const ctx = cv.getContext('2d'); ctx.scale(dpr, dpr);
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 2.6; ctx.strokeStyle = '#111';
    const f = S.R.firmas[k];
    if (f.archivo) { const b = await blobDe(f.archivo); if (b) { const bm = await createImageBitmap(b).catch(() => null); if (bm) ctx.drawImage(bm, 0, 0, w, h); } }
    let ult = null, trazo = false;
    const pos = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    cv.onpointerdown = e => { e.preventDefault(); cv.setPointerCapture(e.pointerId); ult = pos(e); trazo = true; ctx.beginPath(); ctx.arc(ult[0], ult[1], 1.2, 0, Math.PI * 2); ctx.fillStyle = '#111'; ctx.fill(); };
    cv.onpointermove = e => { if (!ult) return; const p = pos(e); ctx.beginPath(); ctx.moveTo(ult[0], ult[1]); ctx.lineTo(p[0], p[1]); ctx.stroke(); ult = p; };
    cv.onpointerup = cv.onpointercancel = async () => { if (!trazo) return; ult = null; trazo = false; await guardarFirma(k, cv); };
  });
}
async function guardarFirma(k, cv) {
  const R = S.R, f = R.firmas[k];
  const out = document.createElement('canvas'); out.width = 600; out.height = Math.round(600 * cv.height / cv.width);
  const o = out.getContext('2d'); o.fillStyle = '#fff'; o.fillRect(0, 0, out.width, out.height); o.drawImage(cv, 0, 0, out.width, out.height);
  const blob = await new Promise(res => out.toBlob(res, 'image/png'));
  const id = f.archivo || uuid();
  await guardarArchivo({ uuid: id, revision: R.uuid, tipo: 'firma', slot: 'firma:' + k, nota: '', blob, mime: 'image/png', ancho: out.width, alto: out.height, bytes: blob.size, capturado: isoLocal() });
  f.archivo = id; f.fecha = isoLocal(); f.rol = rolesFirma(R)[k];
  cambio(); await guardarYa();
  const st = document.getElementById('sigst-' + k); if (st) st.innerHTML = `<span class="firmado">Firmado · ${fmtFecha(f.fecha)}</span>`;
}
async function borrarFirma(k) {
  const f = S.R.firmas[k];
  if (f.archivo) await DB.del('archivos', f.archivo);
  f.archivo = null; f.fecha = null; cambio(); await guardarYa(); rerender();
}

/* ════════ QR (foto con la cámara; funciona sin señal) ════════ */
async function leerQRDeFoto(file) {
  const bmp = await createImageBitmap(file);
  if ('BarcodeDetector' in window) {
    try { const det = new BarcodeDetector({ formats: ['qr_code'] }); const r = await det.detect(bmp); if (r[0]) return r[0].rawValue; } catch (e) { }
  }
  if (!window.jsQR) await new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js'; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
  const max = 1200, k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
  const ctx = c.getContext('2d'); ctx.drawImage(bmp, 0, 0, c.width, c.height);
  const d = ctx.getImageData(0, 0, c.width, c.height);
  const r = window.jsQR(d.data, c.width, c.height);
  return r ? r.data : null;
}
async function aplicarQR(texto) {
  let t = null, u = null;
  try { const url = new URL(texto); t = url.searchParams.get('t'); u = url.searchParams.get('u'); }
  catch (e) { if (/^[a-f0-9]{16,64}$/i.test(texto.trim())) t = texto.trim(); else u = texto; }
  if (t) { S.token = t; S.tokenMalo = false; await DB.meta('token', t); revisarRed(true); }
  if (u) {
    const p = normPlacas(u);
    if (S.vista === 'captura' && S.R) { elegirUnidad(p); cambio(); render(); }
    else if (S.catalogo) nuevaRevision(p);
    else S.unidadQR = p;
  }
  if (!t && !u) throw new Error('vacio');
  if (S.vista === 'inicio') render();
}

/* ════════ Eventos ════════ */
document.addEventListener('input', e => {
  const el = e.target, R = S.R; if (!R || S.vista !== 'captura') return;
  if (el.dataset.f) { R[el.dataset.f] = el.value; if (el.dataset.f === 'km') pintarAvisoKm(); }
  else if (el.dataset.t) R.llantas[el.dataset.t][el.dataset.tf] = el.value;
  else if (el.dataset.dn) R.danos[+el.dataset.dn].n = el.value;
  else if (el.dataset.q) (R.respuestas[el.dataset.q] = R.respuestas[el.dataset.q] || {}).valor = el.value;
  else if (el.dataset.qc) (R.respuestas[el.dataset.qc] = R.respuestas[el.dataset.qc] || {}).comentario = el.value;
  else if (el.dataset.sn) R.firmas[el.dataset.sn].nombre = el.value;
  else return;
  cambio();
});
document.addEventListener('change', async e => {
  const el = e.target;
  if (el.id === 'qrFile') {
    const f = el.files && el.files[0]; el.value = ''; if (!f) return;
    try { const txt = await leerQRDeFoto(f); if (!txt) throw new Error('nada'); await aplicarQR(txt); }
    catch (err) { mensaje('No se leyó ningún QR. Toma la foto de cerca, con buena luz y el código completo.'); }
    return;
  }
  if (el.dataset.slot && S.R) {
    const files = [...(el.files || [])]; const slot = el.dataset.slot; el.value = '';
    const lbl = el.closest('.ph-add'); if (lbl) lbl.classList.add('busy');
    for (const f of files) { try { await agregarFoto(slot, f); } catch (err) { mensaje('No se pudo guardar la foto. ' + (err && err.message === 'espacio' ? 'El teléfono no tiene espacio suficiente.' : 'Intenta de nuevo.')); } }
    rerender(); revisarEspacio(); return;
  }
  if (S.R && el.dataset.psel) {
    const key = el.dataset.psel, [tipo, campo] = key.split(':'); S.otro = S.otro || {};
    const set = v => { if (tipo === 'sn') S.R.firmas[campo].nombre = v; else S.R[campo] = v; };
    if (el.value === '__otro') { S.otro[key] = true; set(''); cambio(); rerender(); const i = document.getElementById(el.id + '-otro'); if (i) i.focus(); }
    else { S.otro[key] = false; set(el.value); cambio(); rerender(); }
    return;
  }
  if (S.R && el.dataset.f) { S.R[el.dataset.f] = el.value; cambio(); }
});
// Al teclear el km no se redibuja (para no perder el teclado); solo se recalcula al salir del campo.
function pintarAvisoKm() { }
document.addEventListener('focusout', e => { if (S.vista === 'captura' && e.target.dataset && e.target.dataset.f === 'km') setTimeout(() => { if (!tecleando()) rerender(); }, 0); });

document.addEventListener('click', async e => {
  const b = e.target.closest('button, svg[data-view]');
  if (!b) return;
  const R = S.R, d = b.dataset;
  if (d.act === 'nueva') { nuevaRevision(S.unidadQR); S.unidadQR = null; return; }
  if (d.act === 'inicio') { S.vista = 'inicio'; S.confirmDel = null; await recargarListas(); render(); window.scrollTo(0, 0); return; }
  if (d.act === 'pendientes') { S.vista = 'pendientes'; S.confirmDescartar = null; render(); window.scrollTo(0, 0); return; }
  if (d.act === 'enviar') { (await DB.all('pendientes')).forEach(p => { if (p.sync) { p.sync.siguiente = 0; DB.put('pendientes', p); } }); revisarRed(true); setTimeout(() => sincronizar(true), 300); return; }
  if (d.descartar) {
    if (S.confirmDescartar !== d.descartar) { S.confirmDescartar = d.descartar; rerender(); return; }
    if (ENVIO.activo && ENVIO.actual === d.descartar) return;
    await DB.del('pendientes', d.descartar); await borrarArchivosDe(d.descartar); S.confirmDescartar = null; await recargarListas(); rerender(); return;
  }
  if (d.act === 'scan') { $('#qrFile').click(); return; }
  if (d.act === 'token') {
    const v = ($('#tokenIn').value || '').trim(); if (!v) return;
    try { await aplicarQR(v); } catch (err) { mensaje('Ese texto no contiene un enlace ni un token válido.'); }
    return;
  }
  if (d.resume) { const r = await DB.get('borradores', d.resume); if (r) { r.fotos = r.fotos || {}; ['entrega', 'recibe'].forEach(k => { r.firmas[k] = Object.assign({ nombre: '', archivo: null, fecha: null, rol: '' }, r.firmas[k]); }); S.otro = {}; S.R = r; S.paso = 0; S.intento = false; S.vista = 'captura'; ligarSalida(); render(); window.scrollTo(0, 0); } return; }
  if (d.delb) {
    if (S.confirmDel !== d.delb) { S.confirmDel = d.delb; render(); return; }
    await DB.del('borradores', d.delb); await borrarArchivosDe(d.delb); S.confirmDel = null; await recargarListas(); render(); return;
  }
  if (d.ver) { S.detalle = S.pendientes.find(p => p.uuid === d.ver); S.vista = 'detalle'; render(); window.scrollTo(0, 0); return; }
  if (d.verfoto) { abrirVisor(d.verfoto); return; }
  if (!R || S.vista !== 'captura') return;

  if (d.clrfirma) { await borrarFirma(d.clrfirma); return; }
  if (d.step) { guardarYa(); irPaso(+d.step); return; }
  if (d.ir) { const [p, id] = d.ir.split('|'); irPaso(+p, id); return; }
  if (d.mov) {
    if (R.movimiento !== d.mov) { R.movimiento = d.mov; ligarSalida(); }
    cambio(); rerender(); return;
  }
  if (d.unit) { elegirUnidad(d.unit); cambio(); rerender(); return; }
  if (d.seg) {
    const [kind, key] = d.seg.split(':'), val = d.v;
    if (kind === 'tire') R.llantas[key].estado = R.llantas[key].estado === val ? '' : val;
    else if (kind === 'q') { const a = R.respuestas[key] = R.respuestas[key] || {}; a.valor = a.valor === val ? '' : val; }
    else R[kind] = R[kind] === val ? '' : val;
    cambio(); rerender(); return;
  }
  if (d.dmgtype) { R.dmgType = d.dmgtype; cambio(); rerender(); return; }
  if (d.deldmg) { R.danos.splice(+d.deldmg, 1); cambio(); rerender(); return; }
  if (b.matches('svg[data-view]')) {
    const g = e.target.closest('g[data-mi]');
    if (g) { R.danos.splice(+g.dataset.mi, 1); cambio(); rerender(); return; }
    const pt = b.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(b.getScreenCTM().inverse());
    R.danos.push({ v: b.dataset.view, x: Math.round(p.x), y: Math.round(p.y), t: R.dmgType, n: '' });
    cambio(); rerender();
    const inp = document.getElementById('dn-' + (R.danos.length - 1)); if (inp) inp.scrollIntoView({ block: 'nearest' });
    return;
  }
});
$('#prev').onclick = async () => {
  if (S.paso === 0) { await guardarYa(); S.vista = 'inicio'; S.R = null; await recargarListas(); render(); window.scrollTo(0, 0); return; }
  guardarYa(); irPaso(S.paso - 1);
};
$('#next').onclick = () => {
  if (S.paso < STEPS.length - 1) { guardarYa(); irPaso(S.paso + 1); }
  else terminar();
};
function mensaje(t) {
  const el = document.createElement('div'); el.className = 'errbox'; el.style.cssText = 'position:fixed;left:16px;right:16px;bottom:calc(90px + env(safe-area-inset-bottom,0px));z-index:30;max-width:560px;margin:0 auto';
  el.textContent = t; document.body.appendChild(el); setTimeout(() => el.remove(), 5000);
}

try { S._ultimoRevisor = localStorage.getItem('ultimoRevisor'); } catch (e) { }
arrancar();
