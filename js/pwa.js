/* ============================================================
   PWA — instalar no dispositivo e funcionar sem internet.
   O caminho do service worker e relativo de proposito: assim o site
   funciona tanto em usuario.github.io/oficina-metal-gabutron/ quanto
   em qualquer subpasta, sem editar nada.
   ============================================================ */

let convite = null;

export function registrarPwa() {
  if (!("serviceWorker" in navigator)) return;
  if (location.protocol === "file:") return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js", { scope: "./" })
      .catch((e) => console.warn("Service worker nao registrado:", e));
  });
}

export function prepararInstalacao(botao) {
  if (!botao) return;

  window.addEventListener("beforeinstallprompt", (ev) => {
    ev.preventDefault();
    convite = ev;
    botao.hidden = false;
    botao.title = "Instalar no dispositivo";
  });

  botao.addEventListener("click", async () => {
    if (!convite) return;
    convite.prompt();
    await convite.userChoice;
    convite = null;
    botao.hidden = true;
  });

  window.addEventListener("appinstalled", () => { botao.hidden = true; });

  // Safari no iPhone e iPad nao dispara o convite: instala-se pelo
  // menu Compartilhar. Mostramos a instrucao no lugar do botao.
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const jaInstalado = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  if (ios && !jaInstalado) {
    botao.hidden = false;
    botao.title = "No iPhone: Compartilhar, depois Adicionar a Tela de Inicio";
    botao.addEventListener("click", () => {
      alert("Para instalar no iPhone ou iPad: toque em Compartilhar e escolha Adicionar a Tela de Inicio.");
    });
  }
}
