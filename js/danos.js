/* ============================================================
   DANOS — a fumaca magica.
   Quando o diagnostico aponta um limite estourado, e aqui que a
   peca morre. Morrer tem consequencia: o componente para de
   conduzir, muda de desenho e entra no Museu dos Desastres.

   A escolha pedagogica: o aluno tem UM aviso antes. Ao energizar,
   se houver dano iminente, o GabuTRON grita e a bancada desliga
   sozinha. So na segunda vez, com o mesmo erro, a peca queima.
   Errar tem preco, mas nao um preco que faz desistir.
   ============================================================ */

import { PORID } from "./biblioteca.js";
import { lerMuseu, salvarMuseu } from "./config.js";

let avisadoAntes = new Set();

export function limparMemoria() { avisadoAntes = new Set(); }

/* Recebe o resultado do circuito e decide o que acontece.
   Devolve { desligar, queimados, avisos, primeiraVez } */
export function aplicar(comps, resultado) {
  const criticos = resultado.diagnosticos.filter((d) => d.nivel === "critico" && d.dano);
  if (!criticos.length) return { desligar: false, queimados: [], avisos: [], primeiraVez: false };

  const assinatura = criticos.map((d) => `${d.comp}:${d.dano.tipo}:${d.dano.pino || ""}`).sort().join("|");
  const jaAvisou = avisadoAntes.has(assinatura);

  if (!jaAvisou) {
    avisadoAntes.add(assinatura);
    return { desligar: true, queimados: [], avisos: criticos, primeiraVez: true };
  }

  const queimados = [];
  const museu = lerMuseu();

  for (const d of criticos) {
    const comp = comps.find((c) => c.id === d.comp);
    if (!comp) continue;
    const def = PORID[comp.tipo];

    if (d.dano.tipo === "pino") {
      comp.pinosQueimados = comp.pinosQueimados || [];
      if (!comp.pinosQueimados.includes(d.dano.pino)) {
        comp.pinosQueimados.push(d.dano.pino);
        const p = def.pinos.find((x) => x.id === d.dano.pino);
        queimados.push({ id: comp.id, nome: `pino ${p ? p.n : ""} da ${def.nome}`, motivo: d.txt });
      }
    } else if (d.dano.tipo === "placa" || d.dano.tipo === "curto") {
      // curto e sobrecarga geral nao matam a placa: a protecao dela atua
      queimados.push({ id: comp.id, nome: def.nome, motivo: d.txt, protegido: true });
    } else {
      if (!comp.queimado) {
        comp.queimado = true;
        comp.motivoQueima = d.txt;
        queimados.push({ id: comp.id, nome: def.nome, motivo: d.txt });
      }
    }
  }

  for (const q of queimados) {
    if (q.protegido) continue;
    museu.pecas.unshift({ nome: q.nome, motivo: q.motivo, data: new Date().toISOString() });
  }
  museu.pecas = museu.pecas.slice(0, 60);
  museu.total = (museu.total || 0) + queimados.filter((q) => !q.protegido).length;
  salvarMuseu(museu);

  return { desligar: true, queimados, avisos: criticos, primeiraVez: false };
}

/* Fumaca em SVG, desenhada por cima da peca que morreu. */
export function svgFumaca(x, y) {
  const bolhas = [0, 1, 2, 3].map((i) => {
    const atraso = i * 0.45;
    return `<circle cx="${x + (i % 2 ? 10 : -8)}" cy="${y}" r="${10 + i * 4}" fill="#8A8F98" opacity="0">
      <animate attributeName="cy" from="${y}" to="${y - 120}" dur="2.6s" begin="${atraso}s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0;.45;0" dur="2.6s" begin="${atraso}s" repeatCount="indefinite"/>
      <animate attributeName="r" from="${6 + i * 3}" to="${22 + i * 5}" dur="2.6s" begin="${atraso}s" repeatCount="indefinite"/>
    </circle>`;
  }).join("");
  return `<g class="fumaca" pointer-events="none">${bolhas}</g>`;
}

/* Marca visual de peca queimada: escurece e racha. */
export function svgQueimado(w, h) {
  return `<g pointer-events="none">
    <rect x="0" y="0" width="${w}" height="${h}" rx="4" fill="#0B0B0B" opacity=".62"/>
    <path d="M${w * 0.2} ${h * 0.15}L${w * 0.42} ${h * 0.5}L${w * 0.3} ${h * 0.55}L${w * 0.55} ${h * 0.9}"
      fill="none" stroke="#E24B4A" stroke-width="2.5" opacity=".8"/>
    <path d="M${w * 0.62} ${h * 0.2}L${w * 0.7} ${h * 0.48}L${w * 0.84} ${h * 0.42}"
      fill="none" stroke="#E24B4A" stroke-width="2" opacity=".6"/>
  </g>`;
}
