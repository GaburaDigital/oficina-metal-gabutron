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
    ["VIN", "v+", null, "Entrada de alimentacao externa — precisa de 7 a 12 volts para o regulador trabalhar"],
  ];
  baixo.forEach(([n, papel, v, rotulo], i) => {
    p.push({
      id: "b" + n + i, n, rotulo, x: 96 + i * P, y: 408, r: "femea", papel,
      v: v || undefined, lado: "cima",
      ...(n === "VIN" ? { entrada: true, vmin: 7, vmax: 12 } : {}),
    });
  });

  // Plugue de energia, igual ao conector redondo do Arduino. E por aqui
  // que entra a bateria de 9 volts quando a placa sai do computador.
  p.push({ id: "jackP", n: "PWR+", rotulo: "Plugue de energia, pino central positivo — de 7 a 12 volts", x: 24, y: 312, r: "borne", papel: "v+", entrada: true, vmin: 7, vmax: 12, lado: "e" });
  p.push({ id: "jackN", n: "PWR-", rotulo: "Plugue de energia, anel externo — terra", x: 24, y: 360, r: "borne", papel: "gnd", lado: "e" });

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
    p.push({
      id: "d" + i, n, rotulo, x: 264, y: 72 + i * P, r: "femea", papel, v, lado: "e",
      ...(n === "VIN" ? { entrada: true, vmin: 4.7, vmax: 5.5 } : {}),
    }));
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
  const p = aneis.map(([n, papel, v, rotulo], i) => ({
    id: "anel" + i, n, rotulo, x: 72 + i * 96, y: 456, r: "pad", papel, v, grande: true, lado: "cima",
  }));
  // Conector de bateria no topo, igual ao da micro:bit real. Aceita de
  // 3 a 3,3 volts: e por aqui que o projeto sai do cabo e anda sozinho.
  p.push({ id: "batP", n: "BAT+", rotulo: "Conector de bateria, positivo — de 3 a 3,3 volts", x: 192, y: 48, r: "borne", papel: "v+", entrada: true, vmin: 2.9, vmax: 3.4, lado: "cima" });
  p.push({ id: "batN", n: "BAT-", rotulo: "Conector de bateria, negativo — terra", x: 288, y: 48, r: "borne", papel: "gnd", lado: "cima" });
  return p;
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
  w: 480, h: 480, cor: "#0F5A46", alimentada: true, custo: 60,
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
  acoplaEm: "microbura",
  mapa: { esp0: "anel0", esp1: "anel1", esp2: "anel2", esp3: "anel3", esp4: "anel4" },
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
    { id: "a", n: "+", rotulo: "Anodo, o positivo — perna comprida e dobrada", x: 24, y: 144, r: "macho", papel: "terminal", lado: "baixo" },
    { id: "k", n: "-", rotulo: "Catodo, o negativo — perna curta, vai para o GND", x: 48, y: 144, r: "macho", papel: "terminal", lado: "baixo" },
  ],
});
add({
  id: "ledrgb", nome: "LED RGB", caixa: "leds", arte: "led-rgb", w: 168, h: 216,
  cor: "#12151C", alimenta: 0, custo: 8,
  pinos: [
    { id: "r", n: "R", rotulo: "Canal vermelho — aceita PWM", x: 24, y: 192, r: "macho", papel: "pwm", lado: "baixo" },
    { id: "g", n: "G", rotulo: "Canal verde — aceita PWM", x: 48, y: 192, r: "macho", papel: "pwm", lado: "baixo" },
    { id: "b", n: "B", rotulo: "Canal azul — aceita PWM", x: 72, y: 192, r: "macho", papel: "pwm", lado: "baixo" },
    { id: "gnd", n: "GND", rotulo: "Catodo comum — vai para o terra", x: 96, y: 192, r: "macho", papel: "gnd", lado: "baixo" },
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
  cor: "#1B1F26", pressionavel: true, custo: 2, zonaAcao: { x: 60, y: 60, r: 36, acao: "pressionar" },
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
  id: "interruptor", nome: "Chave gangorra", caixa: "entradas", arte: "chave", w: 120, h: 144,
  cor: "#1B1F26", custo: 3, chaveavel: true,
  zonaAcao: { x: 60, y: 48, r: 40, acao: "chavear" },
  ligacoesFechado: [["a", "b"]],
  pinos: [
    { id: "a", n: "1", rotulo: "Terminal da chave — fecha o circuito quando ligada", x: 24, y: 120, r: "macho", papel: "terminal", lado: "baixo" },
    { id: "b", n: "2", rotulo: "Terminal da chave — fecha o circuito quando ligada", x: 72, y: 120, r: "macho", papel: "terminal", lado: "baixo" },
  ],
});
add({
  id: "potenciometro", nome: "Potenciometro 10k", caixa: "entradas", arte: "potenciometro",
  w: 168, h: 192, cor: "#1B1F26", ajuste: true, custo: 5, zonaAcao: { x: 84, y: 62, r: 46, acao: "girar" },
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
  cor: "#565C66", alimenta: 3, correnteTipica: 800, custo: 15, bipolar: true,
  pinos: [
    { id: "a", n: "+", rotulo: "Terminal — inverta os dois e o motor gira ao contrario", x: 288, y: 144, r: "macho", papel: "v+", fio: "#E24B4A", lado: "baixo" },
    { id: "b", n: "-", rotulo: "Terminal — inverta os dois e o motor gira ao contrario", x: 336, y: 144, r: "macho", papel: "gnd", fio: "#2A2E36", lado: "baixo" },
  ],
});

add({
  id: "arubagpi", nome: "Arubag Pi 95x", caixa: "placas", arte: "arubag",
  w: 456, h: 312, cor: "#1B6B3A", alimentada: true, custo: 120,
  tensaoLogica: 3.3, tensaoMaxPino: 3.6,
  limitePino: 16, limiteAlim: 1200, limiteTotal: 2500,
  usb: true, vinMin: 4.8, vinMax: 5.3,
  pinos: [
    { id: "p0", n: "3V3", rotulo: "3,3 volts — a Arubag trabalha em 3,3 volts", x: 72, y: 48, r: "femea", papel: "v+", lado: "cima" },
    { id: "p1", n: "5V", rotulo: "5 volts — a Arubag trabalha em 3,3 volts", x: 96, y: 48, r: "femea", papel: "v+", lado: "cima" },
    { id: "p2", n: "GND", rotulo: "Terra — a Arubag trabalha em 3,3 volts", x: 120, y: 48, r: "femea", papel: "gnd", lado: "cima" },
    { id: "p3", n: "GPIO2", rotulo: "GPIO 2 — SDA do I2C — a Arubag trabalha em 3,3 volts", x: 144, y: 48, r: "femea", papel: "i2c", lado: "cima" },
    { id: "p4", n: "GPIO3", rotulo: "GPIO 3 — SCL do I2C — a Arubag trabalha em 3,3 volts", x: 168, y: 48, r: "femea", papel: "i2c", lado: "cima" },
    { id: "p5", n: "GPIO4", rotulo: "GPIO 4 — a Arubag trabalha em 3,3 volts", x: 192, y: 48, r: "femea", papel: "digital", lado: "cima" },
    { id: "p6", n: "GPIO14", rotulo: "GPIO 14 — TX da serial — a Arubag trabalha em 3,3 volts", x: 216, y: 48, r: "femea", papel: "digital", lado: "cima" },
    { id: "p7", n: "GPIO15", rotulo: "GPIO 15 — RX da serial — a Arubag trabalha em 3,3 volts", x: 240, y: 48, r: "femea", papel: "digital", lado: "cima" },
    { id: "p8", n: "GPIO17", rotulo: "GPIO 17 — a Arubag trabalha em 3,3 volts", x: 264, y: 48, r: "femea", papel: "digital", lado: "cima" },
    { id: "p9", n: "GPIO18", rotulo: "GPIO 18 — PWM por hardware — a Arubag trabalha em 3,3 volts", x: 72, y: 72, r: "femea", papel: "pwm", lado: "baixo" },
    { id: "p10", n: "GPIO22", rotulo: "GPIO 22 — a Arubag trabalha em 3,3 volts", x: 96, y: 72, r: "femea", papel: "digital", lado: "baixo" },
    { id: "p11", n: "GPIO23", rotulo: "GPIO 23 — a Arubag trabalha em 3,3 volts", x: 120, y: 72, r: "femea", papel: "digital", lado: "baixo" },
    { id: "p12", n: "GPIO24", rotulo: "GPIO 24 — a Arubag trabalha em 3,3 volts", x: 144, y: 72, r: "femea", papel: "digital", lado: "baixo" },
    { id: "p13", n: "GPIO25", rotulo: "GPIO 25 — a Arubag trabalha em 3,3 volts", x: 168, y: 72, r: "femea", papel: "digital", lado: "baixo" },
    { id: "p14", n: "GPIO10", rotulo: "GPIO 10 — MOSI do SPI — a Arubag trabalha em 3,3 volts", x: 192, y: 72, r: "femea", papel: "spi", lado: "baixo" },
    { id: "p15", n: "GPIO9", rotulo: "GPIO 9 — MISO do SPI — a Arubag trabalha em 3,3 volts", x: 216, y: 72, r: "femea", papel: "spi", lado: "baixo" },
    { id: "p16", n: "GPIO11", rotulo: "GPIO 11 — SCLK do SPI — a Arubag trabalha em 3,3 volts", x: 240, y: 72, r: "femea", papel: "spi", lado: "baixo" },
    { id: "p17", n: "GPIO27", rotulo: "GPIO 27 — a Arubag trabalha em 3,3 volts", x: 264, y: 72, r: "femea", papel: "digital", lado: "baixo" },
    { id: "usbP", n: "5V IN", rotulo: "Entrada de energia USB-C — a placa exige 5 volts firmes", x: 48, y: 288, r: "borne", papel: "v+", entrada: true, vmin: 4.8, vmax: 5.3, lado: "cima" },
    { id: "usbN", n: "GND", rotulo: "Terra da entrada de energia", x: 96, y: 288, r: "borne", papel: "gnd", lado: "cima" }
  ],
});

add({
  id: "fenolite", nome: "Placa perfurada", caixa: "placas", arte: "fenolite",
  w: 456, h: 288, cor: "#8A6B2A", custo: 8, base: true,
  pinos: [
    { id: "h0_0", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 24, y: 24, r: "femea", papel: "terminal", furo: true },
    { id: "h0_1", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 48, y: 24, r: "femea", papel: "terminal", furo: true },
    { id: "h0_2", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 72, y: 24, r: "femea", papel: "terminal", furo: true },
    { id: "h0_3", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 96, y: 24, r: "femea", papel: "terminal", furo: true },
    { id: "h0_4", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 120, y: 24, r: "femea", papel: "terminal", furo: true },
    { id: "h0_5", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 144, y: 24, r: "femea", papel: "terminal", furo: true },
    { id: "h0_6", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 168, y: 24, r: "femea", papel: "terminal", furo: true },
    { id: "h0_7", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 192, y: 24, r: "femea", papel: "terminal", furo: true },
    { id: "h0_8", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 216, y: 24, r: "femea", papel: "terminal", furo: true },
    { id: "h0_9", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 240, y: 24, r: "femea", papel: "terminal", furo: true },
    { id: "h0_10", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 264, y: 24, r: "femea", papel: "terminal", furo: true },
    { id: "h0_11", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 288, y: 24, r: "femea", papel: "terminal", furo: true },
    { id: "h0_12", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 312, y: 24, r: "femea", papel: "terminal", furo: true },
    { id: "h0_13", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 336, y: 24, r: "femea", papel: "terminal", furo: true },
    { id: "h0_14", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 360, y: 24, r: "femea", papel: "terminal", furo: true },
    { id: "h0_15", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 384, y: 24, r: "femea", papel: "terminal", furo: true },
    { id: "h0_16", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 408, y: 24, r: "femea", papel: "terminal", furo: true },
    { id: "h0_17", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 432, y: 24, r: "femea", papel: "terminal", furo: true },
    { id: "h1_0", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 24, y: 48, r: "femea", papel: "terminal", furo: true },
    { id: "h1_1", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 48, y: 48, r: "femea", papel: "terminal", furo: true },
    { id: "h1_2", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 72, y: 48, r: "femea", papel: "terminal", furo: true },
    { id: "h1_3", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 96, y: 48, r: "femea", papel: "terminal", furo: true },
    { id: "h1_4", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 120, y: 48, r: "femea", papel: "terminal", furo: true },
    { id: "h1_5", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 144, y: 48, r: "femea", papel: "terminal", furo: true },
    { id: "h1_6", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 168, y: 48, r: "femea", papel: "terminal", furo: true },
    { id: "h1_7", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 192, y: 48, r: "femea", papel: "terminal", furo: true },
    { id: "h1_8", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 216, y: 48, r: "femea", papel: "terminal", furo: true },
    { id: "h1_9", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 240, y: 48, r: "femea", papel: "terminal", furo: true },
    { id: "h1_10", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 264, y: 48, r: "femea", papel: "terminal", furo: true },
    { id: "h1_11", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 288, y: 48, r: "femea", papel: "terminal", furo: true },
    { id: "h1_12", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 312, y: 48, r: "femea", papel: "terminal", furo: true },
    { id: "h1_13", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 336, y: 48, r: "femea", papel: "terminal", furo: true },
    { id: "h1_14", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 360, y: 48, r: "femea", papel: "terminal", furo: true },
    { id: "h1_15", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 384, y: 48, r: "femea", papel: "terminal", furo: true },
    { id: "h1_16", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 408, y: 48, r: "femea", papel: "terminal", furo: true },
    { id: "h1_17", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 432, y: 48, r: "femea", papel: "terminal", furo: true },
    { id: "h2_0", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 24, y: 72, r: "femea", papel: "terminal", furo: true },
    { id: "h2_1", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 48, y: 72, r: "femea", papel: "terminal", furo: true },
    { id: "h2_2", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 72, y: 72, r: "femea", papel: "terminal", furo: true },
    { id: "h2_3", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 96, y: 72, r: "femea", papel: "terminal", furo: true },
    { id: "h2_4", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 120, y: 72, r: "femea", papel: "terminal", furo: true },
    { id: "h2_5", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 144, y: 72, r: "femea", papel: "terminal", furo: true },
    { id: "h2_6", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 168, y: 72, r: "femea", papel: "terminal", furo: true },
    { id: "h2_7", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 192, y: 72, r: "femea", papel: "terminal", furo: true },
    { id: "h2_8", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 216, y: 72, r: "femea", papel: "terminal", furo: true },
    { id: "h2_9", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 240, y: 72, r: "femea", papel: "terminal", furo: true },
    { id: "h2_10", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 264, y: 72, r: "femea", papel: "terminal", furo: true },
    { id: "h2_11", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 288, y: 72, r: "femea", papel: "terminal", furo: true },
    { id: "h2_12", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 312, y: 72, r: "femea", papel: "terminal", furo: true },
    { id: "h2_13", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 336, y: 72, r: "femea", papel: "terminal", furo: true },
    { id: "h2_14", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 360, y: 72, r: "femea", papel: "terminal", furo: true },
    { id: "h2_15", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 384, y: 72, r: "femea", papel: "terminal", furo: true },
    { id: "h2_16", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 408, y: 72, r: "femea", papel: "terminal", furo: true },
    { id: "h2_17", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 432, y: 72, r: "femea", papel: "terminal", furo: true },
    { id: "h3_0", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 24, y: 96, r: "femea", papel: "terminal", furo: true },
    { id: "h3_1", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 48, y: 96, r: "femea", papel: "terminal", furo: true },
    { id: "h3_2", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 72, y: 96, r: "femea", papel: "terminal", furo: true },
    { id: "h3_3", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 96, y: 96, r: "femea", papel: "terminal", furo: true },
    { id: "h3_4", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 120, y: 96, r: "femea", papel: "terminal", furo: true },
    { id: "h3_5", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 144, y: 96, r: "femea", papel: "terminal", furo: true },
    { id: "h3_6", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 168, y: 96, r: "femea", papel: "terminal", furo: true },
    { id: "h3_7", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 192, y: 96, r: "femea", papel: "terminal", furo: true },
    { id: "h3_8", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 216, y: 96, r: "femea", papel: "terminal", furo: true },
    { id: "h3_9", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 240, y: 96, r: "femea", papel: "terminal", furo: true },
    { id: "h3_10", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 264, y: 96, r: "femea", papel: "terminal", furo: true },
    { id: "h3_11", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 288, y: 96, r: "femea", papel: "terminal", furo: true },
    { id: "h3_12", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 312, y: 96, r: "femea", papel: "terminal", furo: true },
    { id: "h3_13", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 336, y: 96, r: "femea", papel: "terminal", furo: true },
    { id: "h3_14", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 360, y: 96, r: "femea", papel: "terminal", furo: true },
    { id: "h3_15", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 384, y: 96, r: "femea", papel: "terminal", furo: true },
    { id: "h3_16", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 408, y: 96, r: "femea", papel: "terminal", furo: true },
    { id: "h3_17", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 432, y: 96, r: "femea", papel: "terminal", furo: true },
    { id: "h4_0", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 24, y: 120, r: "femea", papel: "terminal", furo: true },
    { id: "h4_1", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 48, y: 120, r: "femea", papel: "terminal", furo: true },
    { id: "h4_2", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 72, y: 120, r: "femea", papel: "terminal", furo: true },
    { id: "h4_3", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 96, y: 120, r: "femea", papel: "terminal", furo: true },
    { id: "h4_4", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 120, y: 120, r: "femea", papel: "terminal", furo: true },
    { id: "h4_5", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 144, y: 120, r: "femea", papel: "terminal", furo: true },
    { id: "h4_6", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 168, y: 120, r: "femea", papel: "terminal", furo: true },
    { id: "h4_7", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 192, y: 120, r: "femea", papel: "terminal", furo: true },
    { id: "h4_8", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 216, y: 120, r: "femea", papel: "terminal", furo: true },
    { id: "h4_9", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 240, y: 120, r: "femea", papel: "terminal", furo: true },
    { id: "h4_10", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 264, y: 120, r: "femea", papel: "terminal", furo: true },
    { id: "h4_11", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 288, y: 120, r: "femea", papel: "terminal", furo: true },
    { id: "h4_12", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 312, y: 120, r: "femea", papel: "terminal", furo: true },
    { id: "h4_13", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 336, y: 120, r: "femea", papel: "terminal", furo: true },
    { id: "h4_14", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 360, y: 120, r: "femea", papel: "terminal", furo: true },
    { id: "h4_15", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 384, y: 120, r: "femea", papel: "terminal", furo: true },
    { id: "h4_16", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 408, y: 120, r: "femea", papel: "terminal", furo: true },
    { id: "h4_17", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 432, y: 120, r: "femea", papel: "terminal", furo: true },
    { id: "h5_0", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 24, y: 144, r: "femea", papel: "terminal", furo: true },
    { id: "h5_1", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 48, y: 144, r: "femea", papel: "terminal", furo: true },
    { id: "h5_2", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 72, y: 144, r: "femea", papel: "terminal", furo: true },
    { id: "h5_3", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 96, y: 144, r: "femea", papel: "terminal", furo: true },
    { id: "h5_4", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 120, y: 144, r: "femea", papel: "terminal", furo: true },
    { id: "h5_5", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 144, y: 144, r: "femea", papel: "terminal", furo: true },
    { id: "h5_6", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 168, y: 144, r: "femea", papel: "terminal", furo: true },
    { id: "h5_7", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 192, y: 144, r: "femea", papel: "terminal", furo: true },
    { id: "h5_8", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 216, y: 144, r: "femea", papel: "terminal", furo: true },
    { id: "h5_9", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 240, y: 144, r: "femea", papel: "terminal", furo: true },
    { id: "h5_10", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 264, y: 144, r: "femea", papel: "terminal", furo: true },
    { id: "h5_11", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 288, y: 144, r: "femea", papel: "terminal", furo: true },
    { id: "h5_12", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 312, y: 144, r: "femea", papel: "terminal", furo: true },
    { id: "h5_13", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 336, y: 144, r: "femea", papel: "terminal", furo: true },
    { id: "h5_14", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 360, y: 144, r: "femea", papel: "terminal", furo: true },
    { id: "h5_15", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 384, y: 144, r: "femea", papel: "terminal", furo: true },
    { id: "h5_16", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 408, y: 144, r: "femea", papel: "terminal", furo: true },
    { id: "h5_17", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 432, y: 144, r: "femea", papel: "terminal", furo: true },
    { id: "h6_0", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 24, y: 168, r: "femea", papel: "terminal", furo: true },
    { id: "h6_1", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 48, y: 168, r: "femea", papel: "terminal", furo: true },
    { id: "h6_2", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 72, y: 168, r: "femea", papel: "terminal", furo: true },
    { id: "h6_3", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 96, y: 168, r: "femea", papel: "terminal", furo: true },
    { id: "h6_4", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 120, y: 168, r: "femea", papel: "terminal", furo: true },
    { id: "h6_5", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 144, y: 168, r: "femea", papel: "terminal", furo: true },
    { id: "h6_6", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 168, y: 168, r: "femea", papel: "terminal", furo: true },
    { id: "h6_7", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 192, y: 168, r: "femea", papel: "terminal", furo: true },
    { id: "h6_8", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 216, y: 168, r: "femea", papel: "terminal", furo: true },
    { id: "h6_9", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 240, y: 168, r: "femea", papel: "terminal", furo: true },
    { id: "h6_10", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 264, y: 168, r: "femea", papel: "terminal", furo: true },
    { id: "h6_11", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 288, y: 168, r: "femea", papel: "terminal", furo: true },
    { id: "h6_12", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 312, y: 168, r: "femea", papel: "terminal", furo: true },
    { id: "h6_13", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 336, y: 168, r: "femea", papel: "terminal", furo: true },
    { id: "h6_14", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 360, y: 168, r: "femea", papel: "terminal", furo: true },
    { id: "h6_15", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 384, y: 168, r: "femea", papel: "terminal", furo: true },
    { id: "h6_16", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 408, y: 168, r: "femea", papel: "terminal", furo: true },
    { id: "h6_17", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 432, y: 168, r: "femea", papel: "terminal", furo: true },
    { id: "h7_0", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 24, y: 192, r: "femea", papel: "terminal", furo: true },
    { id: "h7_1", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 48, y: 192, r: "femea", papel: "terminal", furo: true },
    { id: "h7_2", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 72, y: 192, r: "femea", papel: "terminal", furo: true },
    { id: "h7_3", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 96, y: 192, r: "femea", papel: "terminal", furo: true },
    { id: "h7_4", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 120, y: 192, r: "femea", papel: "terminal", furo: true },
    { id: "h7_5", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 144, y: 192, r: "femea", papel: "terminal", furo: true },
    { id: "h7_6", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 168, y: 192, r: "femea", papel: "terminal", furo: true },
    { id: "h7_7", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 192, y: 192, r: "femea", papel: "terminal", furo: true },
    { id: "h7_8", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 216, y: 192, r: "femea", papel: "terminal", furo: true },
    { id: "h7_9", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 240, y: 192, r: "femea", papel: "terminal", furo: true },
    { id: "h7_10", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 264, y: 192, r: "femea", papel: "terminal", furo: true },
    { id: "h7_11", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 288, y: 192, r: "femea", papel: "terminal", furo: true },
    { id: "h7_12", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 312, y: 192, r: "femea", papel: "terminal", furo: true },
    { id: "h7_13", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 336, y: 192, r: "femea", papel: "terminal", furo: true },
    { id: "h7_14", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 360, y: 192, r: "femea", papel: "terminal", furo: true },
    { id: "h7_15", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 384, y: 192, r: "femea", papel: "terminal", furo: true },
    { id: "h7_16", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 408, y: 192, r: "femea", papel: "terminal", furo: true },
    { id: "h7_17", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 432, y: 192, r: "femea", papel: "terminal", furo: true },
    { id: "h8_0", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 24, y: 216, r: "femea", papel: "terminal", furo: true },
    { id: "h8_1", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 48, y: 216, r: "femea", papel: "terminal", furo: true },
    { id: "h8_2", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 72, y: 216, r: "femea", papel: "terminal", furo: true },
    { id: "h8_3", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 96, y: 216, r: "femea", papel: "terminal", furo: true },
    { id: "h8_4", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 120, y: 216, r: "femea", papel: "terminal", furo: true },
    { id: "h8_5", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 144, y: 216, r: "femea", papel: "terminal", furo: true },
    { id: "h8_6", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 168, y: 216, r: "femea", papel: "terminal", furo: true },
    { id: "h8_7", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 192, y: 216, r: "femea", papel: "terminal", furo: true },
    { id: "h8_8", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 216, y: 216, r: "femea", papel: "terminal", furo: true },
    { id: "h8_9", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 240, y: 216, r: "femea", papel: "terminal", furo: true },
    { id: "h8_10", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 264, y: 216, r: "femea", papel: "terminal", furo: true },
    { id: "h8_11", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 288, y: 216, r: "femea", papel: "terminal", furo: true },
    { id: "h8_12", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 312, y: 216, r: "femea", papel: "terminal", furo: true },
    { id: "h8_13", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 336, y: 216, r: "femea", papel: "terminal", furo: true },
    { id: "h8_14", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 360, y: 216, r: "femea", papel: "terminal", furo: true },
    { id: "h8_15", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 384, y: 216, r: "femea", papel: "terminal", furo: true },
    { id: "h8_16", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 408, y: 216, r: "femea", papel: "terminal", furo: true },
    { id: "h8_17", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 432, y: 216, r: "femea", papel: "terminal", furo: true },
    { id: "h9_0", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 24, y: 240, r: "femea", papel: "terminal", furo: true },
    { id: "h9_1", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 48, y: 240, r: "femea", papel: "terminal", furo: true },
    { id: "h9_2", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 72, y: 240, r: "femea", papel: "terminal", furo: true },
    { id: "h9_3", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 96, y: 240, r: "femea", papel: "terminal", furo: true },
    { id: "h9_4", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 120, y: 240, r: "femea", papel: "terminal", furo: true },
    { id: "h9_5", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 144, y: 240, r: "femea", papel: "terminal", furo: true },
    { id: "h9_6", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 168, y: 240, r: "femea", papel: "terminal", furo: true },
    { id: "h9_7", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 192, y: 240, r: "femea", papel: "terminal", furo: true },
    { id: "h9_8", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 216, y: 240, r: "femea", papel: "terminal", furo: true },
    { id: "h9_9", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 240, y: 240, r: "femea", papel: "terminal", furo: true },
    { id: "h9_10", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 264, y: 240, r: "femea", papel: "terminal", furo: true },
    { id: "h9_11", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 288, y: 240, r: "femea", papel: "terminal", furo: true },
    { id: "h9_12", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 312, y: 240, r: "femea", papel: "terminal", furo: true },
    { id: "h9_13", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 336, y: 240, r: "femea", papel: "terminal", furo: true },
    { id: "h9_14", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 360, y: 240, r: "femea", papel: "terminal", furo: true },
    { id: "h9_15", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 384, y: 240, r: "femea", papel: "terminal", furo: true },
    { id: "h9_16", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 408, y: 240, r: "femea", papel: "terminal", furo: true },
    { id: "h9_17", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 432, y: 240, r: "femea", papel: "terminal", furo: true },
    { id: "h10_0", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 24, y: 264, r: "femea", papel: "terminal", furo: true },
    { id: "h10_1", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 48, y: 264, r: "femea", papel: "terminal", furo: true },
    { id: "h10_2", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 72, y: 264, r: "femea", papel: "terminal", furo: true },
    { id: "h10_3", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 96, y: 264, r: "femea", papel: "terminal", furo: true },
    { id: "h10_4", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 120, y: 264, r: "femea", papel: "terminal", furo: true },
    { id: "h10_5", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 144, y: 264, r: "femea", papel: "terminal", furo: true },
    { id: "h10_6", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 168, y: 264, r: "femea", papel: "terminal", furo: true },
    { id: "h10_7", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 192, y: 264, r: "femea", papel: "terminal", furo: true },
    { id: "h10_8", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 216, y: 264, r: "femea", papel: "terminal", furo: true },
    { id: "h10_9", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 240, y: 264, r: "femea", papel: "terminal", furo: true },
    { id: "h10_10", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 264, y: 264, r: "femea", papel: "terminal", furo: true },
    { id: "h10_11", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 288, y: 264, r: "femea", papel: "terminal", furo: true },
    { id: "h10_12", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 312, y: 264, r: "femea", papel: "terminal", furo: true },
    { id: "h10_13", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 336, y: 264, r: "femea", papel: "terminal", furo: true },
    { id: "h10_14", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 360, y: 264, r: "femea", papel: "terminal", furo: true },
    { id: "h10_15", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 384, y: 264, r: "femea", papel: "terminal", furo: true },
    { id: "h10_16", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 408, y: 264, r: "femea", papel: "terminal", furo: true },
    { id: "h10_17", n: "", rotulo: "Ilha isolada — aqui so a solda liga um ponto ao outro", x: 432, y: 264, r: "femea", papel: "terminal", furo: true },
  ],
});

add({
  id: "indutor", nome: "Indutor 100uH", caixa: "pequenos", arte: "axial",
  w: 168, h: 96, cor: "#3A3F47",
  pinos: [
    { id: "a", n: "", rotulo: "Terminal — nao tem polaridade", x: 72, y: 72, r: "macho", papel: "terminal", lado: "baixo" },
    { id: "b", n: "", rotulo: "Terminal — nao tem polaridade", x: 120, y: 72, r: "macho", papel: "terminal", lado: "baixo" }
  ],
});

add({
  id: "zener", nome: "Diodo zener 5V1", caixa: "pequenos", arte: "axial",
  w: 144, h: 96, cor: "#3A2A20", polarizado: true,
  pinos: [
    { id: "a", n: "A", rotulo: "Anodo — no zener a corrente util vem ao contrario", x: 48, y: 72, r: "macho", papel: "terminal", lado: "baixo" },
    { id: "b", n: "K", rotulo: "Catodo — lado da faixa, onde a tensao e grampeada", x: 96, y: 72, r: "macho", papel: "terminal", lado: "baixo" }
  ],
});

add({
  id: "laser", nome: "Diodo laser", caixa: "leds", arte: "modulo",
  w: 216, h: 168, cor: "#8A2C28", alimenta: 4.5, correnteTipica: 40,
  pinos: [
    { id: "a", n: "+", rotulo: "Positivo — 5 volts", x: 120, y: 144, r: "macho", papel: "v+", lado: "baixo" },
    { id: "b", n: "-", rotulo: "Negativo — terra", x: 168, y: 144, r: "macho", papel: "gnd", lado: "baixo" }
  ],
});

add({
  id: "lcd16", nome: "Display LCD 16 pinos", caixa: "leds", arte: "modulo",
  w: 384, h: 216, cor: "#14472F", alimenta: 4.5, tela: true, correnteTipica: 30, custo: 22,
  pinos: [
    { id: "vss", n: "VSS", rotulo: "Terra", x: 48, y: 192, r: "macho", papel: "gnd", lado: "baixo" },
    { id: "vdd", n: "VDD", rotulo: "5 volts", x: 72, y: 192, r: "macho", papel: "v+", lado: "baixo" },
    { id: "vo", n: "VO", rotulo: "Contraste — vai no cursor de um potenciometro", x: 96, y: 192, r: "macho", papel: "sinal", lado: "baixo" },
    { id: "rs", n: "RS", rotulo: "Escolhe entre comando e dado", x: 120, y: 192, r: "macho", papel: "digital", lado: "baixo" },
    { id: "rw", n: "RW", rotulo: "Leitura ou escrita — normalmente no GND", x: 144, y: 192, r: "macho", papel: "digital", lado: "baixo" },
    { id: "en", n: "E", rotulo: "Habilita a leitura do barramento", x: 168, y: 192, r: "macho", papel: "digital", lado: "baixo" },
    { id: "d4", n: "D4", rotulo: "Dado 4", x: 192, y: 192, r: "macho", papel: "digital", lado: "baixo" },
    { id: "d5", n: "D5", rotulo: "Dado 5", x: 216, y: 192, r: "macho", papel: "digital", lado: "baixo" },
    { id: "d6", n: "D6", rotulo: "Dado 6", x: 240, y: 192, r: "macho", papel: "digital", lado: "baixo" },
    { id: "d7", n: "D7", rotulo: "Dado 7", x: 264, y: 192, r: "macho", papel: "digital", lado: "baixo" },
    { id: "la", n: "LED+", rotulo: "Luz de fundo, positivo", x: 288, y: 192, r: "macho", papel: "v+", lado: "baixo" },
    { id: "lk", n: "LED-", rotulo: "Luz de fundo, negativo", x: 312, y: 192, r: "macho", papel: "gnd", lado: "baixo" },
  ],
});

add({
  id: "tft", nome: "Tela TFT touch 2.4", caixa: "leds", arte: "modulo",
  w: 432, h: 264, cor: "#1B1F26", alimenta: 4.5, tela: true, correnteTipica: 90, custo: 60,
  pinos: [
    { id: "vcc", n: "VCC", rotulo: "Alimentacao de 5 volts", x: 48, y: 240, r: "macho", papel: "v+", lado: "baixo" },
    { id: "gnd", n: "GND", rotulo: "Terra", x: 72, y: 240, r: "macho", papel: "gnd", lado: "baixo" },
    { id: "cs", n: "CS", rotulo: "Selecao do chip da tela", x: 96, y: 240, r: "macho", papel: "spi", lado: "baixo" },
    { id: "rst", n: "RST", rotulo: "Reinicia a tela", x: 120, y: 240, r: "macho", papel: "digital", lado: "baixo" },
    { id: "dc", n: "DC", rotulo: "Comando ou dado", x: 144, y: 240, r: "macho", papel: "digital", lado: "baixo" },
    { id: "sdi", n: "SDI", rotulo: "Entrada de dados, o MOSI", x: 168, y: 240, r: "macho", papel: "spi", lado: "baixo" },
    { id: "sck", n: "SCK", rotulo: "Relogio do SPI", x: 192, y: 240, r: "macho", papel: "spi", lado: "baixo" },
    { id: "led", n: "LED", rotulo: "Luz de fundo", x: 216, y: 240, r: "macho", papel: "v+", lado: "baixo" },
    { id: "sdo", n: "SDO", rotulo: "Saida de dados, o MISO", x: 240, y: 240, r: "macho", papel: "spi", lado: "baixo" },
    { id: "tcs", n: "T_CS", rotulo: "Selecao do chip do toque", x: 264, y: 240, r: "macho", papel: "spi", lado: "baixo" },
    { id: "tclk", n: "T_CLK", rotulo: "Relogio do toque", x: 288, y: 240, r: "macho", papel: "spi", lado: "baixo" },
    { id: "tdin", n: "T_DIN", rotulo: "Dados que entram no toque", x: 312, y: 240, r: "macho", papel: "spi", lado: "baixo" },
    { id: "tdout", n: "T_DOUT", rotulo: "Dados que saem do toque", x: 336, y: 240, r: "macho", papel: "spi", lado: "baixo" },
    { id: "tirq", n: "T_IRQ", rotulo: "Avisa quando alguem toca a tela", x: 360, y: 240, r: "macho", papel: "digital", lado: "baixo" },
  ],
});

add({
  id: "epaper", nome: "Display e-paper", caixa: "leds", arte: "modulo",
  w: 288, h: 240, cor: "#E6E4DC", alimenta: 3, tela: true, correnteTipica: 20, custo: 90,
  pinos: [
    { id: "vcc", n: "VCC", rotulo: "3,3 volts", x: 48, y: 216, r: "macho", papel: "v+", lado: "baixo" },
    { id: "gnd", n: "GND", rotulo: "Terra", x: 72, y: 216, r: "macho", papel: "gnd", lado: "baixo" },
    { id: "din", n: "DIN", rotulo: "Dados do SPI", x: 96, y: 216, r: "macho", papel: "spi", lado: "baixo" },
    { id: "clk", n: "CLK", rotulo: "Relogio do SPI", x: 120, y: 216, r: "macho", papel: "spi", lado: "baixo" },
    { id: "cs", n: "CS", rotulo: "Selecao do chip", x: 144, y: 216, r: "macho", papel: "spi", lado: "baixo" },
    { id: "dc", n: "DC", rotulo: "Comando ou dado", x: 168, y: 216, r: "macho", papel: "digital", lado: "baixo" },
    { id: "rst", n: "RST", rotulo: "Reinicia o display", x: 192, y: 216, r: "macho", papel: "digital", lado: "baixo" },
    { id: "busy", n: "BUSY", rotulo: "Avisa que ainda esta redesenhando — e demorado", x: 216, y: 216, r: "macho", papel: "digital", lado: "baixo" },
  ],
});

add({
  id: "buzzer-passivo", nome: "Buzzer passivo", caixa: "som", arte: "buzzer",
  w: 216, h: 192, cor: "#0B0D11", alimenta: 3, apito: true, correnteTipica: 30, custo: 6,
  pinos: [
    { id: "a", n: "+", rotulo: "Positivo — precisa de onda quadrada para tocar", x: 120, y: 168, r: "macho", papel: "v+", lado: "baixo" },
    { id: "b", n: "-", rotulo: "Negativo — terra", x: 168, y: 168, r: "macho", papel: "gnd", lado: "baixo" }
  ],
});

add({
  id: "altofalante", nome: "Alto-falante 8 ohms", caixa: "som", arte: "falante",
  w: 264, h: 240, cor: "#3A3F47", alimenta: 2, bipolar: true, correnteTipica: 300, custo: 12,
  pinos: [
    { id: "a", n: "+", rotulo: "Terminal do alto-falante", x: 168, y: 216, r: "macho", papel: "v+", lado: "baixo" },
    { id: "b", n: "-", rotulo: "Terminal do alto-falante", x: 216, y: 216, r: "macho", papel: "gnd", lado: "baixo" }
  ],
});

add({
  id: "amplificador", nome: "Amplificador PAM8403", caixa: "som", arte: "modulo",
  w: 240, h: 192, cor: "#1B4E8A", alimenta: 4.5, correnteTipica: 120, custo: 14,
  pinos: [
    { id: "vcc", n: "VCC", rotulo: "5 volts", x: 48, y: 168, r: "macho", papel: "v+", lado: "baixo" },
    { id: "gnd", n: "GND", rotulo: "Terra", x: 72, y: 168, r: "macho", papel: "gnd", lado: "baixo" },
    { id: "inl", n: "IN L", rotulo: "Entrada de audio da esquerda", x: 96, y: 168, r: "macho", papel: "sinal", lado: "baixo" },
    { id: "inr", n: "IN R", rotulo: "Entrada de audio da direita", x: 120, y: 168, r: "macho", papel: "sinal", lado: "baixo" },
    { id: "outl", n: "OUT L", rotulo: "Saida para o alto-falante esquerdo", x: 144, y: 168, r: "macho", papel: "sinal", lado: "baixo" },
    { id: "outr", n: "OUT R", rotulo: "Saida para o alto-falante direito", x: 168, y: 168, r: "macho", papel: "sinal", lado: "baixo" },
  ],
});

add({
  id: "dfplayer", nome: "Modulo MP3 DFPlayer", caixa: "som", arte: "modulo",
  w: 312, h: 216, cor: "#1B1F26", alimenta: 3.2, correnteTipica: 100, custo: 30,
  pinos: [
    { id: "vcc", n: "VCC", rotulo: "De 3,3 a 5 volts", x: 48, y: 192, r: "macho", papel: "v+", lado: "baixo" },
    { id: "rx", n: "RX", rotulo: "Recebe comando da placa — use resistor de 1k em serie", x: 72, y: 192, r: "macho", papel: "digital", lado: "baixo" },
    { id: "tx", n: "TX", rotulo: "Devolve resposta para a placa", x: 96, y: 192, r: "macho", papel: "digital", lado: "baixo" },
    { id: "dacr", n: "DAC_R", rotulo: "Audio da direita, nivel de linha", x: 120, y: 192, r: "macho", papel: "sinal", lado: "baixo" },
    { id: "dacl", n: "DAC_L", rotulo: "Audio da esquerda, nivel de linha", x: 144, y: 192, r: "macho", papel: "sinal", lado: "baixo" },
    { id: "spk1", n: "SPK1", rotulo: "Alto-falante, terminal 1", x: 168, y: 192, r: "macho", papel: "sinal", lado: "baixo" },
    { id: "gnd", n: "GND", rotulo: "Terra", x: 192, y: 192, r: "macho", papel: "gnd", lado: "baixo" },
    { id: "spk2", n: "SPK2", rotulo: "Alto-falante, terminal 2", x: 216, y: 192, r: "macho", papel: "sinal", lado: "baixo" },
    { id: "busy", n: "BUSY", rotulo: "Cai para zero enquanto toca", x: 240, y: 192, r: "macho", papel: "digital", lado: "baixo" },
  ],
});

add({
  id: "isd1820", nome: "Gravador de voz ISD1820", caixa: "som", arte: "modulo",
  w: 264, h: 216, cor: "#B23A32", alimenta: 3, correnteTipica: 50, custo: 26,
  pinos: [
    { id: "vcc", n: "VCC", rotulo: "De 3 a 5 volts", x: 48, y: 192, r: "macho", papel: "v+", lado: "baixo" },
    { id: "gnd", n: "GND", rotulo: "Terra", x: 72, y: 192, r: "macho", papel: "gnd", lado: "baixo" },
    { id: "rec", n: "REC", rotulo: "Segure para gravar", x: 96, y: 192, r: "macho", papel: "digital", lado: "baixo" },
    { id: "playe", n: "PLAYE", rotulo: "Toca a gravacao inteira com um toque", x: 120, y: 192, r: "macho", papel: "digital", lado: "baixo" },
    { id: "playl", n: "PLAYL", rotulo: "Toca enquanto ficar pressionado", x: 144, y: 192, r: "macho", papel: "digital", lado: "baixo" },
    { id: "spp", n: "SP+", rotulo: "Alto-falante, positivo", x: 168, y: 192, r: "macho", papel: "sinal", lado: "baixo" },
    { id: "spn", n: "SP-", rotulo: "Alto-falante, negativo", x: 192, y: 192, r: "macho", papel: "sinal", lado: "baixo" },
  ],
});

add({
  id: "ky037", nome: "Sensor de som KY-037", caixa: "sensores", arte: "modulo",
  w: 240, h: 192, cor: "#1B4E8A", alimenta: 4.5, correnteTipica: 15, custo: 12,
  pinos: [
    { id: "a0", n: "A0", rotulo: "Nivel do som em valor analogico", x: 48, y: 168, r: "macho", papel: "analog", lado: "baixo" },
    { id: "gnd", n: "GND", rotulo: "Terra", x: 72, y: 168, r: "macho", papel: "gnd", lado: "baixo" },
    { id: "vcc", n: "VCC", rotulo: "5 volts", x: 96, y: 168, r: "macho", papel: "v+", lado: "baixo" },
    { id: "d0", n: "D0", rotulo: "Vai para zero quando passa do limiar do trimpot", x: 120, y: 168, r: "macho", papel: "digital", lado: "baixo" },
  ],
});

add({
  id: "botao-arcade", nome: "Botao de arcade", caixa: "entradas", arte: "arcade",
  w: 264, h: 264, cor: "#B23A32", pressionavel: true, custo: 9,
  zonaAcao: { x: 120, y: 108, r: 84, acao: "pressionar" },
  ligacoesFechado: [["a", "b"]],
  pinos: [
    { id: "a", n: "1", rotulo: "Terminal do microswitch", x: 168, y: 240, r: "macho", papel: "terminal", lado: "baixo" },
    { id: "b", n: "2", rotulo: "Terminal do microswitch", x: 216, y: 240, r: "macho", papel: "terminal", lado: "baixo" }
  ],
});

add({
  id: "chave3", nome: "Chave de 3 pinos", caixa: "entradas", arte: "chave3",
  w: 168, h: 168, cor: "#1B1F26", custo: 4, chaveavel: true,
  zonaAcao: { x: 84, y: 60, r: 46, acao: "chavear" },
  ligacoes: [],
  ligacoesFechado: [["com", "b"]],
  ligacoesAberto: [["com", "a"]],
  pinos: [
    { id: "a", n: "1", rotulo: "Posicao 1 — fechada quando a chave esta para um lado", x: 48, y: 144, r: "macho", papel: "terminal", lado: "baixo" },
    { id: "com", n: "C", rotulo: "Comum — e por ele que a corrente entra", x: 72, y: 144, r: "macho", papel: "terminal", lado: "baixo" },
    { id: "b", n: "2", rotulo: "Posicao 2 — fechada quando a chave esta para o outro lado", x: 96, y: 144, r: "macho", papel: "terminal", lado: "baixo" }
  ],
});

add({
  id: "joystick", nome: "Joystick analogico", caixa: "entradas", arte: "modulo",
  w: 288, h: 288, cor: "#1B1F26", alimenta: 4.5, correnteTipica: 10, custo: 14,
  pinos: [
    { id: "gnd", n: "GND", rotulo: "Terra", x: 48, y: 264, r: "macho", papel: "gnd", lado: "baixo" },
    { id: "vcc", n: "VCC", rotulo: "5 volts", x: 72, y: 264, r: "macho", papel: "v+", lado: "baixo" },
    { id: "vrx", n: "VRx", rotulo: "Eixo horizontal, valor analogico", x: 96, y: 264, r: "macho", papel: "analog", lado: "baixo" },
    { id: "vry", n: "VRy", rotulo: "Eixo vertical, valor analogico", x: 120, y: 264, r: "macho", papel: "analog", lado: "baixo" },
    { id: "sw", n: "SW", rotulo: "Botao de apertar o manche", x: 144, y: 264, r: "macho", papel: "digital", lado: "baixo" },
  ],
});

add({
  id: "keypad", nome: "Teclado 4x4", caixa: "entradas", arte: "keypad",
  w: 336, h: 336, cor: "#1B1F26", custo: 12,
  pinos: [
    { id: "l1", n: "L1", rotulo: "Linha 1", x: 48, y: 312, r: "macho", papel: "digital", lado: "baixo" },
    { id: "l2", n: "L2", rotulo: "Linha 2", x: 72, y: 312, r: "macho", papel: "digital", lado: "baixo" },
    { id: "l3", n: "L3", rotulo: "Linha 3", x: 96, y: 312, r: "macho", papel: "digital", lado: "baixo" },
    { id: "l4", n: "L4", rotulo: "Linha 4", x: 120, y: 312, r: "macho", papel: "digital", lado: "baixo" },
    { id: "c1", n: "C1", rotulo: "Coluna 1", x: 144, y: 312, r: "macho", papel: "digital", lado: "baixo" },
    { id: "c2", n: "C2", rotulo: "Coluna 2", x: 168, y: 312, r: "macho", papel: "digital", lado: "baixo" },
    { id: "c3", n: "C3", rotulo: "Coluna 3", x: 192, y: 312, r: "macho", papel: "digital", lado: "baixo" },
    { id: "c4", n: "C4", rotulo: "Coluna 4", x: 216, y: 312, r: "macho", papel: "digital", lado: "baixo" },
  ],
});

add({
  id: "encoder", nome: "Encoder rotativo KY-040", caixa: "entradas", arte: "modulo",
  w: 240, h: 216, cor: "#1B1F26", alimenta: 3, correnteTipica: 8, custo: 10,
  pinos: [
    { id: "gnd", n: "GND", rotulo: "Terra", x: 48, y: 192, r: "macho", papel: "gnd", lado: "baixo" },
    { id: "vcc", n: "+", rotulo: "De 3,3 a 5 volts", x: 72, y: 192, r: "macho", papel: "v+", lado: "baixo" },
    { id: "sw", n: "SW", rotulo: "Botao de apertar o eixo", x: 96, y: 192, r: "macho", papel: "digital", lado: "baixo" },
    { id: "dt", n: "DT", rotulo: "Dado — comparado com CLK diz o sentido do giro", x: 120, y: 192, r: "macho", papel: "digital", lado: "baixo" },
    { id: "clk", n: "CLK", rotulo: "Pulso a cada passo do giro", x: 144, y: 192, r: "macho", papel: "digital", lado: "baixo" },
  ],
});

add({
  id: "ir-linha", nome: "Sensor seguidor de linha", caixa: "sensores", arte: "modulo",
  w: 240, h: 192, cor: "#1B4E8A", alimenta: 3, correnteTipica: 20, custo: 9,
  pinos: [
    { id: "vcc", n: "VCC", rotulo: "De 3,3 a 5 volts", x: 48, y: 168, r: "macho", papel: "v+", lado: "baixo" },
    { id: "gnd", n: "GND", rotulo: "Terra", x: 72, y: 168, r: "macho", papel: "gnd", lado: "baixo" },
    { id: "d0", n: "D0", rotulo: "Digital: preto ou branco, sem meio-termo", x: 96, y: 168, r: "macho", papel: "digital", lado: "baixo" },
    { id: "a0", n: "A0", rotulo: "Analogico: o quanto a superficie reflete", x: 120, y: 168, r: "macho", papel: "analog", lado: "baixo" },
  ],
});

add({
  id: "tcs3200", nome: "Sensor de cor TCS3200", caixa: "sensores", arte: "modulo",
  w: 288, h: 216, cor: "#1B4E8A", alimenta: 2.7, correnteTipica: 25, custo: 28,
  pinos: [
    { id: "vcc", n: "VCC", rotulo: "De 2,7 a 5,5 volts", x: 48, y: 192, r: "macho", papel: "v+", lado: "baixo" },
    { id: "gnd", n: "GND", rotulo: "Terra", x: 72, y: 192, r: "macho", papel: "gnd", lado: "baixo" },
    { id: "out", n: "OUT", rotulo: "Frequencia proporcional a cor lida", x: 96, y: 192, r: "macho", papel: "digital", lado: "baixo" },
    { id: "s0", n: "S0", rotulo: "Escala de frequencia", x: 120, y: 192, r: "macho", papel: "digital", lado: "baixo" },
    { id: "s1", n: "S1", rotulo: "Escala de frequencia", x: 144, y: 192, r: "macho", papel: "digital", lado: "baixo" },
    { id: "s2", n: "S2", rotulo: "Escolhe o filtro de cor", x: 168, y: 192, r: "macho", papel: "digital", lado: "baixo" },
    { id: "s3", n: "S3", rotulo: "Escolhe o filtro de cor", x: 192, y: 192, r: "macho", papel: "digital", lado: "baixo" },
    { id: "led", n: "LED", rotulo: "Acende os LEDs brancos que iluminam o alvo", x: 216, y: 192, r: "macho", papel: "digital", lado: "baixo" },
  ],
});

add({
  id: "pir", nome: "Sensor de presenca PIR", caixa: "sensores", arte: "pir",
  w: 240, h: 240, cor: "#1B4E8A", alimenta: 4.5, correnteTipica: 12, custo: 14,
  pinos: [
    { id: "vcc", n: "VCC", rotulo: "5 volts", x: 48, y: 216, r: "macho", papel: "v+", lado: "baixo" },
    { id: "gnd", n: "GND", rotulo: "Terra", x: 72, y: 216, r: "macho", papel: "gnd", lado: "baixo" },
    { id: "out", n: "OUT", rotulo: "Sobe para alto quando alguem se mexe", x: 96, y: 216, r: "macho", papel: "digital", lado: "baixo" },
  ],
});

add({
  id: "dht", nome: "Sensor de temperatura DHT11", caixa: "sensores", arte: "modulo",
  w: 240, h: 216, cor: "#1B4E8A", alimenta: 3, correnteTipica: 3, custo: 12,
  pinos: [
    { id: "vcc", n: "VCC", rotulo: "De 3,3 a 5 volts", x: 48, y: 192, r: "macho", papel: "v+", lado: "baixo" },
    { id: "out", n: "OUT", rotulo: "Temperatura e umidade num fio so, em protocolo proprio", x: 72, y: 192, r: "macho", papel: "digital", lado: "baixo" },
    { id: "gnd", n: "GND", rotulo: "Terra", x: 96, y: 192, r: "macho", papel: "gnd", lado: "baixo" },
  ],
});

add({
  id: "umidade-solo", nome: "Sensor de umidade do solo", caixa: "sensores", arte: "modulo",
  w: 240, h: 216, cor: "#1B4E8A", alimenta: 3, correnteTipica: 20, custo: 11,
  pinos: [
    { id: "vcc", n: "VCC", rotulo: "De 3,3 a 5 volts", x: 48, y: 192, r: "macho", papel: "v+", lado: "baixo" },
    { id: "gnd", n: "GND", rotulo: "Terra", x: 72, y: 192, r: "macho", papel: "gnd", lado: "baixo" },
    { id: "a0", n: "A0", rotulo: "Umidade em valor analogico", x: 96, y: 192, r: "macho", papel: "analog", lado: "baixo" },
    { id: "d0", n: "D0", rotulo: "Liga ou desliga conforme o trimpot", x: 120, y: 192, r: "macho", papel: "digital", lado: "baixo" },
    { id: "s1", n: "SONDA1", rotulo: "Vai para uma haste da sonda", x: 144, y: 192, r: "macho", papel: "terminal", lado: "baixo" },
    { id: "s2", n: "SONDA2", rotulo: "Vai para a outra haste da sonda", x: 168, y: 192, r: "macho", papel: "terminal", lado: "baixo" },
  ],
});

add({
  id: "mpu6050", nome: "Acelerometro MPU-6050", caixa: "sensores", arte: "modulo",
  w: 288, h: 216, cor: "#1B1F26", alimenta: 3, correnteTipica: 4, custo: 22,
  pinos: [
    { id: "vcc", n: "VCC", rotulo: "De 3,3 a 5 volts", x: 48, y: 192, r: "macho", papel: "v+", lado: "baixo" },
    { id: "gnd", n: "GND", rotulo: "Terra", x: 72, y: 192, r: "macho", papel: "gnd", lado: "baixo" },
    { id: "scl", n: "SCL", rotulo: "Relogio do I2C", x: 96, y: 192, r: "macho", papel: "i2c", lado: "baixo" },
    { id: "sda", n: "SDA", rotulo: "Dados do I2C", x: 120, y: 192, r: "macho", papel: "i2c", lado: "baixo" },
    { id: "xda", n: "XDA", rotulo: "I2C auxiliar, para pendurar outro sensor", x: 144, y: 192, r: "macho", papel: "i2c", lado: "baixo" },
    { id: "xcl", n: "XCL", rotulo: "Relogio do I2C auxiliar", x: 168, y: 192, r: "macho", papel: "i2c", lado: "baixo" },
    { id: "ad0", n: "AD0", rotulo: "Muda o endereco do modulo", x: 192, y: 192, r: "macho", papel: "digital", lado: "baixo" },
    { id: "int", n: "INT", rotulo: "Avisa quando ha leitura nova", x: 216, y: 192, r: "macho", papel: "digital", lado: "baixo" },
  ],
});

add({
  id: "motordc-reducao", nome: "Motor DC com reducao", caixa: "motores", arte: "motor",
  w: 384, h: 216, cor: "#565C66", alimenta: 3, correnteTipica: 900, bipolar: true, custo: 22,
  pinos: [
    { id: "a", n: "+", rotulo: "Terminal — inverta os dois e ele gira ao contrario", x: 288, y: 192, r: "macho", papel: "v+", lado: "baixo" },
    { id: "b", n: "-", rotulo: "Terminal — inverta os dois e ele gira ao contrario", x: 336, y: 192, r: "macho", papel: "gnd", lado: "baixo" }
  ],
});

add({
  id: "motor-drone", nome: "Motor de drone", caixa: "motores", arte: "motor",
  w: 240, h: 192, cor: "#565C66", alimenta: 3, correnteTipica: 1400, bipolar: true, custo: 18,
  pinos: [
    { id: "a", n: "+", rotulo: "Terminal — muita rotacao, pouco torque", x: 144, y: 168, r: "macho", papel: "v+", lado: "baixo" },
    { id: "b", n: "-", rotulo: "Terminal", x: 192, y: 168, r: "macho", papel: "gnd", lado: "baixo" }
  ],
});

add({
  id: "bomba", nome: "Bomba submersa", caixa: "motores", arte: "bomba",
  w: 288, h: 264, cor: "#1B4E8A", alimenta: 3, correnteTipica: 700, bipolar: true, custo: 20,
  pinos: [
    { id: "a", n: "+", rotulo: "Positivo — de 3 a 6 volts", x: 192, y: 240, r: "macho", papel: "v+", lado: "baixo" },
    { id: "b", n: "-", rotulo: "Negativo", x: 240, y: 240, r: "macho", papel: "gnd", lado: "baixo" }
  ],
});

add({
  id: "vibracao", nome: "Motor de vibracao", caixa: "motores", arte: "modulo",
  w: 240, h: 168, cor: "#1B1F26", alimenta: 3, correnteTipica: 90, custo: 8,
  pinos: [
    { id: "vcc", n: "VCC", rotulo: "De 3 a 5 volts", x: 48, y: 144, r: "macho", papel: "v+", lado: "baixo" },
    { id: "gnd", n: "GND", rotulo: "Terra", x: 72, y: 144, r: "macho", papel: "gnd", lado: "baixo" },
    { id: "sin", n: "SIN", rotulo: "Liga o motor; com PWM da para dosar a vibracao", x: 96, y: 144, r: "macho", papel: "pwm", lado: "baixo" },
  ],
});

add({
  id: "servo360", nome: "Micro servo 360", caixa: "motores", arte: "servo", w: 288, h: 216,
  cor: "#1E58A8", alimenta: 4.5, correnteTipica: 600, precisaPwm: "sig", custo: 26,
  pinos: [
    { id: "gnd", n: "GND", rotulo: "Fio marrom ou preto — terra", x: 264, y: 96, r: "femea", papel: "gnd", lado: "e" },
    { id: "vcc", n: "VCC", rotulo: "Fio vermelho — alimentacao externa, gira sem parar, e a velocidade que voce controla", x: 264, y: 120, r: "femea", papel: "v+", lado: "e" },
    { id: "sig", n: "SIN", rotulo: "Fio laranja ou amarelo — sinal PWM", x: 264, y: 144, r: "femea", papel: "pwm", lado: "e" }
  ],
});

add({
  id: "servo-torque180", nome: "Servo de alto torque 180", caixa: "motores", arte: "servo", w: 288, h: 216,
  cor: "#1E58A8", alimenta: 4.5, correnteTipica: 900, precisaPwm: "sig", custo: 48,
  pinos: [
    { id: "gnd", n: "GND", rotulo: "Fio marrom ou preto — terra", x: 264, y: 96, r: "femea", papel: "gnd", lado: "e" },
    { id: "vcc", n: "VCC", rotulo: "Fio vermelho — alimentacao externa, forte, e por isso puxa muito mais corrente", x: 264, y: 120, r: "femea", papel: "v+", lado: "e" },
    { id: "sig", n: "SIN", rotulo: "Fio laranja ou amarelo — sinal PWM", x: 264, y: 144, r: "femea", papel: "pwm", lado: "e" }
  ],
});

add({
  id: "servo-torque360", nome: "Servo de alto torque 360", caixa: "motores", arte: "servo", w: 288, h: 216,
  cor: "#1E58A8", alimenta: 4.5, correnteTipica: 900, precisaPwm: "sig", custo: 52,
  pinos: [
    { id: "gnd", n: "GND", rotulo: "Fio marrom ou preto — terra", x: 264, y: 96, r: "femea", papel: "gnd", lado: "e" },
    { id: "vcc", n: "VCC", rotulo: "Fio vermelho — alimentacao externa, forte e de giro continuo", x: 264, y: 120, r: "femea", papel: "v+", lado: "e" },
    { id: "sig", n: "SIN", rotulo: "Fio laranja ou amarelo — sinal PWM", x: 264, y: 144, r: "femea", papel: "pwm", lado: "e" }
  ],
});

add({
  id: "uln2003", nome: "Driver ULN2003 + motor de passo", caixa: "motores", arte: "modulo",
  w: 240, h: 240, cor: "#1B1F26", alimenta: 4.5, correnteTipica: 240, custo: 18,
  pinos: [
    { id: "in1", n: "IN1", rotulo: "Bobina 1", x: 48, y: 216, r: "macho", papel: "digital", lado: "baixo" },
    { id: "in2", n: "IN2", rotulo: "Bobina 2", x: 72, y: 216, r: "macho", papel: "digital", lado: "baixo" },
    { id: "in3", n: "IN3", rotulo: "Bobina 3", x: 96, y: 216, r: "macho", papel: "digital", lado: "baixo" },
    { id: "in4", n: "IN4", rotulo: "Bobina 4", x: 120, y: 216, r: "macho", papel: "digital", lado: "baixo" },
    { id: "vcc", n: "+", rotulo: "Alimentacao do motor, 5 volts", x: 144, y: 216, r: "macho", papel: "v+", lado: "baixo" },
    { id: "gnd", n: "-", rotulo: "Terra", x: 168, y: 216, r: "macho", papel: "gnd", lado: "baixo" },
  ],
});

add({
  id: "expansao-servo", nome: "Expansao de 16 servos", caixa: "energia", arte: "modulo",
  w: 456, h: 264, cor: "#134E3A", alimenta: 4.5, correnteTipica: 20, custo: 40,
  pinos: [
    { id: "gnd", n: "GND", rotulo: "Terra da logica", x: 48, y: 240, r: "macho", papel: "gnd", lado: "baixo" },
    { id: "vcc", n: "VCC", rotulo: "Alimentacao da logica, 5 volts", x: 72, y: 240, r: "macho", papel: "v+", lado: "baixo" },
    { id: "sda", n: "SDA", rotulo: "Dados do I2C", x: 96, y: 240, r: "macho", papel: "i2c", lado: "baixo" },
    { id: "scl", n: "SCL", rotulo: "Relogio do I2C", x: 120, y: 240, r: "macho", papel: "i2c", lado: "baixo" },
    { id: "v+", n: "V+", rotulo: "Alimentacao dos servos — entra por fora, nunca pela placa", x: 144, y: 240, r: "macho", papel: "v+", lado: "baixo" },
  ],
});

add({
  id: "ams1117", nome: "Regulador 5V AMS1117", caixa: "energia", arte: "modulo",
  w: 240, h: 168, cor: "#1B1F26", regula: 5, correnteMax: 800, custo: 4,
  pinos: [
    { id: "in", n: "IN", rotulo: "Entrada — precisa de pelo menos 6,5 volts", x: 48, y: 144, r: "macho", papel: "v+", lado: "baixo" },
    { id: "gnd", n: "GND", rotulo: "Terra", x: 72, y: 144, r: "macho", papel: "gnd", lado: "baixo" },
    { id: "out", n: "OUT", rotulo: "Saida de 5 volts, ate 800 mA", x: 96, y: 144, r: "macho", papel: "v+", lado: "baixo" },
  ],
});

add({
  id: "stepdown", nome: "Regulador stepdown", caixa: "energia", arte: "modulo", w: 288, h: 192,
  cor: "#134E3A", ajustavel: [3.3, 5, 9, 12], custo: 12, regulador: true,
  pinos: [
    { id: "inp", n: "IN+", rotulo: "Entrada positiva — abaixa a tensao com pouca perda", x: 48, y: 168, r: "macho", papel: "v+", entrada: true, vmin: 1, vmax: 30, lado: "baixo" },
    { id: "inn", n: "IN-", rotulo: "Entrada negativa", x: 96, y: 168, r: "macho", papel: "gnd", lado: "baixo" },
    { id: "outp", n: "OUT+", rotulo: "Saida positiva, no valor que voce ajustar", x: 144, y: 168, r: "macho", papel: "v+", v: 5, lado: "baixo" },
    { id: "outn", n: "OUT-", rotulo: "Saida negativa", x: 192, y: 168, r: "macho", papel: "gnd", lado: "baixo" }
  ],
});

add({
  id: "stepup", nome: "Regulador stepup", caixa: "energia", arte: "modulo", w: 288, h: 192,
  cor: "#134E3A", ajustavel: [3.3, 5, 9, 12], custo: 12, regulador: true,
  pinos: [
    { id: "inp", n: "IN+", rotulo: "Entrada positiva — levanta a tensao acima da entrada", x: 48, y: 168, r: "macho", papel: "v+", entrada: true, vmin: 1, vmax: 30, lado: "baixo" },
    { id: "inn", n: "IN-", rotulo: "Entrada negativa", x: 96, y: 168, r: "macho", papel: "gnd", lado: "baixo" },
    { id: "outp", n: "OUT+", rotulo: "Saida positiva, no valor que voce ajustar", x: 144, y: 168, r: "macho", papel: "v+", v: 5, lado: "baixo" },
    { id: "outn", n: "OUT-", rotulo: "Saida negativa", x: 192, y: 168, r: "macho", papel: "gnd", lado: "baixo" }
  ],
});

add({
  id: "fonte-bancada", nome: "Fonte de bancada", caixa: "energia", arte: "modulo", w: 288, h: 192,
  cor: "#2A2E36", fonte: true, ajustavel: [3.3, 5, 9, 12], custo: 180,
  pinos: [
    { id: "vout", n: "+", rotulo: "Fonte de laboratorio: voce escolhe a tensao no botao", x: 96, y: 168, r: "macho", papel: "v+", v: 12, lado: "baixo" },
    { id: "gnd", n: "-", rotulo: "Terra da fonte", x: 144, y: 168, r: "macho", papel: "gnd", lado: "baixo" }
  ],
});

add({
  id: "fonte-tomada", nome: "Fonte de tomada", caixa: "energia", arte: "modulo", w: 288, h: 192,
  cor: "#1B1F26", fonte: true, ajustavel: [5, 9], custo: 25,
  pinos: [
    { id: "vout", n: "+", rotulo: "Fonte de parede — 3 amperes de folga", x: 96, y: 168, r: "macho", papel: "v+", v: 9, lado: "baixo" },
    { id: "gnd", n: "-", rotulo: "Terra da fonte", x: 144, y: 168, r: "macho", papel: "gnd", lado: "baixo" }
  ],
});

add({
  id: "bateria-recarregavel", nome: "Bateria recarregavel 5V", caixa: "energia", arte: "modulo", w: 288, h: 192,
  cor: "#134E3A", fonte: true, custo: 60,
  pinos: [
    { id: "vout", n: "+", rotulo: "Power bank: 5 volts firmes e 3 amperes", x: 96, y: 168, r: "macho", papel: "v+", v: 5, lado: "baixo" },
    { id: "gnd", n: "-", rotulo: "Terra da fonte", x: 144, y: 168, r: "macho", papel: "gnd", lado: "baixo" }
  ],
});

add({
  id: "suporte-litio", nome: "Suporte de bateria de litio", caixa: "energia", arte: "modulo", w: 288, h: 192,
  cor: "#1B1F26", fonte: true, custo: 14,
  pinos: [
    { id: "vout", n: "+", rotulo: "Celula de litio: 3,7 volts que caem devagar", x: 96, y: 168, r: "macho", papel: "v+", v: 3.7, lado: "baixo" },
    { id: "gnd", n: "-", rotulo: "Terra da fonte", x: 144, y: 168, r: "macho", papel: "gnd", lado: "baixo" }
  ],
});

add({
  id: "celula-solar", nome: "Celula solar", caixa: "energia", arte: "solar",
  w: 336, h: 240, cor: "#20344F", fonte: true, custo: 30,
  pinos: [
    { id: "a", n: "+", rotulo: "Positivo — so entrega energia com luz forte em cima", x: 240, y: 216, r: "macho", papel: "v+", lado: "baixo" },
    { id: "b", n: "-", rotulo: "Negativo", x: 288, y: 216, r: "macho", papel: "gnd", lado: "baixo" }
  ],
});

add({
  id: "hc06", nome: "Modulo bluetooth HC-06", caixa: "comunicacao", arte: "modulo",
  w: 240, h: 192, cor: "#1B1F26", alimenta: 3.6, correnteTipica: 40, custo: 25,
  pinos: [
    { id: "vcc", n: "VCC", rotulo: "De 3,6 a 6 volts", x: 48, y: 168, r: "macho", papel: "v+", lado: "baixo" },
    { id: "gnd", n: "GND", rotulo: "Terra", x: 72, y: 168, r: "macho", papel: "gnd", lado: "baixo" },
    { id: "txd", n: "TXD", rotulo: "Sai da placa do modulo e entra no RX da sua placa", x: 96, y: 168, r: "macho", papel: "digital", lado: "baixo" },
    { id: "rxd", n: "RXD", rotulo: "Entra no modulo — em placa de 5 volts, use divisor de tensao", x: 120, y: 168, r: "macho", papel: "digital", lado: "baixo" },
  ],
});

add({
  id: "esp01", nome: "Modulo wifi ESP-01", caixa: "comunicacao", arte: "modulo",
  w: 288, h: 216, cor: "#1B4E8A", alimenta: 3, tensaoMaxPino: 3.6, correnteTipica: 250, custo: 20,
  pinos: [
    { id: "gnd", n: "GND", rotulo: "Terra", x: 48, y: 192, r: "macho", papel: "gnd", lado: "baixo" },
    { id: "gpio2", n: "GPIO2", rotulo: "GPIO 2", x: 72, y: 192, r: "macho", papel: "digital", lado: "baixo" },
    { id: "gpio0", n: "GPIO0", rotulo: "GPIO 0 — puxado ao GND entra em gravacao", x: 96, y: 192, r: "macho", papel: "digital", lado: "baixo" },
    { id: "rx", n: "RX", rotulo: "Recebe dados", x: 120, y: 192, r: "macho", papel: "digital", lado: "baixo" },
    { id: "tx", n: "TX", rotulo: "Envia dados", x: 144, y: 192, r: "macho", papel: "digital", lado: "baixo" },
    { id: "chpd", n: "CH_PD", rotulo: "Precisa ficar em nivel alto ou o modulo nem liga", x: 168, y: 192, r: "macho", papel: "v+", lado: "baixo" },
    { id: "rst", n: "RST", rotulo: "Reinicia o modulo", x: 192, y: 192, r: "macho", papel: "digital", lado: "baixo" },
    { id: "vcc", n: "VCC", rotulo: "3,3 volts APENAS — 5 volts matam o modulo", x: 216, y: 192, r: "macho", papel: "v+", lado: "baixo" },
  ],
});

add({
  id: "enc28j60", nome: "Modulo ethernet ENC28J60", caixa: "comunicacao", arte: "modulo",
  w: 312, h: 216, cor: "#1B1F26", alimenta: 3, tensaoMaxPino: 3.6, correnteTipica: 180, custo: 35,
  pinos: [
    { id: "vcc", n: "VCC", rotulo: "3,3 volts", x: 48, y: 192, r: "macho", papel: "v+", lado: "baixo" },
    { id: "gnd", n: "GND", rotulo: "Terra", x: 72, y: 192, r: "macho", papel: "gnd", lado: "baixo" },
    { id: "clk", n: "CLK", rotulo: "Saida de relogio, quase nunca usada", x: 96, y: 192, r: "macho", papel: "sinal", lado: "baixo" },
    { id: "sck", n: "SCK", rotulo: "Relogio do SPI", x: 120, y: 192, r: "macho", papel: "spi", lado: "baixo" },
    { id: "so", n: "SO", rotulo: "Saida de dados, vai no MISO", x: 144, y: 192, r: "macho", papel: "spi", lado: "baixo" },
    { id: "si", n: "SI", rotulo: "Entrada de dados, vem do MOSI", x: 168, y: 192, r: "macho", papel: "spi", lado: "baixo" },
    { id: "cs", n: "CS", rotulo: "Selecao do chip", x: 192, y: 192, r: "macho", papel: "spi", lado: "baixo" },
    { id: "rst", n: "RST", rotulo: "Reinicia o modulo", x: 216, y: 192, r: "macho", papel: "digital", lado: "baixo" },
    { id: "int", n: "INT", rotulo: "Avisa que chegou pacote", x: 240, y: 192, r: "macho", papel: "digital", lado: "baixo" },
  ],
});

add({
  id: "nrf24l01", nome: "Modulo de radio NRF24L01", caixa: "comunicacao", arte: "modulo",
  w: 288, h: 216, cor: "#1B1F26", alimenta: 1.9, tensaoMaxPino: 3.6, correnteTipica: 120, custo: 18,
  pinos: [
    { id: "gnd", n: "GND", rotulo: "Terra", x: 48, y: 192, r: "macho", papel: "gnd", lado: "baixo" },
    { id: "vcc", n: "VCC", rotulo: "3,3 volts APENAS", x: 72, y: 192, r: "macho", papel: "v+", lado: "baixo" },
    { id: "ce", n: "CE", rotulo: "Liga o radio para transmitir ou receber", x: 96, y: 192, r: "macho", papel: "digital", lado: "baixo" },
    { id: "csn", n: "CSN", rotulo: "Selecao do chip", x: 120, y: 192, r: "macho", papel: "spi", lado: "baixo" },
    { id: "sck", n: "SCK", rotulo: "Relogio do SPI", x: 144, y: 192, r: "macho", papel: "spi", lado: "baixo" },
    { id: "mosi", n: "MOSI", rotulo: "Dados que entram", x: 168, y: 192, r: "macho", papel: "spi", lado: "baixo" },
    { id: "miso", n: "MISO", rotulo: "Dados que saem", x: 192, y: 192, r: "macho", papel: "spi", lado: "baixo" },
    { id: "irq", n: "IRQ", rotulo: "Avisa que ha novidade", x: 216, y: 192, r: "macho", papel: "digital", lado: "baixo" },
  ],
});

add({
  id: "cartao-sd", nome: "Modulo cartao SD", caixa: "extras", arte: "modulo",
  w: 240, h: 192, cor: "#1B1F26", alimenta: 4.5, correnteTipica: 80, custo: 15,
  pinos: [
    { id: "gnd", n: "GND", rotulo: "Terra", x: 48, y: 168, r: "macho", papel: "gnd", lado: "baixo" },
    { id: "vcc", n: "VCC", rotulo: "5 volts", x: 72, y: 168, r: "macho", papel: "v+", lado: "baixo" },
    { id: "miso", n: "MISO", rotulo: "Dados que saem do cartao", x: 96, y: 168, r: "macho", papel: "spi", lado: "baixo" },
    { id: "mosi", n: "MOSI", rotulo: "Dados que entram no cartao", x: 120, y: 168, r: "macho", papel: "spi", lado: "baixo" },
    { id: "sck", n: "SCK", rotulo: "Relogio do SPI", x: 144, y: 168, r: "macho", papel: "spi", lado: "baixo" },
    { id: "cs", n: "CS", rotulo: "Selecao do chip", x: 168, y: 168, r: "macho", papel: "spi", lado: "baixo" },
  ],
});

add({
  id: "pendrive", nome: "Pen drive", caixa: "extras", arte: "pendrive",
  w: 264, h: 144, cor: "#3A3F47", custo: 25, inerte: true,
  pinos: [],
});

add({
  id: "caixa-bluetooth", nome: "Caixa de som bluetooth", caixa: "extras", arte: "caixa-som",
  w: 336, h: 264, cor: "#1B1F26", custo: 90, inerte: true,
  pinos: [
    { id: "p3", n: "P2", rotulo: "Entrada auxiliar de audio", x: 288, y: 240, r: "borne", papel: "sinal", lado: "cima" }
  ],
});

add({
  id: "clipe", nome: "Clipe de papel", caixa: "extras", arte: "clipe",
  w: 168, h: 96, cor: "#B9BEC6", custo: 0,
  pinos: [
    { id: "a", n: "", rotulo: "Ponta do clipe — metal conduz, e e por isso que ele vira gambiarra", x: 24, y: 48, r: "macho", papel: "terminal" },
    { id: "b", n: "", rotulo: "Outra ponta do clipe", x: 144, y: 48, r: "macho", papel: "terminal" }
  ],
  ligacoes: [["a", "b"]],
});

/* Ponta solta: quando voce clipa uma garra e deixa a outra ponta
   pendurada, ela vira um ponto de ligacao na bancada. Dali saem
   quantos fios voce quiser — a gambiarra classica do laboratorio. */
add({
  id: "ponta-solta", nome: "Ponta solta", caixa: null, arte: "ponta-solta",
  w: 72, h: 72, cor: "#C9CDD3", custo: 0, avulsa: true,
  pinos: [
    { id: "no", n: "", rotulo: "Ponta solta — aceita garra jacare, ponta macho e ponta femea", x: 24, y: 48, r: "borne", papel: "terminal" },
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
  { id: "comunicacao", nome: "Caixa de comunicacao",   icone: "sensor" },
  { id: "extras",   nome: "Gaveta das tranqueiras",    icone: "ferramenta" },
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
  femea: ["macho", "pad", "borne"],
  jacare: ["macho", "pad", "borne"],
};

export const NOME_CONTATO = {
  macho: "pino macho (quadrado)",
  femea: "furo femea (redondo)",
  borne: "borne de parafuso (retangulo)",
  pad: "anel para jacare (retangulo)",
};
