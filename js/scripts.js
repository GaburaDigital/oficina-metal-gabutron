/* ============================================================
   SCRIPTS — o deck de programas prontos.

   A ideia: o aluno nao escreve codigo aqui, mas precisa ver o circuito
   VIVO para entender se montou certo. Cada script diz duas coisas:
   quais pinos ele espera encontrar ligados, e o que ele faz com cada
   um. A bancada usa isso para mover servo, piscar LED, girar motor e
   escrever no display.

   Cada script tem:
     id, nome, placas    onde ele aparece
     resumo              uma linha do que faz
     ligacoes            POR PLACA, com o numero de cada pino. Isso e o
                         coracao didatico do deck: ligar em qualquer
                         porta ensinaria o oposto da robotica real
     pede                pecas que o script espera na bancada
     saidas              { pinoId: { modo, duty } } aplicado no firmware
     anima               o que a bancada anima quando o circuito esta
                         montado e energizado. "alvo" lista as pecas que
                         participam: peca fora dessa lista nao reage,
                         mesmo estando ligada
   ============================================================ */

export const SCRIPTS = [
  /* ---------- funcionam em qualquer placa ---------- */
  {
    id: "blink", nome: "Blink", placas: ["gaburino", "bura32", "microbura", "arubagpi"],
    resumo: "Pisca um LED. O primeiro programa de todo mundo.",
    ligacoes: {"gaburino": ["LED com resistor de 220 ohms no pino digital 13", "catodo do LED em qualquer GND da placa"], "bura32": ["LED com resistor de 220 ohms no GPIO 13", "catodo do LED num dos GND da placa"], "microbura": ["LED com resistor de 220 ohms no anel P0", "catodo do LED no anel GND"], "arubagpi": ["LED com resistor de 220 ohms no GPIO 18", "catodo do LED num dos GND da barra"]},
    pede: ["led", "resistor"],
    saidas: { gaburino: { t13: { modo: "alto" } }, bura32: { e13: { modo: "alto" } },
      microbura: { anel0: { modo: "alto" } }, arubagpi: { p9: { modo: "alto" } } },
    anima: { pisca: { dur: 1.0 }, alvo: ["led"] },
  },
  {
    id: "servo-vaivem", nome: "Servo vai e vem", placas: ["gaburino", "bura32", "microbura", "arubagpi"],
    resumo: "Gira o servo de um lado para o outro, sem parar.",
    ligacoes: {"gaburino": ["fio de sinal do servo no pino ~9 (PWM por hardware)", "fio vermelho do servo no positivo do suporte de pilhas", "fio preto do servo no negativo das pilhas", "negativo das pilhas tambem num GND da GaburINO"], "bura32": ["fio de sinal do servo no GPIO 26 (aceita PWM)", "fio vermelho do servo na fonte externa de 5 volts", "GND da fonte e GND da Bura32 no mesmo ponto"], "microbura": ["fio de sinal do servo no anel P0 (PWM)", "fio vermelho do servo na fonte externa, nunca no anel 3V", "GND da fonte no anel GND"], "arubagpi": ["fio de sinal do servo no GPIO 18 (o unico com PWM por hardware)", "alimentacao do servo por fora, com GND comum"]},
    pede: ["servo180"],
    saidas: { gaburino: { t9: { modo: "pwm", duty: 128 } }, bura32: { e10: { modo: "pwm", duty: 128 } },
      microbura: { anel0: { modo: "pwm", duty: 128 } }, arubagpi: { p9: { modo: "pwm", duty: 128 } } },
    anima: { servo: { modo: "varre", dur: 2.4 }, alvo: ["servo180", "servo360", "servo-torque180", "servo-torque360"] },
  },
  {
    id: "distancia-lcd", nome: "Distancia no LCD", placas: ["gaburino", "bura32", "arubagpi"],
    resumo: "Le o ultrassonico e escreve a distancia no display I2C.",
    ligacoes: {"gaburino": ["TRIG do ultrassonico no digital 7", "ECHO do ultrassonico no digital 8", "SDA do display no pino A4, SCL no pino A5", "VCC do sensor e do display no 5V, GND no GND"], "bura32": ["TRIG no GPIO 32, ECHO no GPIO 33", "ECHO devolve 5 volts: use divisor de tensao antes do GPIO", "SDA do display no GPIO 21, SCL no GPIO 22", "VCC do display no pino VIN de 5 volts"], "arubagpi": ["TRIG no GPIO 4, ECHO no GPIO 17 com divisor de tensao", "SDA no GPIO 2, SCL no GPIO 3", "VCC do display no pino de 5V da barra"]},
    pede: ["ultrassonico", "lcdi2c"],
    saidas: { gaburino: { t7: { modo: "alto" }, t8: { modo: "entrada" } },
      bura32: { e6: { modo: "alto" }, e7: { modo: "entrada" } }, arubagpi: { p5: { modo: "alto" } } },
    anima: { tela: ["DISTANCIA", "{d} cm"], contador: { de: 8, ate: 180, dur: 4, unidade: "cm" }, alvo: ["lcdi2c", "ultrassonico"] },
  },

  /* ---------- GaburINO ---------- */
  {
    id: "seguidor", nome: "Carro seguidor de linha", placas: ["gaburino"],
    resumo: "Le dois sensores de linha e corrige o rumo pelos motores.",
    ligacoes: {"gaburino": ["D0 do sensor esquerdo no digital 2, do direito no digital 4", "IN1 no digital 7 e IN2 no digital 8 (motor A)", "IN3 no digital 12 e IN4 no digital 13 (motor B)", "ENA no ~9 e ENB no ~10, os dois com PWM, ou deixe os jumpers de fabrica", "+12V da ponte H no positivo das pilhas, GND no negativo", "GND da ponte H tambem num GND da GaburINO", "VCC dos sensores no 5V da placa: eles sao carga leve"]},
    pede: ["ponteh", "ir-linha", "motordc"],
    saidas: { gaburino: { t7: { modo: "alto" }, t8: { modo: "baixo" }, t12: { modo: "alto" }, t13: { modo: "baixo" },
      t9: { modo: "pwm", duty: 190 }, t10: { modo: "pwm", duty: 190 } } },
    anima: { motor: { modo: "frente", dur: 0.4 }, tela: ["SEGUINDO A LINHA", "esq {a}  dir {b}"], contador: { de: 0, ate: 1, dur: 1.2, unidade: "" }, alvo: ["motordc", "ir-linha"] },
  },
  {
    id: "mao-robotica", nome: "Mao robotica", placas: ["gaburino"],
    resumo: "Move doze servos pela expansao I2C: dedos, punho e cotovelo.",
    ligacoes: {"gaburino": ["SDA da expansao no pino A4 e SCL no pino A5", "VCC da expansao no 5V da placa (so a logica)", "V+ da expansao numa fonte externa que segure todos os servos", "dez micro servos nos canais 0 a 9, dois de alto torque nos canais 10 e 11", "GND da fonte externa no GND da GaburINO"]},
    pede: ["expansao-servo", "servo180", "servo-torque180"],
    saidas: { gaburino: { A4: { modo: "alto" }, A5: { modo: "alto" } } },
    anima: { servo: { modo: "onda", dur: 3.2 }, alvo: ["servo180", "servo-torque180", "expansao-servo"] },
  },
  {
    id: "plantacao", nome: "Plantacao inteligente", placas: ["gaburino"],
    resumo: "Le a umidade do solo e liga a bomba quando a terra seca.",
    ligacoes: {"gaburino": ["A0 do sensor de umidade na entrada analogica A0", "D0 do sensor pode ficar livre: aqui interessa a leitura analogica", "IN do rele no digital 8, VCC no 5V e GND no GND", "bomba e fonte externa passando pelos contatos COM e NA do rele", "as duas hastes da sonda nos bornes SD1 e SD2 do modulo"]},
    pede: ["umidade-solo", "sonda-solo", "rele", "bomba"],
    saidas: { gaburino: { t8: { modo: "alto" }, A0: { modo: "analog" } } },
    anima: { motor: { modo: "bomba", dur: 0.6 }, rele: { dur: 3 }, contador: { de: 12, ate: 78, dur: 5, unidade: "%" }, alvo: ["bomba", "rele", "umidade-solo"] },
  },
  {
    id: "elevador", nome: "Mini elevador de carga", placas: ["gaburino"],
    resumo: "Tres botoes escolhem o andar e o servo de giro continuo sobe a plataforma.",
    ligacoes: {"gaburino": ["botao do andar 1 no digital 2, andar 2 no digital 3, andar 3 no digital 4", "cada botao com resistor de 10k para o GND (pull-down)", "sinal do servo de alto torque no ~9", "servo alimentado por fora, com GND comum"]},
    pede: ["botao", "servo-torque360"],
    saidas: { gaburino: { t9: { modo: "pwm", duty: 160 } } },
    anima: { servo: { modo: "gira", dur: 1.8 }, tela: ["ANDAR", "{d}"], contador: { de: 1, ate: 3, dur: 6, unidade: "" }, alvo: ["servo-torque360"] },
  },

  /* ---------- MicroBURA ---------- */
  {
    id: "servo-botoes", nome: "Controle do servo pelos botoes", placas: ["microbura"],
    resumo: "Botao A gira para um lado, botao B para o outro.",
    ligacoes: {"microbura": ["fio de sinal do servo no anel P0 (PWM)", "botoes A e B ja sao da placa: nao precisa ligar nada neles", "fio vermelho do servo na fonte externa, GND da fonte no anel GND"]},
    pede: ["servo180"],
    saidas: { microbura: { anel0: { modo: "pwm", duty: 128 } } },
    anima: { servo: { modo: "botoes", dur: 2.0 }, alvo: ["servo180"] },
  },
  {
    id: "bateria-piezo", nome: "Bateria com piezo", placas: ["microbura"],
    resumo: "Dois discos piezo viram tambores e o buzzer responde com a nota.",
    ligacoes: {"microbura": ["saida S do primeiro modulo piezo no anel P1 (entrada analogica)", "saida S do segundo modulo no anel P2", "cada disco piezo nos bornes PZ+ e PZ- do seu modulo", "buzzer passivo no anel P0 (PWM), negativo no anel GND", "VCC dos modulos no anel 3V"]},
    pede: ["piezo-modulo", "piezo", "buzzer-passivo"],
    saidas: { microbura: { anel0: { modo: "pwm", duty: 128 }, anel1: { modo: "entrada" }, anel2: { modo: "entrada" } } },
    anima: { som: { dur: 0.5 }, pisca: { dur: 0.5 }, alvo: ["buzzer-passivo", "piezo-modulo"] },
  },
  {
    id: "snake", nome: "Jogo da cobrinha", placas: ["microbura"],
    resumo: "Joystick move a cobra na tela TFT. Sim, da para jogar.",
    ligacoes: {"microbura": ["VRx do joystick no anel P1, VRy no anel P2 (entradas analogicas)", "SW do joystick no pino P8 da expansao", "tela TFT no SPI da expansao: SCK em P13, SDI em P15, CS em P16", "VCC do joystick e da tela no 3V, GND no GND"]},
    pede: ["joystick", "tft", "expansao-microbura"],
    saidas: { microbura: { anel1: { modo: "entrada" }, anel2: { modo: "entrada" } } },
    anima: { tela: ["SNAKE", "pontos {d}"], contador: { de: 0, ate: 40, dur: 8, unidade: "" }, alvo: ["tft"] },
  },

  {
    id: "cores-nos-botoes", nome: "Cores nos botoes", placas: ["microbura"],
    resumo: "Botao A pinta o LED de azul, botao B pinta de verde.",
    ligacoes: {
      microbura: [
        "canal G do LED RGB no anel P1",
        "canal B do LED RGB no anel P2",
        "GND do LED RGB (catodo comum) no anel GND",
        "canal R pode ficar livre: este script so usa verde e azul",
        "cada canal com resistor de 220 ohms, se o modulo nao tiver o dele",
      ],
    },
    pede: ["ledrgb"],
    saidas: { microbura: { anel1: { modo: "baixo" }, anel2: { modo: "baixo" } } },
    // Enquanto o script roda, apertar o botao da placa muda o pino:
    // e assim que o aluno ve a cor trocar na propria bancada.
    reagirBotao: {
      a: { anel2: { modo: "alto" }, anel1: { modo: "baixo" } },
      b: { anel1: { modo: "alto" }, anel2: { modo: "baixo" } },
    },
    anima: { cor: true, alvo: ["ledrgb"] },
  },

  /* ---------- Bura32 ---------- */
  {
    id: "casa-inteligente", nome: "Casa inteligente", placas: ["bura32"],
    resumo: "Senha no teclado 4x4 libera quatro reles: luz, ventilador, portao e alarme.",
    ligacoes: {"bura32": ["linhas do teclado nos GPIO 13, 12, 14 e 27", "colunas do teclado nos GPIO 26, 25, 33 e 32", "IN dos quatro reles nos GPIO 19, 18, 5 e 17", "VCC dos reles de 3V no pino 3V3, GND no GND", "cargas passando por COM e NA, com fonte propria"]},
    pede: ["keypad", "rele3v"],
    saidas: { bura32: { e6: { modo: "alto" }, e7: { modo: "alto" }, e8: { modo: "alto" }, e9: { modo: "alto" } } },
    anima: { rele: { dur: 2.4 }, tela: ["CASA", "senha ok"], alvo: ["rele3v", "lcdi2c"] },
  },
  {
    id: "cnc", nome: "Mesa CNC de dois eixos", placas: ["bura32"],
    resumo: "Dois motores de passo movem a mesa em X e Y; a ponte H sobe e desce a ferramenta.",
    ligacoes: {"bura32": ["driver do eixo X: IN1 a IN4 nos GPIO 13, 12, 14 e 27", "driver do eixo Y: IN1 a IN4 nos GPIO 26, 25, 33 e 32", "fio vermelho de cada motor no COM do seu driver", "ENA da ponte H no GPIO 19 (PWM), IN1 e IN2 nos GPIO 18 e 5", "GND dos drivers, da ponte H e da placa no mesmo ponto"]},
    pede: ["uln2003", "motor-passo", "ponteh"],
    saidas: { bura32: { e6: { modo: "alto" }, e7: { modo: "baixo" }, e8: { modo: "alto" }, e9: { modo: "baixo" } } },
    anima: { passo: { dur: 1.1 }, motor: { modo: "eixoZ", dur: 0.9 }, alvo: ["motor-passo", "uln2003", "motordc"] },
  },
  {
    id: "drone", nome: "Estabilizacao de drone", placas: ["bura32"],
    resumo: "O acelerometro corrige a rotacao dos quatro motores para manter o nivel.",
    ligacoes: {"bura32": ["SDA do MPU-6050 no GPIO 21, SCL no GPIO 22", "ENA da primeira ponte H no GPIO 19, ENB no GPIO 18 (os dois PWM)", "IN1 a IN4 da primeira ponte nos GPIO 5, 17, 16 e 4", "ENA e ENB da segunda ponte nos GPIO 25 e 26 (PWM)", "+12V das duas pontes no pacote de baterias, GND comum com a placa"]},
    pede: ["mpu6050", "ponteh", "motor-drone"],
    saidas: { bura32: { e10: { modo: "pwm", duty: 200 }, e11: { modo: "pwm", duty: 200 } } },
    anima: { motor: { modo: "drone", dur: 0.18 }, alvo: ["motor-drone"] },
  },

  /* ---------- sugestoes da casa, com tema espacial ---------- */
  {
    id: "caixa-preta", nome: "Caixa-preta da nave", placas: ["gaburino", "bura32"],
    resumo: "Grava temperatura, umidade e trancos no cartao SD, com hora de cada leitura.",
    ligacoes: {"gaburino": ["cartao SD no SPI: SCK no 13, MISO no 12, MOSI no 11 e CS no 10", "OUT do DHT no digital 7", "DO do SW-420 no digital 8", "VCC de tudo no 5V, GND no GND"], "bura32": ["cartao SD no SPI: SCK no GPIO 18, MISO no 19, MOSI no 23 e CS no 5", "OUT do DHT no GPIO 4", "DO do SW-420 no GPIO 15", "VCC do cartao no pino de 5V, os sensores em 3V3"]},
    pede: ["cartao-sd", "dht", "sw420"],
    saidas: { gaburino: { t10: { modo: "alto" } }, bura32: { e10: { modo: "alto" } } },
    anima: { gravando: { dur: 1.6 }, contador: { de: 21, ate: 29, dur: 6, unidade: "C" }, tela: ["REGISTRANDO", "{d} C"], alvo: ["cartao-sd", "dht", "sw420"] },
  },
  {
    id: "farol-solar", nome: "Farol solar do casco", placas: ["gaburino", "bura32"],
    resumo: "Carrega a bateria de dia pelo painel solar e acende a lampada de noite.",
    ligacoes: {"gaburino": ["painel solar no VIN+ e VIN- do carregador TP4056", "celula de litio nos bornes B+ e B- do carregador", "OUT+ e OUT- do carregador alimentando o resto do circuito", "LDR em divisor com resistor de 10k, o meio na entrada A0", "IN do rele no digital 8, lampada por COM e NA com fonte propria"], "bura32": ["painel no VIN do TP4056, bateria no B, circuito no OUT", "LDR em divisor de 10k no GPIO 34 (so entrada, com ADC)", "IN do rele de 3V no GPIO 19"]},
    pede: ["celula-solar", "tp4056", "suporte-litio", "ldr", "rele"],
    saidas: { gaburino: { t8: { modo: "alto" }, A0: { modo: "analog" } }, bura32: { e6: { modo: "alto" } } },
    anima: { rele: { dur: 4 }, pisca: { dur: 2.2 }, contador: { de: 0, ate: 100, dur: 6, unidade: "%" }, alvo: ["lampada12v", "rele", "ldr"] },
  },
  {
    id: "radio-pirata", nome: "Radio pirata do deck", placas: ["gaburino", "bura32"],
    resumo: "Toca as musicas do cartao no amplificador, com controle pelo bluetooth.",
    ligacoes: {"gaburino": ["RX do DFPlayer no digital 10, com resistor de 1k em serie", "TX do DFPlayer no digital 11", "DAC_L e DAC_R do DFPlayer em IN L e IN R do amplificador", "GND do audio no GND de audio do amplificador", "alto-falantes nos bornes OUT L+/OUT L- e OUT R+/OUT R-", "TXD do HC-06 no digital 0 (RX) e RXD no digital 1 (TX), com divisor"], "bura32": ["RX do DFPlayer no GPIO 17 com resistor de 1k, TX no GPIO 16", "DAC_L e DAC_R nas entradas do amplificador", "TXD do HC-06 no GPIO 3 (RX) e RXD no GPIO 1 (TX)"]},
    pede: ["dfplayer", "amplificador", "altofalante", "hc06"],
    saidas: { gaburino: { t10: { modo: "alto" } }, bura32: { e10: { modo: "alto" } } },
    anima: { som: { dur: 0.4 }, tela: ["TOCANDO", "faixa {d}"], contador: { de: 1, ate: 9, dur: 9, unidade: "" }, alvo: ["altofalante", "amplificador", "dfplayer"] },
  },
  {
    id: "sonar", nome: "Sonar de atracagem", placas: ["gaburino", "bura32"],
    resumo: "Quanto mais perto o obstaculo, mais rapido o bipe. Igual a radar de re.",
    ligacoes: {"gaburino": ["TRIG do ultrassonico no digital 7, ECHO no digital 8", "buzzer passivo no pino ~9 (PWM), negativo no GND", "LED vermelho com resistor de 220 ohms no digital 12"], "bura32": ["TRIG no GPIO 32, ECHO no GPIO 33 com divisor de tensao", "buzzer passivo no GPIO 26 (PWM)", "LED com resistor no GPIO 27"]},
    pede: ["ultrassonico", "buzzer-passivo", "led"],
    saidas: { gaburino: { t7: { modo: "alto" }, t9: { modo: "pwm", duty: 128 } },
      bura32: { e6: { modo: "alto" }, e10: { modo: "pwm", duty: 128 } } },
    anima: { som: { dur: 0.35 }, pisca: { dur: 0.35 }, tela: ["SONAR", "{d} cm"], contador: { de: 4, ate: 90, dur: 3, unidade: "cm" }, alvo: ["buzzer-passivo", "led", "ultrassonico"] },
  },
];

export function scriptsDe(tipoPlaca) {
  return SCRIPTS.filter((s) => s.placas.includes(tipoPlaca));
}

export function acharScript(id) {
  return SCRIPTS.find((s) => s.id === id) || null;
}

/* Aplica o script no firmware da placa: e ele que faz o circuito viver. */
/* Botao apertado com script ativo: aplica o estado que o script manda
   para aquele botao e volta ao normal quando solta. */
export function reagirAoBotao(comp, botao, apertado) {
  const s = acharScript(comp.script);
  if (!s || !s.reagirBotao || !s.reagirBotao[botao]) return false;
  const base = s.saidas[comp.tipo] || {};
  comp.firmware = JSON.parse(JSON.stringify(base));
  if (apertado) Object.assign(comp.firmware, JSON.parse(JSON.stringify(s.reagirBotao[botao])));
  return true;
}

export function aplicar(comp, script) {
  comp.script = script ? script.id : null;
  comp.firmware = script && script.saidas[comp.tipo] ? JSON.parse(JSON.stringify(script.saidas[comp.tipo])) : {};
  return comp;
}
