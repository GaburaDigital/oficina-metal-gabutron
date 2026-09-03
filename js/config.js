/* ============================================================
   CONFIG — ajustes do usuario e persistencia no navegador
   Tudo o que o aluno escolhe fica aqui e volta na proxima visita.
   ============================================================ */

const CHAVE_AJUSTES = "gabutron.ajustes.v1";
const CHAVE_BANCADA = "gabutron.bancada.v1";
const CHAVE_PROGRESSO = "gabutron.progresso.v1";

export const PADRAO = {
  som: true,
  voz: true,
  digitacao: true,      // efeito de texto sendo digitado
  modo: "escuro",       // escuro | claro
  gradeVisivel: true,
  minutos: 15,          // tempo de treino
  tempoInfinito: false,
  dificuldade: "novato",
  autoSalvar: true,
  falaAutomatica: false,  // a voz so sai no botao Falar, por padrao
  corBancada: "carvao",
  vozEscolhida: "",     // nome da voz do sistema
};

export const ajustes = { ...PADRAO };

export function carregarAjustes() {
  try {
    const bruto = localStorage.getItem(CHAVE_AJUSTES);
    if (bruto) Object.assign(ajustes, PADRAO, JSON.parse(bruto));
  } catch (e) {
    console.warn("Ajustes ilegiveis, voltando ao padrao.", e);
  }
  aplicarModo();
  return ajustes;
}

export function salvarAjustes() {
  try {
    localStorage.setItem(CHAVE_AJUSTES, JSON.stringify(ajustes));
    return true;
  } catch (e) {
    return false;
  }
}

export function definir(chave, valor) {
  ajustes[chave] = valor;
  if (chave === "modo" || chave === "corBancada") aplicarModo();
  salvarAjustes();
}

export function aplicarModo() {
  document.documentElement.dataset.modo = ajustes.modo;
  document.documentElement.dataset.bancada = ajustes.corBancada || "carvao";
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = ajustes.modo === "claro" ? "#FFFFFF" : "#05060A";
}

/* --- bancada salva automaticamente ---------------------------- */

export function salvarBancada(dados) {
  if (!ajustes.autoSalvar) return;
  try {
    localStorage.setItem(CHAVE_BANCADA, JSON.stringify(dados));
  } catch (e) {
    console.warn("Nao foi possivel salvar a bancada.", e);
  }
}

export function lerBancada() {
  try {
    const bruto = localStorage.getItem(CHAVE_BANCADA);
    return bruto ? JSON.parse(bruto) : null;
  } catch (e) {
    return null;
  }
}

/* --- progresso (pontos e patente) ----------------------------- */

export function lerProgresso() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_PROGRESSO)) || { pontos: 0, missoes: [] };
  } catch (e) {
    return { pontos: 0, missoes: [] };
  }
}

export function salvarProgresso(p) {
  try { localStorage.setItem(CHAVE_PROGRESSO, JSON.stringify(p)); } catch (e) {}
}

/* --- museu dos desastres -------------------------------------- */

const CHAVE_MUSEU = "gabutron.museu.v1";

export function lerMuseu() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_MUSEU)) || { total: 0, pecas: [] };
  } catch (e) {
    return { total: 0, pecas: [] };
  }
}

export function salvarMuseu(m) {
  try { localStorage.setItem(CHAVE_MUSEU, JSON.stringify(m)); } catch (e) {}
}

export function somarPontos(quanto, idMissao) {
  const p = lerProgresso();
  p.pontos = Math.max(0, (p.pontos || 0) + quanto);
  if (idMissao && !p.missoes.includes(idMissao)) p.missoes.push(idMissao);
  salvarProgresso(p);
  return p;
}

/* --- limpeza -------------------------------------------------- */

export function limpar(alvo) {
  if (alvo === "ajustes" || alvo === "tudo") localStorage.removeItem(CHAVE_AJUSTES);
  if (alvo === "bancada" || alvo === "tudo") localStorage.removeItem(CHAVE_BANCADA);
  if (alvo === "museu" || alvo === "tudo") localStorage.removeItem(CHAVE_MUSEU);
  if (alvo === "tudo") localStorage.removeItem(CHAVE_PROGRESSO);
  if (alvo === "tudo" && "caches" in window) {
    caches.keys().then((nomes) => nomes.forEach((n) => caches.delete(n)));
  }
}

export const PATENTES = [
  { min: 0,    nome: "Cadete de solda" },
  { min: 120,  nome: "Tecnico de bordo" },
  { min: 400,  nome: "Engenheiro junior" },
  { min: 900,  nome: "Mestre da bancada" },
  { min: 1800, nome: "Hacker da nave" },
];

export function patenteDe(pontos) {
  let atual = PATENTES[0].nome;
  for (const p of PATENTES) if (pontos >= p.min) atual = p.nome;
  return atual;
}
