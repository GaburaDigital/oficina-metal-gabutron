/* ============================================================
   VERIFICADOR DE MISSOES

     node ferramentas/verificar-missoes.mjs

   Ele le os objetivos de cada missao e tenta MONTAR o circuito
   sozinho, seguindo as regras. Se conseguir fechar todos os
   objetivos, a missao e possivel. Se nao, ele diz qual objetivo
   ficou de fora — e isso e um aluno travado na aula.

   Nao e um jogador esperto: e um montador obediente. Justamente por
   isso serve de prova. Se ele monta seguindo so o que a missao pede,
   um aluno com as dicas tambem monta.
   ============================================================ */

import { PORID } from "../js/biblioteca.js";
import { calcular } from "../js/circuito.js";
import { verificar, sessao, iniciarMissao } from "../js/missoes.js";
import { acharScript, aplicar } from "../js/scripts.js";
import fs from "fs";

const RAIZ = new URL("..", import.meta.url).pathname;
const cat = JSON.parse(fs.readFileSync(RAIZ + "catalogo.json"));
const entradas = [...cat.conteudos.construcao, ...cat.conteudos.manutencao, ...(cat.conteudos.hacking || [])];

let seq = 1;
const novo = () => "x" + seq++;

class Bancada {
  constructor(missao) {
    this.m = missao;
    this.comps = [];
    this.fios = [];
    this.midia = [];
    if (missao.montagem) {
      this.comps = JSON.parse(JSON.stringify(missao.montagem.comps));
      this.comps.forEach((c) => { c.__daMontagem = true; });
      this.fios = JSON.parse(JSON.stringify(missao.montagem.fios));
      this.midia = JSON.parse(JSON.stringify(missao.montagem.midia || []));
      seq = 900;
    }
  }
  add(tipo, extra = {}) {
    const d = PORID[tipo];
    if (!d) return null;
    const c = {
      id: novo(), tipo, x: 0, y: 0, rot: 0, encaixes: [],
      variante: d.variantes && d.variantes[0].nome,
      valor: d.valores && d.valores[0],
      slots: d.slots && d.slots.padrao,
      tensao: d.faixaTensao && d.faixaTensao.padrao,
      limite: d.faixaCorrente && d.faixaCorrente.max,
      tensaoSaida: d.ajustavel && d.ajustavel[d.ajustavel.length - 1],
      trimpot: d.trimpot ? 55 : undefined,
      usbLigado: d.usb ? true : undefined,
      jumperEnable: d.jumperEnable ? true : undefined,
      firmware: {}, apertados: [],
      ...extra,
    };
    this.comps.push(c);
    return c;
  }
  achar(tipo) { return this.comps.find((c) => c.tipo === tipo && !c.queimado); }
  todos(tipo) { return this.comps.filter((c) => c.tipo === tipo); }
  pega(tipo) { return this.achar(tipo) || this.add(tipo); }
  liga(ca, pa, cb, pb) {
    if (!ca || !cb) return;
    const jaTem = this.fios.some((f) =>
      (f.a.comp === ca.id && f.a.pino === pa && f.b.comp === cb.id && f.b.pino === pb) ||
      (f.b.comp === ca.id && f.b.pino === pa && f.a.comp === cb.id && f.a.pino === pb));
    if (jaTem) return;
    this.fios.push({ id: "f" + novo(), tipo: "mm", cor: "#E24B4A", pontas: ["macho", "macho"],
      a: { comp: ca.id, pino: pa }, b: { comp: cb.id, pino: pb } });
  }
  circuito(energizado = true) {
    return calcular(this.comps, this.fios, energizado, this.midia);
  }
}

/* ---------- peças de apoio ---------- */

function pinoPapel(comp, papel) {
  const d = PORID[comp.tipo];
  const saidas = new Set(d.saidasMotor || []);
  // Pino de saida tambem pode ser marcado v+ (o COM do driver de passo
  // e um deles). Alimentar por ele nao acorda nada.
  const bons = d.pinos.filter((p) => p.papel === papel && !saidas.has(p.id));
  const alvoNome = papel === "gnd" ? /^(gnd|-)$/i : /vcc|^\+$|5v/i;
  const preferido = bons.find((p) => alvoNome.test((p.n || "").trim())) || bons[0];
  return preferido && preferido.id;
}
const pinosPapel = (comp, papel) => PORID[comp.tipo].pinos.filter((p) => p.papel === papel).map((p) => p.id);

/* Tensao que uma fonte entrega, ja considerando ajuste e slots. */
function tensaoDe(b, c) {
  const d = PORID[c.tipo];
  if (d.slots) return (c.slots ?? d.slots.padrao) * d.slots.porSlot;
  if (d.faixaTensao) return c.tensao ?? d.faixaTensao.padrao;
  if (d.ajustavel) return c.tensaoSaida ?? d.ajustavel[d.ajustavel.length - 1];
  const p = d.pinos.find((x) => x.v);
  return p ? p.v : 5;
}

/* Ajusta a fonte para a tensao pedida, quando ela permite. */
function mirarTensao(b, c, alvo, teto = 99) {
  const d = PORID[c.tipo];
  // Fonte compartilhada precisa caber em TODAS as cargas: acima do
  // piso da mais exigente e abaixo do teto da mais fragil. Mirar so no
  // piso fazia a bomba de 6 V escolher 9 e queimar o servo de 5.
  c.__piso = Math.max(c.__piso || 0, alvo);
  c.__teto = Math.min(c.__teto === undefined ? 99 : c.__teto, teto);
  alvo = Math.min(Math.max(c.__piso, 0), c.__teto);
  if (d.ajustavel) {
    const cabem = d.ajustavel.filter((v) => v <= c.__teto + 0.3);
    const acima = cabem.filter((v) => v >= alvo - 0.4).sort((x, y) => x - y);
    // Se nenhuma opcao alcanca o alvo, usa a maior que ainda caiba:
    // uma fonte de 9 V serve uma lampada de 12 melhor do que uma de 5.
    const cabe = acima.length ? acima[0] : cabem.sort((x, y) => y - x)[0];
    if (cabe) c.tensaoSaida = cabe;
  }
  // Nos reguladores quem manda de verdade e o trimpot.
  if (d.trimpot && d.trimpot.tipo === "tensao")
    c.trimpot = Math.round(Math.max(0, Math.min(100, ((alvo - 1.2) / 10.8) * 100)));
  if (d.faixaTensao) c.tensao = alvo;
  else if (d.slots) {
    const n = Math.max(d.slots.min, Math.min(d.slots.max, Math.round(alvo / d.slots.porSlot)));
    c.slots = n;
  } else if (d.trimpot && d.trimpot.tipo === "tensao")
    c.trimpot = Math.round(Math.max(0, Math.min(100, ((alvo - 1.2) / 10.8) * 100)));
}

/* Escolhe uma alimentacao que sirva para a peca: tensao dentro da
   faixa dela e corrente que a fonte aguente. Se so houver fonte de
   tensao alta, tenta passar por um regulador — que e exatamente o que
   a montagem real exige. */
function fonteDe(b, exige = {}) {
  const alvo = exige.nominal || exige.minima || 5;
  const teto = exige.max || 99;
  const corrente = exige.corrente || 0;
  const liberadas = b.m.componentesLiberados || [];

  const candidatas = ["fonte-bancada", "fonte-tomada", "bateria-recarregavel", "suporteaa",
    "suporte-litio", "celula-solar", "bateria9v"].filter((t) => liberadas.includes(t));

  // 1. fonte direta que caiba na faixa e na corrente
  for (const t of candidatas) {
    const c = b.pega(t);
    mirarTensao(b, c, alvo, teto);
    const v = tensaoDe(b, c);
    const cap = PORID[t].correnteMax || 3000;
    if (v >= (exige.minima || 0) && v <= teto && cap >= corrente)
      return { comp: c, vp: pinoPapel(c, "v+"), gnd: pinoPapel(c, "gnd") };
  }

  // 2. pino da propria placa, quando a tensao dela serve
  const placaCedo = b.comps.find((c) => PORID[c.tipo].alimentada);
  if (placaCedo) {
    const dp = PORID[placaCedo.tipo];
    const pino = dp.pinos.filter((p) => p.v && p.v >= (exige.minima || 0) && p.v <= teto)
      .sort((a, c2) => Math.abs(a.v - alvo) - Math.abs(c2.v - alvo))[0];
    if (pino && (dp.limiteAlim || 500) >= corrente)
      return { comp: placaCedo, vp: pino.id, gnd: pinoPapel(placaCedo, "gnd") };
  }

  // 3. regulador entre a fonte alta e a carga
  const reguladores = ["stepdown", "fonte-protoboard", "ams1117", "stepup"]
    .filter((t) => liberadas.includes(t))
    .sort((a, c2) => (PORID[c2].correnteMax || 0) - (PORID[a].correnteMax || 0));
  for (const t of reguladores) {
    if ((PORID[t].correnteMax || 0) < corrente) continue;
    const reg = b.pega(t);
    mirarTensao(b, reg, alvo, teto);
    const entrada = candidatas.map((x) => b.pega(x)).find(Boolean) || b.pega("fonte-tomada") || b.pega("suporteaa");
    if (!entrada) continue;
    const d = PORID[t];
    const entradaPino = d.pinos.find((p) => p.entrada);
    const entradaGnd = d.pinos.filter((p) => p.papel === "gnd")[0];
    const saidaPino = d.pinos.find((p) => p.v != null) || d.pinos.find((p) => p.id === "vout" || p.id === "outp");
    const saidaGnd = d.pinos.filter((p) => p.papel === "gnd").slice(-1)[0];
    if (!entradaPino || !saidaPino) continue;
    const vin = t === "stepup" ? 3.7 : Math.max(alvo + 2, 9);
    mirarTensao(b, entrada, vin);
    b.liga(entrada, pinoPapel(entrada, "v+"), reg, entradaPino.id);
    b.liga(entrada, pinoPapel(entrada, "gnd"), reg, entradaGnd.id);
    return { comp: reg, vp: saidaPino.id, gnd: saidaGnd.id };
  }

  // 4. ultimo recurso: a placa mesmo assim
  const placa = b.comps.find((c) => PORID[c.tipo].alimentada);
  if (!placa) {
    for (const t of candidatas) {
      const c = b.pega(t);
      mirarTensao(b, c, alvo);
      return { comp: c, vp: pinoPapel(c, "v+"), gnd: pinoPapel(c, "gnd") };
    }
    return null;
  }
  const d = PORID[placa.tipo];
  const minima = exige.minima || 0;
  const bons = d.pinos.filter((p) => p.v && p.v >= minima && p.v <= teto);
  const saida = (bons.length ? bons : d.pinos.filter((p) => p.v))
    .sort((a, c2) => Math.abs(a.v - alvo) - Math.abs(c2.v - alvo))[0];
  return { comp: placa, vp: saida && saida.id, gnd: pinoPapel(placa, "gnd") };
}

function placaDe(b) {
  return b.comps.find((c) => PORID[c.tipo].alimentada) ||
    (b.m.placa ? b.pega(b.m.placa) : null) ||
    ((b.m.componentesLiberados || []).map((t) => PORID[t]).find((d) => d && d.alimentada) &&
      b.pega((b.m.componentesLiberados || []).find((t) => PORID[t] && PORID[t].alimentada)));
}

/* Soma o consumo de tudo que ja pendura na mesma fonte. */
function consumoTotal(b) {
  return b.comps.reduce((s, c) => s + (PORID[c.tipo].correnteTipica || 0), 0);
}

function alimentar(b, comp) {
  const d = PORID[comp.tipo];
  // Peca que veio na montagem e ja tem alimentacao nao e religada: ali
  // o trabalho e achar o erro, nao pendurar fio por cima. Mas peca da
  // montagem SEM alimentacao nenhuma pode receber — esse e o conserto.
  if (comp.__daMontagem) {
    const vpp = pinoPapel(comp, "v+");
    const temV = b.fios.some((f) =>
      (f.a.comp === comp.id && f.a.pino === vpp) || (f.b.comp === comp.id && f.b.pino === vpp));
    if (temV) return;
  }
  const vp = pinoPapel(comp, "v+"), gp = pinoPapel(comp, "gnd");
  if (!vp || !gp) return;
  const leve = (d.correnteTipica || 0) <= 120;
  const placaPropria = placaDe(b);
  const nominal = d.tensaoNominal || d.alimenta || 5;
  // Carga leve pode sair da propria placa; carga pesada ou de tensao
  // diferente exige fonte separada, como na bancada real.
  const naPlaca = b.comps.filter((x) => x.__naPlaca).reduce((t, x) => t + (PORID[x.tipo].correnteTipica || 0), 0);
  if (leve && placaPropria && naPlaca + (d.correnteTipica || 0) <= (PORID[placaPropria.tipo].limiteAlim || 500)) {
    const dp = PORID[placaPropria.tipo];
    const pino = dp.pinos.filter((x) => x.v && x.v >= (d.alimenta || 0) && x.v <= (d.tensaoMax || 99))
      .sort((a, c2) => Math.abs(a.v - nominal) - Math.abs(c2.v - nominal))[0];
    if (pino) {
      b.liga(placaPropria, pino.id, comp, vp);
      b.liga(placaPropria, pinoPapel(placaPropria, "gnd"), comp, gp);
      comp.__naPlaca = true;
      return;
    }
  }
  const f = fonteDe(b, {
    minima: d.alimenta || 0,
    nominal,
    max: d.tensaoMax || 99,
    corrente: Math.max(d.correnteTipica || 0, leve ? 0 : consumoTotal(b)),
  });
  if (!f || !f.vp) return;
  b.liga(f.comp, f.vp, comp, vp);
  b.liga(f.comp, f.gnd, comp, gp);
  // Peca com mais de um pino de alimentacao quer todos ligados: o
  // ESP-01 so acorda com o CH_PD em nivel alto, e isso derruba muito
  // projeto de aluno.
  const saidas = new Set(d.saidasMotor || []);
  for (const p of d.pinos)
    if (p.papel === "v+" && p.id !== vp && !saidas.has(p.id) && !p.entrada && p.v == null)
      b.liga(f.comp, f.vp, comp, p.id);
  // GND comum com a placa: sem isso sinal nenhum vale.
  const placa = placaDe(b);
  if (placa && placa.id !== f.comp.id) b.liga(f.comp, f.gnd, placa, pinoPapel(placa, "gnd"));
}

function acenderLed(b, led, proprio = false) {
  const f = fonteDe(b, { nominal: 5, minima: 3, max: 6, corrente: 20 });
  if (!f) return;
  if (led.__aceso) return;
  led.__aceso = true;
  const r = proprio ? b.add("resistor") : b.pega("resistor");
  if (r) {
    // Resistor escolhido pela tensao da fonte: 220 em 5 V, 330 acima.
    // Resistor pela lei de Ohm, mirando 15 mA e arredondando para cima.
    const v = tensaoDe(b, f.comp);
    const ideal = (v - 2) / 0.015;
    r.valor = ["220", "330", "1k", "10k"].find((x) => (x.includes("k") ? parseFloat(x) * 1000 : +x) >= ideal) || "10k";
    b.liga(f.comp, f.vp, r, "a");
    b.liga(r, "b", led, "a");
  } else b.liga(f.comp, f.vp, led, "a");
  b.liga(led, "k", f.comp, f.gnd);
}

/* Motor de passo so gira com o driver puxando bobina para o GND. */
function acionarPasso(b) {
  const drv = b.pega("uln2003");
  const mot = b.pega("motor-passo");
  const placa = placaDe(b);
  if (!drv || !mot) return;
  alimentar(b, drv);
  b.liga(mot, "com", drv, "mc");
  ["a", "b", "c", "d"].forEach((coil, i) => b.liga(mot, coil, drv, "m" + (i + 1)));
  if (placa) {
    const d = PORID[placa.tipo];
    const livres = d.pinos.filter((p) => ["digital", "pwm"].includes(p.papel)).slice(0, 4);
    livres.forEach((p, i) => {
      b.liga(placa, p.id, drv, "in" + (i + 1));
      if (i === 0) placa.firmware = { ...(placa.firmware || {}), [p.id]: { modo: "alto" } };
    });
    b.liga(drv, "gnd", placa, pinoPapel(placa, "gnd"));
  }
}

function pinoLivreCom(b, placa, papel, usados) {
  const d = PORID[placa.tipo];
  const alvo = d.pinos.filter((p) =>
    (p.papel === papel || (p.extras || []).includes(papel)) && !usados.has(p.id));
  if (alvo.length) { usados.add(alvo[0].id); return alvo[0].id; }
  const qualquer = d.pinos.filter((p) => ["digital", "pwm"].includes(p.papel) && !usados.has(p.id));
  if (qualquer.length) { usados.add(qualquer[0].id); return qualquer[0].id; }
  return null;
}

/* ---------- montagem guiada pelas regras ---------- */

function montar(missao) {
  const b = new Bancada(missao);
  iniciarMissao(missao);
  const usados = new Set();

  // 1. tudo que a missao cita precisa existir
  const cita = new Set();
  for (const o of missao.objetivos || []) {
    const r = o.regra;
    if (r.componente) cita.add(r.componente);
    for (const k of ["a", "b"]) {
      if (r[k] && r[k].componente) cita.add(r[k].componente);
      else if (r.tipo === "emSerie" && typeof r[k] === "string") cita.add(r[k]);
    }
  }
  for (const t of cita) {
    const n = Math.max(1, ...(missao.objetivos || [])
      .filter((o) => o.regra.componente === t).map((o) => o.regra.n || 1));
    while (b.todos(t).length < n) b.add(t);
  }
  const placa = placaDe(b);

  // 2. energia de tudo que precisa acordar. Peca que ja veio na
  //    montagem da missao fica como esta: ali o trabalho e consertar,
  //    nao religar por cima.
  const jaLigado = new Set();
  for (const f of b.fios) { jaLigado.add(f.a.comp); jaLigado.add(f.b.comp); }
  // Peca citada num mesmoNo tem caminho proprio definido pela missao:
  // alimentar por fora antes da hora criava ligacao concorrente.
  const comRegra = new Set();
  for (const o of missao.objetivos || [])
    for (const k of ["a", "b"])
      if (o.regra[k] && o.regra[k].componente) comRegra.add(o.regra[k].componente);
  for (const c of b.comps) {
    const d = PORID[c.tipo];
    if (d.alimenta !== undefined && !jaLigado.has(c.id) && !comRegra.has(c.tipo)) alimentar(b, c);
  }

  // 3. objetivo por objetivo
  const aplicarRegra = (r) => {
    if (r.tipo === "mesmoNo") {
      const alvo = (lado) => {
        const c = b.achar(lado.componente) || b.add(lado.componente);
        const pino = lado.pino || pinoPapel(c, lado.papel) ||
          (PORID[c.tipo].pinos.find((p) => p.n === lado.nome) || {}).id;
        return [c, pino];
      };
      const [ca, pa] = alvo(r.a), [cb, pb] = alvo(r.b);
      // Fonte ligada direto numa carga precisa mirar a tensao dela.
      for (const [fonte, carga] of [[ca, cb], [cb, ca]]) {
        const df = PORID[fonte.tipo], dc = PORID[carga.tipo];
        if ((df.fonte || df.regulador) && dc.alimenta !== undefined)
          mirarTensao(b, fonte, dc.tensaoNominal || dc.alimenta || 5, dc.tensaoMax || 99);
      }
      if (pa && pb) b.liga(ca, pa, cb, pb);
    } else if (r.tipo === "emSerie") {
      const ca = b.pega(r.a), cb = b.pega(r.b);
      const pa = PORID[ca.tipo].pinos, pb = PORID[cb.tipo].pinos;
      b.liga(ca, pa[1].id, cb, pb[0].id);
      const f = fonteDe(b);
      if (f) { b.liga(f.comp, f.vp, ca, pa[0].id); b.liga(cb, pb[1].id, f.comp, f.gnd); }
    } else if (r.tipo === "aceso") {
      // Cada LED com o proprio resistor: dividir um resistor entre
      // varios LEDs e o que faz ele fritar.
      for (const led of b.todos(r.componente).slice(0, r.n || 1)) acenderLed(b, led, true);
    } else if (r.tipo === "ligado") {
      if (r.componente === "motor-passo") { acionarPasso(b); return; }
      const dAlvo = PORID[r.componente];
      // Carga do outro lado de um rele: o caminho passa pelo contato,
      // entao a fonte entra no COM e o retorno fecha no GND dela.
      const rele = b.comps.find((c) => PORID[c.tipo].contatos);
      if (rele && dAlvo && dAlvo.bipolar) {
        const carga = b.pega(r.componente);
        const ligadoNoContato = b.fios.some((f) =>
          (f.a.comp === rele.id && ["no", "nc"].includes(f.a.pino) && f.b.comp === carga.id) ||
          (f.b.comp === rele.id && ["no", "nc"].includes(f.b.pino) && f.a.comp === carga.id));
        if (ligadoNoContato) {
          const f2 = fonteDe(b, { nominal: dAlvo.tensaoNominal || 9, minima: dAlvo.alimenta || 0,
            max: dAlvo.tensaoMax || 99, corrente: dAlvo.correnteTipica || 0 });
          if (f2) {
            mirarTensao(b, f2.comp, dAlvo.tensaoNominal || dAlvo.alimenta || 9, dAlvo.tensaoMax || 99);
            b.liga(f2.comp, f2.vp, rele, "com");
            const outro = PORID[carga.tipo].pinos.find((p) => p.papel === "gnd");
            if (outro) b.liga(carga, outro.id, f2.comp, f2.gnd);
          }
          return;
        }
      }
      for (const c of b.todos(r.componente).slice(0, r.n || 1)) alimentar(b, c);
    } else if (r.tipo === "pinoEm") {
      const c = b.pega(r.componente);
      if (placa) {
        const pino = pinoLivreCom(b, placa, r.papelAlvo, usados);
        if (pino) b.liga(c, r.pino, placa, pino);
      }
    } else if (r.tipo === "firmware") {
      const p = b.pega(r.componente);
      const d = PORID[p.tipo];
      const alvo = d.pinos.find((x) => (r.modo === "pwm" ? x.papel === "pwm" : ["digital", "pwm"].includes(x.papel)));
      if (alvo) p.firmware = { ...(p.firmware || {}), [alvo.id]: { modo: r.modo, duty: 160 } };
    } else if (r.tipo === "scriptAtivo") {
      const p = b.pega(r.componente);
      aplicar(p, acharScript(r.script));
    } else if (r.tipo === "botaoUsado") {
      sessao.botoes.add(`${r.componente}:${r.botao}`);
    } else if (r.tipo === "corDoLed") {
      sessao.cores.add(r.cor);
    } else if (r.tipo === "usouFerramenta") {
      sessao.ferramentas.add(r.modo || r.ferramenta);
      sessao.ferramentas.add("multimetro");
    } else if (r.tipo === "trimpotEntre") {
      for (const c of b.todos(r.componente)) c.trimpot = Math.round(((r.min ?? 0) + (r.max ?? 100)) / 2);
    } else if (r.tipo === "semRompidos") {
      const rompidos = b.fios.filter((f) => f.rompido);
      b.fios = b.fios.filter((f) => !f.rompido);
      for (const f of rompidos) b.fios.push({ ...f, id: "n" + novo(), rompido: false });
    } else if (r.tipo === "encaixado") {
      const c = b.pega(r.componente);
      // Cabo precisa de DUAS pontas ocupadas: garante que existam duas
      // pecas com o conector certo na bancada.
      for (const t of b.m.componentesLiberados || []) {
        const dd = PORID[t];
        if (dd && (dd.encaixes || dd.encaixe) && !b.achar(t)) b.add(t);
      }
      const d = PORID[c.tipo];
      const alvos = b.comps.filter((h) => h.id !== c.id && (PORID[h.tipo].encaixes || PORID[h.tipo].encaixe));
      const pontas = d.pontasEncaixe || [{ id: "corpo", tipo: d.encaixavel || c.tipo }];
      for (const pt of pontas) {
        for (const h of alvos) {
          const slots = PORID[h.tipo].encaixes || [PORID[h.tipo].encaixe];
          const slot = slots.find((s) => s.tipo === pt.tipo && !b.midia.some((l) => l.host === h.id && l.slot === s.tipo));
          if (!slot) continue;
          if (b.midia.some((l) => l.cabo === c.id && l.ponta === pt.id)) continue;
          b.midia.push({ cabo: c.id, ponta: pt.id, host: h.id, slot: slot.tipo });
          break;
        }
      }
    } else if (r.tipo === "correnteEm") {
      const c = b.pega(r.componente);
      if (c.tipo === "led") {
        const res = b.todos("resistor")[0] || b.add("resistor");
        res.valor = "220";
        acenderLed(b, c);
      }
    } else if (r.tipo === "tensaoEm") {
      const c = b.pega(r.componente);
      const d = PORID[c.tipo];
      const alvoPino = d.pinos.find((x) => x.id === r.pino);
      if (alvoPino && alvoPino.entrada) {
        const meio = ((r.min ?? 7) + Math.min(r.max ?? 12, 12)) / 2;
        const f = fonteDe(b, { nominal: meio, minima: r.min ?? 0, max: r.max ?? 99, corrente: 200 });
        if (f) {
          mirarTensao(b, f.comp, meio);
          b.liga(f.comp, f.vp, c, r.pino);
          const gndEntrada = d.pinos.filter((x) => x.papel === "gnd")[0];
          if (gndEntrada) b.liga(f.comp, f.gnd, c, gndEntrada.id);
        }
      }
      const meio = ((r.min ?? 0) + (r.max ?? 12)) / 2;
      mirarTensao(b, c, meio, r.max ?? 99);
    }
  };

  // Varias passadas, mas objetivo ja fechado nao e refeito: refazer
  // criava caminho paralelo e fritava o resistor da primeira montagem.
  for (let volta = 0; volta < 3; volta++) {
    for (const o of missao.objetivos || []) {
      // Confere na hora: usar um retrato do inicio da volta fazia a
      // regra achar que ainda faltava algo e montar caminho paralelo.
      if (o.regra.tipo !== "semCriticos" && verificar(o.regra, b.comps, b.circuito(true))) continue;
      aplicarRegra(o.regra);
    }
  }

  // Cadeia de reguladores: se a saida de um regulador esta em uso mas a
  // entrada dele esta solta, ele nao gera nada. Alimentar a entrada e o
  // passo que o aluno esquece e o professor cobra.
  for (let volta = 0; volta < 2; volta++) {
    for (const c of b.comps) {
      const d = PORID[c.tipo];
      if (!d.regulador || c.__daMontagem) continue;
      const entrada = d.pinos.find((p) => p.entrada);
      if (!entrada) continue;
      const jaTem = b.fios.some((f) =>
        (f.a.comp === c.id && f.a.pino === entrada.id) || (f.b.comp === c.id && f.b.pino === entrada.id));
      if (jaTem) continue;
      const alvo = ((entrada.vmin || 5) + Math.min(entrada.vmax || 12, 12)) / 2;
      const f = fonteDe(b, { nominal: alvo, minima: entrada.vmin || 0, max: entrada.vmax || 99, corrente: 300 });
      if (!f || f.comp.id === c.id) continue;
      b.liga(f.comp, f.vp, c, entrada.id);
      const gndEntrada = d.pinos.filter((p) => p.papel === "gnd")[0];
      if (gndEntrada) b.liga(f.comp, f.gnd, c, gndEntrada.id);
    }
  }

  // Fechar retornos: peca alimentada por uma regra pode ter ficado sem
  // GND, e sem retorno a corrente nao anda. Esse passo e o equivalente
  // ao "confere o terra" que todo tecnico faz no fim.
  for (const c of b.comps) {
    const d = PORID[c.tipo];
    if (d.alimenta === undefined) continue;
    const gp = pinoPapel(c, "gnd"), vp = pinoPapel(c, "v+");
    if (!gp || !vp) continue;
    const temFioGnd = b.fios.some((f) =>
      (f.a.comp === c.id && f.a.pino === gp) || (f.b.comp === c.id && f.b.pino === gp));
    const temFioV = b.fios.some((f) =>
      (f.a.comp === c.id && f.a.pino === vp) || (f.b.comp === c.id && f.b.pino === vp));
    if (temFioGnd || !temFioV) continue;
    const circ = b.circuito(true);
    if (circ.gndDe(c.id, gp)) continue;
    // procura de onde veio a alimentacao e usa o GND da mesma fonte
    const noAlim = circ.noDe(c.id, vp);
    const vizinhos = (circ.pinosDoNo.get(noAlim) || []).filter((it) => it.comp.id !== c.id);
    const fonte = vizinhos.map((it) => it.comp).find((x) => {
      const dx = PORID[x.tipo];
      return dx.fonte || dx.regulador || dx.alimentada;
    }) || b.comps.find((x) => PORID[x.tipo].fonte) || placaDe(b);
    if (fonte) b.liga(fonte, pinoPapel(fonte, "gnd"), c, gp);
  }

  // Conserto de polaridade: so em missao de manutencao, e so em peca
  // de DOIS pinos. Aplicar isso numa peca de tres fios trocava o sinal
  // do servo com a alimentacao dele.
  for (const o of (missao.tipo === "manutencao" ? missao.objetivos || [] : [])) {
    if (o.regra.tipo !== "ligado") continue;
    const circ = b.circuito(true);
    const alvo = b.todos(o.regra.componente)[0];
    if (!alvo || (circ.estados.get(alvo.id) || {}).ligado) continue;
    if (PORID[alvo.tipo].pinos.length !== 2) continue;
    const meus = b.fios.filter((f) => f.a.comp === alvo.id || f.b.comp === alvo.id);
    if (meus.length !== 2) continue;
    const lado = (f) => (f.a.comp === alvo.id ? "a" : "b");
    const p0 = meus[0][lado(meus[0])].pino, p1 = meus[1][lado(meus[1])].pino;
    meus[0][lado(meus[0])].pino = p1;
    meus[1][lado(meus[1])].pino = p0;
  }

  return b;
}

/* ---------- execucao ---------- */

/* Modo detalhe: node ferramentas/verificar-missoes.mjs nome-da-missao */
const soEsta = process.argv[2];

let quebradas = 0;
console.log("MISSAO".padEnd(26), "PLACA".padEnd(10), "RESULTADO");
console.log("-".repeat(96));

for (const e of entradas) {
  if (soEsta && e.id !== soEsta) continue;
  const missao = JSON.parse(fs.readFileSync(RAIZ + e.arquivo));
  let b, falta = [], erro = null;
  try {
    b = montar(missao);
    const circ = b.circuito(true);
    falta = (missao.objetivos || []).filter((o) => !verificar(o.regra, b.comps, circ)).map((o) => o.id);
  } catch (ex) { erro = ex.message; }

  if (erro) { quebradas++; console.log(missao.id.padEnd(26), (missao.placa || "gaburino").padEnd(10), "ERRO: " + erro); continue; }
  if (falta.length) {
    quebradas++;
    const circ = b.circuito(true);
    const criticos = circ.diagnosticos.filter((d) => d.nivel === "critico").map((d) => d.txt.slice(0, 70));
    console.log(missao.id.padEnd(26), (missao.placa || "gaburino").padEnd(10), "FALTA: " + falta.join(", "));
    if (criticos.length) console.log(" ".repeat(38) + "critico: " + criticos[0]);
  } else console.log(missao.id.padEnd(26), (missao.placa || "gaburino").padEnd(10), "completavel");

  if (soEsta) {
    const circ = b.circuito(true);
    console.log("\n  pecas:", b.comps.map((c) => `${c.id}:${c.tipo}` +
      (c.slots ? `(${c.slots} slots)` : "") + (c.tensaoSaida ? `(${c.tensaoSaida}V)` : "") +
      (c.trimpot !== undefined ? `(trim ${c.trimpot})` : "")).join("  "));
    console.log("  fios:", b.fios.map((f) => `${f.a.comp}.${f.a.pino}->${f.b.comp}.${f.b.pino}`).join("  "));
    console.log("  estados:", b.comps.map((c) => {
      const st = circ.estados.get(c.id) || {};
      return `${c.tipo}=${st.ligado ? "ligado" : st.aceso ? "aceso" : "off"}`;
    }).join("  "));
    console.log("  objetivos:");
    for (const o of missao.objetivos || [])
      console.log("   ", (verificar(o.regra, b.comps, circ) ? "ok  " : "NAO ") + o.id.padEnd(14), JSON.stringify(o.regra).slice(0, 90));
    circ.diagnosticos.forEach((d) => console.log("   ", d.nivel, "|", d.txt.slice(0, 90)));
  }
}

console.log("\nmissoes que o montador nao fechou:", quebradas, "de", entradas.length);
