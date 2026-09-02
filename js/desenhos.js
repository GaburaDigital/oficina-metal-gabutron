/* ============================================================
   DESENHOS — corpo dos componentes em SVG.
   As cores aqui sao FISICAS (a cor real da peca) e por isso ficam
   fixas em hexadecimal: um resistor bege continua bege no modo claro.
   Os pinos nao sao desenhados aqui; quem desenha e a bancada, a partir
   da lista de pinos, para que a pinagem seja sempre coerente.
   ============================================================ */

import { P, PB } from "./biblioteca.js";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

const rot = (t, x, y, tam = 11, cor = "#F2F2EE", anc = "middle", peso = 500) =>
  `<text x="${x}" y="${y}" font-family="monospace" font-size="${tam}" font-weight="${peso}" fill="${cor}" text-anchor="${anc}">${esc(t)}</text>`;

/* LED indicador de alimentacao presente em quase todo modulo */
const ledAlim = (x, y, on) =>
  `<circle cx="${x}" cy="${y}" r="4" fill="${on ? "#FF4D4D" : "#4A1E1E"}"/>` +
  (on ? `<circle cx="${x}" cy="${y}" r="9" fill="#FF4D4D" opacity=".28"/>` : "");

const parafuso = (x, y) =>
  `<circle cx="${x}" cy="${y}" r="5" fill="#8A8F98"/><path d="M${x - 3} ${y}h6" stroke="#2A2E36" stroke-width="1.5"/>`;

/* ---------- placas -------------------------------------------- */

function placaGaburino(d, i) {
  const on = i.ligado;
  return `
<rect width="440" height="340" rx="10" fill="#1D6C8C" stroke="#0E4257" stroke-width="2"/>
<rect x="4" y="30" width="52" height="60" rx="3" fill="#B9BEC6" stroke="#7C828C"/>
${rot("USB", 30, 66, 10, "#31363E")}
<rect x="4" y="230" width="60" height="56" rx="4" fill="#101318"/>
${rot("PWR", 34, 264, 9, "#8A8F98")}
<rect x="150" y="120" width="130" height="90" rx="4" fill="#101318"/>
${rot("GaburINO", 215, 158, 20, "#E8E8E4")}
${rot("UNO R3", 215, 182, 12, "#8A8F98")}
${ledAlim(300, 240, on)}${rot("ON", 300, 262, 9, "#CFE4EE")}
<circle cx="330" cy="240" r="4" fill="${on ? "#5CE07A" : "#1E3A24"}"/>${rot("L13", 330, 262, 9, "#CFE4EE")}
<circle cx="70" cy="40" r="6" fill="#0E4257"/><circle cx="410" cy="300" r="6" fill="#0E4257"/>
${rot("DIGITAL (PWM ~)", 300, 46, 10, "#CFE4EE")}
${rot("POWER", 110, 312, 10, "#CFE4EE")}
${rot("ANALOG IN", 256, 312, 10, "#CFE4EE")}`;
}

function placaBura32(d, i) {
  const on = i.ligado;
  return `
<rect width="180" height="300" rx="6" fill="#1B1F26" stroke="#0A0C11" stroke-width="2"/>
<rect x="34" y="18" width="112" height="120" rx="3" fill="#3A3F47"/>
${rot("BURA32", 90, 70, 16, "#E8E8E4")}
${rot("WROOM", 90, 90, 11, "#8A8F98")}
<rect x="52" y="150" width="76" height="34" rx="3" fill="#B9BEC6"/>${rot("USB-C", 90, 172, 10, "#31363E")}
${ledAlim(60, 202, on)}${rot("PWR", 60, 220, 9, "#8A8F98")}
<rect x="104" y="196" width="30" height="14" rx="2" fill="#0A0C11"/>${rot("EN", 119, 207, 9, "#8A8F98")}
${rot("3.3V logic", 90, 246, 10, "#E0A73C")}`;
}

function placaMicrobura(d, i) {
  const on = i.ligado;
  return `
<path d="M8 0h304a8 8 0 018 8v190H0V8a8 8 0 018-8z" fill="#0F5A46" stroke="#073024" stroke-width="2"/>
<path d="M0 198h320v40a10 10 0 01-10 10H10a10 10 0 01-10-10z" fill="#0F5A46"/>
${rot("MicroBURA", 160, 60, 20, "#E8E8E4")}
${rot("v2", 160, 80, 12, "#9FD8C6")}
<g fill="${on ? "#E24B4A" : "#3A1F1F"}">
${Array.from({ length: 25 }, (_, k) => `<circle cx="${120 + (k % 5) * 20}" cy="${100 + Math.floor(k / 5) * 16}" r="4"/>`).join("")}
</g>
<rect x="20" y="110" width="40" height="40" rx="6" fill="#1B1F26"/>${rot("A", 40, 136, 14, "#E8E8E4")}
<rect x="260" y="110" width="40" height="40" rx="6" fill="#1B1F26"/>${rot("B", 280, 136, 14, "#E8E8E4")}
${ledAlim(300, 62, on)}`;
}

/* ---------- protoboard ---------------------------------------- */

function protoboard() {
  const larg = PB.larg, alt = PB.alt;
  let s = `<rect width="${larg}" height="${alt}" rx="6" fill="#E6E4DC" stroke="#B9B6AC" stroke-width="2"/>`;
  s += `<rect x="0" y="140" width="${larg}" height="20" fill="#D8D5CB"/>`;
  s += `<path d="M6 14h${larg - 12}" stroke="#E24B4A" stroke-width="2"/><path d="M6 42h${larg - 12}" stroke="#3F5FB0" stroke-width="2"/>`;
  s += `<path d="M6 254h${larg - 12}" stroke="#E24B4A" stroke-width="2"/><path d="M6 282h${larg - 12}" stroke="#3F5FB0" stroke-width="2"/>`;
  for (let c = 0; c < PB.colunas; c += 5) {
    const x = PB.x0 + c * P;
    s += rot(String(c + 1), x, 62, 8, "#8A8780");
    s += rot(String(c + 1), x, 250, 8, "#8A8780");
  }
  s += rot("400 pontos", larg - 40, 152, 9, "#8A8780", "end");
  return s;
}

/* Tiras metalicas internas, usadas pelo modo raio-x */
export function tirasProtoboard() {
  const t = [];
  for (let c = 0; c < PB.colunas; c++) {
    const x = PB.x0 + c * P;
    t.push({ x: x - 6, y: 62, w: 12, h: 74 });
    t.push({ x: x - 6, y: 158, w: 12, h: 74 });
  }
  [14, 42, 254, 282].forEach((y) => t.push({ x: 10, y: y - 5, w: PB.larg - 20, h: 10, trilho: true }));
  return t;
}

/* ---------- modulo generico (a maioria das placas pequenas) ---- */

function modulo(d, i) {
  const on = i.ligado;
  return `
<rect width="${d.w}" height="${d.h}" rx="5" fill="${d.cor}" stroke="#05060A" stroke-width="1.5"/>
<circle cx="12" cy="12" r="5" fill="#0A0C11" opacity=".5"/>
<circle cx="${d.w - 12}" cy="12" r="5" fill="#0A0C11" opacity=".5"/>
${rot(d.nome, d.w / 2, d.h / 2 - 2, 13, "#F2F2EE")}
${d.alimenta !== undefined ? ledAlim(d.w - 22, d.h / 2 + 18, on) : ""}
${i.valorAtual ? rot(i.valorAtual, d.w / 2, d.h / 2 + 18, 12, "#5CE07A") : ""}`;
}

/* ---------- passivos ------------------------------------------ */

function axial(d, i) {
  const faixas = d.id === "diodo"
    ? `<rect x="${d.w - 26}" y="6" width="6" height="${d.h - 12}" fill="#E8E8E4"/>`
    : `<rect x="34" y="4" width="7" height="${d.h - 8}" fill="#8A5A2B"/>
       <rect x="47" y="4" width="7" height="${d.h - 8}" fill="#101318"/>
       <rect x="60" y="4" width="7" height="${d.h - 8}" fill="#E24B4A"/>
       <rect x="76" y="4" width="6" height="${d.h - 8}" fill="#C9A227"/>`;
  const corpo = d.id === "diodo" ? "#2A1B14" : "#D8C79B";
  return `
<path d="M2 ${d.h / 2}h20M${d.w - 22} ${d.h / 2}h20" stroke="#B9BEC6" stroke-width="3"/>
<rect x="20" y="2" width="${d.w - 40}" height="${d.h - 4}" rx="${d.h / 2}" fill="${corpo}"/>
${faixas}
${i.valorAtual ? rot(i.valorAtual, d.w / 2, -6, 12, "#5CE07A") : ""}`;
}

function radial(d, i) {
  return `
<rect x="6" y="0" width="${d.w - 12}" height="${d.h - 16}" rx="8" fill="#20344F" stroke="#0E1A2B"/>
<path d="M${d.w / 2} 0v${d.h - 16}" stroke="#B9BEC6" stroke-width="6" opacity=".5"/>
${rot("-", 46, 40, 20, "#E8E8E4")}
${rot(i.valorAtual || "100uF", d.w / 2 - 8, 24, 10, "#CFE4EE")}
<path d="M22 ${d.h - 16}v10M48 ${d.h - 16}v10" stroke="#B9BEC6" stroke-width="3"/>`;
}

function disco(d, i) {
  return `
<path d="M30 4a26 22 0 010 44a26 22 0 010-44z" fill="#8A6B2A"/>
${rot(i.valorAtual || "104", 30, 32, 11, "#2A1B08")}
<path d="M18 46v22M42 46v22" stroke="#B9BEC6" stroke-width="3"/>`;
}

function to92(d, i) {
  return `
<path d="M8 4h54v44a27 27 0 01-54 0z" fill="#101318"/>
${rot("BC548", 35, 30, 10, "#B9BEC6")}
<path d="M16 48v34M35 48v34M54 48v34" stroke="#B9BEC6" stroke-width="3"/>`;
}

/* ---------- luzes --------------------------------------------- */

function led(d, i) {
  const v = (d.variantes || []).find((x) => x.nome === i.variante) || d.variantes[0];
  const on = i.aceso;
  const b = Math.max(0.2, Math.min(1, i.brilho ?? 1));
  return `
${on ? `<circle cx="30" cy="32" r="${28 + b * 12}" fill="${v.cor}" opacity="${0.14 + b * 0.24}"/><circle cx="30" cy="32" r="${16 + b * 8}" fill="${v.cor}" opacity="${0.25 + b * 0.35}"/>` : ""}
<path d="M12 34a18 18 0 0136 0v22H12z" fill="${v.cor}" opacity="${on ? 0.7 + b * 0.3 : 0.75}"/>
<rect x="8" y="52" width="44" height="8" rx="2" fill="${v.cor}" opacity=".9"/>
<path d="M22 60v24M40 60v24" stroke="#B9BEC6" stroke-width="3"/>
<path d="M18 60v18" stroke="#B9BEC6" stroke-width="3"/>
${rot("A", 22, 78, 9, "#8A8F98")}${rot("K", 44, 78, 9, "#8A8F98")}`;
}

function neopixel(d, i) {
  const on = i.ligado;
  const cores = ["#E24B4A", "#5CE07A", "#7DD3FC", "#E9C542"];
  let leds = "";
  for (let k = 0; k < 16; k++) {
    const x = 30 + (k % 4) * 40, y = 26 + Math.floor(k / 4) * 40;
    leds += `<rect x="${x - 13}" y="${y - 13}" width="26" height="26" rx="3" fill="${on ? cores[k % 4] : "#2A2E36"}"/>`;
    if (on) leds += `<rect x="${x - 18}" y="${y - 18}" width="36" height="36" rx="4" fill="${cores[k % 4]}" opacity=".25"/>`;
  }
  return `<rect width="${d.w}" height="${d.h}" rx="5" fill="#12151C" stroke="#05060A"/>${leds}${rot("WS2812B 4x4", d.w / 2, d.h - 16, 10, "#8A8F98")}`;
}

function lcd(d, i) {
  const on = i.ligado;
  return `
<rect width="${d.w}" height="${d.h}" rx="5" fill="#14472F" stroke="#05060A"/>
<rect x="24" y="18" width="${d.w - 48}" height="94" rx="3" fill="${on ? "#2FA5D8" : "#123B2A"}"/>
${on ? rot("METAL GABUTRON", d.w / 2, 56, 16, "#062033") + rot("bancada online", d.w / 2, 84, 14, "#062033") : ""}
${rot("LCD 16x2 I2C", 90, 148, 11, "#9FD8C6")}
${ledAlim(d.w - 30, 130, on)}`;
}

/* ---------- som ----------------------------------------------- */

function buzzer(d, i) {
  const on = i.ligado;
  const ondas = on
    ? `<g fill="none" stroke="#5CE07A" stroke-width="2">
       <path d="M76 30a20 20 0 010 30"/><path d="M84 22a32 32 0 010 46"/></g>`
    : "";
  return `
<circle cx="45" cy="45" r="42" fill="#0B0D11" stroke="#2A2E36" stroke-width="2"/>
<circle cx="45" cy="45" r="7" fill="#2A2E36"/>
${rot("+", 30, 88, 12, "#E8E8E4")}
${ondas}`;
}

/* ---------- entradas ------------------------------------------ */

function botao(d, i) {
  const p = i.pressionado;
  return `
<rect x="8" y="8" width="64" height="64" rx="3" fill="#1B1F26" stroke="#05060A"/>
<circle cx="40" cy="40" r="${p ? 16 : 19}" fill="${p ? "#5A2320" : "#8A2C28"}"/>
<path d="M14 14h6M60 14h6M14 66h6M60 66h6" stroke="#B9BEC6" stroke-width="3"/>`;
}

function potenciometro(d, i) {
  const ang = -140 + (i.giro ?? 50) * 2.8;
  return `
<rect x="14" y="30" width="82" height="70" rx="4" fill="#1B1F26"/>
<circle cx="55" cy="34" r="30" fill="#3A3F47"/>
<g transform="rotate(${ang} 55 34)"><rect x="52" y="6" width="6" height="26" fill="#E8E8E4"/></g>
${rot("10k", 55, 92, 11, "#8A8F98")}
<path d="M22 100v18M55 100v18M88 100v18" stroke="#B9BEC6" stroke-width="3"/>`;
}

function ldr(d, i) {
  return `
<circle cx="30" cy="32" r="26" fill="#E9DFC0" stroke="#8A6B2A" stroke-width="2"/>
<path d="M14 32q8-12 16 0t16 0" fill="none" stroke="#3A2A10" stroke-width="3"/>
<path d="M20 58v26M40 58v26" stroke="#B9BEC6" stroke-width="3"/>`;
}

function ultrassonico(d, i) {
  const on = i.ligado;
  return `
<rect width="${d.w}" height="${d.h}" rx="5" fill="#1B4E8A" stroke="#05060A"/>
<circle cx="62" cy="52" r="40" fill="#8A8F98" stroke="#565C66" stroke-width="3"/>
<circle cx="198" cy="52" r="40" fill="#8A8F98" stroke="#565C66" stroke-width="3"/>
${rot("T", 62, 58, 16, "#31363E")}${rot("R", 198, 58, 16, "#31363E")}
<rect x="112" y="30" width="36" height="44" rx="3" fill="#0A1E33"/>
${rot("HC-SR04", 130, 100, 10, "#CFE4EE")}
${ledAlim(226, 100, on)}`;
}

/* ---------- motores ------------------------------------------- */

function servo(d, i) {
  const on = i.ligado;
  return `
<rect x="10" y="30" width="120" height="90" rx="4" fill="#1E58A8" stroke="#0A2A56" stroke-width="2"/>
<rect x="0" y="52" width="140" height="16" fill="#1E58A8"/>
${parafuso(8, 60)}${parafuso(132, 60)}
<circle cx="48" cy="24" r="22" fill="#E8E8E4"/>
<g transform="rotate(${on ? 35 : 0} 48 24)"><rect x="44" y="0" width="8" height="26" rx="3" fill="#F2F2EE"/><rect x="30" y="-6" width="36" height="10" rx="4" fill="#F2F2EE"/></g>
${rot("SG90", 90, 92, 11, "#CFE4EE")}
<path d="M130 60h30M130 76h30M130 92h30" stroke="#2A2E36" stroke-width="6"/>
<path d="M130 60h30" stroke="#3A3F47" stroke-width="4"/>
<path d="M130 76h30" stroke="#E24B4A" stroke-width="4"/>
<path d="M130 92h30" stroke="#E9C542" stroke-width="4"/>`;
}

function motor(d, i) {
  const on = i.ligado;
  return `
<rect x="6" y="10" width="130" height="90" rx="44" fill="#8A8F98" stroke="#565C66" stroke-width="2"/>
<rect x="118" y="34" width="20" height="42" rx="4" fill="#565C66"/>
<path d="M136 55h34" stroke="#B9BEC6" stroke-width="7"/>
<circle cx="70" cy="55" r="26" fill="#565C66"/>
<g transform="rotate(${on ? 30 : 0} 70 55)"><path d="M70 33v44M48 55h44" stroke="#B9BEC6" stroke-width="4"/></g>
${on ? `<path d="M150 24a26 26 0 010 62" fill="none" stroke="#5CE07A" stroke-width="2"/>` : ""}
<path d="M136 42h50" stroke="#E24B4A" stroke-width="4"/>
<path d="M136 70h50" stroke="#2A2E36" stroke-width="4"/>`;
}

/* ---------- baterias ------------------------------------------ */

function bateria(d, i) {
  return `
<rect x="8" y="0" width="94" height="132" rx="8" fill="#2A2E36" stroke="#101318" stroke-width="2"/>
${rot("9V", 55, 56, 26, "#E9C542")}
${rot("ALCALINA", 55, 82, 11, "#8A8F98")}
<circle cx="34" cy="138" r="10" fill="#B9BEC6"/><rect x="66" y="130" width="20" height="16" rx="3" fill="#B9BEC6"/>`;
}

function suporteAA(d, i) {
  let pilhas = "";
  for (let k = 0; k < 4; k++) {
    const y = 8 + k * 26;
    pilhas += `<rect x="14" y="${y}" width="180" height="20" rx="6" fill="#3A3F47" stroke="#101318"/>`;
    pilhas += rot("AA", 104, y + 15, 10, "#B9BEC6");
  }
  return `<rect width="220" height="120" rx="5" fill="#1B1F26" stroke="#05060A"/>${pilhas}
${rot("6V", 208, 24, 11, "#E24B4A")}`;
}

/* ---------- despacho ------------------------------------------ */

const MAPA = {
  "placa-gaburino": placaGaburino,
  "placa-bura32": placaBura32,
  "placa-microbura": placaMicrobura,
  protoboard,
  modulo, axial, radial, disco, to92,
  led, neopixel, lcd, buzzer, botao, potenciometro, ldr, ultrassonico,
  servo, motor, bateria, "suporte-aa": suporteAA,
};

export function desenhar(def, inst) {
  const f = MAPA[def.arte] || modulo;
  return f(def, inst || {});
}

/* Miniatura para o painel de pecas: mesmo desenho, encaixado numa
   caixa de 40x30 para caber no botao da gaveta. */
export function miniatura(def) {
  const corpo = desenhar(def, { variante: def.variantes && def.variantes[0].nome });
  const k = Math.min(40 / def.w, 30 / def.h);
  return `<svg viewBox="0 0 40 30" width="40" height="30" aria-hidden="true">
<g transform="translate(${(40 - def.w * k) / 2} ${(30 - def.h * k) / 2}) scale(${k})">${corpo}</g></svg>`;
}
