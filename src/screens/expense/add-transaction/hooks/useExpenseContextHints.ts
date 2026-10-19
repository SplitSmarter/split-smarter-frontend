import {useEffect, useRef, useState} from 'react';
import {ApplicableBudgetItem} from '@/src/api/dto/expense/budget';
import {MemoryResponse, MemoryStatus} from '@/src/api/dto/user/memory';
import {listApplicableBudgetsApi} from '@/src/api/expense/budget';
import {GetMemoriesApi} from '@/src/api/user/memory';
import {CurrencyCode} from '@/src/constants/expense/currency';

const DEBOUNCE_MS = 350;
const MAX_MEMORY_CHIPS = 2;
const MAX_BUDGET_CHIPS = 2;

export type ExpenseContextHintsInput = {
    enabled: boolean;
    expenseDate?: string | null;
    groupId?: number | null;
    categoryId?: number | null;
    placeId?: number | null;
    amount?: number | null;
    currency?: CurrencyCode | string | null;
};

export type ExpenseContextHints = {
    memories: MemoryResponse[];
    budgets: ApplicableBudgetItem[];
    /** True only until the first successful (or empty) resolve for the current enable cycle */
    loading: boolean;
};

function toCoveringDate(expenseDate: string): string {
    return expenseDate.includes('T') ? expenseDate.split('T')[0]! : expenseDate.slice(0, 10);
}

function pickMemories(items: MemoryResponse[]): MemoryResponse[] {
    const sorted = [...items].sort((a, b) => {
        const aCtx = a.is_current_context ? 1 : 0;
        const bCtx = b.is_current_context ? 1 : 0;
        return bCtx - aCtx;
    });
    return sorted.slice(0, MAX_MEMORY_CHIPS);
}

function projectedPercent(item: ApplicableBudgetItem): number {
    const cap = item.current_instance?.amount ?? item.amount ?? 0;
    if (cap <= 0) return item.progress?.percent ?? 0;
    const projected = item.projected_spent ?? item.progress?.spent ?? 0;
    return (projected / cap) * 100;
}

function pickBudgets(items: ApplicableBudgetItem[]): ApplicableBudgetItem[] {
    const sorted = [...items].sort((a, b) => {
        if (a.would_exceed_hard !== b.would_exceed_hard) {
            return a.would_exceed_hard ? -1 : 1;
        }
        return projectedPercent(b) - projectedPercent(a);
    });
    return sorted.slice(0, MAX_BUDGET_CHIPS);
}

export function useExpenseContextHints(input: ExpenseContextHintsInput): ExpenseContextHints {
    const {
        enabled,
        expenseDate,
        groupId,
        categoryId,
        placeId,
        amount,
        currency,
    } = input;

    const [memories, setMemories] = useState<MemoryResponse[]>([]);
    const [budgets, setBudgets] = useState<ApplicableBudgetItem[]>([]);
    const [loading, setLoading] = useState(false);
    const hasResolvedRef = useRef(false);
    const requestIdRef = useRef(0);

    useEffect(() => {
        if (!enabled || !expenseDate) {
            setMemories([]);
            setBudgets([]);
            setLoading(false);
            hasResolvedRef.current = false;
            return;
        }

        const requestId = ++requestIdRef.current;
        if (!hasResolvedRef.current) {
            setLoading(true);
        }

        const timer = setTimeout(() => {
            void (async () => {
                const coveringDate = toCoveringDate(expenseDate);

                let nextMemories: MemoryResponse[] = [];
                try {
                    const memRes = await GetMemoriesApi({
                        covering_date: coveringDate,
                        status: [MemoryStatus.ACTIVE],
                        ...(groupId != null ? {group_id: groupId} : {}),
                        limit: 10,
                    });
                    if (requestId !== requestIdRef.current) return;
                    if (memRes?.data) {
                        nextMemories = pickMemories(memRes.data);
                    }
                } catch {
                    // Silent — footer hints are best-effort
                }

                let nextBudgets: ApplicableBudgetItem[] = [];
                try {
                    const budRes = await listApplicableBudgetsApi({
                        expense_date: expenseDate,
                        ...(groupId != null ? {group_id: groupId} : {}),
                        ...(categoryId != null ? {category_id: categoryId} : {}),
                        ...(placeId != null ? {place_id: placeId} : {}),
                        memory_ids: nextMemories.map((m) => m.id),
                        ...(amount != null && amount > 0 ? {amount} : {}),
                        ...(currency ? {currency: String(currency)} : {}),
                    });
                    if (requestId !== requestIdRef.current) return;
                    if (budRes?.data) {
                        nextBudgets = pickBudgets(budRes.data);
                    }
                } catch {
                    // Silent
                }

                if (requestId !== requestIdRef.current) return;
                setMemories(nextMemories);
                setBudgets(nextBudgets);
                hasResolvedRef.current = true;
                setLoading(false);
            })();
        }, DEBOUNCE_MS);

        return () => {
            clearTimeout(timer);
        };
    }, [enabled, expenseDate, groupId, categoryId, placeId, amount, currency]);

    return {memories, budgets, loading};
}
