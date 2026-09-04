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

  // Chuvisco do tubo: linhas horizontais finas, como TV velha.
  const varredura = Array.from({ length: 22 }, (_, i) =>
    `<rect x="34" y="${44 + i * 5}" width="92" height="1.4" fill="#000" opacity=".2"/>`).join("");

  // Grade do alto-falante do peito.
  const grade = Array.from({ length: 5 }, (_, i) =>
    `<circle cx="${58 + i * 11}" cy="130" r="2.6" fill="var(--vacuo)" opacity=".8"/>`).join("");

  // Ondas da antena, so quando ele esta com algo a dizer.
  const sinal = exp === "alarmado" || exp === "satisfeito"
    ? `<path d="M86 12a10 10 0 0110 0M82 6a18 18 0 0118 0" fill="none" stroke="${e.cor}" stroke-width="2" opacity=".8"/>`
    : "";

  alvoRetrato.innerHTML = `
<svg viewBox="0 0 180 190" role="img" aria-label="Metal GabuTRON, expressao ${exp}">
  <defs>
    <radialGradient id="brilhoTubo" cx="35%" cy="28%" r="75%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity=".14"/>
      <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- antena -->
  <rect x="88" y="14" width="5" height="20" rx="2" fill="var(--grafite)"/>
  <circle cx="90.5" cy="12" r="5" fill="var(--grafite)"/>
  <circle cx="90.5" cy="12" r="2" fill="${e.cor}"/>
  ${sinal}

  <!-- braco esquerdo, articulado -->
  <rect x="16" y="86" width="18" height="9" rx="4" fill="var(--grafite)"/>
  <circle cx="20" cy="90.5" r="6" fill="var(--casco-alto)" stroke="var(--grafite)" stroke-width="3"/>
  <rect x="8" y="88" width="9" height="26" rx="4" fill="var(--grafite)"/>
  <circle cx="12.5" cy="116" r="5.5" fill="var(--casco-alto)" stroke="var(--grafite)" stroke-width="3"/>
  <path d="M12 121l-7 9M12 121l7 9M12 121v11" stroke="var(--grafite)" stroke-width="3.4" stroke-linecap="round"/>

  <!-- braco direito, segurando um ferro de solda -->
  <rect x="146" y="86" width="18" height="9" rx="4" fill="var(--grafite)"/>
  <circle cx="160" cy="90.5" r="6" fill="var(--casco-alto)" stroke="var(--grafite)" stroke-width="3"/>
  <rect x="163" y="88" width="9" height="24" rx="4" fill="var(--grafite)"/>
  <path d="M167 114l-6 8M167 114l6 8" stroke="var(--grafite)" stroke-width="3.4" stroke-linecap="round"/>
  <rect x="164" y="120" width="7" height="20" rx="3" fill="var(--poeira)"/>
  <path d="M167.5 140v9" stroke="#C9CDD3" stroke-width="2.6" stroke-linecap="round"/>
  <circle cx="167.5" cy="151" r="2.6" fill="#E0703C"/>

  <!-- gabinete da TV -->
  <rect x="24" y="30" width="132" height="112" rx="14" fill="var(--casco-alto)" stroke="var(--luz)" stroke-width="4"/>
  <rect x="30" y="36" width="120" height="76" rx="10" fill="var(--linha)"/>

  <!-- tubo -->
  <rect x="34" y="40" width="92" height="68" rx="9" fill="var(--vacuo)" stroke="${e.cor}" stroke-width="2.5"/>
  ${olhosSvg(e.olhos, e.cor)}
  <path d="${e.boca}" fill="none" stroke="${e.cor}" stroke-width="5" stroke-linecap="round"/>
  ${varredura}
  <rect x="34" y="40" width="92" height="68" rx="9" fill="url(#brilhoTubo)"/>

  <!-- botoes e mostrador do lado direito do gabinete -->
  <circle cx="140" cy="52" r="7.5" fill="var(--grafite)" stroke="var(--vacuo)" stroke-width="2"/>
  <path d="M140 46v6" stroke="var(--vacuo)" stroke-width="2.4" stroke-linecap="round"/>
  <circle cx="140" cy="72" r="7.5" fill="var(--grafite)" stroke="var(--vacuo)" stroke-width="2"/>
  <path d="M144 68l-4 4" stroke="var(--vacuo)" stroke-width="2.4" stroke-linecap="round"/>
  <rect x="133" y="86" width="15" height="18" rx="3" fill="var(--vacuo)"/>
  <rect x="136" y="${99 - (exp === "alarmado" ? 11 : 5)}" width="9" height="${exp === "alarmado" ? 11 : 5}" fill="${e.cor}"/>

  <!-- peito: alto-falante, LED de energia e placa de identificacao -->
  <rect x="30" y="118" width="120" height="22" rx="6" fill="var(--linha)"/>
  ${grade}
  <circle cx="44" cy="130" r="3.4" fill="var(--fosforo)"/>
  <rect x="118" y="123" width="26" height="12" rx="2" fill="var(--casco)" stroke="var(--poeira)"/>
  <text x="131" y="132" font-family="monospace" font-size="7" fill="var(--grafite)" text-anchor="middle">GBTRN</text>

  <!-- amassados e ferrugem: ele tem quarenta anos de bancada -->
  <path d="M28 62q-3 8 0 16" fill="none" stroke="var(--poeira)" stroke-width="2" opacity=".7"/>
  <path d="M150 118q4 5 2 10" fill="none" stroke="var(--poeira)" stroke-width="2" opacity=".5"/>
  <circle cx="146" cy="136" r="2" fill="#8A5A2B" opacity=".65"/>
  <circle cx="33" cy="46" r="1.6" fill="#8A5A2B" opacity=".5"/>

  <!-- parafusos do gabinete -->
  <circle cx="31" cy="37" r="2.2" fill="var(--poeira)"/>
  <circle cx="149" cy="37" r="2.2" fill="var(--poeira)"/>
  <circle cx="31" cy="135" r="2.2" fill="var(--poeira)"/>
  <circle cx="149" cy="135" r="2.2" fill="var(--poeira)"/>

  <!-- pes com esteira -->
  <rect x="40" y="142" width="38" height="20" rx="7" fill="var(--grafite)"/>
  <rect x="102" y="142" width="38" height="20" rx="7" fill="var(--grafite)"/>
  <circle cx="50" cy="152" r="4.5" fill="var(--casco)"/><circle cx="68" cy="152" r="4.5" fill="var(--casco)"/>
  <circle cx="112" cy="152" r="4.5" fill="var(--casco)"/><circle cx="130" cy="152" r="4.5" fill="var(--casco)"/>
  <ellipse cx="90" cy="170" rx="62" ry="7" fill="var(--vacuo)" opacity=".45"/>
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
