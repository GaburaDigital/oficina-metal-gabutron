/* ============================================================
   ARTE — desenhos revisados no assistente de desenho.

   Este arquivo é GERADO: ele vem do "Exportar tudo" da ferramenta em
   ferramentas/assistente-desenho.html. Para atualizar o visual de uma
   peça, edite lá e substitua este arquivo. Não mexa nele à mão.

   O corpo aqui é estático. O que muda com a energia (brilho do LED,
   luz de ligado, ondas de som, tela acesa, motor girando) continua
   sendo desenhado por cima, em js/desenhos.js. É por isso que existe
   o campo "luzes": ele marca onde a peça acende.

   Origem: desenhos-gabutron-2026-09-05, 54 peças editadas.
   ============================================================ */

export const ARTE = {
  "bura32": {
    svg: `<rect width="288" height="432" rx="8" fill="#1B1F26" stroke="#0A0C11" stroke-width="3"></rect><rect x="66" y="96" width="156" height="150" rx="4" fill="#3A3F47"></rect><text x="144" y="160" font-family="monospace" font-size="22" font-weight="500" fill="#E8E8E4" text-anchor="middle">BURA32</text><text x="144" y="188" font-family="monospace" font-size="14" font-weight="500" fill="#8A8F98" text-anchor="middle">WROOM</text><text x="144" y="216" font-family="monospace" font-size="14" font-weight="500" fill="#E0A73C" text-anchor="middle">3.3V</text><rect x="96" y="270" width="96" height="42" rx="4" fill="#B9BEC6"></rect><text x="144" y="298" font-family="monospace" font-size="13" font-weight="500" fill="#31363E" text-anchor="middle">USB-C</text><circle cx="96" cy="342" r="6" fill="#4A1E1E"></circle><rect x="152" y="330" width="46" height="24" rx="3" fill="#0A0C11"></rect><text x="175" y="348" font-family="monospace" font-size="12" font-weight="500" fill="#8A8F98" text-anchor="middle">EN</text><rect x="204" y="330" width="46" height="24" rx="3" fill="#0A0C11"></rect><text x="227" y="348" font-family="monospace" font-size="10" font-weight="500" fill="#8A8F98" text-anchor="middle">BOOT</text>`,
  },
  "microbura": {
    svg: `<path d="M168 60h144v22H168z" fill="#2A2E36" transform="translate(-138 17)"></path><rect x="168" y="24" width="141" height="27" rx="6" fill="#F2F2EE" stroke="#8A8F98" stroke-width="2" transform="translate(-137 35)"></rect><rect x="180" y="32" width="24" height="9" rx="3" fill="#E24B4A" transform="translate(-145 52)"></rect><rect x="276" y="32" width="24" height="10" rx="3" fill="#0a3fa9" stroke="none" transform="translate(-132 51)"></rect><text x="240" y="14" font-family="monospace" font-size="5" font-weight="500" fill="#9FD8C6" text-anchor="middle" transform="translate(-139 60)">conector de bateria 3V</text><path d="M12 96h456a12 12 0 0112 12v320H0V108a12 12 0 0112-12z" fill="#0F5A46" stroke="#073024" stroke-width="3"></path><path d="M0 428h480v40a12 12 0 01-12 12H12a12 12 0 01-12-12z" fill="#0B4536"></path><text x="240" y="168" font-family="monospace" font-size="26" font-weight="500" fill="#E8E8E4" text-anchor="middle">MicroBURA</text><text x="240" y="194" font-family="monospace" font-size="14" font-weight="500" fill="#9FD8C6" text-anchor="middle">v2 — logica de 3,3 V</text><circle cx="168" cy="228" r="7" fill="#3A1F1F"></circle><circle cx="204" cy="228" r="7" fill="#3A1F1F"></circle><circle cx="240" cy="228" r="7" fill="#3A1F1F"></circle><circle cx="276" cy="228" r="7" fill="#3A1F1F"></circle><circle cx="312" cy="228" r="7" fill="#3A1F1F"></circle><circle cx="168" cy="258" r="7" fill="#3A1F1F"></circle><circle cx="204" cy="258" r="7" fill="#3A1F1F"></circle><circle cx="240" cy="258" r="7" fill="#3A1F1F"></circle><circle cx="276" cy="258" r="7" fill="#3A1F1F"></circle><circle cx="312" cy="258" r="7" fill="#3A1F1F"></circle><circle cx="168" cy="288" r="7" fill="#3A1F1F"></circle><circle cx="204" cy="288" r="7" fill="#3A1F1F"></circle><circle cx="240" cy="288" r="7" fill="#3A1F1F"></circle><circle cx="276" cy="288" r="7" fill="#3A1F1F"></circle><circle cx="312" cy="288" r="7" fill="#3A1F1F"></circle><circle cx="168" cy="318" r="7" fill="#3A1F1F"></circle><circle cx="204" cy="318" r="7" fill="#3A1F1F"></circle><circle cx="240" cy="318" r="7" fill="#3A1F1F"></circle><circle cx="276" cy="318" r="7" fill="#3A1F1F"></circle><circle cx="312" cy="318" r="7" fill="#3A1F1F"></circle><circle cx="168" cy="348" r="7" fill="#3A1F1F"></circle><circle cx="204" cy="348" r="7" fill="#3A1F1F"></circle><circle cx="240" cy="348" r="7" fill="#3A1F1F"></circle><circle cx="276" cy="348" r="7" fill="#3A1F1F"></circle><circle cx="312" cy="348" r="7" fill="#3A1F1F"></circle><rect x="36" y="246" width="60" height="60" rx="8" fill="#1B1F26"></rect><text x="66" y="288" font-family="monospace" font-size="20" font-weight="500" fill="#E8E8E4" text-anchor="middle">A</text><rect x="384" y="246" width="60" height="60" rx="8" fill="#1B1F26"></rect><text x="414" y="288" font-family="monospace" font-size="20" font-weight="500" fill="#E8E8E4" text-anchor="middle">B</text><circle cx="432" cy="168" r="6" fill="#4A1E1E"></circle><text x="240" y="416" font-family="monospace" font-size="12" font-weight="500" fill="#7FC0AC" text-anchor="middle">so os cinco aneis vem liberados</text>`,
  },
  "expansao-microbura": {
    svg: `<rect width="480" height="216" rx="8" fill="#2A2E36" stroke="#101318" stroke-width="3"></rect><path d="M96 0h288v34H96z" fill="#0F5A46"></path><text x="240" y="24" font-family="monospace" font-size="12" font-weight="500" fill="#9FD8C6" text-anchor="middle">encaixa embaixo da MicroBURA</text><text x="240" y="88" font-family="monospace" font-size="20" font-weight="500" fill="#E8E8E4" text-anchor="middle">EXPANSAO DE PINOS</text><text x="240" y="116" font-family="monospace" font-size="13" font-weight="500" fill="#8A8F98" text-anchor="middle">libera P3 a P20 em pinos machos</text><rect x="24" y="132" width="432" height="14" rx="3" fill="#101318"></rect>`,
  },
  "protoboard": {
    svg: `<rect width="765" height="481" rx="8" fill="#E6E4DC" stroke="#B9B6AC" stroke-width="3" transform="translate(2 2)"></rect><rect x="0" y="252" width="768" height="24" fill="#D5D2C7"></rect><path d="M10 10h748" stroke="#E24B4A" stroke-width="3"></path><path d="M10 62h748" stroke="#3F5FB0" stroke-width="3"></path><path d="M10 394h748" stroke="#E24B4A" stroke-width="3" transform="translate(2 22)"></path><path d="M10 446h748" stroke="#3F5FB0" stroke-width="3" transform="translate(2 24)"></path><text x="24" y="106" font-family="monospace" font-size="12" font-weight="500" fill="#8A8780" text-anchor="middle">1</text><text x="24" y="412" font-family="monospace" font-size="12" font-weight="500" fill="#8A8780" text-anchor="middle">1</text><text x="144" y="106" font-family="monospace" font-size="12" font-weight="500" fill="#8A8780" text-anchor="middle">6</text><text x="144" y="412" font-family="monospace" font-size="12" font-weight="500" fill="#8A8780" text-anchor="middle">6</text><text x="264" y="106" font-family="monospace" font-size="12" font-weight="500" fill="#8A8780" text-anchor="middle">11</text><text x="264" y="412" font-family="monospace" font-size="12" font-weight="500" fill="#8A8780" text-anchor="middle">11</text><text x="384" y="106" font-family="monospace" font-size="12" font-weight="500" fill="#8A8780" text-anchor="middle">16</text><text x="384" y="412" font-family="monospace" font-size="12" font-weight="500" fill="#8A8780" text-anchor="middle">16</text><text x="504" y="106" font-family="monospace" font-size="12" font-weight="500" fill="#8A8780" text-anchor="middle">21</text><text x="504" y="412" font-family="monospace" font-size="12" font-weight="500" fill="#8A8780" text-anchor="middle">21</text><text x="624" y="106" font-family="monospace" font-size="12" font-weight="500" fill="#8A8780" text-anchor="middle">26</text><text x="624" y="412" font-family="monospace" font-size="12" font-weight="500" fill="#8A8780" text-anchor="middle">26</text><text x="708" y="269" font-family="monospace" font-size="12" font-weight="500" fill="#8A8780" text-anchor="end">400 pontos</text>`,
  },
  "bateria9v": {
    svg: `<rect x="12" y="0" width="144" height="186" rx="10" fill="#2A2E36" stroke="#101318" stroke-width="3"></rect><text x="84" y="82" font-family="monospace" font-size="38" font-weight="500" fill="#E9C542" text-anchor="middle">9V</text><text x="84" y="116" font-family="monospace" font-size="14" font-weight="500" fill="#8A8F98" text-anchor="middle">ALCALINA</text><rect x="21" y="153" width="141" height="20" rx="4" fill="#3A3F47" stroke="#1c2121" stroke-width="2" transform="translate(-7 11)"></rect>`,
  },
  "fonte-protoboard": {
    svg: `<rect width="288" height="144" rx="7" fill="#134E3A" stroke="#05060A" stroke-width="2"></rect><text x="144" y="52" font-family="monospace" font-size="15" font-weight="500" fill="#F2F2EE" text-anchor="middle">FONTE DE PROTOBOARD</text><text x="144" y="84" font-family="monospace" font-size="20" font-weight="500" fill="#5CE07A" text-anchor="middle">5 V</text><rect x="36" y="96" width="52" height="18" rx="3" fill="#a6a61c"></rect><circle cx="252" cy="40" r="6" fill="#4A1E1E"></circle>`,
  },
  "rele": {
    svg: `<rect width="264" height="192" rx="7" fill="#1B4E8A" stroke="#05060A" stroke-width="2"></rect><circle cx="18" cy="18" r="7" fill="#0A0C11" opacity=".5"></circle><circle cx="246" cy="18" r="7" fill="#0A0C11" opacity=".5"></circle><text x="132" y="92" font-family="monospace" font-size="16" font-weight="500" fill="#F2F2EE" text-anchor="middle">Modulo rele</text><circle cx="230" cy="122" r="6" fill="#4A1E1E"></circle>`,
  },
  "ponteh": {
    svg: `<rect width="432" height="336" rx="8" fill="#B23A32" stroke="#6E211B" stroke-width="3"></rect><rect x="24" y="8" width="42" height="86" rx="4" fill="#1B1F26" transform="translate(0 90)"></rect><rect x="168" y="8" width="134" height="33" rx="4" fill="#1B1F26" transform="translate(89 0)"></rect><rect x="312" y="8" width="40" height="84" rx="4" fill="#1B1F26" transform="translate(60 99)"></rect><rect x="150" y="96" width="132" height="120" rx="4" fill="#8A8F98" transform="translate(1 -18)"></rect><rect x="158" y="100" width="9" height="112" fill="#6C727B" transform="translate(0 -15)"></rect><rect x="179" y="100" width="9" height="112" fill="#6C727B" transform="translate(0 -17)"></rect><rect x="200" y="100" width="9" height="112" fill="#6C727B" transform="translate(1 -15)"></rect><rect x="221" y="100" width="9" height="112" fill="#6C727B" transform="translate(4 -15)"></rect><rect x="242" y="100" width="9" height="112" fill="#6C727B" transform="translate(5 -15)"></rect><rect x="263" y="100" width="9" height="112" fill="#6C727B" transform="translate(7 -16)"></rect><text x="216" y="240" font-family="monospace" font-size="12" font-weight="500" fill="#F0C9C5" text-anchor="middle" transform="translate(5 -166)">dissipador</text><rect x="40" y="120" width="86" height="51" rx="4" fill="#1B1F26" transform="translate(136 132)"></rect><text x="78" y="164" font-family="monospace" font-size="14" font-weight="500" fill="#E8E8E4" text-anchor="middle" transform="translate(140 119)">L298N</text><text x="348" y="140" font-family="monospace" font-size="20" font-weight="500" fill="#F2F2EE" text-anchor="middle" transform="translate(-122 81)">PONTE H</text><circle cx="348" cy="180" r="6" fill="#4A1E1E" transform="translate(-69 60)"></circle><rect x="120" y="290" width="192" height="16" rx="3" fill="#1B1F26" transform="translate(-108 -273)"></rect><text x="84" y="66" font-family="monospace" font-size="13" font-weight="500" fill="#F0C9C5" text-anchor="middle" transform="translate(-42 13)">motor A</text><text x="360" y="66" font-family="monospace" font-size="13" font-weight="500" fill="#F0C9C5" text-anchor="middle" transform="translate(30 18)">motor B</text>`,
  },
  "resistor": {
    svg: `<path d="M24 48h20M124 48h20" stroke="#B9BEC6" stroke-width="4"></path><rect x="44" y="22" width="86" height="31" rx="24" fill="#D8C79B" transform="translate(-2 10)"></rect><rect x="58" y="24" width="10" height="27" fill="#858480" transform="translate(3 10)"></rect><rect x="76" y="24" width="9" height="27" fill="#858580" transform="translate(-1 10)"></rect><rect x="94" y="24" width="9" height="27" fill="#858580" transform="translate(-5 10)"></rect><rect x="112" y="24" width="9" height="27" fill="#858580" transform="translate(-9 10)"></rect><rect x="65" y="41" width="44" height="21" rx="4" fill="#3A3F47" stroke="none" stroke-width="2" opacity="0.85" transform="translate(0 -4)"></rect><text x="84" y="10" font-family="monospace" font-size="18" font-weight="700" fill="#E9C542" text-anchor="middle" transform="translate(2 44)">220</text>`,
  },
  "diodo": {
    svg: `<path d="M24 48h20M100 48h20" stroke="#B9BEC6" stroke-width="4"></path><rect x="44" y="22" width="74" height="31" rx="24" fill="#2A1B14" transform="translate(-8 10)"></rect><rect x="86" y="26" width="8" height="29" fill="#E8E8E4" transform="translate(1 7)"></rect>`,
  },
  "transistor": {
    svg: `<path d="M12 8h84v60a42 42 0 01-84 0z" fill="#101318"></path><text x="54" y="52" font-family="monospace" font-size="13" font-weight="500" fill="#B9BEC6" text-anchor="middle">BC548</text><path d="M24 68v52M48 68v52M72 68v52" stroke="#B9BEC6" stroke-width="4" transform="translate(1 29)"></path>`,
  },
  "led": {
    svg: `<path d="M41 98 L24 117 C24 117 23 145 24 145" fill="none" stroke="#B9BEC6" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></path><path d="M60 98 L72 145" fill="none" stroke="#B9BEC6" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></path><path d="M20 58a28 28 0 0156 0v34H20z" fill="#E24B4A" opacity="0.78" transform="translate(0 4)"></path><rect x="14" y="88" width="68" height="12" rx="3" fill="#E24B4A" opacity=".92"></rect>`,
  },
  "ledrgb": {
    svg: `<path d="M120 151 L121 193" fill="none" stroke="#B9BEC6" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></path><path d="M120 151 L121 193" fill="none" stroke="#B9BEC6" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" transform="translate(-24 0)"></path><path d="M120 151 L121 193" fill="none" stroke="#B9BEC6" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" transform="translate(-50 1)"></path><path d="M120 151 L121 193" fill="none" stroke="#B9BEC6" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" transform="translate(-73 1)"></path><rect width="156" height="123" rx="7" fill="#12151C" stroke="#05060A" stroke-width="2" transform="translate(8 30)"></rect><path d="M44 84a40 40 0 0180 0v26H44z" fill="#F2F2EE" opacity="0.55"></path><rect x="38" y="106" width="92" height="12" rx="3" fill="#E8E8E4" opacity=".8"></rect><circle cx="66" cy="72" r="9" fill="#5A2A2A"></circle><circle cx="84" cy="62" r="9" fill="#255036"></circle><circle cx="102" cy="72" r="9" fill="#243B58"></circle><text x="84" y="146" font-family="monospace" font-size="11" font-weight="500" fill="#F2F2EE" text-anchor="middle" transform="translate(0 -15)">LED RGB</text><text x="84" y="164" font-family="monospace" font-size="11" font-weight="500" fill="#8A8F98" text-anchor="middle" transform="translate(1 -20)">catodo comum</text>`,
  },
  "buzzer": {
    svg: `<path d="M95 112 L96 168" fill="none" stroke="#B9BEC6" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" transform="translate(-48 0)"></path><path d="M95 112 L96 168" fill="none" stroke="#B9BEC6" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></path><circle cx="72" cy="66" r="60" fill="#0B0D11" stroke="#2A2E36" stroke-width="3"></circle><circle cx="72" cy="66" r="10" fill="#2A2E36"></circle><text x="46" y="118" font-family="monospace" font-size="18" font-weight="500" fill="#E8E8E4" text-anchor="middle">+</text>`,
  },
  "ldr": {
    svg: `<circle cx="36" cy="60" r="34" fill="#E9DFC0" stroke="#8A6B2A" stroke-width="3"></circle><path d="M14 60q11-16 22 0t22 0" fill="none" stroke="#3A2A10" stroke-width="4"></path><path d="M24 94v50M48 94v50" stroke="#B9BEC6" stroke-width="4"></path>`,
  },
  "irobstaculo": {
    svg: `<rect width="264" height="192" rx="7" fill="#1B4E8A" stroke="#05060A" stroke-width="2"></rect><g><g xmlns="http://www.w3.org/2000/svg"> <path d="M40 62a24 24 0 0148 0v24H40z" fill="#2A2E36"></path> <rect x="36" y="84" width="56" height="10" rx="3" fill="#2A2E36"></rect> <text x="64" y="116" font-family="monospace" font-size="11" font-weight="500" fill="#CFE4EE" text-anchor="middle">emissor</text> </g></g><g><g xmlns="http://www.w3.org/2000/svg"> <path d="M120 62a24 24 0 0148 0v24h-48z" fill="#7DA9E0" opacity="0.6"></path> <rect x="116" y="84" width="56" height="10" rx="3" fill="#7DA9E0" opacity="0.6"></rect> <text x="144" y="116" font-family="monospace" font-size="11" font-weight="500" fill="#CFE4EE" text-anchor="middle">receptor</text> </g></g><rect x="188" y="48" width="56" height="40" rx="4" fill="#1B1F26"></rect><text x="216" y="108" font-family="monospace" font-size="11" font-weight="500" fill="#CFE4EE" text-anchor="middle">ajuste</text><text x="132" y="148" font-family="monospace" font-size="15" font-weight="500" fill="#F2F2EE" text-anchor="middle">SENSOR IR</text><circle cx="228" cy="148" r="6" fill="#4A1E1E"></circle>`,
  },
  "servo180": {
    svg: `<rect x="24" y="60" width="192" height="132" rx="6" fill="#1E58A8" stroke="#0A2A56" stroke-width="3"></rect><rect x="6" y="92" width="228" height="26" fill="#1E58A8"></rect><circle cx="18" cy="105" r="7" fill="#8A8F98"></circle><path d="M14 105h8" stroke="#2A2E36" stroke-width="2"></path><circle cx="222" cy="105" r="7" fill="#8A8F98"></circle><path d="M218 105h8" stroke="#2A2E36" stroke-width="2"></path><text x="140" y="150" font-family="monospace" font-size="15" font-weight="500" fill="#CFE4EE" text-anchor="middle">SG90</text><path d="M216 96h48" stroke="#3A3F47" stroke-width="7" transform="translate(-1 51)"></path><path d="M216 120h48" stroke="#E24B4A" stroke-width="7" transform="translate(0 48)"></path><path d="M216 144h48" stroke="#E9C542" stroke-width="7" transform="translate(0 42)"></path><rect x="240" y="84" width="30" height="72" rx="4" fill="#2A2E36" transform="translate(20 40)"></rect><text x="140" y="150" font-family="monospace" font-size="15" font-weight="500" fill="#CFE4EE" text-anchor="middle" transform="translate(1 31)">180º</text><circle cx="57" cy="54" r="24" fill="#1e4cad" stroke="#05060A" stroke-width="2" transform="translate(12 7)"></circle><g transform="translate(-14 7)"><g xmlns="http://www.w3.org/2000/svg" transform="rotate(0 84 48)"><rect x="74" y="4" width="20" height="48" rx="3" fill="#F2F2EE" stroke="#8A8F98" stroke-width="2"></rect></g></g><rect x="61" y="7" width="57" height="20" rx="4" fill="#f7f7f8" stroke="#32343d" stroke-width="2" transform="translate(-37 1)"></rect>`,
  },
  "motordc": {
    svg: `<rect x="12" y="18" width="138" height="134" rx="66" fill="#9BA1AA" stroke="#565C66" stroke-width="3" transform="translate(27 5)"></rect><rect x="196" y="66" width="34" height="36" rx="4" fill="#6C727B" transform="translate(-25 3)"></rect><path d="M228 84h48" stroke="#C9CDD3" stroke-width="10" transform="translate(-24 3)"></path><circle cx="108" cy="84" r="38" fill="#6C727B"></circle><g><g xmlns="http://www.w3.org/2000/svg" transform="rotate(0 108 84)"><path d="M108 50v68M74 84h68" stroke="#D5D9DE" stroke-width="6"></path></g></g><text x="108" y="142" font-family="monospace" font-size="14" font-weight="500" fill="#31363E" text-anchor="middle">MOTOR DC</text><text x="288" y="130" font-family="monospace" font-size="15" font-weight="500" fill="#E24B4A" text-anchor="middle">+</text><text x="336" y="130" font-family="monospace" font-size="15" font-weight="500" fill="#8A8F98" text-anchor="middle">-</text><path d="M117 157 L116 171 L289 168 L288 148" fill="none" stroke="#ea2806" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"></path><path d="M99 156 L97 184 L337 181 L336 144" fill="none" stroke="#055ff0" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"></path>`,
  },
  "arubagpi": {
    svg: `<rect width="456" height="312" rx="10" fill="#1B6B3A" stroke="#0B3D20" stroke-width="3"></rect><rect x="60" y="30" width="228" height="60" rx="4" fill="#0B3D20"></rect><text x="174" y="66" font-family="monospace" font-size="13" font-weight="500" fill="#9FD8C6" text-anchor="middle" transform="translate(3 48)">barra de 40 pinos</text><rect x="150" y="120" width="150" height="110" rx="6" fill="#101318"></rect><text x="225" y="172" font-family="monospace" font-size="26" font-weight="500" fill="#E8E8E4" text-anchor="middle">Arubag Pi</text><text x="225" y="202" font-family="monospace" font-size="16" font-weight="500" fill="#8A8F98" text-anchor="middle">95x</text><rect x="330" y="120" width="110" height="46" rx="4" fill="#B9BEC6"></rect><text x="385" y="150" font-family="monospace" font-size="14" font-weight="500" fill="#31363E" text-anchor="middle">USB</text><rect x="330" y="180" width="110" height="46" rx="4" fill="#2A2E36"></rect><text x="385" y="210" font-family="monospace" font-size="13" font-weight="500" fill="#B9BEC6" text-anchor="middle">HDMI</text><rect x="24" y="132" width="72" height="90" rx="6" fill="#2A2E36"></rect><text x="60" y="184" font-family="monospace" font-size="15" font-weight="500" fill="#B9BEC6" text-anchor="middle">SD</text><text x="225" y="258" font-family="monospace" font-size="13" font-weight="500" fill="#9FD8C6" text-anchor="middle">logica de 3,3 V</text><circle cx="420" cy="60" r="6" fill="#4A1E1E"></circle>`,
  },
  "fenolite": {
    svg: `<rect width="457" height="297" rx="6" fill="#C9A227" stroke="#8A6B14" stroke-width="3"></rect><rect x="6" y="6" width="444" height="276" rx="4" fill="#B8912A" opacity=".55"></rect><text x="228" y="278" font-family="monospace" font-size="12" font-weight="500" fill="#5A4408" text-anchor="middle" transform="translate(3 10)">cada ilha e isolada — so a solda liga</text>`,
  },
  "indutor": {
    svg: `<circle cx="78" cy="34" r="35" fill="#673e0e" stroke="none" stroke-width="2" transform="translate(4 2)"></circle><path d="M48 96 L49 35 C49 35 51 11 80 3 C109 -5 113 39 111 45 C109 51 96 69 80 65 C64 61 56 50 56 46 C56 42 52 20 69 13 C86 6 99 17 100 27 C101 37 104 44 98 49 C92 54 82 59 75 53 C68 47 62 41 65 33 C68 25 72 18 79 18 C86 18 90 22 91 28 C92 34 93 42 88 43 C83 44 72 41 74 36 C76 31 73 28 80 27 C87 26 85 33 84 34" fill="none" stroke="#894b00" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path><path d="M120 96 C120 96 119 33 114 26 C109 19 96 -7 69 7" fill="none" stroke="#B9BEC6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path>`,
  },
  "zener": {
    svg: `<rect x="19" y="38" width="99" height="30" rx="4" fill="#5d2228" stroke="#b9bdc7" stroke-width="2" transform="translate(4 -6)"></rect><path d="M108 34 L108 57" fill="none" stroke="#B9BEC6" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" transform="translate(-1 1)"></path><path d="M23 48 L0 49" fill="none" stroke="#B9BEC6" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" transform="translate(-2 0)"></path><path d="M123 47 L143 48" fill="none" stroke="#B9BEC6" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path>`,
  },
  "laser": {
    svg: `<rect width="216" height="168" rx="7" fill="#8A2C28" stroke="#05060A" stroke-width="2" transform="translate(1 -1)"></rect><circle cx="18" cy="18" r="7" fill="#0A0C11" opacity=".5"></circle><circle cx="198" cy="18" r="7" fill="#0A0C11" opacity=".5"></circle><text x="108" y="80" font-family="monospace" font-size="16" font-weight="500" fill="#F2F2EE" text-anchor="middle" transform="translate(0 25)">Diodo laser</text><circle cx="182" cy="110" r="6" fill="#4A1E1E"></circle><circle cx="89" cy="25" r="21" fill="#603942" stroke="#05060A" stroke-width="2" transform="translate(20 42)"></circle><rect x="88" y="26" width="42" height="46" rx="4" fill="#653242" stroke="#05060A" stroke-width="2"></rect><circle cx="89" cy="25" r="22" fill="#603942" stroke="#05060A" stroke-width="2" transform="translate(20 1)"></circle><circle cx="109" cy="23" r="6" fill="#4A1E1E" stroke="#05060A" stroke-width="1"></circle>`,
    luzes: [{"x":109,"y":23}],
  },
  "lcd16": {
    svg: `<rect width="384" height="216" rx="7" fill="#14472F" stroke="#05060A" stroke-width="2"></rect><circle cx="18" cy="18" r="7" fill="#0A0C11" opacity=".5"></circle><circle cx="366" cy="18" r="7" fill="#0A0C11" opacity=".5"></circle><text x="192" y="104" font-family="monospace" font-size="16" font-weight="500" fill="#F2F2EE" text-anchor="middle" transform="translate(-1 -82)">Display LCD 16 pinos</text><circle cx="350" cy="134" r="6" fill="#4A1E1E"></circle><rect x="46" y="51" width="291" height="108" rx="4" fill="#1e2919" stroke="none" stroke-width="2" transform="translate(-12 -10)"></rect>`,
  },
  "tft": {
    svg: `<rect width="432" height="264" rx="7" fill="#1B1F26" stroke="#05060A" stroke-width="2"></rect><circle cx="18" cy="18" r="7" fill="#0A0C11" opacity=".5"></circle><circle cx="414" cy="18" r="7" fill="#0A0C11" opacity=".5"></circle><text x="216" y="128" font-family="monospace" font-size="16" font-weight="500" fill="#F2F2EE" text-anchor="middle" transform="translate(-6 -100)">Tela TFT touch 2.4</text><circle cx="398" cy="158" r="6" fill="#4A1E1E"></circle><rect x="48" y="57" width="323" height="137" rx="4" fill="#3A3F47" stroke="#05060A" stroke-width="2"></rect>`,
  },
  "epaper": {
    svg: `<rect width="288" height="240" rx="7" fill="#E6E4DC" stroke="#05060A" stroke-width="2"></rect><circle cx="18" cy="18" r="7" fill="#0A0C11" opacity=".5"></circle><circle cx="270" cy="18" r="7" fill="#0A0C11" opacity=".5"></circle><text x="144" y="116" font-family="monospace" font-size="16" font-weight="500" fill="#F2F2EE" text-anchor="middle" transform="translate(-2 -90)">Display e-paper</text><circle cx="254" cy="146" r="6" fill="#4A1E1E"></circle><rect x="34" y="46" width="198" height="130" rx="4" fill="#979ba1" stroke="#05060A" stroke-width="2"></rect>`,
  },
  "buzzer-passivo": {
    svg: `<path d="M97 112 L96 170" fill="none" stroke="#B9BEC6" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" transform="translate(-48 0)"></path><path d="M97 112 L96 170" fill="none" stroke="#B9BEC6" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></path><circle cx="72" cy="66" r="60" fill="#0B0D11" stroke="#2A2E36" stroke-width="3"></circle><circle cx="72" cy="66" r="10" fill="#2A2E36"></circle><text x="46" y="118" font-family="monospace" font-size="18" font-weight="500" fill="#E8E8E4" text-anchor="middle">+</text><text x="46" y="118" font-family="monospace" font-size="18" font-weight="500" fill="#E8E8E4" text-anchor="middle" transform="translate(51 -6)">P</text>`,
  },
  "altofalante": {
    svg: `<circle cx="132" cy="110" r="104" fill="#3A3F47" stroke="#1B1F26" stroke-width="4"></circle><circle cx="132" cy="110" r="72" fill="#2A2E36"></circle><circle cx="132" cy="110" r="30" fill="#565C66"></circle><circle cx="132" cy="110" r="12" fill="#8A8F98"></circle><circle cx="222" cy="110" r="7" fill="#1B1F26"></circle><circle cx="132" cy="200" r="7" fill="#1B1F26"></circle><circle cx="42" cy="110" r="7" fill="#1B1F26"></circle><circle cx="132" cy="20" r="7" fill="#1B1F26"></circle><text x="132" y="210" font-family="monospace" font-size="14" font-weight="500" fill="#B9BEC6" text-anchor="middle" transform="translate(3 -50)">8 &amp;#937;</text><path d="M198 190 L215 204 C215 204 217 241 217 240" fill="none" stroke="#ec092b" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"></path><path d="M214 175 L263 200 L264 240" fill="none" stroke="#B9BEC6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path>`,
  },
  "ky037": {
    svg: `<rect width="240" height="192" rx="7" fill="#c72344" stroke="#05060A" stroke-width="2"></rect><circle cx="18" cy="18" r="7" fill="#0A0C11" opacity=".5"></circle><circle cx="222" cy="18" r="7" fill="#0A0C11" opacity=".5"></circle><text x="120" y="92" font-family="monospace" font-size="16" font-weight="500" fill="#F2F2EE" text-anchor="middle" transform="translate(-2 16)">Sensor de som KY-037</text><circle cx="206" cy="122" r="6" fill="#4A1E1E"></circle><circle cx="109" cy="26" r="24" fill="#3A3F47" stroke="#05060A" stroke-width="2" transform="translate(12 22)"></circle><circle cx="109" cy="26" r="24" fill="#3A3F47" stroke="#05060A" stroke-width="2" transform="translate(12 15)"></circle>`,
  },
  "botao-arcade": {
    svg: `<rect x="104" y="201" width="95" height="51" rx="4" fill="#3A3F47" stroke="#05060A" stroke-width="2" transform="translate(-28 -13)"></rect><circle cx="120" cy="108" r="96" fill="#2A2E36"></circle><circle cx="120" cy="104" r="84" fill="#B23A32" stroke="#6E211B" stroke-width="4"></circle><circle cx="120" cy="104" r="66" fill="#D14A40"></circle><path d="M78 78a48 48 0 0184 0" fill="#F2F2EE" opacity=".22"></path><text x="120" y="214" font-family="monospace" font-size="13" font-weight="500" fill="#8A8F98" text-anchor="middle" transform="translate(-1 -205)">aperte</text><rect x="171" y="206" width="36" height="21" rx="4" fill="#7b808a" stroke="#05060A" stroke-width="2" transform="translate(-1 -4)"></rect><rect x="171" y="206" width="20" height="25" rx="4" fill="#7b808a" stroke="#05060A" stroke-width="2" transform="translate(-58 32)"></rect><rect x="171" y="206" width="38" height="17" rx="4" fill="#7b808a" stroke="#05060A" stroke-width="2" transform="translate(-58 49)"></rect>`,
  },
  "chave3": {
    svg: `<path d="M121 100 L121 144" fill="none" stroke="#B9BEC6" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" transform="translate(-24 4)"></path><path d="M121 100 L121 144" fill="none" stroke="#B9BEC6" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" transform="translate(-49 3)"></path><path d="M121 100 L121 144" fill="none" stroke="#B9BEC6" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" transform="translate(-1 -1)"></path><rect x="24" y="24" width="142" height="83" rx="8" fill="#1B1F26" stroke="#05060A" stroke-width="2" transform="translate(-9 2)"></rect><rect x="40" y="40" width="88" height="52" rx="6" fill="#31363E"></rect><rect x="46" y="46" width="38" height="40" rx="5" fill="#C9CDD3"></rect><text x="84" y="112" font-family="monospace" font-size="12" font-weight="500" fill="#8A8F98" text-anchor="middle" transform="translate(1 -75)">posicao 1</text>`,
  },
  "joystick": {
    svg: `<rect width="288" height="288" rx="7" fill="#1B1F26" stroke="#05060A" stroke-width="2"></rect><circle cx="18" cy="18" r="7" fill="#0A0C11" opacity=".5"></circle><circle cx="270" cy="18" r="7" fill="#0A0C11" opacity=".5"></circle><text x="144" y="140" font-family="monospace" font-size="16" font-weight="500" fill="#F2F2EE" text-anchor="middle" transform="translate(-34 84)">Joystick analogico</text><circle cx="254" cy="170" r="6" fill="#4A1E1E"></circle>`,
  },
  "ir-linha": {
    svg: `<rect width="240" height="192" rx="7" fill="#0b376a" stroke="#05060A" stroke-width="2"></rect><circle cx="18" cy="18" r="7" fill="#0A0C11" opacity=".5"></circle><circle cx="222" cy="18" r="7" fill="#0A0C11" opacity=".5"></circle><text x="120" y="92" font-family="monospace" font-size="16" font-weight="500" fill="#F2F2EE" text-anchor="middle" transform="translate(-1 13)">Sensor seguidor de linha</text><circle cx="206" cy="122" r="6" fill="#4A1E1E"></circle><rect x="61" y="18" width="114" height="42" rx="4" fill="#1e2229" stroke="#05060A" stroke-width="2"></rect><circle cx="85" cy="36" r="14" fill="#0f0f10" stroke="#05060A" stroke-width="2" transform="translate(2 3)"></circle><circle cx="85" cy="36" r="14" fill="#0f0f10" stroke="#05060A" stroke-width="2" transform="translate(65 3)"></circle>`,
  },
  "tcs3200": {
    svg: `<rect width="288" height="216" rx="7" fill="#292a2e" stroke="#05060A" stroke-width="2"></rect><circle cx="18" cy="18" r="7" fill="#0A0C11" opacity=".5"></circle><circle cx="270" cy="18" r="7" fill="#0A0C11" opacity=".5"></circle><text x="144" y="104" font-family="monospace" font-size="10" font-weight="500" fill="#F2F2EE" text-anchor="middle" transform="translate(-5 -85)">Sensor de cor TCS3200</text><circle cx="254" cy="134" r="6" fill="#4A1E1E" transform="translate(13 57)"></circle><circle cx="42" cy="40" r="24" fill="#9aa5b7" stroke="#05060A" stroke-width="2" transform="translate(-6 9)"></circle><path d="M38 36 C38 36 57 36 49 54" fill="none" stroke="#B9BEC6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" transform="translate(-1 -2)"></path><circle cx="42" cy="40" r="24" fill="#9aa5b7" stroke="#05060A" stroke-width="2" transform="translate(201 10)"></circle><circle cx="42" cy="40" r="24" fill="#9aa5b7" stroke="#05060A" stroke-width="2" transform="translate(-6 96)"></circle><circle cx="42" cy="40" r="24" fill="#9aa5b7" stroke="#05060A" stroke-width="2" transform="translate(201 98)"></circle><path d="M38 36 C38 36 57 36 49 54" fill="none" stroke="#B9BEC6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" transform="translate(208 0)"></path><path d="M38 36 C38 36 57 36 49 54" fill="none" stroke="#B9BEC6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" transform="translate(209 88)"></path><path d="M38 36 C38 36 57 36 49 54" fill="none" stroke="#B9BEC6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" transform="translate(1 86)"></path>`,
  },
  "pir": {
    svg: `<rect width="240" height="240" rx="7" fill="#1B4E8A" stroke="#05060A" stroke-width="2"></rect><path d="M42 128a78 78 0 01156 0z" fill="#F2F2EE" opacity=".92"></path><path d="M42 128a78 78 0 01156 0" fill="none" stroke="#B9BEC6" stroke-width="3"></path><path d="M68 128v-41" stroke="#C9CDD3" stroke-width="2"></path><path d="M94 128v-56" stroke="#C9CDD3" stroke-width="2"></path><path d="M120 128v-70" stroke="#C9CDD3" stroke-width="2"></path><path d="M146 128v-56" stroke="#C9CDD3" stroke-width="2"></path><path d="M172 128v-41" stroke="#C9CDD3" stroke-width="2"></path><text x="120" y="168" font-family="monospace" font-size="15" font-weight="500" fill="#CFE4EE" text-anchor="middle">PIR</text><circle cx="200" cy="168" r="6" fill="#4A1E1E"></circle>`,
  },
  "dht": {
    svg: `<rect width="240" height="216" rx="7" fill="#1B4E8A" stroke="#05060A" stroke-width="2"></rect><circle cx="18" cy="18" r="7" fill="#0A0C11" opacity=".5"></circle><circle cx="222" cy="18" r="7" fill="#0A0C11" opacity=".5"></circle><text x="120" y="104" font-family="monospace" font-size="10" font-weight="500" fill="#F2F2EE" text-anchor="middle" transform="translate(-21 44)">Sensor de temperatura DHT11</text><circle cx="206" cy="134" r="6" fill="#4A1E1E"></circle><rect x="79" y="18" width="82" height="97" rx="4" fill="#20b9df" stroke="#05060A" stroke-width="2" transform="translate(1 5)"></rect><rect x="90" y="30" width="14" height="16" rx="4" fill="#05718a" stroke="#05060A" stroke-width="2" transform="translate(-4 2)"></rect><rect x="90" y="30" width="14" height="16" rx="4" fill="#05718a" stroke="#05060A" stroke-width="2" transform="translate(15 2)"></rect><rect x="90" y="30" width="14" height="16" rx="4" fill="#05718a" stroke="#05060A" stroke-width="2" transform="translate(34 2)"></rect><rect x="90" y="30" width="14" height="16" rx="4" fill="#05718a" stroke="#05060A" stroke-width="2" transform="translate(53 2)"></rect><rect x="90" y="30" width="14" height="16" rx="4" fill="#05718a" stroke="#05060A" stroke-width="2" transform="translate(-4 23)"></rect><rect x="90" y="30" width="14" height="16" rx="4" fill="#05718a" stroke="#05060A" stroke-width="2" transform="translate(-4 44)"></rect><rect x="90" y="30" width="14" height="16" rx="4" fill="#05718a" stroke="#05060A" stroke-width="2" transform="translate(-4 65)"></rect><rect x="90" y="30" width="14" height="16" rx="4" fill="#05718a" stroke="#05060A" stroke-width="2" transform="translate(15 23)"></rect><rect x="90" y="30" width="14" height="16" rx="4" fill="#05718a" stroke="#05060A" stroke-width="2" transform="translate(15 44)"></rect><rect x="90" y="30" width="14" height="16" rx="4" fill="#05718a" stroke="#05060A" stroke-width="2" transform="translate(15 65)"></rect><rect x="90" y="30" width="14" height="16" rx="4" fill="#05718a" stroke="#05060A" stroke-width="2" transform="translate(34 23)"></rect><rect x="90" y="30" width="14" height="16" rx="4" fill="#05718a" stroke="#05060A" stroke-width="2" transform="translate(34 45)"></rect><rect x="90" y="30" width="14" height="16" rx="4" fill="#05718a" stroke="#05060A" stroke-width="2" transform="translate(34 65)"></rect><rect x="90" y="30" width="14" height="16" rx="4" fill="#05718a" stroke="#05060A" stroke-width="2" transform="translate(53 23)"></rect><rect x="90" y="30" width="14" height="16" rx="4" fill="#05718a" stroke="#05060A" stroke-width="2" transform="translate(53 45)"></rect><rect x="90" y="30" width="14" height="16" rx="4" fill="#05718a" stroke="#05060A" stroke-width="2" transform="translate(53 65)"></rect>`,
  },
  "umidade-solo": {
    svg: `<rect width="238" height="216" rx="7" fill="#1B4E8A" stroke="#05060A" stroke-width="2" transform="translate(1 0)"></rect><circle cx="18" cy="18" r="7" fill="#0A0C11" opacity=".5"></circle><circle cx="222" cy="18" r="7" fill="#0A0C11" opacity=".5"></circle><text x="120" y="104" font-family="monospace" font-size="14" font-weight="500" fill="#F2F2EE" text-anchor="middle" transform="translate(-1 50)">Sensor de umidade do solo</text><circle cx="206" cy="134" r="6" fill="#4A1E1E" transform="translate(3 -11)"></circle><rect x="30" y="60" width="55" height="52" rx="4" fill="#0648b2" stroke="#05060A" stroke-width="2"></rect><circle cx="54" cy="94" r="17" fill="#214073" stroke="#05060A" stroke-width="2" transform="translate(3 -9)"></circle><path d="M50 86 L66 86" fill="none" stroke="#B9BEC6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" transform="translate(-1 0)"></path><path d="M57 75 L57 94" fill="none" stroke="#B9BEC6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 2)"></path><rect x="126" y="71" width="70" height="37" rx="4" fill="#3A3F47" stroke="#05060A" stroke-width="2" transform="translate(-14 -2)"></rect><path d="M125 59 L125 68" fill="none" stroke="#0a0a0a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path><path d="M125 59 L125 68" fill="none" stroke="#0a0a0a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" transform="translate(20 0)"></path><path d="M125 59 L125 68" fill="none" stroke="#0a0a0a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" transform="translate(42 0)"></path><path d="M125 59 L125 68" fill="none" stroke="#0a0a0a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 48)"></path><path d="M125 59 L125 68" fill="none" stroke="#0a0a0a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" transform="translate(22 48)"></path><path d="M125 59 L125 68" fill="none" stroke="#0a0a0a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" transform="translate(45 49)"></path>`,
  },
  "mpu6050": {
    svg: `<rect width="288" height="216" rx="7" fill="#115cdf" stroke="#05060A" stroke-width="2" transform="translate(2 1)"></rect><circle cx="18" cy="18" r="7" fill="#0A0C11" opacity=".5"></circle><circle cx="270" cy="18" r="7" fill="#0A0C11" opacity=".5"></circle><text x="144" y="104" font-family="monospace" font-size="16" font-weight="500" fill="#F2F2EE" text-anchor="middle" transform="translate(-17 39)">Acelerometro MPU-6050</text><circle cx="254" cy="134" r="6" fill="#4A1E1E"></circle><rect x="115" y="68" width="72" height="48" rx="4" fill="#3A3F47" stroke="#05060A" stroke-width="2" transform="translate(-9 -19)"></rect><path d="M122 48 L122 33" fill="none" stroke="#030303" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path><path d="M122 48 L122 33" fill="none" stroke="#030303" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" transform="translate(21 0)"></path><path d="M122 48 L122 33" fill="none" stroke="#030303" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" transform="translate(42 0)"></path><path d="M122 48 L122 33" fill="none" stroke="#030303" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" transform="translate(-1 65)"></path><path d="M122 48 L122 33" fill="none" stroke="#030303" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" transform="translate(23 65)"></path><path d="M122 48 L122 33" fill="none" stroke="#030303" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" transform="translate(45 66)"></path>`,
  },
  "motordc-reducao": {
    svg: `<rect x="12" y="18" width="180" height="132" rx="66" fill="#9BA1AA" stroke="#565C66" stroke-width="3" transform="translate(20 -1)"></rect><rect x="196" y="66" width="27" height="36" rx="4" fill="#6C727B" transform="translate(8 1)"></rect><path d="M228 84h48" stroke="#C9CDD3" stroke-width="10"></path><circle cx="108" cy="84" r="38" fill="#6C727B" transform="translate(23 -4)"></circle><g transform="translate(25 -3)"><g xmlns="http://www.w3.org/2000/svg" transform="rotate(0 108 84)"><path d="M108 50v68M74 84h68" stroke="#D5D9DE" stroke-width="6"></path></g></g><text x="108" y="142" font-family="monospace" font-size="14" font-weight="500" fill="#31363E" text-anchor="middle" transform="translate(25 -4)">MOTOR DC</text><text x="288" y="130" font-family="monospace" font-size="15" font-weight="500" fill="#E24B4A" text-anchor="middle">+</text><text x="336" y="130" font-family="monospace" font-size="15" font-weight="500" fill="#8A8F98" text-anchor="middle">-</text><rect x="93" y="11" width="77" height="141" rx="4" fill="#e8e817" stroke="#536312" stroke-width="3.5" transform="translate(-81 1)"></rect><path d="M73 154 L73 168 L288 165 L288 148" fill="none" stroke="#e52706" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"></path><path d="M55 155 L56 192 L337 192 L337 146" fill="none" stroke="#B9BEC6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path>`,
  },
  "motor-drone": {
    svg: `<rect x="12" y="18" width="152" height="139" rx="66" fill="#918383" stroke="#565C66" stroke-width="3" transform="translate(-1 -15)"></rect><rect x="196" y="66" width="14" height="56" rx="4" fill="#6C727B" transform="translate(-42 -17)"></rect><path d="M228 84h48" stroke="#C9CDD3" stroke-width="10" transform="translate(-61 -6)"></path><circle cx="108" cy="84" r="38" fill="#6C727B" transform="translate(-24 -22)"></circle><g transform="translate(-23 -21)"><g xmlns="http://www.w3.org/2000/svg" transform="rotate(0 108 84)"><path d="M108 50v68M74 84h68" stroke="#D5D9DE" stroke-width="6"></path></g></g><text x="108" y="142" font-family="monospace" font-size="14" font-weight="500" fill="#31363E" text-anchor="middle" transform="translate(-19 -24)">MOTOR DC</text><text x="288" y="130" font-family="monospace" font-size="15" font-weight="500" fill="#E24B4A" text-anchor="middle" transform="translate(-96 1)">+</text><text x="336" y="130" font-family="monospace" font-size="15" font-weight="500" fill="#8A8F98" text-anchor="middle" transform="translate(-120 -1)">-</text><path d="M100 143 L100 159 L192 161 L192 146" fill="none" stroke="#e02606" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"></path><path d="M82 142 L83 174 L216 173 L217 147" fill="none" stroke="#B9BEC6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path>`,
  },
  "bomba": {
    svg: `<rect x="48" y="72" width="144" height="132" rx="14" fill="#1B4E8A" stroke="#0A2A56" stroke-width="3"></rect><rect x="96" y="12" width="48" height="66" rx="8" fill="#2A6BB0"></rect><path d="M120 12v-6" stroke="#8A8F98" stroke-width="6"></path><circle cx="120" cy="138" r="42" fill="#2A6BB0"></circle><g><g xmlns="http://www.w3.org/2000/svg" transform="rotate(0 120 138)"><path d="M120 108v60M90 138h60" stroke="#CFE4EE" stroke-width="6"></path></g></g><text x="120" y="196" font-family="monospace" font-size="13" font-weight="500" fill="#CFE4EE" text-anchor="middle">submersa</text><path d="M139 204 L139 228 L241 226 L241 196" fill="none" stroke="#ff2600" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"></path><path d="M120 204 L120 243 L265 243 L264 195" fill="none" stroke="#B9BEC6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path>`,
  },
  "vibracao": {
    svg: `<rect width="240" height="168" rx="7" fill="#1B1F26" stroke="#05060A" stroke-width="2"></rect><circle cx="18" cy="18" r="7" fill="#0A0C11" opacity=".5"></circle><circle cx="222" cy="18" r="7" fill="#0A0C11" opacity=".5"></circle><text x="120" y="80" font-family="monospace" font-size="16" font-weight="500" fill="#F2F2EE" text-anchor="middle" transform="translate(-23 26)">Motor de vibracao</text><circle cx="206" cy="110" r="6" fill="#4A1E1E"></circle><circle cx="91" cy="15" r="36" fill="#3A3F47" stroke="#05060A" stroke-width="2" transform="translate(35 28)"></circle><circle cx="122" cy="39" r="24" fill="#3A3F47" stroke="#05060A" stroke-width="2" transform="translate(4 4)"></circle>`,
  },
  "servo360": {
    svg: `<rect x="24" y="60" width="192" height="132" rx="6" fill="#1E58A8" stroke="#0A2A56" stroke-width="3"></rect><rect x="6" y="92" width="228" height="26" fill="#1E58A8"></rect><circle cx="18" cy="105" r="7" fill="#8A8F98"></circle><path d="M14 105h8" stroke="#2A2E36" stroke-width="2"></path><circle cx="222" cy="105" r="7" fill="#8A8F98"></circle><path d="M218 105h8" stroke="#2A2E36" stroke-width="2"></path><text x="140" y="150" font-family="monospace" font-size="15" font-weight="500" fill="#CFE4EE" text-anchor="middle">SG90</text><path d="M216 96h48" stroke="#3A3F47" stroke-width="7" transform="translate(0 52)"></path><path d="M216 120h48" stroke="#E24B4A" stroke-width="7" transform="translate(0 47)"></path><path d="M216 144h48" stroke="#E9C542" stroke-width="7" transform="translate(0 41)"></path><rect x="240" y="84" width="30" height="72" rx="4" fill="#2A2E36" transform="translate(17 43)"></rect><text x="140" y="150" font-family="monospace" font-size="15" font-weight="500" fill="#CFE4EE" text-anchor="middle" transform="translate(1 32)">360º</text><circle cx="67" cy="51" r="24" fill="#1352a4" stroke="#192e80" stroke-width="2" transform="translate(9 9)"></circle><g transform="translate(-8 6)"><g xmlns="http://www.w3.org/2000/svg" transform="rotate(0 84 48)"><rect x="74" y="4" width="20" height="48" rx="3" fill="#F2F2EE" stroke="#8A8F98" stroke-width="2"></rect></g></g><rect x="55" y="12" width="97" height="17" rx="4" fill="#fafafa" stroke="#05060A" stroke-width="2" transform="translate(-27 -2)"></rect>`,
  },
  "servo-torque180": {
    svg: `<rect x="24" y="60" width="209" height="151" rx="6" fill="#202228" stroke="#303030" stroke-width="3" transform="translate(-1 0)"></rect><rect x="6" y="92" width="250" height="31" fill="#202128" transform="translate(-3 -2)"></rect><circle cx="18" cy="105" r="7" fill="#8A8F98" transform="translate(-6 0)"></circle><path d="M14 105h8" stroke="#2A2E36" stroke-width="2" transform="translate(-5 1)"></path><circle cx="222" cy="105" r="7" fill="#8A8F98" transform="translate(18 1)"></circle><path d="M218 105h8" stroke="#2A2E36" stroke-width="2" transform="translate(18 1)"></path><text x="140" y="150" font-family="monospace" font-size="15" font-weight="500" fill="#CFE4EE" text-anchor="middle">MG996R</text><path d="M216 96h48" stroke="#3A3F47" stroke-width="7" transform="translate(17 71)"></path><path d="M216 120h48" stroke="#E24B4A" stroke-width="7" transform="translate(17 66)"></path><path d="M216 144h48" stroke="#E9C542" stroke-width="7" transform="translate(16 61)"></path><rect x="240" y="84" width="26" height="58" rx="4" fill="#2A2E36" transform="translate(20 72)"></rect><circle cx="85" cy="62" r="28" fill="#202128" stroke="#2b2b2c" stroke-width="2"></circle><g><g xmlns="http://www.w3.org/2000/svg" transform="rotate(0 84 48)"><rect x="74" y="4" width="20" height="48" rx="3" fill="#F2F2EE" stroke="#8A8F98" stroke-width="2"></rect></g></g><rect x="50" y="17" width="91" height="23" rx="4" fill="#f7f7f7" stroke="#3c3c3e" stroke-width="2" transform="translate(-46 -13)"></rect><text x="140" y="150" font-family="monospace" font-size="15" font-weight="500" fill="#CFE4EE" text-anchor="middle" transform="translate(0 44)">MG996R</text>`,
  },
  "servo-torque360": {
    svg: `<rect x="24" y="60" width="211" height="149" rx="6" fill="#27292b" stroke="#212121" stroke-width="3"></rect><rect x="6" y="92" width="245" height="25" fill="#27292b" transform="translate(-1 0)"></rect><circle cx="18" cy="105" r="7" fill="#8A8F98"></circle><path d="M14 105h8" stroke="#2A2E36" stroke-width="2"></path><circle cx="222" cy="105" r="7" fill="#8A8F98" transform="translate(17 0)"></circle><path d="M218 105h8" stroke="#2A2E36" stroke-width="2" transform="translate(17 0)"></path><text x="140" y="150" font-family="monospace" font-size="15" font-weight="500" fill="#CFE4EE" text-anchor="middle">MG996R</text><path d="M216 96h48" stroke="#3A3F47" stroke-width="7" transform="translate(20 65)"></path><path d="M216 120h48" stroke="#E24B4A" stroke-width="7" transform="translate(20 63)"></path><path d="M216 144h48" stroke="#E9C542" stroke-width="7" transform="translate(20 60)"></path><rect x="240" y="84" width="25" height="69" rx="4" fill="#2A2E36" transform="translate(22 61)"></rect><text x="140" y="150" font-family="monospace" font-size="15" font-weight="500" fill="#CFE4EE" text-anchor="middle" transform="translate(1 41)">360º</text><circle cx="80" cy="75" r="28" fill="#27292b" stroke="#1f1f23" stroke-width="2" transform="translate(3 -10)"></circle><g><g xmlns="http://www.w3.org/2000/svg" transform="rotate(0 84 48)"><rect x="74" y="4" width="20" height="48" rx="3" fill="#F2F2EE" stroke="#8A8F98" stroke-width="2"></rect></g></g><rect x="19" y="8" width="132" height="22" rx="4" fill="#f4f5f5" stroke="#05060A" stroke-width="2" transform="translate(0 -6)"></rect>`,
  },
  "uln2003": {
    svg: `<rect width="240" height="240" rx="7" fill="#294527" stroke="#05060A" stroke-width="2" transform="translate(1 0)"></rect><circle cx="18" cy="18" r="7" fill="#0A0C11" opacity=".5"></circle><circle cx="222" cy="18" r="7" fill="#0A0C11" opacity=".5"></circle><text x="120" y="116" font-family="monospace" font-size="12" font-weight="500" fill="#F2F2EE" text-anchor="middle" transform="translate(2 57)">Driver ULN2003 + motor de passo</text><circle cx="206" cy="146" r="6" fill="#4A1E1E"></circle><rect x="78" y="32" width="71" height="111" rx="4" fill="#252a32" stroke="#05060A" stroke-width="2" transform="translate(8 -4)"></rect><path d="M158 44 L175 44" fill="none" stroke="#0a0a0a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" transform="translate(2 0)"></path><path d="M158 44 L175 44" fill="none" stroke="#0a0a0a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" transform="translate(1 34)"></path><path d="M158 44 L175 44" fill="none" stroke="#0a0a0a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" transform="translate(1 71)"></path><path d="M158 44 L175 44" fill="none" stroke="#0a0a0a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" transform="translate(-91 -1)"></path><path d="M158 44 L175 44" fill="none" stroke="#0a0a0a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" transform="translate(-91 37)"></path><path d="M158 44 L175 44" fill="none" stroke="#0a0a0a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" transform="translate(-91 72)"></path>`,
  },
  "expansao-servo": {
    svg: `<rect width="456" height="264" rx="7" fill="#134E3A" stroke="#05060A" stroke-width="2"></rect><circle cx="18" cy="18" r="7" fill="#0A0C11" opacity=".5"></circle><circle cx="438" cy="18" r="7" fill="#0A0C11" opacity=".5"></circle><text x="228" y="128" font-family="monospace" font-size="16" font-weight="500" fill="#F2F2EE" text-anchor="middle">Expansao de 16 servos</text><circle cx="422" cy="158" r="6" fill="#4A1E1E"></circle>`,
  },
  "ams1117": {
    svg: `<rect width="240" height="168" rx="7" fill="#1B1F26" stroke="#05060A" stroke-width="2"></rect><circle cx="18" cy="18" r="7" fill="#0A0C11" opacity=".5"></circle><circle cx="222" cy="18" r="7" fill="#0A0C11" opacity=".5"></circle><text x="120" y="80" font-family="monospace" font-size="16" font-weight="500" fill="#F2F2EE" text-anchor="middle">Regulador 5V AMS1117</text><circle cx="160" cy="94" r="6" fill="#4A1E1E" stroke="#05060A" stroke-width="1"></circle>`,
    luzes: [{"x":160,"y":94}],
  },
  "stepdown": {
    svg: `<rect width="288" height="192" rx="7" fill="#13274e" stroke="#05060A" stroke-width="2"></rect><circle cx="18" cy="18" r="7" fill="#0A0C11" opacity=".5"></circle><circle cx="270" cy="18" r="7" fill="#0A0C11" opacity=".5"></circle><text x="144" y="92" font-family="monospace" font-size="16" font-weight="500" fill="#F2F2EE" text-anchor="middle">Regulador stepdown</text><circle cx="203" cy="118" r="6" fill="#4A1E1E" stroke="#05060A" stroke-width="1"></circle>`,
    luzes: [{"x":203,"y":118}],
  },
  "stepup": {
    svg: `<rect width="288" height="192" rx="7" fill="#131d4e" stroke="#05060A" stroke-width="2"></rect><circle cx="18" cy="18" r="7" fill="#0A0C11" opacity=".5"></circle><circle cx="270" cy="18" r="7" fill="#0A0C11" opacity=".5"></circle><text x="144" y="92" font-family="monospace" font-size="16" font-weight="500" fill="#F2F2EE" text-anchor="middle" transform="translate(-2 10)">Regulador stepup</text>`,
  },
  "bateria-recarregavel": {
    svg: `<rect width="288" height="192" rx="7" fill="#7c7e7d" stroke="#05060A" stroke-width="2"></rect><circle cx="18" cy="18" r="7" fill="#0A0C11" opacity=".5"></circle><circle cx="270" cy="18" r="7" fill="#0A0C11" opacity=".5"></circle><text x="144" y="92" font-family="monospace" font-size="16" font-weight="500" fill="#F2F2EE" text-anchor="middle">Bateria recarregavel 5V</text>`,
  },
  "hc06": {
    svg: `<rect width="224" height="192" rx="7" fill="#034502" stroke="#05060A" stroke-width="2"></rect><circle cx="18" cy="18" r="7" fill="#0A0C11" opacity=".5"></circle><circle cx="222" cy="18" r="7" fill="#0A0C11" opacity=".5" transform="translate(-14 0)"></circle><text x="120" y="92" font-family="monospace" font-size="12" font-weight="500" fill="#F2F2EE" text-anchor="middle" transform="translate(-18 35)">Modulo bluetooth HC-06</text><circle cx="206" cy="122" r="6" fill="#4A1E1E"></circle><rect x="75" y="44" width="88" height="76" rx="4" fill="#484b51" stroke="#05060A" stroke-width="2" transform="translate(-13 -9)"></rect><path d="M145 30 L145 15 L128 15 L128 31 L112 31 L111 14 L94 13 L94 30 L76 29 L77 13 L61 13 L60 30" fill="none" stroke="#B9BEC6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path>`,
  },
  "caixa-bluetooth": {
    svg: `<rect x="24" y="24" width="288" height="192" rx="20" fill="#1B1F26" stroke="#05060A" stroke-width="3"></rect><circle cx="120" cy="120" r="60" fill="#2A2E36" stroke="#3A3F47" stroke-width="3"></circle><circle cx="120" cy="120" r="22" fill="#565C66"></circle><circle cx="228" cy="120" r="36" fill="#2A2E36" stroke="#3A3F47" stroke-width="3"></circle><text x="168" y="200" font-family="monospace" font-size="14" font-weight="500" fill="#7DD3FC" text-anchor="middle">bluetooth</text>`,
  },
  "clipe": {
    svg: `<path d="M24 48h108a24 24 0 010 0" fill="none" stroke="#B9BEC6" stroke-width="7" stroke-linecap="round" transform="translate(16 4)"></path><path d="M40 34h92a14 14 0 010 28H52a14 14 0 010-28h74" fill="none" stroke="#C9CDD3" stroke-width="7" stroke-linecap="round"></path><text x="84" y="88" font-family="monospace" font-size="12" font-weight="500" fill="#8A8F98" text-anchor="middle" transform="translate(11 -9)">clipe</text>`,
  },
};

/* Pinos que o desenho novo colocou em outro lugar. Aplicado sobre o
   modelo tecnico em biblioteca.js, sem mexer nas definicoes. */
export const PINOS_AJUSTADOS = {
  "microbura": {
    "batP": {
      "x": 48,
      "y": 72
    },
    "batN": {
      "x": 156,
      "y": 72
    }
  },
  "protoboard": {
    "inf+0": {
      "x": 24,
      "y": 432
    },
    "inf-0": {
      "x": 24,
      "y": 456
    },
    "inf+1": {
      "x": 48,
      "y": 432
    },
    "inf-1": {
      "x": 48,
      "y": 456
    },
    "inf+2": {
      "x": 72,
      "y": 432
    },
    "inf-2": {
      "x": 72,
      "y": 456
    },
    "inf+3": {
      "x": 96,
      "y": 432
    },
    "inf-3": {
      "x": 96,
      "y": 456
    },
    "inf+4": {
      "x": 120,
      "y": 432
    },
    "inf-4": {
      "x": 120,
      "y": 456
    },
    "inf+5": {
      "x": 144,
      "y": 432
    },
    "inf-5": {
      "x": 144,
      "y": 456
    },
    "inf+6": {
      "x": 168,
      "y": 432
    },
    "inf-6": {
      "x": 168,
      "y": 456
    },
    "inf+7": {
      "x": 192,
      "y": 432
    },
    "inf-7": {
      "x": 192,
      "y": 456
    },
    "inf+8": {
      "x": 216,
      "y": 432
    },
    "inf-8": {
      "x": 216,
      "y": 456
    },
    "inf+9": {
      "x": 240,
      "y": 432
    },
    "inf-9": {
      "x": 240,
      "y": 456
    },
    "inf+10": {
      "x": 264,
      "y": 432
    },
    "inf-10": {
      "x": 264,
      "y": 456
    },
    "inf+11": {
      "x": 288,
      "y": 432
    },
    "inf-11": {
      "x": 288,
      "y": 456
    },
    "inf+12": {
      "x": 312,
      "y": 432
    },
    "inf-12": {
      "x": 312,
      "y": 456
    },
    "inf+13": {
      "x": 336,
      "y": 432
    },
    "inf-13": {
      "x": 336,
      "y": 456
    },
    "inf+14": {
      "x": 360,
      "y": 432
    },
    "inf-14": {
      "x": 360,
      "y": 456
    },
    "inf+15": {
      "x": 384,
      "y": 432
    },
    "inf-15": {
      "x": 384,
      "y": 460
    },
    "inf+16": {
      "x": 408,
      "y": 432
    },
    "inf-16": {
      "x": 408,
      "y": 456
    },
    "inf+17": {
      "x": 432,
      "y": 432
    },
    "inf-17": {
      "x": 432,
      "y": 456
    },
    "inf+18": {
      "x": 456,
      "y": 432
    },
    "inf-18": {
      "x": 456,
      "y": 456
    },
    "inf+19": {
      "x": 480,
      "y": 432
    },
    "inf-19": {
      "x": 480,
      "y": 456
    },
    "inf+20": {
      "x": 504,
      "y": 432
    },
    "inf-20": {
      "x": 504,
      "y": 456
    },
    "inf+21": {
      "x": 528,
      "y": 432
    },
    "inf-21": {
      "x": 528,
      "y": 456
    },
    "inf+22": {
      "x": 552,
      "y": 432
    },
    "inf-22": {
      "x": 552,
      "y": 456
    },
    "inf+23": {
      "x": 576,
      "y": 432
    },
    "inf-23": {
      "x": 576,
      "y": 456
    },
    "inf+24": {
      "x": 600,
      "y": 432
    },
    "inf-24": {
      "x": 600,
      "y": 456
    },
    "inf+25": {
      "x": 624,
      "y": 432
    },
    "inf-25": {
      "x": 624,
      "y": 456
    },
    "inf+26": {
      "x": 648,
      "y": 432
    },
    "inf-26": {
      "x": 648,
      "y": 456
    },
    "inf+27": {
      "x": 672,
      "y": 432
    },
    "inf-27": {
      "x": 672,
      "y": 456
    },
    "inf+28": {
      "x": 696,
      "y": 432
    },
    "inf-28": {
      "x": 696,
      "y": 456
    },
    "inf+29": {
      "x": 720,
      "y": 432
    },
    "inf-29": {
      "x": 720,
      "y": 456
    }
  },
  "bateria9v": {
    "n": {
      "x": 120,
      "y": 192
    }
  },
  "fonte-protoboard": {
    "vout": {
      "x": 24,
      "y": 144
    },
    "gnd": {
      "x": 264,
      "y": 144
    }
  },
  "rele": {
    "gnd": {
      "x": 120,
      "y": 168
    },
    "in": {
      "x": 144,
      "y": 168
    },
    "vcc": {
      "x": 168,
      "y": 168
    },
    "no": {
      "x": 92,
      "y": 20
    },
    "com": {
      "x": 136,
      "y": 20
    }
  },
  "ponteh": {
    "out1": {
      "x": 44,
      "y": 116
    },
    "out2": {
      "x": 44,
      "y": 164
    },
    "v12": {
      "x": 276,
      "y": 24
    },
    "gnd": {
      "x": 324,
      "y": 24
    },
    "v5": {
      "x": 372,
      "y": 24
    },
    "out3": {
      "x": 392,
      "y": 124
    },
    "out4": {
      "x": 392,
      "y": 172
    },
    "ena": {
      "x": 48,
      "y": 24
    },
    "in1": {
      "x": 72,
      "y": 24
    },
    "in2": {
      "x": 96,
      "y": 24
    },
    "in3": {
      "x": 120,
      "y": 24
    },
    "in4": {
      "x": 144,
      "y": 24
    },
    "enb": {
      "x": 168,
      "y": 24
    }
  },
  "transistor": {
    "c": {
      "x": 24,
      "y": 144
    },
    "b": {
      "x": 48,
      "y": 144
    },
    "e": {
      "x": 72,
      "y": 144
    }
  },
  "led": {
    "k": {
      "x": 72,
      "y": 144
    }
  },
  "ledrgb": {
    "r": {
      "x": 48,
      "y": 192
    },
    "g": {
      "x": 72,
      "y": 192
    },
    "b": {
      "x": 96,
      "y": 192
    },
    "gnd": {
      "x": 120,
      "y": 192
    }
  },
  "buzzer": {
    "p": {
      "x": 48,
      "y": 168
    },
    "n": {
      "x": 96,
      "y": 168
    }
  },
  "servo180": {
    "gnd": {
      "x": 288,
      "y": 144
    },
    "vcc": {
      "x": 288,
      "y": 164
    },
    "sig": {
      "x": 288,
      "y": 184
    }
  },
  "indutor": {
    "a": {
      "x": 48,
      "y": 96
    },
    "b": {
      "x": 120,
      "y": 96
    }
  },
  "zener": {
    "a": {
      "x": 0,
      "y": 48
    },
    "b": {
      "x": 144,
      "y": 48
    }
  },
  "buzzer-passivo": {
    "a": {
      "x": 48,
      "y": 168
    },
    "b": {
      "x": 96,
      "y": 168
    }
  },
  "altofalante": {
    "a": {
      "x": 216,
      "y": 240
    },
    "b": {
      "x": 264,
      "y": 240
    }
  },
  "botao-arcade": {
    "a": {
      "x": 144,
      "y": 264
    },
    "b": {
      "x": 192,
      "y": 216
    }
  },
  "chave3": {
    "a": {
      "x": 72,
      "y": 144
    },
    "com": {
      "x": 96,
      "y": 144
    },
    "b": {
      "x": 120,
      "y": 144
    }
  },
  "umidade-solo": {
    "vcc": {
      "x": 96,
      "y": 192
    },
    "gnd": {
      "x": 120,
      "y": 192
    },
    "a0": {
      "x": 144,
      "y": 192
    },
    "d0": {
      "x": 168,
      "y": 192
    },
    "s1": {
      "x": 120,
      "y": 24
    },
    "s2": {
      "x": 144,
      "y": 24
    }
  },
  "motordc-reducao": {
    "a": {
      "x": 288,
      "y": 144
    },
    "b": {
      "x": 336,
      "y": 144
    }
  },
  "motor-drone": {
    "a": {
      "x": 192,
      "y": 144
    },
    "b": {
      "x": 216,
      "y": 144
    }
  },
  "bomba": {
    "a": {
      "x": 240,
      "y": 192
    },
    "b": {
      "x": 264,
      "y": 192
    }
  },
  "servo360": {
    "gnd": {
      "x": 280,
      "y": 148
    },
    "vcc": {
      "x": 280,
      "y": 168
    },
    "sig": {
      "x": 280,
      "y": 188
    }
  },
  "servo-torque180": {
    "gnd": {
      "x": 280,
      "y": 164
    },
    "vcc": {
      "x": 280,
      "y": 184
    },
    "sig": {
      "x": 280,
      "y": 204
    }
  },
  "servo-torque360": {
    "gnd": {
      "x": 280,
      "y": 160
    },
    "vcc": {
      "x": 280,
      "y": 184
    },
    "sig": {
      "x": 280,
      "y": 204
    }
  },
  "stepdown": {
    "inp": {
      "x": 24,
      "y": 48
    },
    "inn": {
      "x": 24,
      "y": 168
    },
    "outp": {
      "x": 264,
      "y": 48
    },
    "outn": {
      "x": 264,
      "y": 168
    }
  },
  "stepup": {
    "inp": {
      "x": 24,
      "y": 48
    },
    "inn": {
      "x": 24,
      "y": 168
    },
    "outp": {
      "x": 264,
      "y": 48
    },
    "outn": {
      "x": 264,
      "y": 168
    }
  },
  "caixa-bluetooth": {
    "p3": {
      "x": 320,
      "y": 184
    }
  },
  "clipe": {
    "a": {
      "x": 48,
      "y": 48
    }
  }
};

/* Pecas que mudaram de tamanho no assistente. */
export const TAMANHOS = {
  "ky037": {
    "w": 168,
    "h": 192
  }
};
