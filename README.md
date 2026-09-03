# Oficina do Metal GabuTRON

Aplicação web para treinar eletrônica e robótica montando circuitos numa bancada virtual.

O aluno assume o papel de assistente do **Metal GabuTRON**, o engenheiro chefe de uma nave — uma TV de tubo com bracinhos, humor seco e quarenta anos de bancada nas costas. Ele passa tarefas, explica componente, avisa quando o circuito vai dar errado e comenta o resultado.

A aplicação roda inteira no navegador. Não tem servidor, não tem banco de dados, não tem conta para criar. Publicada no GitHub Pages, é um endereço que o aluno abre na sala e continua em casa, no computador ou no celular, com a montagem salva no próprio navegador.

**Endereço de publicação:** `https://gaburadigital.github.io/oficina-metal-gabutron/`

---

## O que a aplicação faz

| Recurso | Estado |
|---|---|
| Bancada com arrastar, girar, aproximar e lixeira | Fase 1 |
| Gavetas e caixas organizadoras no lugar de menu | Fase 1 |
| Protoboard de 400 pontos furo a furo, com modo Raio-X | Fase 1 |
| Jumpers com regra física de encaixe (M-M, M-F, F-F, jacaré) | Fase 1 |
| Botão Energizar bancada, com LEDs, telas e motores reagindo | Fase 1 |
| Metal GabuTRON com expressões, texto digitado e voz sintetizada | Fase 1 |
| Exportar a montagem em PNG e em JSON, e reabrir o JSON | Fase 1 |
| Instalação como aplicativo (PWA) e uso sem internet | Fase 1 |
| Ajustes salvos: som, modo claro, tempo, dificuldade, voz | Fase 1 |
| Missões de construção com checklist verificável e pontuação | Fase 2 |
| Painel de firmware de teste (nível alto, baixo, PWM, entrada) | Fase 2 |
| Corrente real, limite por pino, curto-circuito e fumaça | Fase 2 |
| Museu dos Desastres e sistema de patentes | Fase 2 |
| Orçamento de créditos por missão | Fase 2 |
| Missões de manutenção, multímetro e solda | Fase 3 |
| Biblioteca completa de componentes e projetos avançados | Fase 4 |

---

## Rodar na sua máquina

A aplicação usa módulos JavaScript nativos, então abrir o `index.html` com dois cliques não funciona. Rode um servidor local:

```bash
python3 -m http.server 8000
```

e abra `http://localhost:8000`.

---

## Estrutura do repositório

```
oficina-metal-gabutron/
├── index.html              página única da aplicação
├── manifest.json           dados de instalação como aplicativo
├── sw.js                   funcionamento sem internet
├── catalogo.json           ÍNDICE DO CONTEÚDO — é aqui que você mexe
│
├── ATIVIDADES/             TODO O CONTEÚDO EDITÁVEL
│   ├── COMPONENTES/        textos que o GabuTRON fala sobre cada peça
│   ├── CONSTRUCAO/         missões de montar (Fase 2)
│   ├── MANUTENCAO/         missões de consertar (Fase 3)
│   └── CURIOSIDADES/       falas soltas e comentários de bancada
│
├── assets/
│   ├── favicon.svg         ícone completo do GabuTRON
│   ├── favicon-16.svg      versão simplificada para tamanho pequeno
│   └── icone-pwa.svg       ícone do aplicativo instalado
│
├── css/
│   ├── tokens.css          cores, tipografia e espaçamento (modo claro aqui)
│   ├── base.css            reset, botões, campos, janelas
│   ├── layout.css          grade da tela e responsividade
│   ├── missao.css          painel de missão, firmware e museu
│   └── boot.css            tela de partida
│
└── js/
    ├── app.js              liga tudo; nenhuma regra de eletrônica aqui
    ├── config.js           ajustes e memória do navegador
    ├── biblioteca.js       MEDIDAS E PINAGEM DOS COMPONENTES
    ├── desenhos.js         desenho SVG de cada peça
    ├── circuito.js         motor elétrico: nós, tensão, corrente, diagnóstico
    ├── danos.js            queima, fumaça e Museu dos Desastres
    ├── missoes.js          motor de missões: regras, checklist, pontuação
    ├── firmware.js         painel de estado dos pinos da placa
    ├── museu.js            galeria das peças perdidas
    ├── bancada.js          arrastar, girar, zoom, fios, exportar
    ├── fios.js             regras de encaixe dos jumpers
    ├── gavetas.js          painel de peças
    ├── gabutron.js         retrato, expressões e falas
    ├── conteudo.js         leitura do catálogo e das ATIVIDADES
    ├── ajustes.js          janela de configuração
    ├── projeto.js          exportar e importar montagem
    ├── som.js              efeitos sonoros sintetizados
    ├── voz.js              fala sintetizada
    ├── boot.js             sequência de partida
    ├── icones.js           ícones da interface
    └── pwa.js              instalação e cache
```

---

## Como adicionar conteúdo

O GitHub Pages é um servidor estático: ele não sabe listar o que existe numa pasta. Por isso o `catalogo.json` funciona como índice.

**São sempre dois passos:**

1. Coloque o arquivo `.json` na pasta certa dentro de `ATIVIDADES/`.
2. Escreva uma linha no `catalogo.json` apontando para ele.

Exemplo — adicionando uma missão nova:

```json
{
  "id": "abajur-inteligente",
  "titulo": "Abajur que acende sozinho",
  "arquivo": "ATIVIDADES/CONSTRUCAO/abajur-inteligente.json",
  "dificuldade": "facil",
  "minutos": 15,
  "pontos": 110,
  "resumo": "LDR, transistor e uma lâmpada que decide a hora de acender.",
  "componentes": ["gaburino", "ldr", "resistor", "led"]
}
```

Os metadados ficam no catálogo de propósito: assim o menu de missões carrega lendo **um único arquivo**, e a missão inteira só é baixada quando o aluno clica nela. Com centenas de exercícios, a abertura continua instantânea.

Para escrever o texto que o GabuTRON fala sobre uma peça, edite `ATIVIDADES/COMPONENTES/basico.json`. A chave é o `id` do componente, e os três campos são `curiosidade`, `uso` e `tecnico` — exatamente os três botões do painel dele.

---

## Como adicionar um componente novo

Todo componente vive em dois lugares:

**1. O modelo técnico**, em `js/biblioteca.js`:

```js
add({
  id: "meu-sensor",
  nome: "Sensor de fumaca",
  caixa: "sensores",          // em qual gaveta ele aparece
  arte: "modulo",             // desenho reaproveitado
  w: 190, h: 90,
  cor: "#1B4E8A",
  alimenta: 4.5,              // tensão mínima para funcionar
  pinos: [
    { id: "vcc", n: "VCC", x: 60, y: 86, r: "macho", papel: "v+" },
    { id: "gnd", n: "GND", x: 92, y: 86, r: "macho", papel: "gnd" },
    { id: "out", n: "OUT", x: 124, y: 86, r: "macho", papel: "digital" }
  ]
});
```

O campo `r` é a receptividade física do contato, e é o que faz a regra de jumper funcionar: `femea` recebe ponta macho, `macho` recebe ponta fêmea, `borne` aceita fio descascado, `pad` aceita garra jacaré.

**2. O texto**, em `ATIVIDADES/COMPONENTES/basico.json`, usando o mesmo `id`.

Se a peça se parece com algo que já existe, reaproveite a arte `modulo` e mude só a cor — é assim que a maioria dos módulos foi feita. Desenho novo só quando a forma importa mesmo, como o LED, o servo e a protoboard.


---

## Como o motor elétrico funciona

Quatro passos, dentro de `js/circuito.js`:

1. **Nós.** Junta tudo o que está eletricamente no mesmo ponto: as fileiras de cinco furos da protoboard, os trilhos, as ligações internas das peças e os fios.
2. **Tensão.** Aplica as fontes. Baterias e trilhos de alimentação são fontes fixas. Os pinos da placa viram fonte quando o aluno os configura no painel Firmware.
3. **Corrente.** Monta um grafo em que os nós são os pontos e os componentes de dois terminais são os caminhos. Percorre cada caminho da fonte até o GND e aplica a lei de Ohm.
4. **Diagnóstico.** Compara cada corrente e cada tensão com o limite da peça.

O que ele deliberadamente **não** faz: análise nodal completa, transistor como amplificador, corrente alternada. O objetivo é o aluno entender caminho de corrente, não projetar fonte chaveada.

### O que a bancada detecta

| Situação | O que acontece |
|---|---|
| LED sem resistor | corrente dispara, GabuTRON alerta, peça queima na segunda vez |
| Resistor dissipando mais de 0,25 W | queima |
| Capacitor eletrolítico invertido | estoura |
| Pino da placa acima do limite (40 mA na GaburINO, 12 na Bura32, 5 na MicroBURA) | o pino morre e some do painel Firmware |
| 5 V chegando num pino de placa de 3,3 V | a entrada morre |
| Alimentação caindo direto no GND | curto-circuito |
| Alimentação externa sem GND comum com a placa | aviso explicando por que o sinal não funciona |
| Sinal de servo fora de pino PWM | aviso |

### A regra do primeiro aviso

O aluno sempre tem **um aviso antes**. Ao energizar com um erro grave, a bancada desliga sozinha, o GabuTRON explica o que ia acontecer e nada queima. Se ele energizar de novo com o mesmo erro, aí a peça se perde e vai para o Museu dos Desastres. Errar tem preço, mas não um preço que faz desistir.

---

## O painel Firmware de teste

Não é programação. É um painel de bancada onde o aluno diz em que estado cada pino da placa está: **nível alto**, **nível baixo**, **PWM** com ciclo ajustável de 0 a 255, ou **entrada**.

Isso resolve um problema real: sem alguma coisa acionando o pino, um LED ligado no pino 8 nunca acenderia e o aluno não entenderia por quê. E força o aprendizado que interessa — que servo pede PWM, que sensor analógico pede entrada analógica, e que nem todo pino faz tudo.

---

## Como escrever uma missão

Cada objetivo é uma **regra declarativa** verificada contra o circuito. Você escreve exercício novo em JSON, sem tocar em código.

```json
{
  "id": "gnd-comum",
  "texto": "GND das pilhas e GND da placa no mesmo ponto",
  "regra": {
    "tipo": "mesmoNo",
    "a": { "componente": "suporteaa", "pino": "n" },
    "b": { "componente": "gaburino", "papel": "gnd" }
  }
}
```

Regras disponíveis:

| Tipo | Campos | Verifica |
|---|---|---|
| `existe` | `componente`, `n` | a peça está na bancada |
| `mesmoNo` | `a`, `b` | dois pontos estão eletricamente ligados |
| `ligado` | `componente`, `n` | a peça está energizada e funcionando |
| `aceso` | `componente`, `n` | o LED acendeu |
| `pinoEm` | `componente`, `pino`, `papelAlvo` | o sinal chegou no tipo certo de pino |
| `tensaoEm` | `componente`, `pino`, `min`, `max` | a tensão está na faixa |
| `firmware` | `componente`, `modo`, `n` | pinos configurados naquele modo |
| `semCriticos` | — | nenhum limite estourado |

Em `a` e `b` você identifica o ponto por `componente` mais `pino` (o id exato) **ou** `papel` (qualquer pino daquele tipo, útil para GND) **ou** `nome` (o texto impresso na placa).

Os outros campos da missão: `briefing` e `sucesso` são falas do GabuTRON; `dicas` é uma lista consumida em ordem, e cada dica pedida custa 15% da pontuação; `componentesLiberados` restringe as gavetas; `creditos` liga o orçamento do laboratório.

**Pontuação:** valor base × multiplicador da dificuldade (novato 0,7 · fácil 1 · intermediário 1,4 · hacker 2), menos 15% por dica, menos 20 por peça queimada, mais bônus pelo tempo restante.

---

## Missões prontas

| Missão | Dificuldade | O que ensina |
|---|---|---|
| A primeira luz da nave | novato | fonte, carga, retorno e por que o resistor existe |
| Farol de emergência do corredor | fácil | a placa aciona por pino, não por trilho |
| Sirene do deck de carga | fácil | o que cabe no limite de corrente de um pino |
| Dimmer do painel da ponte | intermediário | PWM e ciclo de trabalho |
| O bracinho que eu perdi | intermediário | alimentação externa, GND comum e sinal em PWM |

As três primeiras formam uma sequência: acender, acionar, medir o limite. A quarta e a quinta se completam de propósito — o buzzer cabe no pino, o servo não. A diferença entre os dois é a lição inteira da bancada.

---

## Atalhos

| Tecla | Ação |
|---|---|
| `R` | gira a peça selecionada |
| `Delete` | joga a peça selecionada na lixeira |
| `Esc` | cancela o fio que está sendo puxado |
| roda do mouse | aproxima e afasta |
| arrastar o fundo | move a bancada |
| dois dedos | zoom no tablet e no celular |
| `GABURA` durante a partida | um recado escondido |

---

## Compatibilidade

Testado em **Chrome** e **Safari**, no computador e em telas de toque.

Duas observações que valem para a sala:

- No Safari e no iOS, o som e a voz só começam a funcionar depois do primeiro toque na tela. A sequência de partida já serve como esse toque; o botão **Falar** garante o resto.
- A instalação como aplicativo no iPhone e no iPad é pelo menu **Compartilhar → Adicionar à Tela de Início**. No Chrome, aparece um botão de instalar na barra superior.

Em telas menores que 900 pixels a interface vira três abas na base: **Peças**, **Bancada** e **GabuTRON**. O GabuTRON avisa logo na entrada que montar com protoboard rende bem mais no computador da sala.

---

## Sobre os ajustes salvos

Ficam guardados no navegador do aluno, separados em três chaves:

- `gabutron.ajustes` — som, voz, modo claro, texto digitado, tempo de treino, dificuldade
- `gabutron.bancada` — a montagem atual, salva sozinha alguns segundos depois de cada mudança
- `gabutron.progresso` — pontos e patente

Na janela de ajustes existem duas limpezas: **apagar a bancada salva** (mantém as preferências) e **limpar tudo** (zera as três chaves e o cache do aplicativo). Nada sai do computador do aluno.

---

## Patentes

| Pontos | Patente |
|---|---|
| 0 | Cadete de solda |
| 120 | Técnico de bordo |
| 400 | Engenheiro júnior |
| 900 | Mestre da bancada |
| 1800 | Hacker da nave |

---

Criado por **GABURA**. Mais exercícios em [sites.google.com/view/links-gabura](https://sites.google.com/view/links-gabura).

Código aberto sob licença MIT.
