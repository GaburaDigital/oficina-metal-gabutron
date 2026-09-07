/* ============================================================
   BOOT — partida do sistema.
   Um teatro de dez segundos que ensina o aluno a ler mensagem de
   sistema sem medo. Clicar pula. Digitar GABURA durante o boot
   destrava um recado escondido.
   ============================================================ */

import { SOM } from "./som.js";
import { ajustes } from "./config.js";

const LINHAS = [
  ["GABUROM v2.6 — bios da nave", "apagado", 60],
  ["memoria de bancada .......... 640 KB", "", 80],
  ["barramento de energia ....... [ok]", "ok", 90],
  ["gavetas e caixas ............ [ok]", "ok", 80],
  ["sacola de jumpers ........... [ok]", "ok", 80],
  ["protoboard 400 pontos ....... [ok]", "ok", 80],
  ["missoes carregadas .......... construcao, manutencao e hacking", "frio", 90],
  ["deck de scripts ............. 17 programas prontos", "ok", 90],
  ["ferro de solda e fio ........ [pronto]", "ok", 80],
  ["ferro de solda .............. [pronto]", "ok", 90],
  ["multimetro .................. [na caixa da energia]", "ok", 90],
  ["fonte de bancada ............ [0 a 30 V]", "ok", 90],
  ["catalogo de pecas ........... 96 itens", "", 90],
  ["", "", 40],
  ["montando o modulo METAL GABUTRON", "frio", 260],
  ["tubo de imagem .............. [aquecendo]", "frio", 240],
  ["personalidade ............... [carregada, infelizmente]", "ok", 200],
  ["", "", 40],
  ["OFICINA PRONTA. bem-vindo, assistente.", "ok", 300],
];

export function tocar(aoTerminar) {
  const caixa = document.getElementById("boot");
  const linhas = document.getElementById("boot-linhas");
  estrelas(caixa.querySelector(".estrelas"));

  let i = 0, pulado = false, teclado = "";
  SOM.boot();

  const proxima = () => {
    if (pulado) return;
    if (i >= LINHAS.length) return sair();
    const [txt, classe, espera] = LINHAS[i++];
    const el = document.createElement("div");
    if (classe) el.className = classe;
    linhas.appendChild(el);
    escrever(el, txt, () => setTimeout(proxima, ajustes.digitacao ? espera : 30));
  };

  const escrever = (el, txt, fim) => {
    if (!ajustes.digitacao || !txt) { el.textContent = txt; return fim(); }
    let k = 0;
    const t = setInterval(() => {
      el.textContent = txt.slice(0, ++k);
      if (k % 4 === 0) SOM.tecla();
      if (k >= txt.length) { clearInterval(t); fim(); }
    }, 12);
  };

  const sair = () => {
    if (pulado) return;
    pulado = true;
    window.removeEventListener("keydown", ouvirTeclado);
    SOM.bipLongo();
    caixa.classList.add("saindo");
    setTimeout(() => { caixa.remove(); aoTerminar(); }, 260);
  };

  caixa.addEventListener("click", sair);
  const ouvirTeclado = (e) => {
    teclado = (teclado + e.key).slice(-6).toUpperCase();
    if (teclado === "GABURA") {
      const el = document.createElement("div");
      el.className = "ok";
      el.textContent = "acesso de fabrica reconhecido. o GabuTRON manda um abraco de bracinho.";
      linhas.appendChild(el);
      SOM.sucesso();
      return;
    }
    if (e.key === "Enter" || e.key === " " || e.key === "Escape") sair();
  };
  window.addEventListener("keydown", ouvirTeclado);

  proxima();
}

function estrelas(alvo) {
  if (!alvo) return;
  let s = "";
  for (let i = 0; i < 70; i++) {
    const x = Math.random() * 100, y = Math.random() * 100;
    const r = Math.random() * 1.4 + 0.3;
    s += `<circle cx="${x}%" cy="${y}%" r="${r}" fill="#E8E8E4" opacity="${0.15 + Math.random() * 0.5}"/>`;
  }
  alvo.innerHTML = `<svg width="100%" height="100%" aria-hidden="true">${s}</svg>`;
}
