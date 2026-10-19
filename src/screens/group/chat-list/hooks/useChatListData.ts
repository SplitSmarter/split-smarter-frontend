import {useCallback, useEffect, useRef, useState} from 'react';
import {GroupStatus} from '@/src/api/dto/constants';
import type {PaginationResponse} from '@/src/api/dto/ApiResponse';
import type {ExpenseDetailsBasicResponse} from '@/src/api/dto/expense/expense';
import type {BaseGroupDetails} from '@/src/api/dto/user/group';
import {listUserExpensesApi} from '@/src/api/expense/expense';
import {GetGroupsApi} from '@/src/api/group/group';
import type {DateRangeResult} from '@/src/components/common/types/dateRangeBottomSheet.types';

const EXPENSE_PAGE_SIZE = 20;

function resolveHasMore(
    rawPageLength: number,
    requestOffset: number,
    limit: number,
    pagination?: PaginationResponse,
): boolean {
    if (typeof pagination?.has_next === 'boolean') {
        return pagination.has_next;
    }
    const returned =
        typeof pagination?.returned === 'number' ? pagination.returned : rawPageLength;
    if (typeof pagination?.total === 'number') {
        return requestOffset + returned < pagination.total;
    }
    return rawPageLength >= limit;
}

function mergeExpensesById(
    existing: ExpenseDetailsBasicResponse[],
    incoming: ExpenseDetailsBasicResponse[],
): ExpenseDetailsBasicResponse[] {
    if (existing.length === 0) return incoming;
    const seen = new Set(existing.map((e) => e.id));
    const next = [...existing];
    for (const row of incoming) {
        if (!seen.has(row.id)) {
            seen.add(row.id);
            next.push(row);
        }
    }
    return next;
}

export function useChatListData(dateRange: DateRangeResult | null) {
    const [groups, setGroups] = useState<BaseGroupDetails[]>([]);
    const [expenses, setExpenses] = useState<ExpenseDetailsBasicResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMoreExpenses, setHasMoreExpenses] = useState(true);

    const expenseOffsetRef = useRef(0);
    const loadingMoreRef = useRef(false);

    const expenseQueryParams = useCallback(
        (offset: number) => ({
            offset,
            limit: EXPENSE_PAGE_SIZE,
            ...(dateRange
                ? {start_date: dateRange.startDate, end_date: dateRange.endDate}
                : {}),
        }),
        [dateRange],
    );

    const fetchGroups = useCallback(async () => {
        const groupsRes = await GetGroupsApi({statuses: [GroupStatus.ACTIVE]});
        if (groupsRes?.data) setGroups(groupsRes.data);
    }, []);

    const fetchExpensesPage = useCallback(
        async (offset: number, append: boolean) => {
            const expensesRes = await listUserExpensesApi(expenseQueryParams(offset));
            const page = expensesRes?.data ?? [];
            const pagination = expensesRes?.pagination;

            setExpenses((prev) => (append ? mergeExpensesById(prev, page) : page));
            expenseOffsetRef.current = offset + page.length;
            setHasMoreExpenses(
                resolveHasMore(page.length, offset, EXPENSE_PAGE_SIZE, pagination),
            );
        },
        [expenseQueryParams],
    );

    const reload = useCallback(
        async (opts?: {isRefresh?: boolean}) => {
            const isRefresh = opts?.isRefresh ?? false;
            if (isRefresh) setRefreshing(true);
            else setLoading(true);

            expenseOffsetRef.current = 0;
            setHasMoreExpenses(true);

            try {
                await Promise.all([fetchGroups(), fetchExpensesPage(0, false)]);
            } catch (error) {
                console.error('Chat list sync failed:', error);
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [fetchGroups, fetchExpensesPage],
    );

    useEffect(() => {
        void reload();
    }, [reload]);

    const handleRefresh = useCallback(() => {
        void reload({isRefresh: true});
    }, [reload]);

    const loadMoreExpenses = useCallback(async () => {
        if (!hasMoreExpenses || loadingMoreRef.current || loading || refreshing) {
            return;
        }
        loadingMoreRef.current = true;
        setLoadingMore(true);
        try {
            await fetchExpensesPage(expenseOffsetRef.current, true);
        } catch (error) {
            console.error('Chat list load more failed:', error);
        } finally {
            loadingMoreRef.current = false;
            setLoadingMore(false);
        }
    }, [hasMoreExpenses, loading, refreshing, fetchExpensesPage]);

    return {
        groups,
        expenses,
        loading,
        refreshing,
        loadingMore,
        hasMoreExpenses,
        handleRefresh,
        loadMoreExpenses,
    };
}
