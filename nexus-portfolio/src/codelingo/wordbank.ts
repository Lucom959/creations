/**
 * Banco de palavras + ordem de introdução de letras para o currículo
 * progressivo (estilo Duolingo). A ideia central: cada lição da "família de
 * letras" libera 2-4 símbolos novos; o banco é filtrado dinamicamente para
 * cada estágio, então só aparecem palavras reais 100% formadas por letras
 * já ensinadas. Nunca há uma lista fixa por lição — a mesma lista serve
 * para todos os estágios, e o conjunto de letras conhecidas decide o que
 * fica disponível.
 */

/**
 * Ordem de introdução das letras, pensada para liberar palavras reais em
 * português o quanto antes (A, T, R, S primeiro, como no exemplo do Morse).
 */
export const LETTER_ORDER = [
  "A", "T", "R", "S", "O", "E", "M", "C", "N", "D",
  "I", "L", "U", "P", "G", "V", "H", "F", "B", "Q",
  "J", "X", "Z", "K", "W", "Y",
];

/** Quantas letras novas cada lição da trilha de letras introduz. */
export const CHUNK_SCHEDULE: string[][] = (() => {
  const sizes = [2, 2, 2, 2, 2, 2, 2, 2, 4, 6];
  const chunks: string[][] = [];
  let i = 0;
  for (const size of sizes) {
    chunks.push(LETTER_ORDER.slice(i, i + size));
    i += size;
  }
  return chunks;
})();

/** Letras cumulativas conhecidas até (e incluindo) o estágio `chunkIndex`. */
export function cumulativeLetters(chunkIndex: number): string[] {
  return CHUNK_SCHEDULE.slice(0, chunkIndex + 1).flat();
}

/**
 * Banco de palavras comuns em português (sem acentos/cedilha, para casar
 * com o alfabeto A-Z puro usado pelos motores de código). Não precisa ser
 * exaustivo: o filtro dinâmico garante que só aparecem palavras 100%
 * cobertas pelas letras já ensinadas, então a lista só precisa ter
 * cobertura razoável — quanto mais cedo as letras A,T,R,S,O,E,M,C entram,
 * mais palavras reais (RATO, MATO, TOMA, MESA, CASA, CARTA...) já aparecem.
 */
export const WORD_BANK = [
  "ATA", "ARARA", "ROTA", "ATOR", "RATO", "TARO", "SARA", "TERRA", "TORRE",
  "SORTE", "RESTO", "TESTE", "SORTE", "OESTE", "SERRA", "SETOR", "MOTOR",
  "MOTO", "MATO", "TOMA", "MATA", "MESA", "CASA", "CARTA", "COSTA", "CORTE",
  "MORTE", "MERA", "CETRO", "CARRO", "MARE", "MARCO", "CROMO", "CETRA",
  "SANTO", "CANTO", "DENTE", "DANDO", "NADA", "NADO", "MODA", "DOSE",
  "DOSE", "SONDA", "CANOA", "SODA", "CODA", "CEDO", "DANO", "TANTO",
  "DINDO", "TIME", "RIME", "TREINO", "TRINO", "IRMAO", "LIMA", "LIME",
  "MIL", "LUAR", "LUA", "AZUL", "SUL", "TUDO", "UNIDO", "LINDO", "MULA",
  "PARTO", "PORTA", "PATO", "PRATO", "PASTA", "PONTE", "POTE", "SAPO",
  "GATO", "GARRA", "GRAMA", "GALO", "AGUA", "VIDA", "VIDRO", "VELA",
  "VOAR", "AVE", "OVO", "HORA", "HOTEL", "HAVER", "FALA", "FOTO", "FADA",
  "FIO", "FIM", "BOLA", "BOTA", "BEM", "BOM", "BALA",
  "REI", "SOL", "MAR", "PAZ", "LUZ", "FLOR", "CEU", "TERRA", "AGUA",
  "FOGO", "AR", "TEMPO", "DIA", "NOITE", "MUNDO", "VIDA", "AMOR",
  "CHAVE", "CODIGO", "SINAL", "REDE", "NODO", "DADO", "LOGIN", "SENHA",
];
