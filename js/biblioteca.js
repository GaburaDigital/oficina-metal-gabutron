/* ============================================================
   BIBLIOTECA — modelo tecnico dos componentes.

   REGRA DE OURO DA GEOMETRIA (revisao):
   O passo entre furos e 24 unidades. TODA coordenada de pino que
   precisa entrar na protoboard e multipla de 24. E isso que faz o
   resistor, o LED e os modulos encaixarem de verdade nas fileiras.
   Se voce criar componente novo, respeite o passo ou ele nao encaixa.

   Campos de um pino:
     id       identificador unico dentro do componente
     n        nome curto impresso na peca (o que aparece sempre)
     rotulo   descricao completa, aparece ao passar o mouse
     x, y     posicao, multipla de 24 quando o pino e macho
     r        forma e receptividade fisica:
                "femea"  circulo  — recebe ponta macho
                "macho"  quadrado — e um pino, entra em furo
                "borne"  retangulo com parafuso — aceita fio nu
                "pad"    retangulo largo — aceita garra jacare
     papel    v+ | gnd | digital | pwm | analog | i2c | spi | sinal |
              terminal | so-entrada
     v        tensao que o pino FORNECE quando o componente esta ligado
     lado     e | d | cima | baixo — de que lado fica o rotulo
   ============================================================ */

export const P = 24; // passo entre furos

/* ---------- placas de controle -------------------------------- */

function pinosGaburino() {
  const p = [];
  const topoDir = [
    ["SCL", "i2c", "Comunicacao I2C — linha de relogio (SCL)"],
    ["SDA", "i2c", "Comunicacao I2C — linha de dados (SDA)"],
    ["AREF", "sinal", "Referencia externa para o conversor analogico"],
    ["GND", "gnd", "Terra — retorno da corrente"],
    ["13", "digital", "Digital 13 — tambem SPI SCK e LED da placa"],
    ["12", "digital", "Digital 12 — tambem SPI MISO"],
    ["11", "pwm", "Digital 11 — PWM e SPI MOSI"],
    ["10", "pwm", "Digital 10 — PWM e SPI SS"],
    ["9", "pwm", "Digital 9 — PWM"],
    ["8", "digital", "Digital 8"],
  ];
  topoDir.forEach(([n, papel, rotulo], i) => {
    p.push({ id: "t" + n, n: papel === "pwm" ? "~" + n : n, rotulo, x: 624 - i * P, y: 24, r: "femea", papel, lado: "baixo" });
  });

  const topoEsq = [
    ["7", "digital", "Digital 7"],
    ["6", "pwm", "Digital 6 — PWM"],
    ["5", "pwm", "Digital 5 — PWM"],
    ["4", "digital", "Digital 4"],
    ["3", "pwm", "Digital 3 — PWM e interrupcao externa"],
    ["2", "digital", "Digital 2 — interrupcao externa"],
    ["1", "digital", "Digital 1 — TX da serial"],
    ["0", "digital", "Digital 0 — RX da serial"],
  ];
  topoEsq.forEach(([n, papel, rotulo], i) => {
    p.push({ id: "t" + n, n: papel === "pwm" ? "~" + n : n, rotulo, x: 360 - i * P, y: 24, r: "femea", papel, lado: "baixo" });
  });

  const baixo = [
    ["IOREF", "sinal", null, "Informa a tensao logica da placa para shields"],
    ["RESET", "sinal", null, "Reinicia a placa quando puxado para o GND"],
    ["3V3", "v+", 3.3, "Saida de 3,3 volts — ate 150 mA"],
    ["5V", "v+", 5, "Saida de 5 volts — vem do USB ou do regulador"],
    ["GND", "gnd", null, "Terra"],
    ["GND", "gnd", null, "Terra"],
    ["VIN", "v+", null, "Entrada de alimentacao externa, de 7 a 12 volts"],
  ];
  baixo.forEach(([n, papel, v, rotulo], i) => {
    p.push({ id: "b" + n + i, n, rotulo, x: 96 + i * P, y: 408, r: "femea", papel, v: v || undefined, lado: "cima" });
  });

  for (let i = 0; i < 6; i++) {
    p.push({
      id: "A" + i, n: "A" + i,
      rotulo: `Entrada analogica ${i}` + (i === 4 ? " — tambem SDA do I2C" : i === 5 ? " — tambem SCL do I2C" : ""),
      x: 312 + i * P, y: 408, r: "femea", papel: i >= 4 ? "i2c" : "analog", lado: "cima",
    });
  }
  return p;
}

function pinosBura32() {
  const esq = [
    ["3V3", "v+", 3.3, "Saida de 3,3 volts"],
    ["EN", "sinal", null, "Habilita a placa — puxar para o GND reinicia"],
    ["36", "so-entrada", null, "GPIO 36 (VP) — SOMENTE entrada, nao aciona nada"],
    ["39", "so-entrada", null, "GPIO 39 (VN) — SOMENTE entrada"],
    ["34", "so-entrada", null, "GPIO 34 — SOMENTE entrada, com ADC"],
    ["35", "so-entrada", null, "GPIO 35 — SOMENTE entrada, com ADC"],
    ["32", "digital", null, "GPIO 32 — digital, ADC e touch capacitivo"],
    ["33", "digital", null, "GPIO 33 — digital, ADC e touch capacitivo"],
    ["25", "digital", null, "GPIO 25 — digital e DAC 1 (saida analogica real)"],
    ["26", "digital", null, "GPIO 26 — digital e DAC 2 (saida analogica real)"],
    ["27", "digital", null, "GPIO 27 — digital e touch capacitivo"],
    ["14", "digital", null, "GPIO 14 — digital e touch capacitivo"],
    ["12", "digital", null, "GPIO 12 — digital e touch. Cuidado no boot"],
    ["13", "digital", null, "GPIO 13 — digital e touch capacitivo"],
    ["GND", "gnd", null, "Terra"],
  ];
  const dir = [
    ["VIN", "v+", null, "Entrada de 5 volts por alimentacao externa"],
    ["GND", "gnd", null, "Terra"],
    ["23", "spi", null, "GPIO 23 — SPI MOSI"],
    ["22", "i2c", null, "GPIO 22 — I2C SCL"],
    ["TX", "digital", null, "GPIO 1 — TX da serial"],
    ["RX", "digital", null, "GPIO 3 — RX da serial"],
    ["21", "i2c", null, "GPIO 21 — I2C SDA"],
    ["GND", "gnd", null, "Terra"],
    ["19", "spi", null, "GPIO 19 — SPI MISO"],
    ["18", "spi", null, "GPIO 18 — SPI CLK"],
    ["5", "spi", null, "GPIO 5 — SPI CS"],
    ["17", "digital", null, "GPIO 17 — digital"],
    ["16", "digital", null, "GPIO 16 — digital"],
    ["4", "digital", null, "GPIO 4 — digital e touch capacitivo"],
    ["2", "digital", null, "GPIO 2 — digital, touch e LED da placa"],
  ];
  const p = [];
  esq.forEach(([n, papel, v, rotulo], i) =>
    p.push({ id: "e" + i, n, rotulo, x: 24, y: 72 + i * P, r: "femea", papel, v, lado: "d" }));
  dir.forEach(([n, papel, v, rotulo], i) =>
    p.push({ id: "d" + i, n, rotulo, x: 264, y: 72 + i * P, r: "femea", papel, v, lado: "e" }));
  return p;
}

/* MicroBURA sai da caixa so com os cinco aneis de jacare.
   Os outros pinos exigem o adaptador de expansao. */
function pinosMicrobura() {
  const aneis = [
    ["P0", "digital", null, "Anel P0 — digital, PWM e entrada analogica"],
    ["P1", "digital", null, "Anel P1 — digital, PWM e entrada analogica"],
    ["P2", "digital", null, "Anel P2 — digital, PWM e entrada analogica"],
    ["3V", "v+", 3.3, "Anel de 3,3 volts — so para carga pequena"],
    ["GND", "gnd", null, "Anel de terra"],
  ];
  return aneis.map(([n, papel, v, rotulo], i) => ({
    id: "anel" + i, n, rotulo, x: 72 + i * 96, y: 360, r: "pad", papel, v, grande: true, lado: "cima",
  }));
}

function pinosExpansaoMicrobura() {
  const lista = [
    ["P3", "digital"], ["P4", "digital"], ["P6", "digital"], ["P7", "digital"],
    ["P8", "digital"], ["P9", "digital"], ["P10", "digital"], ["P12", "digital"],
    ["P16", "digital"], ["P19", "i2c"], ["P20", "i2c"],
  ];
  const p = lista.map(([n, papel], i) => ({
    id: n, n, rotulo: papel === "i2c" ? `${n} — linha do I2C` : `${n} — GPIO liberado pela expansao`,
    x: 48 + i * P, y: 168, r: "macho", papel, lado: "cima",
  }));
  // espelho dos aneis, para o adaptador conversar com a placa
  ["P0", "P1", "P2", "3V", "GND"].forEach((n, i) => {
    p.push({
      id: "esp" + i, n, rotulo: `${n} repetido pela expansao`,
      x: 48 + (i + 12) * P, y: 168, r: "macho",
      papel: n === "3V" ? "v+" : n === "GND" ? "gnd" : "digital",
      v: n === "3V" ? 3.3 : undefined, lado: "cima",
    });
  });
  return p;
}

/* ---------- protoboard ---------------------------------------- */

export const PB = { colunas: 30, x0: 24, larg: 768, alt: 456 };
export const LINHAS_PB = { supMais: 24, supMenos: 48, blocoA: 120, canal: 264, blocoB: 288, infMais: 408, infMenos: 432 };

function pinosProtoboard() {
  const p = [];
  const L = LINHAS_PB;
  const push = (id, n, x, y, no, rotulo) =>
    p.push({ id, n, rotulo, x, y, r: "femea", papel: "terminal", no, furo: true });
  for (let c = 0; c < PB.colunas; c++) {
    const x = PB.x0 + c * P;
    push(`sup+${c}`, "+", x, L.supMais, "trilho-sup+", "Trilho positivo de cima — atravessa a placa inteira");
    push(`sup-${c}`, "-", x, L.supMenos, "trilho-sup-", "Trilho negativo de cima — atravessa a placa inteira");
    ["A", "B", "C", "D", "E"].forEach((letra, i) =>
      push(`${letra}${c}`, letra + (c + 1), x, L.blocoA + i * P, `col-a-${c}`,
        `Coluna ${c + 1}, lado de cima — os cinco furos ${c + 1}A ate ${c + 1}E sao o mesmo ponto`));
    ["F", "G", "H", "I", "J"].forEach((letra, i) =>
      push(`${letra}${c}`, letra + (c + 1), x, L.blocoB + i * P, `col-b-${c}`,
        `Coluna ${c + 1}, lado de baixo — os cinco furos ${c + 1}F ate ${c + 1}J sao o mesmo ponto`));
    push(`inf+${c}`, "+", x, L.infMais, "trilho-inf+", "Trilho positivo de baixo");
    push(`inf-${c}`, "-", x, L.infMenos, "trilho-inf-", "Trilho negativo de baixo");
  }
  return p;
}

/* ---------- montagem do catalogo ------------------------------ */

const C = [];
const add = (def) => { C.push(def); return def; };

/* placas de controle */
add({
  id: "gaburino", nome: "GaburINO", caixa: "placas", arte: "placa-gaburino",
  w: 672, h: 432, cor: "#1D6C8C", alimentada: true, custo: 40,
  pinos: pinosGaburino(),
  tensaoLogica: 5, tensaoMaxPino: 5.5,
  limitePino: 40, limiteAlim: 500, limiteTotal: 800,
  usb: true, vinMin: 7, vinMax: 12,
});
add({
  id: "bura32", nome: "Bura32", caixa: "placas", arte: "placa-bura32",
  w: 288, h: 432, cor: "#1B1F26", alimentada: true, custo: 45,
  pinos: pinosBura32(),
  tensaoLogica: 3.3, tensaoMaxPino: 3.6,
  limitePino: 12, limiteAlim: 600, limiteTotal: 900,
  usb: true, vinMin: 5, vinMax: 5.5,
});
add({
  id: "microbura", nome: "MicroBURA", caixa: "placas", arte: "placa-microbura",
  w: 480, h: 384, cor: "#0F5A46", alimentada: true, custo: 60,
  pinos: pinosMicrobura(),
  tensaoLogica: 3.3, tensaoMaxPino: 3.6,
  limitePino: 5, limiteAlim: 90, limiteTotal: 120,
  usb: true, vinMin: 3, vinMax: 3.3,
  encaixaExpansao: "expansao-microbura",
});
add({
  id: "expansao-microbura", nome: "Expansao MicroBURA", caixa: "placas", arte: "expansao",
  w: 480, h: 216, cor: "#2A2E36", custo: 25,
  pinos: pinosExpansaoMicrobura(),
  expansaoDe: "microbura",
});
add({
  id: "protoboard", nome: "Protoboard 400", caixa: "placas", arte: "protoboard",
  w: PB.larg, h: PB.alt, cor: "#E6E4DC", custo: 10, base: true,
  pinos: pinosProtoboard(),
});

/* alimentacao */
add({
  id: "bateria9v", nome: "Bateria 9V", caixa: "energia", arte: "bateria", w: 168, h: 216,
  cor: "#2A2E36", fonte: true, custo: 8,
  pinos: [
    { id: "p", n: "+", rotulo: "Positivo — 9 volts", x: 48, y: 192, r: "macho", papel: "v+", v: 9, lado: "baixo" },
    { id: "n", n: "-", rotulo: "Negativo — terra", x: 96, y: 192, r: "macho", papel: "gnd", lado: "baixo" },
  ],
});
add({
  id: "suporteaa", nome: "Suporte 4x AA", caixa: "energia", arte: "suporte-aa", w: 336, h: 216,
  cor: "#1B1F26", fonte: true, custo: 12,
  pinos: [
    { id: "p", n: "+", rotulo: "Positivo — 6 volts com quatro pilhas", x: 240, y: 192, r: "macho", papel: "v+", v: 6, lado: "baixo" },
    { id: "n", n: "-", rotulo: "Negativo — terra", x: 288, y: 192, r: "macho", papel: "gnd", lado: "baixo" },
  ],
});
add({
  id: "fonte-protoboard", nome: "Fonte de protoboard", caixa: "energia", arte: "fonte-pb",
  w: 288, h: 144, cor: "#134E3A", fonte: true, ajustavel: [3.3, 5], custo: 15,
  pinos: [
    { id: "vout", n: "OUT", rotulo: "Saida ajustavel — 3,3 ou 5 volts", x: 72, y: 120, r: "macho", papel: "v+", v: 5, lado: "baixo" },
    { id: "gnd", n: "GND", rotulo: "Terra", x: 216, y: 120, r: "macho", papel: "gnd", lado: "baixo" },
  ],
});
add({
  id: "rele", nome: "Modulo rele", caixa: "energia", arte: "modulo", w: 264, h: 192,
  cor: "#1B4E8A", alimenta: 4.5, custo: 18, correnteTipica: 75,
  pinos: [
    { id: "gnd", n: "GND", rotulo: "Terra do lado de controle", x: 48, y: 168, r: "macho", papel: "gnd", lado: "baixo" },
    { id: "in", n: "IN", rotulo: "Sinal que aciona a bobina", x: 72, y: 168, r: "macho", papel: "sinal", lado: "baixo" },
    { id: "vcc", n: "VCC", rotulo: "Alimentacao de 5 volts", x: 96, y: 168, r: "macho", papel: "v+", lado: "baixo" },
    { id: "no", n: "NA", rotulo: "Contato normalmente aberto — isolado do controle", x: 192, y: 24, r: "borne", papel: "terminal", lado: "cima" },
    { id: "com", n: "COM", rotulo: "Contato comum — isolado do controle", x: 240, y: 24, r: "borne", papel: "terminal", lado: "cima" },
  ],
});
add({
  id: "ponteh", nome: "Ponte H L298N", caixa: "energia", arte: "ponte-h", w: 432, h: 336,
  cor: "#B23A32", alimenta: 6, correnteMax: 2000, custo: 30,
  pinos: [
    { id: "out1", n: "OUT1", rotulo: "Saida 1 do motor A", x: 48, y: 24, r: "borne", papel: "terminal", lado: "cima" },
    { id: "out2", n: "OUT2", rotulo: "Saida 2 do motor A", x: 96, y: 24, r: "borne", papel: "terminal", lado: "cima" },
    { id: "v12", n: "+12V", rotulo: "Alimentacao dos motores — de 6 a 12 volts", x: 192, y: 24, r: "borne", papel: "v+", lado: "cima" },
    { id: "gnd", n: "GND", rotulo: "Terra — precisa ser o MESMO da placa de controle", x: 240, y: 24, r: "borne", papel: "gnd", lado: "cima" },
    { id: "v5", n: "+5V", rotulo: "Saida de 5 volts do regulador interno", x: 288, y: 24, r: "borne", papel: "v+", v: 5, lado: "cima" },
    { id: "out3", n: "OUT3", rotulo: "Saida 1 do motor B", x: 336, y: 24, r: "borne", papel: "terminal", lado: "cima" },
    { id: "out4", n: "OUT4", rotulo: "Saida 2 do motor B", x: 384, y: 24, r: "borne", papel: "terminal", lado: "cima" },
    { id: "ena", n: "ENA", rotulo: "Velocidade do motor A — precisa de PWM", x: 144, y: 312, r: "macho", papel: "pwm", lado: "baixo" },
    { id: "in1", n: "IN1", rotulo: "Sentido do motor A", x: 168, y: 312, r: "macho", papel: "digital", lado: "baixo" },
    { id: "in2", n: "IN2", rotulo: "Sentido do motor A", x: 192, y: 312, r: "macho", papel: "digital", lado: "baixo" },
    { id: "in3", n: "IN3", rotulo: "Sentido do motor B", x: 216, y: 312, r: "macho", papel: "digital", lado: "baixo" },
    { id: "in4", n: "IN4", rotulo: "Sentido do motor B", x: 240, y: 312, r: "macho", papel: "digital", lado: "baixo" },
    { id: "enb", n: "ENB", rotulo: "Velocidade do motor B — precisa de PWM", x: 264, y: 312, r: "macho", papel: "pwm", lado: "baixo" },
  ],
});

/* pequenos componentes */
add({
  id: "resistor", nome: "Resistor", caixa: "pequenos", arte: "axial", w: 168, h: 96,
  cor: "#C9A227", passivo: true, valores: ["220", "330", "1k", "10k"], unidade: "ohm",
  potenciaMax: 0.25, custo: 1,
  pinos: [
    { id: "a", n: "", rotulo: "Terminal do resistor — nao tem polaridade", x: 24, y: 48, r: "macho", papel: "terminal" },
    { id: "b", n: "", rotulo: "Terminal do resistor — nao tem polaridade", x: 144, y: 48, r: "macho", papel: "terminal" },
  ],
});
add({
  id: "capacitor-eletro", nome: "Capacitor eletrolitico", caixa: "pequenos", arte: "radial",
  w: 96, h: 168, cor: "#20344F", valores: ["10uF", "100uF", "470uF"], polarizado: true,
  tensaoMax: 16, custo: 2,
  pinos: [
    { id: "p", n: "+", rotulo: "Positivo — perna comprida", x: 24, y: 144, r: "macho", papel: "terminal", lado: "baixo" },
    { id: "n", n: "-", rotulo: "Negativo — lado da faixa clara", x: 48, y: 144, r: "macho", papel: "terminal", lado: "baixo" },
  ],
});
add({
  id: "capacitor-ceramico", nome: "Capacitor ceramico", caixa: "pequenos", arte: "disco",
  w: 96, h: 144, cor: "#7A5A20", valores: ["100nF", "22pF"], custo: 1,
  pinos: [
    { id: "a", n: "", rotulo: "Terminal — nao tem polaridade", x: 24, y: 120, r: "macho", papel: "terminal" },
    { id: "b", n: "", rotulo: "Terminal — nao tem polaridade", x: 48, y: 120, r: "macho", papel: "terminal" },
  ],
});
add({
  id: "diodo", nome: "Diodo 1N4007", caixa: "pequenos", arte: "axial", w: 144, h: 96,
  cor: "#3A2A20", polarizado: true, custo: 1,
  pinos: [
    { id: "a", n: "A", rotulo: "Anodo — a corrente entra por aqui", x: 24, y: 48, r: "macho", papel: "terminal" },
    { id: "k", n: "K", rotulo: "Catodo — lado da faixa clara", x: 120, y: 48, r: "macho", papel: "terminal" },
  ],
});
add({
  id: "transistor", nome: "Transistor BC548", caixa: "pequenos", arte: "to92", w: 120, h: 144,
  cor: "#101318", custo: 2,
  pinos: [
    { id: "c", n: "C", rotulo: "Coletor", x: 24, y: 120, r: "macho", papel: "terminal", lado: "baixo" },
    { id: "b", n: "B", rotulo: "Base — controla a passagem", x: 48, y: 120, r: "macho", papel: "terminal", lado: "baixo" },
    { id: "e", n: "E", rotulo: "Emissor", x: 72, y: 120, r: "macho", papel: "terminal", lado: "baixo" },
  ],
});

/* luzes e telas */
add({
  id: "led", nome: "LED 5mm", caixa: "leds", arte: "led", w: 96, h: 168,
  cor: "#E24B4A", correnteTipica: 20, correnteMax: 40, polarizado: true, custo: 2,
  variantes: [
    { nome: "vermelho", cor: "#E24B4A", vf: 1.9 },
    { nome: "verde", cor: "#4ED17A", vf: 2.1 },
    { nome: "amarelo", cor: "#E9C542", vf: 2.0 },
    { nome: "azul", cor: "#5B9BE8", vf: 3.0 },
    { nome: "branco", cor: "#F2F2EE", vf: 3.1 },
  ],
  pinos: [
    { id: "a", n: "A", rotulo: "Anodo — perna comprida, recebe o positivo", x: 24, y: 144, r: "macho", papel: "terminal", lado: "baixo" },
    { id: "k", n: "K", rotulo: "Catodo — perna curta, vai para o GND", x: 48, y: 144, r: "macho", papel: "terminal", lado: "baixo" },
  ],
});
add({
  id: "ledrgb", nome: "LED RGB", caixa: "leds", arte: "led-rgb", w: 168, h: 192,
  cor: "#12151C", alimenta: 0, custo: 8,
  pinos: [
    { id: "r", n: "R", rotulo: "Canal vermelho — aceita PWM", x: 24, y: 168, r: "macho", papel: "pwm", lado: "baixo" },
    { id: "g", n: "G", rotulo: "Canal verde — aceita PWM", x: 48, y: 168, r: "macho", papel: "pwm", lado: "baixo" },
    { id: "b", n: "B", rotulo: "Canal azul — aceita PWM", x: 72, y: 168, r: "macho", papel: "pwm", lado: "baixo" },
    { id: "gnd", n: "GND", rotulo: "Catodo comum — vai para o terra", x: 96, y: 168, r: "macho", papel: "gnd", lado: "baixo" },
  ],
});
add({
  id: "neopixel", nome: "Neopixel 4x4", caixa: "leds", arte: "neopixel", w: 264, h: 288,
  cor: "#12151C", alimenta: 4.5, correnteTipica: 320, custo: 45,
  pinos: [
    { id: "gnd", n: "GND", rotulo: "Terra", x: 48, y: 264, r: "macho", papel: "gnd", lado: "baixo" },
    { id: "vcc", n: "VCC", rotulo: "5 volts — no branco total sao quase 1 ampere", x: 96, y: 264, r: "macho", papel: "v+", lado: "baixo" },
    { id: "in", n: "IN", rotulo: "Entrada de dados", x: 144, y: 264, r: "macho", papel: "digital", lado: "baixo" },
    { id: "out", n: "OUT", rotulo: "Saida de dados — vai para o proximo modulo", x: 192, y: 264, r: "macho", papel: "sinal", lado: "baixo" },
  ],
});
add({
  id: "lcdi2c", nome: "Display LCD I2C", caixa: "leds", arte: "lcd", w: 456, h: 216,
  cor: "#14472F", alimenta: 4.5, tela: true, correnteTipica: 25, custo: 35,
  pinos: [
    { id: "gnd", n: "GND", rotulo: "Terra", x: 288, y: 192, r: "macho", papel: "gnd", lado: "baixo" },
    { id: "vcc", n: "VCC", rotulo: "Alimentacao de 5 volts", x: 312, y: 192, r: "macho", papel: "v+", lado: "baixo" },
    { id: "sda", n: "SDA", rotulo: "Dados do I2C", x: 336, y: 192, r: "macho", papel: "i2c", lado: "baixo" },
    { id: "scl", n: "SCL", rotulo: "Relogio do I2C", x: 360, y: 192, r: "macho", papel: "i2c", lado: "baixo" },
  ],
});

/* som */
add({
  id: "buzzer", nome: "Buzzer ativo", caixa: "som", arte: "buzzer", w: 144, h: 168,
  cor: "#0B0D11", alimenta: 3, apito: true, correnteTipica: 30, custo: 6,
  pinos: [
    { id: "p", n: "+", rotulo: "Positivo — lado marcado na peca", x: 48, y: 144, r: "macho", papel: "v+", lado: "baixo" },
    { id: "n", n: "-", rotulo: "Negativo — vai para o GND", x: 72, y: 144, r: "macho", papel: "gnd", lado: "baixo" },
  ],
});

/* entradas */
add({
  id: "botao", nome: "Botao (push)", caixa: "entradas", arte: "botao", w: 120, h: 120,
  cor: "#1B1F26", pressionavel: true, custo: 2,
  ligacoes: [["1a", "1b"], ["2a", "2b"]],
  ligacoesFechado: [["1a", "2a"]],
  pinos: [
    { id: "1a", n: "1", rotulo: "Pino 1 — ligado de fabrica ao pino 3", x: 24, y: 24, r: "macho", papel: "terminal", lado: "cima" },
    { id: "2a", n: "2", rotulo: "Pino 2 — ligado de fabrica ao pino 4", x: 96, y: 24, r: "macho", papel: "terminal", lado: "cima" },
    { id: "1b", n: "3", rotulo: "Pino 3 — ligado de fabrica ao pino 1", x: 24, y: 96, r: "macho", papel: "terminal", lado: "baixo" },
    { id: "2b", n: "4", rotulo: "Pino 4 — ligado de fabrica ao pino 2", x: 96, y: 96, r: "macho", papel: "terminal", lado: "baixo" },
  ],
});
add({
  id: "potenciometro", nome: "Potenciometro 10k", caixa: "entradas", arte: "potenciometro",
  w: 168, h: 192, cor: "#1B1F26", ajuste: true, custo: 5,
  pinos: [
    { id: "a", n: "1", rotulo: "Extremo — costuma ir na alimentacao", x: 48, y: 168, r: "macho", papel: "terminal", lado: "baixo" },
    { id: "w", n: "W", rotulo: "Cursor — devolve a tensao proporcional ao giro", x: 72, y: 168, r: "macho", papel: "analog", lado: "baixo" },
    { id: "b", n: "3", rotulo: "Extremo — costuma ir no GND", x: 96, y: 168, r: "macho", papel: "terminal", lado: "baixo" },
  ],
});

/* sensores */
add({
  id: "ldr", nome: "Sensor de luz LDR", caixa: "sensores", arte: "ldr", w: 96, h: 168,
  cor: "#8A6B2A", custo: 3,
  pinos: [
    { id: "a", n: "", rotulo: "Terminal — nao tem polaridade", x: 24, y: 144, r: "macho", papel: "terminal", lado: "baixo" },
    { id: "b", n: "", rotulo: "Terminal — nao tem polaridade", x: 48, y: 144, r: "macho", papel: "terminal", lado: "baixo" },
  ],
});
add({
  id: "ultrassonico", nome: "Ultrassonico HC-SR04", caixa: "sensores", arte: "ultrassonico",
  w: 336, h: 192, cor: "#1B4E8A", alimenta: 4.5, correnteTipica: 15, custo: 20,
  pinos: [
    { id: "vcc", n: "VCC", rotulo: "Alimentacao de 5 volts", x: 120, y: 168, r: "macho", papel: "v+", lado: "baixo" },
    { id: "trig", n: "TRIG", rotulo: "Dispara a medida com um pulso curto", x: 144, y: 168, r: "macho", papel: "digital", lado: "baixo" },
    { id: "echo", n: "ECHO", rotulo: "Devolve a distancia — 5 volts, cuidado em placa de 3,3", x: 168, y: 168, r: "macho", papel: "digital", lado: "baixo" },
    { id: "gnd", n: "GND", rotulo: "Terra", x: 192, y: 168, r: "macho", papel: "gnd", lado: "baixo" },
  ],
});
add({
  id: "irobstaculo", nome: "Sensor de obstaculo IR", caixa: "sensores", arte: "ir-obstaculo",
  w: 264, h: 192, cor: "#1B4E8A", alimenta: 3, correnteTipica: 20, custo: 10,
  pinos: [
    { id: "vcc", n: "VCC", rotulo: "Alimentacao de 3,3 ou 5 volts", x: 96, y: 168, r: "macho", papel: "v+", lado: "baixo" },
    { id: "gnd", n: "GND", rotulo: "Terra", x: 120, y: 168, r: "macho", papel: "gnd", lado: "baixo" },
    { id: "out", n: "OUT", rotulo: "Saida digital — cai para zero quando ve obstaculo", x: 144, y: 168, r: "macho", papel: "digital", lado: "baixo" },
  ],
});

/* motores */
add({
  id: "servo180", nome: "Micro servo 180", caixa: "motores", arte: "servo", w: 288, h: 216,
  cor: "#1E58A8", alimenta: 4.5, correnteTipica: 550, precisaPwm: "sig", custo: 25,
  pinos: [
    { id: "gnd", n: "GND", rotulo: "Fio marrom ou preto — terra", x: 264, y: 96, r: "femea", papel: "gnd", fio: "#3A3F47", lado: "e" },
    { id: "vcc", n: "VCC", rotulo: "Fio vermelho — de 4,8 a 6 volts, fonte externa", x: 264, y: 120, r: "femea", papel: "v+", fio: "#E24B4A", lado: "e" },
    { id: "sig", n: "SIN", rotulo: "Fio laranja ou amarelo — sinal PWM", x: 264, y: 144, r: "femea", papel: "pwm", fio: "#E9C542", lado: "e" },
  ],
});
add({
  id: "motordc", nome: "Motor DC", caixa: "motores", arte: "motor", w: 360, h: 192,
  cor: "#565C66", alimenta: 3, correnteTipica: 800, custo: 15,
  pinos: [
    { id: "a", n: "+", rotulo: "Terminal — inverta os dois e o motor gira ao contrario", x: 288, y: 144, r: "macho", papel: "v+", fio: "#E24B4A", lado: "baixo" },
    { id: "b", n: "-", rotulo: "Terminal — inverta os dois e o motor gira ao contrario", x: 336, y: 144, r: "macho", papel: "gnd", fio: "#2A2E36", lado: "baixo" },
  ],
});

export const COMPONENTES = C;
export const PORID = Object.fromEntries(C.map((c) => [c.id, c]));

/* Gavetas e caixas do movel da oficina. */
export const MOVEIS = [
  { id: "placas",   nome: "Gaveta das placas",         icone: "placa" },
  { id: "leds",     nome: "Caixa de LEDs e telas",     icone: "led" },
  { id: "sensores", nome: "Caixa dos sensores",        icone: "sensor" },
  { id: "motores",  nome: "Gaveta dos motores",        icone: "motor" },
  { id: "energia",  nome: "Caixa da energia",          icone: "energia" },
  { id: "pequenos", nome: "Caixinha dos componentes",  icone: "passivo" },
  { id: "entradas", nome: "Caixa de botoes e chaves",  icone: "ferramenta" },
  { id: "som",      nome: "Caixa do som",              icone: "audio" },
];

/* Tipos de fio da sacola. Cada um tem duas pontas, e a ponta importa:
   e ela que decide onde encaixa. */
export const JUMPERS = [
  { id: "mm", nome: "Jumper macho-macho", pontas: ["macho", "macho"], cor: "#E24B4A" },
  { id: "mf", nome: "Jumper macho-femea", pontas: ["macho", "femea"], cor: "#5CE07A" },
  { id: "ff", nome: "Jumper femea-femea", pontas: ["femea", "femea"], cor: "#7DD3FC" },
  { id: "jj", nome: "Cabo jacare-jacare", pontas: ["jacare", "jacare"], cor: "#E9C542" },
  { id: "jm", nome: "Cabo jacare-macho", pontas: ["jacare", "macho"], cor: "#E08A3C" },
  { id: "jf", nome: "Cabo jacare-femea", pontas: ["jacare", "femea"], cor: "#C77DFF" },
];

export const CORES_FIO = ["#E24B4A", "#2A2E36", "#5CE07A", "#7DD3FC", "#E9C542", "#C77DFF", "#F2F2EE", "#E08A3C"];

/* O que cada ponta aceita tocar. Garra jacare tambem morde a ponta
   metalica de um jumper macho ja espetado, que e a gambiarra classica
   da bancada real. */
export const ACEITA = {
  macho: ["femea", "borne", "pad"],
  femea: ["macho", "pad"],
  jacare: ["macho", "pad", "borne"],
};

export const NOME_CONTATO = {
  macho: "pino macho (quadrado)",
  femea: "furo femea (redondo)",
  borne: "borne de parafuso (retangulo)",
  pad: "anel para jacare (retangulo)",
};
