/**
 * CodeLingo — motor de códigos.
 * Cada código expõe metadados educativos + (quando aplicável) funções puras
 * de codificar/decodificar. Tudo é determinístico e sem dependências externas.
 */

export type Difficulty = 1 | 2 | 3 | 4 | 5;

export interface CourseContent {
  origin: string;
  inventor: string;
  history: string;
  howItWorks: string;
  encodeGuide: string;
  decodeGuide: string;
  applications: string;
  curiosities: string[];
  summary: string;
}

export interface QuizQuestion {
  prompt: string;
  options: string[];
  answer: number; // índice correto
  explain: string;
}

export interface CodeModule {
  id: string;
  name: string;
  icon: string; // emoji
  tagline: string;
  difficulty: Difficulty;
  category: "Fundamentos" | "Numéricos" | "Cifras" | "Táteis & Visuais" | "Comunicação";
  encodable: boolean; // possui encode/decode 1:1 de texto
  alphabetHint?: string; // dica curta de referência (ex.: tabela)
  content: CourseContent;
  quiz: QuizQuestion[];
  encode?: (text: string) => string;
  decode?: (text: string) => string;
}

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const clean = (s: string) => s.toUpperCase();

function shiftLetter(ch: string, shift: number): string {
  const code = ch.charCodeAt(0);
  if (code >= 65 && code <= 90) return String.fromCharCode(((code - 65 + shift + 26) % 26) + 65);
  if (code >= 97 && code <= 122) return String.fromCharCode(((code - 97 + shift + 26) % 26) + 97);
  return ch;
}

// ---------------------------------------------------------------------------
// Morse
// ---------------------------------------------------------------------------

export const MORSE: Record<string, string> = {
  A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....",
  I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.",
  Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-",
  Y: "-.--", Z: "--..", "0": "-----", "1": ".----", "2": "..---", "3": "...--",
  "4": "....-", "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
};
const MORSE_REV: Record<string, string> = Object.fromEntries(
  Object.entries(MORSE).map(([k, v]) => [v, k]),
);

// ---------------------------------------------------------------------------
// Braille (padrões unicode)
// ---------------------------------------------------------------------------

export const BRAILLE: Record<string, string> = {
  A: "⠁", B: "⠃", C: "⠉", D: "⠙", E: "⠑", F: "⠋", G: "⠛", H: "⠓", I: "⠊", J: "⠚",
  K: "⠅", L: "⠇", M: "⠍", N: "⠝", O: "⠕", P: "⠏", Q: "⠟", R: "⠗", S: "⠎", T: "⠞",
  U: "⠥", V: "⠧", W: "⠺", X: "⠭", Y: "⠽", Z: "⠵", " ": " ",
};
const BRAILLE_REV: Record<string, string> = Object.fromEntries(
  Object.entries(BRAILLE).map(([k, v]) => [v, k]),
);

// ---------------------------------------------------------------------------
// NATO fonético
// ---------------------------------------------------------------------------

export const NATO: Record<string, string> = {
  A: "Alfa", B: "Bravo", C: "Charlie", D: "Delta", E: "Echo", F: "Foxtrot",
  G: "Golf", H: "Hotel", I: "India", J: "Juliett", K: "Kilo", L: "Lima",
  M: "Mike", N: "November", O: "Oscar", P: "Papa", Q: "Quebec", R: "Romeo",
  S: "Sierra", T: "Tango", U: "Uniform", V: "Victor", W: "Whiskey", X: "X-ray",
  Y: "Yankee", Z: "Zulu",
};
const NATO_REV: Record<string, string> = Object.fromEntries(
  Object.entries(NATO).map(([k, v]) => [v.toUpperCase(), k]),
);

// ---------------------------------------------------------------------------
// Tap Code (Polybius 5x5, C=K)
// ---------------------------------------------------------------------------

const TAP_GRID = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
function tapEncodeChar(ch: string): string {
  let c = ch.toUpperCase();
  if (c === "K") c = "C";
  const idx = TAP_GRID.indexOf(c);
  if (idx < 0) return "";
  const row = Math.floor(idx / 5) + 1;
  const col = (idx % 5) + 1;
  return `${".".repeat(row)} ${".".repeat(col)}`;
}

// ---------------------------------------------------------------------------
// Bacon (a/b, versão de 24 letras I=J, U=V)
// ---------------------------------------------------------------------------

const BACON: Record<string, string> = {
  A: "aaaaa", B: "aaaab", C: "aaaba", D: "aaabb", E: "aabaa", F: "aabab",
  G: "aabba", H: "aabbb", I: "abaaa", J: "abaaa", K: "abaab", L: "ababa",
  M: "ababb", N: "abbaa", O: "abbab", P: "abbba", Q: "abbbb", R: "baaaa",
  S: "baaab", T: "baaba", U: "baabb", V: "baabb", W: "babaa", X: "babab",
  Y: "babba", Z: "babbb",
};
const BACON_REV: Record<string, string> = Object.fromEntries(
  Object.entries(BACON).map(([k, v]) => [v, k]).filter(([, k]) => "ABCDEFGHKLMNOPQRSTWXYZ".includes(k as string) || ["I", "U"].includes(k as string)),
);

// ---------------------------------------------------------------------------
// Base64 (ASCII puro, sem dependências)
// ---------------------------------------------------------------------------

const B64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
function base64Encode(str: string): string {
  let out = "";
  for (let i = 0; i < str.length; i += 3) {
    const a = str.charCodeAt(i);
    const b = i + 1 < str.length ? str.charCodeAt(i + 1) : NaN;
    const c = i + 2 < str.length ? str.charCodeAt(i + 2) : NaN;
    out += B64[a >> 2];
    out += B64[((a & 3) << 4) | (isNaN(b) ? 0 : b >> 4)];
    out += isNaN(b) ? "=" : B64[((b & 15) << 2) | (isNaN(c) ? 0 : c >> 6)];
    out += isNaN(c) ? "=" : B64[c & 63];
  }
  return out;
}
function base64Decode(str: string): string {
  const s = str.replace(/[^A-Za-z0-9+/]/g, "");
  let out = "";
  for (let i = 0; i < s.length; i += 4) {
    const a = B64.indexOf(s[i]);
    const b = B64.indexOf(s[i + 1]);
    const c = B64.indexOf(s[i + 2]);
    const d = B64.indexOf(s[i + 3]);
    out += String.fromCharCode((a << 2) | (b >> 4));
    if (c >= 0 && s[i + 2] !== "=") out += String.fromCharCode(((b & 15) << 4) | (c >> 2));
    if (d >= 0 && s[i + 3] !== "=") out += String.fromCharCode(((c & 3) << 6) | d);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Definição dos módulos
// ---------------------------------------------------------------------------

export const CODES: CodeModule[] = [
  {
    id: "morse",
    name: "Código Morse",
    icon: "📡",
    tagline: "Pontos e traços que atravessaram oceanos",
    difficulty: 1,
    category: "Comunicação",
    encodable: true,
    alphabetHint: "E = ·   T = −   S = ···   O = −−−",
    content: {
      origin: "Estados Unidos, década de 1830.",
      inventor: "Samuel Morse e Alfred Vail.",
      history:
        "Criado para o telégrafo elétrico, permitiu enviar mensagens a longas distâncias pela primeira vez na história usando pulsos elétricos curtos e longos.",
      howItWorks:
        "Cada letra e número vira uma sequência de pontos (·) e traços (−). Um espaço separa letras; uma barra (/) separa palavras.",
      encodeGuide: "Troque cada letra pelo seu padrão de pontos e traços, separando letras por espaço.",
      decodeGuide: "Divida por espaços, traduza cada grupo de volta para a letra correspondente.",
      applications:
        "Telegrafia, aviação, náutica, situações de emergência (SOS = ···−−−···) e radioamadorismo.",
      curiosities: [
        "SOS foi escolhido por ser fácil de reconhecer, não por significar 'Save Our Souls'.",
        "A letra E é o ponto único porque é a mais comum no inglês — Morse contou letras em uma gráfica.",
        "Pilotos ainda usam Morse para identificar radiofaróis.",
      ],
      summary: "Morse transforma texto em ritmo: curto (·) e longo (−). Simples, robusto e centenário.",
    },
    quiz: [
      { prompt: "Qual é o Morse da letra E?", options: ["·", "−", "···", "·−"], answer: 0, explain: "E é o mais curto: um único ponto." },
      { prompt: "O que significa ···−−−···?", options: ["OK", "SOS", "HELP", "END"], answer: 1, explain: "Três curtos, três longos, três curtos = SOS." },
      { prompt: "Como se separam palavras em Morse?", options: ["Vírgula", "Barra /", "Ponto", "Traço"], answer: 1, explain: "Uma barra (/) separa palavras; espaço separa letras." },
    ],
    encode: (t) => clean(t).split("").map((c) => (c === " " ? "/" : MORSE[c] ?? "")).filter(Boolean).join(" "),
    decode: (t) => t.trim().split(" ").map((g) => (g === "/" ? " " : MORSE_REV[g] ?? "")).join(""),
  },
  {
    id: "binary",
    name: "Código Binário",
    icon: "🔢",
    tagline: "A língua nativa de todo computador",
    difficulty: 1,
    category: "Fundamentos",
    encodable: true,
    alphabetHint: "A = 01000001 (65)",
    content: {
      origin: "Sistema formalizado no século XVII.",
      inventor: "Gottfried Wilhelm Leibniz descreveu a aritmética binária em 1703.",
      history:
        "Leibniz percebeu que qualquer número pode ser escrito com apenas 0 e 1. Séculos depois, isso virou a base de toda a computação digital.",
      howItWorks:
        "Cada caractere tem um número (código ASCII). Esse número é escrito em base 2, geralmente com 8 bits (um byte).",
      encodeGuide: "Pegue o código ASCII da letra e converta para 8 dígitos binários.",
      decodeGuide: "Agrupe de 8 em 8 bits, converta para decimal e depois para o caractere ASCII.",
      applications: "Base de computadores, memória, redes e armazenamento — absolutamente tudo é binário por baixo.",
      curiosities: [
        "8 bits = 1 byte, capaz de representar 256 valores diferentes (0–255).",
        "A letra 'A' maiúscula é 65; a 'a' minúscula é 97.",
        "Transistores ligam/desligam representando 1 e 0 bilhões de vezes por segundo.",
      ],
      summary: "Binário é contar apenas com 0 e 1. Cada letra vira um byte de 8 bits.",
    },
    quiz: [
      { prompt: "Quantos valores 8 bits representam?", options: ["8", "16", "128", "256"], answer: 3, explain: "2^8 = 256 valores (0 a 255)." },
      { prompt: "Quantos bits tem um byte?", options: ["4", "8", "16", "32"], answer: 1, explain: "Um byte tem 8 bits." },
      { prompt: "01000001 corresponde a qual letra?", options: ["A", "B", "a", "Z"], answer: 0, explain: "01000001 = 65 = 'A'." },
    ],
    encode: (t) => t.split("").map((c) => c.charCodeAt(0).toString(2).padStart(8, "0")).join(" "),
    decode: (t) => t.trim().split(/\s+/).map((b) => String.fromCharCode(parseInt(b, 2))).join(""),
  },
  {
    id: "ascii",
    name: "ASCII",
    icon: "🔡",
    tagline: "O padrão que deu números às letras",
    difficulty: 2,
    category: "Fundamentos",
    encodable: true,
    alphabetHint: "A = 65   a = 97   0 = 48",
    content: {
      origin: "Estados Unidos, 1963.",
      inventor: "Comitê ASA (American Standards Association).",
      history:
        "Antes do ASCII, cada fabricante usava sua própria tabela. O ASCII unificou 128 caracteres com números de 0 a 127, permitindo que máquinas diferentes se entendessem.",
      howItWorks: "Cada caractere recebe um número decimal fixo entre 0 e 127.",
      encodeGuide: "Substitua cada caractere pelo seu número decimal ASCII.",
      decodeGuide: "Converta cada número de volta para o caractere correspondente.",
      applications: "Fundamento de texto em computadores, protocolos de internet e linguagens de programação.",
      curiosities: [
        "Os primeiros 32 códigos são 'de controle', invisíveis (como quebra de linha = 10).",
        "O espaço em branco é o código 32.",
        "Unicode é uma superset do ASCII: os 128 primeiros são idênticos.",
      ],
      summary: "ASCII é a tabela que dá um número (0–127) para cada letra, número e símbolo.",
    },
    quiz: [
      { prompt: "Qual o código ASCII de 'A'?", options: ["61", "65", "97", "41"], answer: 1, explain: "'A' maiúsculo é 65." },
      { prompt: "O código 32 representa o quê?", options: ["Zero", "Espaço", "Enter", "Tab"], answer: 1, explain: "32 é o caractere de espaço." },
      { prompt: "Quantos caracteres o ASCII padrão define?", options: ["64", "128", "256", "512"], answer: 1, explain: "128 caracteres (0–127)." },
    ],
    encode: (t) => t.split("").map((c) => c.charCodeAt(0)).join(" "),
    decode: (t) => t.trim().split(/\s+/).map((n) => String.fromCharCode(parseInt(n, 10))).join(""),
  },
  {
    id: "hex",
    name: "Hexadecimal",
    icon: "⬡",
    tagline: "Base 16: onde as letras viram dígitos",
    difficulty: 2,
    category: "Numéricos",
    encodable: true,
    alphabetHint: "A = 41   Z = 5A   (base 16)",
    content: {
      origin: "Popularizado com a computação nas décadas de 1960–70.",
      inventor: "Convenção coletiva da computação (IBM ajudou a padronizar).",
      history:
        "Programadores precisavam de uma forma compacta de ler binário. Hexadecimal agrupa 4 bits em um único dígito, encurtando bytes longos.",
      howItWorks: "Base 16 usa 0–9 e A–F. Cada byte vira exatamente dois dígitos hexadecimais.",
      encodeGuide: "Converta o código do caractere para base 16 (dois dígitos).",
      decodeGuide: "Leia cada par hex, converta para decimal e depois para o caractere.",
      applications: "Cores em CSS (#FFD54F), endereços de memória, hashes, MAC address e depuração.",
      curiosities: [
        "A cor âmbar do CodeLingo é #FFD54F em hexadecimal.",
        "'DEAD' e 'BEEF' são valores hex válidos usados como marcadores por programadores.",
        "Um byte sempre cabe em 2 dígitos hex (00 a FF).",
      ],
      summary: "Hexadecimal é base 16 (0–F). Compacta o binário: 1 byte = 2 dígitos.",
    },
    quiz: [
      { prompt: "Quais símbolos o hex usa?", options: ["0–9", "0–7", "0–9 e A–F", "A–Z"], answer: 2, explain: "0–9 e A–F, totalizando 16 símbolos." },
      { prompt: "Quanto vale o hex FF em decimal?", options: ["15", "100", "255", "256"], answer: 2, explain: "FF = 255, o maior valor de 1 byte." },
      { prompt: "#FFD54F representa o quê?", options: ["Um número", "Uma cor", "Uma data", "Um som"], answer: 1, explain: "É uma cor (o âmbar), em hex RGB." },
    ],
    encode: (t) => t.split("").map((c) => c.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0")).join(" "),
    decode: (t) => t.trim().split(/\s+/).map((h) => String.fromCharCode(parseInt(h, 16))).join(""),
  },
  {
    id: "base64",
    name: "Base64",
    icon: "🧬",
    tagline: "Transformando dados binários em texto seguro",
    difficulty: 3,
    category: "Fundamentos",
    encodable: true,
    content: {
      origin: "Padronizado com o e-mail MIME nos anos 1990.",
      inventor: "Definido em RFCs da IETF (comunidade da internet).",
      history:
        "E-mails só transmitiam texto com segurança. Base64 nasceu para embutir imagens e arquivos em mensagens, convertendo bytes em 64 caracteres 'seguros'.",
      howItWorks:
        "Agrupa os bits de 3 bytes (24 bits) e os divide em 4 grupos de 6 bits, cada um virando um caractere de um alfabeto de 64 símbolos.",
      encodeGuide: "Pegue 3 bytes, reparta em 4 blocos de 6 bits e mapeie para A–Z a–z 0–9 + /.",
      decodeGuide: "Reverta: cada 4 caracteres viram 3 bytes originais. O '=' é preenchimento.",
      applications: "Anexos de e-mail, imagens embutidas (data URI), tokens JWT e APIs web.",
      curiosities: [
        "O sinal '=' no fim é só preenchimento, não faz parte dos dados.",
        "Base64 aumenta o tamanho em ~33% — não é compressão!",
        "Não é criptografia: qualquer um decodifica facilmente.",
      ],
      summary: "Base64 converte bytes em 64 caracteres de texto seguros para transporte.",
    },
    quiz: [
      { prompt: "Base64 é criptografia?", options: ["Sim, forte", "Não, só codificação", "Sim, fraca", "Depende"], answer: 1, explain: "É codificação reversível, não protege nada." },
      { prompt: "Para que serve o '=' no final?", options: ["Erro", "Preenchimento", "Fim de linha", "Chave"], answer: 1, explain: "É padding para completar os blocos." },
      { prompt: "Quantos símbolos o alfabeto Base64 tem?", options: ["32", "64", "128", "256"], answer: 1, explain: "64 símbolos — daí o nome." },
    ],
    encode: (t) => base64Encode(t),
    decode: (t) => base64Decode(t),
  },
  {
    id: "caesar",
    name: "Cifra de César",
    icon: "🏛️",
    tagline: "A cifra do imperador romano",
    difficulty: 2,
    category: "Cifras",
    encodable: true,
    alphabetHint: "Deslocamento padrão = 3 (A→D)",
    content: {
      origin: "Roma Antiga, ~50 a.C.",
      inventor: "Júlio César.",
      history:
        "César usava um deslocamento de 3 letras para proteger mensagens militares. Foi uma das primeiras técnicas de criptografia documentadas.",
      howItWorks: "Cada letra é substituída por outra, N posições adiante no alfabeto (voltando ao início se passar de Z).",
      encodeGuide: "Some N à posição de cada letra (A=0). Ex.: com N=3, A→D, B→E.",
      decodeGuide: "Subtraia N da posição de cada letra para voltar ao original.",
      applications: "Ensino de criptografia, quebra-cabeças e base histórica das cifras de substituição.",
      curiosities: [
        "ROT13 é simplesmente uma César com deslocamento 13.",
        "Só existem 25 chaves possíveis — quebrar por força bruta é trivial.",
        "Augusto, sobrinho de César, preferia deslocamento 1.",
      ],
      summary: "César desliza o alfabeto N casas. Simples, histórica e fácil de quebrar.",
    },
    quiz: [
      { prompt: "Qual deslocamento César usava?", options: ["1", "3", "13", "26"], answer: 1, explain: "César usava deslocamento de 3." },
      { prompt: "Quantas chaves possíveis existem?", options: ["10", "25", "100", "Infinitas"], answer: 1, explain: "25 deslocamentos úteis (26 volta ao original)." },
      { prompt: "Com N=3, a letra A vira?", options: ["C", "D", "X", "B"], answer: 1, explain: "A + 3 = D." },
    ],
    encode: (t) => t.split("").map((c) => shiftLetter(c, 3)).join(""),
    decode: (t) => t.split("").map((c) => shiftLetter(c, -3)).join(""),
  },
  {
    id: "vigenere",
    name: "Cifra de Vigenère",
    icon: "🗝️",
    tagline: "A cifra 'indecifrável' por 300 anos",
    difficulty: 4,
    category: "Cifras",
    encodable: true,
    alphabetHint: "Chave padrão: CHAVE",
    content: {
      origin: "França/Itália, século XVI.",
      inventor: "Atribuída a Blaise de Vigenère (baseada em Bellaso).",
      history:
        "Usa uma palavra-chave que muda o deslocamento a cada letra. Resistiu a criptoanálise por cerca de três séculos, ganhando o apelido 'le chiffre indéchiffrable'.",
      howItWorks:
        "Cada letra do texto é deslocada por um valor determinado pela letra correspondente da chave, que se repete.",
      encodeGuide: "Alinhe a chave sob o texto (repetindo-a). Some as posições das letras.",
      decodeGuide: "Alinhe a chave de novo e subtraia as posições da chave.",
      applications: "Marco na história da criptografia; base conceitual de cifras de fluxo modernas.",
      curiosities: [
        "Foi quebrada por Charles Babbage e Friedrich Kasiski no século XIX.",
        "Se a chave for do tamanho da mensagem e aleatória, torna-se um one-time pad — teoricamente inquebrável.",
        "Uma chave de 1 letra reduz Vigenère a uma simples César.",
      ],
      summary: "Vigenère usa uma palavra-chave que muda o deslocamento a cada letra.",
    },
    quiz: [
      { prompt: "O que define o deslocamento em Vigenère?", options: ["Um número fixo", "Uma palavra-chave", "O acaso", "A data"], answer: 1, explain: "A palavra-chave, letra a letra." },
      { prompt: "Vigenère com chave de 1 letra vira?", options: ["Atbash", "César", "Morse", "ROT13"], answer: 1, explain: "Deslocamento constante = César." },
      { prompt: "Qual apelido a cifra recebeu?", options: ["A imperial", "A indecifrável", "A quântica", "A real"], answer: 1, explain: "'Le chiffre indéchiffrable'." },
    ],
    encode: (t) => vigenere(t, "CHAVE", true),
    decode: (t) => vigenere(t, "CHAVE", false),
  },
  {
    id: "braille",
    name: "Braille",
    icon: "⠿",
    tagline: "Leitura pelo tato com 6 pontos",
    difficulty: 3,
    category: "Táteis & Visuais",
    encodable: true,
    content: {
      origin: "França, 1824.",
      inventor: "Louis Braille, aos 15 anos.",
      history:
        "Cego desde a infância, Louis Braille adaptou um código militar noturno em um sistema de 6 pontos em relevo, revolucionando o acesso à leitura para pessoas cegas.",
      howItWorks: "Uma célula de 6 pontos (2 colunas × 3 linhas). Combinações de pontos em relevo formam cada letra.",
      encodeGuide: "Troque cada letra pelo seu padrão de pontos da célula Braille.",
      decodeGuide: "Leia cada célula de pontos e traduza para a letra correspondente.",
      applications: "Livros, placas, elevadores, embalagens de remédios e cédulas de dinheiro.",
      curiosities: [
        "Braille criou o sistema a partir da 'escrita noturna' militar de Charles Barbier.",
        "Existe Braille para música e matemática também.",
        "A leitura tátil pode chegar a mais de 100 palavras por minuto.",
      ],
      summary: "Braille é uma célula de 6 pontos em relevo, lida pelo tato.",
    },
    quiz: [
      { prompt: "Quantos pontos tem uma célula Braille?", options: ["4", "6", "8", "9"], answer: 1, explain: "6 pontos (2×3)." },
      { prompt: "Quem inventou o Braille?", options: ["Morse", "Louis Braille", "Vigenère", "Bacon"], answer: 1, explain: "Louis Braille, em 1824." },
      { prompt: "Braille é lido como?", options: ["Pela visão", "Pelo tato", "Pelo som", "Por luz"], answer: 1, explain: "Pelo tato, com pontos em relevo." },
    ],
    encode: (t) => clean(t).split("").map((c) => BRAILLE[c] ?? c).join(""),
    decode: (t) => t.split("").map((c) => BRAILLE_REV[c] ?? c).join(""),
  },
  {
    id: "nato",
    name: "Alfabeto Fonético NATO",
    icon: "🎙️",
    tagline: "Alfa, Bravo, Charlie... som à prova de ruído",
    difficulty: 1,
    category: "Comunicação",
    encodable: true,
    content: {
      origin: "Adotado internacionalmente em 1956.",
      inventor: "OTAN / ICAO (aviação civil internacional).",
      history:
        "Em rádios com ruído, 'B' e 'D' soam parecidos. Palavras inteiras como 'Bravo' e 'Delta' eliminam a confusão, salvando vidas na aviação e nas forças armadas.",
      howItWorks: "Cada letra é substituída por uma palavra padronizada e facilmente distinguível.",
      encodeGuide: "Troque cada letra pela palavra correspondente (A = Alfa).",
      decodeGuide: "Pegue a primeira letra de cada palavra.",
      applications: "Aviação, forças armadas, polícia, atendimento e soletração ao telefone.",
      curiosities: [
        "'Juliett' é escrito com dois T's de propósito, para falantes de francês.",
        "'X-ray' é a única com hífen.",
        "Foi testado em falantes de dezenas de idiomas antes de ser adotado.",
      ],
      summary: "NATO troca cada letra por uma palavra clara — comunicação à prova de ruído.",
    },
    quiz: [
      { prompt: "Qual palavra representa a letra B?", options: ["Beta", "Bravo", "Baker", "Bingo"], answer: 1, explain: "B = Bravo no alfabeto NATO." },
      { prompt: "Por que usar palavras em vez de letras?", options: ["Estilo", "Evitar confusão sonora", "Segredo", "Rapidez"], answer: 1, explain: "Palavras distinguíveis evitam erros em rádio ruidoso." },
      { prompt: "A letra A é?", options: ["Apple", "Alfa", "Alpha", "Ares"], answer: 1, explain: "Oficialmente grafada 'Alfa'." },
    ],
    encode: (t) => clean(t).split("").map((c) => NATO[c] ?? c).join(" "),
    decode: (t) => t.trim().split(/\s+/).map((w) => NATO_REV[w.toUpperCase()] ?? w).join(""),
  },
  {
    id: "tap",
    name: "Tap Code",
    icon: "👊",
    tagline: "Comunicação por batidas na parede",
    difficulty: 3,
    category: "Comunicação",
    encodable: true,
    alphabetHint: "Grade 5×5 (C = K)",
    content: {
      origin: "Usado por prisioneiros de guerra no séc. XX.",
      inventor: "Popularizado por prisioneiros americanos na Guerra do Vietnã.",
      history:
        "Prisioneiros impedidos de falar batiam nas paredes. Uma grade 5×5 transforma cada letra em duas séries de batidas: linha e coluna.",
      howItWorks: "Letras ficam numa grade 5×5 (K usa a casa do C). Batidas indicam linha, pausa, e coluna.",
      encodeGuide: "Localize a letra na grade: bata a linha, pause, bata a coluna.",
      decodeGuide: "Conte as batidas: primeiro grupo = linha, segundo = coluna. Cruze na grade.",
      applications: "Prisões, situações de silêncio forçado e sinalização improvisada.",
      curiosities: [
        "Prisioneiros usavam o Tap Code para manter a moral e passar nomes.",
        "A letra K é omitida e substituída por C para caber em 5×5.",
        "'Shave and a haircut' batido era um sinal amigável entre celas.",
      ],
      summary: "Tap Code usa uma grade 5×5: batidas de linha e coluna formam cada letra.",
    },
    quiz: [
      { prompt: "Qual o tamanho da grade do Tap Code?", options: ["4×4", "5×5", "6×6", "3×3"], answer: 1, explain: "5×5, com 25 casas." },
      { prompt: "Qual letra é substituída?", options: ["Q por O", "K por C", "Z por S", "J por I"], answer: 1, explain: "K usa a casa do C." },
      { prompt: "As duas séries de batidas indicam?", options: ["Letra e número", "Linha e coluna", "Início e fim", "Sim e não"], answer: 1, explain: "Linha, pausa, coluna." },
    ],
    encode: (t) => clean(t).split("").map(tapEncodeChar).filter(Boolean).join("  /  "),
  },
  {
    id: "pigpen",
    name: "Pigpen (Maçônica)",
    icon: "🔳",
    tagline: "Letras escondidas em grades e pontos",
    difficulty: 3,
    category: "Táteis & Visuais",
    encodable: false,
    content: {
      origin: "Século XVIII, Europa.",
      inventor: "Associada aos maçons (Freemasons).",
      history:
        "Também chamada 'cifra do chiqueiro', substitui letras por fragmentos de uma grade. Maçons a usavam para registros privados.",
      howItWorks:
        "Desenha-se duas grades (# e X). Cada letra ocupa uma célula; o símbolo da letra é o 'canto' que a cerca, com ou sem ponto.",
      encodeGuide: "Substitua cada letra pelo formato geométrico da célula que a contém.",
      decodeGuide: "Combine o formato do símbolo com a célula correspondente para achar a letra.",
      applications: "Diários secretos, jogos, geocaching e história maçônica.",
      curiosities: [
        "Aparece em lápides de maçons do século XVIII.",
        "É uma cifra de substituição — tão fácil de quebrar quanto a César.",
        "Existem variações com diferentes disposições de grade.",
      ],
      summary: "Pigpen troca letras por pedaços de uma grade — visual e simples.",
    },
    quiz: [
      { prompt: "A quem a Pigpen é associada?", options: ["Romanos", "Maçons", "Vikings", "Egípcios"], answer: 1, explain: "Aos maçons (Freemasons)." },
      { prompt: "Que tipo de cifra é a Pigpen?", options: ["Substituição", "Transposição", "Hash", "Fluxo"], answer: 0, explain: "Substitui cada letra por um símbolo." },
      { prompt: "O que diferencia letras na mesma grade?", options: ["Cor", "Um ponto", "Tamanho", "Número"], answer: 1, explain: "A presença de um ponto na segunda grade." },
    ],
  },
  {
    id: "bacon",
    name: "Cifra de Bacon",
    icon: "🥓",
    tagline: "Esconder mensagens em A's e B's",
    difficulty: 4,
    category: "Cifras",
    encodable: true,
    alphabetHint: "A = aaaaa   B = aaaab",
    content: {
      origin: "Inglaterra, 1605.",
      inventor: "Sir Francis Bacon.",
      history:
        "Bacon criou uma cifra onde cada letra vira um grupo de 5 símbolos binários (A/B). O truque genial: esconder esses A's e B's em outro texto usando dois tipos de fonte.",
      howItWorks: "Cada letra = 5 posições de 'a' ou 'b'. É essencialmente um código binário de 5 bits.",
      encodeGuide: "Troque cada letra pelo seu grupo de 5 letras a/b.",
      decodeGuide: "Agrupe de 5 em 5 e traduza cada grupo de volta.",
      applications: "Esteganografia (esconder mensagens dentro de textos) e criptografia histórica.",
      curiosities: [
        "É uma das primeiras formas de esteganografia binária.",
        "Usa 5 bits: 2^5 = 32, suficiente para 24–26 letras.",
        "Alimentou teorias de que Bacon teria escrito as obras de Shakespeare.",
      ],
      summary: "Bacon é binário disfarçado: cada letra vira 5 símbolos a/b.",
    },
    quiz: [
      { prompt: "Quantos símbolos por letra na cifra de Bacon?", options: ["3", "4", "5", "8"], answer: 2, explain: "5 posições de a/b." },
      { prompt: "A cifra de Bacon é essencialmente...", options: ["Base64", "Binária de 5 bits", "Morse", "Decimal"], answer: 1, explain: "a/b = 0/1, com 5 bits." },
      { prompt: "Para que ela é famosa?", options: ["Compressão", "Esteganografia", "Hash", "Redes"], answer: 1, explain: "Esconder mensagens dentro de outro texto." },
    ],
    encode: (t) => clean(t).split("").map((c) => BACON[c] ?? "").filter(Boolean).join(" "),
    decode: (t) => t.trim().split(/\s+/).map((g) => BACON_REV[g] ?? "").join(""),
  },
  {
    id: "atbash",
    name: "Atbash",
    icon: "🔄",
    tagline: "O alfabeto ao contrário",
    difficulty: 2,
    category: "Cifras",
    encodable: true,
    alphabetHint: "A↔Z   B↔Y   C↔X",
    content: {
      origin: "Antiga, de origem hebraica.",
      inventor: "Escribas hebreus (aparece na Bíblia).",
      history:
        "Uma das cifras mais antigas conhecidas. Espelha o alfabeto: a primeira letra vira a última, a segunda vira a penúltima, e assim por diante.",
      howItWorks: "A↔Z, B↔Y, C↔X... Cada letra é trocada pela sua 'espelhada'.",
      encodeGuide: "Para cada letra, use a letra na posição oposta do alfabeto.",
      decodeGuide: "É simétrica: aplicar de novo devolve o texto original.",
      applications: "Estudos bíblicos, ensino de criptografia e quebra-cabeças.",
      curiosities: [
        "O nome vem das letras hebraicas Aleph-Tav-Beth-Shin.",
        "Aplicar Atbash duas vezes devolve o texto original.",
        "Aparece no Livro de Jeremias como 'Sheshach' para 'Babel'.",
      ],
      summary: "Atbash espelha o alfabeto: A↔Z. É a própria inversa.",
    },
    quiz: [
      { prompt: "Em Atbash, a letra A vira?", options: ["B", "Z", "Y", "A"], answer: 1, explain: "A vira Z (a última)." },
      { prompt: "Aplicar Atbash duas vezes...", options: ["Embaralha mais", "Volta ao original", "Dá erro", "Vira César"], answer: 1, explain: "É simétrica, então retorna o texto." },
      { prompt: "Qual a origem do Atbash?", options: ["Romana", "Hebraica", "Grega", "Nórdica"], answer: 1, explain: "Origem hebraica antiga." },
    ],
    encode: (t) => t.split("").map((c) => { const u = c.toUpperCase(); const i = ALPHA.indexOf(u); return i < 0 ? c : (c === u ? ALPHA[25 - i] : ALPHA[25 - i].toLowerCase()); }).join(""),
    decode: (t) => t.split("").map((c) => { const u = c.toUpperCase(); const i = ALPHA.indexOf(u); return i < 0 ? c : (c === u ? ALPHA[25 - i] : ALPHA[25 - i].toLowerCase()); }).join(""),
  },
  {
    id: "rot13",
    name: "ROT13",
    icon: "➰",
    tagline: "Gire 13 e volte ao início",
    difficulty: 1,
    category: "Cifras",
    encodable: true,
    alphabetHint: "A↔N   B↔O   (deslocamento 13)",
    content: {
      origin: "Cultura da internet, anos 1980.",
      inventor: "Comunidade Usenet.",
      history:
        "ROT13 é uma César de deslocamento 13. Como o alfabeto tem 26 letras, aplicar duas vezes devolve o original — perfeito para 'esconder' spoilers.",
      howItWorks: "Cada letra avança 13 posições. A↔N, B↔O, etc.",
      encodeGuide: "Some 13 à posição de cada letra.",
      decodeGuide: "Some 13 de novo (13+13=26, volta ao original).",
      applications: "Esconder spoilers, respostas de piadas e conteúdo sensível em fóruns.",
      curiosities: [
        "É a própria inversa: codificar = decodificar.",
        "Não oferece nenhuma segurança real, só ofuscação leve.",
        "'HELLO' vira 'URYYB'.",
      ],
      summary: "ROT13 é César com deslocamento 13 — aplicar duas vezes desfaz.",
    },
    quiz: [
      { prompt: "Qual o deslocamento do ROT13?", options: ["3", "7", "13", "26"], answer: 2, explain: "13 posições." },
      { prompt: "ROT13 aplicado duas vezes...", options: ["Embaralha", "Volta ao original", "Vira Atbash", "Erro"], answer: 1, explain: "13+13=26=volta." },
      { prompt: "A letra A vira?", options: ["M", "N", "O", "Z"], answer: 1, explain: "A + 13 = N." },
    ],
    encode: (t) => t.split("").map((c) => shiftLetter(c, 13)).join(""),
    decode: (t) => t.split("").map((c) => shiftLetter(c, 13)).join(""),
  },
  {
    id: "gray",
    name: "Código Gray",
    icon: "🩶",
    tagline: "Binário onde só muda 1 bit por vez",
    difficulty: 4,
    category: "Numéricos",
    encodable: true,
    alphabetHint: "0=000  1=001  2=011  3=010",
    content: {
      origin: "Bell Labs, patente de 1953.",
      inventor: "Frank Gray.",
      history:
        "Frank Gray criou um código binário em que números consecutivos diferem em apenas 1 bit. Isso elimina erros de leitura em sistemas mecânicos e eletrônicos.",
      howItWorks: "É uma reordenação do binário: de um número para o próximo, muda-se exatamente um bit.",
      encodeGuide: "Gray = binário XOR (binário deslocado 1 à direita).",
      decodeGuide: "Reconstrua acumulando XOR dos bits da esquerda para a direita.",
      applications: "Encoders rotativos, TVs antigas, correção de erros e mapas de Karnaugh.",
      curiosities: [
        "Em encoders, evita leituras erradas quando vários bits mudariam ao mesmo tempo.",
        "Cada número consecutivo difere em só 1 bit — daí 'distância de Hamming 1'.",
        "Também é chamado de 'binário refletido'.",
      ],
      summary: "Gray é um binário reordenado onde vizinhos diferem em 1 único bit.",
    },
    quiz: [
      { prompt: "O que caracteriza o código Gray?", options: ["Muda todos os bits", "Muda 1 bit por passo", "Não usa 0", "É base 10"], answer: 1, explain: "Números vizinhos diferem em 1 bit." },
      { prompt: "Quem inventou?", options: ["Turing", "Frank Gray", "Bacon", "Morse"], answer: 1, explain: "Frank Gray, na Bell Labs." },
      { prompt: "Onde é muito usado?", options: ["Encoders rotativos", "E-mail", "Impressão", "Áudio"], answer: 0, explain: "Encoders de posição, evitando erros de leitura." },
    ],
    encode: (t) => t.split("").map((c) => { const n = c.charCodeAt(0); return (n ^ (n >> 1)).toString(2).padStart(8, "0"); }).join(" "),
    decode: (t) => t.trim().split(/\s+/).map((g) => { let num = parseInt(g, 2); let mask = num >> 1; while (mask) { num ^= mask; mask >>= 1; } return String.fromCharCode(num); }).join(""),
  },
  {
    id: "octal",
    name: "Código Octal",
    icon: "8️⃣",
    tagline: "Base 8: contando de 0 a 7",
    difficulty: 3,
    category: "Numéricos",
    encodable: true,
    alphabetHint: "A = 101 (octal de 65)",
    content: {
      origin: "Usado na computação inicial (anos 1950–60).",
      inventor: "Convenção da computação; comum em sistemas antigos.",
      history:
        "Antes do hexadecimal dominar, o octal (base 8) era popular porque agrupa 3 bits por dígito, encaixando bem em máquinas de palavras de 12, 24 ou 36 bits.",
      howItWorks: "Base 8 usa dígitos 0–7. Cada caractere é convertido para seu valor em base 8.",
      encodeGuide: "Converta o código do caractere para base 8.",
      decodeGuide: "Leia cada número octal, converta para decimal e depois para o caractere.",
      applications: "Permissões de arquivos no Unix/Linux (ex.: chmod 755) e sistemas legados.",
      curiosities: [
        "'chmod 777' usa octal para definir permissões de arquivos.",
        "Cada dígito octal representa exatamente 3 bits.",
        "Ainda aparece em código com o prefixo 0o (ex.: 0o17).",
      ],
      summary: "Octal é base 8 (0–7). Agrupa 3 bits por dígito.",
    },
    quiz: [
      { prompt: "Quais dígitos o octal usa?", options: ["0–7", "0–8", "0–9", "0–F"], answer: 0, explain: "0 a 7, oito símbolos." },
      { prompt: "Quantos bits um dígito octal representa?", options: ["2", "3", "4", "8"], answer: 1, explain: "3 bits por dígito." },
      { prompt: "'chmod 755' usa qual base?", options: ["Binária", "Octal", "Hex", "Decimal"], answer: 1, explain: "Permissões Unix são octais." },
    ],
    encode: (t) => t.split("").map((c) => c.charCodeAt(0).toString(8)).join(" "),
    decode: (t) => t.trim().split(/\s+/).map((o) => String.fromCharCode(parseInt(o, 8))).join(""),
  },
  {
    id: "unicode",
    name: "Unicode",
    icon: "🌐",
    tagline: "Um número para cada caractere do mundo",
    difficulty: 3,
    category: "Fundamentos",
    encodable: true,
    alphabetHint: "A = U+0041   😀 = U+1F600",
    content: {
      origin: "Primeira versão em 1991.",
      inventor: "Consórcio Unicode.",
      history:
        "O ASCII só cobria o inglês. Unicode nasceu para representar todos os sistemas de escrita do planeta — do árabe ao emoji — com um único número por caractere.",
      howItWorks: "Cada caractere tem um 'code point' único, escrito como U+XXXX em hexadecimal.",
      encodeGuide: "Troque cada caractere pelo seu code point U+XXXX.",
      decodeGuide: "Converta cada code point de volta para o caractere.",
      applications: "Todo texto moderno: web, apps, emojis e idiomas do mundo inteiro.",
      curiosities: [
        "Unicode já define mais de 149.000 caracteres.",
        "Emojis são caracteres Unicode como qualquer letra.",
        "Os primeiros 128 code points são idênticos ao ASCII.",
      ],
      summary: "Unicode dá um número (U+XXXX) para cada caractere de qualquer idioma.",
    },
    quiz: [
      { prompt: "Como se escreve um code point Unicode?", options: ["0xNN", "U+XXXX", "#XXXX", "\\uXX"], answer: 1, explain: "Formato U+XXXX em hexadecimal." },
      { prompt: "Emojis são?", options: ["Imagens", "Caracteres Unicode", "Fontes", "Ícones SVG"], answer: 1, explain: "São code points Unicode." },
      { prompt: "Os 128 primeiros code points equivalem a?", options: ["UTF-8", "ASCII", "Latin-1", "Base64"], answer: 1, explain: "Idênticos ao ASCII." },
    ],
    encode: (t) => t.split("").map((c) => "U+" + c.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0")).join(" "),
    decode: (t) => t.trim().split(/\s+/).map((u) => String.fromCharCode(parseInt(u.replace(/^U\+/i, ""), 16))).join(""),
  },
  {
    id: "semaphore",
    name: "Semáforo de Bandeiras",
    icon: "🚩",
    tagline: "Mensagens com o ângulo dos braços",
    difficulty: 3,
    category: "Comunicação",
    encodable: false,
    content: {
      origin: "França, início do século XIX.",
      inventor: "Sistema desenvolvido para a marinha (Home Popham e outros).",
      history:
        "Marinheiros seguravam bandeiras em posições diferentes para transmitir letras a distâncias visíveis, sem rádio. Cada letra é um par de ângulos dos braços.",
      howItWorks: "Duas bandeiras, cada braço apontando para uma de 8 direções (como um relógio). A combinação define a letra.",
      encodeGuide: "Posicione os dois braços nos ângulos correspondentes à letra.",
      decodeGuide: "Observe os ângulos dos dois braços e cruze com a tabela de letras.",
      applications: "Náutica, cerimônias e comunicação visual entre navios.",
      curiosities: [
        "O símbolo da paz ☮ é baseado nas letras semafóricas N e D ('Nuclear Disarmament').",
        "Ainda é ensinado em escolas navais.",
        "Funciona à luz do dia sem qualquer equipamento eletrônico.",
      ],
      summary: "Semáforo usa o ângulo de duas bandeiras para formar cada letra.",
    },
    quiz: [
      { prompt: "O que define a letra no semáforo?", options: ["A cor", "O ângulo dos braços", "O número de bandeiras", "O som"], answer: 1, explain: "A posição/ângulo dos dois braços." },
      { prompt: "Quantas bandeiras se usam?", options: ["1", "2", "3", "4"], answer: 1, explain: "Duas, uma em cada mão." },
      { prompt: "Qual símbolo famoso deriva do semáforo?", options: ["♻", "☮", "☯", "⚛"], answer: 1, explain: "O símbolo da paz (N + D)." },
    ],
  },
  {
    id: "qr",
    name: "Código QR (conceitos)",
    icon: "🔳",
    tagline: "Dados em 2D lidos num piscar de câmera",
    difficulty: 4,
    category: "Táteis & Visuais",
    encodable: false,
    content: {
      origin: "Japão, 1994.",
      inventor: "Masahiro Hara, na Denso Wave.",
      history:
        "Criado para rastrear peças de carros com leitura ultrarrápida. O QR ('Quick Response') armazena dados em duas dimensões, muito mais que um código de barras.",
      howItWorks:
        "Uma matriz de quadrados pretos e brancos codifica bits. Três quadrados grandes nos cantos orientam o leitor, e há correção de erros embutida.",
      encodeGuide: "Os dados são convertidos em bits, dispostos na matriz com máscara e correção de erro.",
      decodeGuide: "A câmera localiza os marcadores de canto, alinha a grade e lê os módulos.",
      applications: "Pagamentos (Pix), cardápios, ingressos, links e autenticação.",
      curiosities: [
        "Um QR pode guardar até ~4.296 caracteres alfanuméricos.",
        "Funciona mesmo com até ~30% do código danificado, graças à correção Reed–Solomon.",
        "Os três quadrados dos cantos servem para orientar a leitura em qualquer ângulo.",
      ],
      summary: "QR é um código 2D com marcadores de canto e correção de erros embutida.",
    },
    quiz: [
      { prompt: "O que significa 'QR'?", options: ["Quick Response", "Quality Read", "Quad Rows", "Query Reply"], answer: 0, explain: "'Quick Response' — resposta rápida." },
      { prompt: "Para que servem os 3 quadrados dos cantos?", options: ["Decoração", "Orientar a leitura", "Cor", "Data"], answer: 1, explain: "São marcadores de posição/orientação." },
      { prompt: "QR danificado ainda funciona por causa de?", options: ["Sorte", "Correção de erros", "Backup", "Zoom"], answer: 1, explain: "Correção Reed–Solomon recupera dados perdidos." },
    ],
  },
  {
    id: "barcode",
    name: "Código de Barras (conceitos)",
    icon: "|||",
    tagline: "Listras que o mundo do varejo lê",
    difficulty: 2,
    category: "Táteis & Visuais",
    encodable: false,
    content: {
      origin: "EUA, primeira patente em 1952; uso comercial em 1974.",
      inventor: "Norman Joseph Woodland e Bernard Silver.",
      history:
        "Inspirado no código Morse 'esticado' na areia, o código de barras usa listras de larguras variadas. O primeiro produto escaneado foi um pacote de chicletes em 1974.",
      howItWorks: "Barras e espaços de larguras diferentes representam dígitos. O leitor mede a luz refletida para decodificar.",
      encodeGuide: "Cada dígito vira um padrão específico de barras claras e escuras de larguras definidas.",
      decodeGuide: "O scanner mede a largura de barras/espaços e converte de volta em números.",
      applications: "Varejo, logística, estoque, bilhetes e rastreamento de encomendas.",
      curiosities: [
        "O primeiro item escaneado foi um chiclete Wrigley, em 1974.",
        "Woodland se inspirou no Morse ao desenhar as primeiras linhas na areia.",
        "O padrão EAN-13 tem um dígito verificador para detectar erros.",
      ],
      summary: "Código de barras usa larguras de listras para representar dígitos, lidos por luz.",
    },
    quiz: [
      { prompt: "O código de barras foi inspirado em qual código?", options: ["Braille", "Morse", "ASCII", "Bacon"], answer: 1, explain: "Woodland se inspirou no Morse." },
      { prompt: "Qual foi o 1º produto escaneado?", options: ["Um livro", "Um chiclete", "Um refrigerante", "Uma carta"], answer: 1, explain: "Um pacote de chicletes Wrigley, em 1974." },
      { prompt: "O que o scanner mede?", options: ["Cor exata", "Largura das barras", "Peso", "Temperatura"], answer: 1, explain: "As larguras de barras e espaços." },
    ],
  },
];

function vigenere(text: string, key: string, encoding: boolean): string {
  const k = key.toUpperCase().replace(/[^A-Z]/g, "");
  if (!k) return text;
  let ki = 0;
  return text
    .split("")
    .map((ch) => {
      const i = ALPHA.indexOf(ch.toUpperCase());
      if (i < 0) return ch;
      const shift = ALPHA.indexOf(k[ki % k.length]) * (encoding ? 1 : -1);
      ki++;
      const res = shiftLetter(ch.toUpperCase(), shift);
      return ch === ch.toLowerCase() ? res.toLowerCase() : res;
    })
    .join("");
}

export const CODES_BY_ID: Record<string, CodeModule> = Object.fromEntries(
  CODES.map((c) => [c.id, c]),
);

export function getCode(id: string): CodeModule | undefined {
  return CODES_BY_ID[id];
}
