/* ============================================================
   FIOS — regras de encaixe e traçado.
   A regra e fisica, igual a bancada real: ponta macho so entra em
   furo ou barra femea; ponta femea so encaixa em pino macho.
   Quando o aluno erra, quem explica e o GabuTRON.
   ============================================================ */

import { ACEITA } from "./biblioteca.js";

export function podeConectar(ponta, pino) {
  return (ACEITA[ponta] || []).includes(pino.r);
}

export function motivoRecusa(ponta, pino) {
  const nomes = { macho: "macho", femea: "femea", jacare: "garra jacare" };
  if (ponta === "macho" && pino.r === "macho")
    return "Ponta macho em pino macho nao encaixa. Troque para um jumper macho-femea ou use a protoboard no meio.";
  if (ponta === "femea" && (pino.r === "femea" || pino.r === "borne"))
    return "Ponta femea nao entra em furo. Voce quer um jumper macho-macho aqui.";
  if (ponta === "jacare" && pino.r === "femea")
    return "A garra jacare nao morde furo de protoboard. Ela e para pernas, pads e bornes.";
  return `Essa ponta ${nomes[ponta] || ponta} nao encaixa nesse tipo de contato.`;
}

/* Traçado bagunçado: o jumper cai com o proprio peso, como na vida real. */
export function caminhoSolto(a, b) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const dist = Math.hypot(dx, dy);
  const barriga = Math.min(90, 22 + dist * 0.22);
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2 + barriga;
  return `M${a.x} ${a.y} Q${mx} ${my} ${b.x} ${b.y}`;
}

/* Traçado organizado: angulos retos, estilo esquema de bancada limpa. */
export function caminhoReto(a, b) {
  const meioY = (a.y + b.y) / 2;
  const r = 8;
  const s = Math.sign(b.y - a.y) || 1;
  if (Math.abs(b.y - a.y) < 4) return `M${a.x} ${a.y} L${b.x} ${b.y}`;
  return `M${a.x} ${a.y} L${a.x} ${meioY - r * s} Q${a.x} ${meioY} ${a.x + Math.sign(b.x - a.x) * r} ${meioY} L${b.x - Math.sign(b.x - a.x) * r} ${meioY} Q${b.x} ${meioY} ${b.x} ${meioY + r * s} L${b.x} ${b.y}`;
}

export function caminho(a, b, estilo) {
  return estilo === "reto" ? caminhoReto(a, b) : caminhoSolto(a, b);
}
