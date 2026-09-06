/* ============================================================
   Gera ferramentas/assistente-desenho.html com o catalogo ATUAL.
   Rode sempre que adicionar ou mudar um componente:

     node ferramentas/gerar-assistente.mjs

   Ele embute os dados no proprio HTML porque um arquivo local aberto
   com dois cliques nao consegue ler JSON de fora.
   ============================================================ */
import { COMPONENTES, MOVEIS } from "../js/biblioteca.js";
import { desenhar } from "../js/desenhos.js";
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

const dados = JSON.stringify({ moveis: MOVEIS.map((m) => ({ id: m.id, nome: m.nome })), componentes });
if (dados.includes("</script")) throw new Error("dado com tag que quebraria o HTML");

const saida = molde.replace("__BASE__", dados);
fs.writeFileSync(path.join(raiz, "assistente-desenho.html"), saida);
console.log(`assistente gerado com ${componentes.length} componentes (${(saida.length / 1024).toFixed(0)} KB)`);
