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
| Multímetro com quatro modos e pontas de prova | Fase 3 |
| Ferro de solda para uniões permanentes | Fase 3 |
| Missões de manutenção com defeitos escondidos | Fase 3 |
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
| Tensão abaixo do mínimo numa entrada de energia | aviso: o regulador não consegue trabalhar |
| Tensão acima do máximo numa entrada de energia | o regulador queima |
| Sinal de servo fora de pino PWM | aviso |

### A regra do primeiro aviso

O aluno sempre tem **um aviso antes**. Ao energizar com um erro grave, a bancada desliga sozinha, o GabuTRON explica o que ia acontecer e nada queima. Se ele energizar de novo com o mesmo erro, aí a peça se perde e vai para o Museu dos Desastres. Errar tem preço, mas não um preço que faz desistir.

---

## Como a placa é alimentada

Clicando numa placa aparece a faixa de propriedades, e nela a chave do cabo USB. Isso reproduz a escolha real da bancada: durante o teste a placa vive pendurada no computador, mas um projeto que anda precisa de energia própria.

| Placa | Formas de alimentar | Faixa aceita |
|---|---|---|
| GaburINO | cabo USB, plugue redondo, pino VIN | 7 a 12 V nas entradas externas |
| Bura32 | cabo USB, pino VIN | 5 V |
| MicroBURA | cabo USB, conector de bateria no topo | 3 a 3,3 V |

Com o USB desligado, o circuito só funciona se a alimentação externa estiver correta — e é aí que o aluno descobre que quatro pilhas AA não ligam um GaburINO pelo plugue, porque 6 V não bastam para o regulador produzir 5 V.

Ao energizar, um cabo USB aparece desenhado ao lado da placa quando ela está sendo alimentada por ele, e um raio aparece sobre a fonte quando a energia vem de fora.

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

## O que existe na oficina

95 componentes distribuídos em dez gavetas e caixas, todos com pinagem fiel e encaixe real na protoboard.

| Móvel | Peças | Destaques |
|---|---|---|
| Gaveta das placas | 7 | GaburINO, Bura32, MicroBURA + expansão, Arubag Pi 95x, protoboard, placa perfurada |
| Caixa de LEDs e telas | 8 | LED, LED RGB, Neopixel, laser, LCD I2C, LCD 16 pinos, TFT touch, e-paper |
| Caixa dos sensores | 10 | ultrassônico, IR de obstáculo e de linha, cor, PIR, DHT, umidade do solo, MPU-6050, LDR, som |
| Gaveta dos motores | 10 | DC, com redução, de drone, servos 180 e 360, alto torque, motor de passo, bomba, vibração |
| Caixa da energia | 14 | ponte H, relé, reguladores, stepdown, stepup, fontes, baterias, célula solar, expansão de servos |
| Caixinha dos componentes | 7 | resistor, capacitores, diodo, zener, indutor, transistor |
| Caixa de botões e chaves | 8 | botão, arcade, gangorra, chave de 3 pinos, potenciômetro, joystick, teclado 4x4, encoder |
| Caixa do som | 6 | buzzer ativo e passivo, alto-falante, amplificador, DFPlayer, gravador de voz |
| Caixa de comunicação | 4 | HC-06, ESP-01, ethernet, rádio NRF24L01 |
| Gaveta das tranqueiras | 4 | cartão SD, pen drive, caixa bluetooth, clipe de papel |

A **placa perfurada** é a única cuja ilhas são isoladas entre si: nela só a solda liga um ponto ao outro. É o passo seguinte à protoboard.

Peças que dependem de outra para funcionar, como no laboratório de verdade:

| Peça | Precisa de |
|---|---|
| Motor de passo | driver ULN2003 — ele não liga direto na placa |
| Sonda de umidade | módulo de leitura, ligada nos dois bornes |
| Fonte de protoboard | uma fonte de entrada: ela regula, não gera |
| Regulador AMS1117, stepdown, stepup | entrada de energia acima da tensão de saída |
| Cartão SD, pen drive | encaixam no slot do módulo MP3 e da caixa de som |

**Suporte de pilhas e de bateria de lítio** têm o corpo **gerado por código**, porque o número de células muda com o ajuste: 1 a 6 pilhas AA (1,5 V cada), 1 a 4 células de lítio (3,7 V cada). A caixa cresce, as células aparecem e somem, a polaridade alterna e o rótulo mostra a conta pronta. Por isso essas duas peças são as únicas cujo desenho do assistente não é usado — um corpo estático não acompanha uma contagem variável.

**Fonte de bancada e multímetro** são instrumentos: peças que vão para a bancada e abrem um painel próprio quando selecionadas. A fonte ajusta tensão e limite de corrente; o multímetro tem os quatro modos e as duas pontas.

**Joystick e encoder** respondem ao toque com a bancada energizada: o manche arrasta nos dois eixos e volta ao centro sozinho, e o encoder gira arrastando para cima e para baixo.

## A ponte H de verdade

A ponte H agora aciona os motores. Com alimentação no `+12V`, GND comum com a placa de controle e `ENA` em nível alto, `IN1` e `IN2` decidem o sentido: um alto e outro baixo faz a saída inverter, e o motor gira para o outro lado. Iguais entre si é freio. `ENA` em PWM controla a velocidade.

Duas regras estão implementadas porque são as que os alunos erram:

- **Sem GND comum, a ponte não obedece.** Os sinais `IN` não têm referência nenhuma, e é isso que causa motor tremendo ou parado na bancada real.
- **Motor DC não tem polaridade.** Inverter os dois fios só troca o sentido de giro, e é exatamente isso que a ponte H faz por dentro.

## Pontas soltas

Com um cabo na mão, clicar num ponto vazio da bancada deixa a ponta pendurada ali. Ela vira um ponto de ligação onde outros fios se penduram — garra jacaré, ponta macho e ponta fêmea ao mesmo tempo. É a gambiarra clássica do laboratório, e agora ela cabe no simulador. A ponta some sozinha quando o último fio sai dela.

## Marcadores: o que a bancada anima

O desenho de cada peça é estático, mas quatro coisas precisam reagir à energia: **eixo de giro**, **luz de ligado**, **som** e **vibração**. Elas são desenhadas por cima, a partir de marcadores que você posiciona no assistente.

Cada tipo de motor gira do seu jeito, e a animação roda no próprio SVG — sem laço em JavaScript e sem travar a bancada:

| Marcador | Comportamento |
|---|---|
| `servo` | braço de uma pá varrendo 170 graus |
| `servo360` | braço de duas pás girando sem parar |
| `dc` | eixo em cruz girando rápido |
| `helice` | pás de motor de drone |
| `passo` | disco entalhado avançando em passos |
| `rotor` | hélice da bomba submersa |
| `vibra` | tremor curto do motor de vibração |
| `ajuste` | painel que mostra o efeito do ajuste: tensão escolhida, número de pilhas |
| `botao` | posição de um botão físico da peça (RESET, EN, A, B) |
| `encaixe` | posição de uma entrada: HDMI, USB, cartão |

Botão e entrada podem ser **arrastados** no assistente, mas não apagados: eles são estruturais.

Os marcadores do desenho revisado mandam em cada **tipo** que definem, e a biblioteca preenche os tipos que faltarem. Assim dá para redesenhar uma peça sem perder o painel de ajuste nem o eixo do motor.

No assistente, o botão **Marcador** cria; arrastar move; Delete remove. Isso resolve os dois casos: peça que ganhou luz sem ter, e peça que acende mas não tinha marcador.

## Ferro de solda e fio para solda

A regra é uma só, e não depende da ordem em que você clica:

| Na mão | O que o clique faz |
|---|---|
| só o ferro | solda dois contatos encostados |
| ferro + Fio para solda | traça fio soldado |
| qualquer jumper | traça fio normal |
| nada | mostra o que é aquele pino |

**Fio para solda** só aparece na sacola com o ferro ligado, entra em qualquer tipo de contato e não aceita ponta solta no ar. Guardar o ferro larga o fio junto.

## Encaixes mecânicos

Cartão, pen drive e cabo não usam fio: encaixam. As ligações vivem numa lista própria da bancada, então **qualquer ponta livre acha qualquer conector livre**, não importa a ordem. Encaixe o cabo na Arubag e depois solte a tela sobre a ponta que sobrou; ou encaixe primeiro na tela e leve o conjunto até a placa. Os dois caminhos funcionam.

Peças ligadas formam um **grupo rígido**: arrastar qualquer uma leva todas. Para separar, selecione uma delas e use **Soltar encaixes** nas propriedades.

## Cabo HDMI e encaixes

O conector HDMI da Arubag Pi e o da tela ficam **em pé**, então o cabo precisa ser girado com `R` antes de encaixar. Encaixando uma ponta e soltando a tela sobre a outra, as três peças passam a andar juntas: arrastar qualquer uma leva o conjunto.

Cada entrada aceita só o seu tipo: pen drive não entra em HDMI. A Arubag Pi tem as três — HDMI, USB e cartão SD. O cabo HDMI tem **duas pontas independentes**, cada uma encaixando num conector, e só entra se estiver na mesma orientação da entrada. Girar com `R` resolve.

## Peças que se mexem

Três componentes respondem ao toque, e isso permite montar circuito sem nenhuma placa de controle — só bateria, fios e peça:

| Peça | Como interagir | Comportamento |
|---|---|---|
| Botão | segure com o dedo ou o mouse | fecha enquanto pressionado, como no mundo real |
| Chave gangorra | clique | fica no estado que você deixou |
| Potenciômetro | arraste o botão redondo | o cursor gira e a corrente muda de verdade |

Uma bateria de 9 V, uma chave, um resistor e um LED já formam um circuito completo e funcional. É a montagem mais simples possível, e agora ela existe na bancada.

## O Deck de scripts

O painel **Firmware** ganhou duas abas. **Ajuste manual** é o que já existia: o aluno define pino a pino. **Deck de scripts** traz 17 programas prontos, filtrados pela placa que está na bancada.

Escolher um script não mostra código. Mostra a **lista de ligações que ele espera encontrar** — e é essa lista que o aluno confere contra a própria montagem. Se algo faltar, o circuito não reage, e isso é de propósito: o script confia na montagem.

| Placa | Scripts |
|---|---|
| Todas | Blink, Servo vai e vem, Distância no LCD |
| GaburINO | Seguidor de linha, Mão robótica, Plantação inteligente, Mini elevador |
| MicroBURA | Servo pelos botões, Bateria com piezo, Jogo da cobrinha |
| Bura32 | Casa inteligente, Mesa CNC, Estabilização de drone |
| Tema espacial | Caixa-preta da nave, Farol solar do casco, Rádio pirata, Sonar de atracagem |

Cada script **anima a bancada** quando o circuito está montado e energizado: LED pisca na cor da variante escolhida, servo varre, motor gira, display escreve, relé clica, cartão registra. Peça fora da lista de alvos do script não reage — e esse silêncio é a pista de que algo está faltando na montagem.

As ligações são **por placa e com o pino exato**: `sinal do servo no pino ~9`, `SDA no GPIO 21`, `ECHO com divisor de tensão`. Ligar em qualquer porta ensinaria o oposto da robótica real, então o deck diz onde vai cada coisa.

Missões podem marcar `usaScripts` no catálogo: quando o aluno abre o Firmware nelas, o painel já entra direto no deck.

## Módulos que não entram na protoboard

ESP-01, ENC28J60 e NRF24L01 têm barra de dois pinos separados por um passo. Na protoboard as duas fileiras cairiam na mesma coluna, ou seja, em curto — e isso vale no laboratório de verdade também. A bancada recusa o encaixe e o GabuTRON explica que esses módulos pedem jumper macho-fêmea ou placa adaptadora.

## O multímetro

O multímetro é uma **peça da caixa da energia**, não um botão da barra: o aluno arrasta o aparelho para a bancada, seleciona e clica em **abrir painel do multímetro**. Depois escolhe o modo e vai encostando as pontas nos contatos, a vermelha primeiro e a preta depois.

Cada ponta encostada desenha um **cabo espiralado** ligando o contato ao aparelho. Além de parecer o de verdade, isso resolve um problema prático: o cabo de medida não se confunde com os jumpers da montagem.

| Modo | O que responde | Exige |
|---|---|---|
| Continuidade | existe caminho entre estes dois pontos? apita se sim | bancada desligada |
| Tensão DC | quanta tensão há entre a ponta vermelha e a preta | bancada ligada |
| Resistência | quantos ohms há no caminho entre as pontas | bancada desligada |
| Corrente | quanta corrente passa pela peça entre as pontas | pontas nos dois terminais da mesma peça |

A regra de bancada é cobrada: medir continuidade ou resistência com o circuito energizado dá `ERR` e o GabuTRON explica que, na vida real, essa distração queima o aparelho. Medir corrente exige as duas pontas na mesma peça, porque o multímetro entra em série.

## O ferro de solda

Solda une dois contatos que estejam encostados, sem perguntar se a ponta é macho ou fêmea — estanho derretido não respeita formato. É o que resolve as ligações que jumper nenhum resolve. A união é permanente até o aluno clicar de novo na junta para dessoldar, e não se solda com o circuito ligado.

## Missões prontas

| Missão | Dificuldade | O que ensina |
|---|---|---|
| A primeira luz da nave | novato | fonte, carga, retorno e por que o resistor existe |
| Farol de emergência do corredor | fácil | a placa aciona por pino, não por trilho |
| Sirene do deck de carga | fácil | o que cabe no limite de corrente de um pino |
| Dimmer do painel da ponte | intermediário | PWM e ciclo de trabalho |
| O bracinho que eu perdi | intermediário | alimentação externa, GND comum e sinal em PWM |

As três primeiras formam uma sequência: acender, acionar, medir o limite. A quarta e a quinta se completam de propósito — o buzzer cabe no pino, o servo não. A diferença entre os dois é a lição inteira da bancada.

### Ao concluir

Terminando uma missão, aparece um resumo com os pontos ganhos, as dicas pedidas e as peças perdidas, e três caminhos: **continuar editando** a bancada, **refazer a missão** do zero, ou **próxima missão** — sorteada dentro do filtro que estiver escolhido.

### Por placa

| Placa | Missões |
|---|---|
| MicroBURA | brinquedos: bicho de estimação, pião luminoso, tambor de bolso, brinquedo surdo |
| Bura32 | automação: comporta do hangar, braço de carga, central de bordo, sensor cego |
| Arubag Pi | portáteis: cyberdeck de bolso, óculos de RA, deck de campo, deck sem imagem |

A janela de missões filtra por dificuldade, por tipo e por placa.

### Manutenção

| Missão | Dificuldade | O defeito | O que ensina |
|---|---|---|---|
| O buzzer que ficou mudo | novato | polaridade invertida | peça boa e circuito certo? olhe o lado |
| Sabotagem noturna | fácil | fio partido por dentro | só a continuidade acusa o invisível |
| O farol que mal acende | intermediário | resistor de 10 k no lugar de 220 | medir corrente responde o que olhar não responde |

Cada missão de manutenção chega com a bancada já montada e o defeito plantado. O botão **Limpar mesa** nesse modo não esvazia a bancada: devolve a montagem ao estado original, para o aluno recomeçar a investigação.

---

## Assistente de desenho de componentes

`ferramentas/assistente-desenho.html`

Ferramenta **isolada**, que não faz parte da aplicação. Serve para redesenhar as peças com calma e exportar o resultado. Abre com dois cliques, sem servidor: os 78 componentes vêm embutidos no próprio arquivo, porque um HTML local não consegue ler JSON externo.

**Mantendo atualizado.** O assistente é gerado a partir do catálogo. Sempre que um componente muda, rode:

```bash
node ferramentas/gerar-assistente.mjs
```

Isso reconstrói `assistente-desenho.html` com todas as peças atuais e com os desenhos já revisados como base. O molde da interface fica em `ferramentas/molde-assistente.html`.

**Como funciona.** Escolha a peça na lista da esquerda. O desenho atual é aberto e quebrado em formas editáveis. Cada elemento de primeiro nível vira uma forma; grupos entram como bloco, que dá para mover, girar e reordenar, mas não editar por dentro. Foi a troca que fez a ferramenta caber num arquivo só.

| Recurso | O que faz |
|---|---|
| Selecionar | escolhe, arrasta, redimensiona pela alça verde, apaga com Delete |
| Retângulo, círculo, linha | formas básicas soltas na mesa |
| Caneta | clique fixa um ponto, arrastar no clique curva o segmento; Enter fecha |
| Rótulo | texto editável, com tamanho e alinhamento |
| Luz de ligado | marca onde fica o LED indicador da peça |
| Remodelar | mostra os pontos de um traço da caneta e permite arrastar cada um |
| Áreas vivas | marca o que a bancada anima por cima: eixo de giro, luz, som, tela e zonas de toque |
| Copiar e colar | leva formas de um componente para outro (Ctrl+C, Ctrl+V) |
| Painel direito | preenchimento, traço, espessura, transparência, rotação, deslocamento |
| Camadas | ordem de empilhamento, subir, descer, ao topo, ao fundo, ocultar |
| Pinos | arraste para mover; os machos grudam na grade de 24 |

**Seleção múltipla.** Shift junta formas na seleção e arrastar move todas juntas. Ctrl+A seleciona tudo. O painel de propriedades não desfaz mais a seleção enquanto você digita.

**Os pinos são protegidos.** Dá para mover e renomear, não dá para apagar — apagar um pino quebraria o modelo elétrico. Pinos machos travam na grade de 24 porque fora dela a peça deixa de encaixar na protoboard.

**Salvar, abrir, exportar.** O progresso é guardado sozinho no navegador e também pode ser baixado como arquivo, para continuar em outro computador. **Exportar tudo** gera um único JSON com os 78 componentes: o corpo em SVG e a posição final dos pinos de cada um. É esse arquivo que volta para a conversa, e é a partir dele que os desenhos entram no projeto.

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
