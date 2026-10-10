import { useAuth } from '../context/AuthContext';
import { getClientLimits } from '../config/plans';
import { hasUsedGuestLinkToday, todayKey } from './shortenApi';

/**
 * Whether the current visitor can still shorten a link today.
 * Returns { blocked, kind: 'guest' | 'daily' | null, limit }.
 * Guests get one link a day; signed-in users get their plan's daily allowance.
 * A cached usage value from a previous day is ignored (the server stamps usage with its day key).
 */
export function useShortenAllowance() {
  const { user, userProfile, membershipPlan } = useAuth();

  if (!user) {
    return { blocked: hasUsedGuestLinkToday(), kind: 'guest', limit: 1 };
  }

  const limits = userProfile?.limits || getClientLimits(membershipPlan);
  const usage = userProfile?.usage;
  if (limits.dailyLinks === null || limits.dailyLinks === undefined || !usage) {
    return { blocked: false, kind: null, limit: null };
  }

  const isFresh = !usage.day || usage.day === todayKey();
  if (isFresh && usage.links >= limits.dailyLinks) {
    return { blocked: true, kind: 'daily', limit: limits.dailyLinks };
  }
  return { blocked: false, kind: null, limit: limits.dailyLinks };
}
