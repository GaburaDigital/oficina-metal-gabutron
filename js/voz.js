/* ============================================================
   VOZ — fala do Metal GabuTRON com SpeechSynthesis.
   Tom grave e ritmo arrastado para soar como robo velho.
   No Safari e no iOS a fala so dispara depois de um toque, por isso
   existe o botao "Falar" no painel dele.
   ============================================================ */

import { ajustes } from "./config.js";

let vozes = [];
let pronto = false;

function carregarVozes() {
  if (!("speechSynthesis" in window)) return;
  vozes = window.speechSynthesis.getVoices() || [];
  pronto = vozes.length > 0;
}

if ("speechSynthesis" in window) {
  carregarVozes();
  window.speechSynthesis.onvoiceschanged = carregarVozes;
}

export function listarVozes() {
  if (!pronto) carregarVozes();
  return vozes.filter((v) => /pt/i.test(v.lang));
}

function escolherVoz() {
  if (!pronto) carregarVozes();
  const pt = listarVozes();
  if (ajustes.vozEscolhida) {
    const achou = vozes.find((v) => v.name === ajustes.vozEscolhida);
    if (achou) return achou;
  }
  // Preferencia por voz masculina brasileira quando existir.
  const masculina = pt.find((v) => /(daniel|felipe|ricardo|male|homem)/i.test(v.name));
  return masculina || pt.find((v) => /pt-BR/i.test(v.lang)) || pt[0] || null;
}

export function suportaVoz() {
  return "speechSynthesis" in window;
}

export function falar(texto) {
  if (!ajustes.voz || !texto || !suportaVoz()) return;
  calar();
  const fala = new SpeechSynthesisUtterance(limpar(texto));
  const v = escolherVoz();
  if (v) fala.voice = v;
  fala.lang = (v && v.lang) || "pt-BR";
  fala.pitch = 0.45;   // grave: motor velho
  fala.rate = 0.92;    // levemente arrastado
  fala.volume = 1;
  window.speechSynthesis.speak(fala);
}

export function calar() {
  if (suportaVoz()) window.speechSynthesis.cancel();
}

function limpar(t) {
  return String(t)
    .replace(/\s+/g, " ")
    .replace(/[<>[\]{}|]/g, " ")
    .trim();
}
