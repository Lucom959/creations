/**
 * SkillMentor — IA mentora por regras (sem LLM externo).
 * Gera a explicação automática de desbloqueio, o plano de estudos e
 * responde perguntas de acompanhamento por reconhecimento de padrões.
 * (Integração com um LLM real fica como evolução futura — ver AVISO no chat.)
 */

import { Skill, getSkill, SKILLS, DOMAINS, childrenOf } from "./skills";

export interface MentorMessage {
  text: string;
  actions?: { label: string; action: string }[];
}

/** Mensagem automática ao desbloquear uma habilidade — segue exatamente a
 * estrutura pedida: parabéns, o que é, por que, mercado, como aprender,
 * ordem de estudo, tempo, projeto ideal, e a pergunta sobre plano de estudos. */
export function unlockExplanation(skill: Skill): MentorMessage {
  const prereqNames = skill.prerequisites.map((id) => getSkill(id)?.name).filter(Boolean);
  const next = childrenOf(skill.id);
  const order = prereqNames.length
    ? `Antes de ${skill.name}, você já passou por ${prereqNames.join(", ")} — ótima base.`
    : `${skill.name} não exige nenhum pré-requisito — é um ótimo ponto de partida.`;
  const nextStep = next.length ? `\n\n📚 Depois de praticar, os próximos passos naturais são: ${next.map((s) => s.name).join(", ")}.` : "";

  const lines = [
    `🎉 Parabéns! Você desbloqueou **${skill.name}**.`,
    ``,
    `**O que é:** ${skill.what}`,
    ``,
    `**Por que importa:** ${skill.why}`,
    ``,
    `**Onde é usado no mercado:** ${skill.market}${skill.salaryRange ? `\n💰 Faixa salarial estimada: ${skill.salaryRange}` : ""}`,
    ``,
    `**Como aprender do zero:** ${skill.how}`,
    ``,
    `**Tempo médio até uma boa base:** ${skill.timeEstimate}`,
    ``,
    order,
    skill.project ? `\n🛠️ **Projeto ideal para praticar agora:** ${skill.project.title} — ${skill.project.description}` : "",
    nextStep,
    ``,
    `⚠️ Erros comuns a evitar: ${skill.commonMistakes.join(" ")}`,
    ``,
    `Quer que eu monte um **plano de estudos personalizado** para ${skill.name}?`,
  ];
  return {
    text: lines.filter((l) => l !== "").join("\n"),
    actions: [{ label: "Sim, monte meu plano", action: `plan:${skill.id}` }, { label: "Agora não", action: "dismiss" }],
  };
}

/** Plano de estudos semanal simples, baseado no tempo estimado da habilidade. */
export function studyPlan(skill: Skill): MentorMessage {
  const weeksMatch = skill.timeEstimate.match(/(\d+)/g);
  const weeks = weeksMatch ? Math.max(1, Math.min(12, parseInt(weeksMatch[weeksMatch.length - 1], 10))) : 3;
  const phases = [
    `**Semana 1 — Fundamentos:** leia a documentação oficial e entenda os conceitos-chave de ${skill.name} sem pressa. Não pule para projetos ainda.`,
    `**Semana 2 — Prática guiada:** refaça exemplos simples repetidas vezes até ficarem automáticos. Responda o quiz da habilidade.`,
    weeks > 2 ? `**Semana 3 — Projeto real:** comece "${skill.project?.title ?? "um projeto pequeno"}" aplicando o que aprendeu, mesmo que trave no meio do caminho.` : "",
    weeks > 3 ? `**Semanas seguintes:** repita o ciclo com variações do projeto e comece a olhar para as próximas habilidades da árvore.` : "",
  ].filter(Boolean);
  return {
    text: `📋 Plano de estudos para **${skill.name}** (~${weeks} semana${weeks > 1 ? "s" : ""}):\n\n${phases.join("\n\n")}\n\nQuando terminar o projeto, volte aqui e marque como concluído — isso libera XP extra e novas conquistas.`,
  };
}

// ---------------------------------------------------------------------------
// Chat de acompanhamento — reconhecimento de padrões
// ---------------------------------------------------------------------------

function findSkill(text: string): Skill | undefined {
  const t = text.toLowerCase();
  let best: Skill | undefined;
  let bestLen = 0;
  for (const s of SKILLS) {
    const name = s.name.toLowerCase();
    if (t.includes(name) && name.length > bestLen) {
      best = s;
      bestLen = name.length;
    }
  }
  return best;
}

const INTERVIEW_QUESTIONS: Record<string, string[]> = {
  programacao: ["Explique a diferença entre let, const e var.", "O que é uma Promise e para que serve?", "Como o navegador renderiza uma página HTML?"],
  ia: ["O que é overfitting e como evitá-lo?", "Qual a diferença entre aprendizado supervisionado e não supervisionado?"],
  cybersecurity: ["O que é um ataque de injeção SQL e como preveni-lo?", "Explique o princípio do menor privilégio."],
  default: ["Conte sobre um projeto desafiador que você fez.", "Como você lida com um bug que não consegue reproduzir?"],
};

export function askMentorChat(input: string): MentorMessage {
  const text = input.trim();
  const lower = text.toLowerCase();
  if (!text) {
    return { text: "Pode perguntar! Posso explicar qualquer habilidade, corrigir um trecho de código, gerar um desafio, simular uma entrevista ou montar um plano de estudos." };
  }

  const skill = findSkill(text);

  if (/entrevista/.test(lower)) {
    const domainId = skill?.domainId ?? "default";
    const bank = INTERVIEW_QUESTIONS[domainId] ?? INTERVIEW_QUESTIONS.default;
    const q = bank[Math.floor(Math.random() * bank.length)];
    return { text: `🎤 Simulação de entrevista${skill ? ` (${skill.name})` : ""}:\n\n"${q}"\n\nResponda como se estivesse numa entrevista real — depois me chame de novo para outra pergunta.` };
  }

  if (/desafio|exerc[íi]cio/.test(lower)) {
    if (!skill) return { text: "Sobre qual habilidade você quer um desafio? Ex.: \"me dê um desafio de Python\"." };
    return { text: `💪 Desafio de ${skill.name}: tente resolver "${skill.project?.title ?? `um mini-exercício de ${skill.name}`}" sem consultar a documentação primeiro. Se travar, volte e me pergunte especificamente onde travou — assim eu ajudo de forma mais pontual.` };
  }

  if (/erro comum|errei|erro/.test(lower) && skill) {
    return { text: `⚠️ Erros comuns em ${skill.name}:\n\n${skill.commonMistakes.map((m) => `• ${m}`).join("\n")}` };
  }

  if (/pré-requisito|prerequisito|preciso saber antes/.test(lower)) {
    if (!skill) return { text: "De qual habilidade? Ex.: \"quais os pré-requisitos de React?\"." };
    const names = skill.prerequisites.map((id) => getSkill(id)?.name).filter(Boolean);
    return { text: names.length ? `Pré-requisitos de ${skill.name}: ${names.join(", ")}.` : `${skill.name} não exige pré-requisitos formais — é um bom ponto de partida.` };
  }

  if (/quanto tempo|tempo (leva|médio)/.test(lower)) {
    if (!skill) return { text: "Sobre qual habilidade?" };
    return { text: `${skill.name} costuma levar ${skill.timeEstimate} para uma base sólida — isso varia conforme o ritmo de cada um.` };
  }

  if (/documenta[cç][aã]o|material|link/.test(lower)) {
    if (!skill) return { text: "De qual habilidade você quer a documentação?" };
    return { text: `📚 Documentação oficial de ${skill.name}:\n${skill.docs.map((d) => `• ${d.label}: ${d.url}`).join("\n")}` };
  }

  if (/plano de estudos/.test(lower)) {
    if (!skill) return { text: "Para qual habilidade você quer um plano de estudos?" };
    return studyPlan(skill);
  }

  if (/projeto/.test(lower)) {
    if (!skill) return { text: "De qual habilidade?" };
    return { text: skill.project ? `🛠️ Projeto sugerido para ${skill.name}: **${skill.project.title}**.\n${skill.project.description}\n\nEntregáveis:\n${skill.project.deliverables.map((d) => `• ${d}`).join("\n")}` : `${skill.name} ainda não tem um projeto-assinatura cadastrado, mas você pode praticar construindo algo pequeno que use só essa habilidade.` };
  }

  if (/mini ?aula|explique|como funciona|o que [ée]/.test(lower)) {
    if (!skill) return { text: "Sobre qual tecnologia ou habilidade você quer uma explicação?" };
    return { text: `🎓 Mini-aula: ${skill.name}\n\n${skill.what}\n\n${skill.how}` };
  }

  if (/melhoria|melhorar|sugest/.test(lower)) {
    return { text: "Cole o trecho do que você fez (ou descreva) e eu aponto o que daria para melhorar — foco em legibilidade, organização e nos erros comuns da habilidade em questão." };
  }

  if (skill) {
    return { text: `Sobre ${skill.name}: posso explicar o conceito, listar pré-requisitos, sugerir um projeto, montar um plano de estudos ou simular uma entrevista sobre o tema. O que prefere?` };
  }

  return { text: "Não captei exatamente — mas posso: explicar uma habilidade, listar pré-requisitos, sugerir projetos e desafios, montar um plano de estudos, simular entrevista ou apontar erros comuns. Cite o nome da habilidade na pergunta." };
}

export const DOMAIN_NAMES = DOMAINS.map((d) => d.name);
