/* ============================================================
   GAVETAS — o movel da oficina.
   Em vez de um menu suspenso, o aluno abre gaveta e caixa para achar
   a peca, como na aula de verdade. A sacola de jumpers fica primeiro
   porque e a coisa que mais se pega.
   ============================================================ */

import { COMPONENTES, MOVEIS, JUMPERS, CORES_FIO } from "./biblioteca.js";
import { miniatura } from "./desenhos.js";
import { ico } from "./icones.js";
import { SOM } from "./som.js";

let alvo, aoEscolherPeca, aoEscolherFio;
let fioAtivo = null, corAtiva = CORES_FIO[0];

export function iniciar(elemento, ganchos) {
  alvo = elemento;
  aoEscolherPeca = ganchos.aoEscolherPeca;
  aoEscolherFio = ganchos.aoEscolherFio;
  render();
}

function render(filtro = "") {
  const f = filtro.trim().toLowerCase();
  let html = sacolaJumpers();

  for (const m of MOVEIS) {
    const pecas = COMPONENTES.filter(
      (c) => c.caixa === m.id && (!f || c.nome.toLowerCase().includes(f) || c.id.includes(f))
    );
    if (!pecas.length) continue;
    html += `<details class="gaveta" ${f ? "open" : m.id === "placas" ? "open" : ""}>
      <summary class="gaveta-puxador">${ico(m.icone, 18)}<span>${m.nome}</span><span class="conta">${pecas.length}</span></summary>
      <div class="gaveta-conteudo">
        ${pecas.map((c) => `<button class="peca" data-peca="${c.id}" title="${c.nome}">${miniatura(c)}<span>${c.nome}</span></button>`).join("")}
      </div>
    </details>`;
  }
  alvo.innerHTML = html;
  ligarEventos();
}

function sacolaJumpers() {
  return `<details class="gaveta" open>
    <summary class="gaveta-puxador">${ico("jumper", 18)}<span>Sacola de jumpers</span><span class="conta">${JUMPERS.length}</span></summary>
    <div style="padding:8px">
      <div style="display:grid;gap:4px">
        ${JUMPERS.map((j) => `<button class="btn ${fioAtivo === j.id ? "ativo" : ""}" data-fio="${j.id}" style="justify-content:flex-start">
          <svg viewBox="0 0 40 14" width="34" height="12" aria-hidden="true"><path d="M4 10q16 -14 32 0" fill="none" stroke="${j.cor}" stroke-width="3"/></svg>${j.nome}</button>`).join("")}
      </div>
      <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:8px">
        ${CORES_FIO.map((c) => `<button class="cor-fio" data-cor="${c}" aria-label="cor do fio"
          style="width:20px;height:20px;border-radius:2px;cursor:pointer;background:${c};border:2px solid ${c === corAtiva ? "var(--fosforo)" : "var(--linha)"}"></button>`).join("")}
      </div>
      <p style="color:var(--poeira);font-size:11px;margin:8px 0 0">Escolha o jumper, clique no primeiro contato e depois no segundo. Esc cancela.</p>
    </div>
  </details>`;
}

function ligarEventos() {
  alvo.querySelectorAll("[data-peca]").forEach((b) => {
    b.addEventListener("click", () => { SOM.pegar(); aoEscolherPeca(b.dataset.peca); });
  });
  alvo.querySelectorAll("[data-fio]").forEach((b) => {
    b.addEventListener("click", () => {
      const j = JUMPERS.find((x) => x.id === b.dataset.fio);
      fioAtivo = fioAtivo === j.id ? null : j.id;
      SOM.clique();
      aoEscolherFio(fioAtivo ? j : null, corAtiva);
      render(buscaAtual);
    });
  });
  alvo.querySelectorAll("[data-cor]").forEach((b) => {
    b.addEventListener("click", () => {
      corAtiva = b.dataset.cor;
      SOM.clique();
      if (fioAtivo) aoEscolherFio(JUMPERS.find((x) => x.id === fioAtivo), corAtiva);
      render(buscaAtual);
    });
  });
}

let buscaAtual = "";
export function buscar(texto) { buscaAtual = texto; render(texto); }
export function largarFio() { fioAtivo = null; render(buscaAtual); }
