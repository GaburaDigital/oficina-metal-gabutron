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
  feitos: new Set(),
  dicasUsadas: 0,
  queimadas: 0,
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

/* ---------- interface: seletor de missao ---------------------- */

let veu = null;

export function abrirSeletor(aoEscolher) {
  const lista = [...(catalogo.construcao || []), ...(catalogo.manutencao || [])]
    .filter((m) => (m.fase || 2) <= 2);
  const futuras = [...(catalogo.construcao || []), ...(catalogo.manutencao || [])]
    .filter((m) => (m.fase || 2) > 2);

  veu = document.createElement("div");
  veu.className = "veu";
  veu.innerHTML = `
<div class="janela janela-larga" role="dialog" aria-modal="true" aria-label="Missoes">
  <div class="janela-topo">${ico("ferramenta", 18)}<h2>Missoes do GabuTRON</h2>
    <button class="btn btn-icone" id="x-mis" aria-label="Fechar">${ico("fechar", 16)}</button>
  </div>
  <div class="janela-corpo">
    ${lista.length ? `<div class="grade-missoes">${lista.map(cartao).join("")}</div>`
      : `<p style="color:var(--poeira)">Nenhuma missao no catalogo ainda.</p>`}
    ${futuras.length ? `<div class="grupo" style="margin-top:18px"><h3>Chegam nas proximas fases</h3>
      <ul style="color:var(--poeira);font-size:12px;padding-left:18px">
        ${futuras.map((m) => `<li>${m.titulo} — precisa do multimetro e da solda</li>`).join("")}
      </ul></div>` : ""}
  </div>
  <div class="janela-base">
    <button class="btn" id="mis-livre">${ico("bancada", 16)}Voltar para montagem livre</button>
  </div>
</div>`;
  document.body.appendChild(veu);

  const fechar = () => { if (veu) veu.remove(); veu = null; };
  veu.addEventListener("click", (e) => { if (e.target === veu) fechar(); });
  veu.querySelector("#x-mis").addEventListener("click", fechar);
  veu.querySelector("#mis-livre").addEventListener("click", () => { fechar(); aoEscolher(null); });

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
      <i class="etq">${m.tipo === "manutencao" ? "manutencao" : "construcao"}</i>
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
  sessao.concluida = false;
  sessao.inicio = Date.now();
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
  <button class="btn btn-icone" id="mis-sair" aria-label="Encerrar missao" title="Encerrar missao">${ico("fechar", 14)}</button>
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
