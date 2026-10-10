export const MEMBERSHIP_PLANS = {
  free: {
    id: 'free',
    nameKey: 'planFreeName',
  },
  pro: {
    id: 'pro',
    nameKey: 'planProName',
  },
  admin: {
    id: 'admin',
    nameKey: 'planAdminName',
  },
};

export function getPlanDisplayName(planId, t) {
  const plan = MEMBERSHIP_PLANS[planId] || MEMBERSHIP_PLANS.free;
  return t(plan.nameKey);
}

export function isPaidPlan(planId) {
  return Boolean(planId && planId !== 'free');
}

