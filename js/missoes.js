/* ============================================================
   MISSOES — o modo exercicio.

   Cada objetivo de uma missao e uma REGRA declarativa, verificada
   contra o resultado do circuito. Isso significa que voce escreve
   exercicio novo em JSON, sem tocar em codigo.

   Regras disponiveis:
     existe      { componente, n }            peca presente na bancada
     mesmoNo     { a:{componente,pino|papel}, b:{...} }   dois pontos ligados
     ligado      { componente, n }            peca energizada e funcionando
     aceso       { componente, n }            LED aceso
     pinoEm      { componente, pino, papelAlvo }  sinal chegou no tipo certo de pino
     tensaoEm    { componente, pino, min, max }   tensao dentro da faixa
     firmware    { componente, modo, n }      pinos configurados nesse modo
     semCriticos {}                           nenhum diagnostico critico

   Pontuacao: valor da missao, menos 15 por cento por dica pedida,
   menos 20 por peca queimada, mais bonus de tempo restante.
   ============================================================ */

import { PORID } from "./biblioteca.js";
import { catalogo, carregarMissao } from "./conteudo.js";
import { ico } from "./icones.js";
import { SOM } from "./som.js";
import { somarPontos } from "./config.js";

export const sessao = {
  missao: null,
  pausada: false,
  feitos: new Set(),
  dicasUsadas: 0,
  queimadas: 0,
  ferramentas: new Set(),
  concluida: false,
  inicio: 0,
};

/* ---------- verificacao das regras ---------------------------- */

function pinosDe(comps, alvo) {
  const saida = [];
  for (const c of comps) {
    if (alvo.componente && c.tipo !== alvo.componente) continue;
    const d = PORID[c.tipo];
    if (!d) continue;
    for (const p of d.pinos) {
      if (alvo.pino && p.id !== alvo.pino) continue;
      if (alvo.papel && p.papel !== alvo.papel) continue;
      if (alvo.nome && p.n !== alvo.nome) continue;
      saida.push({ comp: c, pino: p });
    }
  }
  return saida;
}

export function verificar(regra, comps, circ) {
  if (!regra) return false;
  const conta = (t) => comps.filter((c) => c.tipo === t && !c.queimado).length;

  switch (regra.tipo) {
    case "existe":
      return conta(regra.componente) >= (regra.n || 1);

    case "mesmoNo": {
      const a = pinosDe(comps, regra.a), b = pinosDe(comps, regra.b);
      return a.some((x) => b.some((y) =>
        !(x.comp.id === y.comp.id && x.pino.id === y.pino.id) &&
        circ.noDe(x.comp.id, x.pino.id) === circ.noDe(y.comp.id, y.pino.id)));
    }

    case "ligado":
      return comps.filter((c) => c.tipo === regra.componente &&
        (circ.estados.get(c.id) || {}).ligado).length >= (regra.n || 1);

    case "aceso":
      return comps.filter((c) => c.tipo === regra.componente &&
        (circ.estados.get(c.id) || {}).aceso).length >= (regra.n || 1);

    case "pinoEm": {
      const alvos = pinosDe(comps, { componente: regra.componente, pino: regra.pino });
      return alvos.some(({ comp, pino }) => {
        const lista = circ.pinosDoNo.get(circ.noDe(comp.id, pino.id)) || [];
        return lista.some((it) => it.comp.id !== comp.id && it.pino.papel === regra.papelAlvo);
      });
    }

    case "tensaoEm": {
      const alvos = pinosDe(comps, regra);
      return alvos.some(({ comp, pino }) => {
        const v = circ.vDe(comp.id, pino.id);
        return v >= (regra.min ?? 0) && v <= (regra.max ?? 99);
      });
    }

    case "firmware":
      return comps.filter((c) => c.tipo === regra.componente)
        .reduce((soma, c) => soma + Object.values(c.firmware || {})
          .filter((f) => f.modo === regra.modo).length, 0) >= (regra.n || 1);

    case "emSerie": {
      // Duas pecas em serie de verdade: um terminal de cada uma no
      // mesmo no, e o outro terminal de cada uma em nos diferentes.
      const as = comps.filter((c) => c.tipo === regra.a && !c.queimado);
      const bs = comps.filter((c) => c.tipo === regra.b && !c.queimado);
      for (const ca of as) {
        const da = PORID[ca.tipo];
        for (const cb of bs) {
          const db = PORID[cb.tipo];
          for (const pa of da.pinos) {
            for (const pb of db.pinos) {
              const compartilham = circ.noDe(ca.id, pa.id) === circ.noDe(cb.id, pb.id);
              if (!compartilham) continue;
              const outroA = da.pinos.find((x) => x.id !== pa.id);
              const outroB = db.pinos.find((x) => x.id !== pb.id);
              if (!outroA || !outroB) continue;
              if (circ.noDe(ca.id, outroA.id) !== circ.noDe(cb.id, outroB.id)) return true;
            }
          }
        }
      }
      return false;
    }

    case "correnteEm": {
      const alvos = comps.filter((c) => c.tipo === regra.componente);
      return alvos.some((c) => {
        const e = circ.estados.get(c.id) || {};
        const i = e.corrente || 0;
        return i >= (regra.min ?? 0) && i <= (regra.max ?? 1e9);
      });
    }

    case "usouFerramenta":
      return sessao.ferramentas.has(regra.modo || regra.ferramenta);

    case "semRompidos":
      // nenhum fio partido por dentro continuou no circuito
      return !(circ.fiosRompidos || []).length;

    case "semCriticos":
      return !circ.diagnosticos.some((d) => d.nivel === "critico");

    default:
      return false;
  }
}

export function avaliar(comps, circ) {
  if (!sessao.missao) return { feitos: 0, total: 0, completa: false };
  const objetivos = sessao.missao.objetivos || [];
  sessao.feitos = new Set();
  for (const o of objetivos) if (verificar(o.regra, comps, circ)) sessao.feitos.add(o.id);
  const completa = objetivos.length > 0 && sessao.feitos.size === objetivos.length;
  return { feitos: sessao.feitos.size, total: objetivos.length, completa };
}

/* ---------- pontuacao ----------------------------------------- */

const MULT = { novato: 0.7, facil: 1, intermediario: 1.4, hacker: 2 };

export function calcularPontos(segundosRestantes) {
  const m = sessao.missao;
  if (!m) return 0;
  const base = (m.pontos || 100) * (MULT[m.dificuldade] || 1);
  const penalidadeDica = base * 0.15 * sessao.dicasUsadas;
  const penalidadeQueima = sessao.queimadas * 20;
  const bonusTempo = Math.max(0, Math.round((segundosRestantes || 0) / 60) * 4);
  return Math.max(10, Math.round(base - penalidadeDica - penalidadeQueima + bonusTempo));
}

export function concluir(segundosRestantes) {
  if (!sessao.missao || sessao.concluida) return null;
  sessao.concluida = true;
  const pontos = calcularPontos(segundosRestantes);
  const p = somarPontos(pontos, sessao.missao.id);
  SOM.sucesso();
  return { pontos, progresso: p };
}

/* ---------- orcamento ----------------------------------------- */

export function gastoAtual(comps) {
  return comps.reduce((s, c) => s + ((PORID[c.tipo] || {}).custo || 0), 0);
}

/* ---------- treino por tempo ---------------------------------- */

/* Em vez de escolher uma missao, o aluno define quanto tempo tem e que
   tipo de exercicio quer. O GabuTRON sorteia e vai emendando uma na
   outra ate o tempo acabar. E o formato que funciona em aula. */
export const treino = { ativo: false, fila: [], feitas: 0, filtros: null };

export function montarTreino(filtros) {
  const todas = [...(catalogo.construcao || []), ...(catalogo.manutencao || [])]
    .filter((m) => (m.fase || 2) <= 4)
    .filter((m) => (filtros.tipos.length ? filtros.tipos.includes(m.tipo) : true))
    .filter((m) => (filtros.dificuldades.length ? filtros.dificuldades.includes(m.dificuldade) : true));
  const embaralhada = todas.map((m) => [Math.random(), m]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
  treino.ativo = embaralhada.length > 0;
  treino.fila = embaralhada;
  treino.feitas = 0;
  treino.filtros = filtros;
  return embaralhada.length;
}

export function proximaDoTreino() {
  if (!treino.ativo || !treino.fila.length) return null;
  return treino.fila.shift();
}

export function encerrarTreino() {
  treino.ativo = false;
  treino.fila = [];
}

/* ---------- interface: seletor de missao ---------------------- */

let veu = null;

let filtroAtual = "todas";

const CASA_FILTRO = {
  todas: () => true,
  novato: (m) => m.dificuldade === "novato",
  facil: (m) => m.dificuldade === "facil",
  intermediario: (m) => m.dificuldade === "intermediario",
  hacker: (m) => m.dificuldade === "hacker",
  construcao: (m) => m.tipo === "construcao",
  manutencao: (m) => m.tipo === "manutencao",
  hacking: (m) => m.tipo === "hacking",
};

export function abrirSeletor(aoEscolher) {
  const todas = [...(catalogo.construcao || []), ...(catalogo.manutencao || []), ...(catalogo.hacking || [])]
    .filter((m) => (m.fase || 2) <= 5);
  const lista = todas.filter(CASA_FILTRO[filtroAtual] || CASA_FILTRO.todas);
  const futuras = [];

  veu = document.createElement("div");
  veu.className = "veu";
  veu.innerHTML = `
<div class="janela janela-larga" role="dialog" aria-modal="true" aria-label="Missoes">
  <div class="janela-topo">${ico("ferramenta", 18)}<h2>Missoes do GabuTRON</h2>
    <button class="btn btn-icone" id="x-mis" aria-label="Fechar">${ico("fechar", 16)}</button>
  </div>
  <div class="janela-corpo">
    <div class="filtros-missao">
      ${[["todas", "todas"], ["novato", "novato"], ["facil", "facil"], ["intermediario", "intermediario"],
         ["hacker", "hacker"], ["construcao", "construcao"], ["manutencao", "manutencao"], ["hacking", "hacking"]]
        .map(([id, r]) => `<button class="btn ${filtroAtual === id ? "ativo" : ""}" data-filtro="${id}">${r}</button>`).join("")}
    </div>
    ${lista.length ? `<div class="grade-missoes">${lista.map(cartao).join("")}</div>`
      : `<p style="color:var(--poeira)">Nenhuma missao neste filtro.</p>`}
    ${futuras.length ? `<div class="grupo" style="margin-top:18px"><h3>Chegam nas proximas fases</h3>
      <ul style="color:var(--poeira);font-size:12px;padding-left:18px">
        ${futuras.map((m) => `<li>${m.titulo} — precisa da ponte H com saidas ativas</li>`).join("")}
      </ul></div>` : ""}
  </div>
  <div class="janela-base" style="flex-direction:column;align-items:stretch;gap:10px">
    <div class="grupo" style="margin:0">
      <h3>${ico("relogio", 14)} Treinar por tempo</h3>
      <p style="color:var(--poeira);font-size:11px;margin:0 0 8px">O GabuTRON sorteia missoes e vai emendando uma na outra ate o tempo acabar.</p>
      <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:center">
        <label style="font-size:12px">minutos
          <select id="tr-min">${[10, 15, 20, 30, 40, 50].map((n) => `<option ${n === 20 ? "selected" : ""}>${n}</option>`).join("")}</select>
        </label>
        <span style="font-size:12px">tipo:
          ${[["construcao", "construcao"], ["manutencao", "manutencao"]].map(([v, r]) =>
            `<label style="margin-left:6px"><input type="checkbox" class="tr-tipo" value="${v}" checked> ${r}</label>`).join("")}
        </span>
      </div>
      <div style="margin-top:6px;font-size:12px">nivel:
        ${["novato", "facil", "intermediario", "hacker"].map((d) =>
          `<label style="margin-left:6px"><input type="checkbox" class="tr-dif" value="${d}" checked> ${d}</label>`).join("")}
      </div>
      <button class="btn btn-verde" id="tr-comecar" style="margin-top:10px">${ico("tocar", 16)}Comecar treino sorteado</button>
    </div>
    <button class="btn" id="mis-livre">${ico("bancada", 16)}Voltar para montagem livre</button>
  </div>
</div>`;
  document.body.appendChild(veu);

  const fechar = () => { if (veu) veu.remove(); veu = null; };
  veu.addEventListener("click", (e) => { if (e.target === veu) fechar(); });
  veu.querySelector("#x-mis").addEventListener("click", fechar);
  veu.querySelector("#mis-livre").addEventListener("click", () => { fechar(); aoEscolher(null); });

  veu.querySelectorAll("[data-filtro]").forEach((b) => b.addEventListener("click", () => {
    filtroAtual = b.dataset.filtro;
    SOM.clique();
    fechar();
    abrirSeletor(aoEscolher);
  }));

  veu.querySelector("#tr-comecar").addEventListener("click", async () => {
    const filtros = {
      minutos: Number(veu.querySelector("#tr-min").value),
      tipos: [...veu.querySelectorAll(".tr-tipo:checked")].map((x) => x.value),
      dificuldades: [...veu.querySelectorAll(".tr-dif:checked")].map((x) => x.value),
    };
    const quantas = montarTreino(filtros);
    fechar();
    if (!quantas) { aoEscolher(null, "Nenhuma missao combina com esses filtros."); return; }
    const entrada = proximaDoTreino();
    try {
      const dados = await carregarMissao(entrada);
      aoEscolher({ ...entrada, ...dados }, null, filtros);
    } catch (e) { aoEscolher(null, "Nao consegui abrir a primeira missao do treino."); }
  });

  veu.querySelectorAll("[data-missao]").forEach((b) => {
    b.addEventListener("click", async () => {
      const entrada = lista.find((m) => m.id === b.dataset.missao);
      fechar();
      SOM.clique();
      try {
        const dados = await carregarMissao(entrada);
        aoEscolher({ ...entrada, ...dados });
      } catch (e) {
        aoEscolher(null, "Nao consegui abrir o arquivo dessa missao.");
      }
    });
  });
}

function cartao(m) {
  return `<button class="cartao-missao" data-missao="${m.id}">
    <b>${m.titulo}</b>
    <span class="etiquetas">
      <i class="etq etq-${m.dificuldade}">${m.dificuldade}</i>
      <i class="etq">${m.minutos} min</i>
      <i class="etq">${m.pontos} pts</i>
      <i class="etq ${m.tipo === "hacking" ? "etq-hacking" : ""}">${m.tipo}</i>
    </span>
    <small>${m.resumo || ""}</small>
  </button>`;
}

/* ---------- interface: painel da missao ----------------------- */

export function iniciarMissao(missao) {
  sessao.missao = missao;
  sessao.feitos = new Set();
  sessao.dicasUsadas = 0;
  sessao.queimadas = 0;
  sessao.ferramentas = new Set();
  sessao.concluida = false;
  sessao.pausada = false;
  sessao.inicio = Date.now();
}

export function alternarPausa() {
  sessao.pausada = !sessao.pausada;
  document.body.classList.toggle("pausado", sessao.pausada);
  return sessao.pausada;
}

export function encerrarMissao() {
  sessao.missao = null;
  sessao.concluida = false;
  sessao.feitos = new Set();
}

export function pintarPainel(alvo, comps) {
  const m = sessao.missao;
  if (!m) { alvo.hidden = true; alvo.innerHTML = ""; return; }
  alvo.hidden = false;
  const gasto = gastoAtual(comps);
  const orcamento = m.creditos;
  alvo.innerHTML = `
<div class="missao-topo">
  <b>${m.titulo}</b>
  <span class="missao-controles">
    <button class="btn btn-icone" id="mis-pausa" aria-label="${sessao.pausada ? "Retomar" : "Pausar"}" title="${sessao.pausada ? "Retomar missao" : "Pausar missao"}">${ico(sessao.pausada ? "tocar" : "pausar", 14)}</button>
    <button class="btn btn-icone" id="mis-reiniciar" aria-label="Reiniciar missao" title="Reiniciar do zero">${ico("reiniciar", 14)}</button>
    <button class="btn btn-icone" id="mis-sair" aria-label="Encerrar missao" title="Encerrar missao">${ico("fechar", 14)}</button>
  </span>
</div>
<ul class="checklist">
  ${(m.objetivos || []).map((o) => `<li class="${sessao.feitos.has(o.id) ? "feito" : ""}">
      <span class="marca">${sessao.feitos.has(o.id) ? "OK" : "&#183;&#183;"}</span>${o.texto}</li>`).join("")}
</ul>
<div class="missao-base">
  <button class="btn" id="mis-dica">${ico("info", 14)}Pedir dica${sessao.dicasUsadas ? ` (${sessao.dicasUsadas})` : ""}</button>
  ${orcamento ? `<span class="orcamento ${gasto > orcamento ? "estourado" : ""}">creditos ${gasto}/${orcamento}</span>` : ""}
</div>`;
}
