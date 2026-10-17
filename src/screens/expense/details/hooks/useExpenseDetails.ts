import {useCallback, useEffect, useMemo, useState} from 'react';
import {getExpenseByIdApi} from '@/src/api/expense/expense';
import {GetExpenseItemByIdApi} from '@/src/api/expense/item';
import {listSettlementLinksApi} from '@/src/api/expense/settlement';
import {listPaymentLinksApi} from '@/src/api/expense/payment_link';
import type {
    ExpenseDetailsBasicResponse,
    ExpenseDetailsResponse,
} from '@/src/api/dto/expense/expense';
import type {BaseSettlementDetails} from '@/src/api/dto/expense/settlement';
import type {PaymentLinkDetails} from '@/src/api/dto/expense/payment_link';
import type {PaymentLinkSummary} from '@/src/api/dto/expense/expense';
import {getMapExpenseById} from '@/src/screens/spatial-map/data/mapExpenseData';
import {userStore} from '@/src/store/userStore';
import {computeViewerPosition} from '@/src/screens/expense/details/utils/viewerPosition';

export type ExpenseDetailsView =
    | ExpenseDetailsBasicResponse
    | ExpenseDetailsResponse;

function isFullDetails(
    e: ExpenseDetailsView | null,
): e is ExpenseDetailsResponse {
    return (
        e != null &&
        'line_items' in e &&
        Array.isArray((e as ExpenseDetailsResponse).line_items)
    );
}

function viewerIsPayer(
    expense: ExpenseDetailsView | null,
    viewerId: number | null | undefined,
): boolean {
    if (!expense || viewerId == null) return false;
    return (expense.paid_by_users ?? []).some((u) => u.id === viewerId);
}

interface UseExpenseDetailsOptions {
    seed?: ExpenseDetailsBasicResponse | null;
    resolveItemTitles?: boolean;
    useDummy?: boolean;
}

export function useExpenseDetails(
    expenseId: number | null | undefined,
    options: UseExpenseDetailsOptions = {},
) {
    const {
        seed = null,
        resolveItemTitles = true,
        useDummy = false,
    } = options;
    const viewerId = userStore((s) => s.user?.id ?? null);

    const [expense, setExpense] = useState<ExpenseDetailsView | null>(seed);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [itemTitles, setItemTitles] = useState<Record<number, string>>({});
    const [settlements, setSettlements] = useState<BaseSettlementDetails[]>([]);
    const [paymentLinks, setPaymentLinks] = useState<
        Array<PaymentLinkDetails | PaymentLinkSummary>
    >([]);
    const [linksLoading, setLinksLoading] = useState(false);

    useEffect(() => {
        if (seed) setExpense(seed);
    }, [seed]);

    const hydrateLinks = useCallback(
        async (id: number, expenseData: ExpenseDetailsView) => {
            setLinksLoading(true);
            try {
                const settleRes = await listSettlementLinksApi({
                    expense_id: id,
                    limit: 100,
                });
                setSettlements(settleRes.data ?? []);

                // Payment / payout cover: only fetch when viewer is a paid-by user.
                // Backend already scopes results to the authenticated user.
                if (viewerIsPayer(expenseData, viewerId)) {
                    const payRes = await listPaymentLinksApi({
                        expense_id: id,
                        limit: 100,
                    });
                    setPaymentLinks(payRes.data ?? []);
                } else {
                    // Fall back to embeds on expense (also user-scoped when present)
                    setPaymentLinks(expenseData.payment_links ?? []);
                }
            } catch {
                setSettlements([]);
                setPaymentLinks(expenseData.payment_links ?? []);
            } finally {
                setLinksLoading(false);
            }
        },
        [viewerId],
    );

    const hydrate = useCallback(async () => {
        if (expenseId == null || Number.isNaN(expenseId)) return;
        setLoading(true);
        setError(null);
        try {
            if (useDummy) {
                const data = await getMapExpenseById(expenseId);
                if (!data) {
                    setError('Expense not found in map dummy data');
                    return;
                }
                setExpense(data);
                setSettlements([]);
                setPaymentLinks(data.payment_links ?? []);
                return;
            }

            const res = await getExpenseByIdApi(expenseId);
            const data = {
                ...res.data,
                payment_links: res.data.payment_links ?? [],
                line_items: res.data.line_items ?? [],
                assets: res.data.assets ?? [],
                extra_details: res.data.extra_details ?? [],
            };
            setExpense(data);
            await hydrateLinks(expenseId, data);
        } catch (e: any) {
            setError(e?.message ?? 'Failed to load expense');
        } finally {
            setLoading(false);
        }
    }, [expenseId, useDummy, hydrateLinks]);

    useEffect(() => {
        void hydrate();
    }, [hydrate]);

    const lineItemIds = useMemo(() => {
        if (!isFullDetails(expense)) return [] as number[];
        const ids = new Set<number>();
        expense.line_items.forEach((li) => {
            if (li.expense_item_id != null) ids.add(li.expense_item_id);
        });
        return Array.from(ids);
    }, [expense]);

    useEffect(() => {
        if (useDummy || !resolveItemTitles || lineItemIds.length === 0) return;
        let cancelled = false;

        void (async () => {
            const next: Record<number, string> = {};
            await Promise.all(
                lineItemIds.map(async (id) => {
                    try {
                        const res = await GetExpenseItemByIdApi(id);
                        if (res.data?.title) next[id] = res.data.title;
                    } catch {
                        // Soft gap
                    }
                }),
            );
            if (!cancelled) {
                setItemTitles((prev) => ({...prev, ...next}));
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [lineItemIds, resolveItemTitles, useDummy]);

    useEffect(() => {
        if (!useDummy || !isFullDetails(expense)) return;
        const next: Record<number, string> = {};
        const catTitle = expense.category?.title;
        expense.line_items.forEach((li) => {
            if (catTitle) next[li.expense_item_id] = catTitle;
        });
        if (Object.keys(next).length) setItemTitles((prev) => ({...prev, ...next}));
    }, [expense, useDummy]);

    const position = useMemo(() => {
        if (!expense) return null;
        return computeViewerPosition(expense, settlements, viewerId);
    }, [expense, settlements, viewerId]);

    const isViewerPayer = viewerIsPayer(expense, viewerId);

    return {
        expense,
        loading,
        error,
        itemTitles,
        isHydrated: isFullDetails(expense),
        refresh: hydrate,
        settlements,
        paymentLinks,
        linksLoading,
        position,
        isViewerPayer,
        viewerId,
    };
}
