import React, {useCallback, useMemo} from 'react';
import {COLORS} from '@/src/constants/colors';
import {View, Pressable, StyleSheet, ActivityIndicator, ListRenderItem} from 'react-native';
import {BottomSheetFlatList} from '@gorhom/bottom-sheet';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {AppImageV2} from '@/src/components/common/AppImageV2';
import {EntityFallbackIcon} from '@/src/components/common/EntityFallbackIcon';
import {SheetEmptyState} from '@/src/components/empty-states/SheetEmptyState';
import {BaseGroupDetails, GroupMemberDetails} from '@/src/api/dto/user/group';

const MAX_MEMBER_AVATARS = 3;

interface GroupListContentProps {
    searchQuery: string;
    filteredGroups: BaseGroupDetails[];
    totalCount: number;
    hasMore: boolean;
    loadingMore: boolean;
    selectedId?: number;
    /** Preview members keyed by group id (first few for the avatar stack). */
    memberPreviews?: Record<number, GroupMemberDetails[]>;
    onSelect: (group: BaseGroupDetails) => void;
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
    memberPreviews = {},
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
    const listSurface = colors.bg.lighter;
    const selectedSurface = isDark ? 'rgba(56, 189, 248, 0.18)' : 'rgba(14, 165, 233, 0.12)';

    const renderItem = useCallback<ListRenderItem<BaseGroupDetails>>(
        ({item}) => {
            const isSelected = item.id === selectedId;
            const rowSurface = isSelected ? selectedSurface : listSurface;
            const memberCount = item.no_of_members ?? 0;
            const membersLabel =
                memberCount === 1 ? '1 member' : `${memberCount} members`;
            const preview = (memberPreviews[item.id] ?? []).slice(0, MAX_MEMBER_AVATARS);
            const overflow =
                memberCount > preview.length ? memberCount - preview.length : 0;

            return (
                <Pressable
                    onPress={() => onSelect(item)}
                    className="mb-1 flex-row items-center rounded-2xl px-2 py-3"
                    style={{backgroundColor: isSelected ? selectedSurface : 'transparent'}}
                    accessibilityRole="button"
                    accessibilityState={{selected: isSelected}}
                    accessibilityLabel={`${item.title}, ${membersLabel}`}
                >
                    <View
                        className="mr-4 h-14 w-14 items-center justify-center overflow-hidden rounded-full"
                        style={{backgroundColor: rowSurface}}
                    >
                        <AppImageV2
                            id={item.icon?.id ?? `group-icon-${item.id}`}
                            url={item.icon?.url}
                            style={{width: '100%', height: '100%'}}
                            contentFit="cover"
                            fallbackComponent={
                                <EntityFallbackIcon
                                    kind="group"
                                    size={28}
                                    color={colors.icon.lighter}
                                />
                            }
                        />
                    </View>

                    <View className="min-w-0 flex-1 pr-2">
                        <AppText
                            variant="body-base"
                            className="font-semibold text-text-primary"
                            numberOfLines={1}
                        >
                            {item.title}
                        </AppText>
                        <AppText
                            variant="caption-xs"
                            className="mt-0.5 text-text-primary-lighter"
                            numberOfLines={1}
                        >
                            {membersLabel}
                        </AppText>
                    </View>

                    <View className="flex-row items-center">
                        {preview.length > 0 ? (
                            <View className="flex-row items-center">
                                {preview.map((member, index) => (
                                    <View
                                        key={`${item.id}-${member.id}-${member.user_type}`}
                                        className="h-7 w-7 overflow-hidden rounded-full border-2"
                                        style={{
                                            marginLeft: index === 0 ? 0 : -8,
                                            backgroundColor: rowSurface,
                                            borderColor: listSurface,
                                            zIndex: index + 1,
                                        }}
                                    >
                                        <AppImageV2
                                            id={
                                                member.avatar?.id ??
                                                `member-${item.id}-${member.id}`
                                            }
                                            url={member.avatar?.url}
                                            style={{width: '100%', height: '100%'}}
                                            contentFit="cover"
                                            fallbackComponent={
                                                <EntityFallbackIcon
                                                    kind="user"
                                                    size={14}
                                                    color={colors.icon.lighter}
                                                />
                                            }
                                        />
                                    </View>
                                ))}
                                {overflow > 0 ? (
                                    <View
                                        className="h-7 min-w-[28px] items-center justify-center rounded-full border-2 px-1.5"
                                        style={{
                                            marginLeft: -8,
                                            backgroundColor: rowSurface,
                                            borderColor: listSurface,
                                            zIndex: preview.length + 1,
                                        }}
                                    >
                                        <AppText
                                            variant="caption-xs"
                                            className="font-semibold text-text-primary-lighter"
                                        >
                                            +{overflow}
                                        </AppText>
                                    </View>
                                ) : null}
                            </View>
                        ) : memberCount > 0 ? (
                            <View
                                className="h-7 min-w-[28px] flex-row items-center justify-center rounded-full border border-border-input px-2"
                                style={{backgroundColor: rowSurface}}
                            >
                                <Iconify
                                    icon="heroicons:user-group"
                                    size={14}
                                    color={colors.icon.lighter}
                                />
                                <AppText
                                    variant="caption-xs"
                                    className="ml-1 font-semibold text-text-primary-lighter"
                                >
                                    {memberCount}
                                </AppText>
                            </View>
                        ) : null}
                    </View>
                </Pressable>
            );
        },
        [
            colors.icon.lighter,
            listSurface,
            memberPreviews,
            onSelect,
            selectedId,
            selectedSurface,
        ],
    );

    const listHeader = useMemo(() => (
        <View className="mb-4 flex-row items-center justify-between">
            <AppText variant="h4" className="text-text-primary">
                {isSearching ? 'Results' : 'All Groups'}
            </AppText>
            <AppText variant="caption-xs" className="text-text-primary-lighter">
                {filteredGroups.length}
                {hasMore && !isSearching ? '+' : ''}{' '}
                {filteredGroups.length === 1 ? 'group' : 'groups'}
            </AppText>
        </View>
    ), [filteredGroups.length, hasMore, isSearching]);

    const listFooter = useMemo(() => {
        if (!loadingMore) return <View style={styles.footerSpacer} />;
        return (
            <View style={styles.footerLoading}>
                <ActivityIndicator size="small" color={colors.icon.primary} />
                <AppText variant="caption-xs" className="mt-2 text-text-primary-lighter">
                    Loading more...
                </AppText>
            </View>
        );
    }, [colors.icon.primary, loadingMore]);

    const listEmpty = useMemo(() => {
        if (!isSearching) return null;
        return (
            <SheetEmptyState
                icon={<Iconify icon="heroicons:magnifying-glass-minus" size={32} color={emptyIconColor} />}
                title="No results found"
                description={
                    hasMore
                        ? `Nothing matched “${trimmedQuery}” in loaded groups. Scroll or clear search to keep browsing.`
                        : `Nothing matched “${trimmedQuery}”. Try another name or create a new group.`
                }
                primaryAction={{
                    label: 'Clear Search',
                    onPress: onClearSearch,
                    renderIcon: (color) => <Iconify icon="heroicons:x-mark" size={18} color={color} />,
                }}
            />
        );
    }, [emptyIconColor, hasMore, isSearching, onClearSearch, trimmedQuery]);

    if (totalCount === 0) {
        return (
            <View style={styles.centeredBody}>
                <SheetEmptyState
                    icon={<Iconify icon="heroicons:user-group" size={32} color={emptyIconColor} />}
                    title="No groups yet"
                    description="Create a group to split expenses and track shared spending with others."
                    primaryAction={{
                        label: 'Create New Group',
                        onPress: onAddNew,
                        renderIcon: (color) => (
                            <Iconify icon="heroicons:plus-circle" size={18} color={color} />
                        ),
                    }}
                />
            </View>
        );
    }

    return (
        <View style={[styles.listCard, {backgroundColor: listSurface}]}>
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
