/* ============================================================
   DESENHOS — corpo dos componentes em SVG.

   Regras desta revisao:
   - As cores sao FISICAS (a cor real da peca) e ficam fixas em
     hexadecimal: resistor bege continua bege no modo claro.
   - O corpo NAO desenha nome de pino. Quem desenha rotulo e a
     bancada, a partir do campo "lado" de cada pino, para que o
     texto nunca caia em cima do proprio pino.
   - O desenho existe para COMUNICAR, nao para ser bonito. Se o
     aluno nao reconhece a peca de longe, o desenho falhou.
   ============================================================ */

import { P, PB, LINHAS_PB } from "./biblioteca.js";
import { ARTE } from "./arte.js";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

const txt = (t, x, y, tam = 14, cor = "#F2F2EE", anc = "middle", peso = 500) =>
  `<text x="${x}" y="${y}" font-family="monospace" font-size="${tam}" font-weight="${peso}" fill="${cor}" text-anchor="${anc}">${esc(t)}</text>`;

const ledAlim = (x, y, on) =>
  (on ? `<circle cx="${x}" cy="${y}" r="13" fill="#FF4D4D" opacity=".3"/>` : "") +
  `<circle cx="${x}" cy="${y}" r="6" fill="${on ? "#FF4D4D" : "#4A1E1E"}"/>`;

const parafuso = (x, y) =>
  `<circle cx="${x}" cy="${y}" r="7" fill="#8A8F98"/><path d="M${x - 4} ${y}h8" stroke="#2A2E36" stroke-width="2"/>`;

/* ---------- placas de controle -------------------------------- */

function placaGaburino(d, i) {
  const on = i.ligado;
  return `
<rect width="672" height="432" rx="14" fill="#1D6C8C" stroke="#0E4257" stroke-width="3"/>
<rect x="6" y="48" width="76" height="86" rx="4" fill="#B9BEC6" stroke="#7C828C" stroke-width="2"/>
${txt("USB", 44, 98, 13, "#31363E")}
<rect x="0" y="288" width="76" height="100" rx="8" fill="#101318" stroke="#05060A" stroke-width="2"/>
<circle cx="38" cy="338" r="22" fill="#05060A"/><circle cx="38" cy="338" r="8" fill="#6C727B"/>
${txt("7-12V", 38, 272, 11, "#CFE4EE")}
<rect x="232" y="150" width="200" height="132" rx="6" fill="#101318"/>
${txt("GaburINO", 332, 208, 30, "#E8E8E4")}
${txt("UNO", 332, 244, 17, "#8A8F98")}
${ledAlim(470, 330, on)}${txt("ON", 470, 362, 12, "#CFE4EE")}
<circle cx="520" cy="330" r="6" fill="${on ? "#5CE07A" : "#1E3A24"}"/>${txt("L", 520, 362, 12, "#CFE4EE")}
<circle cx="120" cy="70" r="9" fill="#0E4257"/><circle cx="620" cy="380" r="9" fill="#0E4257"/>
${txt("DIGITAL  (~ = PWM)", 470, 106, 13, "#CFE4EE")}
${txt("POWER", 168, 330, 13, "#CFE4EE")}
${txt("ANALOG IN", 372, 330, 13, "#CFE4EE")}`;
}

function placaBura32(d, i) {
  const on = i.ligado;
  return `
<rect width="288" height="432" rx="8" fill="#1B1F26" stroke="#0A0C11" stroke-width="3"/>
<rect x="66" y="96" width="156" height="150" rx="4" fill="#3A3F47"/>
${txt("BURA32", 144, 160, 22, "#E8E8E4")}
${txt("WROOM", 144, 188, 14, "#8A8F98")}
${txt("3.3V", 144, 216, 14, "#E0A73C")}
<rect x="96" y="270" width="96" height="42" rx="4" fill="#B9BEC6"/>${txt("USB-C", 144, 298, 13, "#31363E")}
${ledAlim(96, 342, on)}
<rect x="152" y="330" width="46" height="24" rx="3" fill="#0A0C11"/>${txt("EN", 175, 348, 12, "#8A8F98")}
<rect x="204" y="330" width="46" height="24" rx="3" fill="#0A0C11"/>${txt("BOOT", 227, 348, 10, "#8A8F98")}`;
}

function placaMicrobura(d, i) {
  const on = i.ligado;
  let matriz = "";
  for (let k = 0; k < 25; k++)
    matriz += `<circle cx="${168 + (k % 5) * 36}" cy="${228 + Math.floor(k / 5) * 30}" r="7" fill="${on ? "#E24B4A" : "#3A1F1F"}"/>`;
  return `
<path d="M168 60h144v22H168z" fill="#2A2E36"/>
<rect x="168" y="24" width="144" height="40" rx="6" fill="#F2F2EE" stroke="#8A8F98" stroke-width="2"/>
<rect x="180" y="32" width="24" height="24" rx="3" fill="#E24B4A"/>
<rect x="276" y="32" width="24" height="24" rx="3" fill="#2A2E36"/>
${txt("conector de bateria 3V", 240, 14, 12, "#9FD8C6")}
<path d="M12 96h456a12 12 0 0112 12v320H0V108a12 12 0 0112-12z" fill="#0F5A46" stroke="#073024" stroke-width="3"/>
<path d="M0 428h480v40a12 12 0 01-12 12H12a12 12 0 01-12-12z" fill="#0B4536"/>
${txt("MicroBURA", 240, 168, 26, "#E8E8E4")}
${txt("v2 — logica de 3,3 V", 240, 194, 14, "#9FD8C6")}
${matriz}
<rect x="36" y="246" width="60" height="60" rx="8" fill="#1B1F26"/>${txt("A", 66, 288, 20, "#E8E8E4")}
<rect x="384" y="246" width="60" height="60" rx="8" fill="#1B1F26"/>${txt("B", 414, 288, 20, "#E8E8E4")}
${ledAlim(432, 168, on)}
${txt("so os cinco aneis vem liberados", 240, 416, 12, "#7FC0AC")}`;
}

function expansao(d, i) {
  return `
<rect width="480" height="216" rx="8" fill="#2A2E36" stroke="#101318" stroke-width="3"/>
<path d="M96 0h288v34H96z" fill="#0F5A46"/>
${txt("encaixa embaixo da MicroBURA", 240, 24, 12, "#9FD8C6")}
${txt("EXPANSAO DE PINOS", 240, 88, 20, "#E8E8E4")}
${txt("libera P3 a P20 em pinos machos", 240, 116, 13, "#8A8F98")}
<rect x="24" y="132" width="432" height="14" rx="3" fill="#101318"/>`;
}

/* ---------- protoboard ---------------------------------------- */

function protoboard() {
  const { larg, alt, x0 } = PB;
  const L = LINHAS_PB;
  let s = `<rect width="${larg}" height="${alt}" rx="8" fill="#E6E4DC" stroke="#B9B6AC" stroke-width="3"/>`;
  s += `<rect x="0" y="${L.canal - 12}" width="${larg}" height="24" fill="#D5D2C7"/>`;
  s += `<path d="M10 ${L.supMais - 14}h${larg - 20}" stroke="#E24B4A" stroke-width="3"/>`;
  s += `<path d="M10 ${L.supMenos + 14}h${larg - 20}" stroke="#3F5FB0" stroke-width="3"/>`;
  s += `<path d="M10 ${L.infMais - 14}h${larg - 20}" stroke="#E24B4A" stroke-width="3"/>`;
  s += `<path d="M10 ${L.infMenos + 14}h${larg - 20}" stroke="#3F5FB0" stroke-width="3"/>`;
  for (let c = 0; c < PB.colunas; c += 5) {
    const x = x0 + c * P;
    s += txt(String(c + 1), x, L.blocoA - 14, 12, "#8A8780");
    s += txt(String(c + 1), x, L.blocoB + 5 * P + 4, 12, "#8A8780");
  }
  s += txt("400 pontos", larg - 60, L.canal + 5, 12, "#8A8780", "end");
  return s;
}

/* Tiras metalicas internas, usadas pelo modo raio-x */
export function tirasProtoboard() {
  const t = [];
  const L = LINHAS_PB;
  for (let c = 0; c < PB.colunas; c++) {
    const x = PB.x0 + c * P;
    t.push({ x: x - 9, y: L.blocoA - 14, w: 18, h: 4 * P + 28 });
    t.push({ x: x - 9, y: L.blocoB - 14, w: 18, h: 4 * P + 28 });
  }
  [L.supMais, L.supMenos, L.infMais, L.infMenos].forEach((y) =>
    t.push({ x: 14, y: y - 8, w: PB.larg - 28, h: 16, trilho: true }));
  return t;
}

/* ---------- modulo generico ----------------------------------- */

function modulo(d, i) {
  const on = i.ligado;
  return `
<rect width="${d.w}" height="${d.h}" rx="7" fill="${d.cor}" stroke="#05060A" stroke-width="2"/>
<circle cx="18" cy="18" r="7" fill="#0A0C11" opacity=".5"/>
<circle cx="${d.w - 18}" cy="18" r="7" fill="#0A0C11" opacity=".5"/>
${txt(d.nome, d.w / 2, d.h / 2 - 4, 16, "#F2F2EE")}
${d.alimenta !== undefined ? ledAlim(d.w - 34, d.h / 2 + 26, on) : ""}`;
}

/* ---------- ponte H ------------------------------------------- */

function ponteH(d, i) {
  const on = i.ligado;
  return `
<rect width="432" height="336" rx="8" fill="#B23A32" stroke="#6E211B" stroke-width="3"/>
<rect x="24" y="8" width="120" height="34" rx="4" fill="#1B1F26"/>
<rect x="168" y="8" width="120" height="34" rx="4" fill="#1B1F26"/>
<rect x="312" y="8" width="96" height="34" rx="4" fill="#1B1F26"/>
<rect x="150" y="96" width="132" height="120" rx="4" fill="#8A8F98"/>
${Array.from({ length: 6 }, (_, k) => `<rect x="${158 + k * 21}" y="100" width="9" height="112" fill="#6C727B"/>`).join("")}
${txt("dissipador", 216, 240, 12, "#F0C9C5")}
<rect x="40" y="120" width="76" height="76" rx="4" fill="#1B1F26"/>${txt("L298N", 78, 164, 14, "#E8E8E4")}
${txt("PONTE H", 348, 140, 20, "#F2F2EE")}
${ledAlim(348, 180, on)}
<rect x="120" y="290" width="192" height="16" rx="3" fill="#1B1F26"/>
${txt("motor A", 84, 66, 13, "#F0C9C5")}
${txt("motor B", 360, 66, 13, "#F0C9C5")}`;
}

/* ---------- passivos ------------------------------------------ */

function axial(d, i) {
  const diodo = d.id === "diodo";
  const corpo = diodo ? "#2A1B14" : "#D8C79B";
  const x1 = d.pinos[0].x, x2 = d.pinos[1].x, cy = d.pinos[0].y;
  const cx1 = x1 + 20, cx2 = x2 - 20;
  const faixas = diodo
    ? `<rect x="${cx2 - 14}" y="${cy - 22}" width="8" height="44" fill="#E8E8E4"/>`
    : [0, 1, 2, 3].map((k) => `<rect x="${cx1 + 14 + k * 18}" y="${cy - 24}" width="9" height="48" fill="${["#8A5A2B", "#101318", "#E24B4A", "#C9A227"][k]}"/>`).join("");
  return `
<path d="M${x1} ${cy}h${cx1 - x1}M${cx2} ${cy}h${x2 - cx2}" stroke="#B9BEC6" stroke-width="4"/>
<rect x="${cx1}" y="${cy - 26}" width="${cx2 - cx1}" height="52" rx="24" fill="${corpo}"/>
${faixas}
${i.valorAtual ? txt(i.valorAtual, d.w / 2, cy - 38, 18, "#E9C542", "middle", 700) : ""}`;
}

function radial(d, i) {
  return `
<rect x="12" y="8" width="72" height="112" rx="10" fill="#20344F" stroke="#0E1A2B" stroke-width="2"/>
<path d="M60 8v112" stroke="#C9CDD3" stroke-width="14" opacity=".45"/>
${txt("-", 62, 74, 30, "#0E1A2B")}
${txt(i.valorAtual || "100uF", 36, 70, 13, "#CFE4EE")}
<path d="M24 120v24M48 120v24" stroke="#B9BEC6" stroke-width="4"/>`;
}

function disco(d, i) {
  return `
<path d="M36 12a34 30 0 010 60a34 30 0 010-60z" fill="#8A6B2A"/>
${txt(i.valorAtual || "104", 36, 48, 14, "#2A1B08")}
<path d="M24 72v48M48 72v48" stroke="#B9BEC6" stroke-width="4"/>`;
}

function to92(d, i) {
  return `
<path d="M12 8h84v60a42 42 0 01-84 0z" fill="#101318"/>
${txt("BC548", 54, 52, 13, "#B9BEC6")}
<path d="M24 68v52M48 68v52M72 68v52" stroke="#B9BEC6" stroke-width="4"/>`;
}

/* ---------- luzes --------------------------------------------- */

/* LED: as duas pernas tem a MESMA espessura. O que identifica o
   anodo e a perna ser mais comprida e ter uma curva, como no mundo
   real e como o aluno ja viu em outros simuladores. */
function led(d, i) {
  const v = (d.variantes || []).find((x) => x.nome === i.variante) || d.variantes[0];
  const on = i.aceso;
  const b = Math.max(0.2, Math.min(1, i.brilho ?? 1));
  return `
${on ? `<circle cx="48" cy="56" r="${52 + b * 20}" fill="${v.cor}" opacity="${0.1 + b * 0.2}"/>
        <circle cx="48" cy="56" r="${30 + b * 12}" fill="${v.cor}" opacity="${0.2 + b * 0.32}"/>` : ""}
<path d="M20 58a28 28 0 0156 0v34H20z" fill="${v.cor}" opacity="${on ? 0.72 + b * 0.28 : 0.78}"/>
<rect x="14" y="88" width="68" height="12" rx="3" fill="${v.cor}" opacity=".92"/>
<path d="M48 100v22q0 10 -12 12v10" fill="none" stroke="#B9BEC6" stroke-width="4" stroke-linecap="round"/>
<path d="M56 100v44" fill="none" stroke="#B9BEC6" stroke-width="4" stroke-linecap="round"/>
<path d="M36 134v10" stroke="#B9BEC6" stroke-width="4" stroke-linecap="round"/>`;
}

function ledRgb(d, i) {
  const on = i.ligado;
  return `
<rect width="168" height="216" rx="7" fill="#12151C" stroke="#05060A" stroke-width="2"/>
${on ? `<circle cx="84" cy="76" r="62" fill="#F2F2EE" opacity=".22"/>` : ""}
<path d="M44 84a40 40 0 0180 0v26H44z" fill="#F2F2EE" opacity="${on ? 0.95 : 0.55}"/>
<rect x="38" y="106" width="92" height="12" rx="3" fill="#E8E8E4" opacity=".8"/>
<circle cx="66" cy="72" r="9" fill="${on ? "#E24B4A" : "#5A2A2A"}"/>
<circle cx="84" cy="62" r="9" fill="${on ? "#4ED17A" : "#255036"}"/>
<circle cx="102" cy="72" r="9" fill="${on ? "#5B9BE8" : "#243B58"}"/>
${txt("LED RGB", 84, 146, 15, "#F2F2EE")}
${txt("catodo comum", 84, 164, 11, "#8A8F98")}`;
}

function neopixel(d, i) {
  const on = i.ligado;
  const cores = ["#E24B4A", "#5CE07A", "#7DD3FC", "#E9C542"];
  let leds = "";
  for (let k = 0; k < 16; k++) {
    const x = 48 + (k % 4) * 56, y = 48 + Math.floor(k / 4) * 52;
    if (on) leds += `<rect x="${x - 26}" y="${y - 26}" width="52" height="52" rx="6" fill="${cores[k % 4]}" opacity=".22"/>`;
    leds += `<rect x="${x - 19}" y="${y - 19}" width="38" height="38" rx="4" fill="${on ? cores[k % 4] : "#2A2E36"}"/>`;
  }
  return `<rect width="${d.w}" height="${d.h}" rx="7" fill="#12151C" stroke="#05060A" stroke-width="2"/>${leds}
${txt("WS2812B 4x4", d.w / 2, d.h - 34, 14, "#8A8F98")}`;
}

function lcd(d, i) {
  const on = i.ligado;
  return `
<rect width="${d.w}" height="${d.h}" rx="7" fill="#14472F" stroke="#05060A" stroke-width="2"/>
<rect x="36" y="24" width="${d.w - 72}" height="120" rx="4" fill="${on ? "#2FA5D8" : "#123B2A"}"/>
${on ? txt("METAL GABUTRON", d.w / 2, 74, 22, "#062033") + txt("bancada online", d.w / 2, 112, 19, "#062033") : ""}
${txt("LCD 16x2 I2C", 120, 190, 14, "#9FD8C6")}
${ledAlim(d.w - 44, 176, on)}`;
}

/* ---------- som ----------------------------------------------- */

function buzzer(d, i) {
  const on = i.ligado;
  return `
<circle cx="72" cy="66" r="60" fill="#0B0D11" stroke="#2A2E36" stroke-width="3"/>
<circle cx="72" cy="66" r="10" fill="#2A2E36"/>
${txt("+", 46, 118, 18, "#E8E8E4")}
${on ? `<g fill="none" stroke="#5CE07A" stroke-width="3">
  <path d="M136 40a30 30 0 010 52"/><path d="M148 26a48 48 0 010 80"/></g>` : ""}`;
}

/* ---------- entradas ------------------------------------------ */

function botao(d, i) {
  const p = i.pressionado;
  return `
<rect x="12" y="12" width="96" height="96" rx="5" fill="#1B1F26" stroke="#05060A" stroke-width="2"/>
<circle cx="60" cy="60" r="${p ? 22 : 27}" fill="${p ? "#5A2320" : "#8A2C28"}"/>
<path d="M18 18h10M92 18h10M18 102h10M92 102h10" stroke="#B9BEC6" stroke-width="4"/>
${txt("1-3 e 2-4 ja ligados", 60, 116, 10, "#8A8F98")}`;
}

function chave(d, i) {
  const on = i.pressionado;
  return `
<rect x="12" y="12" width="96" height="96" rx="8" fill="#1B1F26" stroke="#05060A" stroke-width="2"/>
<rect x="26" y="26" width="68" height="68" rx="5" fill="#31363E"/>
<path d="M26 ${on ? 26 : 60}h68v34H26z" fill="${on ? "#4ED17A" : "#8A2C28"}" opacity=".85"/>
${txt(on ? "LIGADA" : "DESLIG", 60, 68, 12, "#F2F2EE")}
<path d="M24 108v14M72 108v14" stroke="#B9BEC6" stroke-width="4"/>`;
}

function potenciometro(d, i) {
  const ang = -140 + (i.giro ?? 50) * 2.8;
  return `
<rect x="24" y="60" width="120" height="100" rx="6" fill="#1B1F26"/>
<circle cx="84" cy="62" r="44" fill="#3A3F47"/>
<g transform="rotate(${ang} 84 62)"><rect x="79" y="20" width="10" height="42" fill="#E8E8E4"/></g>
${txt("10k", 84, 140, 14, "#8A8F98")}`;
}

function ldr(d, i) {
  return `
<circle cx="36" cy="60" r="34" fill="#E9DFC0" stroke="#8A6B2A" stroke-width="3"/>
<path d="M14 60q11-16 22 0t22 0" fill="none" stroke="#3A2A10" stroke-width="4"/>
<path d="M24 94v50M48 94v50" stroke="#B9BEC6" stroke-width="4"/>`;
}

function ultrassonico(d, i) {
  const on = i.ligado;
  return `
<rect width="${d.w}" height="${d.h}" rx="7" fill="#1B4E8A" stroke="#05060A" stroke-width="2"/>
<circle cx="84" cy="80" r="56" fill="#8A8F98" stroke="#565C66" stroke-width="4"/>
<circle cx="252" cy="80" r="56" fill="#8A8F98" stroke="#565C66" stroke-width="4"/>
${txt("T", 84, 88, 22, "#31363E")}${txt("R", 252, 88, 22, "#31363E")}
<rect x="150" y="48" width="36" height="64" rx="4" fill="#0A1E33"/>
${txt("HC-SR04", 168, 152, 14, "#CFE4EE")}
${ledAlim(300, 152, on)}`;
}

/* Sensor IR com os dois LEDs de 5 mm bem visiveis: e por eles que
   o aluno reconhece a peca na caixa. */
function irObstaculo(d, i) {
  const on = i.ligado;
  return `
<rect width="${d.w}" height="${d.h}" rx="7" fill="#1B4E8A" stroke="#05060A" stroke-width="2"/>
<g>
  <path d="M40 62a24 24 0 0148 0v24H40z" fill="#2A2E36"/>
  <rect x="36" y="84" width="56" height="10" rx="3" fill="#2A2E36"/>
  ${txt("emissor", 64, 116, 11, "#CFE4EE")}
</g>
<g>
  <path d="M120 62a24 24 0 0148 0v24h-48z" fill="#7DA9E0" opacity="${on ? 1 : 0.6}"/>
  <rect x="116" y="84" width="56" height="10" rx="3" fill="#7DA9E0" opacity="${on ? 1 : 0.6}"/>
  ${txt("receptor", 144, 116, 11, "#CFE4EE")}
</g>
<rect x="188" y="48" width="56" height="40" rx="4" fill="#1B1F26"/>
${txt("ajuste", 216, 108, 11, "#CFE4EE")}
${txt("SENSOR IR", 132, 148, 15, "#F2F2EE")}
${ledAlim(228, 148, on)}`;
}

/* ---------- motores ------------------------------------------- */

function servo(d, i) {
  const on = i.ligado;
  return `
<rect x="24" y="60" width="192" height="132" rx="6" fill="#1E58A8" stroke="#0A2A56" stroke-width="3"/>
<rect x="6" y="92" width="228" height="26" fill="#1E58A8"/>
${parafuso(18, 105)}${parafuso(222, 105)}
<circle cx="84" cy="48" r="30" fill="#C9CDD3"/>
<g transform="rotate(${on ? 35 : 0} 84 48)"><rect x="74" y="4" width="20" height="48" rx="3" fill="#F2F2EE" stroke="#8A8F98" stroke-width="2"/></g>
${txt("SG90", 140, 150, 15, "#CFE4EE")}
<path d="M216 96h48" stroke="#3A3F47" stroke-width="7"/>
<path d="M216 120h48" stroke="#E24B4A" stroke-width="7"/>
<path d="M216 144h48" stroke="#E9C542" stroke-width="7"/>
<rect x="240" y="84" width="30" height="72" rx="4" fill="#2A2E36"/>`;
}

function motor(d, i) {
  const on = i.ligado;
  return `
<rect x="12" y="18" width="192" height="132" rx="66" fill="#9BA1AA" stroke="#565C66" stroke-width="3"/>
<rect x="196" y="66" width="34" height="36" rx="4" fill="#6C727B"/>
<path d="M228 84h48" stroke="#C9CDD3" stroke-width="10"/>
<circle cx="108" cy="84" r="38" fill="#6C727B"/>
<g transform="rotate(${on ? 35 : 0} 108 84)"><path d="M108 50v68M74 84h68" stroke="#D5D9DE" stroke-width="6"/></g>
${txt("MOTOR DC", 108, 142, 14, "#31363E")}
<path d="M170 150q0 42 118 42v-48" fill="none" stroke="#E24B4A" stroke-width="9" stroke-linecap="round"/>
<path d="M186 150q0 58 150 58v-64" fill="none" stroke="#2A2E36" stroke-width="9" stroke-linecap="round"/>
${txt("+", 288, 130, 15, "#E24B4A")}${txt("-", 336, 130, 15, "#8A8F98")}
${on ? `<path d="M256 40a54 54 0 010 88" fill="none" stroke="#5CE07A" stroke-width="3"/>` : ""}`;
}

/* ---------- energia ------------------------------------------- */

function pontaSolta(d, i) {
  return `
<circle cx="24" cy="48" r="20" fill="none" stroke="#C9CDD3" stroke-width="3" stroke-dasharray="5 4"/>
<circle cx="24" cy="48" r="9" fill="#C9CDD3" stroke="#7C828C" stroke-width="2"/>
<path d="M24 48l26 -30" stroke="#8A8F98" stroke-width="4" stroke-linecap="round"/>
${txt("ponta solta", 30, 20, 11, "#8A8F98", "start")}`;
}

function bateria(d, i) {
  return `
<rect x="12" y="0" width="144" height="186" rx="10" fill="#2A2E36" stroke="#101318" stroke-width="3"/>
${txt("9V", 84, 82, 38, "#E9C542")}
${txt("ALCALINA", 84, 116, 14, "#8A8F98")}
<circle cx="48" cy="190" r="14" fill="#B9BEC6"/>
<rect x="106" y="178" width="28" height="22" rx="4" fill="#B9BEC6"/>`;
}

function suporteAA(d, i) {
  const n = i.slots || 4;
  const alt = 36 + n * 40;
  let pilhas = "";
  for (let k = 0; k < n; k++) {
    const y = 16 + k * 40;
    pilhas += `<rect x="20" y="${y}" width="248" height="32" rx="10" fill="#3A3F47" stroke="#101318" stroke-width="2"/>`;
    pilhas += `<rect x="${k % 2 ? 24 : 250}" y="${y + 8}" width="14" height="16" rx="2" fill="#C9A227"/>`;
    pilhas += txt(k % 2 ? "+" : "-", k % 2 ? 44 : 240, y + 22, 14, "#E24B4A");
    pilhas += txt("AA", 144, y + 22, 13, "#B9BEC6");
  }
  return `<rect width="312" height="${alt}" rx="7" fill="#1B1F26" stroke="#05060A" stroke-width="2"/>${pilhas}
${txt((n * 1.5).toFixed(1) + " V", 156, alt - 10, 16, "#E24B4A")}
${txt(n + " pilha" + (n > 1 ? "s" : ""), 60, alt - 10, 12, "#8A8F98")}
<path d="M240 ${alt}v24" stroke="#E24B4A" stroke-width="8" stroke-linecap="round"/>
<path d="M288 ${alt}v24" stroke="#2A2E36" stroke-width="8" stroke-linecap="round"/>`;
}

function fontePb(d, i) {
  const on = i.ligado;
  const v = i.tensaoSaida ?? 5;
  const tres = Math.abs(v - 3.3) < 0.1;
  // A chavinha muda de lado e a tensao aparece grande: sem isso o
  // aluno mexe no ajuste e nao ve nada acontecer.
  return `
<rect width="288" height="168" rx="7" fill="#134E3A" stroke="#05060A" stroke-width="2"/>
${txt("FONTE DE PROTOBOARD", 144, 46, 14, "#F2F2EE")}
<rect x="84" y="60" width="120" height="40" rx="5" fill="#0A0C11"/>
${txt(v.toFixed(1) + " V", 144, 90, 24, "#5CE07A")}
<rect x="96" y="112" width="96" height="26" rx="13" fill="#0A0C11" stroke="#3A3F47" stroke-width="2"/>
<rect x="${tres ? 100 : 148}" y="116" width="40" height="18" rx="9" fill="#5CE07A"/>
${txt("3V3", 112, 152, 11, tres ? "#5CE07A" : "#6C8C7C")}
${txt("5V", 180, 152, 11, tres ? "#6C8C7C" : "#5CE07A")}
${ledAlim(252, 40, on)}`;
}


/* ---------- desenhos das pecas novas ---------------------------- */

function arubag(d, i) {
  const on = i.ligado;
  return `
<rect width="456" height="312" rx="10" fill="#1B6B3A" stroke="#0B3D20" stroke-width="3"/>
<rect x="60" y="30" width="228" height="60" rx="4" fill="#0B3D20"/>
${txt("barra de 40 pinos", 174, 66, 13, "#9FD8C6")}
<rect x="150" y="120" width="150" height="110" rx="6" fill="#101318"/>
${txt("Arubag Pi", 225, 172, 26, "#E8E8E4")}${txt("95x", 225, 202, 16, "#8A8F98")}
<rect x="330" y="120" width="110" height="46" rx="4" fill="#B9BEC6"/>${txt("USB", 385, 150, 14, "#31363E")}
<rect x="330" y="180" width="110" height="46" rx="4" fill="#2A2E36"/>${txt("HDMI", 385, 210, 13, "#B9BEC6")}
<rect x="24" y="132" width="72" height="90" rx="6" fill="#2A2E36"/>${txt("SD", 60, 184, 15, "#B9BEC6")}
${txt("logica de 3,3 V", 225, 258, 13, "#9FD8C6")}
${ledAlim(420, 60, on)}`;
}

function fenolite(d, i) {
  return `
<rect width="456" height="288" rx="6" fill="#C9A227" stroke="#8A6B14" stroke-width="3"/>
<rect x="6" y="6" width="444" height="276" rx="4" fill="#B8912A" opacity=".55"/>
${txt("cada ilha e isolada — so a solda liga", 228, 278, 12, "#5A4408")}`;
}

function falante(d, i) {
  const on = i.ligado;
  return `
<circle cx="132" cy="110" r="104" fill="#3A3F47" stroke="#1B1F26" stroke-width="4"/>
<circle cx="132" cy="110" r="72" fill="#2A2E36"/>
<circle cx="132" cy="110" r="30" fill="#565C66"/>
<circle cx="132" cy="110" r="12" fill="#8A8F98"/>
${[0,90,180,270].map(a=>`<circle cx="${132+Math.round(90*Math.cos(a*Math.PI/180))}" cy="${110+Math.round(90*Math.sin(a*Math.PI/180))}" r="7" fill="#1B1F26"/>`).join("")}
${on ? `<g fill="none" stroke="#5CE07A" stroke-width="3"><path d="M244 70a58 58 0 010 80"/><path d="M258 50a86 86 0 010 120"/></g>` : ""}
${txt("8 &#937;", 132, 210, 14, "#B9BEC6")}`;
}

function arcade(d, i) {
  const p = i.pressionado;
  return `
<circle cx="120" cy="108" r="96" fill="#2A2E36"/>
<circle cx="120" cy="${p ? 112 : 104}" r="84" fill="#B23A32" stroke="#6E211B" stroke-width="4"/>
<circle cx="120" cy="${p ? 112 : 104}" r="66" fill="#D14A40"/>
<path d="M78 ${p ? 86 : 78}a48 48 0 0184 0" fill="#F2F2EE" opacity=".22"/>
${txt("aperte", 120, 214, 13, "#8A8F98")}`;
}

function chave3(d, i) {
  const on = i.pressionado;
  return `
<rect x="24" y="24" width="120" height="96" rx="8" fill="#1B1F26" stroke="#05060A" stroke-width="2"/>
<rect x="40" y="40" width="88" height="52" rx="6" fill="#31363E"/>
<rect x="${on ? 90 : 46}" y="46" width="38" height="40" rx="5" fill="#C9CDD3"/>
${txt(on ? "posicao 2" : "posicao 1", 84, 112, 12, "#8A8F98")}`;
}

function keypad(d, i) {
  const teclas = ["1","2","3","A","4","5","6","B","7","8","9","C","*","0","#","D"];
  let g = "";
  for (let k = 0; k < 16; k++) {
    const x = 60 + (k % 4) * 72, y = 60 + Math.floor(k / 4) * 60;
    g += `<rect x="${x - 30}" y="${y - 24}" width="60" height="48" rx="6" fill="#31363E" stroke="#0A0C11"/>`;
    g += txt(teclas[k], x, y + 7, 18, "#E8E8E4");
  }
  return `<rect width="${d.w}" height="${d.h}" rx="7" fill="#1B1F26" stroke="#05060A" stroke-width="2"/>${g}`;
}

function pir(d, i) {
  const on = i.ligado;
  return `
<rect width="${d.w}" height="${d.h}" rx="7" fill="#1B4E8A" stroke="#05060A" stroke-width="2"/>
<path d="M${d.w / 2 - 78} 128a78 78 0 01156 0z" fill="#F2F2EE" opacity=".92"/>
<path d="M${d.w / 2 - 78} 128a78 78 0 01156 0" fill="none" stroke="#B9BEC6" stroke-width="3"/>
${[-52,-26,0,26,52].map(o=>`<path d="M${d.w/2+o} 128v-${Math.round(70-Math.abs(o)*0.55)}" stroke="#C9CDD3" stroke-width="2"/>`).join("")}
${txt("PIR", d.w / 2, 168, 15, "#CFE4EE")}
${ledAlim(d.w - 40, 168, on)}`;
}

function bomba(d, i) {
  const on = i.ligado;
  return `
<rect x="48" y="72" width="144" height="132" rx="14" fill="#1B4E8A" stroke="#0A2A56" stroke-width="3"/>
<rect x="96" y="12" width="48" height="66" rx="8" fill="#2A6BB0"/>
<path d="M120 12v-6" stroke="#8A8F98" stroke-width="6"/>
<circle cx="120" cy="138" r="42" fill="#2A6BB0"/>
<g transform="rotate(${on ? 40 : 0} 120 138)"><path d="M120 108v60M90 138h60" stroke="#CFE4EE" stroke-width="6"/></g>
${on ? `<path d="M120 6q-14 -22 0 -34" fill="none" stroke="#7DD3FC" stroke-width="4"/>` : ""}
${txt("submersa", 120, 196, 13, "#CFE4EE")}`;
}

function solar(d, i) {
  let celulas = "";
  for (let k = 0; k < 12; k++) {
    const x = 24 + (k % 4) * 72, y = 24 + Math.floor(k / 4) * 54;
    celulas += `<rect x="${x}" y="${y}" width="66" height="48" rx="3" fill="#16304F" stroke="#0B1C30" stroke-width="2"/>`;
    celulas += `<path d="M${x + 33} ${y}v48" stroke="#2E5B8F" stroke-width="2"/>`;
  }
  return `<rect width="${d.w}" height="${d.h}" rx="7" fill="#20344F" stroke="#0B1C30" stroke-width="3"/>${celulas}
${txt("celula solar", 168, 210, 14, "#9FC4E8")}`;
}

function pendrive(d, i) {
  return `
<rect x="72" y="30" width="168" height="84" rx="10" fill="#3A3F47" stroke="#1B1F26" stroke-width="3"/>
<rect x="6" y="48" width="72" height="48" rx="4" fill="#B9BEC6" stroke="#7C828C" stroke-width="2"/>
${txt("PEN DRIVE", 156, 78, 15, "#C9CDD3")}`;
}

function caixaSom(d, i) {
  return `
<rect x="24" y="24" width="288" height="192" rx="20" fill="#1B1F26" stroke="#05060A" stroke-width="3"/>
<circle cx="120" cy="120" r="60" fill="#2A2E36" stroke="#3A3F47" stroke-width="3"/>
<circle cx="120" cy="120" r="22" fill="#565C66"/>
<circle cx="228" cy="120" r="36" fill="#2A2E36" stroke="#3A3F47" stroke-width="3"/>
${txt("bluetooth", 168, 200, 14, "#7DD3FC")}`;
}

function clipe(d, i) {
  return `
<path d="M24 48h108a24 24 0 010 0" fill="none" stroke="#B9BEC6" stroke-width="7" stroke-linecap="round"/>
<path d="M40 34h92a14 14 0 010 28H52a14 14 0 010-28h74" fill="none" stroke="#C9CDD3" stroke-width="7" stroke-linecap="round"/>
${txt("clipe", 84, 88, 12, "#8A8F98")}`;
}


/* ---------- pecas separadas e instrumentos --------------------- */

function motorPasso(d, i) {
  const on = i.ligado;
  return `
<circle cx="144" cy="120" r="96" fill="#B9BEC6" stroke="#7C828C" stroke-width="4"/>
<circle cx="144" cy="120" r="70" fill="#9BA1AA"/>
<circle cx="144" cy="120" r="28" fill="#6C727B"/>
<g transform="rotate(${on ? 30 : 0} 144 120)"><rect x="136" y="46" width="16" height="74" rx="4" fill="#D5D9DE"/></g>
<rect x="30" y="216" width="228" height="34" rx="6" fill="#2A2E36"/>
${txt("28BYJ-48", 144, 240, 14, "#B9BEC6")}
<path d="M48 250v14" stroke="#E24B4A" stroke-width="7" stroke-linecap="round"/>
<path d="M96 250v14" stroke="#5B9BE8" stroke-width="7" stroke-linecap="round"/>
<path d="M144 250v14" stroke="#E2A0C0" stroke-width="7" stroke-linecap="round"/>
<path d="M192 250v14" stroke="#E9C542" stroke-width="7" stroke-linecap="round"/>
<path d="M240 250v14" stroke="#E08A3C" stroke-width="7" stroke-linecap="round"/>
${on ? `<path d="M252 66a68 68 0 010 108" fill="none" stroke="#5CE07A" stroke-width="3"/>` : ""}`;
}

function sonda(d, i) {
  return `
<rect x="30" y="12" width="108" height="60" rx="6" fill="#1B1F26" stroke="#05060A" stroke-width="2"/>
${txt("SONDA", 84, 50, 14, "#C9CDD3")}
<rect x="42" y="72" width="30" height="190" rx="4" fill="#C9A227" stroke="#8A6B14" stroke-width="2"/>
<rect x="96" y="72" width="30" height="190" rx="4" fill="#C9A227" stroke="#8A6B14" stroke-width="2"/>
<path d="M42 262l15 22 15-22M96 262l15 22 15-22" fill="#C9A227"/>
${txt("solo", 84, 286, 12, "#8A6B2A")}`;
}

function expansaoServo(d, i) {
  const on = i.ligado;
  let fileira = "";
  for (let k = 0; k < 16; k++) {
    const x = 48 + k * 24;
    fileira += `<rect x="${x - 10}" y="156" width="20" height="72" rx="3" fill="#0B3D2E"/>`;
    fileira += txt(String(k), x, 250, 11, "#9FD8C6");
  }
  return `
<rect width="${d.w}" height="${d.h}" rx="7" fill="#134E3A" stroke="#05060A" stroke-width="2"/>
${fileira}
${txt("EXPANSAO 16 SERVOS", 240, 60, 18, "#F2F2EE")}
${txt("V+ externo alimenta os servos, nunca a placa", 240, 84, 12, "#9FD8C6")}
${txt("G / V / sinal em cada canal", 240, 108, 12, "#7FC0AC")}
${ledAlim(440, 60, on)}`;
}

function suporteLitio(d, i) {
  const n = i.slots || 1;
  const alt = 40 + n * 52;
  let cel = "";
  for (let k = 0; k < n; k++) {
    const y = 18 + k * 52;
    cel += `<rect x="24" y="${y}" width="252" height="42" rx="10" fill="#134E3A" stroke="#0A2A20" stroke-width="2"/>`;
    cel += `<rect x="${k % 2 ? 28 : 258}" y="${y + 11}" width="14" height="20" rx="2" fill="#C9A227"/>`;
    cel += txt("18650", 150, y + 28, 14, "#9FD8C6");
    cel += txt(k % 2 ? "+" : "-", k % 2 ? 50 : 248, y + 29, 14, "#E24B4A");
  }
  return `<rect width="${d.w}" height="${alt}" rx="7" fill="#1B1F26" stroke="#05060A" stroke-width="2"/>${cel}
${txt((n * 3.7).toFixed(1) + " V", 150, alt - 10, 16, "#E24B4A")}
${txt(n + " celula" + (n > 1 ? "s" : ""), 56, alt - 10, 12, "#8A8F98")}`;
}

function fonteBancada(d, i) {
  const v = (i.tensao ?? 5).toFixed(1);
  const a = (i.limite ?? 2).toFixed(2);
  return `
<rect width="${d.w}" height="${d.h}" rx="10" fill="#2A2E36" stroke="#101318" stroke-width="3"/>
<rect x="24" y="24" width="192" height="60" rx="5" fill="#0F1A12"/>
${txt(v + " V", 120, 68, 30, "#7CFF9B")}
<rect x="24" y="96" width="192" height="48" rx="5" fill="#1A0F0F"/>
${txt(a + " A", 120, 132, 24, "#FF9B7C")}
<circle cx="288" cy="60" r="34" fill="#3A3F47" stroke="#1B1F26" stroke-width="3"/>
<path d="M288 30v24" stroke="#E8E8E4" stroke-width="4"/>
<circle cx="288" cy="140" r="26" fill="#3A3F47" stroke="#1B1F26" stroke-width="3"/>
<path d="M288 118v18" stroke="#E8E8E4" stroke-width="4"/>
${txt("TENSAO", 288, 104, 11, "#8A8F98")}
${txt("CORRENTE", 288, 178, 11, "#8A8F98")}
${txt("FONTE DE BANCADA", 168, 210, 15, "#C9CDD3")}`;
}

function joystick(d, i) {
  const dx = ((i.eixoX ?? 50) - 50) * 0.9;
  const dy = ((i.eixoY ?? 50) - 50) * 0.9;
  const ap = i.pressionado;
  return `
<rect width="${d.w}" height="${d.h}" rx="7" fill="#1B1F26" stroke="#05060A" stroke-width="2"/>
<circle cx="144" cy="108" r="80" fill="#101318" stroke="#3A3F47" stroke-width="4"/>
<circle cx="${144 + dx}" cy="${108 + dy}" r="${ap ? 46 : 52}" fill="${ap ? "#5A2320" : "#8A2C28"}" stroke="#4A1614" stroke-width="4"/>
<circle cx="${144 + dx}" cy="${108 + dy}" r="${ap ? 30 : 34}" fill="#A33832"/>
${txt("arraste e clique", 144, 236, 12, "#8A8F98")}
${txt(`X ${Math.round(i.eixoX ?? 50)}  Y ${Math.round(i.eixoY ?? 50)}`, 144, 214, 13, "#7DD3FC")}`;
}

function encoder(d, i) {
  const passo = i.passo || 0;
  return `
<rect width="${d.w}" height="${d.h}" rx="7" fill="#1B1F26" stroke="#05060A" stroke-width="2"/>
<circle cx="132" cy="84" r="56" fill="#3A3F47" stroke="#101318" stroke-width="3"/>
${Array.from({ length: 20 }, (_, k) => {
    const ang = (k * 18 + passo * 6) * Math.PI / 180;
    return `<rect x="${132 + Math.cos(ang) * 46 - 3}" y="${84 + Math.sin(ang) * 46 - 3}" width="6" height="6" fill="#1B1F26"/>`;
  }).join("")}
<circle cx="132" cy="84" r="22" fill="#565C66"/>
${txt("gire arrastando", 132, 160, 12, "#8A8F98")}
${txt("passo " + passo, 132, 180, 13, "#7DD3FC")}`;
}

function dfplayer(d, i) {
  const on = i.ligado;
  return `
<rect width="${d.w}" height="${d.h}" rx="7" fill="#1B1F26" stroke="#05060A" stroke-width="2"/>
<rect x="96" y="24" width="144" height="96" rx="6" fill="#0A0C11" stroke="#3A3F47" stroke-width="3"/>
${txt("cartao SD", 168, 78, 13, "#7C828C")}
${i.temCartao ? `<rect x="104" y="30" width="128" height="84" rx="4" fill="#1B4E8A"/>${txt("SD", 168, 80, 20, "#CFE4EE")}` : ""}
${txt("DFPlayer Mini", 168, 168, 16, "#F2F2EE")}
${txt("MP3", 168, 194, 13, "#8A8F98")}
${ledAlim(300, 168, on)}`;
}

function multimetroPeca(d, i) {
  const leitura = i.leitura || "---";
  return `
<rect width="${d.w}" height="${d.h}" rx="18" fill="#E0703C" stroke="#8A421C" stroke-width="4"/>
<rect x="24" y="24" width="288" height="108" rx="8" fill="#0F1A12" stroke="#0A0C11" stroke-width="3"/>
${txt(leitura, 168, 96, 34, "#7CFF9B")}
<circle cx="168" cy="264" r="86" fill="#2A2E36" stroke="#1B1F26" stroke-width="4"/>
<circle cx="168" cy="264" r="30" fill="#3A3F47"/>
<g transform="rotate(${{ continuidade: -60, tensao: 20, resistencia: 100, corrente: 170 }[i.modo] ?? -60} 168 264)">
  <rect x="160" y="186" width="16" height="80" rx="5" fill="#E8E8E4"/></g>
${txt("((&#183;))", 96, 200, 15, "#2A1608")}
${txt("V&#8212;", 240, 200, 15, "#2A1608")}
${txt("&#937;", 254, 300, 17, "#2A1608")}
${txt("mA", 92, 320, 14, "#2A1608")}
${txt("MULTIMETRO", 168, 388, 16, "#4A2410")}
<circle cx="96" cy="432" r="16" fill="#1B1F26" stroke="#0A0C11" stroke-width="3"/>
<circle cx="216" cy="432" r="16" fill="#8A2C28" stroke="#4A1614" stroke-width="3"/>`;
}

function miniteclado(d, i) {
  let teclas = "";
  for (let l = 0; l < 4; l++)
    for (let c = 0; c < 10; c++)
      teclas += `<rect x="${30 + c * 34}" y="${42 + l * 32}" width="28" height="26" rx="4" fill="#31363E" stroke="#0A0C11"/>`;
  return `
<rect width="${d.w}" height="${d.h}" rx="12" fill="#1B1F26" stroke="#05060A" stroke-width="3"/>
${teclas}
${txt("mini teclado bluetooth", 216, 194, 13, "#7DD3FC")}
<circle cx="396" cy="30" r="7" fill="#7DD3FC"/>`;
}

function moeda(d, i) {
  return `
<circle cx="60" cy="60" r="44" fill="#C9A227" stroke="#8A6B14" stroke-width="4"/>
<circle cx="60" cy="60" r="34" fill="#D8B63C"/>
${txt("1", 60, 70, 26, "#6E5410")}
<path d="M24 60h-8M96 60h8" stroke="#B9BEC6" stroke-width="4"/>`;
}

function borracha(d, i) {
  return `
<rect x="12" y="18" width="144" height="60" rx="8" fill="#E0A7B0" stroke="#B07C86" stroke-width="3"/>
<rect x="12" y="18" width="60" height="60" rx="8" fill="#D18B98"/>
${txt("nao conduz", 84, 92, 11, "#8A8F98")}`;
}

function cartaoMidia(d, i) {
  return `
<path d="M24 12h96l24 24v168H24z" fill="#1B4E8A" stroke="#0A2A56" stroke-width="3"/>
<rect x="40" y="30" width="52" height="46" rx="3" fill="#0A1E33"/>
${txt("SD", 84, 130, 26, "#CFE4EE")}
${txt("16 GB", 84, 160, 13, "#9FC4E8")}`;
}


function piezo(d, i) {
  return `
<circle cx="108" cy="108" r="90" fill="#C9A227" stroke="#8A6B14" stroke-width="4"/>
<circle cx="108" cy="108" r="62" fill="#D5D9DE"/>
<circle cx="108" cy="108" r="30" fill="#C9A227"/>
${txt("PIEZO", 108, 114, 15, "#6E5410")}
<path d="M72 198v18" stroke="#E24B4A" stroke-width="7" stroke-linecap="round"/>
<path d="M120 198v18" stroke="#2A2E36" stroke-width="7" stroke-linecap="round"/>`;
}

function lampada(d, i) {
  const on = i.ligado;
  return `
${on ? `<circle cx="120" cy="108" r="126" fill="#E9C542" opacity=".22"/><circle cx="120" cy="108" r="96" fill="#E9C542" opacity=".3"/>` : ""}
<circle cx="120" cy="108" r="84" fill="${on ? "#F5E08A" : "#3A3F47"}" stroke="#8A8F98" stroke-width="4"/>
<path d="M96 132v-24a24 24 0 0148 0v24" fill="none" stroke="${on ? "#FFFFFF" : "#6C727B"}" stroke-width="5"/>
<rect x="84" y="186" width="72" height="54" rx="6" fill="#8A8F98"/>
${Array.from({ length: 4 }, (_, k) => `<path d="M84 ${196 + k * 12}h72" stroke="#6C727B" stroke-width="3"/>`).join("")}
${txt("12V", 120, 228, 14, "#2A2E36")}
<path d="M72 240v24M168 240v24" stroke="#B9BEC6" stroke-width="6" stroke-linecap="round"/>`;
}

function lcd7(d, i) {
  const on = i.ligado;
  return `
<rect width="600" height="432" rx="12" fill="#1B1F26" stroke="#05060A" stroke-width="4"/>
<rect x="24" y="24" width="552" height="336" rx="6" fill="${on ? "#12324A" : "#0A0C11"}"/>
${on ? txt("ARUBAG PI &#183; deck de engenharia", 300, 168, 30, "#7DD3FC") + txt("1024 x 600", 300, 216, 20, "#4E7FA8") : txt("sem sinal", 300, 200, 22, "#3A414D")}
${txt("LCD 7\" HDMI", 300, 392, 15, "#8A8F98")}`;
}

function caboHdmi(d, i) {
  return `
<rect x="12" y="48" width="84" height="48" rx="5" fill="#2A2E36" stroke="#101318" stroke-width="3"/>
<rect x="240" y="48" width="84" height="48" rx="5" fill="#2A2E36" stroke="#101318" stroke-width="3"/>
<path d="M96 72h144" stroke="#1B1F26" stroke-width="18" stroke-linecap="round"/>
<path d="M96 72h144" stroke="#3A3F47" stroke-width="10" stroke-linecap="round"/>
${txt("HDMI", 168, 116, 13, "#8A8F98")}`;
}

function isd1820(d, i) {
  const on = i.ligado;
  return `
<rect width="${d.w}" height="${d.h}" rx="7" fill="#B23A32" stroke="#05060A" stroke-width="2"/>
<rect x="240" y="120" width="72" height="40" rx="6" fill="#1B1F26"/>
${txt("MIC", 276, 146, 13, "#C9CDD3")}
${txt("ISD1820", 108, 146, 16, "#F2F2EE")}
${ledAlim(300, 36, on)}`;
}

/* ---------- despacho ------------------------------------------ */

const MAPA = {
  "placa-gaburino": placaGaburino,
  "placa-bura32": placaBura32,
  "placa-microbura": placaMicrobura,
  expansao, protoboard, modulo, "ponte-h": ponteH,
  axial, radial, disco, to92,
  led, "led-rgb": ledRgb, neopixel, lcd, buzzer,
  botao, chave, potenciometro, ldr, ultrassonico, "ir-obstaculo": irObstaculo,
  servo, motor, bateria, "suporte-aa": suporteAA, "fonte-pb": fontePb, "ponta-solta": pontaSolta,
  arubag, fenolite, falante, arcade, chave3, keypad, pir, bomba, solar,
  "motor-passo": motorPasso, sonda, "expansao-servo": expansaoServo,
  "suporte-litio": suporteLitio, "fonte-bancada": fonteBancada,
  joystick, encoder, dfplayer, moeda, borracha, "cartao-midia": cartaoMidia,
  "multimetro-peca": multimetroPeca, piezo, lampada, lcd7, "cabo-hdmi": caboHdmi, isd1820, miniteclado,
  pendrive, "caixa-som": caixaSom, clipe,
};

/* O desenho exportado e estatico, mas duas coisas dele precisam
   acompanhar a peca: a cor da variante (LED de outra cor) e o valor
   escrito no corpo (resistor de 10k). Trocamos direto no texto do SVG,
   e assim o rotulo continua sendo UM so, dentro do desenho. */
function ajustarArte(def, i, svg) {
  let saida = svg;

  if (def.variantes && i.variante) {
    const base = def.variantes[0];
    const escolhida = def.variantes.find((v) => v.nome === i.variante);
    if (escolhida && escolhida.cor !== base.cor)
      saida = saida.split(base.cor).join(escolhida.cor);
  }

  if (def.valores && i.valorAtual && i.valorAtual !== def.valores[0]) {
    const antigo = def.valores[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    saida = saida.replace(new RegExp(">\\s*" + antigo + "\\s*<"), ">" + i.valorAtual + "<");
  }

  return saida;
}

/* Camada viva: o que muda quando a bancada e energizada.
   O corpo da peca vem pronto do assistente de desenho, mas brilho,
   luz de ligado, tela acesa, onda de som e motor girando precisam
   reagir. Por isso eles continuam sendo desenhados aqui por cima. */
/* Eixo animado. Cada motor gira de um jeito, e a animacao roda no
   proprio SVG: nao precisa de laco em JavaScript e nao trava a bancada.
   O aluno ve o servo varrer, o DC girar rapido e o passo dar passos. */
function eixoVivo(m, on) {
  const { x, y, estilo } = m;
  const r = m.r || 26;
  const eixo = `<circle cx="${x}" cy="${y}" r="${r * 0.28}" fill="#6C727B"/>`;

  const girar = (dur, corpo) => on
    ? `<g>${corpo}<animateTransform attributeName="transform" type="rotate"
        from="0 ${x} ${y}" to="360 ${x} ${y}" dur="${dur}s" repeatCount="indefinite"/></g>`
    : `<g>${corpo}</g>`;

  // Braco de servo: uma pa so no de 180 graus, duas no de giro
  // continuo. E o formato que vem na sacolinha do servo de verdade.
  const pa = (ang) => {
    const L = r * 1.35, la = r * 0.3;
    return `<g transform="rotate(${ang} ${x} ${y})">
      <path d="M${x - la / 2} ${y}
               L${x - la * 0.34} ${y - L + la * 0.6}
               A${la * 0.34} ${la * 0.34} 0 0 1 ${x + la * 0.34} ${y - L + la * 0.6}
               L${x + la / 2} ${y} Z"
        fill="#F2F2EE" stroke="#8A8F98" stroke-width="1.6"/>
      <circle cx="${x}" cy="${y - L + la * 0.6}" r="${la * 0.2}" fill="#8A8F98"/>
    </g>`;
  };
  const cubo = `<circle cx="${x}" cy="${y}" r="${r * 0.42}" fill="#E8E8E4" stroke="#8A8F98" stroke-width="2"/>`;

  if (estilo === "servo") {
    const braco = cubo + pa(0);
    return (on
      ? `<g>${braco}<animateTransform attributeName="transform" type="rotate"
          values="-85 ${x} ${y}; 85 ${x} ${y}; -85 ${x} ${y}" dur="2.6s"
          calcMode="spline" keyTimes="0;0.5;1" keySplines="0.4 0 0.2 1;0.4 0 0.2 1" repeatCount="indefinite"/></g>`
      : `<g transform="rotate(-85 ${x} ${y})">${braco}</g>`) + eixo;
  }
  if (estilo === "servo360")
    return girar(1.4, cubo + pa(0) + pa(180)) + eixo;
  if (estilo === "dc")
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="#6C727B"/>` +
      girar(0.35, `<path d="M${x} ${y - r} L${x} ${y + r} M${x - r} ${y} L${x + r} ${y}" stroke="#D5D9DE" stroke-width="5"/>`) + eixo;
  if (estilo === "helice")
    return girar(0.22, `<ellipse cx="${x}" cy="${y}" rx="${r * 1.6}" ry="${r * 0.28}" fill="#B9BEC6" opacity=".85"/>
      <ellipse cx="${x}" cy="${y}" rx="${r * 0.28}" ry="${r * 1.6}" fill="#B9BEC6" opacity=".85"/>`) + eixo;
  if (estilo === "passo") {
    const dentes = Array.from({ length: 12 }, (_, k) => {
      const a = (k * 30 * Math.PI) / 180;
      return `<rect x="${x + Math.cos(a) * r * 0.78 - 3}" y="${y + Math.sin(a) * r * 0.78 - 3}" width="6" height="6" fill="#3A3F47"/>`;
    }).join("");
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="#9BA1AA"/>` +
      (on ? `<g>${dentes}<animateTransform attributeName="transform" type="rotate"
        values="0 ${x} ${y}; 30 ${x} ${y}; 30 ${x} ${y}; 60 ${x} ${y}" dur="1.2s" repeatCount="indefinite"/></g>` : `<g>${dentes}</g>`) + eixo;
  }
  if (estilo === "rotor")
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="#2A6BB0"/>` +
      girar(0.5, `<path d="M${x} ${y - r * 0.8} L${x} ${y + r * 0.8} M${x - r * 0.8} ${y} L${x + r * 0.8} ${y}" stroke="#CFE4EE" stroke-width="6"/>`) + eixo;
  if (estilo === "vibra")
    return on
      ? `<g><circle cx="${x}" cy="${y}" r="${r * 0.7}" fill="#8A8F98"/>
         <animateTransform attributeName="transform" type="translate"
           values="0 0; 3 -2; -3 2; 0 0" dur="0.12s" repeatCount="indefinite"/></g>`
      : `<circle cx="${x}" cy="${y}" r="${r * 0.7}" fill="#8A8F98"/>`;
  return "";
}

/* Painel de ajuste desenhado POR CIMA do desenho da peca. Ele existe
   porque o corpo vem estatico do assistente: sem esta camada, trocar a
   tensao ou o numero de pilhas nao mudava nada na tela. */
function painelAjuste(def, i, m) {
  const x = m.x, y = m.y;
  let s = "";

  if (def.slots) {
    const n = i.slots ?? def.slots.padrao;
    const v = (n * def.slots.porSlot).toFixed(1);
    const larg = Math.min(def.w - 24, n * 26 + 14);
    s += `<rect x="${x - larg / 2}" y="${y - 34}" width="${larg}" height="26" rx="5" fill="#05060A" opacity=".8"/>`;
    for (let k = 0; k < n; k++) {
      const px = x - larg / 2 + 12 + k * 26;
      s += `<rect x="${px - 8}" y="${y - 29}" width="16" height="16" rx="3" fill="#3A3F47" stroke="#8A8F98" stroke-width="1.2"/>
            <rect x="${px + 8}" y="${y - 25}" width="3" height="8" fill="#C9A227"/>`;
    }
    s += txt(`${n} ${def.slots.rotulo} — ${v} V`, x, y + 6, 15, "#E24B4A", "middle", 700);
    return s;
  }

  if (def.ajustavel) {
    const v = i.tensaoSaida ?? def.ajustavel[def.ajustavel.length - 1];
    const larg = def.ajustavel.length * 44 + 12;
    s += `<rect x="${x - larg / 2}" y="${y - 34}" width="${larg}" height="24" rx="12" fill="#05060A" stroke="#3A3F47" stroke-width="1.5"/>`;
    def.ajustavel.forEach((opcao, k) => {
      const px = x - larg / 2 + 28 + k * 44;
      const on = Math.abs(opcao - v) < 0.1;
      if (on) s += `<rect x="${px - 20}" y="${y - 31}" width="40" height="18" rx="9" fill="#5CE07A"/>`;
      s += txt(opcao + "V", px, y - 18, 11, on ? "#062033" : "#6C8C7C");
    });
    s += txt(v.toFixed(1) + " V", x, y + 6, 16, "#5CE07A", "middle", 700);
    return s;
  }

  if (def.faixaTensao) {
    const v = i.tensao ?? def.faixaTensao.padrao;
    const a = i.limite ?? (def.faixaCorrente ? def.faixaCorrente.padrao : 1);
    s += txt(`${v.toFixed(1)} V  ${a.toFixed(2)} A`, x, y + 4, 16, "#7CFF9B", "middle", 700);
    return s;
  }
  return s;
}

function camadaViva(def, inst, arte) {
  const i = inst || {};
  let s = "";

  // Marcadores: o desenho revisado manda em cada TIPO que ele define,
  // e a biblioteca preenche os tipos que ele nao trouxe. Antes a lista
  // do desenho substituia tudo, e ajustar a peca deixava de aparecer.
  const doDesenho = arte.marcadores || [];
  const tiposDoDesenho = new Set(doDesenho.map((m) => m.tipo));
  const marcas = [
    ...doDesenho,
    ...(def.marcadores || []).filter((m) => !tiposDoDesenho.has(m.tipo)),
  ];
  for (const m of marcas) {
    if (m.tipo === "luz") {
      if (m.forte) {
        s += i.ligado
          ? `<circle cx="${m.x}" cy="${m.y}" r="26" fill="${m.cor || "#E24B4A"}" opacity=".4"/>
             <circle cx="${m.x}" cy="${m.y}" r="9" fill="${m.cor || "#E24B4A"}"/>`
          : `<circle cx="${m.x}" cy="${m.y}" r="7" fill="#4A1E1E"/>`;
      } else s += ledAlim(m.x, m.y, i.ligado);
    } else if (m.tipo === "eixo") s += eixoVivo(m, i.ligado);
    else if (m.tipo === "som" && i.ligado)
      s += `<g fill="none" stroke="#5CE07A" stroke-width="3">
        <path d="M${m.x} ${m.y - 16}a22 22 0 010 32"/><path d="M${m.x + 10} ${m.y - 26}a34 34 0 010 52"/></g>`;
    else if (m.tipo === "vibra") s += eixoVivo({ ...m, estilo: "vibra" }, i.ligado);
    else if (m.tipo === "ajuste") s += painelAjuste(def, i, m);
  }

  // Botao e chave: o desenho exportado e estatico, entao o efeito de
  // apertar entra por cima. Sem isso a peca parece travada.
  if (def.zonaAcao && (def.pressionavel || def.chaveavel)) {
    const z = def.zonaAcao;
    if (i.pressionado)
      s += `<circle cx="${z.x}" cy="${z.y + 4}" r="${z.r * 0.82}" fill="#05060A" opacity=".38"/>
            <circle cx="${z.x}" cy="${z.y + 4}" r="${z.r * 0.62}" fill="#05060A" opacity=".3"/>`;
    else
      s += `<circle cx="${z.x}" cy="${z.y}" r="${z.r * 0.86}" fill="#FFFFFF" opacity=".07"/>`;
  }

  // Manche do joystick: a bola e desenhada aqui para poder se mexer.
  if (def.manche) {
    const z = def.zonaAcao;
    const dx = ((i.eixoX ?? 50) - 50) * (z.r / 60);
    const dy = ((i.eixoY ?? 50) - 50) * (z.r / 60);
    const r = i.pressionado ? z.r * 0.56 : z.r * 0.64;
    s += `<circle cx="${z.x + dx}" cy="${z.y + dy}" r="${r}" fill="${i.pressionado ? "#5A2320" : "#8A2C28"}" stroke="#4A1614" stroke-width="4"/>
          <circle cx="${z.x + dx}" cy="${z.y + dy}" r="${r * 0.62}" fill="#A33832"/>`;
    s += txt(`X ${Math.round(i.eixoX ?? 50)}  Y ${Math.round(i.eixoY ?? 50)}`, def.w / 2, def.h - 44, 13, "#7DD3FC");
  }

  // Encoder: o disco entalhado gira conforme o passo.
  if (def.passos) {
    const z = def.zonaAcao;
    const passo = i.passo || 0;
    s += `<circle cx="${z.x}" cy="${z.y}" r="${z.r * 0.86}" fill="#3A3F47" stroke="#101318" stroke-width="3"/>`;
    for (let k = 0; k < 20; k++) {
      const ang = ((k * 18 + passo * 6) * Math.PI) / 180;
      s += `<rect x="${z.x + Math.cos(ang) * z.r * 0.7 - 3}" y="${z.y + Math.sin(ang) * z.r * 0.7 - 3}" width="6" height="6" fill="#1B1F26"/>`;
    }
    s += `<circle cx="${z.x}" cy="${z.y}" r="${z.r * 0.36}" fill="#565C66"/>`;
    s += txt("passo " + passo, def.w / 2, def.h - 44, 13, "#7DD3FC");
  }

  // Trimpot: o parafusinho azul que quase todo modulo tem. Quando a
  // bancada esta ligada, mostramos o que ele esta ajustando — sem isso
  // o aluno gira sem saber para que serve.
  if (def.trimpot) {
    const t = def.trimpot;
    const giro = i.trimpot ?? 50;
    const ang = -140 + giro * 2.8;
    s += `<rect x="${t.x - t.r}" y="${t.y - t.r}" width="${t.r * 2}" height="${t.r * 2}" rx="4" fill="#1B4E8A" stroke="#0A2A56" stroke-width="2"/>
      <circle cx="${t.x}" cy="${t.y}" r="${t.r * 0.66}" fill="#C9CDD3"/>
      <g transform="rotate(${ang} ${t.x} ${t.y})"><rect x="${t.x - 2.5}" y="${t.y - t.r * 0.62}" width="5" height="${t.r * 0.9}" fill="#2A2E36"/></g>`;
    if (i.ligado) {
      const rot = t.tipo === "tensao"
        ? `${(1.2 + (giro / 100) * 10.8).toFixed(1)} V`
        : `${t.rotulo} ${Math.round(giro)}%`;
      s += txt(rot, t.x, t.y + t.r + 20, 12, "#5CE07A");
      if (t.tipo === "alcance")
        s += `<path d="M${def.w / 2} ${def.h * 0.12}a${20 + giro} ${20 + giro} 0 010 ${def.h * 0.4}"
              fill="none" stroke="#5CE07A" stroke-width="2" stroke-dasharray="6 5" opacity=".7"/>`;
    }
  }

  // Botoes fisicos da peca: RESET, EN, BOOT, A, B, REC...
  for (const b of def.botoes || []) {
    const ap = (i.apertados || []).includes(b.id);
    s += `<circle cx="${b.x}" cy="${b.y + (ap ? 3 : 0)}" r="${b.r}" fill="${ap ? "#5A2320" : "#8A2C28"}" stroke="#4A1614" stroke-width="3"/>
      <circle cx="${b.x}" cy="${b.y + (ap ? 3 : 0)}" r="${b.r * 0.6}" fill="${ap ? "#6E2A26" : "#A33832"}"/>`;
    s += txt(b.n, b.x, b.y + b.r + 16, 11, "#C9CDD3");
  }

  // Teclado: as teclas ficam clicaveis, mantendo a aparencia.
  if (def.teclado) {
    const k = def.teclado;
    const ap = i.apertados || [];
    k.teclas.forEach((tec, idx) => {
      const x = k.x0 + (idx % k.colunas) * k.dx, y = k.y0 + Math.floor(idx / k.colunas) * k.dy;
      const on = ap.includes("t" + idx);
      s += `<rect x="${x - 30}" y="${y - 24}" width="60" height="48" rx="6"
        fill="${on ? "#5CE07A" : "none"}" opacity="${on ? 0.35 : 0}" pointer-events="none"/>`;
    });
  }

  // Ponte H com os jumpers de ENA e ENB colocados.
  if (def.jumperEnable && i.jumperEnable) {
    for (const pid of def.jumperEnable.pinos) {
      const p = def.pinos.find((x) => x.id === pid);
      if (!p) continue;
      s += `<rect x="${p.x - 11}" y="${p.y - 22}" width="22" height="30" rx="4" fill="#E9C542" stroke="#8A6B14" stroke-width="2"/>`;
      s += txt("J", p.x, p.y - 4, 12, "#4A3A08");
    }
    s += txt("ENA e ENB com jumper", def.w / 2, def.h - 6, 12, "#E9C542");
  }

  // Slot de midia: sem a marca, ninguem descobre onde encaixa.
  // Cada slot tem tipo proprio: pen drive nao entra em HDMI. E ele so
  // fica azul enquanto REALMENTE tem alguma coisa dentro.
  for (const e of def.encaixes || (def.encaixe ? [def.encaixe] : [])) {
    const ocupados = i.ocupados || {};
    const cheio = !!ocupados[e.tipo];
    s += `<rect x="${e.x - 46}" y="${e.y - 26}" width="92" height="52" rx="5"
            fill="${cheio ? "#1B4E8A" : "#0A0C11"}" stroke="${cheio ? "#5CE07A" : "#565C66"}" stroke-width="2"
            stroke-dasharray="${cheio ? "0" : "7 5"}"/>`;
    s += txt(cheio ? "encaixado" : e.rotulo, e.x, e.y + 44, 11, cheio ? "#5CE07A" : "#8A8F98");
  }

  // Pontas de cabo: cada uma encaixa sozinha, e a orientacao importa.
  for (const pt of def.pontasEncaixe || []) {
    const ligada = (i.pontasLigadas || []).includes(pt.id);
    s += `<rect x="${pt.x - 30}" y="${pt.y - 26}" width="60" height="52" rx="5"
            fill="none" stroke="${ligada ? "#5CE07A" : "#565C66"}" stroke-width="2"
            stroke-dasharray="${ligada ? "0" : "6 5"}"/>`;
    s += txt(ligada ? "ligada" : pt.rotulo, pt.x, pt.y + 42, 10, ligada ? "#5CE07A" : "#8A8F98");
  }

  if (def.arte === "led" && i.aceso) {
    const v = (def.variantes || []).find((x) => x.nome === i.variante) || def.variantes[0];
    const b = Math.max(0.2, Math.min(1, i.brilho ?? 1));
    const cx = def.w / 2, cy = def.h * 0.34;
    s = `<circle cx="${cx}" cy="${cy}" r="${34 + b * 26}" fill="${v.cor}" opacity="${0.1 + b * 0.2}"/>
         <circle cx="${cx}" cy="${cy}" r="${20 + b * 14}" fill="${v.cor}" opacity="${0.18 + b * 0.3}"/>` + s;
  }

  // LED RGB: a cupula assume a cor dos canais que estao acionados.
  if (def.id === "ledrgb") {
    const c = i.canais || {};
    const ligados = ["r", "g", "b"].filter((k) => c[k]);
    if (ligados.length) {
      const cor = { r: "#E24B4A", g: "#4ED17A", b: "#5B9BE8", rg: "#E9C542", rb: "#C77DFF", gb: "#5CE0D8", rgb: "#F2F2EE" }[ligados.join("")] || "#F2F2EE";
      const cx = def.w / 2, cy = def.h * 0.35, raio = def.w * 0.3;
      s += `<circle cx="${cx}" cy="${cy}" r="${raio * 1.7}" fill="${cor}" opacity=".22"/>
            <circle cx="${cx}" cy="${cy}" r="${raio}" fill="${cor}" opacity=".85"/>`;
      s += txt(ligados.join("").toUpperCase(), cx, def.h - 10, 12, cor);
    }
  }

  // Neopixel: os dezesseis quadradinhos acendem, cada um na sua cor.
  if (def.id === "neopixel" && i.ligado) {
    const cores = ["#E24B4A", "#5CE07A", "#7DD3FC", "#E9C542"];
    const passo = (def.w - 96) / 3;
    for (let k = 0; k < 16; k++) {
      const x = 48 + (k % 4) * passo, y = 48 + Math.floor(k / 4) * passo, c = cores[(k + Math.floor(k / 4)) % 4];
      s += `<rect x="${x - passo * 0.34}" y="${y - passo * 0.34}" width="${passo * 0.68}" height="${passo * 0.68}" rx="4" fill="${c}" opacity=".9"/>
            <rect x="${x - passo * 0.46}" y="${y - passo * 0.46}" width="${passo * 0.92}" height="${passo * 0.92}" rx="6" fill="${c}" opacity=".22"/>`;
    }
  }

  if (def.tela && i.ligado)
    s += `<rect x="${def.w * 0.09}" y="${def.h * 0.1}" width="${def.w * 0.82}" height="${def.h * 0.5}" rx="4" fill="#2FA5D8" opacity=".5"/>` +
         txt("METAL GABUTRON", def.w / 2, def.h * 0.3, 16, "#062033") +
         txt("bancada online", def.w / 2, def.h * 0.44, 13, "#062033");

  if (def.apito && i.ligado)
    s += `<g fill="none" stroke="#5CE07A" stroke-width="3">
      <path d="M${def.w - 26} ${def.h * 0.25}a30 30 0 010 ${def.h * 0.3}"/>
      <path d="M${def.w - 14} ${def.h * 0.16}a48 48 0 010 ${def.h * 0.48}"/></g>`;

  if (def.correnteTipica >= 200 && i.ligado && /motor|servo|bomba/.test(def.id))
    s += `<path d="M${def.w - 30} ${def.h * 0.2}a${def.h * 0.3} ${def.h * 0.3} 0 010 ${def.h * 0.6}"
          fill="none" stroke="#5CE07A" stroke-width="3"/>`;

  return s;
}

export function desenhar(def, inst) {
  // Desenho revisado no assistente tem prioridade sobre o do codigo.
  const arte = ARTE[def.id];
  if (arte) return ajustarArte(def, inst || {}, arte.svg) + camadaViva(def, inst, arte);
  const f = MAPA[def.arte] || modulo;
  return f(def, inst || {});
}

/* Miniatura da paleta: o mesmo desenho encaixado numa caixa fixa. */
export function miniatura(def, larg = 52, alt = 40) {
  const corpo = desenhar(def, { variante: def.variantes && def.variantes[0].nome, valorAtual: def.valores && def.valores[0] });
  const k = Math.min(larg / def.w, alt / def.h);
  return `<svg viewBox="0 0 ${larg} ${alt}" width="${larg}" height="${alt}" aria-hidden="true">
<g transform="translate(${(larg - def.w * k) / 2} ${(alt - def.h * k) / 2}) scale(${k})">${corpo}</g></svg>`;
}
