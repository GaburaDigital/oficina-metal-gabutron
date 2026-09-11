/* ============================================================
   REGRAS — o avaliador de condicoes do circuito.

   Usado em dois lugares: pelo checklist das missoes e pelos scripts
   do deck, que so rodam se a fiacao estiver coerente. Ter um so
   avaliador evita que missao e script discordem sobre o que e
   "montado certo".
   ============================================================ */

import { PORID } from "./biblioteca.js";

export const contexto = { ferramentas: new Set(), botoes: new Set(), cores: new Set() };

function pinosDe(comps, alvo) {
  const saida = [];
  for (const c of comps) {
    if (alvo.componente && c.tipo !== alvo.componente) continue;
    const d = PORID[c.tipo];
    if (!d) continue;
    for (const p of d.pinos) {
      if (alvo.pino && p.id !== alvo.pino) continue;
      if (alvo.papel && p.papel !== alvo.papel) continue;
      if (alvo.nome && p.n !== alvo.nome) continue;
      saida.push({ comp: c, pino: p });
    }
  }
  return saida;
}

export function verificar(regra, comps, circ) {
  if (!regra) return false;
  const conta = (t) => comps.filter((c) => c.tipo === t && !c.queimado).length;

  switch (regra.tipo) {
    case "existe":
      return conta(regra.componente) >= (regra.n || 1);

    case "mesmoNo": {
      const a = pinosDe(comps, regra.a), b = pinosDe(comps, regra.b);
      return a.some((x) => b.some((y) =>
        !(x.comp.id === y.comp.id && x.pino.id === y.pino.id) &&
        circ.noDe(x.comp.id, x.pino.id) === circ.noDe(y.comp.id, y.pino.id)));
    }

    case "ligado":
      return comps.filter((c) => c.tipo === regra.componente &&
        (circ.estados.get(c.id) || {}).ligado).length >= (regra.n || 1);

    case "aceso":
      return comps.filter((c) => c.tipo === regra.componente &&
        (circ.estados.get(c.id) || {}).aceso).length >= (regra.n || 1);

    case "pinoEm": {
      const alvos = pinosDe(comps, { componente: regra.componente, pino: regra.pino });
      return alvos.some(({ comp, pino }) => {
        const lista = circ.pinosDoNo.get(circ.noDe(comp.id, pino.id)) || [];
        // Pino acumula funcao no mundo real: o 13 do GaburINO e digital
        // E o SCK do SPI, e todo GPIO do ESP32 faz PWM. A regra aceita o
        // papel principal ou qualquer funcao extra registrada no pino.
        return lista.some((it) => it.comp.id !== comp.id &&
          (it.pino.papel === regra.papelAlvo || (it.pino.extras || []).includes(regra.papelAlvo)));
      });
    }

    case "tensaoEm": {
      const alvos = pinosDe(comps, regra);
      return alvos.some(({ comp, pino }) => {
        const v = circ.vDe(comp.id, pino.id);
        return v >= (regra.min ?? 0) && v <= (regra.max ?? 99);
      });
    }

    case "firmware":
      return comps.filter((c) => c.tipo === regra.componente)
        .reduce((soma, c) => soma + Object.values(c.firmware || {})
          .filter((f) => f.modo === regra.modo).length, 0) >= (regra.n || 1);

    case "emSerie": {
      // Duas pecas em serie de verdade: um terminal de cada uma no
      // mesmo no, e o outro terminal de cada uma em nos diferentes.
      const as = comps.filter((c) => c.tipo === regra.a && !c.queimado);
      const bs = comps.filter((c) => c.tipo === regra.b && !c.queimado);
      for (const ca of as) {
        const da = PORID[ca.tipo];
        for (const cb of bs) {
          const db = PORID[cb.tipo];
          for (const pa of da.pinos) {
            for (const pb of db.pinos) {
              const compartilham = circ.noDe(ca.id, pa.id) === circ.noDe(cb.id, pb.id);
              if (!compartilham) continue;
              const outroA = da.pinos.find((x) => x.id !== pa.id);
              const outroB = db.pinos.find((x) => x.id !== pb.id);
              if (!outroA || !outroB) continue;
              if (circ.noDe(ca.id, outroA.id) !== circ.noDe(cb.id, outroB.id)) return true;
            }
          }
        }
      }
      return false;
    }

    case "correnteEm": {
      const alvos = comps.filter((c) => c.tipo === regra.componente);
      return alvos.some((c) => {
        const e = circ.estados.get(c.id) || {};
        const i = e.corrente || 0;
        return i >= (regra.min ?? 0) && i <= (regra.max ?? 1e9);
      });
    }

    case "usouFerramenta":
      return contexto.ferramentas.has(regra.modo || regra.ferramenta);

    case "semRompidos":
      // nenhum fio partido por dentro continuou no circuito
      return !(circ.fiosRompidos || []).length;

    case "trimpotEntre": {
      const alvos = comps.filter((c) => c.tipo === regra.componente);
      return alvos.some((c) => {
        const v = c.trimpot ?? 50;
        return v >= (regra.min ?? 0) && v <= (regra.max ?? 100);
      });
    }

    case "encaixado": {
      // Cartao, pen drive e cabo: conta quantas ligacoes mecanicas a
      // peca tem de fato, lendo a lista de midia da bancada.
      const pecas = comps.filter((c) => c.tipo === regra.componente).map((c) => c.id);
      const total = (circ.midia || []).filter((l) => pecas.includes(l.cabo) || pecas.includes(l.host)).length;
      return total >= (regra.n || 1);
    }

    case "scriptAtivo":
      return comps.some((c) => c.tipo === regra.componente && c.script === regra.script);

    case "botaoUsado":
      // Registrado quando o aluno aperta o botao de verdade na bancada.
      return contexto.botoes.has(`${regra.componente}:${regra.botao}`);

    case "corDoLed": {
      // O LED chegou a mostrar essa cor durante a missao?
      return contexto.cores.has(regra.cor);
    }

    case "semCriticos":
      return !circ.diagnosticos.some((d) => d.nivel === "critico");

    default:
      return false;
  }
}

