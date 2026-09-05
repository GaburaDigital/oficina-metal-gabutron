/* ============================================================
   BANCADA — a area de trabalho.

   Novidades desta revisao:
   - ENCAIXE DE VERDADE. Componente com pino macho entra na
     protoboard. Ao soltar perto, ele alinha sozinho, os furos
     ocupados ficam amarelos e a peca passa a andar junto com a
     placa quando voce move a protoboard.
   - FORMA DIZ FUNCAO. Macho e quadrado, femea e circulo, borne e
     anel de jacare sao retangulos. Da para saber o que encaixa
     onde so olhando.
   - ROTULO SOB DEMANDA. O nome curto fica sempre na peca; a
     descricao completa aparece ao passar o mouse. Assim a placa
     nao vira uma parede de texto.
   - FIO SE APAGA. Passar o mouse acende o fio, clicar seleciona,
     Delete remove. Ninguem mais fica preso num fio errado.
   ============================================================ */

import { PORID, P, NOME_CONTATO } from "./biblioteca.js";
import { desenhar, tirasProtoboard } from "./desenhos.js";
import { caminho, podeConectar, motivoRecusa } from "./fios.js";
import { calcular } from "./circuito.js";
import { svgQueimado, svgFumaca } from "./danos.js";
import { svgJunta } from "./solda.js";
import { SOM } from "./som.js";
import { salvarBancada } from "./config.js";

const NS = "http://www.w3.org/2000/svg";
const TOLERANCIA = 26; // distancia para o encaixe agarrar

export const estado = {
  comps: [],
  fios: [],
  selecionado: null,
  fioSelecionado: null,
  energizado: false,
  raiox: false,
  organizado: false,
  ferramentaFio: null,
  modoFerramenta: null,   // null | "multimetro" | "solda"
  pendente: null,
  vista: { x: 60, y: 40, k: 0.42 },
  seq: 1,
  ultimoCircuito: null,
};

let svg, mundo, camadaComp, camadaFios, camadaTopo, ganchos = {};
let arrasto = null, panorama = null, ponteiros = new Map(), pinca = null;
let dica = null;

/* ---------- geometria ----------------------------------------- */

const novoId = () => "c" + (estado.seq++);

function girarPonto(px, py, cx, cy, g) {
  const r = (g * Math.PI) / 180, s = Math.sin(r), c = Math.cos(r);
  const dx = px - cx, dy = py - cy;
  return { x: cx + dx * c - dy * s, y: cy + dx * s + dy * c };
}

/* Converte um ponto da tela em ponto da bancada. Quem arrasta da
   paleta precisa disso para largar a peca exatamente onde soltou. */
export function mundoDe(clientX, clientY) { return telaParaMundo(clientX, clientY); }

export function sobreBancada(clientX, clientY) {
  const r = svg.getBoundingClientRect();
  return clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom;
}

/* Posicao de um pino a partir dos ids, para as ferramentas. */
export function posicaoDePino(compId, pinoId) {
  const alvo = pinoDe(compId, pinoId);
  return alvo ? posicaoPino(alvo.comp, alvo.pino) : null;
}

export function posicaoPino(comp, pino) {
  const d = PORID[comp.tipo];
  const p = girarPonto(pino.x, pino.y, d.w / 2, d.h / 2, comp.rot || 0);
  return { x: comp.x + p.x, y: comp.y + p.y };
}

function achar(cid) { return estado.comps.find((c) => c.id === cid); }

function pinoDe(compId, pinoId) {
  const c = achar(compId);
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

/* Encaixes viram ligacoes eletricas iguais a um fio. */
export function ligacoesFisicas() {
  const lista = [];
  for (const c of estado.comps) {
    for (const e of c.encaixes || []) {
      lista.push({ id: `e-${c.id}-${e.pino}`, encaixe: true, cor: "#E9C542",
        a: { comp: c.id, pino: e.pino }, b: { comp: e.comp, pino: e.pinoAlvo } });
    }
  }
  return lista;
}

function furosOcupados() {
  const s = new Set();
  for (const c of estado.comps)
    for (const e of c.encaixes || []) s.add(`${e.comp}#${e.pinoAlvo}`);
  return s;
}

/* ---------- montagem ------------------------------------------ */

export function iniciar(elemento, cb) {
  svg = elemento;
  ganchos = cb || {};
  svg.innerHTML = `
<defs>
  <pattern id="grade" width="${P}" height="${P}" patternUnits="userSpaceOnUse">
    <circle cx="1" cy="1" r="1.2" fill="var(--grade-cor)"/>
  </pattern>
</defs>
<g id="mundo">
  <rect id="fundo-grade" x="-6000" y="-6000" width="16000" height="16000" fill="url(#grade)"/>
  <g id="camada-comp"></g>
  <g id="camada-fios"></g>
  <g id="camada-topo"></g>
</g>`;
  mundo = svg.querySelector("#mundo");
  camadaComp = svg.querySelector("#camada-comp");
  camadaFios = svg.querySelector("#camada-fios");
  camadaTopo = svg.querySelector("#camada-topo");

  dica = document.createElement("div");
  dica.id = "dica-pino";
  dica.hidden = true;
  svg.parentElement.appendChild(dica);

  svg.addEventListener("pointerdown", aoApertar);
  svg.addEventListener("pointermove", aoMover);
  svg.addEventListener("pointerup", aoSoltar);
  svg.addEventListener("pointercancel", aoSoltar);
  svg.addEventListener("pointerleave", () => esconderDica());
  svg.addEventListener("wheel", aoRoda, { passive: false });
  svg.addEventListener("contextmenu", aoBotaoDireito);
  window.addEventListener("keydown", aoTeclar);

  aplicarVista();
}

function aplicarVista() {
  const v = estado.vista;
  mundo.setAttribute("transform", `translate(${v.x} ${v.y}) scale(${v.k})`);
}

/* ---------- desenho dos pinos --------------------------------- */

function svgUmPino(comp, d, p, ocupados) {
  const cheio = ocupados.has(`${comp.id}#${p.id}`);
  const morto = (comp.pinosQueimados || []).includes(p.id);
  let forma;

  if (p.r === "femea") {
    forma = `<circle cx="${p.x}" cy="${p.y}" r="8" fill="${cheio ? "#E9C542" : "#0A0C11"}" stroke="${cheio ? "#8A6B14" : "#9A968C"}" stroke-width="1.6"/>`;
    if (cheio) forma += `<circle cx="${p.x}" cy="${p.y}" r="4" fill="#5A4408"/>`;
  } else if (p.r === "macho") {
    forma = `<rect x="${p.x - 7}" y="${p.y - 7}" width="14" height="14" rx="2" fill="#D5D9DE" stroke="#6C727B" stroke-width="1.6"/>`;
  } else if (p.r === "borne") {
    forma = `<rect x="${p.x - 15}" y="${p.y - 11}" width="30" height="22" rx="3" fill="#B9BEC6" stroke="#565C66" stroke-width="1.6"/>
             <path d="M${p.x - 7} ${p.y}h14" stroke="#31363E" stroke-width="2.5"/>`;
  } else {
    const w = p.grande ? 46 : 26;
    forma = `<rect x="${p.x - w / 2}" y="${p.y - 15}" width="${w}" height="30" rx="3" fill="#C9A227" stroke="#8A6B14" stroke-width="1.6"/>`;
  }

  const rot = comp.rot || 0;
  let etiqueta = "";
  if (p.n && !p.furo) {
    const lado = p.lado || "baixo";
    const cor = morto ? "#E24B4A" : "#C9CDD3";
    // Quanto cabe deitado: com fonte 13 e passo de 24 unidades, dois
    // caracteres ocupam 16 e sobra folga; tres ja ocupam o passo
    // inteiro e colam no vizinho. Por isso o corte e em tres.
    // O til nao conta, porque ele e estreito e fica sobre o furo.
    const largura = p.n.replace(/^~/, "").length;
    const emPe = (p.vertical || largura >= 3) && (lado === "cima" || lado === "baixo");

    if (emPe) {
      const dy = lado === "baixo" ? 16 : -16;
      const anc = lado === "baixo" ? "end" : "start";
      etiqueta = `<g transform="rotate(${-rot} ${p.x} ${p.y})">
        <text x="${p.x}" y="${p.y + dy}" font-family="monospace" font-size="13" fill="${cor}"
          text-anchor="${anc}" transform="rotate(-90 ${p.x} ${p.y + dy})" dominant-baseline="middle">${p.n}</text></g>`;
    } else {
      const desloc = { cima: [0, -20, "middle"], baixo: [0, 28, "middle"], e: [-16, 5, "end"], d: [16, 5, "start"] }[lado];
      etiqueta = `<g transform="rotate(${-rot} ${p.x} ${p.y})">
        <text x="${p.x + desloc[0]}" y="${p.y + desloc[1]}" font-family="monospace" font-size="13"
          fill="${cor}" text-anchor="${desloc[2]}">${p.n}</text></g>`;
    }
  }
  const cruz = morto ? `<path d="M${p.x - 9} ${p.y - 9}l18 18M${p.x + 9} ${p.y - 9}l-18 18" stroke="#E24B4A" stroke-width="3"/>` : "";

  return `${forma}${etiqueta}${cruz}<circle class="alvo" data-comp="${comp.id}" data-pino="${p.id}" cx="${p.x}" cy="${p.y}" r="14" fill="transparent"/>`;
}

/* ---------- desenho dos componentes --------------------------- */

function svgComponente(comp, ocupados) {
  const d = PORID[comp.tipo];
  if (!d) return "";
  const est = (estado.ultimoCircuito && estado.ultimoCircuito.estados.get(comp.id)) || {};
  const inst = {
    variante: comp.variante, valorAtual: comp.valor, giro: comp.giro,
    pressionado: comp.pressionado, tensaoSaida: comp.tensaoSaida,
    slots: comp.slots ?? (d.slots && d.slots.padrao),
    tensao: comp.tensao ?? (d.faixaTensao && d.faixaTensao.padrao),
    limite: comp.limite ?? (d.faixaCorrente && d.faixaCorrente.padrao),
    eixoX: comp.eixoX, eixoY: comp.eixoY, passo: comp.passo,
    temCartao: comp.temMidia === "cartao-sd-midia", temMidia: comp.temMidia,
    ligado: estado.energizado && est.ligado,
    aceso: estado.energizado && est.aceso,
    brilho: est.brilho || 1,
  };
  const sel = estado.selecionado === comp.id;

  const raio = estado.raiox && d.arte === "protoboard"
    ? `<g opacity=".85" pointer-events="none">${tirasProtoboard().map((t) =>
        `<rect x="${t.x}" y="${t.y}" width="${t.w}" height="${t.h}" rx="3" fill="${t.trilho ? "#7DD3FC" : "#5CE07A"}" opacity=".45"/>`).join("")}</g>`
    : "";

  // Raio-X do botao: mostra que 1-3 e 2-4 ja vem ligados de fabrica.
  const raioBotao = estado.raiox && d.ligacoes
    ? `<g pointer-events="none" opacity=".9">${d.ligacoes.map(([a, b]) => {
        const pa = d.pinos.find((x) => x.id === a), pb = d.pinos.find((x) => x.id === b);
        return pa && pb ? `<path d="M${pa.x} ${pa.y}L${pb.x} ${pb.y}" stroke="#5CE07A" stroke-width="5" stroke-linecap="round"/>` : "";
      }).join("")}
      ${(d.ligacoesFechado || []).map(([a, b]) => {
        const pa = d.pinos.find((x) => x.id === a), pb = d.pinos.find((x) => x.id === b);
        return pa && pb ? `<path d="M${pa.x} ${pa.y}L${pb.x} ${pb.y}" stroke="#E9C542" stroke-width="4" stroke-dasharray="8 6" stroke-linecap="round"/>` : "";
      }).join("")}</g>`
    : "";

  const usb = estado.energizado && d.usb && comp.usbLigado !== false
    ? `<g pointer-events="none"><path d="M-90 ${d.h / 2}q-40 -30 -90 10" fill="none" stroke="#C9CDD3" stroke-width="10" stroke-linecap="round"/>
       <rect x="-100" y="${d.h / 2 - 16}" width="26" height="32" rx="4" fill="#B9BEC6"/>
       <text x="-186" y="${d.h / 2 - 26}" font-family="monospace" font-size="15" fill="#5CE07A">USB</text></g>`
    : "";

  const raioFonte = estado.energizado && d.fonte
    ? `<g pointer-events="none"><path d="M${d.w / 2 - 10} -46L${d.w / 2 - 26} -14h16l-6 26 26 -34h-16l8 -22z" fill="#E9C542" stroke="#8A6B14" stroke-width="2"/></g>`
    : "";

  const dano = comp.queimado ? svgQueimado(d.w, d.h) + svgFumaca(d.w / 2, d.h / 2) : "";

  // Area clicavel da peca que se mexe: botao, chave, potenciometro.
  const z = estado.energizado ? d.zonaAcao : null;
  const acao = z
    ? `<circle class="acao" data-comp="${comp.id}" data-acao="${z.acao}" cx="${z.x}" cy="${z.y}" r="${z.r}" fill="transparent"/>`
    : "";

  return `<g class="comp${sel ? " sel" : ""}" data-id="${comp.id}" transform="translate(${comp.x} ${comp.y}) rotate(${comp.rot || 0} ${d.w / 2} ${d.h / 2})">
  ${desenhar(d, inst)}
  ${raio}${raioBotao}
  ${d.pinos.map((p) => svgUmPino(comp, d, p, ocupados)).join("")}
  ${usb}${raioFonte}${dano}${acao}
  ${sel ? `<rect x="-10" y="-10" width="${d.w + 20}" height="${d.h + 20}" rx="6" fill="none" stroke="#5CE07A" stroke-width="3" stroke-dasharray="10 7" pointer-events="none"/>` : ""}
</g>`;
}

/* ---------- desenho dos fios ---------------------------------- */

const MARCA_PONTA = {
  macho: (x, y, c) => `<rect x="${x - 7}" y="${y - 7}" width="14" height="14" rx="2" fill="${c}" stroke="#05060A" stroke-width="1.5"/>`,
  femea: (x, y, c) => `<circle cx="${x}" cy="${y}" r="7.5" fill="${c}" stroke="#05060A" stroke-width="1.5"/>`,
  jacare: (x, y, c) => `<rect x="${x - 11}" y="${y - 6}" width="22" height="12" rx="2" fill="${c}" stroke="#05060A" stroke-width="1.5"/>`,
};

function svgFio(f) {
  const a = pinoDe(f.a.comp, f.a.pino), b = pinoDe(f.b.comp, f.b.pino);
  if (!a || !b) return "";
  const pa = posicaoPino(a.comp, a.pino), pb = posicaoPino(b.comp, b.pino);
  const dpath = f.tipo === "solda"
    ? `M${pa.x} ${pa.y}L${pb.x} ${pb.y}`
    : caminho(pa, pb, estado.organizado ? "reto" : "solto");
  const sel = estado.fioSelecionado === f.id;
  const pontas = f.pontas || ["macho", "macho"];
  const viva = estado.energizado && estado.ultimoCircuito &&
    (estado.ultimoCircuito.vDe(f.a.comp, f.a.pino) > 0 || estado.ultimoCircuito.gndDe(f.a.comp, f.a.pino));

  return `<g class="fio${sel ? " sel" : ""}" data-id="${f.id}">
  <path class="toque" d="${dpath}" fill="none" stroke="transparent" stroke-width="22" stroke-linecap="round"/>
  <path class="sombra" d="${dpath}" fill="none" stroke="#05060A" stroke-width="8" stroke-linecap="round" opacity=".45"/>
  <path class="alma" d="${dpath}" fill="none" stroke="${f.cor}" stroke-width="5" stroke-linecap="round"/>
  ${viva ? `<path d="${dpath}" fill="none" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" opacity=".35" pointer-events="none"/>` : ""}
  ${f.tipo === "solda" ? svgJunta(pa.x, pa.y) + svgJunta(pb.x, pb.y)
    : (MARCA_PONTA[pontas[0]] || MARCA_PONTA.macho)(pa.x, pa.y, f.cor) +
      (MARCA_PONTA[pontas[1]] || MARCA_PONTA.macho)(pb.x, pb.y, f.cor)}
</g>`;
}

export function redesenhar() {
  // Com multimetro ou ferro na mao o clique tem que chegar ao contato,
  // mesmo que passe um fio por cima dele.
  if (svg) svg.classList.toggle("com-ferramenta", !!estado.modoFerramenta);
  const ocupados = furosOcupados();
  camadaComp.innerHTML = estado.comps.map((c) => svgComponente(c, ocupados)).join("");
  camadaFios.innerHTML = estado.fios.map(svgFio).join("");
  desenharTopo();
  agendarSalvar();
}

function redesenharFios() {
  camadaFios.innerHTML = estado.fios.map(svgFio).join("");
}

function desenharTopo() {
  const extra = ganchos.svgFerramenta ? ganchos.svgFerramenta() : "";
  if (!estado.pendente) { camadaTopo.innerHTML = extra; return; }
  const a = pinoDe(estado.pendente.comp, estado.pendente.pino);
  if (!a) return;
  const pa = posicaoPino(a.comp, a.pino);
  const pb = estado.pendente.cursor || pa;
  camadaTopo.innerHTML = extra + `<path d="${caminho(pa, pb, "solto")}" fill="none" stroke="${estado.pendente.cor}" stroke-width="4" stroke-dasharray="10 8" opacity=".9" pointer-events="none"/>
<circle cx="${pa.x}" cy="${pa.y}" r="12" fill="none" stroke="${estado.pendente.cor}" stroke-width="3" pointer-events="none"/>`;
}

/* ---------- encaixe na protoboard ------------------------------ */

function tentarEncaixar(comp) {
  const d = PORID[comp.tipo];
  comp.encaixes = [];
  comp.pai = null;

  // 1) A placa mae solta em cima de uma expansao ja apoiada: ela desce
  //    para a posicao e passa a andar junto.
  if (d.encaixaExpansao) {
    for (const ex of estado.comps) {
      if (ex.id === comp.id || ex.tipo !== d.encaixaExpansao) continue;
      const xd = PORID[ex.tipo];
      const alvoX = ex.x, alvoY = ex.y - d.h + 24;
      if (Math.hypot(comp.x - alvoX, comp.y - alvoY) > 140) continue;
      comp.x = alvoX;
      comp.y = alvoY;
      comp.pai = ex.id;
      for (const [dela, meu] of Object.entries(xd.mapa || {}))
        comp.encaixes.push({ pino: meu, comp: ex.id, pinoAlvo: dela });
      return true;
    }
  }

  // 2) Midia: cartao de memoria e pen drive entram no slot de quem
  //    tem encaixe, sem fio nenhum. E so mecanico, mas o aluno espera.
  if (d.inerte || d.encaixavel) {
    for (const host of estado.comps) {
      if (host.id === comp.id) continue;
      const hd = PORID[host.tipo];
      if (!hd.encaixe) continue;
      const tipoOk = hd.encaixe.tipo === comp.tipo || hd.encaixe.tipo === d.encaixavel;
      if (!tipoOk) continue;
      const alvoX = host.x + hd.encaixe.x - d.w / 2, alvoY = host.y + hd.encaixe.y - d.h / 2;
      if (Math.hypot(comp.x - alvoX, comp.y - alvoY) > 140) continue;
      comp.x = alvoX; comp.y = alvoY;
      comp.pai = host.id;
      host.temMidia = comp.tipo;
      return true;
    }
  }

  const machos = d.pinos.filter((p) => p.r === "macho");
  if (!machos.length) return false;

  for (const base of estado.comps) {
    if (base.id === comp.id) continue;
    const bd = PORID[base.tipo];
    if (!bd.base) continue;

    let melhor = null;
    for (const p of machos) {
      const pw = posicaoPino(comp, p);
      for (const h of bd.pinos) {
        const hw = posicaoPino(base, h);
        const dist = Math.hypot(pw.x - hw.x, pw.y - hw.y);
        if (dist < TOLERANCIA && (!melhor || dist < melhor.dist))
          melhor = { dist, dx: hw.x - pw.x, dy: hw.y - pw.y };
      }
    }
    if (!melhor) continue;

    comp.x += melhor.dx;
    comp.y += melhor.dy;

    const usados = furosOcupados();
    for (const p of machos) {
      const pw = posicaoPino(comp, p);
      const h = bd.pinos.find((x) => {
        const hw = posicaoPino(base, x);
        return Math.hypot(pw.x - hw.x, pw.y - hw.y) < 8 && !usados.has(`${base.id}#${x.id}`);
      });
      if (h) comp.encaixes.push({ pino: p.id, comp: base.id, pinoAlvo: h.id });
    }
    if (comp.encaixes.length) {
      comp.pai = base.id;
      acoplarVizinhos(comp);
      return true;
    }
  }

  // Nao achou protoboard: a expansao ainda pode acoplar embaixo da
  // placa mae, que e o uso mais comum dela.
  if (d.acoplaEm) {
    for (const mae of estado.comps) {
      if (mae.id === comp.id || mae.tipo !== d.acoplaEm) continue;
      const md = PORID[mae.tipo];
      const alvoX = mae.x, alvoY = mae.y + md.h - 24;
      if (Math.hypot(comp.x - alvoX, comp.y - alvoY) > 140) continue;
      comp.x = alvoX;
      comp.y = alvoY;
      comp.pai = mae.id;
      for (const [meu, dela] of Object.entries(d.mapa || {}))
        comp.encaixes.push({ pino: meu, comp: mae.id, pinoAlvo: dela });
      return true;
    }
  }
  return false;
}

/* Depois de assentar na protoboard, a expansao ainda liga os aneis da
   placa mae que estiver logo acima. E assim que MicroBURA e adaptador
   trabalham juntos EM CIMA da protoboard, que era o que faltava. */
function acoplarVizinhos(comp) {
  const d = PORID[comp.tipo];
  if (!d.acoplaEm) return;
  for (const mae of estado.comps) {
    if (mae.id === comp.id || mae.tipo !== d.acoplaEm) continue;
    const md = PORID[mae.tipo];
    const perto = Math.abs(mae.x - comp.x) < 60 && Math.abs(mae.y + md.h - 24 - comp.y) < 90;
    if (!perto) continue;
    mae.x = comp.x;
    mae.y = comp.y - md.h + 24;
    mae.pai = comp.id;
    mae.encaixes = [];
    for (const [meu, dela] of Object.entries(d.mapa || {}))
      mae.encaixes.push({ pino: dela, comp: comp.id, pinoAlvo: meu });
    return;
  }
}

function filhosDe(id) { return estado.comps.filter((c) => c.pai === id); }

/* ---------- acoes --------------------------------------------- */

export function adicionar(tipo, opcoes = {}) {
  const d = PORID[tipo];
  if (!d) return null;
  const cr = svg.getBoundingClientRect();
  const centro = telaParaMundo(cr.left + svg.clientWidth / 2, cr.top + svg.clientHeight / 2);
  const comp = {
    id: novoId(), tipo,
    x: Math.round((opcoes.x ?? centro.x - d.w / 2) / 8) * 8,
    y: Math.round((opcoes.y ?? centro.y - d.h / 2) / 8) * 8,
    rot: 0,
    variante: d.variantes ? d.variantes[0].nome : undefined,
    valor: d.valores ? d.valores[0] : undefined,
    giro: d.ajuste ? 50 : undefined,
    tensaoSaida: d.ajustavel ? d.ajustavel[1] : undefined,
    slots: d.slots ? d.slots.padrao : undefined,
    tensao: d.faixaTensao ? d.faixaTensao.padrao : undefined,
    limite: d.faixaCorrente ? d.faixaCorrente.padrao : undefined,
    eixoX: d.manche ? 50 : undefined,
    eixoY: d.manche ? 50 : undefined,
    passo: d.passos ? 0 : undefined,
    usbLigado: d.usb ? true : undefined,
    pressionado: false,
    encaixes: [],
  };
  estado.comps.push(comp);
  selecionar(comp.id);
  recalcular();
  SOM.encaixe();
  return comp;
}

/* Chamado pela paleta: cria a peca ja na mao do usuario. */
export function pegarDaPaleta(tipo, clientX, clientY, pointerId) {
  const d = PORID[tipo];
  if (!d) return null;
  const m = telaParaMundo(clientX, clientY);
  const comp = adicionar(tipo, { x: m.x - d.w / 2, y: m.y - d.h / 2 });
  if (!comp) return null;
  arrasto = { id: comp.id, dx: d.w / 2, dy: d.h / 2, moveu: true, filhos: [] };
  try { svg.setPointerCapture(pointerId); } catch (e) {}
  SOM.pegar();
  return comp;
}

function criarPontaSolta(x, y) {
  const d = PORID["ponta-solta"];
  const comp = {
    id: novoId(), tipo: "ponta-solta",
    x: Math.round((x - d.pinos[0].x) / 8) * 8,
    y: Math.round((y - d.pinos[0].y) / 8) * 8,
    rot: 0, encaixes: [],
  };
  estado.comps.push(comp);
  return comp;
}

/* Ponta solta que ficou sem nenhum fio nao serve para nada: some. */
function limparPontasOrfas() {
  const usados = new Set();
  estado.fios.forEach((f) => { usados.add(f.a.comp); usados.add(f.b.comp); });
  estado.comps = estado.comps.filter((c) => c.tipo !== "ponta-solta" || usados.has(c.id));
}

export function remover(id) {
  filhosDe(id).forEach((f) => { f.pai = null; f.encaixes = []; });
  estado.comps = estado.comps.filter((c) => c.id !== id);
  estado.fios = estado.fios.filter((f) => f.a.comp !== id && f.b.comp !== id);
  estado.comps.forEach((c) => { c.encaixes = (c.encaixes || []).filter((e) => e.comp !== id); });
  if (estado.selecionado === id) selecionar(null);
  recalcular();
}

export function removerFio(id) {
  estado.fios = estado.fios.filter((f) => f.id !== id);
  estado.fioSelecionado = null;
  SOM.lixo();
  recalcular();
}

export function girar(id) {
  const c = achar(id);
  if (!c) return;
  c.rot = ((c.rot || 0) + 90) % 360;
  c.encaixes = [];
  c.pai = null;
  SOM.clique();
  recalcular();
}

export function selecionar(id) {
  estado.selecionado = id;
  estado.fioSelecionado = null;
  if (id) aoTopo(id);
  if (ganchos.aoSelecionar) ganchos.aoSelecionar(id ? achar(id) : null);
  redesenhar();
}

/* Ordem Z: a ultima peca tocada fica por cima. */
function aoTopo(id) {
  const i = estado.comps.findIndex((c) => c.id === id);
  if (i < 0 || i === estado.comps.length - 1) return;
  const c = estado.comps.splice(i, 1)[0];
  estado.comps.push(c);
  filhosDe(id).forEach((f) => aoTopo(f.id));
}

export function limparBancada() {
  estado.comps = [];
  estado.fios = [];
  estado.selecionado = null;
  estado.fioSelecionado = null;
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

export function desligar() { estado.energizado = false; redesenhar(); }

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
  limparPontasOrfas();
  estado.ultimoCircuito = calcular(estado.comps, estado.fios.concat(ligacoesFisicas()), estado.energizado);
  redesenhar();
  if (ganchos.aoMudar) ganchos.aoMudar(estado);
}

export function escolherFio(jumper, cor) {
  estado.ferramentaFio = jumper ? { tipo: jumper.id, pontas: [...jumper.pontas], cor: cor || jumper.cor, nome: jumper.nome } : null;
  estado.pendente = null;
  desenharTopo();
  svg.style.cursor = jumper ? "crosshair" : "default";
  atualizarPontaCursor();
}

export function apagarSelecionado() {
  if (estado.fioSelecionado) { removerFio(estado.fioSelecionado); return "fio"; }
  if (estado.selecionado) { SOM.lixo(); remover(estado.selecionado); return "peca"; }
  return null;
}

export function cancelar() {
  estado.pendente = null;
  desenharTopo();
  atualizarPontaCursor();
}

export function pontaDaVez() {
  const f = estado.ferramentaFio;
  if (!f) return null;
  return { ponta: f.pontas[estado.pendente ? 1 : 0], indice: estado.pendente ? 2 : 1, cor: f.cor, nome: f.nome };
}

export function inverterPontas() {
  if (!estado.ferramentaFio || estado.pendente) return null;
  estado.ferramentaFio.pontas.reverse();
  SOM.clique();
  atualizarPontaCursor();
  if (ganchos.aoMudarPonta) ganchos.aoMudarPonta(pontaDaVez());
  return estado.ferramentaFio.pontas[0];
}

/* O rotulo que seguia o cursor foi removido: a mesma informacao ja
   aparece no chip fixo da bancada, e flutuando ela cobria justamente o
   contato que o aluno queria enxergar. */
function atualizarPontaCursor() {
  if (ganchos.aoMudarPonta) ganchos.aoMudarPonta(pontaDaVez());
}

/* ---------- zoom e enquadramento ------------------------------ */

export function zoom(fator, centroTela) {
  const v = estado.vista;
  const k2 = Math.min(2.2, Math.max(0.08, v.k * fator));
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
    estado.vista = { x: 60, y: 40, k: 0.42 };
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
  const m = 100;
  const k = Math.min((svg.clientWidth - m) / (x2 - x1), (svg.clientHeight - m) / (y2 - y1), 1.4);
  estado.vista.k = Math.max(0.08, k);
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
  if (ev.button === 2) return;

  const alvo = ev.target.closest(".alvo");
  if (alvo) { ev.preventDefault(); clicarPino(alvo.dataset.comp, alvo.dataset.pino); return; }

  // Apertar botao, chavear e girar so valem com a bancada energizada.
  // Com ela desligada esses cliques passam direto para o arraste, que
  // e o que o aluno quer quando esta montando: mover a peca de lugar.
  const zona = estado.energizado ? ev.target.closest(".acao") : null;
  if (zona && !estado.modoFerramenta && !estado.ferramentaFio) {
    ev.preventDefault();
    const comp = achar(zona.dataset.comp);
    if (!comp) return;
    selecionar(comp.id);
    if (zona.dataset.acao === "pressionar") {
      comp.pressionado = true;
      recalcular();
      SOM.clique();
      arrasto = { acaoBotao: comp.id };
      svg.setPointerCapture(ev.pointerId);
    } else if (zona.dataset.acao === "chavear") {
      comp.pressionado = !comp.pressionado;
      SOM.encaixe();
      recalcular();
    } else if (zona.dataset.acao === "manche") {
      const d = PORID[comp.tipo];
      arrasto = { acaoManche: comp.id, cx: comp.x + d.zonaAcao.x, cy: comp.y + d.zonaAcao.y, r: d.zonaAcao.r };
      comp.pressionado = true;
      recalcular();
      svg.setPointerCapture(ev.pointerId);
    } else if (zona.dataset.acao === "passo") {
      const m = telaParaMundo(ev.clientX, ev.clientY);
      arrasto = { acaoPasso: comp.id, y0: m.y, base: comp.passo || 0 };
      svg.setPointerCapture(ev.pointerId);
    } else if (zona.dataset.acao === "girar") {
      const d = PORID[comp.tipo];
      arrasto = { acaoGiro: comp.id, cx: comp.x + d.zonaAcao.x, cy: comp.y + d.zonaAcao.y };
      svg.setPointerCapture(ev.pointerId);
    }
    return;
  }

  const gf = ev.target.closest(".fio");
  if (gf) {
    estado.fioSelecionado = estado.fioSelecionado === gf.dataset.id ? null : gf.dataset.id;
    estado.selecionado = null;
    SOM.clique();
    if (ganchos.aoSelecionarFio) ganchos.aoSelecionarFio(estado.fios.find((f) => f.id === estado.fioSelecionado) || null);
    redesenhar();
    return;
  }

  const g = ev.target.closest(".comp");
  if (g) {
    const comp = achar(g.dataset.id);
    if (!comp) return;
    selecionar(comp.id);
    const m = telaParaMundo(ev.clientX, ev.clientY);
    arrasto = {
      id: comp.id, dx: m.x - comp.x, dy: m.y - comp.y, moveu: false,
      filhos: filhosDe(comp.id).map((f) => ({ id: f.id, dx: f.x - comp.x, dy: f.y - comp.y })),
    };
    svg.setPointerCapture(ev.pointerId);
    SOM.pegar();
    return;
  }

  // Fio na mao e clique no vazio: a ponta fica pendurada ali, virando
  // um ponto de ligacao onde outros fios podem se pendurar depois.
  if (estado.pendente) {
    const m = telaParaMundo(ev.clientX, ev.clientY);
    const solta = criarPontaSolta(m.x, m.y);
    clicarPino(solta.id, "no");
    return;
  }
  selecionar(null);
  panorama = { x: ev.clientX, y: ev.clientY, vx: estado.vista.x, vy: estado.vista.y };
  svg.setPointerCapture(ev.pointerId);
}

function aoMover(ev) {
  if (ponteiros.has(ev.pointerId)) ponteiros.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
  atualizarPontaCursor(ev.clientX, ev.clientY);

  if (pinca && ponteiros.size === 2) {
    const [a, b] = [...ponteiros.values()];
    const dd = Math.hypot(a.x - b.x, a.y - b.y);
    zoom(dd / pinca.d, { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
    pinca.d = dd;
    return;
  }

  if (arrasto && arrasto.acaoGiro) {
    const comp = achar(arrasto.acaoGiro);
    const m = telaParaMundo(ev.clientX, ev.clientY);
    let ang = (Math.atan2(m.y - arrasto.cy, m.x - arrasto.cx) * 180) / Math.PI + 90;
    if (ang < -180) ang += 360;
    comp.giro = Math.max(0, Math.min(100, Math.round(((ang + 140) / 280) * 100)));
    recalcular();
    return;
  }
  if (arrasto && arrasto.acaoManche) {
    const comp = achar(arrasto.acaoManche);
    const m = telaParaMundo(ev.clientX, ev.clientY);
    const dx = Math.max(-1, Math.min(1, (m.x - arrasto.cx) / arrasto.r));
    const dy = Math.max(-1, Math.min(1, (m.y - arrasto.cy) / arrasto.r));
    comp.eixoX = Math.round(50 + dx * 50);
    comp.eixoY = Math.round(50 + dy * 50);
    redesenhar();
    return;
  }
  if (arrasto && arrasto.acaoPasso) {
    const comp = achar(arrasto.acaoPasso);
    const m = telaParaMundo(ev.clientX, ev.clientY);
    comp.passo = arrasto.base + Math.round((arrasto.y0 - m.y) / 12);
    redesenhar();
    return;
  }
  if (arrasto && arrasto.acaoBotao) return;

  if (arrasto) {
    const comp = achar(arrasto.id);
    const m = telaParaMundo(ev.clientX, ev.clientY);
    comp.x = Math.round((m.x - arrasto.dx) / 8) * 8;
    comp.y = Math.round((m.y - arrasto.dy) / 8) * 8;
    arrasto.filhos.forEach((f) => {
      const fc = achar(f.id);
      if (fc) { fc.x = comp.x + f.dx; fc.y = comp.y + f.dy; }
    });
    if (!arrasto.moveu) { comp.encaixes = []; comp.pai = null; }
    arrasto.moveu = true;
    posicionarGrupo(comp, arrasto.filhos);
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

  if (ev.pointerType === "mouse") {
    const alvo = ev.target.closest(".alvo");
    if (alvo) mostrarDica(alvo.dataset.comp, alvo.dataset.pino, ev.clientX, ev.clientY);
    else esconderDica();
  }
}

function posicionarGrupo(comp, filhos) {
  const d = PORID[comp.tipo];
  const g = camadaComp.querySelector(`.comp[data-id="${comp.id}"]`);
  if (g) g.setAttribute("transform", `translate(${comp.x} ${comp.y}) rotate(${comp.rot || 0} ${d.w / 2} ${d.h / 2})`);
  filhos.forEach((f) => {
    const fc = achar(f.id);
    if (!fc) return;
    const fd = PORID[fc.tipo];
    const fg = camadaComp.querySelector(`.comp[data-id="${fc.id}"]`);
    if (fg) fg.setAttribute("transform", `translate(${fc.x} ${fc.y}) rotate(${fc.rot || 0} ${fd.w / 2} ${fd.h / 2})`);
  });
}

function aoSoltar(ev) {
  ponteiros.delete(ev.pointerId);
  if (ponteiros.size < 2) pinca = null;

  if (arrasto && arrasto.acaoBotao) {
    const comp = achar(arrasto.acaoBotao);
    if (comp) { comp.pressionado = false; recalcular(); }
    arrasto = null;
    return;
  }
  if (arrasto && arrasto.acaoGiro) { arrasto = null; return; }
  if (arrasto && arrasto.acaoManche) {
    // O manche volta ao centro sozinho, como o de verdade.
    const comp = achar(arrasto.acaoManche);
    if (comp) { comp.eixoX = 50; comp.eixoY = 50; comp.pressionado = false; recalcular(); }
    arrasto = null;
    return;
  }
  if (arrasto && arrasto.acaoPasso) { arrasto = null; return; }

  if (arrasto) {
    const comp = achar(arrasto.id);
    if (arrasto.moveu && comp) {
      if (ganchos.aoSoltarPeca) {
        const jogado = ganchos.aoSoltarPeca(arrasto.id, ev.clientX, ev.clientY);
        if (jogado) { SOM.lixo(); remover(arrasto.id); arrasto = null; return; }
      }
      const encaixou = tentarEncaixar(comp);
      SOM[encaixou ? "encaixe" : "soltar"]();
      if (encaixou && ganchos.aoEncaixar) ganchos.aoEncaixar(comp, comp.encaixes.length);
      recalcular();
    }
    arrasto = null;
  }
  panorama = null;
}

function aoRoda(ev) {
  ev.preventDefault();
  zoom(ev.deltaY > 0 ? 0.88 : 1.12, { x: ev.clientX, y: ev.clientY });
}

function aoBotaoDireito(ev) {
  const gf = ev.target.closest(".fio");
  if (gf) { ev.preventDefault(); removerFio(gf.dataset.id); return; }
  if (estado.ferramentaFio) {
    ev.preventDefault();
    const nova = inverterPontas();
    if (nova && ganchos.aoInverter) ganchos.aoInverter(nova);
  }
}

function aoTeclar(ev) {
  if (ev.target.matches("input, select, textarea")) return;
  if (ev.key === "Escape") { estado.pendente = null; desenharTopo(); atualizarPontaCursor(); }
  if (ev.key === "Tab" && estado.ferramentaFio) {
    ev.preventDefault();
    const nova = inverterPontas();
    if (nova && ganchos.aoInverter) ganchos.aoInverter(nova);
  }
  if (ev.key === "r" || ev.key === "R") { if (estado.selecionado) girar(estado.selecionado); }
  if (ev.key === "Delete" || ev.key === "Backspace") {
    if (estado.fioSelecionado) removerFio(estado.fioSelecionado);
    else if (estado.selecionado) { SOM.lixo(); remover(estado.selecionado); }
  }
}

/* ---------- dica de pino -------------------------------------- */

function mostrarDica(compId, pinoId, x, y) {
  const alvo = pinoDe(compId, pinoId);
  if (!alvo) return;
  const d = PORID[alvo.comp.tipo];
  const p = alvo.pino;
  const circ = estado.ultimoCircuito;
  const v = circ ? circ.vDe(compId, pinoId) : 0;
  const gnd = circ ? circ.gndDe(compId, pinoId) : false;
  const medida = estado.energizado ? (gnd ? " &#183; GND" : v > 0 ? ` &#183; ${v.toFixed(1)} V` : " &#183; sem tensao") : "";

  dica.hidden = false;
  dica.innerHTML = `<b>${d.nome} &#183; ${p.n || p.id}</b>
    <span>${p.rotulo || ""}</span>
    <em>${NOME_CONTATO[p.r] || p.r}${medida}</em>`;
  const cr = svg.parentElement.getBoundingClientRect();
  let lx = x - cr.left + 16, ly = y - cr.top + 16;
  if (lx + 260 > cr.width) lx = x - cr.left - 272;
  if (ly + 90 > cr.height) ly = y - cr.top - 96;
  dica.style.left = lx + "px";
  dica.style.top = ly + "px";
}

function esconderDica() { if (dica) dica.hidden = true; }

/* ---------- ligacao de fios ----------------------------------- */

function clicarPino(compId, pinoId) {
  const alvo = pinoDe(compId, pinoId);
  if (!alvo) return;

  // Com uma ferramenta na mao, o clique pertence a ela.
  if (estado.modoFerramenta) {
    if (ganchos.aoUsarFerramenta) ganchos.aoUsarFerramenta(estado.modoFerramenta, compId, pinoId);
    return;
  }

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
    atualizarPontaCursor();
    return;
  }

  if (estado.pendente.comp === compId && estado.pendente.pino === pinoId) {
    estado.pendente = null; desenharTopo(); atualizarPontaCursor(); return;
  }

  estado.fios.push({
    id: "f" + (estado.seq++),
    tipo: estado.ferramentaFio.tipo,
    cor: estado.ferramentaFio.cor,
    pontas: [...estado.ferramentaFio.pontas],
    a: { comp: estado.pendente.comp, pino: estado.pendente.pino },
    b: { comp: compId, pino: pinoId },
  });
  estado.pendente = null;
  SOM.encaixe();
  atualizarPontaCursor();
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
    formato: "gabutron-bancada", versao: 3,
    criado: new Date().toISOString(),
    comps: estado.comps, fios: estado.fios, vista: estado.vista,
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
    x1 = Math.min(x1, c.x - 60); y1 = Math.min(y1, c.y - 60);
    x2 = Math.max(x2, c.x + d.w + 60); y2 = Math.max(y2, c.y + d.h + 60);
  }
  const w = x2 - x1, h = y2 - y1 + 60;
  const conteudo = camadaComp.innerHTML + camadaFios.innerHTML;
  const marca = `<text x="${x1 + 18}" y="${y2 + 40}" font-family="monospace" font-size="22" fill="#5CE07A">OFICINA DO METAL GABUTRON &#183; criado por GABURA</text>`;
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
