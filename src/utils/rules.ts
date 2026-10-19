import { Offer, DistributionPlan, ServeReport } from '../types';

export interface CountdownState {
  totalMs: number;
  remainingMs: number;
  percentRemaining: number;
  formattedTime: string;
  urgencyLevel: 'safe' | 'warning' | 'critical' | 'expired';
  urgencyLabel: string;
}

/**
 * Calculates remaining time until safe consumable limit.
 * Green > 60%, Amber 30%-60%, Red < 30% (with clear text labels, never colour alone).
 */
export function calculateSafeUntilCountdown(
  createdAtIso: string,
  safeUntilIso: string,
  currentSimulatedTimeMs: number = Date.now()
): CountdownState {
  const start = new Date(createdAtIso).getTime();
  const end = new Date(safeUntilIso).getTime();
  const totalMs = Math.max(1, end - start);
  const remainingMs = end - currentSimulatedTimeMs;

  if (remainingMs <= 0) {
    return {
      totalMs,
      remainingMs: 0,
      percentRemaining: 0,
      formattedTime: 'Expired',
      urgencyLevel: 'expired',
      urgencyLabel: 'Unsafe for consumption (Expired)'
    };
  }

  const percentRemaining = Math.min(100, Math.max(0, Math.round((remainingMs / totalMs) * 100)));
  const totalMinutes = Math.floor(remainingMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  let formattedTime = '';
  if (hours > 0) {
    formattedTime = `${hours}h ${mins}m left`;
  } else {
    formattedTime = `${mins}m left`;
  }

  let urgencyLevel: CountdownState['urgencyLevel'] = 'safe';
  let urgencyLabel = 'Safe window open';

  if (percentRemaining < 30) {
    urgencyLevel = 'critical';
    urgencyLabel = 'Critical: Pickup urgently needed';
  } else if (percentRemaining <= 60) {
    urgencyLevel = 'warning';
    urgencyLabel = 'Moderate: Safe window closing';
  }

  return {
    totalMs,
    remainingMs,
    percentRemaining,
    formattedTime,
    urgencyLevel,
    urgencyLabel
  };
}

/**
 * Generates a priority score for NGOs viewing live offers.
 * Higher priority = more urgent safe-until window, decent plate count.
 */
export function calculateOfferPriorityScore(offer: Offer, currentSimulatedTimeMs: number = Date.now()): number {
  if (offer.status !== 'AVAILABLE') return -1;
  const countdown = calculateSafeUntilCountdown(offer.createdAt, offer.safeUntil, currentSimulatedTimeMs);
  if (countdown.urgencyLevel === 'expired') return -1;

  // Urgency score: inverse of remaining percent (0 to 100)
  const urgencyWeight = (100 - countdown.percentRemaining) * 1.5;
  // Plates score: up to 50 points based on plates
  const platesWeight = Math.min(50, offer.platesAvailable / 4);

  return Math.round(urgencyWeight + platesWeight);
}

/**
 * 4-digit pickup handover verification code
 */
export function generatePickupCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Checks for collected offers where the NGO has not yet submitted a Serve Report.
 */
export function getPendingServeReports(
  plans: DistributionPlan[],
  offers: Offer[],
  reports: ServeReport[],
  ngoId?: string
): { plan: DistributionPlan; offer: Offer }[] {
  const reportedPlanIds = new Set(reports.map(r => r.planId));
  const results: { plan: DistributionPlan; offer: Offer }[] = [];

  plans.forEach(plan => {
    if (ngoId && plan.ngoId !== ngoId) return;
    if (plan.status !== 'confirmed') return;
    if (reportedPlanIds.has(plan.id)) return;

    const offer = offers.find(o => o.id === plan.offerId);
    if (offer && (offer.status === 'COLLECTED' || offer.status === 'CONFIRMED')) {
      results.push({ plan, offer });
    }
  });

  return results;
}

/**
 * Formats date into readable string (e.g., "18 Oct 2026, 08:30 PM")
 */
export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return isoString;
  }
}

export function formatDateOnly(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return isoString;
  }
}
