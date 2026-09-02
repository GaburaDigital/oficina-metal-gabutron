/* ============================================================
   FIRMWARE DE TESTE — o painel que substitui a programacao.

   Aqui o aluno nao escreve codigo: ele diz em que estado cada pino
   da placa esta. Nivel alto, nivel baixo, PWM com ciclo ajustavel
   ou entrada. E o suficiente para o circuito ganhar vida e, mais
   importante, obriga a saber que servo pede PWM e que sensor
   analogico pede entrada analogica.

   Estado guardado em comp.firmware = { pinoId: { modo, duty } }.
   ============================================================ */

import { PORID } from "./biblioteca.js";
import { ico } from "./icones.js";
import { SOM } from "./som.js";

const MODOS = [
  { id: "desligado", nome: "desligado", dica: "pino solto, alta impedancia" },
  { id: "alto", nome: "nivel alto", dica: "vira fonte na tensao logica da placa" },
  { id: "baixo", nome: "nivel baixo", dica: "vira GND" },
  { id: "pwm", nome: "PWM", dica: "so funciona em pino marcado com til ou GPIO com PWM" },
  { id: "entrada", nome: "entrada", dica: "so le, nao aciona nada" },
];

let veu = null;

export function abrir(comps, aoMudar) {
  const placas = comps.filter((c) => (PORID[c.tipo] || {}).alimentada);
  veu = document.createElement("div");
  veu.className = "veu";
  veu.innerHTML = `
<div class="janela janela-larga" role="dialog" aria-modal="true" aria-label="Firmware de teste">
  <div class="janela-topo">${ico("placa", 18)}<h2>Firmware de teste</h2>
    <button class="btn btn-icone" id="x-fw" aria-label="Fechar">${ico("fechar", 16)}</button>
  </div>
  <div class="janela-corpo">
    ${placas.length ? placas.map((c) => bloco(c)).join("") : `<p style="color:var(--poeira)">Nenhuma placa de controle na bancada. Pegue uma na gaveta das placas.</p>`}
  </div>
  <div class="janela-base">
    <button class="btn" id="fw-zerar">Desligar todos os pinos</button>
    <span style="color:var(--poeira);font-size:11px;align-self:center">Isto nao e programacao: e um painel de teste de bancada.</span>
  </div>
</div>`;
  document.body.appendChild(veu);
  ligar(comps, aoMudar);
}

function bloco(comp) {
  const d = PORID[comp.tipo];
  const fw = comp.firmware || {};
  const usaveis = d.pinos.filter((p) => p.v == null && p.papel !== "gnd" && p.papel !== "terminal");
  return `<div class="grupo">
    <h3>${d.nome} — logica de ${d.tensaoLogica} V, ate ${d.limitePino} mA por pino</h3>
    <div class="grade-pinos">
      ${usaveis.map((p) => {
        const e = fw[p.id] || { modo: "desligado", duty: 128 };
        const morto = (comp.pinosQueimados || []).includes(p.id);
        return `<div class="linha-pino ${morto ? "morto" : ""}">
          <span class="nome-pino">${p.n}${p.papel === "pwm" ? " <b>~</b>" : ""}${p.papel === "analog" ? " <i>an</i>" : ""}</span>
          ${morto
            ? `<span class="etiqueta-morta">pino queimado</span>`
            : `<select data-comp="${comp.id}" data-pino="${p.id}">
                ${MODOS.map((m) => `<option value="${m.id}" ${e.modo === m.id ? "selected" : ""}>${m.nome}</option>`).join("")}
              </select>
              <input type="range" min="0" max="255" step="5" value="${e.duty ?? 128}"
                data-duty="${comp.id}|${p.id}" ${e.modo === "pwm" ? "" : "disabled"}>
              <span class="valor-duty" data-out="${comp.id}|${p.id}">${e.modo === "pwm" ? (e.duty ?? 128) : "—"}</span>`}
        </div>`;
      }).join("")}
    </div>
  </div>`;
}

function ligar(comps, aoMudar) {
  const achar = (id) => comps.find((c) => c.id === id);
  const fechar = () => { if (veu) veu.remove(); veu = null; };

  veu.addEventListener("click", (e) => { if (e.target === veu) fechar(); });
  veu.querySelector("#x-fw").addEventListener("click", fechar);

  veu.querySelectorAll("select[data-pino]").forEach((s) => {
    s.addEventListener("change", () => {
      const c = achar(s.dataset.comp);
      c.firmware = c.firmware || {};
      const atual = c.firmware[s.dataset.pino] || { duty: 128 };
      c.firmware[s.dataset.pino] = { modo: s.value, duty: atual.duty ?? 128 };
      const faixa = veu.querySelector(`[data-duty="${s.dataset.comp}|${s.dataset.pino}"]`);
      const saida = veu.querySelector(`[data-out="${s.dataset.comp}|${s.dataset.pino}"]`);
      if (faixa) faixa.disabled = s.value !== "pwm";
      if (saida) saida.textContent = s.value === "pwm" ? faixa.value : "—";
      SOM.clique();
      aoMudar();
    });
  });

  veu.querySelectorAll("input[data-duty]").forEach((f) => {
    f.addEventListener("input", () => {
      const [cid, pid] = f.dataset.duty.split("|");
      const c = achar(cid);
      c.firmware = c.firmware || {};
      c.firmware[pid] = { modo: "pwm", duty: Number(f.value) };
      veu.querySelector(`[data-out="${cid}|${pid}"]`).textContent = f.value;
      aoMudar();
    });
  });

  veu.querySelector("#fw-zerar").addEventListener("click", () => {
    comps.forEach((c) => { c.firmware = {}; });
    fechar();
    SOM.desliga();
    aoMudar();
  });
}
