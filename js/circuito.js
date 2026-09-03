/* ============================================================
   CIRCUITO — motor eletrico (Fase 2).

   Como funciona, em quatro passos:

   1. NOS. Junta tudo o que esta eletricamente no mesmo ponto:
      fileiras da protoboard, ligacoes internas, fios.
   2. TENSAO. Aplica as fontes. Alem das baterias, agora os pinos da
      placa tambem viram fonte quando o aluno configura o firmware
      de teste: pino em nivel alto vira fonte na tensao logica.
   3. CORRENTE. Monta um grafo onde os NOS sao os pontos e os
      componentes de dois terminais sao os caminhos. Percorre cada
      caminho da fonte ate o GND e aplica a lei de Ohm. Isso da uma
      corrente boa o bastante para ensinar, sem virar simulador de
      engenharia.
   4. DIAGNOSTICO. Compara cada corrente e cada tensao com o limite
      da peca. Quem passou do limite entra na lista de danos.

   O que ele NAO faz: analise nodal completa, transistor como
   amplificador, corrente alternada. Nao precisa: o objetivo e o
   aluno entender caminho de corrente, nao projetar fonte chaveada.
   ============================================================ */

import { PORID } from "./biblioteca.js";

const chave = (c, p) => `${c}#${p}`;
const LIMITE_CAMINHOS = 240;
const CORRENTE_TETO = 3000; // mA: acima disso e curto, nao ha nuance

class Uniao {
  constructor() { this.pai = new Map(); }
  achar(a) {
    if (!this.pai.has(a)) this.pai.set(a, a);
    let r = a;
    while (this.pai.get(r) !== r) r = this.pai.get(r);
    while (this.pai.get(a) !== r) { const n = this.pai.get(a); this.pai.set(a, r); a = n; }
    return r;
  }
  juntar(a, b) { const ra = this.achar(a), rb = this.achar(b); if (ra !== rb) this.pai.set(ra, rb); }
}

/* Le "220", "1k", "10k" e devolve ohms */
export function ohms(valor) {
  if (!valor) return 220;
  const t = String(valor).toLowerCase().trim();
  const n = parseFloat(t);
  if (t.includes("m")) return n * 1e6;
  if (t.includes("k")) return n * 1000;
  return n;
}

/* ============================================================ */

export function calcular(comps, fios, energizado = true) {
  const u = new Uniao();

  /* ---- 1. nos ---- */
  for (const c of comps) {
    const d = PORID[c.tipo];
    if (!d) continue;
    const porNo = new Map();
    for (const p of d.pinos) {
      u.achar(chave(c.id, p.id));
      if (p.no) {
        if (!porNo.has(p.no)) porNo.set(p.no, []);
        porNo.get(p.no).push(p.id);
      }
    }
    for (const lista of porNo.values())
      for (let i = 1; i < lista.length; i++) u.juntar(chave(c.id, lista[0]), chave(c.id, lista[i]));
    if (c.queimado) continue; // peca queimada deixa de conduzir
    (d.ligacoes || []).forEach(([a, b]) => u.juntar(chave(c.id, a), chave(c.id, b)));
    if (c.pressionado) (d.ligacoesFechado || []).forEach(([a, b]) => u.juntar(chave(c.id, a), chave(c.id, b)));
  }
  for (const f of fios) {
    if (f.rompido) continue;
    u.juntar(chave(f.a.comp, f.a.pino), chave(f.b.comp, f.b.pino));
  }

  const no = (cid, pid) => u.achar(chave(cid, pid));

  /* ---- 2. tensao ---- */
  const pinosDoNo = new Map();
  for (const c of comps) {
    const d = PORID[c.tipo];
    if (!d) continue;
    for (const p of d.pinos) {
      const r = no(c.id, p.id);
      if (!pinosDoNo.has(r)) pinosDoNo.set(r, []);
      pinosDoNo.get(r).push({ comp: c, def: d, pino: p });
    }
  }

  const tensao = new Map();
  const terra = new Set();
  const fontesDoNo = new Map();
  // Uma placa so vira fonte se estiver realmente alimentada: pelo USB
  // (o aluno escolhe isso clicando nela) ou pelo VIN, com tensao
  // suficiente vinda de fora. E assim na bancada real.
  const porUsb = (c, d) => d.alimentada === true && d.usb && c.usbLigado !== false;
  const ativa = (c, d) => !c.queimado && (d.fonte === true || porUsb(c, d) || c.__vinOk === true);

  const registrarFonte = (r, comp, def, pino, v, limite, duty = 1) => {
    tensao.set(r, Math.max(tensao.get(r) ?? 0, v));
    if (!fontesDoNo.has(r)) fontesDoNo.set(r, []);
    fontesDoNo.get(r).push({ comp, def, pino, v, limite, duty });
  };

  // Bancada desenergizada nao tem fonte nenhuma: nada acende, nada
  // queima, e o aluno pode montar em paz antes de ligar a chave.
  const registrarPlacaEFontes = () => {
  for (const c of energizado ? comps : []) {
    const d = PORID[c.tipo];
    if (!d || !ativa(c, d)) continue;
    const fw = c.firmware || {};
    for (const p of d.pinos) {
      const r = no(c.id, p.id);
      if ((c.pinosQueimados || []).includes(p.id)) continue;

      if (p.papel === "gnd") { terra.add(r); continue; }

      const vFixa = p.id === "vout" && c.tensaoSaida ? c.tensaoSaida : p.v;
      if (vFixa != null) { registrarFonte(r, c, d, p, vFixa, d.limiteAlim ?? 3000); continue; }

      const est = fw[p.id];
      if (!est || !d.tensaoLogica) continue;
      if (est.modo === "alto") registrarFonte(r, c, d, p, d.tensaoLogica, d.limitePino ?? 40);
      else if (est.modo === "baixo") terra.add(r);
      else if (est.modo === "pwm") {
        const duty = Math.max(0, Math.min(255, est.duty ?? 128)) / 255;
        registrarFonte(r, c, d, p, d.tensaoLogica, d.limitePino ?? 40, duty);
      }
    }
  }
  };

  comps.forEach((c) => { delete c.__vinOk; });
  registrarPlacaEFontes();
  if (energizado) {
    let mudou = false;
    for (const c of comps) {
      const d = PORID[c.tipo];
      if (!d || !d.alimentada || porUsb(c, d) || c.__vinOk) continue;
      const vin = d.pinos.find((p) => p.n === "VIN");
      const cinco = d.pinos.find((p) => p.n === "5V" && p.v);
      const vVin = vin ? tensao.get(no(c.id, vin.id)) ?? 0 : 0;
      const vCinco = cinco ? tensao.get(no(c.id, cinco.id)) ?? 0 : 0;
      if (vVin >= (d.vinMin ?? 5) || vCinco >= 4.5) { c.__vinOk = true; mudou = true; }
    }
    if (mudou) { tensao.clear(); terra.clear(); fontesDoNo.clear(); registrarPlacaEFontes(); }
  }

  /* ---- 3. corrente ---- */
  const arestas = [];
  const addAresta = (comp, def, pa, pb, dados) => {
    const na = no(comp.id, pa), nb = no(comp.id, pb);
    if (na === nb) return;
    arestas.push({ comp, def, na, nb, ...dados });
  };

  for (const c of comps) {
    const d = PORID[c.tipo];
    if (!d || c.queimado) continue;
    if (d.id === "resistor") addAresta(c, d, "a", "b", { r: ohms(c.valor), tipo: "resistor" });
    else if (d.id === "ldr") addAresta(c, d, "a", "b", { r: c.luz === "escuro" ? 200000 : 2000, tipo: "ldr" });
    else if (d.id === "potenciometro") {
      const rt = 10000, pos = (c.giro ?? 50) / 100;
      addAresta(c, d, "a", "w", { r: Math.max(1, rt * pos), tipo: "pot" });
      addAresta(c, d, "w", "b", { r: Math.max(1, rt * (1 - pos)), tipo: "pot" });
    }
    else if (d.arte === "led") {
      const vari = (d.variantes || []).find((x) => x.nome === c.variante) || (d.variantes || [])[0];
      addAresta(c, d, "a", "k", { r: 1, vf: vari ? vari.vf : 2, tipo: "led", anodo: "a" });
    }
    else if (d.id === "diodo") addAresta(c, d, "a", "k", { r: 1, vf: 0.7, tipo: "diodo", anodo: "a" });
  }

  const vizinhos = new Map();
  arestas.forEach((a, i) => {
    if (!vizinhos.has(a.na)) vizinhos.set(a.na, []);
    if (!vizinhos.has(a.nb)) vizinhos.set(a.nb, []);
    vizinhos.get(a.na).push({ i, para: a.nb });
    vizinhos.get(a.nb).push({ i, para: a.na });
  });

  const correnteAresta = new Array(arestas.length).fill(0);
  const correnteFonte = new Map();
  const curtos = [];

  for (const [r, lista] of fontesDoNo) {
    if (terra.has(r) && (tensao.get(r) ?? 0) > 0) {
      lista.forEach((f) => {
        curtos.push({ comp: f.comp.id, pino: f.pino.id, v: f.v });
        correnteFonte.set(chave(f.comp.id, f.pino.id), CORRENTE_TETO);
      });
    }
  }

  let passos = 0;
  for (const [rFonte, lista] of fontesDoNo) {
    if (terra.has(rFonte)) continue;
    const v = tensao.get(rFonte) ?? 0;
    if (v <= 0) continue;

    const caminhos = [];
    const usadas = new Set();
    const trilha = [];

    const andar = (atual, somaR, somaVf) => {
      if (passos++ > LIMITE_CAMINHOS * 8 || caminhos.length >= LIMITE_CAMINHOS) return;
      if (terra.has(atual) && trilha.length) { caminhos.push({ somaR, somaVf, trilha: [...trilha] }); return; }
      for (const viz of vizinhos.get(atual) || []) {
        if (usadas.has(viz.i)) continue;
        const a = arestas[viz.i];
        if (a.anodo && atual !== no(a.comp.id, a.anodo)) continue; // diodo so conduz num sentido
        usadas.add(viz.i);
        trilha.push(viz.i);
        andar(viz.para, somaR + (a.r || 0), somaVf + (a.vf || 0));
        trilha.pop();
        usadas.delete(viz.i);
      }
    };
    andar(rFonte, 0, 0);

    const duty = Math.min(...lista.map((f) => f.duty ?? 1));
    let totalFonte = 0;
    for (const cam of caminhos) {
      const sobra = v - cam.somaVf;
      if (sobra <= 0) continue;
      const i = Math.min(CORRENTE_TETO, (sobra / Math.max(cam.somaR, 0.5)) * 1000) * duty;
      totalFonte += i;
      cam.trilha.forEach((idx) => { correnteAresta[idx] += i; });
    }
    lista.forEach((f) => {
      const k = chave(f.comp.id, f.pino.id);
      correnteFonte.set(k, (correnteFonte.get(k) || 0) + totalFonte);
    });
  }

  /* ---- 3b. consumo dos modulos ----
     Modulo nao e componente de dois terminais, entao ele nao aparece
     no grafo de caminhos. Mas o consumo dele conta para o limite do
     pino que o alimenta: e assim que "servo pendurado no 5V da placa"
     vira um erro visivel, e nao um detalhe invisivel. */
  for (const c of comps) {
    const d = PORID[c.tipo];
    if (!d || c.queimado || !d.correnteTipica || d.alimenta === undefined) continue;
    const vplus = d.pinos.find((p) => p.papel === "v+");
    const gp = d.pinos.find((p) => p.papel === "gnd");
    if (!vplus || !gp) continue;
    const rv = no(c.id, vplus.id);
    const ligado = (tensao.get(rv) ?? 0) >= (d.alimenta || 0) && terra.has(no(c.id, gp.id));
    if (!ligado) continue;
    for (const f of fontesDoNo.get(rv) || []) {
      const k = chave(f.comp.id, f.pino.id);
      correnteFonte.set(k, (correnteFonte.get(k) || 0) + d.correnteTipica);
    }
  }

  /* ---- 4. estados e diagnostico ---- */
  const estados = new Map();
  const diag = [];
  const avisar = (nivel, comp, txt, dano) => diag.push({ nivel, comp, txt, dano });

  const vDe = (cid, pid) => tensao.get(no(cid, pid)) ?? 0;
  const gndDe = (cid, pid) => terra.has(no(cid, pid));
  const indiceAresta = (cid) => arestas.findIndex((a) => a.comp.id === cid);

  for (const cur of curtos) {
    const alvo = comps.find((c) => c.id === cur.comp);
    const d = alvo ? PORID[alvo.tipo] : null;
    avisar("critico", cur.comp,
      `Curto-circuito: ${cur.v} volts caindo direto no GND${d ? " pela " + d.nome : ""}. Sem carga no meio, a corrente dispara e alguma coisa vira fumaca.`,
      { tipo: "curto" });
  }

  for (const c of comps) {
    const d = PORID[c.tipo];
    if (!d) continue;
    const e = { ligado: false, aceso: false, corrente: 0, queimado: !!c.queimado };
    if (c.queimado) { estados.set(c.id, e); continue; }

    if (ativa(c, d)) e.ligado = true;
    else if (d.alimenta !== undefined) {
      const vplus = d.pinos.find((p) => p.papel === "v+");
      const gp = d.pinos.find((p) => p.papel === "gnd");
      const v = vplus ? vDe(c.id, vplus.id) : 0;
      const g = gp ? gndDe(c.id, gp.id) : false;
      e.ligado = v >= (d.alimenta || 0) && g;
      e.tensaoRecebida = v;
      if (v > 0 && !g) avisar("aviso", c.id, `${d.nome} recebeu tensao mas o GND nao esta ligado. Corrente e ida e volta: sem retorno, ela nao sai de casa.`);
      if (g && v > 0 && v < (d.alimenta || 0)) avisar("aviso", c.id, `${d.nome} esta recebendo so ${v.toFixed(1)} volts e precisa de pelo menos ${d.alimenta}.`);
      if (e.ligado && d.correnteTipica) e.corrente = d.correnteTipica;
    }

    if (d.arte === "led") {
      const idx = indiceAresta(c.id);
      const i = idx >= 0 ? correnteAresta[idx] : 0;
      e.corrente = i;
      e.aceso = i > 0.6;
      e.brilho = Math.max(0.2, Math.min(1, i / 20));
      if (i > (d.correnteMax || 40))
        avisar("critico", c.id, `${i.toFixed(0)} miliamperes atravessando um LED que aguenta ${d.correnteMax}. Faltou resistor, e agora falta LED.`, { tipo: "queima" });
    }

    if (d.id === "resistor") {
      const idx = indiceAresta(c.id);
      const i = (idx >= 0 ? correnteAresta[idx] : 0) / 1000;
      e.corrente = i * 1000;
      e.potencia = i * i * ohms(c.valor);
      if (e.potencia > (d.potenciaMax || 0.25))
        avisar("critico", c.id, `Esse resistor esta dissipando ${e.potencia.toFixed(2)} watt e aguenta ${d.potenciaMax}. Ele escurece, cheira mal e abre.`, { tipo: "queima" });
    }

    if (d.id === "capacitor-eletro" && d.polarizado) {
      if (vDe(c.id, "n") > vDe(c.id, "p") + 0.5)
        avisar("critico", c.id, "Capacitor eletrolitico ligado ao contrario. Ele nao avisa: ele estoura.", { tipo: "queima" });
    }

    if (d.alimentada) {
      let total = 0;
      for (const p of d.pinos) {
        const i = correnteFonte.get(chave(c.id, p.id)) || 0;
        total += i;
        const limite = p.v != null ? (d.limiteAlim ?? 500) : (d.limitePino ?? 40);
        if (i > limite)
          avisar("critico", c.id,
            `O pino ${p.n} da ${d.nome} esta entregando ${i.toFixed(0)} miliamperes e o limite dele e ${limite}. Carga pesada pede alimentacao externa.`,
            { tipo: "pino", pino: p.id });
        const v = vDe(c.id, p.id);
        if (d.tensaoMaxPino && p.v == null && v > d.tensaoMaxPino + 0.05)
          avisar("critico", c.id,
            `Chegou ${v.toFixed(1)} volts no pino ${p.n} de uma placa de ${d.tensaoLogica} volts. Isso mata a entrada: use divisor de tensao ou conversor de nivel.`,
            { tipo: "pino", pino: p.id });
      }
      e.correnteTotal = total;
      if (total > (d.limiteTotal ?? 800))
        avisar("critico", c.id, `A ${d.nome} inteira esta puxando ${total.toFixed(0)} miliamperes. O regulador dela desiste antes disso.`, { tipo: "placa" });
    }

    if (d.precisaPwm && e.ligado) {
      const sp = d.pinos.find((p) => p.papel === "pwm");
      const lista = sp ? pinosDoNo.get(no(c.id, sp.id)) || [] : [];
      if (lista.length > 1 && !lista.some((it) => it.pino.papel === "pwm" && it.comp.id !== c.id))
        avisar("aviso", c.id, `O fio de sinal do ${d.nome} nao chegou num pino PWM. Procure o til (~) ou um GPIO com PWM.`);
    }

    // GND comum: o sinal da placa precisa de referencia. E o erro que
    // mais faz servo tremer e sensor ler lixo, e o mais dificil de ver.
    if (!d.alimentada && !d.fonte) {
      const gp = d.pinos.find((p) => p.papel === "gnd");
      const sinais = d.pinos.filter((p) => ["pwm", "digital", "sinal", "analog", "i2c", "spi"].includes(p.papel));
      if (gp && sinais.length) {
        for (const sp of sinais) {
          const lista = pinosDoNo.get(no(c.id, sp.id)) || [];
          const placa = lista.find((it) => it.def.alimentada && it.comp.id !== c.id);
          if (!placa) continue;
          const gndsDaPlaca = placa.def.pinos.filter((p) => p.papel === "gnd").map((p) => no(placa.comp.id, p.id));
          if (!gndsDaPlaca.includes(no(c.id, gp.id))) {
            avisar("aviso", c.id, `O sinal do ${d.nome} chegou na ${placa.def.nome}, mas os dois nao compartilham o mesmo GND. Sem referencia comum o sinal nao significa nada: ligue o GND da alimentacao externa ao GND da placa.`);
          }
          break;
        }
      }
    }

    estados.set(c.id, e);
  }

  return {
    estados,
    diagnosticos: diag,
    avisos: diag.filter((x) => x.nivel !== "info"),
    tensao, terra, noDe: no, vDe, gndDe, pinosDoNo,
    correnteFonte, correnteAresta, arestas,
    curto: curtos.length > 0,
  };
}
