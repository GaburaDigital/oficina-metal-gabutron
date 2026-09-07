/* ============================================================
   Aplica um export do assistente sobre o projeto, gerando js/arte.js.

     node ferramentas/aplicar-desenhos.mjs caminho/desenhos-....json

   Ele compara com o catalogo ATUAL, e nao com um retrato antigo: era
   isso que fazia pino criado depois da ultima geracao (o NF do rele,
   por exemplo) ser descartado em silencio.
   ============================================================ */
import { COMPONENTES } from "../js/biblioteca.js";
import fs from "fs";

const arquivo = process.argv[2];
if (!arquivo) { console.error("informe o arquivo exportado"); process.exit(1); }

const exp = JSON.parse(fs.readFileSync(arquivo, "utf8"));
const atual = Object.fromEntries(COMPONENTES.map((c) => [c.id, c]));
const editados = exp.componentes.filter((c) => c.editado);

const esc = (s) => s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
const limpar = (s) => s.replace(/ style=""/g, "").replace(/\s+/g, " ").trim();

let arte = "", ajustes = {}, tamanhos = {}, ignorados = [];
for (const c of editados) {
  arte += `  "${c.id}": {\n    svg: \`${esc(limpar(c.svg))}\`,\n`;
  if (c.marcadores && c.marcadores.length) arte += `    marcadores: ${JSON.stringify(c.marcadores)},\n`;
  arte += "  },\n";

  const d = atual[c.id];
  if (!d) { ignorados.push(c.id); continue; }
  const mov = {};
  for (const p of c.pinos) {
    const orig = d.pinos.find((x) => x.id === p.id);
    if (!orig) { ignorados.push(`${c.id}.${p.id} (pino sumiu do catalogo)`); continue; }
    if (orig.x !== p.x || orig.y !== p.y) mov[p.id] = { x: p.x, y: p.y };
  }
  const semDesenho = d.pinos.filter((p) => !c.pinos.some((x) => x.id === p.id)).map((p) => p.id);
  if (semDesenho.length) ignorados.push(`${c.id}: ${semDesenho.join(",")} nao estavam no desenho (exporte de novo para posiciona-los)`);
  if (Object.keys(mov).length) ajustes[c.id] = mov;
  if (d.w !== c.w || d.h !== c.h) tamanhos[c.id] = { w: c.w, h: c.h };
}

const cabecalho = `/* ============================================================
   ARTE — desenhos revisados no assistente de desenho.

   GERADO por ferramentas/aplicar-desenhos.mjs. Nao edite a mao.

   Alem do corpo em SVG, cada peca traz MARCADORES: os pontos onde a
   bancada anima por cima o que gira, acende, soa, vibra ou se ajusta,
   e tambem a posicao de botoes e entradas.

   Origem: ${arquivo.split("/").pop()}, ${editados.length} pecas.
   ============================================================ */

export const ARTE = {
`;

fs.writeFileSync("js/arte.js",
  cabecalho + arte + "};\n\nexport const PINOS_AJUSTADOS = " + JSON.stringify(ajustes, null, 2) +
  ";\n\nexport const TAMANHOS = " + JSON.stringify(tamanhos, null, 2) + ";\n");

console.log(`arte.js gerado: ${editados.length} pecas, ${(fs.statSync("js/arte.js").size / 1024).toFixed(0)} KB`);
if (ignorados.length) {
  console.log("\nAVISOS (peca do desenho fora de sincronia com o catalogo):");
  ignorados.forEach((x) => console.log("  - " + x));
}
