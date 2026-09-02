/* ============================================================
   ICONES — desenhos SVG proprios, sem biblioteca externa.
   Traco reto, cantos duros, cinza com um detalhe claro:
   a mesma linguagem visual dos icones de sistema dos anos 90.
   Todos usam currentColor no traco, entao herdam a cor do botao.
   ============================================================ */

const A = "var(--fosforo)";   // detalhe verde
const F = "var(--gelo)";      // detalhe frio

const D = {
  robo: `<rect x="4" y="6" width="16" height="12" rx="2"/><rect x="7" y="9" width="10" height="6" stroke="${A}"/><path d="M12 6V3"/><circle cx="12" cy="2.5" r="1.5" fill="currentColor" stroke="none"/><path d="M4 12H2v4M20 12h2v4"/>`,
  placa: `<rect x="3" y="4" width="18" height="16" rx="1"/><rect x="7" y="8" width="10" height="8" fill="${A}" fill-opacity=".25" stroke="${A}"/><path d="M3 8h2M3 12h2M3 16h2M19 8h2M19 12h2M19 16h2"/>`,
  motor: `<rect x="3" y="7" width="12" height="10" rx="1"/><path d="M15 10h4v4h-4"/><path d="M19 12h2"/><circle cx="9" cy="12" r="3" stroke="${A}"/>`,
  sensor: `<rect x="3" y="8" width="18" height="9" rx="1"/><circle cx="8" cy="12.5" r="2.5" stroke="${F}"/><circle cx="16" cy="12.5" r="2.5" stroke="${F}"/><path d="M7 17v3M12 17v3M17 17v3"/>`,
  led: `<path d="M8 13V7a4 4 0 018 0v6" stroke="${A}"/><path d="M8 13h8v3H8z"/><path d="M10 16v5M14 16v5"/><path d="M4 5l2 2M20 5l-2 2M3 11h2"/>`,
  jumper: `<path d="M4 18c0-7 5-12 8-12s8 5 8 12" stroke="${A}"/><rect x="2" y="17" width="4" height="5" rx="1"/><rect x="18" y="17" width="4" height="5" rx="1"/>`,
  energia: `<path d="M13 2L5 13h6l-2 9 8-11h-6l2-9z" stroke="${A}"/>`,
  passivo: `<path d="M2 12h4M18 12h4"/><rect x="6" y="9" width="12" height="6" rx="1"/><path d="M9 9v6M12 9v6M15 9v6" stroke="${F}"/>`,
  audio: `<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9a4 4 0 010 6" stroke="${A}"/><path d="M18.5 6.5a8 8 0 010 11" stroke="${A}"/>`,
  ferramenta: `<path d="M14 3a5 5 0 00-5 7L3 16l3 3 6-6a5 5 0 007-5l-3 3-3-1-1-3 3-3z" stroke="${A}"/>`,
  ajustes: `<circle cx="12" cy="12" r="3.5" stroke="${A}"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>`,
  lixo: `<path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7l1 14h10l1-14"/><path d="M10 11v6M14 11v6" stroke="${F}"/>`,
  mais: `<path d="M12 5v14M5 12h14"/>`,
  menos: `<path d="M5 12h14"/>`,
  enquadrar: `<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/><rect x="9" y="9" width="6" height="6" stroke="${A}"/>`,
  raiox: `<rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 12h18" stroke="${A}" stroke-dasharray="2 2"/><path d="M8 5v14M16 5v14" stroke="${A}" stroke-dasharray="2 2"/>`,
  organizar: `<path d="M3 7h6c6 0 6 10 12 10" stroke="${A}"/><path d="M3 12h4M3 17h4"/><path d="M18 14l3 3-3 3"/>`,
  girar: `<path d="M20 12a8 8 0 10-3 6"/><path d="M20 6v6h-6" stroke="${A}"/>`,
  exportar: `<path d="M12 16V4"/><path d="M8 8l4-4 4 4" stroke="${A}"/><path d="M4 15v4h16v-4"/>`,
  importar: `<path d="M12 4v12"/><path d="M8 12l4 4 4-4" stroke="${A}"/><path d="M4 15v4h16v-4"/>`,
  imagem: `<rect x="3" y="5" width="18" height="14" rx="1"/><circle cx="8.5" cy="10" r="1.5" stroke="${A}"/><path d="M5 17l4.5-5 3.5 3 3-2 3 4" stroke="${A}"/>`,
  salvar: `<path d="M4 4h13l3 3v13H4z"/><path d="M8 4v6h8V4" stroke="${F}"/><rect x="8" y="14" width="8" height="6"/>`,
  limpar: `<path d="M6 8l1 12h10l1-12"/><path d="M4 8h16"/><path d="M14 3l3 3-2 2-3-3z" stroke="${A}"/>`,
  github: `<path d="M9 20c-4 1-4-2-6-2m12 4v-4c0-1 .1-1.6-.5-2.2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 00-1.3-3.2 4.3 4.3 0 00-.1-3.2s-1-.3-3.4 1.3a11.6 11.6 0 00-6 0C6.3 3.1 5.3 3.4 5.3 3.4a4.3 4.3 0 00-.1 3.2A4.6 4.6 0 003.9 9.8c0 4.6 2.7 5.7 5.5 6-.4.4-.6.9-.6 1.5V22"/>`,
  buscar: `<circle cx="11" cy="11" r="6" stroke="${A}"/><path d="M16 16l5 5"/>`,
  fechar: `<path d="M6 6l12 12M18 6L6 18"/>`,
  som: `<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9a4 4 0 010 6" stroke="${A}"/>`,
  mudo: `<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9l5 6M21 9l-5 6" stroke="${A}"/>`,
  falar: `<rect x="9" y="3" width="6" height="10" rx="3" stroke="${A}"/><path d="M5 11a7 7 0 0014 0"/><path d="M12 18v3M8 21h8"/>`,
  info: `<circle cx="12" cy="12" r="9"/><path d="M12 11v6" stroke="${A}"/><circle cx="12" cy="7.5" r="1" fill="currentColor" stroke="none"/>`,
  pecas: `<rect x="3" y="4" width="18" height="6" rx="1"/><rect x="3" y="14" width="18" height="6" rx="1"/><path d="M10 7h4M10 17h4" stroke="${A}"/>`,
  bancada: `<path d="M3 10h18"/><path d="M5 10v10M19 10v10"/><rect x="6" y="4" width="12" height="6" rx="1" stroke="${A}"/>`,
  multimetro: `<rect x="4" y="3" width="16" height="18" rx="2"/><rect x="7" y="6" width="10" height="5" stroke="${A}"/><circle cx="12" cy="16" r="3"/><path d="M12 13v3"/>`,
};

export function ico(nome, tamanho) {
  const corpo = D[nome] || D.info;
  const s = tamanho || 24;
  return `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true">${corpo}</svg>`;
}

/* Retrato do robo usado na marca e no boot (versao pequena do favicon) */
export function selo(s = 26) {
  return `<svg viewBox="0 0 120 120" width="${s}" height="${s}" aria-hidden="true">
<rect width="120" height="120" rx="14" fill="var(--vacuo)"/>
<rect x="56" y="14" width="8" height="20" fill="var(--grafite)"/><circle cx="60" cy="12" r="7" fill="var(--grafite)"/>
<path d="M26 58 L14 58 L14 78M94 58 L106 58 L106 78" fill="none" stroke="var(--grafite)" stroke-width="6" stroke-linecap="round"/>
<rect x="24" y="30" width="72" height="58" rx="7" fill="var(--casco-alto)" stroke="var(--luz)" stroke-width="4"/>
<rect x="34" y="40" width="52" height="38" rx="3" fill="var(--vacuo)" stroke="var(--fosforo)" stroke-width="3"/>
<rect x="44" y="50" width="9" height="10" fill="var(--fosforo)"/><rect x="67" y="50" width="9" height="10" fill="var(--fosforo)"/>
<rect x="50" y="68" width="20" height="4" fill="var(--fosforo)"/>
<rect x="36" y="88" width="16" height="10" rx="2" fill="var(--grafite)"/><rect x="68" y="88" width="16" height="10" rx="2" fill="var(--grafite)"/>
</svg>`;
}
