import { systemStore } from '@/src/store/systemStore';
import type { ExpenseItem } from '@/src/store/draft/expenseDraftStore';

/**
 * Builds a draft line from the system default expense item (loaded via GetSystemDefaultsApi).
 * Returns null if defaults are not ready yet.
 */
export function getDefaultExpenseItemDraft(totalAmount: number): ExpenseItem | null {
    const def = systemStore.getState().defaults.defaultExpenseItem;
    if (!def?.id) return null;

    return {
        id: String(def.id),
        title: def.title?.trim() || 'Expense',
        cost: Number(totalAmount) || 0,
        quantity: 1,
        iconUrl: def.asset?.url || null,
        sharedBetween: [],
        paidBetween: [],
    };
}

/** True when the draft is exactly the single system default item (not user catalog picks). */
export function isSoleDefaultExpenseItem(items: ExpenseItem[]): boolean {
    const defId = systemStore.getState().defaults.defaultExpenseItem?.id;
    if (!defId || items.length !== 1) return false;
    return String(items[0].id) === String(defId);
}

export function ensureDefaultExpenseItems(
    items: ExpenseItem[],
    totalAmount: number,
): ExpenseItem[] {
    if (items.length > 0) return items;
    const fallback = getDefaultExpenseItemDraft(totalAmount);
    return fallback ? [fallback] : [];
}
