/* ============================================================
   Prova que cada missao tem solucao.

     node ferramentas/resolver-missoes.mjs

   Monta automaticamente um circuito a partir dos objetivos e verifica
   se todos fecham. Missao sem solucao trava o aluno no meio da aula,
   e esse e o tipo de erro que so aparece na frente da turma.
   ============================================================ */
import { PORID, P } from "../js/biblioteca.js";
import { calcular } from "../js/circuito.js";
import { verificar, sessao } from "../js/missoes.js";
import { acharScript, aplicar } from "../js/scripts.js";
import fs from "fs";

const raiz = "/mnt/user-data/outputs/oficina-metal-gabutron/";

/* ---------- montador ---------- */

class Bancada {
  constructor(placaId) {
    this.comps = [];
    this.fios = [];
    this.midia = [];
    this.seq = 1;
    this.placaId = placaId;
    this.placa = null;
    this.usados = [];
  }
  por(tipo, extra = {}) {
    const achado = this.comps.find((c) => c.tipo === tipo && !extra.novo);
    if (achado) return achado;
    return this.add(tipo, extra);
  }
  add(tipo, extra = {}) {
    const d = PORID[tipo];
    if (!d) throw new Error("peca inexistente: " + tipo);
    const c = {
      id: tipo + this.seq++, tipo, x: 0, y: 0, rot: 0, encaixes: [],
      variante: d.variantes ? d.variantes[0].nome : undefined,
      valor: d.valores ? d.valores[0] : undefined,
      slots: d.slots ? d.slots.padrao : undefined,
      tensao: d.faixaTensao ? d.faixaTensao.padrao : undefined,
      limite: d.faixaCorrente ? d.faixaCorrente.padrao : undefined,
      tensaoSaida: d.ajustavel ? d.ajustavel[d.ajustavel.length - 1] : undefined,
      trimpot: d.trimpot ? 50 : undefined,
      usbLigado: d.usb ? true : undefined,
      firmware: {}, apertados: [],
      ...extra,
    };
    this.comps.push(c);
    return c;
  }
  fio(a, pa, b, pb) {
    if (!a || !b || !pa || !pb) return;
    this.fios.push({ id: "f" + this.seq++, cor: "#E24B4A", pontas: ["macho", "macho"],
      a: { comp: a.id, pino: pa }, b: { comp: b.id, pino: pb } });
  }
  circuito() { return calcular(this.comps, this.fios, true, this.midia); }
}

const acharPino = (comp, alvo) => {
  const d = PORID[comp.tipo];
  if (alvo.pino) return alvo.pino;
  if (alvo.papel) { const p = d.pinos.find((x) => x.papel === alvo.papel); return p && p.id; }
  if (alvo.nome) { const p = d.pinos.find((x) => x.n === alvo.nome); return p && p.id; }
  return null;
};

const pinoPapel = (tipo, papel) => (PORID[tipo].pinos.find((p) => p.papel === papel) || {}).id;
const pinoLivre = (tipo, papel, usados = []) =>
  (PORID[tipo].pinos.find((p) => p.papel === papel && !usados.includes(p.id)) || {}).id;

/* Alimenta um modulo: pino da placa quando a corrente cabe, fonte
   externa quando nao cabe. E a mesma decisao que o aluno tem que tomar. */
function alimentar(b, comp) {
  if (!comp) return;
  const d = PORID[comp.tipo];

  // Motor de passo nao liga em fonte: quem energiza as bobinas e o
  // driver. Sem esse desvio o solucionador tentaria o impossivel.
  if (d.id === "motor-passo") {
    const dr = b.por("uln2003");
    b.fio(comp, "com", dr, "mc");
    ["a", "b", "c", "d"].forEach((k, i) => b.fio(comp, k, dr, "m" + (i + 1)));
    alimentar(b, dr);
    if (b.placa) {
      b.fio(dr, "gnd", b.placa, pinoPapel(b.placaId, "gnd"));
      ["in1", "in2", "in3", "in4"].forEach((entrada) => {
        const pino = pinoLivre(b.placaId, "digital", b.usados);
        if (!pino) return;
        b.usados.push(pino);
        b.placa.firmware[pino] = { modo: "alto" };
        b.fio(dr, entrada, b.placa, pino);
      });
    }
    return;
  }

  const vp = d.pinos.find((p) => p.papel === "v+");
  const gp = d.pinos.find((p) => p.papel === "gnd");
  if (!vp || !gp) return;

  // A placa so alimenta o que cabe no pino dela. O resto vai para fonte
  // externa com GND comum, que e a regra da bancada real.
  const melhor = b.placa
    ? PORID[b.placaId].pinos.filter((p) => p.v).sort((x, y) => y.v - x.v)[0]
    : null;
  const cabe = melhor && (d.correnteTipica || 0) <= (PORID[b.placaId].limiteAlim || 500) * 0.6
    && melhor.v >= (d.alimenta || 0);

  if (cabe) {
    b.fio(comp, vp.id, b.placa, melhor.id);
    b.fio(comp, gp.id, b.placa, pinoPapel(b.placaId, "gnd"));
  } else {
    const precisa = d.alimenta || 5;
    const slots = Math.max(1, Math.min(6, Math.ceil((precisa + 0.6) / 1.5)));
    const bat = b.por("suporteaa", { slots });
    if (bat.slots < slots) bat.slots = slots;
    b.fio(comp, vp.id, bat, "p");
    b.fio(comp, gp.id, bat, "n");
    if (b.placa) b.fio(bat, "n", b.placa, pinoPapel(b.placaId, "gnd"));
  }
}

const RECEITAS = {};

function resolver(m) {
  const placaId = m.placa || (m.componentesLiberados || []).find((c) => PORID[c] && PORID[c].alimentada) || null;
  const b = new Bancada(placaId);
  if (placaId) b.placa = b.add(placaId);
  sessao.ferramentas = new Set();
  sessao.botoes = new Set();
  sessao.cores = new Set();
  sessao.missao = m;

  const usados = b.usados;
  const objetivos = m.objetivos || [];

  // 1. instancia tudo que as regras citam
  for (const o of objetivos) {
    const r = o.regra;
    for (const t of [r.componente, r.a && r.a.componente, r.b && r.b.componente,
      r.tipo === "emSerie" ? r.a : null, r.tipo === "emSerie" ? r.b : null]) {
      if (typeof t === "string" && PORID[t] && t !== placaId) b.por(t);
    }
  }

  // 2. resolve cada regra
  for (const o of objetivos) {
    const r = o.regra;
    switch (r.tipo) {
      case "existe": {
        const alvo = b.por(r.componente);
        for (let k = 1; k < (r.n || 1); k++) b.add(r.componente);
        break;
      }
      case "mesmoNo": {
        const ca = r.a.componente === placaId ? b.placa : (PORID[r.a.componente] ? b.por(r.a.componente) : null);
        const cb = r.b.componente === placaId ? b.placa : (PORID[r.b.componente] ? b.por(r.b.componente) : null);
        if (!ca || !cb) break;
        b.fio(ca, acharPino(ca, r.a), cb, acharPino(cb, r.b));
        break;
      }
      case "ligado": {
        const alvos = [b.por(r.componente)];
        for (let k = 1; k < (r.n || 1); k++) alvos.push(b.add(r.componente));
        alvos.forEach((c) => alimentar(b, c));
        break;
      }
      case "aceso": {
        const alvos = [b.por(r.componente)];
        for (let k = 1; k < (r.n || 1); k++) alvos.push(b.add(r.componente));
        for (const led of alvos) {
          const res = b.add("resistor", { valor: "220" });
          const fonte = b.placa || b.por("suporteaa", { slots: 3 });
          const vpin = b.placa ? PORID[placaId].pinos.find((p) => p.v >= 3).id : "p";
          const gpin = b.placa ? pinoPapel(placaId, "gnd") : "n";
          b.fio(fonte, vpin, res, "a");
          b.fio(res, "b", led, "a");
          b.fio(led, "k", fonte, gpin);
        }
        break;
      }
      case "emSerie": {
        const ca = b.por(r.a), cb = b.por(r.b);
        b.fio(ca, PORID[r.a].pinos[1].id, cb, PORID[r.b].pinos[0].id);
        break;
      }
      case "pinoEm": {
        const c = b.por(r.componente);
        const alvo = b.placa;
        if (!alvo) break;
        let pino = pinoLivre(alvo.tipo, r.papelAlvo, usados);
        // Placa sem pino daquele papel: usa qualquer digital livre, que
        // e o que o aluno faria com biblioteca de software.
        if (!pino) pino = pinoLivre(alvo.tipo, "digital", usados);
        if (!pino) break;
        usados.push(pino);
        b.fio(c, r.pino, alvo, pino);
        break;
      }
      case "tensaoEm": {
        const c = b.por(r.componente);
        if (PORID[c.tipo].trimpot && PORID[c.tipo].trimpot.tipo === "tensao") {
          const alvo = (r.min + r.max) / 2;
          c.trimpot = Math.round(((alvo - 1.2) / 10.8) * 100);
        }
        break;
      }
      case "firmware": {
        const alvo = b.placa;
        const papel = r.modo === "pwm" ? "pwm" : "digital";
        for (let k = 0; k < (r.n || 1); k++) {
          const pino = pinoLivre(alvo.tipo, papel, usados);
          usados.push(pino);
          alvo.firmware[pino] = { modo: r.modo, duty: 200 };
        }
        break;
      }
      case "scriptAtivo": {
        aplicar(b.placa, acharScript(r.script));
        break;
      }
      case "botaoUsado": sessao.botoes.add(`${r.componente}:${r.botao}`); break;
      case "corDoLed": sessao.cores.add(r.cor); break;
      case "usouFerramenta": sessao.ferramentas.add(r.modo || r.ferramenta); break;
      case "trimpotEntre": {
        const c = b.por(r.componente);
        c.trimpot = Math.round(((r.min || 0) + (r.max || 100)) / 2);
        break;
      }
      case "correnteEm": {
        const c = b.por(r.componente);
        if (c.tipo === "led") { const res = b.por("resistor"); res.valor = "220"; }
        break;
      }
      case "encaixado": {
        const c = b.por(r.componente);
        const d = PORID[r.componente];
        const pontas = d.pontasEncaixe || [{ id: "corpo", tipo: d.encaixavel || r.componente }];
        let feitos = 0;
        for (const host of b.comps) {
          const hd = PORID[host.tipo];
          for (const slot of hd.encaixes || (hd.encaixe ? [hd.encaixe] : [])) {
            const ponta = pontas.find((pt) => pt.tipo === slot.tipo &&
              !b.midia.some((l) => l.cabo === c.id && l.ponta === pt.id));
            if (!ponta || b.midia.some((l) => l.host === host.id && l.slot === slot.tipo)) continue;
            b.midia.push({ cabo: c.id, ponta: ponta.id, host: host.id, slot: slot.tipo });
            feitos++;
          }
        }
        // faltou conector: traz a peca que tem o slot
        if (feitos < (r.n || 1)) {
          for (const cand of m.componentesLiberados || []) {
            const cd = PORID[cand];
            if (!cd) continue;
            for (const slot of cd.encaixes || (cd.encaixe ? [cd.encaixe] : [])) {
              const ponta = pontas.find((pt) => pt.tipo === slot.tipo &&
                !b.midia.some((l) => l.cabo === c.id && l.ponta === pt.id));
              if (!ponta) continue;
              const host = b.por(cand);
              if (b.midia.some((l) => l.host === host.id && l.slot === slot.tipo)) continue;
              b.midia.push({ cabo: c.id, ponta: ponta.id, host: host.id, slot: slot.tipo });
              feitos++;
            }
          }
        }
        break;
      }
      default: break;
    }
  }

  if (RECEITAS[m.id]) RECEITAS[m.id](b);

  // alimenta quem ficou sem energia mas precisa
  for (const c of [...b.comps]) {
    const d = PORID[c.tipo];
    if (d.alimenta === undefined || d.fonte || d.alimentada) continue;
    const vp = d.pinos.find((p) => p.papel === "v+");
    const jaTem = b.fios.some((f) => (f.a.comp === c.id && f.a.pino === vp.id) || (f.b.comp === c.id && f.b.pino === vp.id));
    if (!jaTem) alimentar(b, c);
  }

  // Ultimo passo: se sobrou critico de corrente, troca a alimentacao
  // do culpado para fonte externa. E a mesma correcao que o aluno faz.
  for (let volta = 0; volta < 3; volta++) {
    const circ = b.circuito();
    const criticos = circ.diagnosticos.filter((x) => x.nivel === "critico");
    if (!criticos.length) break;
    let mudou = false;
    for (const cr of criticos) {
      const culpado = b.comps.find((c) => c.id === cr.comp);
      if (!culpado) continue;
      if (cr.dano && (cr.dano.tipo === "pino" || cr.dano.tipo === "placa")) {
        // tira do pino da placa quem estiver pesado demais
        for (const c of b.comps) {
          const d = PORID[c.tipo];
          if (d.alimenta === undefined || !(d.correnteTipica > 40)) continue;
          const vp = d.pinos.find((p) => p.papel === "v+");
          const antes = b.fios.length;
          b.fios = b.fios.filter((f) =>
            !((f.a.comp === c.id && f.a.pino === vp.id) || (f.b.comp === c.id && f.b.pino === vp.id)));
          if (b.fios.length !== antes) {
            const bat = b.por("suporteaa", { slots: Math.max(4, Math.ceil(((d.alimenta || 5) + 0.6) / 1.5)) });
            b.fio(c, vp.id, bat, "p");
            mudou = true;
          }
        }
      }
      if (cr.dano && cr.dano.tipo === "queima" && culpado.tipo === "led") {
        const res = b.comps.find((c) => c.tipo === "resistor");
        if (res) { res.valor = "1k"; mudou = true; }
      }
    }
    if (!mudou) break;
  }

  return b;
}

/* ---------- execucao ---------- */

const cat = JSON.parse(fs.readFileSync(raiz + "catalogo.json"));
const entradas = [...cat.conteudos.construcao, ...cat.conteudos.manutencao, ...(cat.conteudos.hacking || [])];

let quebradas = [];
console.log("MISSAO".padEnd(26), "PLACA".padEnd(10), "RESULTADO");
console.log("-".repeat(96));
for (const e of entradas) {
  const m = JSON.parse(fs.readFileSync(raiz + e.arquivo));
  let b, circ, falta = [];
  try {
    b = resolver(m);
    circ = b.circuito();
    falta = (m.objetivos || []).filter((o) => !verificar(o.regra, b.comps, circ)).map((o) => o.id);
  } catch (err) {
    falta = ["ERRO: " + err.message];
  }
  if (falta.length) quebradas.push([m.id, falta]);
  console.log(m.id.padEnd(26), (m.placa || "gaburino").padEnd(10),
    falta.length ? "falta " + falta.join(", ") : "resolvida");
}
console.log("\nmissoes sem solucao automatica:", quebradas.length, "de", entradas.length);
