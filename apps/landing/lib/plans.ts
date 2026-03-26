import { Plan } from "@firmes/db";

export const RUBI_PLANS: Plan[] = [
  Plan.RUBI_STARTER,
  Plan.RUBI_PRO,
  Plan.RUBI_PLUS,
  Plan.RUBI_ULTRA,
];

export function isRubiPlan(plan: Plan): boolean {
  return RUBI_PLANS.includes(plan);
}

export function getMaxChurches(plan: Plan): number {
  switch (plan) {
    case Plan.RUBI_STARTER:
      return 5;
    case Plan.RUBI_PRO:
      return 15;
    case Plan.RUBI_PLUS:
      return 25;
    case Plan.RUBI_ULTRA:
      return Infinity;
    default:
      return 1;
  }
}

export function getPlanIsWhiteLabel(plan: Plan): boolean {
  return isRubiPlan(plan);
}
