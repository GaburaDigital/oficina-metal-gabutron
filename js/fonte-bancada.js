/* ============================================================
   FONTE DE BANCADA — instrumento de painel.

   Igual a fonte do laboratorio: voce ajusta a tensao e o limite de
   corrente ANTES de ligar na carga. O limite de corrente e a parte que
   ninguem entende no comeco — ele nao empurra corrente, ele impede que
   passe demais. Fonte boa protege o circuito; e para isso que ela serve.
   ============================================================ */

import { PORID } from "./biblioteca.js";
import { ico } from "./icones.js";
import { SOM } from "./som.js";

let painel = null, aoFechar = null;
export const estado = { ativo: false, comp: null };

export function abrir(comp, bancada, ganchos) {
  const d = PORID[comp.tipo];
  if (!d.instrumento) return;
  estado.ativo = true;
  estado.comp = comp.id;
  aoFechar = ganchos && ganchos.aoFechar;

  const casa = document.getElementById("ferramenta-caixa");
  painel = document.createElement("div");
  painel.id = "fonte-painel";
  casa.appendChild(painel);
  casa.hidden = false;
  document.getElementById("painel-robo").classList.add("com-ferramenta");
  pintar(comp, d, bancada);
}

export function fechar() {
  estado.ativo = false;
  estado.comp = null;
  if (painel) painel.remove();
  painel = null;
  const casa = document.getElementById("ferramenta-caixa");
  if (casa && !casa.children.length) {
    casa.hidden = true;
    document.getElementById("painel-robo").classList.remove("com-ferramenta");
  }
  if (aoFechar) aoFechar();
}

function pintar(comp, d, bancada) {
  const v = comp.tensao ?? d.faixaTensao.padrao;
  const a = comp.limite ?? d.faixaCorrente.padrao;
  painel.innerHTML = `
<div class="mm-topo">${ico("energia", 16)}<b>Fonte de bancada</b>
  <button class="btn btn-icone" id="fb-x" aria-label="Fechar">${ico("fechar", 14)}</button>
</div>
<div class="mm-visor"><span id="fb-v">${v.toFixed(1)} V</span></div>
<div class="mm-visor" style="color:#FF9B7C"><span id="fb-a">${a.toFixed(2)} A</span></div>
<div style="padding:0 8px 8px">
  <label style="font-size:11px;color:var(--grafite)">tensao</label>
  <input type="range" id="fb-tensao" min="${d.faixaTensao.min}" max="${d.faixaTensao.max}" step="0.1" value="${v}">
  <label style="font-size:11px;color:var(--grafite)">limite de corrente</label>
  <input type="range" id="fb-corrente" min="${d.faixaCorrente.min}" max="${d.faixaCorrente.max}" step="0.05" value="${a}">
  <p class="mm-recado">Ajuste antes de ligar na carga. O limite de corrente nao empurra corrente: ele impede que passe demais.</p>
</div>`;

  painel.querySelector("#fb-x").addEventListener("click", fechar);
  painel.querySelector("#fb-tensao").addEventListener("input", (e) => {
    comp.tensao = Number(e.target.value);
    painel.querySelector("#fb-v").textContent = comp.tensao.toFixed(1) + " V";
    bancada.recalcular();
  });
  painel.querySelector("#fb-corrente").addEventListener("input", (e) => {
    comp.limite = Number(e.target.value);
    painel.querySelector("#fb-a").textContent = comp.limite.toFixed(2) + " A";
    SOM.clique();
    bancada.recalcular();
  });
}
