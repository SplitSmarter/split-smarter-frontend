import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View, Pressable, ActivityIndicator, StyleSheet, ListRenderItem} from 'react-native';
import {
    BottomSheetModal,
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetFlatList,
} from '@gorhom/bottom-sheet';
import {Iconify} from 'react-native-iconify';
import {useRouter} from 'expo-router';
import {AppText} from "@/src/components/common/AppText";
import {AppImageV2} from "@/src/components/common/AppImageV2";
import {EntityFallbackIcon} from "@/src/components/common/EntityFallbackIcon";
import {AppInput} from "@/src/components/common/AppInput";
import {SheetEmptyState} from "@/src/components/empty-states/SheetEmptyState";
import {themeStore} from '@/src/store/themeStore';
import {COLORS} from '@/src/constants/colors';
import {GetGroupCategoriesApi} from '@/src/api/group/categories';
import {GroupCategoryDetails} from "@/src/api/dto/user/addGroupCategoryRequest";
import {GroupCategorySource} from '@/src/api/dto/constants';
import {PaginationResponse} from '@/src/api/dto/ApiResponse';

const PAGE_SIZE = 24;
const CATEGORY_TYPES = [GroupCategorySource.DEFAULT, GroupCategorySource.CUSTOM];

interface SelectGroupCategoryBottomSheetProps {
    visible: boolean;
    selectedId?: number;
    onClose: () => void;
    onSelect: (category: GroupCategoryDetails) => void;
}

function resolveHasMore(
    pageData: GroupCategoryDetails[],
    offset: number,
    pagination?: PaginationResponse,
): boolean {
    if (typeof pagination?.has_next === 'boolean') {
        return pagination.has_next;
    }
    if (typeof pagination?.total === 'number') {
        return offset + pageData.length < pagination.total;
    }
    return pageData.length >= PAGE_SIZE;
}

export const SelectGroupCategoryBottomSheet = ({
    visible,
    onClose,
    onSelect,
    selectedId,
}: SelectGroupCategoryBottomSheetProps) => {
    const theme = themeStore((state) => state.theme);
    const isDark = theme === 'dark';
    const router = useRouter();

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => ['80%'], []);
    const loadingRef = useRef(false);

    const [categories, setCategories] = useState<GroupCategoryDetails[]>([]);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchCategories = useCallback(async (nextOffset: number, append: boolean) => {
        if (loadingRef.current) return;
        loadingRef.current = true;

        if (append) {
            setLoadingMore(true);
        } else {
            setLoading(true);
            setError(null);
        }

        try {
            const response = await GetGroupCategoriesApi({
                category_type: CATEGORY_TYPES,
                offset: nextOffset,
                limit: PAGE_SIZE,
            });
            const pageData = response.data ?? [];

            setCategories((prev) => {
                if (!append) return pageData;
                const existingIds = new Set(prev.map((item) => item.id));
                return [...prev, ...pageData.filter((item) => !existingIds.has(item.id))];
            });
            setOffset(nextOffset + pageData.length);
            setHasMore(resolveHasMore(pageData, nextOffset, response.pagination));

            if (!append && !response.data && response.message) {
                setError(response.message);
            }
        } catch (err: any) {
            console.error("Failed fetching group categories:", err);
            if (!append) {
                setCategories([]);
                setOffset(0);
                setHasMore(false);
                setError(err?.message || "Couldn't load categories. Check your connection and try again.");
            }
        } finally {
            loadingRef.current = false;
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    const resetAndLoad = useCallback(() => {
        setCategories([]);
        setOffset(0);
        setHasMore(true);
        fetchCategories(0, false);
    }, [fetchCategories]);

    useEffect(() => {
        if (visible) {
            setSearchQuery('');
            resetAndLoad();
            bottomSheetModalRef.current?.present();
        } else {
            setSearchQuery('');
            setError(null);
            setLoadingMore(false);
            bottomSheetModalRef.current?.dismiss();
        }
    }, [visible, resetAndLoad]);

    const trimmedQuery = searchQuery.trim();
    const filteredCategories = useMemo(() => {
        if (!trimmedQuery) return categories;
        const query = trimmedQuery.toLowerCase();
        return categories.filter((cat) => cat.title.toLowerCase().includes(query));
    }, [categories, trimmedQuery]);

    const hasCategories = categories.length > 0;
    const hasResults = filteredCategories.length > 0;
    const isSearching = trimmedQuery.length > 0;
    const showSearch = (hasCategories || isSearching) && !loading && !(error && !hasCategories);
    const emptyIconColor = isDark ? COLORS.dark.icon.primary : COLORS.light.icon.primary;
    const addIconColor = isDark ? COLORS.dark.icon.primary : COLORS.light.icon.primary;
    const headerIconColor = isDark ? COLORS.dark.icon.primary : COLORS.light.icon.primary;
    const spinnerColor = isDark ? COLORS.dark.icon.primary : COLORS.light.icon.primary;

    const handleAddNewCategoryPress = () => {
        onClose();
        setTimeout(() => {
            router.push('/(authenticated)/group/category/add');
        }, 200);
    };

    const handleClearSearch = useCallback(() => setSearchQuery(''), []);

    const handleLoadMore = useCallback(() => {
        if (!hasMore || loadingRef.current || loading || loadingMore) return;
        fetchCategories(offset, true);
    }, [hasMore, loading, loadingMore, offset, fetchCategories]);

    useEffect(() => {
        if (!visible || !isSearching || hasResults || !hasMore || !hasCategories) return;
        if (loading || loadingMore || loadingRef.current) return;
        handleLoadMore();
    }, [
        visible,
        isSearching,
        hasResults,
        hasMore,
        hasCategories,
        loading,
        loadingMore,
        handleLoadMore,
        categories.length,
    ]);

    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                pressBehavior="close"
                opacity={isDark ? 0.7 : 0.4}
            />
        ),
        [isDark]
    );

    const renderCategoryItem = useCallback<ListRenderItem<GroupCategoryDetails>>(
        ({item}) => (
            <Pressable
                onPress={() => onSelect(item)}
                style={styles.gridItem}
                className={`items-center mb-2 p-2 rounded-xl ${
                    item.id === selectedId ? 'bg-accent-sky-bg border border-accent-sky' : ''
                }`}
            >
                <View className="w-14 h-14 mb-2 rounded-full overflow-hidden">
                    <AppImageV2
                        id={item.icon?.id || `group-category-${item.id}`}
                        url={item.icon?.url}
                        style={{width: '100%', height: '100%', borderRadius: 9999}}
                        contentFit="cover"
                        fallbackComponent={
                            <EntityFallbackIcon
                                kind="groupCategory"
                                size={28}
                                color={isDark ? COLORS.dark.icon.lighter : COLORS.light.icon.lighter}
                            />
                        }
                    />
                </View>
                <AppText
                    variant="caption-xs"
                    className="text-center text-text-primary"
                    numberOfLines={1}
                >
                    {item.title}
                </AppText>
            </Pressable>
        ),
        [isDark, onSelect, selectedId]
    );

    const listHeader = useMemo(() => (
        <View className="flex-row items-center justify-between mb-3 px-1">
            <AppText variant="body-base" className="font-bold text-text-primary">
                {isSearching ? 'Results' : 'All Categories'}
            </AppText>
            <AppText variant="caption-xs" className="text-text-primary-lighter">
                {filteredCategories.length}
                {hasMore && !isSearching ? '+' : ''} {filteredCategories.length === 1 ? 'item' : 'items'}
            </AppText>
        </View>
    ), [filteredCategories.length, hasMore, isSearching]);

    const listFooter = useMemo(() => {
        if (!loadingMore) return <View style={styles.footerSpacer}/>;
        return (
            <View style={styles.footerLoading}>
                <ActivityIndicator size="small" color={spinnerColor}/>
                <AppText variant="caption-xs" className="text-text-primary-lighter mt-2">
                    Loading more...
                </AppText>
            </View>
        );
    }, [loadingMore, spinnerColor]);

    const listEmpty = useMemo(() => {
        if (!isSearching) return null;
        if (hasMore || loadingMore) {
            return (
                <View style={styles.centeredBody}>
                    <ActivityIndicator size="small" color={spinnerColor}/>
                    <AppText variant="caption-xs" className="text-text-primary-lighter mt-3">
                        Searching loaded categories...
                    </AppText>
                </View>
            );
        }
        return (
            <SheetEmptyState
                icon={<Iconify icon="heroicons:magnifying-glass-minus" size={32} color={emptyIconColor}/>}
                title="No results found"
                description={`Nothing matched “${trimmedQuery}”. Try a different name or create a new category.`}
                primaryAction={{
                    label: "Clear Search",
                    onPress: handleClearSearch,
                    renderIcon: (color) => <Iconify icon="heroicons:x-mark" size={18} color={color}/>,
                }}
            />
        );
    }, [emptyIconColor, handleClearSearch, hasMore, isSearching, loadingMore, spinnerColor, trimmedQuery]);

    const renderBody = () => {
        if (loading && !hasCategories) {
            return (
                <View style={styles.centeredBody}>
                    <ActivityIndicator size="large" color={spinnerColor}/>
                    <AppText variant="caption-xs" className="text-text-primary-lighter mt-3">
                        Loading categories...
                    </AppText>
                </View>
            );
        }

        if (error && !hasCategories) {
            return (
                <View style={styles.centeredBody}>
                    <SheetEmptyState
                        icon={<Iconify icon="heroicons:exclamation-triangle" size={32} color={emptyIconColor}/>}
                        title="Unable to load categories"
                        description={error}
                        primaryAction={{
                            label: "Try Again",
                            onPress: resetAndLoad,
                            renderIcon: (color) => <Iconify icon="heroicons:arrow-path" size={18} color={color}/>,
                        }}
                    />
                </View>
            );
        }

        if (!hasCategories) {
            return (
                <View style={styles.centeredBody}>
                    <SheetEmptyState
                        icon={<Iconify icon="heroicons:folder" size={32} color={emptyIconColor}/>}
                        title="No categories yet"
                        description="Create your first group category to organize your groups."
                        primaryAction={{
                            label: "Add New Category",
                            onPress: handleAddNewCategoryPress,
                            renderIcon: (color) => <Iconify icon="heroicons:squares-plus" size={18} color={color}/>,
                        }}
                    />
                </View>
            );
        }

        return (
            <View style={styles.listCard} className="bg-bg-primary-lighter border border-border-input">
                <BottomSheetFlatList
                    data={filteredCategories}
                    keyExtractor={(item) => String(item.id)}
                    numColumns={4}
                    renderItem={renderCategoryItem}
                    ListHeaderComponent={listHeader}
                    ListFooterComponent={listFooter}
                    ListEmptyComponent={listEmpty}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.4}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={
                        filteredCategories.length === 0 ? styles.emptyListContent : styles.listContent
                    }
                    style={styles.scroll}
                />
            </View>
        );
    };

    return (
        <BottomSheetModal
            ref={bottomSheetModalRef}
            snapPoints={snapPoints}
            enableDynamicSizing={false}
            enablePanDownToClose
            enableContentPanningGesture
            onDismiss={onClose}
            backdropComponent={renderBackdrop}
            keyboardBehavior="interactive"
            keyboardBlurBehavior="restore"
            backgroundStyle={{
                backgroundColor: isDark ? COLORS.dark.bg.overlay : COLORS.light.bg.overlay,
                borderRadius: 40,
            }}
            handleIndicatorStyle={{
                backgroundColor: isDark ? COLORS.dark.icon.lighter : COLORS.light.icon.lighter,
                width: 48,
                height: 6,
            }}
        >
            <View style={styles.container}>
                <View className="flex-row items-center justify-between py-4 px-6 border-b border-border-input">
                    <Pressable onPress={onClose} className="p-2 rounded-full">
                        <Iconify
                            icon="heroicons:chevron-left"
                            size={24}
                            color={headerIconColor}
                        />
                    </Pressable>
                    <AppText variant="h4" className="font-bold text-text-primary">Select Category</AppText>
                    <Pressable
                        onPress={handleAddNewCategoryPress}
                        className="p-2 rounded-full"
                        accessibilityLabel="Add new category"
                    >
                        <Iconify icon="heroicons:squares-plus" size={24} color={addIconColor}/>
                    </Pressable>
                </View>

                {showSearch ? (
                    <View className="px-6 pt-4 pb-2">
                        <AppInput
                            placeholder="Type to search"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            renderLeftIcon={(color) => (
                                <Iconify icon="heroicons:magnifying-glass" size={20} color={color}/>
                            )}
                            renderRightIcon={(color) =>
                                searchQuery.length > 0 ? (
                                    <Pressable onPress={handleClearSearch} hitSlop={8}>
                                        <Iconify icon="heroicons:x-mark" size={20} color={color}/>
                                    </Pressable>
                                ) : null
                            }
                        />
                    </View>
                ) : null}

                <View style={styles.body}>
                    {renderBody()}
                </View>
            </View>
        </BottomSheetModal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    body: {
        flex: 1,
        paddingHorizontal: 24,
        paddingBottom: 8,
    },
    listCard: {
        flex: 1,
        borderRadius: 24,
        paddingHorizontal: 12,
        paddingTop: 12,
        overflow: 'hidden',
    },
    scroll: {
        flex: 1,
    },
    listContent: {
        paddingBottom: 24,
    },
    emptyListContent: {
        flexGrow: 1,
        paddingBottom: 24,
        justifyContent: 'center',
    },
    gridItem: {
        width: '25%',
    },
    footerSpacer: {
        height: 16,
    },
    footerLoading: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    centeredBody: {
        flex: 1,
        justifyContent: 'center',
    },
});

SelectGroupCategoryBottomSheet.displayName = 'SelectGroupCategoryBottomSheet';
