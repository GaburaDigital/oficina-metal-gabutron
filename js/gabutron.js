/* ============================================================
   METAL GABUTRON — engenheiro chefe da nave.
   Uma TV de tubo com bracinhos, humor seco e paciencia infinita.
   Este modulo cuida do retrato, das expressoes e do texto que ele
   fala. As falas de conteudo vem de ATIVIDADES/CURIOSIDADES/.
   ============================================================ */

import { ajustes } from "./config.js";
import { falar, calar } from "./voz.js";
import { SOM } from "./som.js";

const EXPRESSOES = {
  neutro:    { olhos: "reto", boca: "M50 74h20", cor: "#5CE07A" },
  satisfeito:{ olhos: "feliz", boca: "M48 70q12 12 24 0", cor: "#5CE07A" },
  alarmado:  { olhos: "arregalado", boca: "M52 70a8 8 0 0016 0", cor: "#E24B4A" },
  pensando:  { olhos: "meio", boca: "M50 74h12", cor: "#7DD3FC" },
  chuvisco:  { olhos: "morto", boca: "M48 74h24", cor: "#8A8F98" },
};

let alvoTexto, alvoRetrato, expressaoAtual = "neutro", textoAtual = "", digitando = null;

export function iniciar(elRetrato, elTexto) {
  alvoRetrato = elRetrato;
  alvoTexto = elTexto;
  desenharRetrato("neutro");
}

/* ---------- retrato ------------------------------------------- */

function olhosSvg(tipo, cor) {
  if (tipo === "feliz") return `<path d="M40 58q7-9 14 0M66 58q7-9 14 0" fill="none" stroke="${cor}" stroke-width="5" stroke-linecap="round"/>`;
  if (tipo === "arregalado") return `<circle cx="47" cy="57" r="9" fill="none" stroke="${cor}" stroke-width="4"/><circle cx="73" cy="57" r="9" fill="none" stroke="${cor}" stroke-width="4"/><circle cx="47" cy="57" r="3" fill="${cor}"/><circle cx="73" cy="57" r="3" fill="${cor}"/>`;
  if (tipo === "meio") return `<rect x="41" y="55" width="13" height="5" fill="${cor}"/><rect x="66" y="55" width="13" height="5" fill="${cor}"/>`;
  if (tipo === "morto") return `<path d="M41 51l12 12M53 51l-12 12M67 51l12 12M79 51l-12 12" stroke="${cor}" stroke-width="4"/>`;
  return `<rect x="41" y="50" width="13" height="14" fill="${cor}"/><rect x="66" y="50" width="13" height="14" fill="${cor}"/>`;
}

function desenharRetrato(exp) {
  if (!alvoRetrato) return;
  const e = EXPRESSOES[exp] || EXPRESSOES.neutro;
  const linhas = Array.from({ length: 14 }, (_, i) => `<rect x="26" y="${34 + i * 6}" width="68" height="1.6" fill="#000" opacity=".22"/>`).join("");
  alvoRetrato.innerHTML = `
<svg viewBox="0 0 160 150" role="img" aria-label="Metal GabuTRON, expressao ${exp}">
  <rect x="74" y="6" width="6" height="16" fill="var(--grafite)"/>
  <circle cx="77" cy="5" r="5" fill="var(--grafite)"/>
  <path d="M22 74 L8 74 L8 96" fill="none" stroke="var(--grafite)" stroke-width="6" stroke-linecap="round"/>
  <path d="M14 96l-8 6M14 96l8 6" stroke="var(--grafite)" stroke-width="5" stroke-linecap="round"/>
  <path d="M118 74 L138 74 L138 96" fill="none" stroke="var(--grafite)" stroke-width="6" stroke-linecap="round"/>
  <path d="M132 96l-8 6M132 96l8 6" stroke="var(--grafite)" stroke-width="5" stroke-linecap="round"/>
  <rect x="18" y="22" width="104" height="86" rx="10" fill="var(--casco-alto)" stroke="var(--luz)" stroke-width="4"/>
  <rect x="26" y="30" width="88" height="62" rx="5" fill="var(--vacuo)" stroke="${e.cor}" stroke-width="3"/>
  ${olhosSvg(e.olhos, e.cor)}
  <path d="${e.boca}" fill="none" stroke="${e.cor}" stroke-width="5" stroke-linecap="round"/>
  ${linhas}
  <circle cx="34" cy="100" r="3" fill="var(--fosforo)"/>
  <rect x="44" y="97" width="52" height="6" rx="2" fill="var(--linha)"/>
  <rect x="34" y="108" width="20" height="12" rx="3" fill="var(--grafite)"/>
  <rect x="86" y="108" width="20" height="12" rx="3" fill="var(--grafite)"/>
</svg>`;
  expressaoAtual = exp;
}

export function expressao(exp) { desenharRetrato(exp); }

/* ---------- fala ---------------------------------------------- */

export function dizer(texto, opcoes = {}) {
  textoAtual = texto;
  if (opcoes.expressao) desenharRetrato(opcoes.expressao);
  clearInterval(digitando);
  if (!alvoTexto) return;

  // A voz NAO dispara sozinha. Ela e sempre um gesto do usuario, pelo
  // botao Falar — a nao ser que ele ligue a leitura automatica nos
  // ajustes. Robo tagarela cansa e atrapalha a sala.
  const podeFalar = opcoes.falar === true || (ajustes.falaAutomatica && opcoes.falar !== false);

  if (!ajustes.digitacao) {
    alvoTexto.textContent = texto;
    if (podeFalar) falar(texto);
    return;
  }

  let i = 0;
  alvoTexto.innerHTML = `<span class="corpo"></span><span class="cursor">_</span>`;
  const corpo = alvoTexto.querySelector(".corpo");
  digitando = setInterval(() => {
    corpo.textContent = texto.slice(0, ++i);
    if (i % 3 === 0) SOM.tecla();
    alvoTexto.scrollTop = alvoTexto.scrollHeight;
    if (i >= texto.length) {
      clearInterval(digitando);
      const c = alvoTexto.querySelector(".cursor");
      if (c) c.remove();
    }
  }, 16);

  if (podeFalar) falar(texto);
}

export function completarTexto() {
  clearInterval(digitando);
  if (alvoTexto) alvoTexto.textContent = textoAtual;
}

export function repetir() {
  calar();
  falar(textoAtual);
}

export function textoNaTela() { return textoAtual; }

/* ---------- repertorio ---------------------------------------- */

export const FALAS = {
  boasVindas: [
    "Bancada aberta, assistente. Sou o Metal GabuTRON, engenheiro chefe desta nave. Meu tubo de imagem tem quarenta anos e nunca queimou. Seus componentes talvez nao tenham a mesma sorte.",
    "Ah, voce chegou. Otimo. Tenho uma gaveta de parafusos, um universo de problemas e agora um assistente.",
    "Ligue o que quiser. So nao ligue um LED direto nos cinco volts. Eu vi coisas.",
  ],
  energiaLigada: "Barramento energizado. Se algo acender, comemore. Se algo cheirar mal, foi voce.",
  energiaDesligada: "Bancada desenergizada. Mao livre para mexer sem levar susto.",
  bancadaVazia: "A bancada esta limpa demais para o meu gosto. Abra uma gaveta e pegue alguma coisa.",
  fioRecusado: "Nao forca. Encaixe errado quebra pino, e pino quebrado nao volta.",
  tudoCerto: "Ficou bom. Nao me olhe assim, isso foi um elogio.",
  semGnd: "Faltou o GND. Corrente e ida e volta: sem retorno ela nao sai de casa.",
};

export function aleatoria(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}
