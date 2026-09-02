/* ============================================================
   CONTEUDO — le catalogo.json e os arquivos de ATIVIDADES/.
   O GitHub Pages e um servidor estatico: ele nao sabe listar pastas.
   Por isso o catalogo funciona como indice. Para adicionar conteudo
   voce faz duas coisas: joga o .json na pasta e escreve uma linha
   no catalogo. Nada de mexer no codigo.
   ============================================================ */

const cache = new Map();

export const catalogo = { componentes: [], construcao: [], manutencao: [], curiosidades: [] };
export const textosComponente = new Map();
export let curiosidadesExtras = [];

async function lerJson(caminho) {
  if (cache.has(caminho)) return cache.get(caminho);
  const r = await fetch(caminho, { cache: "no-cache" });
  if (!r.ok) throw new Error(`${caminho}: ${r.status}`);
  const dados = await r.json();
  cache.set(caminho, dados);
  return dados;
}

export async function carregarCatalogo() {
  try {
    const c = await lerJson("catalogo.json");
    Object.assign(catalogo, c.conteudos || {});
  } catch (e) {
    console.warn("Catalogo indisponivel. A bancada funciona, mas sem textos.", e);
    return false;
  }

  // Fase 1 carrega apenas o que a interface usa agora:
  // os textos dos componentes e as falas extras do GabuTRON.
  await Promise.all([
    ...catalogo.componentes.map(async (item) => {
      try {
        const d = await lerJson(item.arquivo);
        Object.entries(d.componentes || {}).forEach(([id, txt]) => textosComponente.set(id, txt));
      } catch (e) { console.warn("Arquivo de componentes ignorado:", item.arquivo); }
    }),
    ...catalogo.curiosidades.map(async (item) => {
      try {
        const d = await lerJson(item.arquivo);
        curiosidadesExtras = curiosidadesExtras.concat(d.falas || []);
      } catch (e) { console.warn("Arquivo de falas ignorado:", item.arquivo); }
    }),
  ]);
  return true;
}

export function textoDe(idComponente, aba) {
  const t = textosComponente.get(idComponente);
  if (!t) return null;
  return t[aba] || null;
}

/* Usado pela Fase 2: carrega uma missao sob demanda, so quando o
   aluno clica nela. O menu ja tem os metadados vindos do catalogo. */
export async function carregarMissao(entrada) {
  return lerJson(entrada.arquivo);
}
