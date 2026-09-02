/* ============================================================
   BANCADA — a area de trabalho.
   Desenha tudo em SVG, cuida de arrastar, girar, aproximar, ligar
   fios, ver por dentro da protoboard e jogar peca no lixo.
   Cores metalicas aqui sao fixas de proposito: metal e metal nos dois
   modos, e isso mantem a exportacao em PNG fiel ao que se ve na tela.
   ============================================================ */

import { PORID, P } from "./biblioteca.js";
import { desenhar, tirasProtoboard } from "./desenhos.js";
import { caminho, podeConectar, motivoRecusa } from "./fios.js";
import { calcular } from "./circuito.js";
import { svgQueimado, svgFumaca } from "./danos.js";
import { SOM } from "./som.js";
import { salvarBancada } from "./config.js";

const NS = "http://www.w3.org/2000/svg";

export const estado = {
  comps: [],
  fios: [],
  selecionado: null,
  energizado: false,
  raiox: false,
  organizado: false,
  ferramentaFio: null,   // { tipo, pontas, cor }
  pendente: null,
  vista: { x: 60, y: 40, k: 0.55 },
  seq: 1,
  ultimoCircuito: null,
};

let svg, mundo, camadaComp, camadaFios, camadaTopo, ganchos = {};
let arrasto = null, panorama = null, ponteiros = new Map(), pinca = null;

/* ---------- utilidades ---------------------------------------- */

const novoId = () => "c" + (estado.seq++);

function girarPonto(px, py, cx, cy, g) {
  const r = (g * Math.PI) / 180, s = Math.sin(r), c = Math.cos(r);
  const dx = px - cx, dy = py - cy;
  return { x: cx + dx * c - dy * s, y: cy + dx * s + dy * c };
}

export function posicaoPino(comp, pino) {
  const d = PORID[comp.tipo];
  const p = girarPonto(pino.x, pino.y, d.w / 2, d.h / 2, comp.rot || 0);
  return { x: comp.x + p.x, y: comp.y + p.y };
}

function pinoDe(compId, pinoId) {
  const c = estado.comps.find((x) => x.id === compId);
  if (!c) return null;
  const p = PORID[c.tipo].pinos.find((x) => x.id === pinoId);
  return p ? { comp: c, pino: p } : null;
}

function telaParaMundo(cx, cy) {
  const cr = svg.getBoundingClientRect();
  return {
    x: (cx - cr.left - estado.vista.x) / estado.vista.k,
    y: (cy - cr.top - estado.vista.y) / estado.vista.k,
  };
}

/* ---------- montagem ------------------------------------------ */

export function iniciar(elemento, cb) {
  svg = elemento;
  ganchos = cb || {};
  svg.innerHTML = `
<defs>
  <pattern id="grade" width="${P}" height="${P}" patternUnits="userSpaceOnUse">
    <circle cx="1" cy="1" r="1" fill="var(--linha)"/>
  </pattern>
</defs>
<g id="mundo">
  <rect id="fundo-grade" x="-4000" y="-4000" width="12000" height="12000" fill="url(#grade)"/>
  <g id="camada-comp"></g>
  <g id="camada-fios"></g>
  <g id="camada-topo"></g>
</g>`;
  mundo = svg.querySelector("#mundo");
  camadaComp = svg.querySelector("#camada-comp");
  camadaFios = svg.querySelector("#camada-fios");
  camadaTopo = svg.querySelector("#camada-topo");

  svg.addEventListener("pointerdown", aoApertar);
  svg.addEventListener("pointermove", aoMover);
  svg.addEventListener("pointerup", aoSoltar);
  svg.addEventListener("pointercancel", aoSoltar);
  svg.addEventListener("wheel", aoRoda, { passive: false });
  window.addEventListener("keydown", aoTeclar);

  aplicarVista();
}

function aplicarVista() {
  const v = estado.vista;
  mundo.setAttribute("transform", `translate(${v.x} ${v.y}) scale(${v.k})`);
}

/* ---------- desenho ------------------------------------------- */

function svgPinos(comp, d) {
  const ehProto = d.arte === "protoboard";
  let s = "";
  for (const p of d.pinos) {
    let forma = "";
    if (p.r === "femea") {
      forma = `<rect x="${p.x - 5}" y="${p.y - 5}" width="10" height="10" rx="1.5" fill="#0A0C11" stroke="#9A968C" stroke-width="0.8"/>`;
    } else if (p.r === "borne") {
      forma = `<rect x="${p.x - 8}" y="${p.y - 8}" width="16" height="16" rx="2" fill="#B9BEC6" stroke="#565C66"/><path d="M${p.x - 4} ${p.y}h8" stroke="#31363E" stroke-width="2"/>`;
    } else if (p.r === "pad") {
      const w = p.grande ? 26 : 12;
      forma = `<rect x="${p.x - w / 2}" y="${p.y - 12}" width="${w}" height="24" rx="2" fill="#C9A227" stroke="#8A6B14"/>`;
    } else {
      forma = `<rect x="${p.x - 3}" y="${p.y - 5}" width="6" height="12" rx="1" fill="#C7CBD1" stroke="#7C828C" stroke-width="0.6"/>`;
    }
    const rot = comp.rot || 0;
    const etiqueta = ehProto || !p.n
      ? ""
      : `<g transform="rotate(${-rot} ${p.x} ${p.y})"><text x="${p.x}" y="${p.y + (p.y > d.h / 2 ? 20 : -12)}" font-family="monospace" font-size="9" fill="#B9BEC6" text-anchor="middle">${p.n}</text></g>`;
    s += `${forma}${etiqueta}<circle class="alvo" data-comp="${comp.id}" data-pino="${p.id}" cx="${p.x}" cy="${p.y}" r="9" fill="transparent"/>`;
  }
  return s;
}

function svgComponente(comp) {
  const d = PORID[comp.tipo];
  if (!d) return "";
  const est = (estado.ultimoCircuito && estado.ultimoCircuito.estados.get(comp.id)) || {};
  const inst = {
    variante: comp.variante,
    valorAtual: comp.valor,
    giro: comp.giro,
    pressionado: comp.pressionado,
    ligado: estado.energizado && est.ligado,
    aceso: estado.energizado && est.aceso,
    brilho: est.brilho || 1,
  };
  const sel = estado.selecionado === comp.id;
  const raio = estado.raiox && d.arte === "protoboard"
    ? `<g opacity=".85">${tirasProtoboard().map((t) => `<rect x="${t.x}" y="${t.y}" width="${t.w}" height="${t.h}" rx="2" fill="${t.trilho ? "#7DD3FC" : "#5CE07A"}" opacity=".5"/>`).join("")}</g>`
    : "";
  const dano = comp.queimado
    ? svgQueimado(d.w, d.h) + svgFumaca(d.w / 2, d.h / 2)
    : "";
  const pinosMortos = (comp.pinosQueimados || []).map((pid) => {
    const p = d.pinos.find((x) => x.id === pid);
    return p ? `<path d="M${p.x - 7} ${p.y - 7}l14 14M${p.x + 7} ${p.y - 7}l-14 14" stroke="#E24B4A" stroke-width="2.5"/>` : "";
  }).join("");

  return `<g class="comp" data-id="${comp.id}" transform="translate(${comp.x} ${comp.y}) rotate(${comp.rot || 0} ${d.w / 2} ${d.h / 2})">
  ${desenhar(d, inst)}
  ${raio}
  ${svgPinos(comp, d)}
  ${pinosMortos}
  ${dano}
  ${sel ? `<rect x="-8" y="-8" width="${d.w + 16}" height="${d.h + 16}" rx="4" fill="none" stroke="#5CE07A" stroke-width="2" stroke-dasharray="7 5"/>` : ""}
</g>`;
}

function svgFio(f) {
  const a = pinoDe(f.a.comp, f.a.pino), b = pinoDe(f.b.comp, f.b.pino);
  if (!a || !b) return "";
  const pa = posicaoPino(a.comp, a.pino), pb = posicaoPino(b.comp, b.pino);
  const dpath = caminho(pa, pb, estado.organizado ? "reto" : "solto");
  const viva = estado.energizado && estado.ultimoCircuito &&
    (estado.ultimoCircuito.vDe(f.a.comp, f.a.pino) > 0 || estado.ultimoCircuito.gndDe(f.a.comp, f.a.pino));
  return `<g class="fio" data-id="${f.id}">
  <path d="${dpath}" fill="none" stroke="#05060A" stroke-width="6" stroke-linecap="round" opacity=".45"/>
  <path d="${dpath}" fill="none" stroke="${f.cor}" stroke-width="4" stroke-linecap="round"/>
  ${viva ? `<path d="${dpath}" fill="none" stroke="#FFFFFF" stroke-width="1" stroke-linecap="round" opacity=".35"/>` : ""}
  <circle cx="${pa.x}" cy="${pa.y}" r="4" fill="${f.cor}" stroke="#05060A"/>
  <circle cx="${pb.x}" cy="${pb.y}" r="4" fill="${f.cor}" stroke="#05060A"/>
</g>`;
}

export function redesenhar() {
  camadaComp.innerHTML = estado.comps.map(svgComponente).join("");
  camadaFios.innerHTML = estado.fios.map(svgFio).join("");
  desenharTopo();
  agendarSalvar();
}

function redesenharFios() {
  camadaFios.innerHTML = estado.fios.map(svgFio).join("");
}

function desenharTopo() {
  if (!estado.pendente) { camadaTopo.innerHTML = ""; return; }
  const a = pinoDe(estado.pendente.comp, estado.pendente.pino);
  if (!a) return;
  const pa = posicaoPino(a.comp, a.pino);
  const pb = estado.pendente.cursor || pa;
  camadaTopo.innerHTML = `<path d="${caminho(pa, pb, "solto")}" fill="none" stroke="${estado.pendente.cor}" stroke-width="3" stroke-dasharray="8 6" opacity=".9"/>
<circle cx="${pa.x}" cy="${pa.y}" r="6" fill="none" stroke="${estado.pendente.cor}" stroke-width="2"/>`;
}

/* ---------- acoes --------------------------------------------- */

export function adicionar(tipo, opcoes = {}) {
  const d = PORID[tipo];
  if (!d) return null;
  const centro = telaParaMundo(
    svg.getBoundingClientRect().left + svg.clientWidth / 2,
    svg.getBoundingClientRect().top + svg.clientHeight / 2
  );
  const comp = {
    id: novoId(),
    tipo,
    x: Math.round((opcoes.x ?? centro.x - d.w / 2) / 8) * 8,
    y: Math.round((opcoes.y ?? centro.y - d.h / 2) / 8) * 8,
    rot: 0,
    variante: d.variantes ? d.variantes[0].nome : undefined,
    valor: d.valores ? d.valores[0] : undefined,
    giro: d.ajuste ? 50 : undefined,
    pressionado: false,
  };
  estado.comps.push(comp);
  selecionar(comp.id);
  recalcular();
  SOM.encaixe();
  return comp;
}

export function remover(id) {
  estado.comps = estado.comps.filter((c) => c.id !== id);
  estado.fios = estado.fios.filter((f) => f.a.comp !== id && f.b.comp !== id);
  if (estado.selecionado === id) selecionar(null);
  recalcular();
}

export function girar(id) {
  const c = estado.comps.find((x) => x.id === id);
  if (!c) return;
  c.rot = ((c.rot || 0) + 90) % 360;
  SOM.clique();
  redesenhar();
}

export function selecionar(id) {
  estado.selecionado = id;
  if (ganchos.aoSelecionar) ganchos.aoSelecionar(id ? estado.comps.find((c) => c.id === id) : null);
  redesenhar();
}

export function limparBancada() {
  estado.comps = [];
  estado.fios = [];
  estado.selecionado = null;
  estado.seq = 1;
  recalcular();
}

export function alternarEnergia() {
  estado.energizado = !estado.energizado;
  recalcular();
  if (estado.energizado) SOM.energia(); else SOM.desliga();
  if (ganchos.aoEnergizar) ganchos.aoEnergizar(estado.energizado, estado.ultimoCircuito);
  return estado.energizado;
}

export function desligar() {
  estado.energizado = false;
  redesenhar();
}

export function alternarRaioX() {
  estado.raiox = !estado.raiox;
  SOM.bip();
  redesenhar();
  return estado.raiox;
}

export function organizarFios() {
  estado.organizado = !estado.organizado;
  SOM.clique();
  redesenhar();
  return estado.organizado;
}

export function recalcular() {
  estado.ultimoCircuito = calcular(estado.comps, estado.fios, estado.energizado);
  redesenhar();
  if (ganchos.aoMudar) ganchos.aoMudar(estado);
}

export function escolherFio(jumper, cor) {
  estado.ferramentaFio = jumper ? { tipo: jumper.id, pontas: jumper.pontas, cor: cor || jumper.cor } : null;
  estado.pendente = null;
  desenharTopo();
  svg.style.cursor = jumper ? "crosshair" : "default";
}

/* ---------- zoom e enquadramento ------------------------------ */

export function zoom(fator, centroTela) {
  const v = estado.vista;
  const k2 = Math.min(2.4, Math.max(0.12, v.k * fator));
  const cr = svg.getBoundingClientRect();
  const cx = centroTela ? centroTela.x - cr.left : svg.clientWidth / 2;
  const cy = centroTela ? centroTela.y - cr.top : svg.clientHeight / 2;
  v.x = cx - ((cx - v.x) * k2) / v.k;
  v.y = cy - ((cy - v.y) * k2) / v.k;
  v.k = k2;
  aplicarVista();
}

export function enquadrar() {
  if (!estado.comps.length) {
    estado.vista = { x: 60, y: 40, k: 0.55 };
    aplicarVista();
    return;
  }
  let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
  for (const c of estado.comps) {
    const d = PORID[c.tipo];
    const g = (c.rot || 0) % 180 !== 0;
    const w = g ? d.h : d.w, h = g ? d.w : d.h;
    const cx = c.x + d.w / 2, cy = c.y + d.h / 2;
    x1 = Math.min(x1, cx - w / 2); y1 = Math.min(y1, cy - h / 2);
    x2 = Math.max(x2, cx + w / 2); y2 = Math.max(y2, cy + h / 2);
  }
  const m = 60;
  const k = Math.min((svg.clientWidth - m) / (x2 - x1), (svg.clientHeight - m) / (y2 - y1), 1.6);
  estado.vista.k = Math.max(0.12, k);
  estado.vista.x = (svg.clientWidth - (x2 - x1) * estado.vista.k) / 2 - x1 * estado.vista.k;
  estado.vista.y = (svg.clientHeight - (y2 - y1) * estado.vista.k) / 2 - y1 * estado.vista.k;
  aplicarVista();
}

/* ---------- interacao ----------------------------------------- */

function aoApertar(ev) {
  ponteiros.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
  if (ponteiros.size === 2) {
    const [a, b] = [...ponteiros.values()];
    pinca = { d: Math.hypot(a.x - b.x, a.y - b.y) };
    arrasto = panorama = null;
    return;
  }

  const alvo = ev.target.closest(".alvo");
  if (alvo) { ev.preventDefault(); clicarPino(alvo.dataset.comp, alvo.dataset.pino); return; }

  const g = ev.target.closest(".comp");
  if (g) {
    const comp = estado.comps.find((c) => c.id === g.dataset.id);
    if (!comp) return;
    selecionar(comp.id);
    const m = telaParaMundo(ev.clientX, ev.clientY);
    arrasto = { id: comp.id, dx: m.x - comp.x, dy: m.y - comp.y, moveu: false };
    svg.setPointerCapture(ev.pointerId);
    SOM.pegar();
    return;
  }

  if (estado.pendente) { estado.pendente = null; desenharTopo(); return; }
  selecionar(null);
  panorama = { x: ev.clientX, y: ev.clientY, vx: estado.vista.x, vy: estado.vista.y };
  svg.setPointerCapture(ev.pointerId);
}

function aoMover(ev) {
  if (ponteiros.has(ev.pointerId)) ponteiros.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });

  if (pinca && ponteiros.size === 2) {
    const [a, b] = [...ponteiros.values()];
    const d = Math.hypot(a.x - b.x, a.y - b.y);
    zoom(d / pinca.d, { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
    pinca.d = d;
    return;
  }

  if (arrasto) {
    const comp = estado.comps.find((c) => c.id === arrasto.id);
    const m = telaParaMundo(ev.clientX, ev.clientY);
    comp.x = Math.round((m.x - arrasto.dx) / 8) * 8;
    comp.y = Math.round((m.y - arrasto.dy) / 8) * 8;
    arrasto.moveu = true;
    const g = camadaComp.querySelector(`.comp[data-id="${comp.id}"]`);
    const d = PORID[comp.tipo];
    if (g) g.setAttribute("transform", `translate(${comp.x} ${comp.y}) rotate(${comp.rot || 0} ${d.w / 2} ${d.h / 2})`);
    redesenharFios();
    if (ganchos.aoArrastar) ganchos.aoArrastar(ev.clientX, ev.clientY);
    return;
  }

  if (panorama) {
    estado.vista.x = panorama.vx + (ev.clientX - panorama.x);
    estado.vista.y = panorama.vy + (ev.clientY - panorama.y);
    aplicarVista();
    return;
  }

  if (estado.pendente) {
    estado.pendente.cursor = telaParaMundo(ev.clientX, ev.clientY);
    desenharTopo();
  }
}

function aoSoltar(ev) {
  ponteiros.delete(ev.pointerId);
  if (ponteiros.size < 2) pinca = null;

  if (arrasto) {
    if (arrasto.moveu) {
      SOM.soltar();
      if (ganchos.aoSoltarPeca) {
        const jogado = ganchos.aoSoltarPeca(arrasto.id, ev.clientX, ev.clientY);
        if (jogado) { SOM.lixo(); remover(arrasto.id); arrasto = null; return; }
      }
      recalcular();
    }
    arrasto = null;
  }
  panorama = null;
}

function aoRoda(ev) {
  ev.preventDefault();
  zoom(ev.deltaY > 0 ? 0.9 : 1.1, { x: ev.clientX, y: ev.clientY });
}

function aoTeclar(ev) {
  if (ev.target.matches("input, select, textarea")) return;
  if (ev.key === "Escape") { estado.pendente = null; desenharTopo(); }
  if (ev.key === "r" || ev.key === "R") { if (estado.selecionado) girar(estado.selecionado); }
  if (ev.key === "Delete" || ev.key === "Backspace") {
    if (estado.selecionado) { SOM.lixo(); remover(estado.selecionado); }
  }
}

/* ---------- ligacao de fios ----------------------------------- */

function clicarPino(compId, pinoId) {
  const alvo = pinoDe(compId, pinoId);
  if (!alvo) return;

  // sem jumper na mao: clicar num pino mostra o que ele e
  if (!estado.ferramentaFio) {
    selecionar(compId);
    if (ganchos.aoInspecionarPino) ganchos.aoInspecionarPino(alvo.comp, alvo.pino);
    return;
  }

  const indice = estado.pendente ? 1 : 0;
  const ponta = estado.ferramentaFio.pontas[indice];

  if (!podeConectar(ponta, alvo.pino)) {
    SOM.erro();
    if (ganchos.aoRecusar) ganchos.aoRecusar(motivoRecusa(ponta, alvo.pino));
    return;
  }

  if (indice === 0) {
    estado.pendente = { comp: compId, pino: pinoId, cor: estado.ferramentaFio.cor };
    SOM.fio();
    desenharTopo();
    return;
  }

  if (estado.pendente.comp === compId && estado.pendente.pino === pinoId) {
    estado.pendente = null; desenharTopo(); return;
  }

  estado.fios.push({
    id: "f" + (estado.seq++),
    tipo: estado.ferramentaFio.tipo,
    cor: estado.ferramentaFio.cor,
    a: { comp: estado.pendente.comp, pino: estado.pendente.pino },
    b: { comp: compId, pino: pinoId },
  });
  estado.pendente = null;
  SOM.encaixe();
  recalcular();
}

export function removerFio(id) {
  estado.fios = estado.fios.filter((f) => f.id !== id);
  recalcular();
}

/* ---------- persistencia -------------------------------------- */

let temporizador = null;
function agendarSalvar() {
  clearTimeout(temporizador);
  temporizador = setTimeout(() => salvarBancada(serializar()), 700);
}

export function serializar() {
  return {
    formato: "gabutron-bancada",
    versao: 1,
    criado: new Date().toISOString(),
    comps: estado.comps,
    fios: estado.fios,
    vista: estado.vista,
  };
}

export function carregar(dados) {
  if (!dados || dados.formato !== "gabutron-bancada") return false;
  estado.comps = dados.comps || [];
  estado.fios = dados.fios || [];
  estado.vista = dados.vista || estado.vista;
  estado.seq = 1 + Math.max(0, ...[...estado.comps, ...estado.fios].map((o) => parseInt(String(o.id).slice(1), 10) || 0));
  estado.selecionado = null;
  aplicarVista();
  recalcular();
  return true;
}

/* ---------- exportacao em imagem ------------------------------ */

export async function exportarPNG(escala = 2) {
  if (!estado.comps.length) return null;
  let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
  for (const c of estado.comps) {
    const d = PORID[c.tipo];
    x1 = Math.min(x1, c.x - 40); y1 = Math.min(y1, c.y - 40);
    x2 = Math.max(x2, c.x + d.w + 40); y2 = Math.max(y2, c.y + d.h + 40);
  }
  const w = x2 - x1, h = y2 - y1 + 46;
  const conteudo = camadaComp.innerHTML + camadaFios.innerHTML;
  const marca = `<text x="${x1 + 14}" y="${y2 + 30}" font-family="monospace" font-size="18" fill="#5CE07A">OFICINA DO METAL GABUTRON &#183; criado por GABURA</text>`;
  const fonte = `<svg xmlns="${NS}" width="${w}" height="${h}" viewBox="${x1} ${y1} ${w} ${h}">
<rect x="${x1}" y="${y1}" width="${w}" height="${h}" fill="#05060A"/>${conteudo}${marca}</svg>`;

  const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(fonte);
  const img = new Image();
  await new Promise((ok, falha) => { img.onload = ok; img.onerror = falha; img.src = url; });
  const tela = document.createElement("canvas");
  tela.width = w * escala; tela.height = h * escala;
  const ctx = tela.getContext("2d");
  ctx.fillStyle = "#05060A";
  ctx.fillRect(0, 0, tela.width, tela.height);
  ctx.drawImage(img, 0, 0, tela.width, tela.height);
  return tela.toDataURL("image/png");
}
