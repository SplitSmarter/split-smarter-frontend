import {
    ExpenseItem,
    ExpenseItemSharer,
    PayerUser,
} from '@/src/store/draft/expenseDraftStore';
import {RelationWithUserType} from '@/src/api/dto/constants';
import {isSoleDefaultExpenseItem} from '@/src/utils/expense/defaultExpenseItem';

/** Custom / multi catalog lines that should block silent total updates. */
const hasBlockingExpenseItems = (items: ExpenseItem[]): boolean =>
    items.length > 0 && !isSoleDefaultExpenseItem(items);

export type ParticipantKey = string;

export const participantKey = (
    userId: number | string,
    userType: RelationWithUserType | string | undefined | null
): ParticipantKey => `${userId}-${userType || RelationWithUserType.USER}`;

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

    const unlockedParticipants = prevList.filter((u) => !u.isLocked);
    const totalShares = unlockedParticipants.reduce((sum, u) => sum + (u.shares ?? 1), 0);

    return prevList.map((p) => {
        if (p.isLocked) return p;
        return {
            ...p,
            amount: totalShares > 0 ? (remainingPool * (p.shares ?? 1)) / totalShares : 0,
        };
    });
};

/**
 * Builds user-facing summary strings for current payer selections
 */
export const getPayerSummaryText = (payers: PayerUser[], currentUserId?: number): string => {
    if (payers.length === 0) return 'No one paid';
    const hasMe = payers.some((p) => String(p.id) === String(currentUserId));
    if (payers.length === 1) return hasMe ? 'Paid by You' : `Paid by ${payers[0].name}`;
    return hasMe
        ? `Paid by You and ${payers.length - 1} Others`
        : `Paid by ${payers[0].name} and ${payers.length - 1} Others`;
};

/**
 * Builds user-facing summary strings for active split participants lists
 */
export const getSplitSummaryText = (
    participants: PayerUser[],
    currentUserId?: number
): string => {
    if (participants.length === 0) return 'Split with no one';
    const hasMe = participants.some((p) => String(p.id) === String(currentUserId));
    if (participants.length === 1) {
        return hasMe ? 'Split completely with Yourself' : `Split with ${participants[0].name}`;
    }
    return hasMe
        ? `Split between You and ${participants.length - 1} others`
        : `Split between ${participants[0].name} and ${participants.length - 1} others`;
};

export interface ItemShareDraft {
    user_id: number;
    user_type: RelationWithUserType;
    shares: number;
}

/**
 * Split `total` equally among `count` people in integer cents so amounts sum
 * exactly (no overflow/underflow). Leftover cents go one-per-person to the
 * first `rem` indices (largest remainder) — max gap between any two is 1¢.
 */
export const allocateEqualAmounts = (total: number, count: number): number[] => {
    if (count <= 0) return [];
    const totalCents = Math.round(total * 100);
    if (count === 1) return [totalCents / 100];

    const base = Math.floor(totalCents / count);
    const rem = totalCents % count;
    return Array.from(
        { length: count },
        (_, i) => (base + (i < rem ? 1 : 0)) / 100,
    );
};

/**
 * Convert integer shares on a line into amounts that sum exactly to lineTotal.
 * Last assignee absorbs rounding remainder.
 */
export const sharesToLineAmounts = (
    drafts: ItemShareDraft[],
    lineTotal: number
): ExpenseItemSharer[] => {
    const active = drafts.filter((d) => d.shares > 0);
    if (active.length === 0 || lineTotal <= 0) return [];

    const totalShares = active.reduce((sum, d) => sum + d.shares, 0);
    if (totalShares <= 0) return [];

    let allocated = 0;
    return active.map((d, index) => {
        const isLast = index === active.length - 1;
        const amount = isLast
            ? Math.round((lineTotal - allocated) * 100) / 100
            : Math.round(((lineTotal * d.shares) / totalShares) * 100) / 100;
        if (!isLast) allocated += amount;
        return {
            user_id: d.user_id,
            user_type: d.user_type,
            amount,
        };
    });
};

/** Sum of all item-level sharedBetween amounts across expense items. */
export const sumAllItemAttributions = (items: ExpenseItem[]): number =>
    items.reduce(
        (sum, item) =>
            sum + (item.sharedBetween || []).reduce((s, sh) => s + (sh.amount || 0), 0),
        0
    );

/** Per-user item attribution totals keyed by `${id}-${user_type}`. */
export const itemAttrByUser = (items: ExpenseItem[]): Map<ParticipantKey, number> => {
    const map = new Map<ParticipantKey, number>();
    for (const item of items) {
        for (const sh of item.sharedBetween || []) {
            const key = participantKey(sh.user_id, sh.user_type);
            map.set(key, (map.get(key) || 0) + (sh.amount || 0));
        }
    }
    return map;
};

export const getUserItemAttr = (
    items: ExpenseItem[],
    userId: number | string,
    userType: RelationWithUserType | string | undefined | null
): number => itemAttrByUser(items).get(participantKey(userId, userType)) || 0;

/** Pool available for Split Between UI: expense total minus all item attributions. */
export const computePoolTotal = (expenseTotal: number, items: ExpenseItem[]): number =>
    Math.max(0, Math.round((expenseTotal - sumAllItemAttributions(items)) * 100) / 100);

export const toPoolAmount = (settlementAmount: number, itemAttr: number): number =>
    Math.max(0, Math.round((settlementAmount - itemAttr) * 100) / 100);

export const toSettlementAmount = (poolAmount: number, itemAttr: number): number =>
    Math.round((poolAmount + itemAttr) * 100) / 100;

export interface SplitBreakdownRow {
    items: number;
    share: number;
    total: number;
}

export const buildSplitBreakdown = (
    participant: PayerUser,
    items: ExpenseItem[]
): SplitBreakdownRow => {
    const attributed = getUserItemAttr(items, participant.id, participant.user_type);
    const total = participant.amount || 0;
    return {
        items: attributed,
        share: toPoolAmount(total, attributed),
        total,
    };
};

/**
 * Redistribute expense total across split participants while keeping each user's
 * item-attribution floor. Unlocked users share the remaining pool by shares.
 */
export const redistributeSplitPreservingItemFloors = (
    participants: PayerUser[],
    items: ExpenseItem[],
    expenseTotal: number
): PayerUser[] => {
    if (participants.length === 0) return participants;
    const attrs = itemAttrByUser(items);

    const withFloors = participants.map((p) => {
        const attr = attrs.get(participantKey(p.id, p.user_type)) || 0;
        const amount = Math.max(p.amount || 0, attr);
        return {
            ...p,
            amount,
            // Lock anyone whose entire settlement is the item floor so total sync can't undercut items
            isLocked: p.isLocked || (attr > 0 && amount <= attr + 0.009),
        };
    });

    return distributeProportionalAmounts(withFloors, expenseTotal);
};

/**
 * After item sharedBetween changes: preserve each user's prior pool share,
 * then set settlement = pool + newItemAttr. Over-limit users (itemAttr > old settlement)
 * are locked at itemAttr with pool 0.
 */
export const applyItemAttributionToSettlements = (
    participants: PayerUser[],
    previousItems: ExpenseItem[],
    nextItems: ExpenseItem[],
    expenseTotal: number
): {participants: PayerUser[]; overLimitKeys: ParticipantKey[]} => {
    const prevAttr = itemAttrByUser(previousItems);
    const nextAttr = itemAttrByUser(nextItems);
    const overLimitKeys: ParticipantKey[] = [];

    let nextParticipants = participants.map((p) => {
        const key = participantKey(p.id, p.user_type);
        const oldItem = prevAttr.get(key) || 0;
        const newItem = nextAttr.get(key) || 0;
        const oldSettlement = p.amount || 0;
        const pool = toPoolAmount(oldSettlement, oldItem);

        if (newItem > oldSettlement + 0.009) {
            overLimitKeys.push(key);
            return {
                ...p,
                amount: newItem,
                isLocked: true,
            };
        }

        return {
            ...p,
            amount: toSettlementAmount(pool, newItem),
        };
    });

    // Ensure every item assignee exists in split participants
    const existingKeys = new Set(
        nextParticipants.map((p) => participantKey(p.id, p.user_type))
    );
    for (const [key, newItem] of nextAttr.entries()) {
        if (existingKeys.has(key) || newItem <= 0) continue;
        const [idStr, typeStr] = key.split('-');
        nextParticipants.push({
            id: idStr,
            name: `User ${idStr}`,
            amount: newItem,
            shares: 1,
            isLocked: true,
            user_type: (typeStr as RelationWithUserType) || RelationWithUserType.USER,
        });
        overLimitKeys.push(key);
        existingKeys.add(key);
    }

    // Rebalance unlocked participants' settlement amounts so pools sum to poolTotal
    const poolTotal = computePoolTotal(expenseTotal, nextItems);
    const lockedPoolSum = nextParticipants.reduce((sum, p) => {
        if (!p.isLocked) return sum;
        const attr = nextAttr.get(participantKey(p.id, p.user_type)) || 0;
        return sum + toPoolAmount(p.amount || 0, attr);
    }, 0);
    const unlockedPoolTarget = Math.max(0, poolTotal - lockedPoolSum);
    const unlocked = nextParticipants.filter((p) => !p.isLocked);
    const unlockedShares = unlocked.reduce((sum, p) => sum + (p.shares ?? 1), 0);

    nextParticipants = nextParticipants.map((p) => {
        if (p.isLocked) return p;
        const attr = nextAttr.get(participantKey(p.id, p.user_type)) || 0;
        const poolShare =
            unlockedShares > 0
                ? (unlockedPoolTarget * (p.shares ?? 1)) / unlockedShares
                : 0;
        return {
            ...p,
            amount: toSettlementAmount(poolShare, attr),
        };
    });

    return {participants: nextParticipants, overLimitKeys};
};

/** Σ(cost × quantity) for selected expense items. */
export const itemCostSum = (items: ExpenseItem[]): number =>
    items.reduce((sum, item) => sum + (item.cost || 0) * (item.quantity || 0), 0);

const isTrivialSoloYou = (
    list: PayerUser[],
    currentUserId: number | string | undefined,
    expenseTotal: number
): boolean => {
    if (list.length !== 1) return false;
    const p = list[0];
    const isYou =
        currentUserId != null &&
        String(p.id) === String(currentUserId) &&
        (p.user_type || RelationWithUserType.USER) === RelationWithUserType.USER;
    if (!isYou) return false;
    if (p.isLocked) return false;
    return Math.abs((p.amount || 0) - expenseTotal) <= 0.009 || expenseTotal <= 0.009;
};

export const hasPaidByDependents = (
    payers: PayerUser[],
    currentUserId: number | string | undefined,
    expenseTotal: number
): boolean => {
    if (payers.length === 0) return false;
    if (payers.length > 1) return true;
    if (payers.some((p) => p.isLocked)) return true;
    return !isTrivialSoloYou(payers, currentUserId, expenseTotal);
};

export const hasSplitDependents = (
    participants: PayerUser[],
    items: ExpenseItem[],
    currentUserId: number | string | undefined,
    expenseTotal: number
): boolean => {
    if (sumAllItemAttributions(items) > 0.009) return true;
    if (participants.length === 0) return false;
    if (participants.length > 1) return true;
    if (participants.some((p) => p.isLocked)) return true;
    return !isTrivialSoloYou(participants, currentUserId, expenseTotal);
};

export const hasAmountChangeDependents = (
    payers: PayerUser[],
    participants: PayerUser[],
    items: ExpenseItem[],
    currentUserId: number | string | undefined,
    previousTotal: number
): boolean =>
    hasBlockingExpenseItems(items) ||
    hasPaidByDependents(payers, currentUserId, previousTotal) ||
    hasSplitDependents(participants, items, currentUserId, previousTotal);

export const hasItemAttributionConflict = (
    items: ExpenseItem[],
    newTotal: number
): boolean => sumAllItemAttributions(items) > newTotal + 0.009;

export const hasItemCostMismatch = (items: ExpenseItem[], newTotal: number): boolean =>
    items.length > 0 && Math.abs(itemCostSum(items) - newTotal) > 0.009;

/** Clear per-item sharedBetween / paidBetween (keep catalog items + quantities). */
export const clearAllItemShares = (items: ExpenseItem[]): ExpenseItem[] =>
    items.map((item) => ({...item, sharedBetween: [], paidBetween: []}));

export const ALLOCATION_TOLERANCE = 0.01;

export const sumParticipantAmounts = (list: PayerUser[]): number =>
    list.reduce((sum, p) => sum + (p.amount || 0), 0);

export const allocationWithinTolerance = (
    sum: number,
    total: number,
    tolerance = ALLOCATION_TOLERANCE
): boolean => Math.abs(sum - total) <= tolerance;

/** Whether unlocking/editing total on one side should warn about the other side / items. */
export const hasUnlockTotalDependents = (
    activeSide: 'paidBy' | 'split',
    payers: PayerUser[],
    participants: PayerUser[],
    items: ExpenseItem[],
    currentUserId: number | string | undefined,
    expenseTotal: number
): boolean => {
    if (hasBlockingExpenseItems(items)) return true;
    if (activeSide === 'paidBy') {
        return hasSplitDependents(participants, items, currentUserId, expenseTotal);
    }
    return hasPaidByDependents(payers, currentUserId, expenseTotal);
};

