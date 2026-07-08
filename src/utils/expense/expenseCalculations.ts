import { PayerUser } from "@/src/store/draft/expenseDraftStore";

/**
 * Recalculates and scales user expense distributions based on structural item parameters,
 * accounting for locked manual amounts and unlocked fractional remaining split shares.
 */
export const distributeProportionalAmounts = (
    prevList: PayerUser[],
    totalAmount: number
): PayerUser[] => {
    if (prevList.length === 0) return prevList;

    const lockedSum = prevList.reduce((sum, u) => sum + (u.isLocked ? (u.amount || 0) : 0), 0);
    const remainingPool = Math.max(0, totalAmount - lockedSum);

    const unlockedParticipants = prevList.filter(u => !u.isLocked);
    const totalShares = unlockedParticipants.reduce((sum, u) => sum + (u.shares ?? 1), 0);

    return prevList.map(p => {
        if (p.isLocked) return p;
        return {
            ...p,
            amount: totalShares > 0 ? (remainingPool * (p.shares ?? 1)) / totalShares : 0
        };
    });
};

/**
 * Builds user-facing summary strings for current payer selections
 */
export const getPayerSummaryText = (payers: PayerUser[], currentUserId?: number): string => {
    if (payers.length === 0) return "No one paid";
    const hasMe = payers.some(p => String(p.id) === String(currentUserId));
    if (payers.length === 1) return hasMe ? "Paid by You" : `Paid by ${payers[0].name}`;
    return hasMe ? `Paid by You and ${payers.length - 1} Others` : `Paid by ${payers[0].name} and ${payers.length - 1} Others`;
};

/**
 * Builds user-facing summary strings for active split participants lists
 */
export const getSplitSummaryText = (participants: PayerUser[], currentUserId?: number): string => {
    if (participants.length === 0) return "Split with no one";
    const hasMe = participants.some(p => String(p.id) === String(currentUserId));
    if (participants.length === 1) return hasMe ? "Split completely with Yourself" : `Split with ${participants[0].name}`;
    return hasMe ? `Split between You and ${participants.length - 1} others` : `Split between ${participants[0].name} and ${participants.length - 1} others`;
};