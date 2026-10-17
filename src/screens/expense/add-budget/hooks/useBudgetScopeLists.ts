import {useCallback, useEffect, useState} from 'react';
import {GetExpenseCategoriesApi} from '@/src/api/expense/categories';
import {ExpenseCategorySource} from '@/src/api/dto/constants';
import {GetAllUserPlacesApi} from '@/src/api/user/place/location';
import {SearchMerchantsApi} from '@/src/api/expense/merchant';
import {GetMemoriesApi} from '@/src/api/user/memory';
import {BudgetMultiSelectItem} from '../components/BudgetMultiSelectSheet';

type ListState = {
    items: BudgetMultiSelectItem[];
    loading: boolean;
    loadingMore: boolean;
    error: string | null;
    offset: number;
    hasMore: boolean;
    search: string;
};

const emptyList = (): ListState => ({
    items: [],
    loading: false,
    loadingMore: false,
    error: null,
    offset: 0,
    hasMore: true,
    search: '',
});

export function useBudgetCategoryList(active: boolean) {
    const [state, setState] = useState<ListState>(emptyList);

    const load = useCallback(async (nextOffset: number, append: boolean, query: string) => {
        setState((prev) => ({
            ...prev,
            loading: !append,
            loadingMore: append,
            error: append ? prev.error : null,
        }));
        try {
            const res = await GetExpenseCategoriesApi(
                [ExpenseCategorySource.DEFAULT, ExpenseCategorySource.CUSTOM],
                nextOffset,
                40,
            );
            const page = res.data ?? [];
            const mapped: BudgetMultiSelectItem[] = page.map((c) => ({
                id: c.id,
                name: c.title,
                iconId: c.icon?.id,
                iconUrl: c.icon?.url,
            }));
            const filtered = query.trim()
                ? mapped.filter((m) =>
                      m.name.toLowerCase().includes(query.trim().toLowerCase()),
                  )
                : mapped;
            setState((prev) => ({
                ...prev,
                items: append
                    ? [
                          ...prev.items,
                          ...filtered.filter(
                              (n) => !prev.items.some((p) => p.id === n.id),
                          ),
                      ]
                    : filtered,
                offset: nextOffset + page.length,
                hasMore: page.length >= 40,
                loading: false,
                loadingMore: false,
                error: !append && !res.data && res.message ? res.message : null,
            }));
        } catch (e: any) {
            setState((prev) => ({
                ...prev,
                loading: false,
                loadingMore: false,
                error: e?.message || 'Failed to load categories',
            }));
        }
    }, []);

    useEffect(() => {
        if (!active) return;
        setState((prev) => ({...emptyList(), search: prev.search}));
        load(0, false, state.search);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active]);

    useEffect(() => {
        if (!active) return;
        const t = setTimeout(() => load(0, false, state.search), 300);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.search]);

    return {
        ...state,
        setSearch: (search: string) => setState((p) => ({...p, search})),
        reload: () => load(0, false, state.search),
        loadMore: () => {
            if (!state.hasMore || state.loadingMore || state.loading) return;
            load(state.offset, true, state.search);
        },
    };
}

export function useBudgetPlaceList(active: boolean) {
    const [state, setState] = useState<ListState>(emptyList);

    const load = useCallback(async (nextOffset: number, append: boolean, query: string) => {
        setState((prev) => ({
            ...prev,
            loading: !append,
            loadingMore: append,
            error: append ? prev.error : null,
        }));
        try {
            const res = await GetAllUserPlacesApi(nextOffset, 30);
            const page = res.data ?? [];
            let mapped: BudgetMultiSelectItem[] = page
                .filter((p) => p.id != null)
                .map((p) => ({
                    id: p.id as number,
                    name: p.name,
                    iconUrl: p.photos?.[0]?.url,
                    iconId: p.photos?.[0]?.id,
                    subtitle: p.city || p.address,
                }));
            if (query.trim()) {
                const q = query.trim().toLowerCase();
                mapped = mapped.filter(
                    (m) =>
                        m.name.toLowerCase().includes(q) ||
                        m.subtitle?.toLowerCase().includes(q),
                );
            }
            setState((prev) => ({
                ...prev,
                items: append
                    ? [
                          ...prev.items,
                          ...mapped.filter(
                              (n) => !prev.items.some((p) => p.id === n.id),
                          ),
                      ]
                    : mapped,
                offset: nextOffset + page.length,
                hasMore: page.length >= 30,
                loading: false,
                loadingMore: false,
            }));
        } catch (e: any) {
            setState((prev) => ({
                ...prev,
                loading: false,
                loadingMore: false,
                error: e?.message || 'Failed to load places',
            }));
        }
    }, []);

    useEffect(() => {
        if (!active) return;
        load(0, false, state.search);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active]);

    useEffect(() => {
        if (!active) return;
        const t = setTimeout(() => load(0, false, state.search), 300);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.search]);

    return {
        ...state,
        setSearch: (search: string) => setState((p) => ({...p, search})),
        reload: () => load(0, false, state.search),
        loadMore: () => {
            if (!state.hasMore || state.loadingMore || state.loading) return;
            load(state.offset, true, state.search);
        },
    };
}

export function useBudgetMerchantList(active: boolean) {
    const [state, setState] = useState<ListState>(emptyList);

    const load = useCallback(async (query: string) => {
        setState((prev) => ({...prev, loading: true, error: null}));
        try {
            const trimmed = query.trim();
            const res = await SearchMerchantsApi({
                q: trimmed || undefined,
                limit: 50,
            });
            const page = res.data ?? [];
            setState((prev) => ({
                ...prev,
                items: page.map((m) => ({
                    id: m.id,
                    name: m.name,
                    iconId: m.logo?.id,
                    iconUrl: m.logo?.url,
                    subtitle: m.mcc_code?.description || m.website || undefined,
                })),
                loading: false,
                hasMore: false,
            }));
        } catch (e: any) {
            setState((prev) => ({
                ...prev,
                loading: false,
                error: e?.message || 'Failed to load merchants',
            }));
        }
    }, []);

    useEffect(() => {
        if (!active) return;
        load(state.search);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active]);

    useEffect(() => {
        if (!active) return;
        const t = setTimeout(() => load(state.search), 400);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.search]);

    return {
        ...state,
        setSearch: (search: string) => setState((p) => ({...p, search})),
        reload: () => load(state.search),
        loadMore: () => undefined,
    };
}

export function useBudgetMemoryList(active: boolean) {
    const [state, setState] = useState<ListState>(emptyList);

    const load = useCallback(async (nextOffset: number, append: boolean, query: string) => {
        setState((prev) => ({
            ...prev,
            loading: !append,
            loadingMore: append,
        }));
        try {
            const res = await GetMemoriesApi({offset: nextOffset, limit: 30});
            const page = res.data ?? [];
            let mapped: BudgetMultiSelectItem[] = page.map((m) => ({
                id: m.id,
                name: m.title,
                iconId: m.icon?.id,
                iconUrl: m.icon?.url,
                subtitle: m.description,
            }));
            if (query.trim()) {
                const q = query.trim().toLowerCase();
                mapped = mapped.filter((m) => m.name.toLowerCase().includes(q));
            }
            setState((prev) => ({
                ...prev,
                items: append
                    ? [
                          ...prev.items,
                          ...mapped.filter(
                              (n) => !prev.items.some((p) => p.id === n.id),
                          ),
                      ]
                    : mapped,
                offset: nextOffset + page.length,
                hasMore: page.length >= 30,
                loading: false,
                loadingMore: false,
            }));
        } catch (e: any) {
            setState((prev) => ({
                ...prev,
                loading: false,
                loadingMore: false,
                error: e?.message || 'Failed to load memories',
            }));
        }
    }, []);

    useEffect(() => {
        if (!active) return;
        load(0, false, state.search);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active]);

    useEffect(() => {
        if (!active) return;
        const t = setTimeout(() => load(0, false, state.search), 300);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.search]);

    return {
        ...state,
        setSearch: (search: string) => setState((p) => ({...p, search})),
        reload: () => load(0, false, state.search),
        loadMore: () => {
            if (!state.hasMore || state.loadingMore || state.loading) return;
            load(state.offset, true, state.search);
        },
    };
}
