import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View, Pressable, ActivityIndicator, StyleSheet} from 'react-native';
import {
    BottomSheetModal,
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import {Iconify} from 'react-native-iconify';
import {useRouter} from 'expo-router';
import {AppText} from "@/src/components/common/AppText";
import {AppInput} from "@/src/components/common/AppInput";
import {SheetEmptyState} from "@/src/components/empty-states/SheetEmptyState";
import {themeStore} from '@/src/store/themeStore';
import {COLORS} from '@/src/constants/colors';
import {GetGroupsApi} from '@/src/api/group/group';
import {GroupDetails} from '@/src/api/dto/user/group';
import {GroupListContent} from '@/src/components/user/GroupListContent';
import {PaginationResponse} from '@/src/api/dto/ApiResponse';

const PAGE_SIZE = 20;

interface SelectGroupBottomSheetProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (group: GroupDetails) => void;
    selectedId?: number;
}

function resolveHasMore(
    pageData: GroupDetails[],
    nextOffset: number,
    pagination?: PaginationResponse,
): boolean {
    if (typeof pagination?.has_next === 'boolean') {
        return pagination.has_next;
    }
    if (typeof pagination?.total === 'number') {
        return nextOffset + pageData.length < pagination.total;
    }
    return pageData.length >= PAGE_SIZE;
}

export const SelectGroupBottomSheet = ({
    visible,
    onClose,
    onSelect,
    selectedId,
}: SelectGroupBottomSheetProps) => {
    const theme = themeStore((state) => state.theme);
    const isDark = theme === 'dark';
    const router = useRouter();

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => ['85%'], []);
    const loadingRef = useRef(false);

    const [groups, setGroups] = useState<GroupDetails[]>([]);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchGroups = useCallback(async (nextOffset: number, append: boolean) => {
        if (loadingRef.current) return;
        loadingRef.current = true;

        if (append) {
            setLoadingMore(true);
        } else {
            setLoading(true);
            setError(null);
        }

        try {
            const response = await GetGroupsApi({offset: nextOffset, limit: PAGE_SIZE});
            const pageData = (response.data ?? []) as GroupDetails[];

            setGroups((prev) => {
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
            console.error("Critical error while collecting group metadata lists:", err);
            if (!append) {
                setGroups([]);
                setOffset(0);
                setHasMore(false);
                setError(err?.message || "Couldn't load groups. Check your connection and try again.");
            }
        } finally {
            loadingRef.current = false;
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    const resetAndLoad = useCallback(() => {
        setGroups([]);
        setOffset(0);
        setHasMore(true);
        fetchGroups(0, false);
    }, [fetchGroups]);

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
    const filteredGroups = useMemo(() => {
        if (!trimmedQuery) return groups;
        const query = trimmedQuery.toLowerCase();
        return groups.filter((g) => g.title.toLowerCase().includes(query));
    }, [groups, trimmedQuery]);

    const hasGroups = groups.length > 0;
    const isSearching = trimmedQuery.length > 0;
    const showSearch = (hasGroups || isSearching) && !loading && !(error && !hasGroups);
    const emptyIconColor = isDark ? COLORS.dark.icon.primary : COLORS.light.icon.primary;
    const addIconColor = isDark ? COLORS.dark.icon.primary : COLORS.light.icon.primary;

    const handleAddNewGroupPress = () => {
        onClose();
        setTimeout(() => {
            router.push('/(authenticated)/user/group/add');
        }, 200);
    };

    const handleClearSearch = () => setSearchQuery('');

    const handleLoadMore = useCallback(() => {
        if (!hasMore || loadingRef.current || loading || loadingMore) return;
        fetchGroups(offset, true);
    }, [hasMore, loading, loadingMore, offset, fetchGroups]);

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

    const renderBody = () => {
        if (loading && !hasGroups) {
            return (
                <View style={styles.centeredBody}>
                    <ActivityIndicator size="large" color={COLORS.light.icon.primary}/>
                    <AppText variant="caption-xs" className="text-text-primary-lighter mt-3">
                        Loading groups...
                    </AppText>
                </View>
            );
        }

        if (error && !hasGroups) {
            return (
                <View style={styles.centeredBody}>
                    <SheetEmptyState
                        icon={<Iconify icon="heroicons:exclamation-triangle" size={32} color={emptyIconColor}/>}
                        title="Unable to load groups"
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

        return (
            <GroupListContent
                searchQuery={searchQuery}
                filteredGroups={filteredGroups}
                totalCount={groups.length}
                hasMore={hasMore}
                loadingMore={loadingMore}
                selectedId={selectedId}
                onSelect={onSelect}
                onAddNew={handleAddNewGroupPress}
                onClearSearch={handleClearSearch}
                onLoadMore={handleLoadMore}
                isDark={isDark}
            />
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
                    <Pressable onPress={onClose} className="p-2 rounded-full active:opacity-60">
                        <Iconify
                            icon="heroicons:chevron-left"
                            size={24}
                            color={isDark ? COLORS.dark.text.primary : COLORS.light.text.primary}
                        />
                    </Pressable>
                    <AppText variant="h4" className="font-bold text-text-primary text-center">
                        Select Group
                    </AppText>
                    <Pressable
                        onPress={handleAddNewGroupPress}
                        className="p-2 rounded-full active:opacity-60"
                        accessibilityLabel="Create new group"
                    >
                        <Iconify icon="heroicons:plus-circle" size={24} color={addIconColor}/>
                    </Pressable>
                </View>

                {showSearch ? (
                    <View className="px-4 pt-4 pb-2">
                        <AppInput
                            placeholder="Search group name..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            renderLeftIcon={(c) => (
                                <Iconify icon="heroicons:magnifying-glass" size={20} color={c}/>
                            )}
                            renderRightIcon={(c) =>
                                searchQuery.length > 0 ? (
                                    <Pressable onPress={handleClearSearch} hitSlop={8}>
                                        <Iconify icon="heroicons:x-mark" size={20} color={c}/>
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
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    centeredBody: {
        flex: 1,
        justifyContent: 'center',
    },
});

SelectGroupBottomSheet.displayName = 'SelectGroupBottomSheet';
