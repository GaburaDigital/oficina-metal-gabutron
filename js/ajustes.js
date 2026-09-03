/* ============================================================
   AJUSTES — janela de configuracao.
   Tudo o que o aluno mexe aqui fica guardado no navegador e volta
   na proxima aula, inclusive no celular dele em casa.
   ============================================================ */

import { ajustes, definir, salvarAjustes, limpar, PADRAO } from "./config.js";
import { listarVozes, suportaVoz, falar } from "./voz.js";
import { ico } from "./icones.js";
import { SOM } from "./som.js";

let veu = null, aoFechar = null;

const chave = (id, ligado, rotulo, dica) => `
<div class="troca">
  <span><label for="${id}">${rotulo}</label>${dica ? `<small>${dica}</small>` : ""}</span>
  <button class="chave" id="${id}" role="switch" aria-checked="${ligado}" aria-label="${rotulo}"></button>
</div>`;

export function abrir(ganchos = {}) {
  aoFechar = ganchos.aoFechar;
  const vozes = suportaVoz() ? listarVozes() : [];
  veu = document.createElement("div");
  veu.className = "veu";
  veu.innerHTML = `
<div class="janela" role="dialog" aria-modal="true" aria-label="Ajustes">
  <div class="janela-topo">${ico("ajustes", 18)}<h2>Ajustes</h2>
    <button class="btn btn-icone" id="x-ajustes" aria-label="Fechar">${ico("fechar", 16)}</button>
  </div>
  <div class="janela-corpo">

    <div class="grupo"><h3>Aparencia</h3>
      ${chave("a-modo", ajustes.modo === "claro", "Modo claro", "Fundo branco com texto preto")}
      ${chave("a-grade", ajustes.gradeVisivel, "Grade da bancada")}
      ${chave("a-digitacao", ajustes.digitacao, "Texto digitado", "O GabuTRON escreve letra por letra")}
      <div class="troca"><span><label for="a-bancada">Cor da bancada</label><small>Independente do modo claro</small></span>
        <select id="a-bancada">
          ${[["carvao", "carvao"], ["ardosia", "ardosia"], ["musgo", "verde claro"], ["papel", "papel"]]
            .map(([v, r]) => `<option value="${v}" ${ajustes.corBancada === v ? "selected" : ""}>${r}</option>`).join("")}
        </select></div>
    </div>

    <div class="grupo"><h3>Som e voz</h3>
      ${chave("a-som", ajustes.som, "Efeitos sonoros")}
      ${chave("a-voz", ajustes.voz, "Voz do GabuTRON", "Libera a leitura em voz alta pelo botao Falar")}
      ${chave("a-falaauto", ajustes.falaAutomatica, "Ler tudo em voz alta", "Sem isto, ele so fala quando voce pede")}
      ${vozes.length ? `<div class="troca"><label for="a-vozlista">Voz do sistema</label>
        <select id="a-vozlista">${vozes.map((v) => `<option value="${v.name}" ${ajustes.vozEscolhida === v.name ? "selected" : ""}>${v.name}</option>`).join("")}</select></div>
        <button class="btn" id="a-testarvoz">${ico("falar", 16)}Testar a voz</button>`
      : `<p style="color:var(--poeira);font-size:11px">Este navegador nao trouxe vozes em portugues. O texto continua na tela.</p>`}
    </div>

    <div class="grupo"><h3>Treino</h3>
      <div class="troca"><span><label for="a-min">Tempo de treino</label><small><b id="a-minval">${ajustes.minutos}</b> minutos</small></span></div>
      <input type="range" id="a-min" min="10" max="50" step="5" value="${ajustes.minutos}" ${ajustes.tempoInfinito ? "disabled" : ""}>
      ${chave("a-infinito", ajustes.tempoInfinito, "Tempo infinito", "Sem cronometro, para explorar a vontade")}
      <div class="troca"><label for="a-dif">Dificuldade padrao</label>
        <select id="a-dif">
          ${["novato", "facil", "intermediario", "hacker"].map((d) => `<option value="${d}" ${ajustes.dificuldade === d ? "selected" : ""}>${d}</option>`).join("")}
        </select></div>
    </div>

    <div class="grupo"><h3>Dados salvos</h3>
      ${chave("a-auto", ajustes.autoSalvar, "Guardar a bancada", "Ao voltar, a montagem continua onde parou")}
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">
        <button class="btn" id="a-limpa-bancada">${ico("limpar", 16)}Apagar bancada salva</button>
        <button class="btn btn-perigo" id="a-limpa-tudo">${ico("lixo", 16)}Limpar tudo</button>
      </div>
      <p style="color:var(--poeira);font-size:11px;margin-top:6px">Limpar tudo apaga ajustes, montagem e pontuacao deste navegador.</p>
    </div>

  </div>
  <div class="janela-base">
    <button class="btn btn-verde" id="a-salvar">${ico("salvar", 16)}Salvar preferencias</button>
    <button class="btn" id="a-padrao">Voltar ao padrao</button>
    <span id="a-recado" style="color:var(--fosforo);font-size:11px;align-self:center"></span>
  </div>
</div>`;
  document.body.appendChild(veu);
  ligar(ganchos);
}

function fechar() {
  if (veu) veu.remove();
  veu = null;
  if (aoFechar) aoFechar();
}

function ligar(ganchos) {
  const q = (s) => veu.querySelector(s);
  const recado = (t) => { q("#a-recado").textContent = t; setTimeout(() => { if (veu) q("#a-recado").textContent = ""; }, 2200); };

  veu.addEventListener("click", (e) => { if (e.target === veu) fechar(); });
  q("#x-ajustes").addEventListener("click", fechar);

  const troca = (sel, campo, depois) =>
    q(sel).addEventListener("click", (e) => {
      const novo = e.currentTarget.getAttribute("aria-checked") !== "true";
      e.currentTarget.setAttribute("aria-checked", String(novo));
      definir(campo, novo);
      SOM.clique();
      if (depois) depois(novo);
    });

  q("#a-modo").addEventListener("click", (e) => {
    const claro = e.currentTarget.getAttribute("aria-checked") !== "true";
    e.currentTarget.setAttribute("aria-checked", String(claro));
    definir("modo", claro ? "claro" : "escuro");
    SOM.clique();
  });

  troca("#a-grade", "gradeVisivel", (v) => {
    const g = document.querySelector("#fundo-grade");
    if (g) g.style.display = v ? "" : "none";
  });
  troca("#a-digitacao", "digitacao");
  troca("#a-som", "som", (v) => { if (v) SOM.encaixe(); });
  troca("#a-voz", "voz");
  troca("#a-falaauto", "falaAutomatica");
  q("#a-bancada").addEventListener("change", (e) => definir("corBancada", e.target.value));
  troca("#a-auto", "autoSalvar");
  troca("#a-infinito", "tempoInfinito", (v) => { q("#a-min").disabled = v; if (ganchos.aoMudarTempo) ganchos.aoMudarTempo(); });

  q("#a-min").addEventListener("input", (e) => {
    q("#a-minval").textContent = e.target.value;
    definir("minutos", Number(e.target.value));
    if (ganchos.aoMudarTempo) ganchos.aoMudarTempo();
  });
  q("#a-dif").addEventListener("change", (e) => definir("dificuldade", e.target.value));

  const lista = q("#a-vozlista");
  if (lista) lista.addEventListener("change", (e) => definir("vozEscolhida", e.target.value));
  const testar = q("#a-testarvoz");
  if (testar) testar.addEventListener("click", () => falar("Assistente, aqui e o Metal GabuTRON. Teste de voz concluido."));

  q("#a-salvar").addEventListener("click", () => {
    recado(salvarAjustes() ? "Preferencias salvas." : "O navegador bloqueou o armazenamento.");
    SOM.sucesso();
  });

  q("#a-padrao").addEventListener("click", () => {
    Object.assign(ajustes, PADRAO);
    salvarAjustes();
    fechar();
    abrir(ganchos);
  });

  q("#a-limpa-bancada").addEventListener("click", () => {
    limpar("bancada");
    recado("Bancada salva apagada.");
    SOM.lixo();
  });

  q("#a-limpa-tudo").addEventListener("click", () => {
    limpar("tudo");
    recado("Tudo limpo. Recarregue a pagina.");
    SOM.lixo();
  });
}
