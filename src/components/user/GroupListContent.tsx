import React, {useCallback, useMemo} from 'react';
import { COLORS } from '@/src/constants/colors';
import {View, Pressable, StyleSheet, ActivityIndicator, ListRenderItem} from 'react-native';
import {BottomSheetFlatList} from '@gorhom/bottom-sheet';
import {Iconify} from 'react-native-iconify';
import {AppText} from "@/src/components/common/AppText";
import {AppImage} from "@/src/components/common/AppImage";
import {EntityFallbackIcon} from "@/src/components/common/EntityFallbackIcon";
import {SheetEmptyState} from "@/src/components/empty-states/SheetEmptyState";
import {GroupDetails} from '@/src/api/dto/user/group';

interface GroupListContentProps {
    searchQuery: string;
    filteredGroups: GroupDetails[];
    totalCount: number;
    hasMore: boolean;
    loadingMore: boolean;
    selectedId?: number;
    onSelect: (group: GroupDetails) => void;
    onAddNew: () => void;
    onClearSearch: () => void;
    onLoadMore: () => void;
    isDark: boolean;
}

export const GroupListContent = React.memo<GroupListContentProps>(({
    searchQuery,
    filteredGroups,
    totalCount,
    hasMore,
    loadingMore,
    selectedId,
    onSelect,
    onAddNew,
    onClearSearch,
    onLoadMore,
    isDark,
}: GroupListContentProps) => {
    const colors = isDark ? COLORS.dark : COLORS.light;
    const trimmedQuery = searchQuery.trim();
    const isSearching = trimmedQuery.length > 0;
    const emptyIconColor = colors.icon.primary;

    const renderItem = useCallback<ListRenderItem<GroupDetails>>(
        ({item}) => (
            <Pressable
                onPress={() => onSelect(item)}
                className={`flex-row items-center py-3 px-2 rounded-2xl mb-1 ${item.id === selectedId ? 'bg-accent-sky-bg' : ''}`}
            >
                <View className="w-14 h-14 mr-4">
                    <AppImage
                        id={item.icon?.id}
                        url={item.icon?.url}
                        variant="circular"
                        size="full"
                        fallbackIcon={
                            <EntityFallbackIcon kind="group" size={28} color={colors.icon.lighter}/>
                        }
                    />
                </View>
                <View className="flex-1">
                    <AppText variant="body-base" className="font-semibold text-text-primary">
                        {item.title}
                    </AppText>
                    <AppText variant="caption-xs" className="opacity-60">Active Group</AppText>
                </View>
                <View className="flex-row-reverse">
                    {[1, 2, 3].map((i) => (
                        <View
                            key={i}
                            className="-mr-2 border-2 border-bg-primary-lighter rounded-full overflow-hidden w-6 h-6 bg-bg-primary"
                        >
                            <Iconify
                                icon="heroicons:user-circle"
                                size={20}
                                color={colors.icon.lighter}
                            />
                        </View>
                    ))}
                </View>
            </Pressable>
        ),
        [colors.icon.lighter, onSelect, selectedId]
    );

    const listHeader = useMemo(() => (
        <View className="flex-row items-center justify-between mb-4">
            <AppText variant="h4" className="text-text-primary">
                {isSearching ? 'Results' : 'All Groups'}
            </AppText>
            <AppText variant="caption-xs" className="text-text-primary-lighter">
                {filteredGroups.length}
                {hasMore && !isSearching ? '+' : ''} {filteredGroups.length === 1 ? 'group' : 'groups'}
            </AppText>
        </View>
    ), [filteredGroups.length, hasMore, isSearching]);

    const listFooter = useMemo(() => {
        if (!loadingMore) return <View style={styles.footerSpacer}/>;
        return (
            <View style={styles.footerLoading}>
                <ActivityIndicator size="small" color={colors.icon.primary}/>
                <AppText variant="caption-xs" className="text-text-primary-lighter mt-2">
                    Loading more...
                </AppText>
            </View>
        );
    }, [colors.icon.primary, loadingMore]);

    const listEmpty = useMemo(() => {
        if (!isSearching) return null;
        return (
            <SheetEmptyState
                icon={<Iconify icon="heroicons:magnifying-glass-minus" size={32} color={emptyIconColor}/>}
                title="No results found"
                description={
                    hasMore
                        ? `Nothing matched “${trimmedQuery}” in loaded groups. Scroll or clear search to keep browsing.`
                        : `Nothing matched “${trimmedQuery}”. Try another name or create a new group.`
                }
                primaryAction={{
                    label: "Clear Search",
                    onPress: onClearSearch,
                    renderIcon: (color) => <Iconify icon="heroicons:x-mark" size={18} color={color}/>,
                }}
            />
        );
    }, [emptyIconColor, hasMore, isSearching, onClearSearch, trimmedQuery]);

    if (totalCount === 0) {
        return (
            <View style={styles.centeredBody}>
                <SheetEmptyState
                    icon={<Iconify icon="heroicons:user-group" size={32} color={emptyIconColor}/>}
                    title="No groups yet"
                    description="Create a group to split expenses and track shared spending with others."
                    primaryAction={{
                        label: "Create New Group",
                        onPress: onAddNew,
                        renderIcon: (color) => <Iconify icon="heroicons:plus-circle" size={18} color={color}/>,
                    }}
                />
            </View>
        );
    }

    return (
        <View style={[styles.listCard, { backgroundColor: colors.bg.lighter }]}>
            <BottomSheetFlatList
                data={filteredGroups}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderItem}
                ListHeaderComponent={listHeader}
                ListFooterComponent={listFooter}
                ListEmptyComponent={listEmpty}
                onEndReached={onLoadMore}
                onEndReachedThreshold={0.4}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={
                    filteredGroups.length === 0 ? styles.emptyListContent : styles.listContent
                }
                style={styles.scroll}
            />
        </View>
    );
});

const styles = StyleSheet.create({
    scroll: {
        flex: 1,
    },
    listCard: {
        flex: 1,
        borderRadius: 32,
        paddingHorizontal: 16,
        paddingTop: 16,
        overflow: 'hidden',
    },
    listContent: {
        paddingBottom: 24,
    },
    emptyListContent: {
        flexGrow: 1,
        paddingBottom: 24,
        justifyContent: 'center',
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

GroupListContent.displayName = 'GroupListContent';
