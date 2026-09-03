/* ============================================================
   MULTIMETRO — a ferramenta que separa quem conserta de quem
   troca peca no chute.

   Quatro modos, os mesmos do aparelho da bancada:
     CONTINUIDADE  existe caminho entre os dois pontos? apita se sim
     TENSAO DC     quanta tensao ha entre a ponta vermelha e a preta
     RESISTENCIA   quantos ohms ha no caminho entre as pontas
     CORRENTE      quanta corrente passa pelo componente entre as pontas

   Regra de bancada que o aparelho cobra: continuidade e resistencia
   so valem com o circuito DESENERGIZADO. Medir resistencia com o
   circuito ligado da leitura errada e, na vida real, queima o
   aparelho. Aqui o GabuTRON avisa antes.
   ============================================================ */

import { PORID } from "./biblioteca.js";
import { ohms } from "./circuito.js";
import { ico } from "./icones.js";
import { SOM } from "./som.js";

export const MODOS = [
  { id: "continuidade", nome: "Continuidade", simbolo: "((&#183;))", precisaDesligado: true },
  { id: "tensao", nome: "Tensao DC", simbolo: "V&#8212;", precisaDesligado: false },
  { id: "resistencia", nome: "Resistencia", simbolo: "&#937;", precisaDesligado: true },
  { id: "corrente", nome: "Corrente", simbolo: "mA", precisaDesligado: false },
];

export const estado = {
  ativo: false,
  modo: "continuidade",
  proxima: "vermelha",
  pontas: { vermelha: null, preta: null },
  leitura: "---",
  usou: new Set(),
};

let painel = null, aoMudar = null;

/* ---------- calculo das medidas -------------------------------- */

/* Menor resistencia entre dois nos, andando pelos componentes de dois
   terminais. Se nao houver caminho, o aparelho mostra OL, que e como
   ele diz "circuito aberto". */
function resistenciaEntre(circ, noA, noB) {
  if (noA === noB) return 0;
  const vizinhos = new Map();
  circ.arestas.forEach((a, i) => {
    const r = a.tipo === "resistor" ? ohms(a.comp.valor) : (a.r || 0);
    if (!vizinhos.has(a.na)) vizinhos.set(a.na, []);
    if (!vizinhos.has(a.nb)) vizinhos.set(a.nb, []);
    vizinhos.get(a.na).push({ para: a.nb, r, i });
    vizinhos.get(a.nb).push({ para: a.na, r, i });
  });
  const dist = new Map([[noA, 0]]);
  const fila = [noA];
  while (fila.length) {
    const atual = fila.shift();
    for (const v of vizinhos.get(atual) || []) {
      const novo = dist.get(atual) + v.r;
      if (dist.has(v.para) && dist.get(v.para) <= novo) continue;
      dist.set(v.para, novo);
      fila.push(v.para);
    }
  }
  return dist.has(noB) ? dist.get(noB) : null;
}

function formatarOhms(r) {
  if (r === null) return "OL";
  if (r < 1) return "0,0 &#937;";
  if (r < 1000) return `${r.toFixed(1)} &#937;`;
  if (r < 1e6) return `${(r / 1000).toFixed(2)} k&#937;`;
  return `${(r / 1e6).toFixed(2)} M&#937;`;
}

export function medir(bancada) {
  const { vermelha, preta } = estado.pontas;
  if (!vermelha || !preta) return { texto: "---", aviso: null };

  const circ = bancada.estado.ultimoCircuito;
  if (!circ) return { texto: "---", aviso: null };

  const modo = MODOS.find((m) => m.id === estado.modo);
  if (modo.precisaDesligado && bancada.estado.energizado) {
    return {
      texto: "ERR",
      aviso: "Nao se mede continuidade nem resistencia com o circuito ligado. Desenergize a bancada primeiro. Na vida real essa distracao queima o multimetro.",
    };
  }

  const nA = circ.noDe(vermelha.comp, vermelha.pino);
  const nB = circ.noDe(preta.comp, preta.pino);

  if (estado.modo === "continuidade") {
    const r = resistenciaEntre(circ, nA, nB);
    const passa = r !== null && r < 10;
    if (passa) SOM.bipLongo();
    return {
      texto: passa ? "APITA &#183; 0,0 &#937;" : "aberto",
      aviso: passa ? null : "Sem caminho entre esses dois pontos. Ou falta ligacao, ou tem fio partido por dentro.",
    };
  }

  if (estado.modo === "resistencia") {
    return { texto: formatarOhms(resistenciaEntre(circ, nA, nB)), aviso: null };
  }

  if (estado.modo === "tensao") {
    if (!bancada.estado.energizado)
      return { texto: "0,00 V", aviso: "Bancada desligada. Para medir tensao voce precisa energizar." };
    const vA = circ.vDe(vermelha.comp, vermelha.pino);
    const vB = circ.vDe(preta.comp, preta.pino);
    return { texto: `${(vA - vB).toFixed(2)} V`, aviso: null };
  }

  // corrente: o aparelho entra em serie, entao as pontas precisam
  // estar nos dois terminais da MESMA peca
  if (vermelha.comp !== preta.comp)
    return { texto: "---", aviso: "Para medir corrente o multimetro entra em serie. Encoste as duas pontas nos dois terminais da mesma peca." };
  const est = circ.estados.get(vermelha.comp);
  const i = est && est.corrente ? est.corrente : 0;
  return { texto: `${i.toFixed(1)} mA`, aviso: bancada.estado.energizado ? null : "Bancada desligada: nao passa corrente." };
}

/* ---------- pontas de prova ----------------------------------- */

export function encostar(comp, pino, bancada) {
  estado.pontas[estado.proxima] = { comp, pino };
  estado.proxima = estado.proxima === "vermelha" ? "preta" : "vermelha";
  estado.usou.add(estado.modo);
  SOM.clique();
  atualizar(bancada);
}

export function limparPontas(bancada) {
  estado.pontas = { vermelha: null, preta: null };
  estado.proxima = "vermelha";
  atualizar(bancada);
}

/* Marcadores das pontas, desenhados por cima da bancada. */
export function svgPontas(bancada) {
  let s = "";
  for (const [qual, cor] of [["vermelha", "#E24B4A"], ["preta", "#1B1F26"]]) {
    const p = estado.pontas[qual];
    if (!p) continue;
    const alvo = bancada.posicaoDePino(p.comp, p.pino);
    if (!alvo) continue;
    s += `<g pointer-events="none">
      <path d="M${alvo.x} ${alvo.y}L${alvo.x + 44} ${alvo.y - 78}" stroke="${cor}" stroke-width="7" stroke-linecap="round"/>
      <path d="M${alvo.x + 44} ${alvo.y - 78}L${alvo.x + 60} ${alvo.y - 106}" stroke="${cor}" stroke-width="14" stroke-linecap="round"/>
      <circle cx="${alvo.x}" cy="${alvo.y}" r="9" fill="none" stroke="${cor}" stroke-width="3"/>
      <circle cx="${alvo.x}" cy="${alvo.y}" r="3.5" fill="${cor}"/>
    </g>`;
  }
  return s;
}

/* ---------- painel -------------------------------------------- */

export function abrir(bancada, ganchos) {
  aoMudar = ganchos;
  estado.ativo = true;
  bancada.estado.modoFerramenta = "multimetro";

  painel = document.createElement("div");
  painel.id = "multimetro";
  document.body.appendChild(painel);
  pintar(bancada);
  atualizar(bancada);
}

export function fechar(bancada) {
  estado.ativo = false;
  bancada.estado.modoFerramenta = null;
  limparPontas(bancada);
  if (painel) painel.remove();
  painel = null;
  if (aoMudar && aoMudar.aoFechar) aoMudar.aoFechar();
}

function pintar(bancada) {
  painel.innerHTML = `
<div class="mm-topo">${ico("multimetro", 16)}<b>Multimetro</b>
  <button class="btn btn-icone" id="mm-x" aria-label="Guardar o multimetro">${ico("fechar", 14)}</button>
</div>
<div class="mm-visor"><span id="mm-leitura">${estado.leitura}</span></div>
<div class="mm-seletor">
  ${MODOS.map((m) => `<button class="btn ${estado.modo === m.id ? "ativo" : ""}" data-modo="${m.id}">
    <span class="mm-simbolo">${m.simbolo}</span>${m.nome}</button>`).join("")}
</div>
<div class="mm-pontas">
  <span class="mm-ponta ${estado.proxima === "vermelha" ? "vez" : ""}"><i style="background:#E24B4A"></i>vermelha ${estado.pontas.vermelha ? "&#10003;" : ""}</span>
  <span class="mm-ponta ${estado.proxima === "preta" ? "vez" : ""}"><i style="background:#1B1F26;border:1px solid var(--linha-viva)"></i>preta ${estado.pontas.preta ? "&#10003;" : ""}</span>
  <button class="btn" id="mm-limpar">Soltar pontas</button>
</div>
<p class="mm-recado" id="mm-recado"></p>`;

  painel.querySelectorAll("[data-modo]").forEach((b) =>
    b.addEventListener("click", () => {
      estado.modo = b.dataset.modo;
      SOM.clique();
      pintar(bancada);
      atualizar(bancada);
    }));
  painel.querySelector("#mm-x").addEventListener("click", () => fechar(bancada));
  painel.querySelector("#mm-limpar").addEventListener("click", () => limparPontas(bancada));
}

export function atualizar(bancada) {
  if (!painel) return;
  const r = medir(bancada);
  estado.leitura = r.texto;
  const visor = painel.querySelector("#mm-leitura");
  const recado = painel.querySelector("#mm-recado");
  if (visor) visor.innerHTML = r.texto;
  if (recado) recado.innerHTML = r.aviso || "Clique num contato da bancada para encostar a ponta da vez.";
  pintarPontasNoPainel();
  if (aoMudar && aoMudar.aoMedir) aoMudar.aoMedir(r);
  bancada.redesenhar();
}

function pintarPontasNoPainel() {
  if (!painel) return;
  painel.querySelectorAll(".mm-ponta").forEach((el, i) => {
    const qual = i === 0 ? "vermelha" : "preta";
    el.classList.toggle("vez", estado.proxima === qual);
    el.innerHTML = el.innerHTML.replace(/&#10003;|✓/g, "") + (estado.pontas[qual] ? " &#10003;" : "");
  });
}
