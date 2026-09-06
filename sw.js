/* ============================================================
   SERVICE WORKER — deixa a oficina abrir sem internet.
   Ao publicar uma atualizacao, troque o numero da VERSAO abaixo.
   E a unica linha que voce precisa mexer para o navegador dos alunos
   pegar a versao nova.
   ============================================================ */

const VERSAO = "gabutron-v10";

const ARQUIVOS = [
  "./",
  "index.html",
  "manifest.json",
  "catalogo.json",
  "css/tokens.css",
  "css/base.css",
  "css/layout.css",
  "css/boot.css",
  "css/missao.css",
  "js/app.js",
  "js/config.js",
  "js/som.js",
  "js/voz.js",
  "js/icones.js",
  "js/desenhos.js",
  "js/biblioteca.js",
  "js/circuito.js",
  "js/fios.js",
  "js/bancada.js",
  "js/gavetas.js",
  "js/gabutron.js",
  "js/ajustes.js",
  "js/projeto.js",
  "js/conteudo.js",
  "js/boot.js",
  "js/pwa.js",
  "js/danos.js",
  "js/missoes.js",
  "js/firmware.js",
  "js/museu.js",
  "js/multimetro.js",
  "js/solda.js",
  "js/arte.js",
  "js/fonte-bancada.js",
  "assets/favicon.svg",
  "assets/favicon-16.svg",
  "assets/icone-pwa.svg",
  "ATIVIDADES/COMPONENTES/basico.json",
  "ATIVIDADES/CURIOSIDADES/falas-gabutron.json",
  "ATIVIDADES/CONSTRUCAO/primeira-luz.json",
  "ATIVIDADES/CONSTRUCAO/farol-de-emergencia.json",
  "ATIVIDADES/CONSTRUCAO/sirene-da-nave.json",
  "ATIVIDADES/CONSTRUCAO/dimmer-do-painel.json",
  "ATIVIDADES/CONSTRUCAO/braco-do-robo.json",
  "ATIVIDADES/MANUTENCAO/buzzer-mudo.json",
  "ATIVIDADES/MANUTENCAO/sabotagem-noturna.json",
  "ATIVIDADES/MANUTENCAO/farol-fraco.json",
  "ATIVIDADES/MANUTENCAO/drone-motor-queimado.json",
  "ATIVIDADES/CONSTRUCAO/seguidor-de-linha.json",
];

self.addEventListener("install", (ev) => {
  ev.waitUntil(
    caches.open(VERSAO)
      .then((c) => c.addAll(ARQUIVOS))
      .then(() => self.skipWaiting())
      .catch((e) => console.warn("Cache incompleto:", e))
  );
});

self.addEventListener("activate", (ev) => {
  ev.waitUntil(
    caches.keys()
      .then((nomes) => Promise.all(nomes.filter((n) => n !== VERSAO).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (ev) => {
  if (ev.request.method !== "GET") return;

  // Conteudo de ATIVIDADES busca a rede primeiro: assim, quando voce
  // publica um exercicio novo, o aluno recebe sem limpar o cache.
  if (ev.request.url.includes("/ATIVIDADES/") || ev.request.url.includes("catalogo.json")) {
    ev.respondWith(
      fetch(ev.request)
        .then((r) => {
          const copia = r.clone();
          caches.open(VERSAO).then((c) => c.put(ev.request, copia));
          return r;
        })
        .catch(() => caches.match(ev.request))
    );
    return;
  }

  ev.respondWith(
    caches.match(ev.request).then((achou) => achou || fetch(ev.request))
  );
});
