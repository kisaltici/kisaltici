import User from '../models/User.js';
import { PLAN_IDS } from '../config/plans.js';
import { isAdminUser } from './admin.js';

/**
 * Effective plan for a request: 'guest' (no token), 'admin' (configured admins),
 * otherwise the stored membership plan ('free' | 'starter' | 'pro' | 'business').
 * Unknown/legacy stored values fall back to 'free'.
 */
export const resolvePlan = async (authUser) => {
  if (!authUser?.uid) return 'guest';
  if (isAdminUser(authUser)) return 'admin';
  const doc = await User.findOne({ userId: authUser.uid }).select('membershipPlan').lean();
  return PLAN_IDS.includes(doc?.membershipPlan) ? doc.membershipPlan : 'free';
};
