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
     ligacoes            comentario de pino, o que o aluno le antes
     pede                pecas que o script espera na bancada
     saidas              { pinoId: { modo, duty } } aplicado no firmware
     anima               efeitos na bancada: servo, motor, tela, som
   ============================================================ */

export const SCRIPTS = [
  /* ---------- funcionam em qualquer placa ---------- */
  {
    id: "blink", nome: "Blink", placas: ["gaburino", "bura32", "microbura", "arubagpi"],
    resumo: "Pisca um LED. O primeiro programa de todo mundo.",
    ligacoes: [
      "LED com resistor no pino de saida escolhido",
      "catodo do LED no GND da placa",
    ],
    pede: ["led", "resistor"],
    saidas: { gaburino: { t13: { modo: "alto" } }, bura32: { e13: { modo: "alto" } },
      microbura: { anel0: { modo: "alto" } }, arubagpi: { p9: { modo: "alto" } } },
    anima: { pisca: true },
  },
  {
    id: "servo-vaivem", nome: "Servo vai e vem", placas: ["gaburino", "bura32", "microbura", "arubagpi"],
    resumo: "Gira o servo de um lado para o outro, sem parar.",
    ligacoes: [
      "sinal do servo num pino PWM",
      "alimentacao do servo por fonte externa, nunca pela placa",
      "GND da fonte e GND da placa no mesmo ponto",
    ],
    pede: ["servo180"],
    saidas: { gaburino: { t9: { modo: "pwm", duty: 128 } }, bura32: { e10: { modo: "pwm", duty: 128 } },
      microbura: { anel0: { modo: "pwm", duty: 128 } }, arubagpi: { p9: { modo: "pwm", duty: 128 } } },
    anima: { servo: "varre" },
  },
  {
    id: "distancia-lcd", nome: "Distancia no LCD", placas: ["gaburino", "bura32", "arubagpi"],
    resumo: "Le o ultrassonico e escreve a distancia no display I2C.",
    ligacoes: [
      "TRIG e ECHO do ultrassonico em pinos digitais",
      "SDA e SCL do display nos pinos de I2C da placa",
      "VCC e GND do display e do sensor na alimentacao de 5 volts",
    ],
    pede: ["ultrassonico", "lcdi2c"],
    saidas: { gaburino: { t7: { modo: "alto" }, t8: { modo: "entrada" } },
      bura32: { e6: { modo: "alto" }, e7: { modo: "entrada" } }, arubagpi: { p5: { modo: "alto" } } },
    anima: { tela: ["DISTANCIA", "-- cm"], contador: "distancia" },
  },

  /* ---------- GaburINO ---------- */
  {
    id: "seguidor", nome: "Carro seguidor de linha", placas: ["gaburino"],
    resumo: "Le dois sensores de linha e corrige o rumo pelos motores.",
    ligacoes: [
      "sensor da esquerda no digital 2, da direita no digital 4",
      "IN1 e IN2 nos digitais 7 e 8, IN3 e IN4 nos digitais 12 e 13",
      "ENA e ENB em pinos PWM, ou com os jumpers de fabrica",
      "motores nos bornes OUT, pilhas no +12V da ponte H",
      "GND da ponte H no GND da placa",
    ],
    pede: ["ponteh", "ir-linha", "motordc"],
    saidas: { gaburino: { t7: { modo: "alto" }, t8: { modo: "baixo" }, t12: { modo: "alto" }, t13: { modo: "baixo" },
      t9: { modo: "pwm", duty: 190 }, t10: { modo: "pwm", duty: 190 } } },
    anima: { motor: "frente" },
  },
  {
    id: "mao-robotica", nome: "Mao robotica", placas: ["gaburino"],
    resumo: "Move doze servos pela expansao I2C: dedos, punho e cotovelo.",
    ligacoes: [
      "SDA e SCL da expansao nos pinos A4 e A5",
      "V+ da expansao numa fonte externa, capaz de segurar todos os servos juntos",
      "dez micro servos nos canais 0 a 9, dois de alto torque nos canais 10 e 11",
      "GND da fonte e GND da placa no mesmo ponto",
    ],
    pede: ["expansao-servo", "servo180", "servo-torque180"],
    saidas: { gaburino: { A4: { modo: "alto" }, A5: { modo: "alto" } } },
    anima: { servo: "onda" },
  },
  {
    id: "plantacao", nome: "Plantacao inteligente", placas: ["gaburino"],
    resumo: "Le a umidade do solo e liga a bomba quando a terra seca.",
    ligacoes: [
      "A0 do sensor de umidade na entrada analogica A0",
      "IN do rele num digital, VCC e GND do rele na placa",
      "bomba e fonte externa passando pelo contato COM e NA do rele",
      "sonda ligada nos dois bornes do modulo de leitura",
    ],
    pede: ["umidade-solo", "sonda-solo", "rele", "bomba"],
    saidas: { gaburino: { t8: { modo: "alto" }, A0: { modo: "analog" } } },
    anima: { motor: "bomba", contador: "umidade" },
  },
  {
    id: "elevador", nome: "Mini elevador de carga", placas: ["gaburino"],
    resumo: "Tres botoes escolhem o andar e o servo de giro continuo sobe a plataforma.",
    ligacoes: [
      "tres botoes nos digitais 2, 3 e 4, cada um com resistor de pull-down",
      "sinal do servo de alto torque 360 num pino PWM",
      "servo alimentado por fora, com GND comum",
    ],
    pede: ["botao", "servo-torque360"],
    saidas: { gaburino: { t9: { modo: "pwm", duty: 160 } } },
    anima: { servo: "gira" },
  },

  /* ---------- MicroBURA ---------- */
  {
    id: "servo-botoes", nome: "Controle do servo pelos botoes", placas: ["microbura"],
    resumo: "Botao A gira para um lado, botao B para o outro.",
    ligacoes: [
      "sinal do servo no anel P0",
      "servo alimentado por fora: os aneis da MicroBURA entregam pouca corrente",
      "GND da fonte no anel GND",
    ],
    pede: ["servo180"],
    saidas: { microbura: { anel0: { modo: "pwm", duty: 128 } } },
    anima: { servo: "botoes" },
  },
  {
    id: "bateria-piezo", nome: "Bateria com piezo", placas: ["microbura"],
    resumo: "Dois discos piezo viram tambores e o buzzer responde com a nota.",
    ligacoes: [
      "S de cada modulo piezo nos aneis P1 e P2",
      "discos piezo nos bornes PZ de cada modulo",
      "buzzer passivo no anel P0",
    ],
    pede: ["piezo-modulo", "piezo", "buzzer-passivo"],
    saidas: { microbura: { anel0: { modo: "pwm", duty: 128 }, anel1: { modo: "entrada" }, anel2: { modo: "entrada" } } },
    anima: { som: true },
  },
  {
    id: "snake", nome: "Jogo da cobrinha", placas: ["microbura"],
    resumo: "Joystick move a cobra na tela TFT. Sim, da para jogar.",
    ligacoes: [
      "VRx e VRy do joystick em aneis com entrada analogica",
      "tela TFT no barramento SPI da expansao",
      "SW do joystick num pino digital para pausar",
    ],
    pede: ["joystick", "tft", "expansao-microbura"],
    saidas: { microbura: { anel1: { modo: "entrada" }, anel2: { modo: "entrada" } } },
    anima: { tela: ["SNAKE", "use o joystick"] },
  },

  /* ---------- Bura32 ---------- */
  {
    id: "casa-inteligente", nome: "Casa inteligente", placas: ["bura32"],
    resumo: "Senha no teclado 4x4 libera quatro reles: luz, ventilador, portao e alarme.",
    ligacoes: [
      "quatro linhas e quatro colunas do teclado em oito GPIO livres",
      "IN de cada rele num GPIO, com VCC de 3,3 volts nos reles de 3V",
      "cargas passando pelos contatos COM e NA, com fonte propria",
    ],
    pede: ["keypad", "rele3v"],
    saidas: { bura32: { e6: { modo: "alto" }, e7: { modo: "alto" }, e8: { modo: "alto" }, e9: { modo: "alto" } } },
    anima: { rele: true },
  },
  {
    id: "cnc", nome: "Mesa CNC de dois eixos", placas: ["bura32"],
    resumo: "Dois motores de passo movem a mesa em X e Y; a ponte H sobe e desce a ferramenta.",
    ligacoes: [
      "IN1 a IN4 de cada driver ULN2003 em oito GPIO",
      "motores de passo nos conectores dos drivers",
      "ponte H para o eixo Z, com alimentacao propria",
      "GND de tudo no mesmo ponto: sem isso os passos se perdem",
    ],
    pede: ["uln2003", "motor-passo", "ponteh"],
    saidas: { bura32: { e6: { modo: "alto" }, e7: { modo: "baixo" }, e8: { modo: "alto" }, e9: { modo: "baixo" } } },
    anima: { passo: true },
  },
  {
    id: "drone", nome: "Estabilizacao de drone", placas: ["bura32"],
    resumo: "O acelerometro corrige a rotacao dos quatro motores para manter o nivel.",
    ligacoes: [
      "SDA e SCL do MPU-6050 nos GPIO 21 e 22",
      "duas pontes H, cada uma com dois motores de drone",
      "ENA e ENB em pinos PWM: aqui a velocidade e o que estabiliza",
      "pacote de baterias no +12V, GND comum com a placa",
    ],
    pede: ["mpu6050", "ponteh", "motor-drone"],
    saidas: { bura32: { e10: { modo: "pwm", duty: 200 }, e11: { modo: "pwm", duty: 200 } } },
    anima: { motor: "drone" },
  },

  /* ---------- sugestoes da casa, com tema espacial ---------- */
  {
    id: "caixa-preta", nome: "Caixa-preta da nave", placas: ["gaburino", "bura32"],
    resumo: "Grava temperatura, umidade e trancos no cartao SD, com hora de cada leitura.",
    ligacoes: [
      "modulo de cartao SD no barramento SPI",
      "DHT num pino digital, SW-420 em outro",
      "tudo alimentado em 5 volts, GND comum",
    ],
    pede: ["cartao-sd", "dht", "sw420"],
    saidas: { gaburino: { t10: { modo: "alto" } }, bura32: { e10: { modo: "alto" } } },
    anima: { gravando: true },
  },
  {
    id: "farol-solar", nome: "Farol solar do casco", placas: ["gaburino", "bura32"],
    resumo: "Carrega a bateria de dia pelo painel solar e acende a lampada de noite.",
    ligacoes: [
      "painel solar no VIN do carregador TP4056",
      "bateria de litio nos bornes B+ e B-",
      "OUT do carregador alimentando o circuito",
      "LDR num pino analogico, rele acionando a lampada",
    ],
    pede: ["celula-solar", "tp4056", "suporte-litio", "ldr", "rele"],
    saidas: { gaburino: { t8: { modo: "alto" }, A0: { modo: "analog" } }, bura32: { e6: { modo: "alto" } } },
    anima: { rele: true, contador: "luz" },
  },
  {
    id: "radio-pirata", nome: "Radio pirata do deck", placas: ["gaburino", "bura32"],
    resumo: "Toca as musicas do cartao no amplificador, com controle pelo bluetooth.",
    ligacoes: [
      "RX do DFPlayer num digital, com resistor de 1k em serie",
      "DAC_L e DAC_R do DFPlayer nas entradas do amplificador",
      "alto-falantes nos bornes OUT+ e OUT- de cada canal",
      "HC-06 na serial, alimentado em 5 volts",
    ],
    pede: ["dfplayer", "amplificador", "altofalante", "hc06"],
    saidas: { gaburino: { t10: { modo: "alto" } }, bura32: { e10: { modo: "alto" } } },
    anima: { som: true, tela: ["TOCANDO", "faixa 01"] },
  },
  {
    id: "sonar", nome: "Sonar de atracagem", placas: ["gaburino", "bura32"],
    resumo: "Quanto mais perto o obstaculo, mais rapido o bipe. Igual a radar de re.",
    ligacoes: [
      "TRIG e ECHO do ultrassonico em digitais",
      "buzzer passivo num pino PWM",
      "LED vermelho com resistor para o alerta de colisao",
    ],
    pede: ["ultrassonico", "buzzer-passivo", "led"],
    saidas: { gaburino: { t7: { modo: "alto" }, t9: { modo: "pwm", duty: 128 } },
      bura32: { e6: { modo: "alto" }, e10: { modo: "pwm", duty: 128 } } },
    anima: { som: true, pisca: true, contador: "distancia" },
  },
];

export function scriptsDe(tipoPlaca) {
  return SCRIPTS.filter((s) => s.placas.includes(tipoPlaca));
}

export function acharScript(id) {
  return SCRIPTS.find((s) => s.id === id) || null;
}

/* Aplica o script no firmware da placa: e ele que faz o circuito viver. */
export function aplicar(comp, script) {
  comp.script = script ? script.id : null;
  comp.firmware = script && script.saidas[comp.tipo] ? JSON.parse(JSON.stringify(script.saidas[comp.tipo])) : {};
  return comp;
}
