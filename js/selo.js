/* ============================================================
   SELO — a medalha da missao concluida, em PNG.

   Serve para o aluno colar no caderno, mandar para a familia ou o
   professor recolher como comprovante. E um SVG desenhado na hora e
   convertido em imagem, sem depender de nada externo.
   ============================================================ */

import { patenteDe } from "./config.js";
import { SOM } from "./som.js";

const COR = { novato: "#5CE07A", facil: "#7DD3FC", intermediario: "#E0A73C", hacker: "#E24B4A" };

function svgDoSelo(m, resultado, sessao) {
  const cor = COR[m.dificuldade] || "#5CE07A";
  const data = new Date().toLocaleDateString("pt-BR");
  const estrelas = { novato: 1, facil: 2, intermediario: 3, hacker: 4 }[m.dificuldade] || 1;
  let brilho = "";
  for (let k = 0; k < estrelas; k++) {
    const x = 300 + (k - (estrelas - 1) / 2) * 46;
    brilho += `<path d="M${x} 236l7 15 16 2-12 11 3 16-14-8-14 8 3-16-12-11 16-2z" fill="${cor}"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380">
  <rect width="600" height="380" rx="18" fill="#05060A"/>
  <rect x="14" y="14" width="572" height="352" rx="12" fill="none" stroke="${cor}" stroke-width="3"/>
  <rect x="26" y="26" width="548" height="328" rx="8" fill="none" stroke="#262B33" stroke-width="1.5"/>

  <g transform="translate(46,46) scale(0.62)">
    <rect x="56" y="14" width="8" height="20" fill="#8A8F98"/><circle cx="60" cy="12" r="7" fill="#8A8F98"/>
    <rect x="24" y="30" width="72" height="58" rx="7" fill="#161A21" stroke="#E8E8E4" stroke-width="4"/>
    <rect x="34" y="40" width="52" height="38" rx="3" fill="#05060A" stroke="${cor}" stroke-width="3"/>
    <path d="M44 52q7-9 14 0M67 52q7-9 14 0" fill="none" stroke="${cor}" stroke-width="4" stroke-linecap="round"/>
    <path d="M50 68q10 10 20 0" fill="none" stroke="${cor}" stroke-width="4" stroke-linecap="round"/>
    <rect x="36" y="88" width="16" height="10" rx="2" fill="#8A8F98"/><rect x="68" y="88" width="16" height="10" rx="2" fill="#8A8F98"/>
  </g>

  <text x="146" y="72" font-family="monospace" font-size="15" fill="#8A8F98">OFICINA DO METAL GABUTRON</text>
  <text x="146" y="100" font-family="monospace" font-size="14" fill="${cor}">MISSAO CONCLUIDA</text>

  <text x="300" y="164" font-family="monospace" font-size="26" font-weight="700" fill="#E8E8E4" text-anchor="middle">${esc(m.titulo)}</text>
  <text x="300" y="192" font-family="monospace" font-size="14" fill="#8A8F98" text-anchor="middle">${esc(m.dificuldade)} &#183; ${esc(m.tipo)}${m.placa ? " &#183; " + esc(m.placa) : ""}</text>
  ${brilho}

  <text x="300" y="292" font-family="monospace" font-size="40" font-weight="700" fill="${cor}" text-anchor="middle">${resultado.pontos} pts</text>
  <text x="300" y="316" font-family="monospace" font-size="14" fill="#C9CDD3" text-anchor="middle">${esc(patenteDe(resultado.progresso.pontos))} &#183; ${resultado.progresso.pontos} pontos no total</text>
  <text x="300" y="338" font-family="monospace" font-size="12" fill="#565C66" text-anchor="middle">${sessao.dicasUsadas} dica(s) &#183; ${sessao.queimadas} peca(s) perdida(s) &#183; ${data}</text>
  <text x="300" y="358" font-family="monospace" font-size="11" fill="#3A414D" text-anchor="middle">criado por GABURA</text>
</svg>`;
}

const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");

export async function baixarSelo(m, resultado, sessao) {
  const fonte = svgDoSelo(m, resultado, sessao);
  const img = new Image();
  await new Promise((ok, falha) => {
    img.onload = ok; img.onerror = falha;
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(fonte);
  });
  const tela = document.createElement("canvas");
  tela.width = 1200; tela.height = 760;
  const ctx = tela.getContext("2d");
  ctx.fillStyle = "#05060A";
  ctx.fillRect(0, 0, tela.width, tela.height);
  ctx.drawImage(img, 0, 0, tela.width, tela.height);
  const a = document.createElement("a");
  a.href = tela.toDataURL("image/png");
  a.download = `selo-${m.id}-${new Date().toISOString().slice(0, 10)}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  SOM.selo();
  return true;
}
