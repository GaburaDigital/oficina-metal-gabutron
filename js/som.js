/* ============================================================
   SOM — efeitos sinteticos via Web Audio API.
   Nenhum arquivo de audio no repositorio: tudo e gerado na hora.
   Safari so libera o audio depois de um toque do usuario, por isso
   o contexto e criado sob demanda e destravado no primeiro clique.
   ============================================================ */

import { ajustes } from "./config.js";

let ctx = null;

function contexto() {
  if (!ctx) {
    const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

export function destravarAudio() {
  const c = contexto();
  if (c && c.state === "suspended") c.resume();
}

function tom({ f = 440, f2 = null, dur = 0.09, tipo = "square", vol = 0.05, atraso = 0 }) {
  if (!ajustes.som) return;
  const c = contexto();
  if (!c) return;
  const t0 = c.currentTime + atraso;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = tipo;
  osc.frequency.setValueAtTime(f, t0);
  if (f2) osc.frequency.exponentialRampToValueAtTime(Math.max(f2, 1), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function ruido({ dur = 0.25, vol = 0.08, corte = 1200 }) {
  if (!ajustes.som) return;
  const c = contexto();
  if (!c) return;
  const n = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, n, c.sampleRate);
  const dados = buf.getChannelData(0);
  for (let i = 0; i < n; i++) dados[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const src = c.createBufferSource();
  src.buffer = buf;
  const filtro = c.createBiquadFilter();
  filtro.type = "lowpass";
  filtro.frequency.value = corte;
  const g = c.createGain();
  g.gain.value = vol;
  src.connect(filtro).connect(g).connect(c.destination);
  src.start();
}

export const SOM = {
  clique:   () => tom({ f: 620, dur: 0.03, vol: 0.035 }),
  encaixe:  () => { tom({ f: 880, dur: 0.04, vol: 0.05 }); tom({ f: 1320, dur: 0.05, vol: 0.03, atraso: 0.03 }); },
  pegar:    () => tom({ f: 320, f2: 480, dur: 0.06, tipo: "triangle", vol: 0.04 }),
  soltar:   () => tom({ f: 240, dur: 0.05, tipo: "triangle", vol: 0.04 }),
  fio:      () => tom({ f: 520, f2: 780, dur: 0.07, tipo: "sawtooth", vol: 0.035 }),
  erro:     () => { tom({ f: 200, dur: 0.12, vol: 0.05 }); tom({ f: 150, dur: 0.16, vol: 0.05, atraso: 0.1 }); },
  lixo:     () => { ruido({ dur: 0.18, vol: 0.05, corte: 800 }); tom({ f: 180, f2: 90, dur: 0.14, vol: 0.04 }); },
  energia:  () => { tom({ f: 180, f2: 900, dur: 0.35, tipo: "sawtooth", vol: 0.045 }); tom({ f: 1200, dur: 0.06, vol: 0.03, atraso: 0.33 }); },
  desliga:  () => tom({ f: 700, f2: 120, dur: 0.28, tipo: "sawtooth", vol: 0.04 }),
  curto:    () => { ruido({ dur: 0.4, vol: 0.12, corte: 2600 }); tom({ f: 90, dur: 0.3, vol: 0.06 }); },
  sucesso:  () => [523, 659, 784, 1047].forEach((f, i) => tom({ f, dur: 0.11, vol: 0.045, atraso: i * 0.07 })),
  bip:      () => tom({ f: 1400, dur: 0.025, vol: 0.02 }),
  bipLongo: () => tom({ f: 900, dur: 0.35, tipo: "sine", vol: 0.05 }),
  boot:     () => { tom({ f: 110, dur: 0.5, tipo: "sine", vol: 0.05 }); tom({ f: 220, dur: 0.5, tipo: "sine", vol: 0.03, atraso: 0.05 }); },
  rele:     () => { tom({ f: 1100, dur: 0.02, vol: 0.05 }); tom({ f: 320, dur: 0.05, vol: 0.045, atraso: 0.02 }); },
  passo:    () => tom({ f: 520, dur: 0.03, tipo: "square", vol: 0.03 }),
  midia:    () => { tom({ f: 700, dur: 0.05, vol: 0.04 }); tom({ f: 1050, dur: 0.07, vol: 0.035, atraso: 0.05 }); },
  motor:    () => tom({ f: 90, f2: 190, dur: 0.3, tipo: "sawtooth", vol: 0.035 }),
  botao:    () => { tom({ f: 900, dur: 0.02, vol: 0.03 }); tom({ f: 600, dur: 0.03, vol: 0.025, atraso: 0.02 }); },
  selo:     () => [660, 880, 1320].forEach((f, i) => tom({ f, dur: 0.12, vol: 0.04, atraso: i * 0.09 })),
  solda:    () => { ruido({ dur: 0.5, vol: 0.06, corte: 3400 }); tom({ f: 60, dur: 0.2, vol: 0.03 }); },
  tecla:    () => tom({ f: 1600 + Math.random() * 500, dur: 0.012, vol: 0.012 }),
};
