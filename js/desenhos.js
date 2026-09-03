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
<rect x="6" y="300" width="86" height="76" rx="6" fill="#101318"/>
${txt("VIN", 49, 344, 12, "#8A8F98")}
<rect x="232" y="150" width="200" height="132" rx="6" fill="#101318"/>
${txt("GaburINO", 332, 208, 30, "#E8E8E4")}
${txt("UNO", 332, 244, 17, "#8A8F98")}
${ledAlim(470, 330, on)}${txt("ON", 470, 362, 12, "#CFE4EE")}
<circle cx="520" cy="330" r="6" fill="${on ? "#5CE07A" : "#1E3A24"}"/>${txt("L", 520, 362, 12, "#CFE4EE")}
<circle cx="120" cy="70" r="9" fill="#0E4257"/><circle cx="620" cy="380" r="9" fill="#0E4257"/>
${txt("DIGITAL  (~ = PWM)", 470, 66, 13, "#CFE4EE")}
${txt("POWER", 168, 388, 13, "#CFE4EE")}
${txt("ANALOG IN", 372, 388, 13, "#CFE4EE")}`;
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
    matriz += `<circle cx="${168 + (k % 5) * 36}" cy="${132 + Math.floor(k / 5) * 30}" r="7" fill="${on ? "#E24B4A" : "#3A1F1F"}"/>`;
  return `
<path d="M12 0h456a12 12 0 0112 12v320H0V12A12 12 0 0112 0z" fill="#0F5A46" stroke="#073024" stroke-width="3"/>
<path d="M0 332h480v40a12 12 0 01-12 12H12a12 12 0 01-12-12z" fill="#0B4536"/>
${txt("MicroBURA", 240, 72, 26, "#E8E8E4")}
${txt("v2 — logica de 3,3 V", 240, 98, 14, "#9FD8C6")}
${matriz}
<rect x="36" y="150" width="60" height="60" rx="8" fill="#1B1F26"/>${txt("A", 66, 192, 20, "#E8E8E4")}
<rect x="384" y="150" width="60" height="60" rx="8" fill="#1B1F26"/>${txt("B", 414, 192, 20, "#E8E8E4")}
${ledAlim(432, 72, on)}
${txt("so os cinco aneis vem liberados", 240, 320, 12, "#7FC0AC")}`;
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
<rect width="168" height="192" rx="7" fill="#12151C" stroke="#05060A" stroke-width="2"/>
${on ? `<circle cx="84" cy="76" r="62" fill="#F2F2EE" opacity=".22"/>` : ""}
<path d="M44 84a40 40 0 0180 0v26H44z" fill="#F2F2EE" opacity="${on ? 0.95 : 0.55}"/>
<rect x="38" y="106" width="92" height="12" rx="3" fill="#E8E8E4" opacity=".8"/>
<circle cx="66" cy="72" r="9" fill="${on ? "#E24B4A" : "#5A2A2A"}"/>
<circle cx="84" cy="62" r="9" fill="${on ? "#4ED17A" : "#255036"}"/>
<circle cx="102" cy="72" r="9" fill="${on ? "#5B9BE8" : "#243B58"}"/>
${txt("LED RGB", 84, 148, 15, "#F2F2EE")}
${txt("catodo comum", 84, 166, 11, "#8A8F98")}`;
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

function bateria(d, i) {
  return `
<rect x="12" y="0" width="144" height="186" rx="10" fill="#2A2E36" stroke="#101318" stroke-width="3"/>
${txt("9V", 84, 82, 38, "#E9C542")}
${txt("ALCALINA", 84, 116, 14, "#8A8F98")}
<circle cx="48" cy="190" r="14" fill="#B9BEC6"/>
<rect x="106" y="178" width="28" height="22" rx="4" fill="#B9BEC6"/>`;
}

function suporteAA(d, i) {
  let pilhas = "";
  for (let k = 0; k < 4; k++) {
    const y = 14 + k * 36;
    pilhas += `<rect x="20" y="${y}" width="248" height="28" rx="9" fill="#3A3F47" stroke="#101318" stroke-width="2"/>`;
    pilhas += txt("AA", 144, y + 20, 13, "#B9BEC6");
  }
  return `<rect width="312" height="168" rx="7" fill="#1B1F26" stroke="#05060A" stroke-width="2"/>${pilhas}
${txt("6V", 296, 96, 14, "#E24B4A")}
<path d="M240 168v24" stroke="#E24B4A" stroke-width="8" stroke-linecap="round"/>
<path d="M288 168v24" stroke="#2A2E36" stroke-width="8" stroke-linecap="round"/>`;
}

function fontePb(d, i) {
  const on = i.ligado;
  return `
<rect width="288" height="144" rx="7" fill="#134E3A" stroke="#05060A" stroke-width="2"/>
${txt("FONTE DE PROTOBOARD", 144, 52, 15, "#F2F2EE")}
${txt(i.tensaoSaida ? i.tensaoSaida + " V" : "5 V", 144, 84, 20, "#5CE07A")}
<rect x="36" y="96" width="52" height="18" rx="3" fill="#0A0C11"/>
${ledAlim(252, 40, on)}`;
}

/* ---------- despacho ------------------------------------------ */

const MAPA = {
  "placa-gaburino": placaGaburino,
  "placa-bura32": placaBura32,
  "placa-microbura": placaMicrobura,
  expansao, protoboard, modulo, "ponte-h": ponteH,
  axial, radial, disco, to92,
  led, "led-rgb": ledRgb, neopixel, lcd, buzzer,
  botao, potenciometro, ldr, ultrassonico, "ir-obstaculo": irObstaculo,
  servo, motor, bateria, "suporte-aa": suporteAA, "fonte-pb": fontePb,
};

export function desenhar(def, inst) {
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
