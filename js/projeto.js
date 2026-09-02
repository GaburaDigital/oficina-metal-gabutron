/* ============================================================
   PROJETO — guardar e trocar montagens.
   PNG serve para colar no caderno e mostrar para a turma.
   JSON serve para o colega abrir a montagem e continuar de onde
   voce parou. E o mesmo arquivo que o professor pode recolher.
   ============================================================ */

import { serializar, carregar, exportarPNG } from "./bancada.js";
import { SOM } from "./som.js";

function baixar(nome, url) {
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

const carimbo = () => new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");

export async function salvarPng() {
  const url = await exportarPNG(2);
  if (!url) return false;
  baixar(`bancada-gabutron-${carimbo()}.png`, url);
  SOM.sucesso();
  return true;
}

export function salvarJson() {
  const dados = serializar();
  if (!dados.comps.length) return false;
  const url = URL.createObjectURL(new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" }));
  baixar(`projeto-gabutron-${carimbo()}.json`, url);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  SOM.sucesso();
  return true;
}

export function abrirJson(aoTerminar) {
  const campo = document.createElement("input");
  campo.type = "file";
  campo.accept = "application/json,.json";
  campo.addEventListener("change", () => {
    const arquivo = campo.files && campo.files[0];
    if (!arquivo) return;
    const leitor = new FileReader();
    leitor.onload = () => {
      try {
        const ok = carregar(JSON.parse(leitor.result));
        aoTerminar(ok, ok ? arquivo.name : "Esse arquivo nao e uma montagem do GabuTRON.");
        if (ok) SOM.sucesso(); else SOM.erro();
      } catch (e) {
        aoTerminar(false, "Nao consegui ler esse arquivo. Ele pode estar corrompido.");
        SOM.erro();
      }
    };
    leitor.readAsText(arquivo);
  });
  campo.click();
}
