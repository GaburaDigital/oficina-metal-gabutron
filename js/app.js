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
import * as boot from "./boot.js";
import * as bancada from "./bancada.js";
import * as gavetas from "./gavetas.js";
import * as robo from "./gabutron.js";
import * as ajustesUI from "./ajustes.js";
import * as projeto from "./projeto.js";
import * as missoes from "./missoes.js";
import * as firmware from "./firmware.js";
import * as museu from "./museu.js";
import * as danos from "./danos.js";
import { carregarCatalogo, textoDe } from "./conteudo.js";
import { registrarPwa, prepararInstalacao } from "./pwa.js";

const q = (s) => document.querySelector(s);
let compSelecionado = null;
let restam = 0, cronometro = null;

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
    "#lixeira": "lixo", "#b-falar": "falar", "#b-museu": "lixo",
  };
  Object.entries(par).forEach(([sel, nome]) => {
    const el = q(sel);
    if (el) el.innerHTML = ico(nome, sel === "#lixeira" ? 22 : 16) + (sel === "#lixeira" ? "<span>lixeira</span>" : "");
  });
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
    aoArrastar: (x, y) => q("#lixeira").classList.toggle("mirada", sobreLixeira(x, y)),
    aoSoltarPeca: (id, x, y) => {
      const dentro = sobreLixeira(x, y);
      q("#lixeira").classList.remove("mirada");
      if (dentro) robo.dizer("Foi para a lixeira. Descanse em paz, pequena peca.", { expressao: "pensando", falar: false });
      return dentro;
    },
  });

  gavetas.iniciar(q("#moveis"), {
    aoEscolherPeca: (tipo) => {
      if (!liberado(tipo)) {
        robo.dizer(`Nesta missao ${PORID[tipo].nome} nao esta na lista de material. Trabalhe com o que a nave liberou.`, { expressao: "alarmado" });
        SOM.erro();
        return;
      }
      const c = bancada.adicionar(tipo);
      const d = PORID[tipo];
      if (c) robo.dizer(`${d.nome} na bancada. ${primeiraDica(d)}`, { expressao: "neutro", falar: false });
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

  q("#b-missoes").addEventListener("click", () => {
    SOM.clique();
    missoes.abrirSeletor(escolherMissao);
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
  q("#fala").addEventListener("click", () => robo.completarTexto());
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

function escolherMissao(missao, erro) {
  if (erro) { robo.dizer(erro, { expressao: "alarmado" }); return; }

  if (!missao) {
    missoes.encerrarMissao();
    missoes.pintarPainel(q("#missao-caixa"), bancada.estado.comps);
    robo.dizer("Montagem livre. Faca a bagunca que quiser, eu so olho.", { expressao: "neutro" });
    return;
  }

  missoes.iniciarMissao(missao);
  danos.limparMemoria();
  bancada.limparBancada();
  bancada.desligar();
  sincronizarBotaoEnergia(false);
  if (missao.minutos) { ajustes.minutos = missao.minutos; iniciarCronometro(); }
  missoes.pintarPainel(q("#missao-caixa"), bancada.estado.comps);
  robo.dizer(missao.briefing || missao.resumo || missao.titulo, { expressao: "neutro" });
}

function ligarMissao() {
  q("#missao-caixa").addEventListener("click", (e) => {
    if (e.target.closest("#mis-sair")) { escolherMissao(null); return; }
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
    }
  }
}

/* ---------- painel do robo ------------------------------------ */

function aoSelecionarComponente(comp) {
  compSelecionado = comp;
  const temTexto = comp && textoDe(comp.tipo, "curiosidade");
  ["#b-curio", "#b-uso", "#b-tec"].forEach((s) => { q(s).disabled = !temTexto; });
  if (comp) {
    const d = PORID[comp.tipo];
    const est = bancada.estado.ultimoCircuito && bancada.estado.ultimoCircuito.estados.get(comp.id);
    const medida = est && est.corrente > 0.5 ? ` — ${est.corrente.toFixed(0)} mA` : "";
    q("#dica").textContent = `${d.nome}${medida}. R gira, Delete joga fora.`;
  } else {
    q("#dica").textContent = "Arraste uma peca da gaveta. Clique num pino para saber o que ele e.";
  }
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

function iniciarCronometro() {
  clearInterval(cronometro);
  const painel = q("#relogio");
  if (ajustes.tempoInfinito) { painel.textContent = "livre"; return; }
  restam = ajustes.minutos * 60;
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
