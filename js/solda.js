/* ============================================================
   SOLDA — o ferro quente.

   Solda une dois contatos que estejam encostados, sem perguntar se a
   ponta e macho ou femea: estanho derretido nao respeita formato. E
   por isso que ela resolve gambiarra que jumper nenhum resolve, e
   tambem por isso que ela e permanente ate voce dessoldar.

   Regra da bancada: nao se solda com o circuito energizado.
   ============================================================ */

import { PORID } from "./biblioteca.js";
import { SOM } from "./som.js";

const ALCANCE = 90; // unidades: os contatos precisam estar perto

export const estado = { ativo: false, primeiro: null };

export function ligar(bancada) {
  estado.ativo = true;
  estado.primeiro = null;
  bancada.estado.modoFerramenta = "solda";
}

export function desligar(bancada) {
  estado.ativo = false;
  estado.primeiro = null;
  bancada.estado.modoFerramenta = null;
  bancada.redesenhar();
}

/* Devolve { ok, motivo, acao } para quem chamou decidir o que dizer. */
export function usar(comp, pino, bancada) {
  if (bancada.estado.energizado)
    return { ok: false, motivo: "Ferro quente em circuito ligado, nao. Desenergize a bancada antes de soldar." };

  // clicou numa junta existente: dessolda
  const junta = bancada.estado.fios.find(
    (f) => f.tipo === "solda" &&
      ((f.a.comp === comp && f.a.pino === pino) || (f.b.comp === comp && f.b.pino === pino))
  );
  if (junta && !estado.primeiro) {
    bancada.removerFio(junta.id);
    return { ok: true, acao: "dessolda", motivo: "Junta desfeita. O estanho voltou para o ferro." };
  }

  if (!estado.primeiro) {
    estado.primeiro = { comp, pino };
    SOM.clique();
    return { ok: true, acao: "primeiro", motivo: "Primeiro contato aquecido. Agora encoste no segundo." };
  }

  if (estado.primeiro.comp === comp && estado.primeiro.pino === pino) {
    estado.primeiro = null;
    return { ok: true, acao: "cancelado", motivo: "Ferro afastado." };
  }

  const a = bancada.posicaoDePino(estado.primeiro.comp, estado.primeiro.pino);
  const b = bancada.posicaoDePino(comp, pino);
  if (!a || !b) { estado.primeiro = null; return { ok: false, motivo: "Perdi um dos contatos." }; }

  const dist = Math.hypot(a.x - b.x, a.y - b.y);
  if (dist > ALCANCE) {
    estado.primeiro = null;
    return { ok: false, motivo: "Longe demais. Solda une o que esta encostado; para vencer distancia use fio." };
  }

  bancada.estado.fios.push({
    id: "s" + (bancada.estado.seq++),
    tipo: "solda",
    cor: "#C9CDD3",
    pontas: ["solda", "solda"],
    a: { comp: estado.primeiro.comp, pino: estado.primeiro.pino },
    b: { comp, pino },
  });
  estado.primeiro = null;
  SOM.solda();
  bancada.recalcular();
  return { ok: true, acao: "soldou", motivo: "Soldado. Essa ligacao nao sai mais sozinha." };
}

/* Marcador do contato ja aquecido, para o aluno nao se perder. */
export function svgFerro(bancada) {
  if (!estado.primeiro) return "";
  const p = bancada.posicaoDePino(estado.primeiro.comp, estado.primeiro.pino);
  if (!p) return "";
  return `<g pointer-events="none">
    <circle cx="${p.x}" cy="${p.y}" r="16" fill="#E0703C" opacity=".3"/>
    <circle cx="${p.x}" cy="${p.y}" r="7" fill="#E0703C"/>
  </g>`;
}

/* Gota de estanho desenhada sobre cada junta. */
export function svgJunta(x, y) {
  return `<circle cx="${x}" cy="${y}" r="9" fill="#C9CDD3" stroke="#7C828C" stroke-width="1.5"/>
          <circle cx="${x - 2.5}" cy="${y - 2.5}" r="2.5" fill="#F2F2EE"/>`;
}
