/* ============================================================
   MUSEU DOS DESASTRES — a galeria das pecas que nao sobreviveram.
   Cada uma com o motivo escrito. E uma lista de erros, mas apresentada
   como trofeu: quem queimou dez pecas aprendeu dez coisas.
   ============================================================ */

import { lerMuseu, limpar } from "./config.js";
import { ico } from "./icones.js";
import { SOM } from "./som.js";

const HONRARIAS = [
  { min: 0, txt: "Bancada limpa. Ou voce e cuidadoso, ou ainda nao tentou nada difícil." },
  { min: 1, txt: "Primeira baixa registrada. Todo tecnico tem a sua." },
  { min: 5, txt: "Cinco pecas. Voce ja sabe reconhecer o cheiro." },
  { min: 12, txt: "Doze pecas. O almoxarifado da nave pediu para conversar com voce." },
  { min: 25, txt: "Vinte e cinco. Eu deveria estar bravo, mas estou impressionado." },
];

export function abrir() {
  const m = lerMuseu();
  const honra = [...HONRARIAS].reverse().find((h) => m.total >= h.min);

  const veu = document.createElement("div");
  veu.className = "veu";
  veu.innerHTML = `
<div class="janela" role="dialog" aria-modal="true" aria-label="Museu dos Desastres">
  <div class="janela-topo">${ico("lixo", 18)}<h2>Museu dos Desastres</h2>
    <button class="btn btn-icone" id="x-museu" aria-label="Fechar">${ico("fechar", 16)}</button>
  </div>
  <div class="janela-corpo">
    <p style="color:var(--grafite)">Pecas perdidas em servico: <b class="museu-conta">${m.total || 0}</b></p>
    <p style="color:var(--poeira);font-size:12px">${honra.txt}</p>
    ${m.pecas && m.pecas.length
      ? `<ul class="lista-museu">${m.pecas.map((p) => `<li><b>${p.nome}</b><small>${p.motivo}</small></li>`).join("")}</ul>`
      : `<p style="color:var(--poeira);font-size:12px;margin-top:12px">Nenhuma peca no museu. A fumaca magica continua toda dentro dos componentes, que e onde ela deve ficar.</p>`}
  </div>
  <div class="janela-base">
    <button class="btn btn-perigo" id="museu-limpar">${ico("limpar", 16)}Esvaziar o museu</button>
  </div>
</div>`;
  document.body.appendChild(veu);

  const fechar = () => veu.remove();
  veu.addEventListener("click", (e) => { if (e.target === veu) fechar(); });
  veu.querySelector("#x-museu").addEventListener("click", fechar);
  veu.querySelector("#museu-limpar").addEventListener("click", () => {
    limpar("museu");
    SOM.lixo();
    fechar();
    abrir();
  });
}
