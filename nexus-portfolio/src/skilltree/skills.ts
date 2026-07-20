/**
 * SkillTree — banco de dados de domínios e habilidades.
 * Conteúdo compacto porém real e específico por habilidade (não genérico):
 * o que é, por que importa, onde é usado no mercado, como aprender do zero,
 * pré-requisitos, tempo estimado, erros comuns, documentação oficial real.
 *
 * Faixas salariais são estimativas aproximadas (mercado brasileiro, nível
 * júnior/pleno) — variam muito por região, empresa e senioridade; não são
 * dados estatísticos oficiais, apenas uma referência de ordem de grandeza.
 */

export type Difficulty = 1 | 2 | 3 | 4 | 5;

export interface DocLink {
  label: string;
  url: string;
}

export interface QuizQuestion {
  prompt: string;
  options: string[];
  answer: number;
  explain: string;
}

export interface SkillProject {
  title: string;
  description: string;
  deliverables: string[];
}

export interface Skill {
  id: string;
  name: string;
  icon: string;
  domainId: string;
  parentId?: string;
  difficulty: Difficulty;
  xp: number;
  timeEstimate: string;
  prerequisites: string[];
  market: string;
  salaryRange?: string;
  what: string;
  why: string;
  how: string;
  commonMistakes: string[];
  docs: DocLink[];
  project?: SkillProject;
  quiz: QuizQuestion[];
}

export interface Domain {
  id: string;
  name: string;
  icon: string;
  color: string; // matiz de destaque (hex) usada nos nós desse domínio
  description: string;
}

export const DOMAINS: Domain[] = [
  { id: "programacao", name: "Programação Web", icon: "💻", color: "#5B8CFF", description: "A base de tudo: HTML, CSS, JavaScript, Node e mais." },
  { id: "ia", name: "IA & Dados", icon: "🤖", color: "#B06BFF", description: "Python aplicado a inteligência artificial e aprendizado de máquina." },
  { id: "eletronica", name: "Eletrônica & Robótica", icon: "🔧", color: "#22D3EE", description: "Arduino, robótica e Internet das Coisas." },
  { id: "cybersecurity", name: "Cibersegurança", icon: "🛡️", color: "#FF5B7A", description: "Fundamentos de segurança, redes e criptografia." },
  { id: "design", name: "Design", icon: "🎨", color: "#FF9F5B", description: "Design gráfico e experiência do usuário (UI/UX)." },
  { id: "modelagem3d", name: "Modelagem & Impressão 3D", icon: "🧊", color: "#5BFFB0", description: "Do modelo 3D à peça impressa." },
  { id: "jogos", name: "Desenvolvimento de Jogos", icon: "🎮", color: "#C084FC", description: "Unity e Unreal Engine." },
  { id: "mobile", name: "Desenvolvimento Mobile", icon: "📱", color: "#60A5FA", description: "Apps para Android e iOS." },
  { id: "dados-infra", name: "Dados & Infraestrutura", icon: "🗄️", color: "#38BDF8", description: "Banco de dados, redes, Linux, Git e nuvem." },
];

const SALARY_DEV_JR = "R$ 2.500 – R$ 5.500/mês (júnior, estimativa)";
const SALARY_DEV_PL = "R$ 5.000 – R$ 10.000/mês (pleno, estimativa)";

export const SKILLS: Skill[] = [
  // ---------------------------------------------------------------- HTML
  {
    id: "html", name: "HTML", icon: "📄", domainId: "programacao", difficulty: 1, xp: 80,
    timeEstimate: "1–2 semanas", prerequisites: [],
    market: "Todo site e aplicação web usa HTML como estrutura — é o ponto de entrada universal do desenvolvimento web.",
    salaryRange: SALARY_DEV_JR,
    what: "HTML (HyperText Markup Language) é a linguagem de marcação que estrutura o conteúdo de qualquer página web: títulos, parágrafos, imagens, links e formulários.",
    why: "Sem HTML não existe página web. É o primeiro passo de qualquer trilha de programação para a internet, e continua relevante mesmo com frameworks modernos.",
    how: "Comece escrevendo páginas estáticas simples à mão (sem editores visuais). Aprenda as tags semânticas (header, main, section, article) antes de partir para CSS.",
    commonMistakes: ["Usar <div> para tudo em vez de tags semânticas.", "Esquecer o atributo alt em imagens, prejudicando acessibilidade."],
    docs: [{ label: "MDN Web Docs — HTML", url: "https://developer.mozilla.org/pt-BR/docs/Web/HTML" }, { label: "freeCodeCamp", url: "https://www.freecodecamp.org/" }],
    project: { title: "Página pessoal", description: "Uma página HTML puro com sua bio, foto, links e uma lista de interesses.", deliverables: ["Estrutura semântica (header/main/footer)", "Pelo menos 1 imagem com alt", "Um link externo e um link interno (âncora)"] },
    quiz: [
      { prompt: "Qual tag define o conteúdo principal de uma página?", options: ["<div>", "<main>", "<body>", "<content>"], answer: 1, explain: "<main> é a tag semântica para o conteúdo principal." },
      { prompt: "Para que serve o atributo alt em <img>?", options: ["Estilizar a imagem", "Texto alternativo para acessibilidade", "Definir o tamanho", "Nada"], answer: 1, explain: "alt descreve a imagem para leitores de tela e quando ela não carrega." },
    ],
  },
  // ---------------------------------------------------------------- CSS
  {
    id: "css", name: "CSS", icon: "🎨", domainId: "programacao", parentId: "html", difficulty: 1, xp: 100,
    timeEstimate: "2–4 semanas", prerequisites: ["html"],
    market: "Todo produto digital com interface visual — sites, e-mails, apps híbridos — depende de CSS para ficar apresentável.",
    salaryRange: SALARY_DEV_JR,
    what: "CSS (Cascading Style Sheets) controla a aparência visual do HTML: cores, espaçamento, tipografia, layout e animações.",
    why: "HTML sem CSS é só texto cru. CSS é o que transforma estrutura em produto visualmente profissional.",
    how: "Aprenda seletores e a cascata primeiro, depois box model, e só então parta para layout (Flexbox/Grid).",
    commonMistakes: ["Usar !important para resolver problemas de especificidade em vez de entender a cascata.", "Não entender o box-sizing e sofrer com larguras que não batem."],
    docs: [{ label: "MDN Web Docs — CSS", url: "https://developer.mozilla.org/pt-BR/docs/Web/CSS" }, { label: "CSS-Tricks", url: "https://css-tricks.com/" }],
    project: { title: "Landing Page", description: "Uma landing page de um produto fictício com hero, seção de recursos e rodapé.", deliverables: ["Layout responsivo básico", "Paleta de cores consistente", "Hover states nos botões"] },
    quiz: [
      { prompt: "O que a cascata do CSS decide?", options: ["A cor de fundo", "Qual regra vence em conflitos", "O idioma da página", "Nada"], answer: 1, explain: "A cascata resolve qual regra CSS tem prioridade quando há conflito." },
      { prompt: "O que box-sizing: border-box faz?", options: ["Remove a borda", "Inclui padding/borda na largura definida", "Centraliza o elemento", "Nada"], answer: 1, explain: "Evita que padding/borda somem à largura declarada, facilitando o layout." },
    ],
  },
  { id: "flexbox", name: "Flexbox", icon: "↔️", domainId: "programacao", parentId: "css", difficulty: 2, xp: 60, timeEstimate: "1 semana", prerequisites: ["css"],
    market: "Layout padrão para componentes de interface (barras de navegação, cards, formulários) em praticamente todo projeto front-end.",
    what: "Um modelo de layout unidimensional do CSS para distribuir espaço entre itens em uma linha ou coluna.",
    why: "Resolve alinhamento e distribuição de espaço de forma muito mais simples que floats/posicionamento manual.",
    how: "Pratique com o jogo Flexbox Froggy e depois recrie componentes reais (navbar, card) só com flex.",
    commonMistakes: ["Confundir justify-content (eixo principal) com align-items (eixo cruzado).", "Usar flex em tudo quando Grid seria mais adequado para layouts 2D."],
    docs: [{ label: "MDN — Flexbox", url: "https://developer.mozilla.org/pt-BR/docs/Web/CSS/CSS_flexible_box_layout" }],
    quiz: [{ prompt: "justify-content controla o quê?", options: ["Eixo cruzado", "Eixo principal", "A cor", "A fonte"], answer: 1, explain: "justify-content alinha itens ao longo do eixo principal do flex container." }] },
  { id: "grid", name: "CSS Grid", icon: "▦", domainId: "programacao", parentId: "css", difficulty: 2, xp: 60, timeEstimate: "1–2 semanas", prerequisites: ["css"],
    market: "Usado para layouts de página inteira e dashboards complexos, onde controle bidimensional (linhas e colunas) é necessário.",
    what: "Um modelo de layout bidimensional do CSS que organiza elementos em linhas e colunas simultaneamente.",
    why: "Permite criar layouts complexos de página (não só componentes) com muito menos código que técnicas antigas.",
    how: "Pratique com o jogo CSS Grid Garden e recrie o layout de um site de notícias real.",
    commonMistakes: ["Usar Grid para tudo, inclusive onde Flexbox seria mais simples.", "Esquecer de nomear áreas de grid em layouts complexos, tornando o CSS difícil de manter."],
    docs: [{ label: "MDN — CSS Grid", url: "https://developer.mozilla.org/pt-BR/docs/Web/CSS/CSS_grid_layout" }],
    quiz: [{ prompt: "Grid é um modelo de layout...", options: ["Unidimensional", "Bidimensional", "Tridimensional", "Nenhum"], answer: 1, explain: "Grid controla linhas E colunas ao mesmo tempo." }] },
  { id: "responsividade", name: "Responsividade", icon: "📐", domainId: "programacao", parentId: "css", difficulty: 2, xp: 70, timeEstimate: "1–2 semanas", prerequisites: ["css"],
    market: "Obrigatório em qualquer site profissional — mais da metade do tráfego web é mobile.",
    what: "Técnicas (media queries, unidades relativas, mobile-first) para que um site funcione bem em qualquer tamanho de tela.",
    why: "Um site que só funciona no desktop perde a maioria dos usuários reais.",
    how: "Adote mobile-first: desenhe para a tela pequena primeiro, depois adicione media queries para telas maiores.",
    commonMistakes: ["Testar só no navegador desktop redimensionado, sem testar em dispositivo real.", "Usar valores fixos em px onde unidades relativas (%, rem, vw) seriam mais robustas."],
    docs: [{ label: "MDN — Design Responsivo", url: "https://developer.mozilla.org/pt-BR/docs/Learn/CSS/CSS_layout/Responsive_Design" }],
    quiz: [{ prompt: "O que é a abordagem 'mobile-first'?", options: ["Só fazer para mobile", "Desenhar para telas pequenas primeiro", "Ignorar desktop", "Usar apenas apps"], answer: 1, explain: "Começa pelo layout mobile e expande para telas maiores." }] },
  // ---------------------------------------------------------------- JavaScript
  { id: "javascript", name: "JavaScript", icon: "⚡", domainId: "programacao", parentId: "html", difficulty: 3, xp: 150, timeEstimate: "1–3 meses", prerequisites: ["html", "css"],
    market: "A única linguagem que roda nativamente em todo navegador — essencial para qualquer interatividade web, e hoje também usada no back-end (Node.js).",
    salaryRange: SALARY_DEV_PL,
    what: "A linguagem de programação que dá comportamento e interatividade às páginas web: cliques, formulários, animações, requisições de dados.",
    why: "É o que transforma uma página estática em uma aplicação de verdade. Também é a base de React, Node.js e a maioria dos frameworks modernos.",
    how: "Aprenda a sintaxe básica (variáveis, funções, arrays/objetos) antes de qualquer framework. Só depois avance para DOM, eventos e assincronismo.",
    commonMistakes: ["Pular direto para React sem entender JavaScript puro primeiro.", "Confundir == com === e sofrer com comparações de tipo inesperadas."],
    docs: [{ label: "MDN — JavaScript", url: "https://developer.mozilla.org/pt-BR/docs/Web/JavaScript" }, { label: "JavaScript.info", url: "https://javascript.info/" }],
    project: { title: "Calculadora", description: "Uma calculadora funcional com interface HTML/CSS e lógica em JavaScript puro.", deliverables: ["Quatro operações básicas", "Tratamento de divisão por zero", "Botão de limpar"] },
    quiz: [
      { prompt: "Qual a diferença entre == e ===?", options: ["Nenhuma", "=== compara tipo e valor", "== é mais rápido", "=== não existe"], answer: 1, explain: "=== não faz conversão de tipo; == sim, o que pode gerar bugs sutis." },
      { prompt: "O que é 'hoisting' em JavaScript?", options: ["Um tipo de dado", "Declarações sendo movidas para o topo do escopo", "Um erro comum", "Um framework"], answer: 1, explain: "var e function declarations são 'içadas' para o topo do escopo em tempo de compilação." },
    ] },
  { id: "dom", name: "DOM", icon: "🌳", domainId: "programacao", parentId: "javascript", difficulty: 2, xp: 70, timeEstimate: "1–2 semanas", prerequisites: ["javascript"],
    market: "Toda manipulação de página via JavaScript passa pelo DOM — base de qualquer interação sem framework.",
    what: "O Document Object Model é a representação em árvore do HTML que o JavaScript pode ler e modificar em tempo real.",
    why: "Entender o DOM é o que permite criar interfaces dinâmicas sem depender de um framework para tudo.",
    how: "Pratique selecionando elementos (querySelector) e alterando conteúdo/estilo diretamente, sem bibliotecas.",
    commonMistakes: ["Manipular o DOM excessivamente em loops, causando lentidão (reflow constante).", "Esquecer que scripts no <head> rodam antes do DOM existir, causando erros de elemento nulo."],
    docs: [{ label: "MDN — Manipulando documentos", url: "https://developer.mozilla.org/pt-BR/docs/Web/API/Document_Object_Model" }],
    quiz: [{ prompt: "O que querySelector retorna?", options: ["Um array", "O primeiro elemento que casa com o seletor", "Um número", "Nada"], answer: 1, explain: "querySelector retorna o primeiro elemento correspondente (ou null)." }] },
  { id: "eventos", name: "Eventos", icon: "🖱️", domainId: "programacao", parentId: "javascript", difficulty: 2, xp: 60, timeEstimate: "1 semana", prerequisites: ["dom"],
    market: "Qualquer interação do usuário (clique, digitação, scroll) é capturada via eventos — fundamental em qualquer app web.",
    what: "O sistema que permite ao JavaScript 'escutar' e reagir a ações do usuário ou do navegador (cliques, teclas, carregamento).",
    why: "Sem eventos, uma página não reage a nada que o usuário faça.",
    how: "Use addEventListener em vez de atributos inline (onclick=...) e aprenda sobre propagação de eventos (bubbling).",
    commonMistakes: ["Usar atributos onclick inline, que dificultam manutenção.", "Não entender event bubbling e ter listeners disparando em cascata inesperadamente."],
    docs: [{ label: "MDN — Eventos", url: "https://developer.mozilla.org/pt-BR/docs/Web/Events" }],
    quiz: [{ prompt: "Qual o método recomendado para escutar eventos?", options: ["onclick inline", "addEventListener", "eval()", "setTimeout"], answer: 1, explain: "addEventListener é a forma moderna e flexível de escutar eventos." }] },
  { id: "apis", name: "APIs & Fetch", icon: "🔌", domainId: "programacao", parentId: "javascript", difficulty: 3, xp: 90, timeEstimate: "1–2 semanas", prerequisites: ["javascript"],
    market: "Toda aplicação que busca dados externos (clima, produtos, autenticação) consome APIs — habilidade essencial em qualquer front-end.",
    what: "Consumir APIs significa buscar e enviar dados para servidores externos via HTTP, normalmente em formato JSON.",
    why: "Quase nenhuma aplicação real funciona isolada — todas trocam dados com algum servidor.",
    how: "Comece consumindo uma API pública gratuita (ex.: uma API de piadas ou clima) com fetch() e exibindo o resultado na tela.",
    commonMistakes: ["Esquecer de tratar erros de rede (try/catch) e a aplicação quebrar silenciosamente.", "Não entender que fetch() é assíncrono e tentar usar o resultado antes dele chegar."],
    docs: [{ label: "MDN — Fetch API", url: "https://developer.mozilla.org/pt-BR/docs/Web/API/Fetch_API" }],
    quiz: [{ prompt: "fetch() retorna o quê?", options: ["O dado direto", "Uma Promise", "Um erro", "Nada"], answer: 1, explain: "fetch() é assíncrono e retorna uma Promise que resolve com a resposta." }] },
  { id: "async", name: "Async/Await", icon: "⏳", domainId: "programacao", parentId: "javascript", difficulty: 3, xp: 90, timeEstimate: "2 semanas", prerequisites: ["apis"],
    market: "Todo código que lida com rede, banco de dados ou temporizadores em JavaScript moderno usa async/await.",
    what: "Sintaxe que torna código assíncrono (baseado em Promises) mais fácil de ler, parecendo código síncrono comum.",
    why: "Evita o 'callback hell' e torna fluxos assíncronos complexos muito mais legíveis e fáceis de depurar.",
    how: "Reescreva um .then() encadeado usando async/await e compare a legibilidade.",
    commonMistakes: ["Esquecer o await e receber uma Promise pendente em vez do valor resolvido.", "Não usar try/catch ao redor de await, deixando erros de rede sem tratamento."],
    docs: [{ label: "MDN — async function", url: "https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Statements/async_function" }],
    quiz: [{ prompt: "await só pode ser usado dentro de...", options: ["Qualquer função", "Uma função async", "Um loop", "Uma classe"], answer: 1, explain: "await é válido apenas dentro de funções declaradas como async." }] },
  { id: "react", name: "React", icon: "⚛️", domainId: "programacao", parentId: "javascript", difficulty: 4, xp: 180, timeEstimate: "1–2 meses", prerequisites: ["dom", "async"],
    market: "Uma das bibliotecas front-end mais usadas no mundo — Meta, Netflix, Airbnb e milhares de empresas a utilizam.",
    salaryRange: SALARY_DEV_PL,
    what: "Uma biblioteca JavaScript para construir interfaces através de componentes reutilizáveis e um estado reativo.",
    why: "Organiza aplicações grandes de forma muito mais sustentável que JavaScript puro manipulando DOM manualmente.",
    how: "Aprenda componentes e props primeiro, depois estado (useState) e efeitos (useEffect). Construa vários projetos pequenos antes de um grande.",
    commonMistakes: ["Colocar estado em componentes demais em vez de elevá-lo (lifting state up) quando necessário.", "Esquecer o array de dependências do useEffect, causando loops infinitos ou dados desatualizados."],
    docs: [{ label: "React — documentação oficial", url: "https://react.dev/" }],
    project: { title: "Clone do Spotify (interface)", description: "Uma interface inspirada no Spotify consumindo uma API de músicas fictícia ou mock local.", deliverables: ["Lista de faixas com componentes reutilizáveis", "Player com estado (play/pause)", "Busca com filtro em tempo real"] },
    quiz: [
      { prompt: "useState serve para quê?", options: ["Estilizar componentes", "Guardar estado local do componente", "Fazer requisições", "Rotear páginas"], answer: 1, explain: "useState cria e gerencia estado reativo dentro de um componente." },
      { prompt: "Quando useEffect roda por padrão?", options: ["Nunca", "Após toda renderização (sem array de deps)", "Só uma vez sempre", "Antes da renderização"], answer: 1, explain: "Sem array de dependências, useEffect roda após cada render." },
    ] },
  { id: "node", name: "Node.js", icon: "🟢", domainId: "programacao", parentId: "javascript", difficulty: 3, xp: 130, timeEstimate: "3–5 semanas", prerequisites: ["javascript", "async"],
    market: "Usado no back-end de empresas como Netflix, PayPal e Uber — permite usar JavaScript também no servidor.",
    salaryRange: SALARY_DEV_PL,
    what: "Um ambiente de execução que roda JavaScript fora do navegador, geralmente usado para construir servidores e APIs.",
    why: "Permite usar a mesma linguagem no front-end e back-end, reduzindo a curva de aprendizado para full-stack.",
    how: "Construa uma API REST simples com Express: rotas GET/POST, e depois adicione persistência de dados.",
    commonMistakes: ["Bloquear o event loop com operações síncronas pesadas.", "Não validar dados de entrada nas rotas, abrindo brechas de segurança."],
    docs: [{ label: "Node.js — documentação oficial", url: "https://nodejs.org/docs/latest/api/" }],
    project: { title: "API REST", description: "Uma API REST simples de tarefas (to-do list) com rotas para criar, listar, atualizar e apagar itens.", deliverables: ["4 rotas (CRUD)", "Validação básica de entrada", "Respostas com status HTTP corretos"] },
    quiz: [{ prompt: "Node.js roda JavaScript onde?", options: ["Só no navegador", "Fora do navegador (servidor)", "Só no celular", "Em nenhum lugar"], answer: 1, explain: "Node.js é um runtime que executa JS no servidor/máquina local." }] },
  // ---------------------------------------------------------------- Python
  { id: "python", name: "Python", icon: "🐍", domainId: "programacao", difficulty: 2, xp: 120, timeEstimate: "1–2 meses", prerequisites: [],
    market: "Uma das linguagens mais usadas no mundo — automação, ciência de dados, IA, back-end e scripts em geral.",
    salaryRange: SALARY_DEV_JR,
    what: "Uma linguagem de programação de propósito geral, conhecida pela sintaxe simples e legível, muito usada para iniciantes.",
    why: "É a porta de entrada mais suave para programação, e ao mesmo tempo a linguagem dominante em IA e ciência de dados.",
    how: "Aprenda a sintaxe básica escrevendo pequenos scripts (calculadora, jogo de adivinhação) antes de qualquer biblioteca.",
    commonMistakes: ["Misturar espaços e tabs na indentação, causando erros silenciosos.", "Não usar ambientes virtuais (venv), gerando conflito de versões entre projetos."],
    docs: [{ label: "Python — documentação oficial", url: "https://docs.python.org/pt-br/3/" }],
    quiz: [{ prompt: "Como o Python define blocos de código?", options: ["Chaves {}", "Indentação", "Ponto e vírgula", "Parênteses"], answer: 1, explain: "Python usa indentação (espaços) para delimitar blocos, ao invés de chaves." }] },
  { id: "variaveis", name: "Variáveis & Tipos", icon: "🔤", domainId: "programacao", parentId: "python", difficulty: 1, xp: 40, timeEstimate: "3–5 dias", prerequisites: ["python"],
    market: "Fundamento usado em absolutamente qualquer programa Python.",
    what: "Como armazenar e nomear dados (números, texto, booleanos) em um programa.",
    why: "É o vocabulário mais básico da programação — sem isso nada mais funciona.",
    how: "Pratique declarando variáveis de tipos diferentes e usando type() para investigar cada uma.",
    commonMistakes: ["Usar nomes de variável não descritivos (x, a, temp).", "Confundir listas mutáveis com tuplas imutáveis."],
    docs: [{ label: "Python — Tipos de dados", url: "https://docs.python.org/pt-br/3/library/stdtypes.html" }],
    quiz: [{ prompt: "Qual tipo é imutável em Python?", options: ["list", "dict", "tuple", "set"], answer: 2, explain: "Tuplas não podem ser modificadas após criadas." }] },
  { id: "loops", name: "Loops", icon: "🔁", domainId: "programacao", parentId: "python", difficulty: 1, xp: 50, timeEstimate: "1 semana", prerequisites: ["variaveis"],
    market: "Usado em qualquer processamento de listas, arquivos ou dados repetitivos.",
    what: "Estruturas (for, while) que repetem um bloco de código múltiplas vezes.",
    why: "Automatizar repetição é literalmente o propósito de programar em vez de fazer tudo manualmente.",
    how: "Pratique iterando sobre listas, somando valores e criando um loop com condição de parada (while).",
    commonMistakes: ["Criar loops infinitos por esquecer de atualizar a condição em while.", "Usar range(len(lista)) quando poderia iterar direto sobre a lista."],
    docs: [{ label: "Python — Controle de fluxo", url: "https://docs.python.org/pt-br/3/tutorial/controlflow.html" }],
    quiz: [{ prompt: "Qual loop é melhor para 'repita enquanto uma condição for verdadeira'?", options: ["for", "while", "if", "def"], answer: 1, explain: "while repete enquanto a condição continuar verdadeira." }] },
  { id: "funcoes", name: "Funções", icon: "🧩", domainId: "programacao", parentId: "python", difficulty: 2, xp: 60, timeEstimate: "1 semana", prerequisites: ["loops"],
    market: "Toda base de código organizada em qualquer linguagem depende de funções bem projetadas.",
    what: "Blocos de código reutilizáveis que recebem entradas (parâmetros) e podem devolver um resultado.",
    why: "Evita repetição de código e é o primeiro passo para pensar em programas maiores de forma organizada.",
    how: "Refatore um script que você já escreveu extraindo partes repetidas em funções nomeadas.",
    commonMistakes: ["Funções fazendo coisas demais em vez de uma responsabilidade clara.", "Esquecer o return e a função retornar None sem querer."],
    docs: [{ label: "Python — Definindo funções", url: "https://docs.python.org/pt-br/3/tutorial/controlflow.html#defining-functions" }],
    quiz: [{ prompt: "O que uma função retorna se não tiver 'return'?", options: ["Erro", "0", "None", "Uma string vazia"], answer: 2, explain: "Sem return explícito, a função retorna None." }] },
  { id: "cpp", name: "C++", icon: "🔵", domainId: "programacao", difficulty: 4, xp: 150, timeEstimate: "2–4 meses", prerequisites: [],
    market: "Usado em sistemas de alta performance: jogos (Unreal Engine), sistemas embarcados, trading de alta frequência.",
    salaryRange: SALARY_DEV_PL,
    what: "Uma linguagem compilada de baixo nível com controle direto de memória, usada onde performance é crítica.",
    why: "Ensina como computadores realmente funcionam (memória, ponteiros) de um jeito que linguagens de alto nível escondem.",
    how: "Aprenda sintaxe básica e depois dedique tempo extra a ponteiros — é o conceito que mais trava iniciantes.",
    commonMistakes: ["Vazar memória por esquecer de liberar o que foi alocado manualmente.", "Confundir ponteiro com o valor que ele aponta."],
    docs: [{ label: "cppreference.com", url: "https://en.cppreference.com/w/" }],
    quiz: [{ prompt: "C++ é uma linguagem...", options: ["Interpretada", "Compilada", "Só para web", "Sem tipos"], answer: 1, explain: "C++ é compilada para código de máquina antes de executar." }] },
  { id: "ponteiros", name: "Ponteiros", icon: "👉", domainId: "programacao", parentId: "cpp", difficulty: 4, xp: 90, timeEstimate: "2–3 semanas", prerequisites: ["cpp"],
    market: "Fundamental em sistemas embarcados, drivers e qualquer software que exige controle fino de memória.",
    what: "Variáveis que armazenam o endereço de memória de outra variável, em vez do valor diretamente.",
    why: "É o conceito que separa C/C++ de linguagens de alto nível — entendê-lo profundamente muda como você pensa sobre memória.",
    how: "Desenhe a memória no papel: variável, endereço, ponteiro apontando para o endereço. Pratique com exemplos pequenos antes de estruturas complexas.",
    commonMistakes: ["Usar um ponteiro após liberar sua memória (dangling pointer).", "Confundir * (desreferenciar) com & (obter endereço)."],
    docs: [{ label: "cppreference — Ponteiros", url: "https://en.cppreference.com/w/cpp/language/pointer" }],
    quiz: [{ prompt: "O operador & faz o quê?", options: ["Desreferencia", "Obtém o endereço de memória", "Soma", "Compara"], answer: 1, explain: "& retorna o endereço de memória de uma variável." }] },
  { id: "stl", name: "STL", icon: "📦", domainId: "programacao", parentId: "cpp", difficulty: 3, xp: 80, timeEstimate: "2 semanas", prerequisites: ["cpp"],
    market: "Usada em praticamente todo código C++ profissional para evitar reinventar estruturas de dados.",
    what: "A Standard Template Library: uma coleção de estruturas de dados (vector, map, set) e algoritmos prontos do C++.",
    why: "Evita reimplementar listas e mapas do zero, e é otimizada e testada por décadas.",
    how: "Substitua arrays manuais por std::vector nos seus exercícios e explore std::map para pares chave-valor.",
    commonMistakes: ["Reimplementar uma lista ligada quando std::vector já resolveria.", "Não entender a complexidade (Big O) das operações de cada estrutura."],
    docs: [{ label: "cppreference — Containers", url: "https://en.cppreference.com/w/cpp/container" }],
    quiz: [{ prompt: "std::vector é equivalente a que estrutura?", options: ["Array dinâmico", "Fila fixa", "Árvore", "Nada"], answer: 0, explain: "vector é um array dinâmico que cresce automaticamente." }] },
  { id: "classes", name: "Classes & OOP", icon: "🏛️", domainId: "programacao", parentId: "cpp", difficulty: 3, xp: 90, timeEstimate: "2–3 semanas", prerequisites: ["cpp"],
    market: "Programação orientada a objetos é usada na maioria dos softwares comerciais de médio/grande porte.",
    what: "Um paradigma que organiza código em torno de objetos com dados (atributos) e comportamentos (métodos).",
    why: "Ajuda a modelar sistemas complexos de forma mais próxima de como pensamos sobre o mundo real.",
    how: "Modele algo simples do mundo real (uma conta bancária, um veículo) como classe, com atributos e métodos.",
    commonMistakes: ["Criar hierarquias de herança profundas demais e difíceis de manter.", "Deixar todos os atributos públicos, quebrando encapsulamento."],
    docs: [{ label: "cppreference — Classes", url: "https://en.cppreference.com/w/cpp/language/classes" }],
    quiz: [{ prompt: "O que é encapsulamento?", options: ["Herança múltipla", "Esconder detalhes internos do objeto", "Um tipo de loop", "Nada"], answer: 1, explain: "Encapsulamento protege o estado interno, expondo só o necessário." }] },

  // ---------------------------------------------------------------- IA & Dados
  { id: "inteligencia-artificial", name: "Inteligência Artificial", icon: "🤖", domainId: "ia", difficulty: 4, xp: 160, timeEstimate: "2–3 meses", prerequisites: ["python"],
    market: "Uma das áreas mais aquecidas do mercado de tecnologia — presente em produtos de praticamente toda grande empresa de tech.",
    salaryRange: "R$ 6.000 – R$ 15.000/mês (estimativa, varia muito com especialização)",
    what: "O campo que cria sistemas capazes de tarefas que normalmente exigiriam inteligência humana: reconhecer padrões, gerar texto, tomar decisões.",
    why: "Está transformando praticamente todo setor da economia — entender os fundamentos é cada vez mais valioso.",
    how: "Comece com estatística básica e Python, depois aprenda machine learning clássico antes de partir para redes neurais.",
    commonMistakes: ["Pular direto para deep learning sem entender machine learning clássico e estatística básica.", "Treinar um modelo sem separar dados de treino e teste, gerando resultados enganosos."],
    docs: [{ label: "Kaggle Learn (gratuito)", url: "https://www.kaggle.com/learn" }, { label: "TensorFlow — Tutoriais", url: "https://www.tensorflow.org/tutorials" }],
    project: { title: "Chatbot", description: "Um chatbot simples baseado em regras ou em um modelo de classificação de intenções básico.", deliverables: ["Reconhece pelo menos 5 intenções diferentes", "Responde de forma coerente", "Trata entradas não reconhecidas com uma resposta padrão"] },
    quiz: [{ prompt: "Por que separar dados em treino e teste?", options: ["Não é necessário", "Para avaliar se o modelo generaliza bem", "Só por convenção", "Para economizar memória"], answer: 1, explain: "Testar com dados nunca vistos revela se o modelo realmente aprendeu ou só decorou." }] },
  { id: "machine-learning", name: "Machine Learning", icon: "📊", domainId: "ia", parentId: "inteligencia-artificial", difficulty: 5, xp: 140, timeEstimate: "2–3 meses", prerequisites: ["inteligencia-artificial"],
    market: "Base de recomendação de produtos, detecção de fraude, previsão de demanda — usado em praticamente todo setor com dados.",
    salaryRange: "R$ 8.000 – R$ 18.000/mês (estimativa)",
    what: "O subcampo da IA focado em algoritmos que aprendem padrões a partir de dados, sem serem explicitamente programados para cada regra.",
    why: "É a técnica por trás da maioria dos sistemas de IA aplicados hoje, de recomendação a diagnóstico médico assistido.",
    how: "Aprenda regressão linear e classificação primeiro (os fundamentos), usando bibliotecas como scikit-learn antes de redes neurais.",
    commonMistakes: ["Overfitting: o modelo decora os dados de treino e não generaliza.", "Ignorar a qualidade e o viés dos dados de entrada, que afetam o resultado mais que o algoritmo escolhido."],
    docs: [{ label: "scikit-learn — documentação", url: "https://scikit-learn.org/stable/" }],
    quiz: [{ prompt: "O que é overfitting?", options: ["O modelo é rápido demais", "O modelo decora os dados de treino e falha em dados novos", "Um tipo de dado", "Um erro de sintaxe"], answer: 1, explain: "Overfitting é quando o modelo memoriza em vez de generalizar." }] },

  // ---------------------------------------------------------------- Eletrônica & Robótica
  { id: "arduino", name: "Arduino", icon: "🔋", domainId: "eletronica", difficulty: 2, xp: 100, timeEstimate: "2–4 semanas", prerequisites: [],
    market: "Usado em prototipagem eletrônica, automação residencial, projetos educacionais e produtos de nicho (makers).",
    what: "Uma plataforma de hardware e software open-source para criar projetos eletrônicos interativos com sensores e atuadores.",
    why: "É a porta de entrada mais acessível para eletrônica e programação de hardware, com uma comunidade enorme.",
    how: "Comece com o clássico 'piscar um LED', depois avance para sensores simples (botão, potenciômetro) antes de projetos complexos.",
    commonMistakes: ["Ligar componentes sem resistores de proteção e queimar LEDs/sensores.", "Não verificar a polaridade de componentes antes de energizar o circuito."],
    docs: [{ label: "Arduino — documentação oficial", url: "https://docs.arduino.cc/" }],
    project: { title: "Semáforo Inteligente", description: "Um semáforo com LEDs que muda de estado automaticamente e reage a um sensor de presença.", deliverables: ["3 LEDs (vermelho/amarelo/verde) com temporização correta", "Um sensor de entrada (botão ou PIR)", "Código comentado explicando a lógica de estados"] },
    quiz: [{ prompt: "Para que serve um resistor em um circuito com LED?", options: ["Aumentar o brilho", "Limitar a corrente e proteger o LED", "Decoração", "Nada"], answer: 1, explain: "O resistor limita a corrente, evitando queimar o LED." }] },
  { id: "robotica", name: "Robótica", icon: "🦾", domainId: "eletronica", parentId: "arduino", difficulty: 4, xp: 150, timeEstimate: "2–4 meses", prerequisites: ["arduino"],
    market: "Indústria automotiva, manufatura, drones, robótica de serviço — área crescente com boa demanda técnica.",
    salaryRange: SALARY_DEV_PL,
    what: "A integração de mecânica, eletrônica e programação para criar máquinas capazes de interagir fisicamente com o ambiente.",
    why: "Combina praticamente todas as habilidades técnicas (hardware, software, física) em um único campo fascinante.",
    how: "Comece com um robô seguidor de linha simples usando Arduino — ele já ensina sensores, atuadores e lógica de controle.",
    commonMistakes: ["Subestimar a parte mecânica (atrito, folga) e focar só no código.", "Não calibrar sensores antes de confiar nas leituras deles."],
    docs: [{ label: "Arduino — Robótica", url: "https://docs.arduino.cc/" }],
    quiz: [{ prompt: "O que é um robô 'seguidor de linha'?", options: ["Um robô que voa", "Um robô que segue uma trilha usando sensores de luz", "Um robô estático", "Um tipo de IA"], answer: 1, explain: "Usa sensores infravermelhos para detectar e seguir uma linha traçada no chão." }] },
  { id: "iot", name: "IoT", icon: "📡", domainId: "eletronica", parentId: "arduino", difficulty: 3, xp: 110, timeEstimate: "3–5 semanas", prerequisites: ["arduino"],
    market: "Casas inteligentes, agricultura de precisão, monitoramento industrial — um dos setores de tecnologia que mais cresce.",
    what: "Internet das Coisas: dispositivos físicos conectados à internet, trocando dados entre si e com serviços na nuvem.",
    why: "Conecta o mundo físico ao digital, permitindo monitoramento e automação remota de praticamente qualquer coisa.",
    how: "Conecte um Arduino/ESP32 ao Wi-Fi e envie leituras de um sensor para um serviço na nuvem simples.",
    commonMistakes: ["Ignorar segurança básica, deixando dispositivos IoT vulneráveis na rede.", "Não considerar consumo de energia em projetos que precisam rodar com bateria."],
    docs: [{ label: "Arduino — IoT Cloud", url: "https://docs.arduino.cc/arduino-cloud/" }],
    quiz: [{ prompt: "O que caracteriza um dispositivo IoT?", options: ["Ser só um computador", "Estar conectado à internet trocando dados", "Não ter energia", "Ser sempre um robô"], answer: 1, explain: "IoT é sobre dispositivos físicos conectados trocando dados via internet." }] },

  // ---------------------------------------------------------------- Cybersecurity
  { id: "cyberseg-fundamentos", name: "Fundamentos de Cibersegurança", icon: "🛡️", domainId: "cybersecurity", difficulty: 2, xp: 100, timeEstimate: "2–4 semanas", prerequisites: [],
    market: "Toda empresa com presença digital precisa de segurança — uma das áreas de TI com maior déficit de profissionais.",
    salaryRange: SALARY_DEV_PL,
    what: "Os conceitos base de proteção de sistemas: ameaças comuns, princípios de defesa, e como pensar como um atacante para se proteger melhor.",
    why: "Segurança não é um recurso opcional — é responsabilidade de todo profissional de tecnologia, não só de especialistas.",
    how: "Aprenda os fundamentos de redes primeiro, depois pratique em ambientes legais e controlados (CTFs, laboratórios como TryHackMe).",
    commonMistakes: ["Praticar técnicas ofensivas em sistemas sem autorização — sempre use ambientes legais (CTFs, seus próprios laboratórios).", "Focar só em ataque e ignorar defesa, que é onde está a maior parte das vagas."],
    docs: [{ label: "OWASP — fundamentos", url: "https://owasp.org/" }, { label: "TryHackMe (prática legal)", url: "https://tryhackme.com/" }],
    quiz: [{ prompt: "O que é o princípio do menor privilégio?", options: ["Dar acesso total a todos", "Conceder apenas o acesso mínimo necessário", "Nunca usar senhas", "Desligar o firewall"], answer: 1, explain: "Reduz a superfície de ataque limitando permissões ao estritamente necessário." }] },
  { id: "criptografia", name: "Criptografia", icon: "🔐", domainId: "cybersecurity", parentId: "cyberseg-fundamentos", difficulty: 3, xp: 100, timeEstimate: "3–4 semanas", prerequisites: ["cyberseg-fundamentos"],
    market: "Base de toda comunicação segura na internet: HTTPS, mensagens, autenticação, blockchain.",
    what: "Técnicas matemáticas para proteger informação, garantindo confidencialidade, integridade e autenticidade.",
    why: "Sem criptografia, nenhuma transação online ou comunicação privada seria segura.",
    how: "Comece entendendo a diferença entre criptografia simétrica e assimétrica antes de qualquer implementação prática.",
    commonMistakes: ["Tentar 'inventar' seu próprio algoritmo de criptografia em vez de usar padrões testados.", "Armazenar senhas com hash sem 'salt', facilitando ataques de dicionário."],
    docs: [{ label: "OWASP — Cryptographic Storage", url: "https://owasp.org/www-project-cheat-sheets/" }],
    quiz: [{ prompt: "Qual a diferença entre criptografia simétrica e assimétrica?", options: ["Nenhuma", "Simétrica usa a mesma chave para cifrar/decifrar; assimétrica usa um par de chaves", "Assimétrica é mais fraca", "Simétrica não existe mais"], answer: 1, explain: "Simétrica: uma chave compartilhada. Assimétrica: chave pública + chave privada." }] },
  { id: "scanner-redes", name: "Segurança de Redes", icon: "📶", domainId: "cybersecurity", parentId: "cyberseg-fundamentos", difficulty: 3, xp: 110, timeEstimate: "3–5 semanas", prerequisites: ["cyberseg-fundamentos"],
    market: "Empresas de todos os portes precisam auditar e proteger suas redes contra acessos não autorizados.",
    what: "Técnicas para identificar dispositivos, portas e serviços expostos em uma rede, usadas tanto para defesa quanto para auditoria autorizada.",
    why: "Entender como um atacante mapeia uma rede é essencial para saber como protegê-la corretamente.",
    how: "Pratique SOMENTE em redes próprias ou laboratórios autorizados (nunca em redes de terceiros sem permissão explícita).",
    commonMistakes: ["Escanear redes sem autorização — isso é ilegal na maioria das jurisdições, mesmo com boa intenção.", "Confiar cegamente no resultado de uma ferramenta sem entender o que ela está realmente testando."],
    docs: [{ label: "OWASP Testing Guide", url: "https://owasp.org/www-project-web-security-testing-guide/" }],
    project: { title: "Scanner de portas (ambiente próprio)", description: "Um scanner simples que verifica quais portas estão abertas em uma máquina/rede DE SUA PROPRIEDADE.", deliverables: ["Varre um intervalo de portas configurável", "Identifica portas abertas/fechadas", "Usado apenas em ambiente próprio ou com autorização explícita"] },
    quiz: [{ prompt: "É legal escanear a rede de terceiros sem autorização?", options: ["Sim, sempre", "Não, é ilegal na maioria dos países", "Só se for rápido", "Depende do horário"], answer: 1, explain: "Escanear sistemas de terceiros sem autorização explícita é crime na maioria das jurisdições." }] },

  // ---------------------------------------------------------------- Design
  { id: "design-grafico", name: "Design Gráfico", icon: "🖌️", domainId: "design", difficulty: 2, xp: 90, timeEstimate: "3–6 semanas", prerequisites: [],
    market: "Toda marca, produto digital e material de marketing precisa de identidade visual profissional.",
    what: "Os princípios de composição visual: cor, tipografia, hierarquia e espaço, aplicados para comunicar uma mensagem.",
    why: "Um bom design não é 'deixar bonito' — é fazer a informação certa chegar mais claramente até a pessoa certa.",
    how: "Estude os fundamentos (teoria das cores, tipografia) e recrie designs existentes antes de criar os seus do zero.",
    commonMistakes: ["Usar mais de 2-3 fontes diferentes em uma mesma peça, gerando ruído visual.", "Ignorar contraste e hierarquia, deixando tudo com o mesmo peso visual."],
    docs: [{ label: "Figma — recursos gratuitos", url: "https://www.figma.com/resources/learn-design/" }],
    quiz: [{ prompt: "O que é hierarquia visual?", options: ["Ordenar por data", "Guiar o olhar do usuário pela importância dos elementos", "Usar só uma cor", "Nada"], answer: 1, explain: "Hierarquia visual organiza os elementos para guiar a atenção na ordem certa." }] },
  { id: "ui-ux", name: "UI/UX Design", icon: "🧭", domainId: "design", parentId: "design-grafico", difficulty: 3, xp: 120, timeEstimate: "1–2 meses", prerequisites: ["design-grafico"],
    market: "Toda empresa de produto digital (apps, sites, sistemas) contrata designers de UI/UX para melhorar conversão e retenção.",
    salaryRange: SALARY_DEV_PL,
    what: "UI (interface) é a aparência; UX (experiência) é como a pessoa se sente usando o produto — juntas, definem o design de produtos digitais.",
    why: "Um produto com boa funcionalidade mas má experiência perde usuários. Design é parte do produto, não decoração.",
    how: "Aprenda a fazer wireframes simples antes de qualquer ferramenta visual, e pratique observando pessoas reais usarem seus protótipos.",
    commonMistakes: ["Desenhar telas bonitas sem testar com usuários reais.", "Confundir UI (visual) com UX (experiência completa) como se fossem a mesma coisa."],
    docs: [{ label: "Google — Material Design", url: "https://m3.material.io/" }],
    quiz: [{ prompt: "UX foca principalmente em quê?", options: ["Só cores", "A experiência completa do usuário com o produto", "Só tipografia", "Só código"], answer: 1, explain: "UX abrange toda a jornada e sensação de uso, não só a aparência." }] },

  // ---------------------------------------------------------------- Modelagem & Impressão 3D
  { id: "modelagem-3d", name: "Modelagem 3D", icon: "🧊", domainId: "modelagem3d", difficulty: 3, xp: 110, timeEstimate: "1–2 meses", prerequisites: [],
    market: "Usado em jogos, animação, arquitetura, produtos físicos e efeitos visuais.",
    what: "A criação de objetos tridimensionais digitais usando software especializado, definindo forma, superfície e textura.",
    why: "É a base de qualquer objeto que depois vira jogo, animação ou peça impressa em 3D.",
    how: "Comece com um software gratuito (Blender) modelando formas simples antes de partir para objetos complexos.",
    commonMistakes: ["Modelar com topologia desorganizada (malha 'suja'), dificultando edições futuras.", "Ignorar a escala real do objeto, causando problemas na hora de imprimir ou animar."],
    docs: [{ label: "Blender — documentação e tutoriais", url: "https://www.blender.org/support/tutorials/" }],
    quiz: [{ prompt: "O que é 'topologia' em modelagem 3D?", options: ["A cor do modelo", "A organização da malha de polígonos", "O tamanho do arquivo", "Nada"], answer: 1, explain: "Topologia é como os polígonos da malha estão organizados e conectados." }] },
  { id: "impressao-3d", name: "Impressão 3D", icon: "🖨️", domainId: "modelagem3d", parentId: "modelagem-3d", difficulty: 2, xp: 90, timeEstimate: "2–3 semanas", prerequisites: ["modelagem-3d"],
    market: "Prototipagem rápida em produtos, peças de reposição, maker spaces e pequenas fabricações sob demanda.",
    what: "O processo de transformar um modelo 3D digital em um objeto físico, camada por camada, usando uma impressora 3D.",
    why: "Permite materializar rapidamente qualquer ideia modelada, sem depender de fabricação industrial tradicional.",
    how: "Comece imprimindo modelos prontos e simples para entender a máquina antes de imprimir seus próprios designs.",
    commonMistakes: ["Não nivelar a mesa da impressora corretamente, causando falhas na primeira camada.", "Escolher configurações de suporte inadequadas para modelos com partes suspensas."],
    docs: [{ label: "Documentação do fabricante da sua impressora", url: "https://www.prusa3d.com/guides/" }],
    project: { title: "Organizador modular", description: "Um organizador de mesa modelado e impresso em 3D, com peças que se encaixam.", deliverables: ["Modelo 3D próprio (não baixado)", "Peças que se encaixam corretamente", "Impressão física ou simulação de fatiamento (slicer)"] },
    quiz: [{ prompt: "O que o nivelamento da mesa evita?", options: ["Cores erradas", "Falhas na primeira camada da impressão", "Superaquecimento", "Nada"], answer: 1, explain: "Uma mesa desnivelada causa aderência irregular na primeira camada." }] },

  // ---------------------------------------------------------------- Jogos
  { id: "unity", name: "Unity", icon: "🎮", domainId: "jogos", difficulty: 3, xp: 140, timeEstimate: "1–2 meses", prerequisites: [],
    market: "Motor de jogos mais usado por estúdios independentes e mobile games — usado por milhões de desenvolvedores.",
    salaryRange: SALARY_DEV_PL,
    what: "Uma engine (motor de jogo) multiplataforma que usa C# para criar jogos 2D e 3D.",
    why: "É a engine mais acessível para começar a criar jogos, com uma comunidade gigante e muitos recursos gratuitos.",
    how: "Aprenda C# básico em paralelo, e comece com um jogo 2D simples (plataforma) antes de partir para 3D.",
    commonMistakes: ["Tentar criar um jogo 3D complexo como primeiro projeto, em vez de começar pequeno.", "Colocar toda a lógica em um único script gigante em vez de organizar por componente."],
    docs: [{ label: "Unity — documentação oficial", url: "https://docs.unity3d.com/" }],
    project: { title: "Plataforma 2D", description: "Um jogo de plataforma 2D simples com um personagem que pula, colide e coleta itens.", deliverables: ["Movimento e pulo funcionais", "Colisão com o cenário", "Sistema de pontuação básico"] },
    quiz: [{ prompt: "Qual linguagem o Unity usa principalmente?", options: ["Python", "C#", "Java", "C++"], answer: 1, explain: "Unity usa C# como linguagem de script principal." }] },
  { id: "unreal", name: "Unreal Engine", icon: "🕹️", domainId: "jogos", difficulty: 4, xp: 160, timeEstimate: "2–3 meses", prerequisites: ["cpp"],
    market: "Usada em jogos AAA (Fortnite) e cada vez mais em cinema/TV via virtual production — forte na indústria de alto orçamento.",
    salaryRange: SALARY_DEV_PL,
    what: "Uma engine de jogos de altíssima fidelidade visual, usando C++ e o sistema visual de scripts Blueprint.",
    why: "É o padrão da indústria para jogos e experiências visuais de ponta, com gráficos state-of-the-art.",
    how: "Comece com Blueprints (visual, sem código) antes de partir para C++ dentro da engine.",
    commonMistakes: ["Tentar aprender C++ e a engine ao mesmo tempo do zero absoluto — comece com Blueprints.", "Ignorar otimização de performance até o projeto já estar grande demais para corrigir facilmente."],
    docs: [{ label: "Unreal Engine — documentação oficial", url: "https://dev.epicgames.com/documentation/unreal-engine" }],
    project: { title: "Jogo 3D (protótipo)", description: "Um protótipo 3D simples com um personagem controlável em um ambiente básico.", deliverables: ["Personagem com movimento 3D", "Um objetivo simples (coletar/chegar a um ponto)", "Uso de pelo menos um Blueprint"] },
    quiz: [{ prompt: "O que são Blueprints na Unreal Engine?", options: ["Um tipo de textura", "Sistema de scripting visual", "Um formato de áudio", "Nada"], answer: 1, explain: "Blueprints permitem programar visualmente, sem escrever código C++ diretamente." }] },

  // ---------------------------------------------------------------- Mobile
  { id: "mobile-dev", name: "Desenvolvimento Mobile", icon: "📱", domainId: "mobile", difficulty: 3, xp: 130, timeEstimate: "1–2 meses", prerequisites: ["javascript"],
    market: "Praticamente toda empresa de produto digital também tem (ou planeja ter) um aplicativo mobile.",
    salaryRange: SALARY_DEV_PL,
    what: "A criação de aplicativos para Android e iOS, seja nativamente ou via frameworks multiplataforma (como React Native).",
    why: "A maior parte do tempo de tela das pessoas hoje está em aplicativos mobile, não em navegadores.",
    how: "Se você já sabe JavaScript/React, React Native é o caminho mais rápido para o primeiro app funcional.",
    commonMistakes: ["Não testar em dispositivos reais, só no emulador, e sofrer com bugs específicos de hardware.", "Ignorar diferenças de UX entre Android e iOS, tratando as duas plataformas como idênticas."],
    docs: [{ label: "React Native — documentação oficial", url: "https://reactnative.dev/" }],
    quiz: [{ prompt: "O que é um framework multiplataforma mobile?", options: ["Um app só para Android", "Um jeito de criar apps para Android e iOS com uma base de código", "Um tipo de banco de dados", "Nada"], answer: 1, explain: "Frameworks como React Native permitem compartilhar código entre Android e iOS." }] },

  // ---------------------------------------------------------------- Dados & Infraestrutura
  { id: "banco-dados", name: "Banco de Dados", icon: "🗄️", domainId: "dados-infra", difficulty: 2, xp: 100, timeEstimate: "3–5 semanas", prerequisites: [],
    market: "Toda aplicação que precisa guardar dados (praticamente todas) depende de um banco de dados bem projetado.",
    salaryRange: SALARY_DEV_JR,
    what: "Sistemas para armazenar, organizar e consultar dados de forma estruturada e eficiente (relacionais como PostgreSQL, ou não-relacionais como MongoDB).",
    why: "Dados mal modelados causam bugs, lentidão e dor de cabeça em qualquer aplicação, não importa quão bom seja o código.",
    how: "Aprenda modelagem relacional básica (tabelas, chaves) e SQL antes de bancos não-relacionais.",
    commonMistakes: ["Não normalizar dados, causando duplicação e inconsistência.", "Não usar índices em colunas consultadas com frequência, deixando queries lentas."],
    docs: [{ label: "PostgreSQL — documentação", url: "https://www.postgresql.org/docs/" }],
    quiz: [{ prompt: "O que é uma chave estrangeira?", options: ["Uma senha", "Uma referência a uma chave primária de outra tabela", "Um tipo de índice", "Nada"], answer: 1, explain: "Chave estrangeira cria um relacionamento entre tabelas, referenciando a chave primária de outra." }] },
  { id: "redes", name: "Redes", icon: "🌐", domainId: "dados-infra", difficulty: 2, xp: 90, timeEstimate: "3–4 semanas", prerequisites: [],
    market: "Base de toda infraestrutura de TI — de administração de sistemas a segurança da informação.",
    what: "Os fundamentos de como computadores se comunicam: IP, DNS, HTTP, portas e protocolos.",
    why: "Sem entender redes, é difícil depurar problemas reais em qualquer sistema que se comunique pela internet (ou seja, quase todos).",
    how: "Aprenda o modelo de camadas (TCP/IP) e pratique comandos básicos (ping, traceroute) para visualizar a comunicação real.",
    commonMistakes: ["Decorar a teoria sem nunca inspecionar tráfego de rede real.", "Confundir IP público com IP privado e se perder em configurações."],
    docs: [{ label: "Cisco Networking Academy (gratuito)", url: "https://www.netacad.com/" }],
    quiz: [{ prompt: "O que o DNS faz?", options: ["Criptografa dados", "Traduz nomes de domínio em endereços IP", "Envia e-mails", "Nada disso"], answer: 1, explain: "DNS converte nomes como 'exemplo.com' em endereços IP numéricos." }] },
  { id: "linux", name: "Linux", icon: "🐧", domainId: "dados-infra", difficulty: 2, xp: 90, timeEstimate: "3–4 semanas", prerequisites: [],
    market: "Roda a maioria dos servidores do mundo — essencial para qualquer carreira de infraestrutura, DevOps ou back-end.",
    what: "Um sistema operacional open-source, dominante em servidores, usado via linha de comando na maior parte do tempo.",
    why: "Se você vai mexer com servidores, nuvem ou back-end sério, vai usar Linux — não é opcional na maioria das carreiras técnicas.",
    how: "Instale uma distribuição (Ubuntu é um bom começo) e force-se a usar o terminal para tarefas do dia a dia.",
    commonMistakes: ["Evitar o terminal e depender só de interface gráfica, perdendo produtividade real.", "Rodar comandos com sudo sem entender o que eles fazem."],
    docs: [{ label: "Linux Command (livro gratuito)", url: "https://linuxcommand.org/" }],
    quiz: [{ prompt: "O que 'sudo' faz em um comando?", options: ["Apaga arquivos", "Executa com privilégios de administrador", "Reinicia o sistema", "Nada"], answer: 1, explain: "sudo executa o comando com permissões elevadas (superusuário)." }] },
  { id: "git", name: "Git", icon: "🌿", domainId: "dados-infra", difficulty: 1, xp: 70, timeEstimate: "1–2 semanas", prerequisites: [],
    market: "Ferramenta padrão de controle de versão usada em praticamente todo time de desenvolvimento do mundo.",
    what: "Um sistema de controle de versão que rastreia mudanças no código ao longo do tempo e permite colaboração entre várias pessoas.",
    why: "Sem controle de versão, colaborar em código é caótico e arriscado — Git é hoje um requisito básico, não diferencial.",
    how: "Aprenda o fluxo básico (add, commit, push, pull) em projetos pessoais antes de colaborar em equipe com branches.",
    commonMistakes: ["Fazer commits gigantes que misturam várias mudanças não relacionadas.", "Usar force push em branches compartilhadas, sobrescrevendo o trabalho de outras pessoas."],
    docs: [{ label: "Git — documentação oficial", url: "https://git-scm.com/doc" }],
    quiz: [{ prompt: "O que 'git commit' faz?", options: ["Envia para o servidor remoto", "Salva um snapshot das mudanças localmente", "Apaga o histórico", "Cria um branch"], answer: 1, explain: "commit registra um snapshot local; push é o que envia ao remoto." }] },
  { id: "cloud", name: "Cloud Computing", icon: "☁️", domainId: "dados-infra", parentId: "linux", difficulty: 3, xp: 120, timeEstimate: "1–2 meses", prerequisites: ["linux", "redes"],
    market: "AWS, Google Cloud e Azure dominam a infraestrutura de praticamente toda empresa de tecnologia moderna.",
    salaryRange: SALARY_DEV_PL,
    what: "O uso de servidores, armazenamento e serviços sob demanda pela internet, em vez de infraestrutura física própria.",
    why: "Praticamente nenhuma empresa nova constrói seu próprio data center hoje — cloud é o padrão da indústria.",
    how: "Crie uma conta gratuita em algum provedor (a maioria tem camada free tier) e hospede um projeto pessoal real nela.",
    commonMistakes: ["Deixar recursos na nuvem ativos sem uso, gerando custos inesperados.", "Configurar permissões de acesso amplas demais, expondo recursos sensíveis publicamente."],
    docs: [{ label: "AWS Free Tier", url: "https://aws.amazon.com/free/" }, { label: "Google Cloud — Free Tier", url: "https://cloud.google.com/free" }],
    quiz: [{ prompt: "O que é 'free tier' na nuvem?", options: ["Um erro", "Uma camada gratuita limitada de serviços", "Um tipo de servidor físico", "Nada"], answer: 1, explain: "Free tier oferece uso gratuito limitado, ótimo para aprender sem custo." }] },
];

export const SKILLS_BY_ID: Record<string, Skill> = Object.fromEntries(SKILLS.map((s) => [s.id, s]));
export function getSkill(id: string): Skill | undefined {
  return SKILLS_BY_ID[id];
}
export function skillsForDomain(domainId: string): Skill[] {
  return SKILLS.filter((s) => s.domainId === domainId);
}
export function childrenOf(skillId: string): Skill[] {
  return SKILLS.filter((s) => s.parentId === skillId);
}
export function rootsOf(domainId: string): Skill[] {
  return SKILLS.filter((s) => s.domainId === domainId && !s.parentId);
}
