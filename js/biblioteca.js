/* ============================================================
   BIBLIOTECA — modelo tecnico dos componentes.
   Aqui ficam medidas, pinagem e comportamento eletrico.
   Os textos (curiosidade, onde e usado, detalhes tecnicos) NAO ficam
   aqui: eles vivem em ATIVIDADES/COMPONENTES/ para voce poder editar
   sem mexer no codigo.

   Unidade da bancada: 1 furo de protoboard = 16 unidades (passo 2,54mm).

   Campos de um pino:
     id       identificador unico dentro do componente
     n        nome impresso na placa (o que o aluno le)
     x, y     posicao em relacao ao canto superior esquerdo
     r        receptividade fisica: "femea" (recebe macho), "macho"
              (e um pino/perna), "borne" (parafuso, aceita qualquer
              ponta descascada), "pad" (ilha larga, aceita jacare)
     papel    v+ | gnd | digital | pwm | analog | i2c | spi | sinal |
              terminal | so-entrada
     v        tensao que o pino FORNECE quando o componente esta ligado
   ============================================================ */

export const P = 16; // passo entre furos

const fila = (n, x0, y, dx, dy, mapa) =>
  Array.from({ length: n }, (_, i) => mapa(i, x0 + dx * i, y + dy * i));

/* ---------- placas de controle -------------------------------- */

function pinosGaburino() {
  const p = [];
  const topoDir = ["SCL", "SDA", "AREF", "GND", "13", "12", "~11", "~10", "~9", "8"];
  topoDir.forEach((n, i) => {
    p.push({
      id: "t" + n, n, x: 416 - i * P, y: 18, r: "femea",
      papel: n === "GND" ? "gnd" : n === "SCL" || n === "SDA" ? "i2c" : n.startsWith("~") ? "pwm" : "digital",
    });
  });
  ["7", "~6", "~5", "4", "~3", "2", "1", "0"].forEach((n, i) => {
    p.push({
      id: "t" + n, n: n === "1" ? "1 TX" : n === "0" ? "0 RX" : n,
      x: 240 - i * P, y: 18, r: "femea",
      papel: n.startsWith("~") ? "pwm" : "digital",
    });
  });
  const baixoEsq = [
    ["IOREF", "sinal", null], ["RESET", "sinal", null], ["3V3", "v+", 3.3],
    ["5V", "v+", 5], ["GND", "gnd", null], ["GND", "gnd", null], ["VIN", "v+", null],
  ];
  baixoEsq.forEach(([n, papel, v], i) => {
    p.push({ id: "b" + n + i, n, x: 72 + i * P, y: 322, r: "femea", papel, v: v || undefined });
  });
  fila(6, 216, 322, P, 0, (i, x, y) =>
    p.push({ id: "A" + i, n: "A" + i, x, y, r: "femea", papel: "analog" })
  );
  return p;
}

function pinosBura32() {
  const esq = [
    ["3V3", "v+", 3.3], ["EN", "sinal"], ["36 VP", "so-entrada"], ["39 VN", "so-entrada"],
    ["34", "so-entrada"], ["35", "so-entrada"], ["32", "digital"], ["33", "digital"],
    ["25 DAC", "digital"], ["26 DAC", "digital"], ["27", "digital"], ["14", "digital"],
    ["12", "digital"], ["13", "digital"], ["GND", "gnd"],
  ];
  const dir = [
    ["VIN", "v+"], ["GND", "gnd"], ["23 MOSI", "spi"], ["22 SCL", "i2c"], ["TX", "digital"],
    ["RX", "digital"], ["21 SDA", "i2c"], ["GND", "gnd"], ["19 MISO", "spi"], ["18 CLK", "spi"],
    ["5 CS", "spi"], ["17", "digital"], ["16", "digital"], ["4", "digital"], ["2", "digital"],
  ];
  const p = [];
  esq.forEach(([n, papel, v], i) =>
    p.push({ id: "e" + i, n, x: 14, y: 44 + i * P, r: "femea", papel, v, lado: "e" })
  );
  dir.forEach(([n, papel, v], i) =>
    p.push({ id: "d" + i, n, x: 166, y: 44 + i * P, r: "femea", papel, v, lado: "d" })
  );
  return p;
}

function pinosMicrobura() {
  const grandes = [
    ["P0", "digital"], ["P1", "digital"], ["P2", "digital"], ["3V", "v+", 3.3], ["GND", "gnd"],
  ];
  const p = grandes.map(([n, papel, v], i) => ({
    id: "g" + i, n, x: 34 + i * 58, y: 232, r: "pad", papel, v, grande: true,
  }));
  const pequenos = ["P3", "P4", "P6", "P7", "P8", "P9", "P10", "P12", "P16", "P19 SCL", "P20 SDA"];
  pequenos.forEach((n, i) =>
    p.push({
      id: "s" + i, n, x: 24 + i * 26, y: 246, r: "pad",
      papel: n.includes("SCL") || n.includes("SDA") ? "i2c" : "digital",
    })
  );
  return p;
}

/* ---------- protoboard ---------------------------------------- */

export const PB = { colunas: 30, x0: 20, larg: 520, alt: 300 };

function pinosProtoboard() {
  const p = [];
  const push = (id, n, x, y, no) => p.push({ id, n, x, y, r: "femea", papel: "terminal", no });
  for (let c = 0; c < PB.colunas; c++) {
    const x = PB.x0 + c * P;
    push(`sup+${c}`, "+", x, 20, "trilho-sup+");
    push(`sup-${c}`, "-", x, 36, "trilho-sup-");
    ["A", "B", "C", "D", "E"].forEach((L, i) => push(`${L}${c}`, L + (c + 1), x, 68 + i * P, `col-a-${c}`));
    ["F", "G", "H", "I", "J"].forEach((L, i) => push(`${L}${c}`, L + (c + 1), x, 164 + i * P, `col-b-${c}`));
    push(`inf+${c}`, "+", x, 260, "trilho-inf+");
    push(`inf-${c}`, "-", x, 276, "trilho-inf-");
  }
  return p;
}

/* ---------- montagem do catalogo ------------------------------ */

const C = [];
const add = (def) => { C.push(def); return def; };

/* placas */
add({
  id: "gaburino", nome: "GaburINO", caixa: "placas", arte: "placa-gaburino",
  w: 440, h: 340, cor: "#1D6C8C", alimentada: true, custo: 40,
  pinos: pinosGaburino(),
  tensaoLogica: 5, tensaoMaxPino: 5.5,
  limitePino: 40, limiteAlim: 500, limiteTotal: 800,
});
add({
  id: "bura32", nome: "Bura32", caixa: "placas", arte: "placa-bura32",
  w: 180, h: 300, cor: "#1B1F26", alimentada: true, custo: 45,
  pinos: pinosBura32(),
  tensaoLogica: 3.3, tensaoMaxPino: 3.6,
  limitePino: 12, limiteAlim: 600, limiteTotal: 900,
});
add({
  id: "microbura", nome: "MicroBURA", caixa: "placas", arte: "placa-microbura",
  w: 320, h: 262, cor: "#0F5A46", alimentada: true, custo: 60,
  pinos: pinosMicrobura(),
  tensaoLogica: 3.3, tensaoMaxPino: 3.6,
  limitePino: 5, limiteAlim: 90, limiteTotal: 120,
});
add({
  id: "protoboard", nome: "Protoboard 400", caixa: "placas", arte: "protoboard",
  w: PB.larg, h: PB.alt, cor: "#E6E4DC", custo: 10,
  pinos: pinosProtoboard(),
});

/* alimentacao */
add({
  id: "bateria9v", nome: "Bateria 9V", caixa: "energia", custo: 8, arte: "bateria", w: 110, h: 150,
  cor: "#2A2E36", fonte: true,
  pinos: [
    { id: "p", n: "+", x: 34, y: 146, r: "macho", papel: "v+", v: 9 },
    { id: "n", n: "-", x: 76, y: 146, r: "macho", papel: "gnd" },
  ],
});
add({
  id: "suporteaa", nome: "Suporte 4x AA", caixa: "energia", custo: 12, arte: "suporte-aa", w: 240, h: 120,
  cor: "#1B1F26", fonte: true,
  pinos: [
    { id: "p", n: "+", x: 236, y: 40, r: "macho", papel: "v+", v: 6 },
    { id: "n", n: "-", x: 236, y: 80, r: "macho", papel: "gnd" },
  ],
});
add({
  id: "fonte-protoboard", nome: "Fonte de protoboard", caixa: "energia", custo: 15, arte: "modulo",
  w: 220, h: 90, cor: "#134E3A", fonte: true, ajustavel: [3.3, 5],
  pinos: [
    { id: "vout", n: "OUT", x: 40, y: 86, r: "macho", papel: "v+", v: 5 },
    { id: "gnd", n: "GND", x: 180, y: 86, r: "macho", papel: "gnd" },
  ],
});
add({
  id: "rele", nome: "Modulo rele 1 canal", caixa: "energia", custo: 18, arte: "modulo", w: 200, h: 130,
  cor: "#1B4E8A", alimenta: 4.5,
  pinos: [
    { id: "gnd", n: "GND", x: 24, y: 126, r: "macho", papel: "gnd" },
    { id: "in", n: "IN", x: 56, y: 126, r: "macho", papel: "sinal" },
    { id: "vcc", n: "VCC", x: 88, y: 126, r: "macho", papel: "v+" },
    { id: "no", n: "NA", x: 150, y: 8, r: "borne", papel: "terminal" },
    { id: "com", n: "COM", x: 176, y: 8, r: "borne", papel: "terminal" },
  ],
});
add({
  id: "ponteh", nome: "Ponte H L298N", caixa: "energia", custo: 30, arte: "modulo", w: 300, h: 200,
  cor: "#0E3F63", alimenta: 6, correnteMax: 2000,
  pinos: [
    { id: "v12", n: "+12V", x: 24, y: 8, r: "borne", papel: "v+" },
    { id: "gnd", n: "GND", x: 60, y: 8, r: "borne", papel: "gnd" },
    { id: "v5", n: "+5V", x: 96, y: 8, r: "borne", papel: "v+", v: 5 },
    { id: "ena", n: "ENA", x: 200, y: 196, r: "macho", papel: "pwm" },
    { id: "in1", n: "IN1", x: 224, y: 196, r: "macho", papel: "digital" },
    { id: "in2", n: "IN2", x: 248, y: 196, r: "macho", papel: "digital" },
    { id: "in3", n: "IN3", x: 272, y: 196, r: "macho", papel: "digital" },
    { id: "out1", n: "OUT1", x: 24, y: 100, r: "borne", papel: "terminal" },
    { id: "out2", n: "OUT2", x: 24, y: 140, r: "borne", papel: "terminal" },
  ],
});

/* passivos */
add({
  id: "resistor", nome: "Resistor", caixa: "passivos", custo: 1, arte: "axial", w: 120, h: 30,
  cor: "#C9A227", passivo: true, valores: ["220", "330", "1k", "10k"], unidade: "ohm", potenciaMax: 0.25,
  pinos: [
    { id: "a", n: "", x: 2, y: 15, r: "macho", papel: "terminal" },
    { id: "b", n: "", x: 118, y: 15, r: "macho", papel: "terminal" },
  ],
});
add({
  id: "capacitor-eletro", nome: "Capacitor eletrolitico", caixa: "passivos", custo: 2, arte: "radial",
  w: 70, h: 90, cor: "#20344F", valores: ["10uF", "100uF", "470uF"], polarizado: true, tensaoMax: 16,
  pinos: [
    { id: "p", n: "+", x: 22, y: 88, r: "macho", papel: "terminal" },
    { id: "n", n: "-", x: 48, y: 88, r: "macho", papel: "terminal" },
  ],
});
add({
  id: "capacitor-ceramico", nome: "Capacitor ceramico", caixa: "passivos", custo: 1, arte: "disco",
  w: 60, h: 70, cor: "#7A5A20", valores: ["100nF", "22pF"],
  pinos: [
    { id: "a", n: "", x: 18, y: 68, r: "macho", papel: "terminal" },
    { id: "b", n: "", x: 42, y: 68, r: "macho", papel: "terminal" },
  ],
});
add({
  id: "diodo", nome: "Diodo 1N4007", caixa: "passivos", custo: 1, arte: "axial", w: 100, h: 28,
  cor: "#3A2A20", polarizado: true,
  pinos: [
    { id: "a", n: "A", x: 2, y: 14, r: "macho", papel: "terminal" },
    { id: "k", n: "K", x: 98, y: 14, r: "macho", papel: "terminal" },
  ],
});
add({
  id: "transistor", nome: "Transistor BC548", caixa: "passivos", custo: 2, arte: "to92", w: 70, h: 84,
  cor: "#101318",
  pinos: [
    { id: "c", n: "C", x: 16, y: 82, r: "macho", papel: "terminal" },
    { id: "b", n: "B", x: 35, y: 82, r: "macho", papel: "terminal" },
    { id: "e", n: "E", x: 54, y: 82, r: "macho", papel: "terminal" },
  ],
});

/* luzes */
add({
  id: "led", nome: "LED 5mm", caixa: "leds", custo: 2, arte: "led", w: 60, h: 86,
  cor: "#E24B4A", tensaoDireta: 2, correnteTipica: 20, correnteMax: 40, polarizado: true,
  variantes: [
    { nome: "vermelho", cor: "#E24B4A", vf: 1.9 },
    { nome: "verde", cor: "#4ED17A", vf: 2.1 },
    { nome: "amarelo", cor: "#E9C542", vf: 2.0 },
    { nome: "azul", cor: "#5B9BE8", vf: 3.0 },
    { nome: "branco", cor: "#F2F2EE", vf: 3.1 },
  ],
  pinos: [
    { id: "a", n: "A", x: 22, y: 84, r: "macho", papel: "terminal" },
    { id: "k", n: "K", x: 40, y: 84, r: "macho", papel: "terminal" },
  ],
});
add({
  id: "ledrgb", nome: "LED RGB (modulo)", caixa: "leds", custo: 8, arte: "modulo", w: 150, h: 90,
  cor: "#12151C", alimenta: 0,
  pinos: [
    { id: "r", n: "R", x: 30, y: 86, r: "macho", papel: "pwm" },
    { id: "g", n: "G", x: 62, y: 86, r: "macho", papel: "pwm" },
    { id: "b", n: "B", x: 94, y: 86, r: "macho", papel: "pwm" },
    { id: "gnd", n: "GND", x: 126, y: 86, r: "macho", papel: "gnd" },
  ],
});
add({
  id: "neopixel", nome: "Neopixel 4x4", caixa: "leds", custo: 45, arte: "neopixel", w: 180, h: 180,
  cor: "#12151C", alimenta: 4.5, correnteTipica: 320,
  pinos: [
    { id: "gnd", n: "GND", x: 18, y: 176, r: "macho", papel: "gnd" },
    { id: "vcc", n: "VCC", x: 66, y: 176, r: "macho", papel: "v+" },
    { id: "in", n: "IN", x: 114, y: 176, r: "macho", papel: "digital" },
    { id: "out", n: "OUT", x: 162, y: 176, r: "macho", papel: "sinal" },
  ],
});
add({
  id: "lcdi2c", nome: "Display LCD I2C", caixa: "leds", custo: 35, arte: "lcd", w: 340, h: 160,
  cor: "#14472F", alimenta: 4.5, tela: true,
  pinos: [
    { id: "gnd", n: "GND", x: 200, y: 156, r: "macho", papel: "gnd" },
    { id: "vcc", n: "VCC", x: 232, y: 156, r: "macho", papel: "v+" },
    { id: "sda", n: "SDA", x: 264, y: 156, r: "macho", papel: "i2c" },
    { id: "scl", n: "SCL", x: 296, y: 156, r: "macho", papel: "i2c" },
  ],
});

/* som */
add({
  id: "buzzer", nome: "Buzzer ativo", caixa: "som", custo: 6, arte: "buzzer", w: 90, h: 100,
  cor: "#0B0D11", alimenta: 3, apito: true,
  pinos: [
    { id: "p", n: "+", x: 30, y: 96, r: "macho", papel: "v+" },
    { id: "n", n: "-", x: 60, y: 96, r: "macho", papel: "gnd" },
  ],
});

/* entradas */
add({
  id: "botao", nome: "Botao (push)", caixa: "entradas", custo: 2, arte: "botao", w: 80, h: 80,
  cor: "#1B1F26", pressionavel: true,
  ligacoes: [["1a", "1b"], ["2a", "2b"]],
  ligacoesFechado: [["1a", "2a"]],
  pinos: [
    { id: "1a", n: "1", x: 6, y: 6, r: "macho", papel: "terminal" },
    { id: "2a", n: "2", x: 74, y: 6, r: "macho", papel: "terminal" },
    { id: "1b", n: "3", x: 6, y: 74, r: "macho", papel: "terminal" },
    { id: "2b", n: "4", x: 74, y: 74, r: "macho", papel: "terminal" },
  ],
});
add({
  id: "potenciometro", nome: "Potenciometro 10k", caixa: "entradas", custo: 5, arte: "potenciometro",
  w: 110, h: 120, cor: "#1B1F26", ajuste: true,
  pinos: [
    { id: "a", n: "1", x: 22, y: 116, r: "macho", papel: "terminal" },
    { id: "w", n: "W", x: 55, y: 116, r: "macho", papel: "analog" },
    { id: "b", n: "3", x: 88, y: 116, r: "macho", papel: "terminal" },
  ],
});
add({
  id: "ldr", nome: "Sensor de luz LDR", caixa: "sensores", custo: 3, arte: "ldr", w: 60, h: 84,
  cor: "#8A6B2A",
  pinos: [
    { id: "a", n: "", x: 20, y: 82, r: "macho", papel: "terminal" },
    { id: "b", n: "", x: 40, y: 82, r: "macho", papel: "terminal" },
  ],
});

/* sensores */
add({
  id: "ultrassonico", nome: "Ultrassonico HC-SR04", caixa: "sensores", custo: 20, arte: "ultrassonico",
  w: 260, h: 120, cor: "#1B4E8A", alimenta: 4.5,
  pinos: [
    { id: "vcc", n: "VCC", x: 88, y: 116, r: "macho", papel: "v+" },
    { id: "trig", n: "TRIG", x: 116, y: 116, r: "macho", papel: "digital" },
    { id: "echo", n: "ECHO", x: 144, y: 116, r: "macho", papel: "digital" },
    { id: "gnd", n: "GND", x: 172, y: 116, r: "macho", papel: "gnd" },
  ],
});
add({
  id: "irobstaculo", nome: "Sensor de obstaculo IR", caixa: "sensores", custo: 10, arte: "modulo",
  w: 190, h: 90, cor: "#1B4E8A", alimenta: 3,
  pinos: [
    { id: "vcc", n: "VCC", x: 60, y: 86, r: "macho", papel: "v+" },
    { id: "gnd", n: "GND", x: 92, y: 86, r: "macho", papel: "gnd" },
    { id: "out", n: "OUT", x: 124, y: 86, r: "macho", papel: "digital" },
  ],
});

/* motores */
add({
  id: "servo180", nome: "Micro servo 180", caixa: "motores", custo: 25, arte: "servo", w: 180, h: 150,
  cor: "#1E58A8", alimenta: 4.5, correnteTipica: 550, precisaPwm: "sinal",
  pinos: [
    { id: "gnd", n: "GND", x: 176, y: 60, r: "macho", papel: "gnd", fio: "#3A3F47" },
    { id: "vcc", n: "VCC", x: 176, y: 76, r: "macho", papel: "v+", fio: "#E24B4A" },
    { id: "sig", n: "SIN", x: 176, y: 92, r: "macho", papel: "pwm", fio: "#E9C542" },
  ],
});
add({
  id: "motordc", nome: "Motor DC", caixa: "motores", custo: 15, arte: "motor", w: 190, h: 110,
  cor: "#565C66", alimenta: 3, correnteTipica: 800,
  pinos: [
    { id: "a", n: "+", x: 186, y: 42, r: "macho", papel: "v+", fio: "#E24B4A" },
    { id: "b", n: "-", x: 186, y: 70, r: "macho", papel: "gnd", fio: "#2A2E36" },
  ],
});

export const COMPONENTES = C;
export const PORID = Object.fromEntries(C.map((c) => [c.id, c]));

/* Gavetas e caixas do movel da oficina.
   A ordem aqui e a ordem que aparece no painel esquerdo. */
export const MOVEIS = [
  { id: "placas",   nome: "Gaveta das placas",        icone: "placa" },
  { id: "leds",     nome: "Caixa de LEDs e telas",    icone: "led" },
  { id: "sensores", nome: "Caixa dos sensores",       icone: "sensor" },
  { id: "motores",  nome: "Gaveta dos motores",       icone: "motor" },
  { id: "energia",  nome: "Caixa da energia",         icone: "energia" },
  { id: "passivos", nome: "Gaveta dos passivos",      icone: "passivo" },
  { id: "entradas", nome: "Caixa de botoes e chaves", icone: "ferramenta" },
  { id: "som",      nome: "Caixa do som",             icone: "audio" },
];

/* Tipos de jumper. A regra e fisica: ponta macho so entra em furo
   ou barra femea; ponta femea so encaixa em pino macho. */
export const JUMPERS = [
  { id: "mm", nome: "Jumper macho-macho", pontas: ["macho", "macho"], cor: "#E24B4A" },
  { id: "mf", nome: "Jumper macho-femea", pontas: ["macho", "femea"], cor: "#5CE07A" },
  { id: "ff", nome: "Jumper femea-femea", pontas: ["femea", "femea"], cor: "#7DD3FC" },
  { id: "jacare", nome: "Cabo jacare", pontas: ["jacare", "jacare"], cor: "#E9C542" },
];

export const CORES_FIO = ["#E24B4A", "#2A2E36", "#5CE07A", "#7DD3FC", "#E9C542", "#C77DFF", "#F2F2EE", "#E08A3C"];

/* O que cada ponta de jumper aceita tocar */
export const ACEITA = {
  macho: ["femea", "borne", "pad"],
  femea: ["macho", "pad"],
  jacare: ["macho", "pad", "borne"],
};
