/**
 * CipherBot — tutor por regras (sem LLM).
 * Interpreta pedidos em linguagem natural e responde usando o motor de códigos:
 * codifica, decodifica, explica, dá dicas e cria mini-desafios.
 * (A integração com um LLM real fica como evolução futura.)
 */

import { CODES, getCode, CodeModule } from "./codes";

export interface BotReply {
  text: string;
  code?: string; // bloco monoespaçado opcional
}

function findCode(text: string): CodeModule | undefined {
  const t = text.toLowerCase();
  const aliases: Record<string, string> = {
    morse: "morse", binário: "binary", binario: "binary", ascii: "ascii",
    hex: "hex", hexadecimal: "hex", base64: "base64", "césar": "caesar",
    cesar: "caesar", vigenère: "vigenere", vigenere: "vigenere",
    braille: "braille", nato: "nato", fonético: "nato", fonetico: "nato",
    tap: "tap", pigpen: "pigpen", bacon: "bacon", atbash: "atbash",
    rot13: "rot13", gray: "gray", octal: "octal", unicode: "unicode",
    semáforo: "semaphore", semaforo: "semaphore", qr: "qr", barras: "barcode",
  };
  for (const [alias, id] of Object.entries(aliases)) {
    if (t.includes(alias)) return getCode(id);
  }
  return undefined;
}

function extractPayload(text: string): string {
  // pega conteúdo entre aspas, senão a última "palavra grande"
  const q = text.match(/["'“”'](.+?)["'“”']/);
  if (q) return q[1];
  const after = text.match(/(?::|->|=>|→)\s*(.+)$/);
  if (after) return after[1].trim();
  return "";
}

export function askCipherBot(input: string): BotReply {
  const text = input.trim();
  const lower = text.toLowerCase();

  if (!text) {
    return { text: "Manda a sua dúvida! Posso codificar, decodificar, explicar qualquer código ou te dar um desafio. Ex.: \"codifique 'NEXUS' em morse\"." };
  }

  // Saudação / ajuda
  if (/\b(oi|olá|ola|help|ajuda|começar|comecar)\b/.test(lower) && text.length < 20) {
    return {
      text: "Olá! Sou o CipherBot 🤖. Tente coisas como:\n• \"codifique 'CODE' em binário\"\n• \"decodifique -.-. --- -.. . do morse\"\n• \"explique a cifra de césar\"\n• \"me dê um desafio de vigenère\"",
    };
  }

  const code = findCode(text);

  // Explicar
  if (/\bexplic|como funciona|o que é|o que e|história|historia\b/.test(lower)) {
    if (!code) return { text: "Sobre qual código? Ex.: \"explique o base64\"." };
    return {
      text: `**${code.name}** — ${code.tagline}\n\n${code.content.howItWorks}\n\n🕰️ Origem: ${code.content.origin} Inventor: ${code.content.inventor}\n\n💡 ${code.content.curiosities[0]}`,
      code: code.alphabetHint,
    };
  }

  // Desafio
  if (/\bdesafi|challenge|quiz|pergunta\b/.test(lower)) {
    const c = code ?? CODES[Math.floor(Math.random() * CODES.length)];
    const q = c.quiz[Math.floor(Math.random() * c.quiz.length)];
    return {
      text: `Desafio de **${c.name}**:\n\n${q.prompt}\n\n${q.options.map((o, i) => `${String.fromCharCode(65 + i)}) ${o}`).join("\n")}\n\n(Responda a letra — eu confirmo!)`,
    };
  }

  // Codificar
  if (/\bcodifi|encode|criptograf|transform/.test(lower)) {
    if (!code || !code.encode) return { text: "Diga o código e o texto. Ex.: \"codifique 'OI' em morse\"." };
    const payload = extractPayload(text) || guessLastWord(text);
    if (!payload) return { text: `Qual texto você quer codificar em ${code.name}? Coloque entre aspas.` };
    return { text: `Em **${code.name}**, "${payload}" fica:`, code: code.encode(payload) };
  }

  // Decodificar
  if (/\bdecodifi|decode|descriptograf|traduz|o que (diz|significa)\b/.test(lower)) {
    if (!code || !code.decode) return { text: "Diga o código e o conteúdo a decodificar. Ex.: \"decodifique 01001000 do binário\"." };
    const payload = extractPayload(text) || stripCommand(text, code);
    if (!payload) return { text: `Cole o conteúdo em ${code.name} que eu decodifico.` };
    try {
      const dec = code.decode(payload);
      return { text: `Decodificando de **${code.name}**:`, code: dec || "(não consegui ler — confira o formato)" };
    } catch {
      return { text: "Hmm, não consegui decodificar. Confere se o formato está certo?" };
    }
  }

  // Dica
  if (/\bdica|hint|ajuda com\b/.test(lower)) {
    if (!code) return { text: "Posso dar dica de qualquer código — diga qual. Ex.: \"dica de morse\"." };
    return { text: `Dica de ${code.name}: ${code.content.encodeGuide}`, code: code.alphabetHint };
  }

  // Menção a código sem verbo claro → explica
  if (code) {
    return {
      text: `Quer **codificar**, **decodificar**, **explicar** ou um **desafio** de ${code.name}? É só pedir.`,
      code: code.alphabetHint,
    };
  }

  return {
    text: "Não entendi 100%, mas posso: codificar, decodificar, explicar códigos ou criar desafios. Ex.: \"codifique 'NEXUS' em hexadecimal\".",
  };
}

function guessLastWord(text: string): string {
  const words = text.replace(/[?.!]/g, "").split(/\s+/);
  const stop = new Set(["em", "para", "de", "no", "na", "o", "a", "codifique", "codificar", "morse", "binário", "binario"]);
  for (let i = words.length - 1; i >= 0; i--) {
    if (!stop.has(words[i].toLowerCase()) && words[i].length >= 2) return words[i];
  }
  return "";
}

function stripCommand(text: string, code: CodeModule): string {
  return text
    .replace(/decodifique|decodificar|decode|do|de|em|para/gi, " ")
    .replace(new RegExp(code.name, "gi"), " ")
    .trim();
}
