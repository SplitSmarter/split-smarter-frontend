import {useCallback, useEffect, useRef, useState} from 'react';
import {
    BrowseCoicopCategoriesApi,
    GetExpenseCategoriesApi,
    SearchExpenseCategoriesApi,
} from '@/src/api/expense/categories';
import {ExpenseCategorySource} from '@/src/api/dto/constants';
import {ExpenseCategoryDescendantItem} from '@/src/api/dto/expense/category';
import {BrowseStackEntry} from '@/src/components/expense/multi-level-category/types';

const PAGE_SIZE = 40;
/** Custom / “Yours” — load in one shot (no scroll paging). */
const CUSTOM_LIMIT = 200;

export type SheetTab = 'levels' | 'list' | 'selected' | 'yours';

type BrowseState = {
    items: ExpenseCategoryDescendantItem[];
    loading: boolean;
    loadingMore: boolean;
    error: string | null;
    offset: number;
    hasMore: boolean;
};

const emptyBrowse = (): BrowseState => ({
    items: [],
    loading: false,
    loadingMore: false,
    error: null,
    offset: 0,
    hasMore: true,
});

function mapListItem(c: {
    id: number;
    title: string;
    description?: string | null;
    icon?: ExpenseCategoryDescendantItem['icon'];
    source_type: string | ExpenseCategorySource;
}): ExpenseCategoryDescendantItem {
    return {
        id: c.id,
        title: c.title,
        description: c.description,
        category_ref: null,
        source_type: String(c.source_type).toUpperCase(),
        level: null,
        icon: c.icon,
    };
}

export function useMultiLevelCategoryBrowse(active: boolean, tab: SheetTab, searchQuery: string) {
    const [stack, setStack] = useState<BrowseStackEntry[]>([
        {level: 1, parentRef: null, title: 'Levels'},
    ]);
    const [browse, setBrowse] = useState<BrowseState>(emptyBrowse);
    /** System catalog — paginated. */
    const [list, setList] = useState<BrowseState>(emptyBrowse);
    /** User-created categories — loaded fully when Yours is active. */
    const [yours, setYours] = useState<BrowseState>(emptyBrowse);
    const [searchItems, setSearchItems] = useState<ExpenseCategoryDescendantItem[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [debouncedQuery, setDebouncedQuery] = useState('');

    const current = stack[stack.length - 1];

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setDebouncedQuery(searchQuery.trim());
        }, 350);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [searchQuery]);

    const loadLevels = useCallback(
        async (entry: BrowseStackEntry, nextOffset: number, append: boolean) => {
            setBrowse((prev) => ({
                ...prev,
                loading: !append,
                loadingMore: append,
                error: append ? prev.error : null,
            }));
            try {
                const res = await BrowseCoicopCategoriesApi({
                    level: entry.level,
                    parents: entry.parentRef ? [entry.parentRef] : undefined,
                    match: 'any',
                    offset: nextOffset,
                    limit: PAGE_SIZE,
                });
                const page = res.data?.categories ?? [];
                setBrowse((prev) => ({
                    ...prev,
                    items: append
                        ? [
                              ...prev.items,
                              ...page.filter((n) => !prev.items.some((p) => p.id === n.id)),
                          ]
                        : page,
                    offset: nextOffset + page.length,
                    hasMore: page.length >= PAGE_SIZE,
                    loading: false,
                    loadingMore: false,
                    error: !append && !res.data && res.message ? res.message : null,
                }));
            } catch (e: any) {
                setBrowse((prev) => ({
                    ...prev,
                    loading: false,
                    loadingMore: false,
                    error: e?.message || 'Failed to load categories',
                }));
            }
        },
        [],
    );

    const loadSystemList = useCallback(async (nextOffset: number, append: boolean) => {
        setList((prev) => ({
            ...prev,
            loading: !append,
            loadingMore: append,
            error: append ? prev.error : null,
        }));
        try {
            const res = await GetExpenseCategoriesApi(
                [ExpenseCategorySource.DEFAULT],
                nextOffset,
                PAGE_SIZE,
            );
            const page = (res.data ?? []).map(mapListItem);
            setList((prev) => ({
                ...prev,
                items: append
                    ? [
                          ...prev.items,
                          ...page.filter((n) => !prev.items.some((p) => p.id === n.id)),
                      ]
                    : page,
                offset: nextOffset + page.length,
                hasMore:
                    typeof res.pagination?.has_next === 'boolean'
                        ? res.pagination.has_next
                        : page.length >= PAGE_SIZE,
                loading: false,
                loadingMore: false,
                error: !append && !res.data && res.message ? res.message : null,
            }));
        } catch (e: any) {
            setList((prev) => ({
                ...prev,
                loading: false,
                loadingMore: false,
                error: e?.message || 'Failed to load categories',
            }));
        }
    }, []);

    const loadYours = useCallback(async () => {
        setYours((prev) => ({
            ...prev,
            loading: true,
            loadingMore: false,
            error: null,
        }));
        try {
            const res = await GetExpenseCategoriesApi(
                [ExpenseCategorySource.CUSTOM],
                0,
                CUSTOM_LIMIT,
            );
            const page = (res.data ?? []).map(mapListItem);
            setYours({
                items: page,
                offset: page.length,
                hasMore: false,
                loading: false,
                loadingMore: false,
                error: !res.data && res.message ? res.message : null,
            });
        } catch (e: any) {
            setYours({
                items: [],
                offset: 0,
                hasMore: false,
                loading: false,
                loadingMore: false,
                error: e?.message || 'Failed to load your categories',
            });
        }
    }, []);

    useEffect(() => {
        if (!active) return;
        setStack([{level: 1, parentRef: null, title: 'Levels'}]);
        setBrowse(emptyBrowse());
        setList(emptyBrowse());
        setYours(emptyBrowse());
        setSearchItems([]);
        setSearchError(null);
    }, [active]);

    useEffect(() => {
        if (!active || tab !== 'levels' || debouncedQuery) return;
        void loadLevels(current, 0, false);
    }, [active, tab, current.level, current.parentRef, debouncedQuery, loadLevels, current]);

    useEffect(() => {
        if (!active || tab !== 'list' || debouncedQuery) return;
        void loadSystemList(0, false);
    }, [active, tab, debouncedQuery, loadSystemList]);

    useEffect(() => {
        if (!active || tab !== 'yours' || debouncedQuery) return;
        void loadYours();
    }, [active, tab, debouncedQuery, loadYours]);

    useEffect(() => {
        if (!active || tab === 'selected' || !debouncedQuery) {
            if (!debouncedQuery || tab === 'selected') {
                setSearchItems([]);
                setSearchError(null);
                setSearchLoading(false);
            }
            return;
        }

        let cancelled = false;
        setSearchLoading(true);
        setSearchError(null);

        const scope =
            tab === 'yours' ? 'CUSTOM' : tab === 'list' ? 'GLOBAL' : 'ALL';

        void (async () => {
            try {
                const res = await SearchExpenseCategoriesApi({
                    query: debouncedQuery,
                    scope,
                    offset: 0,
                    limit: PAGE_SIZE,
                });
                if (cancelled) return;
                const custom = res.data?.custom_categories ?? [];
                const master = res.data?.master_categories ?? [];
                const merged: ExpenseCategoryDescendantItem[] = [
                    ...custom.map((c) => ({
                        id: c.id,
                        title: c.title,
                        description: c.description,
                        category_ref: c.category_ref,
                        source_type: c.source_type,
                        level: null,
                        icon: c.icon,
                    })),
                    ...master.map((c) => ({
                        id: c.id,
                        title: c.title,
                        description: c.description,
                        category_ref: c.category_ref,
                        level: null,
                        source_type: c.source_type,
                        icon: c.icon,
                    })),
                ];
                setSearchItems(merged);
                setSearchLoading(false);
                if (!res.data && res.message) setSearchError(res.message);
            } catch (e: any) {
                if (cancelled) return;
                setSearchItems([]);
                setSearchLoading(false);
                setSearchError(e?.message || 'Search failed');
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [active, debouncedQuery, tab]);

    const drillInto = useCallback((item: ExpenseCategoryDescendantItem) => {
        if (!item.category_ref) return;
        const nextLevel = (item.level ?? 1) + 1;
        setStack((prev) => [
            ...prev,
            {
                level: nextLevel,
                parentRef: item.category_ref!,
                title: item.title,
                categoryId: item.id,
                description: item.description,
                sourceType: String(item.source_type ?? ''),
                iconId: item.icon?.id,
                iconUrl: item.icon?.url,
            },
        ]);
        setBrowse(emptyBrowse());
    }, []);

    const goBack = useCallback(() => {
        setStack((prev) => {
            if (prev.length <= 1) return prev;
            return prev.slice(0, -1);
        });
        setBrowse(emptyBrowse());
    }, []);

    const loadMore = useCallback(() => {
        if (debouncedQuery || tab === 'selected' || tab === 'yours') return;
        if (tab === 'levels') {
            if (!browse.hasMore || browse.loading || browse.loadingMore) return;
            void loadLevels(current, browse.offset, true);
        } else if (tab === 'list') {
            if (!list.hasMore || list.loading || list.loadingMore) return;
            void loadSystemList(list.offset, true);
        }
    }, [
        browse.hasMore,
        browse.loading,
        browse.loadingMore,
        browse.offset,
        current,
        debouncedQuery,
        list.hasMore,
        list.loading,
        list.loadingMore,
        list.offset,
        loadLevels,
        loadSystemList,
        tab,
    ]);

    const reload = useCallback(() => {
        if (debouncedQuery || tab === 'selected') return;
        if (tab === 'levels') void loadLevels(current, 0, false);
        else if (tab === 'list') void loadSystemList(0, false);
        else if (tab === 'yours') void loadYours();
    }, [current, debouncedQuery, loadLevels, loadSystemList, loadYours, tab]);

    const isSearching = tab !== 'selected' && debouncedQuery.length > 0;
    const activeState =
        tab === 'levels' ? browse : tab === 'yours' ? yours : list;

    return {
        stack,
        current,
        drillInto,
        goBack,
        canGoBack: stack.length > 1,
        items: isSearching ? searchItems : tab === 'selected' ? [] : activeState.items,
        loading: tab === 'selected' ? false : isSearching ? searchLoading : activeState.loading,
        loadingMore:
            tab === 'selected' || tab === 'yours' || isSearching
                ? false
                : activeState.loadingMore,
        error: tab === 'selected' ? null : isSearching ? searchError : activeState.error,
        loadMore,
        reload,
        isSearching,
    };
}
