export interface PlanDefinition {
  id: string;
  name: string;
  credits: number;
  priceCents: number;
  bonusCredits: number;
  popular?: boolean;
}

export const PLANS: PlanDefinition[] = [
  {
    id: "starter",
    name: "入门版",
    credits: 100,
    priceCents: 1000,
    bonusCredits: 0,
  },
  {
    id: "standard",
    name: "标准版",
    credits: 500,
    priceCents: 4500,
    bonusCredits: 50,
    popular: true,
  },
  {
    id: "pro",
    name: "专业版",
    credits: 1200,
    priceCents: 9900,
    bonusCredits: 150,
  },
  {
    id: "max",
    name: "旗舰版",
    credits: 5000,
    priceCents: 39900,
    bonusCredits: 800,
  },
];

export function formatRMB(cents: number): string {
  return `¥${(cents / 100).toFixed(2)}`;
}
