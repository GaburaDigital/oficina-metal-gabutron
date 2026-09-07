/* ============================================================
   Gera ferramentas/assistente-desenho.html com o catalogo ATUAL.
   Rode sempre que adicionar ou mudar um componente:

     node ferramentas/gerar-assistente.mjs

   Ele embute os dados no proprio HTML porque um arquivo local aberto
   com dois cliques nao consegue ler JSON de fora.
   ============================================================ */
import { COMPONENTES, MOVEIS } from "../js/biblioteca.js";
import { desenhar } from "../js/desenhos.js";
import { ARTE } from "../js/arte.js";
import fs from "fs";
import path from "path";

const raiz = path.dirname(new URL(import.meta.url).pathname);
const molde = fs.readFileSync(path.join(raiz, "molde-assistente.html"), "utf8");

const componentes = COMPONENTES.filter((d) => !d.avulsa).map((d) => ({
  id: d.id, nome: d.nome, caixa: d.caixa || "outros", w: d.w, h: d.h, arte: d.arte,
  pinos: d.pinos.map((p) => ({
    id: p.id, n: p.n, rotulo: p.rotulo || "", x: p.x, y: p.y,
    r: p.r, papel: p.papel, lado: p.lado || "baixo", furo: !!p.furo, grande: !!p.grande,
  })),
  svg: desenhar(d, {
    ligado: false, aceso: false, brilho: 1, giro: 50, pressionado: false,
    variante: d.variantes && d.variantes[0].nome,
    valorAtual: d.valores && d.valores[0],
    tensaoSaida: d.ajustavel && d.ajustavel[1],
    slots: d.slots && d.slots.padrao,
  }).replace(/\n/g, " ").trim(),
}));

/* Marcas do que a bancada anima por cima do desenho. Servem para o
   desenhista saber onde NAO desenhar em cima, e onde deixar espaco. */
const marcas = {};
for (const d of COMPONENTES) {
  const m = { eixos: [], luzes: [], acoes: [], telas: [], sons: [], trimpots: [] };
  if (d.zonaAcao) m.acoes.push({ x: d.zonaAcao.x, y: d.zonaAcao.y, r: d.zonaAcao.r, rotulo: d.zonaAcao.acao });
  if (d.trimpot) {
    m.acoes.push({ x: d.trimpot.x, y: d.trimpot.y, r: d.trimpot.r, rotulo: "trimpot: " + d.trimpot.rotulo });
    m.trimpots.push({ x: d.trimpot.x, y: d.trimpot.y, r: d.trimpot.r, rotulo: d.trimpot.rotulo });
  }
  for (const b of d.botoes || []) m.acoes.push({ x: b.x, y: b.y, r: b.r, rotulo: "botao " + b.n });
  if (d.teclado) {
    const k = d.teclado;
    k.teclas.forEach((t, i) => m.acoes.push({
      x: k.x0 + (i % k.colunas) * k.dx, y: k.y0 + Math.floor(i / k.colunas) * k.dy, r: k.r, rotulo: t,
    }));
  }
  if (d.tela) m.telas.push({ x: d.w * 0.09, y: d.h * 0.1, w: d.w * 0.82, h: d.h * 0.5 });
  if (d.apito || /falante|buzzer|piezo/.test(d.id)) m.sons.push({ x: d.w - 26, y: d.h * 0.4 });
  if (Object.values(m).some((v) => v.length)) marcas[d.id] = m;
}

/* Marcadores editaveis: eixo de giro, luz, som e vibracao. Sao eles
   que a bancada usa para animar, entao mover aqui muda o projeto. */
const marcadores = {};
const eixoPadrao = {};
for (const d of COMPONENTES) {
  const lista = ARTE[d.id] && ARTE[d.id].marcadores ? ARTE[d.id].marcadores : d.marcadores;
  if (lista && lista.length) marcadores[d.id] = JSON.parse(JSON.stringify(lista));
  const eixo = (d.marcadores || []).find((m) => m.tipo === "eixo");
  if (eixo) eixoPadrao[d.id] = eixo.estilo;
}

const dados = JSON.stringify({ moveis: MOVEIS.map((m) => ({ id: m.id, nome: m.nome })), componentes, marcas, marcadores, eixoPadrao });
if (dados.includes("</script")) throw new Error("dado com tag que quebraria o HTML");

const saida = molde.replace("__BASE__", dados);
fs.writeFileSync(path.join(raiz, "assistente-desenho.html"), saida);
console.log(`assistente gerado com ${componentes.length} componentes (${(saida.length / 1024).toFixed(0)} KB)`);
