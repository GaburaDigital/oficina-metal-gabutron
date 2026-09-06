/* ============================================================
   APP — o fio que costura os modulos.
   Nenhuma regra de eletronica mora aqui: este arquivo liga botao em
   funcao, cuida do cronometro, decide o que o GabuTRON comenta e
   arbitra a missao em andamento.
   ============================================================ */

import { ajustes, carregarAjustes, lerBancada, lerProgresso, lerMuseu, patenteDe } from "./config.js";
import { destravarAudio, SOM } from "./som.js";
import { ico, selo } from "./icones.js";
import { PORID } from "./biblioteca.js";
import { miniatura } from "./desenhos.js";
import * as boot from "./boot.js";
import * as bancada from "./bancada.js";
import * as gavetas from "./gavetas.js";
import * as robo from "./gabutron.js";
import * as ajustesUI from "./ajustes.js";
import * as projeto from "./projeto.js";
import * as missoes from "./missoes.js";
import * as firmware from "./firmware.js";
import * as museu from "./museu.js";
import { NOME_CONTATO } from "./biblioteca.js";
import * as danos from "./danos.js";
import * as multimetro from "./multimetro.js";
import * as solda from "./solda.js";
import * as fonteBancada from "./fonte-bancada.js";
import { carregarCatalogo, textoDe } from "./conteudo.js";
import { registrarPwa, prepararInstalacao } from "./pwa.js";

const q = (s) => document.querySelector(s);
let compSelecionado = null;
let restam = 0, cronometro = null;
let modo = "livre";
let treinoEmCurso = false;

/* ---------- partida ------------------------------------------- */

carregarAjustes();
q("#marca-selo").innerHTML = selo(26);
q("#icone-repo").innerHTML = ico("github", 14);
preencherIcones();

boot.tocar(async () => {
  destravarAudio();
  iniciarInterface();
  await carregarCatalogo();
  const salvo = lerBancada();
  if (salvo && salvo.comps && salvo.comps.length && ajustes.autoSalvar) {
    bancada.carregar(salvo);
    robo.dizer("Achei sua bancada de ontem do jeito que voce largou. Nao mexi em nada. Quase nada.", { expressao: "satisfeito" });
  } else {
    robo.dizer(robo.aleatoria(robo.FALAS.boasVindas), { expressao: "neutro" });
  }
});

function preencherIcones() {
  const par = {
    "#b-ajustes": "ajustes", "#b-instalar": "salvar", "#b-girar": "girar",
    "#b-png": "imagem", "#b-json": "exportar", "#b-abrir": "importar",
    "#b-mais": "mais", "#b-menos": "menos", "#b-enquadrar": "enquadrar",
    "#lixeira": "lixo", "#b-museu": "lixo",
  };
  Object.entries(par).forEach(([sel, nome]) => {
    const el = q(sel);
    if (el) el.innerHTML = ico(nome, sel === "#lixeira" ? 22 : 16) + (sel === "#lixeira" ? "<span>lixeira</span>" : "");
  });
  const f = q("#b-falar .ico");
  if (f) f.innerHTML = ico("falar", 16);
}

/* ---------- interface ----------------------------------------- */

function iniciarInterface() {
  robo.iniciar(q("#retrato"), q("#fala"));

  bancada.iniciar(q("#bancada"), {
    aoSelecionar: aoSelecionarComponente,
    aoRecusar: (motivo) => robo.dizer(motivo, { expressao: "alarmado" }),
    aoInspecionarPino: (comp, pino) => {
      const d = PORID[comp.tipo];
      robo.dizer(`${d.nome}, pino ${pino.n || pino.id}. ${explicarPapel(pino)}`, { expressao: "pensando", falar: false });
    },
    aoEnergizar,
    aoMudar: aoMudarBancada,
    aoSelecionarFio: (f) => {
      q("#dica").textContent = f
        ? `Fio selecionado. Delete remove. Botao direito tambem.`
        : "Arraste uma peca da paleta. Passe o mouse num pino para ver o que ele e.";
    },
    aoEncaixar: (comp, n) => {
      robo.dizer(`${PORID[comp.tipo].nome} encaixado em ${n} furo${n > 1 ? "s" : ""}. Os furos ocupados ficam amarelos.`, { expressao: "satisfeito" });
    },
    aoInverter: (ponta) => robo.dizer(`Ponta da vez: ${ponta}. ${NOME_CONTATO[ponta]}.`, { expressao: "pensando" }),
    aoUsarFerramenta: usarFerramenta,
    aoMudarPonta: pintarChipDaPonta,
    svgFerramenta: () => (multimetro.estado.ativo ? multimetro.svgPontas(bancada) : "") + (solda.estado.ativo ? solda.svgFerro(bancada) : ""),
    aoArrastar: (x, y) => q("#lixeira").classList.toggle("mirada", sobreLixeira(x, y)),
    aoSoltarPeca: (id, x, y) => {
      const dentro = sobreLixeira(x, y);
      q("#lixeira").classList.remove("mirada");
      if (dentro) robo.dizer("Foi para a lixeira. Descanse em paz, pequena peca.", { expressao: "pensando", falar: false });
      return dentro;
    },
  });

  gavetas.iniciar(q("#moveis"), {
    aoEscolherPeca: (tipo, ev) => {
      if (!liberado(tipo)) {
        robo.dizer(`Nesta missao ${PORID[tipo].nome} nao esta na lista de material. Trabalhe com o que a nave liberou.`, { expressao: "alarmado" });
        SOM.erro();
        return;
      }
      arrastarDaPaleta(tipo, ev);
    },
    aoEscolherFio: (jumper, cor) => {
      bancada.escolherFio(jumper, cor);
      if (jumper) robo.dizer(`${jumper.nome} na mao. Clique no primeiro contato e depois no segundo.`, { expressao: "pensando", falar: false });
    },
  });

  q("#busca").addEventListener("input", (e) => gavetas.buscar(e.target.value));

  ligarFerramentas();
  ligarAbasMobile();
  ligarInfo();
  ligarMissao();
  atualizarProgresso();
  iniciarCronometro();
  registrarPwa();
  prepararInstalacao(q("#b-instalar"));
  avisoMobile();

  if (!ajustes.gradeVisivel) {
    const g = q("#fundo-grade");
    if (g) g.style.display = "none";
  }
}

/* ---------- ferramentas --------------------------------------- */

function ligarFerramentas() {
  q("#b-energia").addEventListener("click", () => {
    const ligado = bancada.alternarEnergia();
    sincronizarBotaoEnergia(ligado);
    const temInterativo = bancada.estado.comps.some((c) => (PORID[c.tipo] || {}).zonaAcao);
    if (ligado && temInterativo)
      robo.dizer("Bancada viva. Agora da para apertar botao e girar potenciometro: com ela desligada esses cliques so arrastam a peca.", { expressao: "satisfeito" });
  });

  q("#b-raiox").addEventListener("click", (e) => {
    const on = bancada.alternarRaioX();
    e.currentTarget.classList.toggle("ativo", on);
    if (on) robo.dizer("Raio-X ligado. Verde e a fileira de cinco furos ligados entre si. Azul e o trilho que atravessa a placa inteira. O canal do meio separa os dois lados.", { expressao: "pensando" });
  });

  q("#b-organizar").addEventListener("click", (e) => {
    e.currentTarget.classList.toggle("ativo", bancada.organizarFios());
  });

  q("#b-girar").addEventListener("click", () => {
    if (bancada.estado.selecionado) bancada.girar(bancada.estado.selecionado);
    else robo.dizer("Selecione uma peca antes de girar.", { falar: false });
  });

  q("#b-mais").addEventListener("click", () => bancada.zoom(1.2));
  q("#b-menos").addEventListener("click", () => bancada.zoom(0.83));
  q("#b-enquadrar").addEventListener("click", () => bancada.enquadrar());

  q("#b-firmware").addEventListener("click", () => {
    SOM.clique();
    firmware.abrir(bancada.estado.comps, () => bancada.recalcular());
  });

  q("#m-livre").addEventListener("click", () => trocarModo("livre"));
  q("#m-missoes").addEventListener("click", () => {
    trocarModo("missoes");
    missoes.abrirSeletor(escolherMissao);
  });

  q("#b-limpar").addEventListener("click", confirmarLimpeza);

  // Mesmas acoes das teclas, agora como botao: no celular nao ha
  // Delete, nem Tab, nem Esc.
  q("#t-girar").addEventListener("click", () => {
    if (bancada.estado.selecionado) bancada.girar(bancada.estado.selecionado);
    else robo.dizer("Toque numa peca antes de girar.", { falar: false });
  });
  q("#t-apagar").addEventListener("click", () => {
    const oque = bancada.apagarSelecionado();
    robo.dizer(oque === "fio" ? "Fio removido." : oque === "peca" ? "Peca removida." : "Toque num fio ou numa peca para escolher o que apagar.", { falar: false });
  });
  q("#t-cancelar").addEventListener("click", () => { bancada.cancelar(); robo.dizer("Fio cancelado.", { falar: false }); });
  q("#t-inverter").addEventListener("click", () => {
    const nova = bancada.inverterPontas();
    if (!nova) robo.dizer("Pegue um jumper na sacola primeiro.", { falar: false });
  });
  q("#ponta-chip").addEventListener("click", () => bancada.inverterPontas());

  q("#b-solda").addEventListener("click", (e) => {
    if (solda.estado.ativo) { solda.desligar(bancada); e.currentTarget.classList.remove("ativo"); return; }
    if (multimetro.estado.ativo) multimetro.fechar(bancada);
    bancada.escolherFio(null);
    gavetas.largarFio();
    pintarChipDaPonta(null);
    solda.ligar(bancada);
    e.currentTarget.classList.add("ativo");
    robo.dizer("Ferro quente. Encoste em dois contatos que estejam perto um do outro e eles viram um so. Clicar numa junta pronta dessolda.", { expressao: "pensando" });
  });

  q("#b-museu").addEventListener("click", () => { SOM.clique(); museu.abrir(); });

  q("#b-png").addEventListener("click", async () => {
    const ok = await projeto.salvarPng();
    robo.dizer(ok ? "Imagem exportada. Cole no caderno e diga que foi voce que montou. Porque foi." : "Bancada vazia. Nao vou exportar o vazio.", { falar: false });
  });

  q("#b-json").addEventListener("click", () => {
    const ok = projeto.salvarJson();
    robo.dizer(ok ? "Projeto salvo em JSON. Esse arquivo abre de novo aqui, com fios e tudo." : "Monte alguma coisa primeiro.", { falar: false });
  });

  q("#b-abrir").addEventListener("click", () => {
    projeto.abrirJson((ok, recado) => {
      robo.dizer(ok ? `Projeto ${recado} carregado. Vamos ver o que temos aqui.` : recado, { expressao: ok ? "satisfeito" : "alarmado" });
      if (ok) sincronizarBotaoEnergia(bancada.estado.energizado);
    });
  });

  q("#b-ajustes").addEventListener("click", () => {
    SOM.clique();
    ajustesUI.abrir({ aoMudarTempo: iniciarCronometro });
  });

  q("#b-falar").addEventListener("click", () => { destravarAudio(); robo.repetir(); });
  q("#props").addEventListener("click", (ev) => {
    const bf = ev.target.closest("[data-abrir-fonte]");
    if (bf) {
      const comp = bancada.estado.comps.find((c) => c.id === bf.dataset.abrirFonte);
      if (comp) fonteBancada.abrir(comp, bancada, {});
      return;
    }
    const bm = ev.target.closest("[data-abrir-mm]");
    if (bm) {
      const comp = bancada.estado.comps.find((c) => c.id === bm.dataset.abrirMm);
      if (!comp) return;
      if (solda.estado.ativo) { solda.desligar(bancada); q("#b-solda").classList.remove("ativo"); }
      bancada.escolherFio(null);
      gavetas.largarFio();
      pintarChipDaPonta(null);
      multimetro.abrir(bancada, {
        aoMedir: (r) => { if (r.aviso) robo.dizer(r.aviso, { expressao: "pensando" }); },
      }, comp);
      robo.dizer("Multimetro aberto. Escolha o modo, encoste a ponta vermelha num contato e depois a preta. Os cabos enrolados mostram onde cada ponta esta.", { expressao: "pensando" });
    }
  });

  q("#props").addEventListener("change", (ev) => {
    const alvo = ev.target;
    const comp = bancada.estado.comps.find((c) => c.id === alvo.dataset.comp);
    if (!comp) return;
    if (alvo.dataset.campo === "usb") comp.usbLigado = alvo.checked;
    if (alvo.dataset.campo === "valor") comp.valor = alvo.value;
    if (alvo.dataset.campo === "variante") comp.variante = alvo.value;
    if (alvo.dataset.campo === "tensao") comp.tensaoSaida = Number(alvo.value);
    if (alvo.dataset.campo === "slots") comp.slots = Number(alvo.value);
    SOM.clique();
    bancada.recalcular();
  });
  q("#fala").addEventListener("click", () => robo.completarTexto());
}

/* Pegar da paleta e largar na bancada.
   Um fantasma acompanha o dedo ou o mouse desde a caixa ate a mesa.
   Se a pessoa so tocar e soltar sem arrastar, a peca vai para o centro
   da tela: e o atalho que funciona bem no celular. */
const TOQUE = window.matchMedia("(pointer: coarse)").matches;
const ESPERA_TOQUE = 1000;

function recadoNaBancada(texto, ms = 2000) {
  const antigo = q("#recado-toque");
  if (antigo) antigo.remove();
  const el = document.createElement("div");
  el.id = "recado-toque";
  el.textContent = texto;
  q("#obra").appendChild(el);
  setTimeout(() => el.remove(), ms);
}

function arrastarDaPaleta(tipo, ev) {
  const d = PORID[tipo];
  if (!d) return;
  const origem = ev.currentTarget || ev.target;

  // No celular, um toque rapido rolando a lista nao pode largar peca na
  // bancada. Por isso o dedo precisa segurar um segundo antes de a peca
  // sair da caixa. No mouse continua imediato.
  let liberado = !TOQUE;
  let saiuDaCaixa = false;
  const relogio = TOQUE ? setTimeout(() => {
    liberado = true;
    fantasma.classList.add("pronto");
    SOM.pegar();
    if (navigator.vibrate) navigator.vibrate(18);
  }, ESPERA_TOQUE) : null;

  const fantasma = document.createElement("div");
  fantasma.id = "fantasma";
  fantasma.innerHTML = miniatura(d, 78, 60) + `<span>${d.nome}</span>`;
  document.body.appendChild(fantasma);
  const mover = (x, y) => { fantasma.style.left = x + "px"; fantasma.style.top = y + "px"; };
  mover(ev.clientX, ev.clientY);

  if (TOQUE) fantasma.classList.add("esperando");

  let arrastou = false;
  const inicio = { x: ev.clientX, y: ev.clientY };

  const aoMover = (e) => {
    const dist = Math.hypot(e.clientX - inicio.x, e.clientY - inicio.y);
    // Dedo que desliza antes de completar o segundo esta rolando a
    // lista, nao pegando peca: cancelamos sem reclamar.
    if (TOQUE && !liberado && dist > 14) { cancelar(); return; }
    if (dist > 6) arrastou = true;
    mover(e.clientX, e.clientY);
    fantasma.classList.toggle("valido", liberado && bancada.sobreBancada(e.clientX, e.clientY));
  };

  const cancelar = () => {
    clearTimeout(relogio);
    window.removeEventListener("pointermove", aoMover);
    window.removeEventListener("pointerup", aoSoltar);
    window.removeEventListener("pointercancel", cancelar);
    fantasma.remove();
    try { origem.releasePointerCapture(ev.pointerId); } catch (err) {}
  };

  const aoSoltar = (e) => {
    const podia = liberado;
    cancelar();

    if (!podia) {
      recadoNaBancada("Para adicionar, segure a peca por 1 segundo.", 2400);
      return;
    }

    let comp = null;
    if (bancada.sobreBancada(e.clientX, e.clientY)) {
      const m = bancada.mundoDe(e.clientX, e.clientY);
      comp = bancada.adicionar(tipo, { x: m.x - d.w / 2, y: m.y - d.h / 2 });
    } else if (!arrastou) {
      comp = bancada.adicionar(tipo);
    }
    if (comp) robo.dizer(`${d.nome} na bancada. ${primeiraDica(d)}`, { expressao: "neutro" });
  };

  try { origem.setPointerCapture(ev.pointerId); } catch (err) {}
  window.addEventListener("pointermove", aoMover);
  window.addEventListener("pointerup", aoSoltar);
  window.addEventListener("pointercancel", cancelar);
  if (!TOQUE) SOM.pegar();
}

/* Encaminha o clique num contato para a ferramenta que esta na mao. */
function usarFerramenta(qual, compId, pinoId) {
  if (qual === "multimetro") {
    multimetro.encostar(compId, pinoId, bancada);
    missoes.sessao.ferramentas.add(multimetro.estado.modo);
    missoes.sessao.ferramentas.add("multimetro");
    return;
  }
  if (qual === "solda") {
    const r = solda.usar(compId, pinoId, bancada);
    if (r.acao === "soldou") missoes.sessao.ferramentas.add("solda");
    robo.dizer(r.motivo, { expressao: r.ok ? "neutro" : "alarmado" });
    if (!r.ok) SOM.erro();
    bancada.redesenhar();
  }
}

/* Chip fixo com a ponta da vez. No computador o cursor ja mostra,
   mas no celular nao ha cursor: sem isto o aluno nao sabe se esta
   segurando a ponta macho ou a femea. */
const FORMA_PONTA = { macho: "&#9632;", femea: "&#9679;", jacare: "&#9644;" };

function pintarChipDaPonta(info) {
  const chip = q("#ponta-chip");
  if (!chip) return;
  if (!info) { chip.hidden = true; return; }
  chip.hidden = false;
  chip.innerHTML = `<span class="forma" style="color:${info.cor}">${FORMA_PONTA[info.ponta] || ""}</span>
    ${info.indice}a ponta: <b>${info.ponta}</b> <em>toque para inverter</em>`;
}

function sobreLixeira(x, y) {
  const r = q("#lixeira").getBoundingClientRect();
  return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
}

function sincronizarBotaoEnergia(ligado) {
  const b = q("#b-energia");
  b.textContent = ligado ? "Desligar bancada" : "Energizar bancada";
  b.classList.toggle("ativo", ligado);
}

/* ---------- energizar, danos e reacoes ------------------------ */

function aoEnergizar(ligado, circ) {
  if (!ligado) {
    robo.dizer(robo.FALAS.energiaDesligada, { expressao: "neutro" });
    return;
  }
  if (!bancada.estado.comps.length) {
    robo.dizer(robo.FALAS.bancadaVazia, { expressao: "pensando" });
    return;
  }

  if (multimetro.estado.ativo) multimetro.atualizar(bancada);
  const veredito = danos.aplicar(bancada.estado.comps, circ);

  if (veredito.desligar) {
    bancada.desligar();
    sincronizarBotaoEnergia(false);
    SOM.curto();

    if (veredito.primeiraVez) {
      mostrarAlarme("Corta a energia!", veredito.avisos.map((a) => a.txt),
        "Desliguei antes de estragar. Da proxima vez que voce energizar com esse mesmo erro, a peca vai embora.");
      robo.dizer(veredito.avisos[0].txt, { expressao: "alarmado" });
    } else {
      missoes.sessao.queimadas += veredito.queimados.filter((q2) => !q2.protegido).length;
      const nomes = veredito.queimados.map((k) => k.nome).join(", ");
      mostrarAlarme("Fumaca magica liberada",
        veredito.avisos.map((a) => a.txt),
        nomes ? `Perdemos: ${nomes}. Ja anotei no Museu dos Desastres.` : "A protecao da placa atuou a tempo.");
      robo.dizer(`${nomes ? nomes + " nao resistiu. " : ""}Aquele cheiro doce e a fumaca magica indo embora. Ela nunca volta.`, { expressao: "chuvisco" });
      bancada.recalcular();
      atualizarProgresso();
    }
    return;
  }

  const vivas = [...circ.estados.values()].filter((e) => e.ligado || e.aceso).length;
  const alertas = circ.diagnosticos.filter((d) => d.nivel === "aviso");
  if (alertas.length) {
    robo.dizer(alertas[0].txt, { expressao: "pensando" });
    return;
  }
  robo.dizer(
    vivas
      ? `${robo.FALAS.energiaLigada} Contei ${vivas} peca${vivas > 1 ? "s" : ""} viva${vivas > 1 ? "s" : ""} na bancada.`
      : "Energizei e nada acordou. Confira se o GND fechou o caminho de volta e se algum pino esta em nivel alto no firmware.",
    { expressao: vivas ? "satisfeito" : "pensando" }
  );
}

function mostrarAlarme(titulo, linhas, remate) {
  const antigo = q(".alarme");
  if (antigo) antigo.remove();
  const caixa = document.createElement("div");
  caixa.className = "alarme";
  caixa.innerHTML = `<h3>${titulo}</h3>
    ${linhas.slice(0, 3).map((l) => `<p>${l}</p>`).join("")}
    <p style="color:var(--grafite)">${remate}</p>
    <button class="btn btn-perigo">Entendi</button>`;
  q("#obra").appendChild(caixa);
  caixa.querySelector("button").addEventListener("click", () => { SOM.clique(); caixa.remove(); });
  setTimeout(() => caixa.remove(), 14000);
}

/* ---------- missoes ------------------------------------------- */

function liberado(tipo) {
  const m = missoes.sessao.missao;
  if (!m || !m.componentesLiberados) return true;
  return m.componentesLiberados.includes(tipo);
}

async function escolherMissao(missao, erro, filtrosTreino) {
  if (erro) { robo.dizer(erro, { expressao: "alarmado" }); return; }

  if (filtrosTreino) {
    ajustes.minutos = filtrosTreino.minutos;
    ajustes.tempoInfinito = false;
    treinoEmCurso = true;
    iniciarCronometro();
  }

  if (!missao) {
    treinoEmCurso = false;
    missoes.encerrarTreino();
    missoes.encerrarMissao();
    document.body.classList.remove("pausado");
    missoes.pintarPainel(q("#missao-caixa"), bancada.estado.comps);
    robo.dizer("Montagem livre. Faca a bagunca que quiser, eu so olho.", { expressao: "neutro" });
    return;
  }

  trocarModo("missoes");
  missoes.iniciarMissao(missao);
  danos.limparMemoria();
  document.body.classList.remove("pausado");
  bancada.limparBancada();
  bancada.desligar();
  sincronizarBotaoEnergia(false);
  if (missao.montagem) bancada.carregar(missao.montagem);
  // No treino sorteado o cronometro e um so para a sessao inteira.
  if (!treinoEmCurso && missao.minutos) { ajustes.minutos = missao.minutos; iniciarCronometro(); }
  missoes.pintarPainel(q("#missao-caixa"), bancada.estado.comps);
  robo.dizer(missao.briefing || missao.resumo || missao.titulo, { expressao: "neutro" });
}

function ligarMissao() {
  q("#missao-caixa").addEventListener("click", (e) => {
    if (e.target.closest("#mis-sair")) { escolherMissao(null); trocarModo("livre"); return; }
    if (e.target.closest("#mis-pausa")) {
      const pausada = missoes.alternarPausa();
      if (pausada) clearInterval(cronometro); else iniciarCronometro(restam);
      SOM.clique();
      missoes.pintarPainel(q("#missao-caixa"), bancada.estado.comps);
      robo.dizer(pausada ? "Missao pausada. O cronometro parou e a bancada te espera." : "Retomando. De onde paramos.", { expressao: "neutro" });
      return;
    }
    if (e.target.closest("#mis-reiniciar")) {
      const m = missoes.sessao.missao;
      if (m) escolherMissao(m);
      return;
    }
    if (e.target.closest("#mis-dica")) {
      const m = missoes.sessao.missao;
      if (!m || !m.dicas || !m.dicas.length) return;
      const i = Math.min(missoes.sessao.dicasUsadas, m.dicas.length - 1);
      missoes.sessao.dicasUsadas++;
      SOM.bip();
      robo.dizer(m.dicas[i], { expressao: "pensando" });
      missoes.pintarPainel(q("#missao-caixa"), bancada.estado.comps);
    }
  });
}

function aoMudarBancada(est) {
  if (!missoes.sessao.missao || !est.ultimoCircuito) return;
  const r = missoes.avaliar(est.comps, est.ultimoCircuito);
  missoes.pintarPainel(q("#missao-caixa"), est.comps);
  if (r.completa && !missoes.sessao.concluida) {
    const resultado = missoes.concluir(ajustes.tempoInfinito ? 0 : restam);
    if (resultado) {
      atualizarProgresso();
      const m = missoes.sessao.missao;
      robo.dizer(`${m.sucesso || robo.FALAS.tudoCerto} Voce ganhou ${resultado.pontos} pontos. Patente atual: ${patenteDe(resultado.progresso.pontos)}.`, { expressao: "satisfeito" });
      if (treinoEmCurso) setTimeout(emendarTreino, 2600);
    }
  }
}

async function emendarTreino() {
  if (!treinoEmCurso || restam <= 0) return;
  const entrada = missoes.proximaDoTreino();
  if (!entrada) {
    treinoEmCurso = false;
    robo.dizer("Acabaram as missoes do sorteio. Voce limpou a fila inteira dentro do tempo.", { expressao: "satisfeito" });
    return;
  }
  try {
    const dados = await import("./conteudo.js").then((m) => m.carregarMissao(entrada));
    escolherMissao({ ...entrada, ...dados });
  } catch (e) {
    robo.dizer("Tropecei ao abrir a proxima missao do treino.", { expressao: "alarmado" });
  }
}

/* ---------- painel do robo ------------------------------------ */

function aoSelecionarComponente(comp) {
  compSelecionado = comp;
  const temTexto = comp && textoDe(comp.tipo, "curiosidade");
  ["#b-curio", "#b-uso", "#b-tec"].forEach((sel) => { q(sel).disabled = !temTexto; });
  pintarPropriedades(comp);
  if (comp) {
    const d = PORID[comp.tipo];
    const est = bancada.estado.ultimoCircuito && bancada.estado.ultimoCircuito.estados.get(comp.id);
    const medida = est && est.corrente > 0.5 ? ` — ${est.corrente.toFixed(0)} mA` : "";
    q("#dica").textContent = `${d.nome}${medida}. R gira, Delete joga fora.`;
  } else {
    q("#dica").textContent = "Arraste uma peca da paleta. Passe o mouse num pino para ver o que ele e.";
  }
}

/* Propriedades da peca selecionada. E aqui que o aluno decide se a
   placa esta ligada no USB ou se vai depender de alimentacao externa —
   a mesma escolha que ele faz na bancada de verdade. */
function pintarPropriedades(comp) {
  const caixa = q("#props");
  if (!comp) { caixa.hidden = true; caixa.innerHTML = ""; return; }
  const d = PORID[comp.tipo];
  const partes = [`<b>${d.nome}</b>`];

  if (d.usb) partes.push(`<label><input type="checkbox" data-comp="${comp.id}" data-campo="usb" ${comp.usbLigado !== false ? "checked" : ""}> alimentar pelo cabo USB</label>`);
  if (d.slots) {
    const n = comp.slots ?? d.slots.padrao;
    partes.push(`<label>${d.slots.rotulo} <select data-comp="${comp.id}" data-campo="slots">
      ${Array.from({ length: d.slots.max - d.slots.min + 1 }, (_, k) => d.slots.min + k)
        .map((v) => `<option ${v === n ? "selected" : ""}>${v}</option>`).join("")}</select></label>`);
    partes.push(`<span style="color:var(--fosforo)">${(n * d.slots.porSlot).toFixed(1)} V</span>`);
  }
  if (d.instrumento) partes.push(`<button class="btn" data-abrir-fonte="${comp.id}">Abrir painel da fonte</button>`);
  if (d.instrumentoMedida) partes.push(`<button class="btn" data-abrir-mm="${comp.id}">Abrir painel do multimetro</button>`);
  if (d.usb) partes.push(comp.usbLigado !== false
    ? `<span style="color:var(--fosforo)">energia pelo USB</span>`
    : `<span style="color:var(--ambar)">depende do VIN (${d.vinMin} a ${d.vinMax} V)</span>`);
  if (d.valores) partes.push(`<label>valor <select data-comp="${comp.id}" data-campo="valor">${d.valores.map((v) => `<option ${v === comp.valor ? "selected" : ""}>${v}</option>`).join("")}</select></label>`);
  if (d.variantes) partes.push(`<label>cor <select data-comp="${comp.id}" data-campo="variante">${d.variantes.map((v) => `<option ${v.nome === comp.variante ? "selected" : ""}>${v.nome}</option>`).join("")}</select></label>`);
  if (d.ajustavel) partes.push(`<label>saida <select data-comp="${comp.id}" data-campo="tensao">${d.ajustavel.map((v) => `<option ${v === comp.tensaoSaida ? "selected" : ""}>${v}</option>`).join("")}</select> V</label>`);
  if ((comp.encaixes || []).length) partes.push(`<span style="color:var(--ambar)">${comp.encaixes.length} pino(s) na protoboard</span>`);

  caixa.hidden = partes.length < 2;
  caixa.innerHTML = partes.join(" ");
}

function trocarModo(novo) {
  modo = novo;
  SOM.clique();
  q("#m-livre").setAttribute("aria-pressed", String(novo === "livre"));
  q("#m-missoes").setAttribute("aria-pressed", String(novo === "missoes"));
  if (novo === "livre" && missoes.sessao.missao) escolherMissao(null);
}

function confirmarLimpeza() {
  const emManutencao = missoes.sessao.missao && missoes.sessao.missao.tipo === "manutencao";
  const texto = emManutencao
    ? "Isto devolve a montagem da missao ao estado original. Tudo que voce mexeu se perde. Confirmar?"
    : "Isto apaga todas as pecas e fios da bancada. Confirmar?";
  const veu = document.createElement("div");
  veu.className = "veu";
  veu.innerHTML = `<div class="janela" style="width:min(400px,100%)">
    <div class="janela-topo">${ico("lixo", 18)}<h2>Limpar mesa</h2></div>
    <div class="janela-corpo"><p>${texto}</p></div>
    <div class="janela-base">
      <button class="btn btn-perigo" id="lm-sim">Limpar</button>
      <button class="btn" id="lm-nao">Cancelar</button>
    </div></div>`;
  document.body.appendChild(veu);
  const fecha = () => veu.remove();
  veu.querySelector("#lm-nao").addEventListener("click", fecha);
  veu.addEventListener("click", (e) => { if (e.target === veu) fecha(); });
  veu.querySelector("#lm-sim").addEventListener("click", () => {
    fecha();
    SOM.lixo();
    if (emManutencao) restaurarMissao();
    else { bancada.limparBancada(); bancada.desligar(); sincronizarBotaoEnergia(false); }
    robo.dizer(emManutencao ? "Montagem devolvida ao estado original. Comece de novo." : "Mesa limpa. Recomecar tambem faz parte.", { expressao: "neutro" });
  });
}

function restaurarMissao() {
  const m = missoes.sessao.missao;
  bancada.limparBancada();
  bancada.desligar();
  sincronizarBotaoEnergia(false);
  if (m && m.montagem) bancada.carregar(m.montagem);
}

function ligarInfo() {
  const abas = { "#b-curio": "curiosidade", "#b-uso": "uso", "#b-tec": "tecnico" };
  Object.entries(abas).forEach(([sel, campo]) => {
    q(sel).addEventListener("click", () => {
      if (!compSelecionado) return;
      const txt = textoDe(compSelecionado.tipo, campo);
      robo.dizer(txt || "Ainda nao escrevi nada sobre essa peca. Cobre do GABURA.", { expressao: "pensando" });
    });
  });
}

function explicarPapel(p) {
  const m = {
    "v+": "E alimentacao positiva. Aqui entra energia.",
    gnd: "E o GND, o retorno da corrente. Sem ele nada funciona.",
    digital: "Pino digital: liga e desliga, alto ou baixo. Voce escolhe o estado no painel Firmware.",
    pwm: "Pino PWM: ele finge tensao no meio do caminho piscando rapido. Servo e brilho de LED pedem esse.",
    analog: "Entrada analogica: le valores no meio, nao so ligado e desligado.",
    i2c: "Comunicacao I2C. Duas vias, SDA e SCL, varios modulos na mesma dupla.",
    spi: "Comunicacao SPI. Mais rapida, mais fios.",
    "so-entrada": "Cuidado: esse pino so le, nao consegue acionar nada.",
    sinal: "Pino de sinal ou controle.",
    terminal: "Terminal comum do componente.",
  };
  return m[p.papel] || "";
}

function primeiraDica(d) {
  if (d.zonaAcao && d.zonaAcao.acao === "pressionar") return "Da para apertar de verdade: segure o botao com o dedo ou o mouse.";
  if (d.zonaAcao && d.zonaAcao.acao === "chavear") return "Clique na chave para ligar e desligar. Ela fica no estado que voce deixar.";
  if (d.zonaAcao && d.zonaAcao.acao === "girar") return "Arraste o botao redondo para girar o cursor.";
  if (d.acoplaEm) return "Solte ela logo abaixo da MicroBURA para acoplar e liberar os outros pinos.";
  if (d.arte === "protoboard") return "Ligue o Raio-X se ainda tiver duvida de quais furos se conversam.";
  if (d.alimentada) return "Abra o painel Firmware para escolher o estado de cada pino dela.";
  if (d.id === "led") return "Nunca sozinho: LED pede resistor em serie, senao vira fumaca.";
  if (d.alimenta !== undefined) return "Ele precisa de VCC e GND para acordar.";
  return "Pegue um jumper na sacola para ligar os pinos.";
}

/* ---------- progresso e cronometro ---------------------------- */

function atualizarProgresso() {
  const p = lerProgresso();
  q("#pontos").textContent = p.pontos;
  q("#patente").textContent = patenteDe(p.pontos);
  const m = lerMuseu();
  const b = q("#b-museu");
  if (b) b.title = `Museu dos Desastres — ${m.total || 0} peca(s)`;
}

function iniciarCronometro(retomarDe) {
  clearInterval(cronometro);
  const painel = q("#relogio");
  // Montagem livre nao tem prazo. Explorar a bancada nao e prova.
  if (!missoes.sessao.missao && !treinoEmCurso) { painel.textContent = "livre"; return; }
  if (ajustes.tempoInfinito) { painel.textContent = "livre"; return; }
  restam = retomarDe != null ? retomarDe : ajustes.minutos * 60;
  const pinta = () => {
    const m = String(Math.floor(restam / 60)).padStart(2, "0");
    const s = String(restam % 60).padStart(2, "0");
    painel.textContent = `${m}:${s}`;
  };
  pinta();
  cronometro = setInterval(() => {
    restam--;
    pinta();
    if (restam === 60) SOM.bip();
    if (restam <= 0) {
      clearInterval(cronometro);
      SOM.bipLongo();
      robo.dizer("Tempo de treino encerrado. Levante, estique as costas e volte. A bancada fica salva.", { expressao: "satisfeito" });
    }
  }, 1000);
}

/* ---------- celular ------------------------------------------- */

function ligarAbasMobile() {
  const botoes = document.querySelectorAll("#abas-mobile button");
  const mostrar = (aba) => {
    q("#painel-pecas").hidden = aba !== "pecas";
    q("#painel-robo").hidden = aba !== "robo";
    botoes.forEach((b) => b.setAttribute("aria-selected", String(b.dataset.aba === aba)));
    if (aba === "bancada") bancada.enquadrar();
  };
  botoes.forEach((b) => b.addEventListener("click", () => { SOM.clique(); mostrar(b.dataset.aba); }));
  const estreito = window.matchMedia("(max-width: 900px)");
  const ajustar = () => {
    if (estreito.matches) mostrar("bancada");
    else { q("#painel-pecas").hidden = false; q("#painel-robo").hidden = false; }
  };
  estreito.addEventListener("change", ajustar);
  ajustar();
}

function avisoMobile() {
  if (window.matchMedia("(max-width: 900px)").matches) {
    setTimeout(() => {
      robo.dizer("Tela pequena detectada. Da para estudar as pecas, ouvir minhas historias e abrir projeto salvo, mas montar circuito com protoboard e bem melhor no computador da sala.", { expressao: "pensando" });
    }, 900);
  }
}
