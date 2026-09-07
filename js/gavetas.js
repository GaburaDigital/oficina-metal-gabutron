/* ============================================================
   GAVETAS — o movel da oficina.
   Em vez de um menu suspenso, o aluno abre gaveta e caixa para achar
   a peca, como na aula de verdade. A sacola de jumpers fica primeiro
   porque e a coisa que mais se pega.
   ============================================================ */

import { COMPONENTES, MOVEIS, JUMPERS, CORES_FIO, FIO_SOLDA } from "./biblioteca.js";
import { miniatura } from "./desenhos.js";
import { ico } from "./icones.js";
import { SOM } from "./som.js";

let alvo, aoEscolherPeca, aoEscolherFio;
let fioAtivo = null, corAtiva = CORES_FIO[0];

let ferroLigado = false;

export function mostrarFioDeSolda(ligado) {
  ferroLigado = ligado;
  render(buscaAtual);
}

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
      (c) => c.caixa === m.id && !c.avulsa && (!f || c.nome.toLowerCase().includes(f) || c.id.includes(f))
    );
    if (!pecas.length) continue;
    // Peca que so funciona junto de outra fica ao lado dela na gaveta.
    for (const c of [...pecas]) {
      if (!c.agrupaCom) continue;
      const i = pecas.indexOf(c);
      const j = pecas.findIndex((x) => x.id === c.agrupaCom);
      if (i < 0 || j < 0) continue;
      pecas.splice(i, 1);
      pecas.splice(pecas.findIndex((x) => x.id === c.agrupaCom) + 1, 0, c);
    }
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

/* Forma diz funcao: quadrado e macho, circulo e femea, retangulo e jacare. */
function marcaPonta(tipo, x, y, cor) {
  if (tipo === "femea") return `<circle cx="${x}" cy="${y}" r="4" fill="${cor}" stroke="#05060A"/>`;
  if (tipo === "jacare") return `<rect x="${x - 5}" y="${y - 3}" width="10" height="6" rx="1" fill="${cor}" stroke="#05060A"/>`;
  if (tipo === "solda") return `<circle cx="${x}" cy="${y}" r="4" fill="${cor}" stroke="#05060A"/><circle cx="${x - 1}" cy="${y - 1}" r="1.5" fill="#F2F2EE"/>`;
  return `<rect x="${x - 4}" y="${y - 4}" width="8" height="8" rx="1" fill="${cor}" stroke="#05060A"/>`;
}

function sacolaJumpers() {
  return `<details class="gaveta" open>
    <summary class="gaveta-puxador">${ico("jumper", 18)}<span>Sacola de jumpers</span><span class="conta">${JUMPERS.length}</span></summary>
    <div style="padding:8px">
      <div style="display:grid;gap:4px">
        ${(ferroLigado ? [...JUMPERS, FIO_SOLDA] : JUMPERS).map((j) => `<button class="btn ${fioAtivo === j.id ? "ativo" : ""}" data-fio="${j.id}" style="justify-content:flex-start">
          <svg viewBox="0 0 48 16" width="42" height="14" aria-hidden="true">
            ${marcaPonta(j.pontas[0], 6, 11, j.cor)}
            <path d="M8 11q16 -14 32 0" fill="none" stroke="${j.cor}" stroke-width="3" ${j.exigeFerro ? 'stroke-dasharray="4 3"' : ""}/>
            ${marcaPonta(j.pontas[1], 42, 11, j.cor)}
          </svg>${j.nome}</button>`).join("")}
      </div>
      <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:8px">
        ${CORES_FIO.map((c) => `<button class="cor-fio" data-cor="${c}" aria-label="cor do fio"
          style="width:20px;height:20px;border-radius:2px;cursor:pointer;background:${c};border:2px solid ${c === corAtiva ? "var(--fosforo)" : "var(--linha)"}"></button>`).join("")}
      </div>
      <p style="color:var(--poeira);font-size:11px;margin:8px 0 0">Escolha o jumper, clique no primeiro contato e depois no segundo. <b>Tab</b> ou botao direito inverte a ponta da vez. <b>Esc</b> cancela.</p>
    </div>
  </details>`;
}

function ligarEventos() {
  // A paleta funciona como paleta de verdade: voce segura a peca e
  // arrasta ate a bancada. Clicar tambem funciona, para quem prefere.
  alvo.querySelectorAll("[data-peca]").forEach((b) => {
    b.addEventListener("pointerdown", (ev) => {
      ev.preventDefault();
      aoEscolherPeca(b.dataset.peca, ev);
    });
  });
  alvo.querySelectorAll("[data-fio]").forEach((b) => {
    b.addEventListener("click", () => {
      const j = [...JUMPERS, FIO_SOLDA].find((x) => x.id === b.dataset.fio);
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
