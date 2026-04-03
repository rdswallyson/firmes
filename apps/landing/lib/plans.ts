import { Plan } from "@firmes/db";

export const ESMERALDA_PLANS: Plan[] = [
  Plan.ESMERALDA_STARTER,
  Plan.ESMERALDA_PRO,
  Plan.ESMERALDA_PLUS,
  Plan.ESMERALDA_ULTRA,
];

export function isEsmeraldaPlan(plan: Plan): boolean {
  return ESMERALDA_PLANS.includes(plan);
}

export function getMaxChurches(plan: Plan): number {
  switch (plan) {
    case Plan.ESMERALDA_STARTER:
      return 5;
    case Plan.ESMERALDA_PRO:
      return 15;
    case Plan.ESMERALDA_PLUS:
      return 25;
    case Plan.ESMERALDA_ULTRA:
      return Infinity;
    default:
      return 1;
  }
}

export function getPlanIsWhiteLabel(plan: Plan): boolean {
  return isEsmeraldaPlan(plan);
}

export const PLAN_ESTROFES: Record<string, string> = {
  FREE: "A semente mais pequena carrega em si uma floresta inteira.",
  PRATA: "Refinado como a prata no fogo, seu ministério foi preparado para durar.",
  OURO: "Como o ouro provado sete vezes, sua fé e sua obra falam por si.",
  DIAMANTE: "Formado nas profundezas, revelado pela graça — eterno e inabalável.",
  ESMERALDA_STARTER: "Rara entre as raras, assim como as almas chamadas para plantar o Reino.",
  ESMERALDA_PRO: "Deus não chama os capacitados — Ele capacita os chamados. Você foi chamado.",
  ESMERALDA_PLUS: "O berilo vermelho é a pedra mais rara da criação. Você foi escolhido antes da fundação do mundo.",
  ESMERALDA_ULTRA: "Sem limites, porque Aquele que habita em você é maior do que tudo.",
};
