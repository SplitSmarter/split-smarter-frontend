import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
    View,
    ActivityIndicator,
    Pressable,
    StyleSheet,
    ListRenderItem,
} from 'react-native';
import {
    BottomSheetModal,
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetFlatList,
} from '@gorhom/bottom-sheet';
import {Iconify} from 'react-native-iconify';
import {useRouter} from 'expo-router';
import {AppText} from "@/src/components/common/AppText";
import {AppImage} from "@/src/components/common/AppImage";
import {EntityFallbackIcon} from "@/src/components/common/EntityFallbackIcon";
import {AppInput} from "@/src/components/common/AppInput";
import {SheetEmptyState} from "@/src/components/empty-states/SheetEmptyState";
import {themeStore} from '@/src/store/themeStore';
import {userStore} from '@/src/store/userStore';
import {COLORS} from "@/src/constants/colors";
import {RelationDetails} from "@/src/api/dto/user/relation";
import {GetRelationsApi} from "@/src/api/relations/relation";
import {SearchUsersApi} from "@/src/api/user/user";
import {UserSearchResponse} from "@/src/api/dto/user/user";
import {RelationWithUserType} from "@/src/api/dto/constants";
import {PaginationResponse} from "@/src/api/dto/ApiResponse";

const PAGE_SIZE = 50;

export interface HiddenUserTarget {
    id: number;
    user_type: RelationWithUserType;
}

const DEFAULT_ALLOWED_USER_TYPES: RelationWithUserType[] = [
    RelationWithUserType.USER,
    RelationWithUserType.CUSTOM,
];

interface SelectSinglePeopleBottomSheetProps {
    visible: boolean;
    selectedId?: number;
    selectedType?: RelationWithUserType;
    hideUsers?: HiddenUserTarget[];
    /**
     * Which relation user types can be listed / selected.
     * Pass `[USER]`, `[CUSTOM]`, or both. Default: both.
     * Global user search only runs when USER is included.
     */
    allowedUserTypes?: RelationWithUserType[];
    onClose: () => void;
    onSelect: (
        userId: number,
        userType: RelationWithUserType,
        relations: RelationDetails[],
        globalUsers: UserSearchResponse[],
    ) => void;
}

type ListRow = {
    type: 'rel' | 'gl';
    key: string;
    data: {
        id: number;
        name: string;
        user_type: RelationWithUserType;
        avatar?: {url?: string} | null;
    };
    subtext: string;
};

/** Decide hasMore from the *raw* API page — never from client-filtered rows. */
function resolveHasMore(
    rawPageLength: number,
    requestOffset: number,
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
    return rawPageLength >= PAGE_SIZE;
}

export const SelectSinglePeopleBottomSheet = ({
    visible,
    selectedId,
    selectedType,
    hideUsers = [],
    allowedUserTypes = DEFAULT_ALLOWED_USER_TYPES,
    onClose,
    onSelect,
}: SelectSinglePeopleBottomSheetProps) => {
    const theme = themeStore((state) => state.theme);
    const isDark = theme === 'dark';
    const router = useRouter();
    const currentUser = userStore((state) => state.user);

    // Content-stable key so inline `allowedUserTypes={[USER]}` from parents doesn't retrigger fetches.
    const allowedTypesKey = [...allowedUserTypes]
        .map((t) => String(t).toUpperCase())
        .sort()
        .join('|');
    const allowedTypeSet = useMemo(
        () => new Set(allowedTypesKey.split('|').filter(Boolean)),
        [allowedTypesKey],
    );
    const allowsUser = allowedTypeSet.has(RelationWithUserType.USER);
    const relationTypesToFetch = useMemo(() => {
        const types: RelationWithUserType[] = [];
        if (allowedTypeSet.has(RelationWithUserType.USER)) types.push(RelationWithUserType.USER);
        if (allowedTypeSet.has(RelationWithUserType.CUSTOM)) types.push(RelationWithUserType.CUSTOM);
        return types.length > 0 ? types : DEFAULT_ALLOWED_USER_TYPES;
    }, [allowedTypeSet]);
    const isAllowedUserType = useCallback(
        (userType: string) => allowedTypeSet.has(String(userType).toUpperCase()),
        [allowedTypeSet],
    );

    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => ['85%'], []);
    const loadingRef = useRef(false);
    const searchRequestId = useRef(0);
    const isAllowedUserTypeRef = useRef(isAllowedUserType);
    isAllowedUserTypeRef.current = isAllowedUserType;

    const [search, setSearch] = useState('');
    const [relations, setRelations] = useState<RelationDetails[]>([]);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [globalResults, setGlobalResults] = useState<UserSearchResponse[]>([]);
    const [loadingRelations, setLoadingRelations] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRelations = useCallback(async (nextOffset: number, append: boolean) => {
        if (loadingRef.current) return;
        loadingRef.current = true;

        if (append) {
            setLoadingMore(true);
        } else {
            setLoadingRelations(true);
            setError(null);
        }

        try {
            // Same call shape as MultiUserSelect / PaidByContent (add-split).
            const response = await GetRelationsApi({
                offset: nextOffset,
                limit: PAGE_SIZE,
                relation_types: relationTypesToFetch,
            });
            const rawPage = response.data ?? [];
            const pageData = rawPage.filter((item) =>
                isAllowedUserTypeRef.current(item.with_user.user_type),
            );
            // Advance by server page size, not filtered length — otherwise all-CUSTOM
            // pages leave offset at 0 and hasMore stuck true → infinite onEndReached.
            const returned =
                typeof response.pagination?.returned === 'number'
                    ? response.pagination.returned
                    : rawPage.length;

            setRelations((prev) => {
                if (!append) return pageData;
                const existingIds = new Set(prev.map((item) => `${item.with_user.user_type}-${item.with_user.id}`));
                return [
                    ...prev,
                    ...pageData.filter(
                        (item) => !existingIds.has(`${item.with_user.user_type}-${item.with_user.id}`),
                    ),
                ];
            });
            setOffset(nextOffset + returned);
            setHasMore(resolveHasMore(rawPage.length, nextOffset, response.pagination));

            if (!append && !response.data && response.message) {
                setError(response.message);
            }
        } catch (err: any) {
            console.error("Error fetching local relations:", err);
            if (!append) {
                setRelations([]);
                setOffset(0);
                setHasMore(false);
                setError(err?.message || "Couldn't load people. Check your connection and try again.");
            }
        } finally {
            loadingRef.current = false;
            setLoadingRelations(false);
            setLoadingMore(false);
        }
    }, [relationTypesToFetch]);

    const resetAndLoadRef = useRef(() => {});
    resetAndLoadRef.current = () => {
        setRelations([]);
        setOffset(0);
        setHasMore(true);
        fetchRelations(0, false);
    };

    const resetAndLoad = useCallback(() => {
        resetAndLoadRef.current();
    }, []);

    // Only open/reset when visibility flips — not when callback identities change.
    useEffect(() => {
        if (visible) {
            setSearch('');
            setGlobalResults([]);
            setError(null);
            setLoadingMore(false);
            resetAndLoadRef.current();
            bottomSheetModalRef.current?.present();
        } else {
            setSearch('');
            setGlobalResults([]);
            setError(null);
            setLoadingMore(false);
            setHasMore(false);
            bottomSheetModalRef.current?.dismiss();
        }
    }, [visible]);

    useEffect(() => {
        if (!visible) return;

        const trimmed = search.trim();
        if (!trimmed || !allowsUser) {
            setGlobalResults([]);
            setIsSearchingGlobal(false);
            return;
        }

        const requestId = ++searchRequestId.current;
        const timer = setTimeout(async () => {
            setIsSearchingGlobal(true);
            try {
                const res = await SearchUsersApi({q: trimmed});
                if (requestId !== searchRequestId.current) return;
                setGlobalResults(res.data ?? []);
            } catch (err) {
                console.error("Global search error:", err);
                if (requestId !== searchRequestId.current) return;
                setGlobalResults([]);
            } finally {
                if (requestId === searchRequestId.current) {
                    setIsSearchingGlobal(false);
                }
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [search, visible, allowsUser]);

    const trimmedQuery = search.trim();
    const isSearching = trimmedQuery.length > 0;

    const filteredRelations = useMemo(() => {
        if (!isSearching) return relations;
        const query = trimmedQuery.toLowerCase();
        return relations.filter((r) => r.with_user.name.toLowerCase().includes(query));
    }, [relations, isSearching, trimmedQuery]);

    const hiddenUsersKeys = useMemo(() => {
        return new Set(hideUsers.map((hu) => `${hu.user_type}-${hu.id}`));
    }, [hideUsers]);

    const combinedListData = useMemo(() => {
        const list: ListRow[] = [];

        // Match MultiUserSelect: always offer "You" even if relations API omits self.
        if (allowsUser && currentUser && !isSearching) {
            const selfKey = `${RelationWithUserType.USER}-${currentUser.id}`;
            const selfInRelations = relations.some(
                (r) =>
                    r.with_user.id === currentUser.id &&
                    r.with_user.user_type === RelationWithUserType.USER,
            );
            if (!hiddenUsersKeys.has(selfKey) && !selfInRelations) {
                list.push({
                    type: 'rel',
                    key: `self-${currentUser.id}`,
                    data: {
                        id: currentUser.id,
                        name: currentUser.name || 'You',
                        user_type: RelationWithUserType.USER,
                        avatar: currentUser.avatar,
                    },
                    subtext: 'You',
                });
            }
        }

        filteredRelations.forEach((item) => {
            if (!isAllowedUserType(item.with_user.user_type)) return;
            const compositeKey = `${item.with_user.user_type}-${item.with_user.id}`;
            if (hiddenUsersKeys.has(compositeKey)) return;

            const isMe =
                currentUser?.id === item.with_user.id &&
                item.with_user.user_type === RelationWithUserType.USER;

            list.push({
                type: 'rel',
                key: `rel-${compositeKey}`,
                data: item.with_user,
                subtext: isMe ? 'You' : item.relationship?.title || item.with_user.user_type,
            });
        });

        if (isSearching && allowsUser) {
            globalResults.forEach((user) => {
                const globalUserType = RelationWithUserType.USER;
                const compositeKey = `${globalUserType}-${user.id}`;

                const matchesLocal = relations.some(
                    (r) =>
                        r.with_user.id === user.id &&
                        r.with_user.user_type === globalUserType,
                );

                if (hiddenUsersKeys.has(compositeKey) || matchesLocal) return;

                const isMe = currentUser?.id === user.id;
                list.push({
                    type: 'gl',
                    key: `gl-${compositeKey}`,
                    data: {
                        id: user.id,
                        name: user.name,
                        user_type: globalUserType,
                        avatar: user.avatar,
                    },
                    subtext: isMe ? 'You' : 'Not in your network',
                });
            });
        }

        return list;
    }, [
        filteredRelations,
        globalResults,
        isSearching,
        relations,
        hiddenUsersKeys,
        currentUser,
        allowsUser,
        isAllowedUserType,
    ]);

    const hasRelations = relations.length > 0;
    const hasSelfSuggestion = allowsUser && !!currentUser;
    const hasPeople = hasRelations || hasSelfSuggestion;
    const hasResults = combinedListData.length > 0;
    const showSearch =
        (hasPeople || isSearching) && !loadingRelations && !(error && !hasPeople);
    const emptyIconColor = isDark ? COLORS.dark.icon.primary : COLORS.light.icon.primary;
    const headerIconColor = isDark ? COLORS.dark.icon.primary : COLORS.light.icon.primary;
    const spinnerColor = isDark ? COLORS.dark.icon.primary : COLORS.light.icon.primary;

    const handleSelectUser = useCallback(
        (userId: number, userType: RelationWithUserType) => {
            if (!isAllowedUserType(userType)) return;
            onSelect(userId, userType, relations, allowsUser ? globalResults : []);
            onClose();
        },
        [onSelect, relations, globalResults, onClose, allowsUser, isAllowedUserType],
    );

    const handleAddNewUser = () => {
        onClose();
        setTimeout(() => {
            router.push('/(authenticated)/user/add');
        }, 200);
    };

    const handleClearSearch = useCallback(() => setSearch(''), []);

    const handleLoadMore = useCallback(() => {
        if (!hasMore || loadingRef.current || loadingRelations || loadingMore) return;
        fetchRelations(offset, true);
    }, [hasMore, loadingRelations, loadingMore, offset, fetchRelations]);

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
        [isDark],
    );

    const renderItem = useCallback<ListRenderItem<ListRow>>(
        ({item}) => (
            <UserRowItem
                user={item.data}
                isSelected={selectedId === item.data.id && selectedType === item.data.user_type}
                subtext={item.subtext}
                onPress={handleSelectUser}
            />
        ),
        [selectedId, selectedType, handleSelectUser],
    );

    const listHeader = useMemo(
        () => (
            <View className="flex-row items-center justify-between mb-3 px-1">
                <AppText variant="body-base" className="font-bold text-text-primary">
                    {isSearching ? 'Results' : 'People you know'}
                </AppText>
                <AppText variant="caption-xs" className="text-text-primary-lighter">
                    {combinedListData.length}
                    {hasMore && !isSearching ? '+' : ''}{' '}
                    {combinedListData.length === 1 ? 'person' : 'people'}
                </AppText>
            </View>
        ),
        [combinedListData.length, hasMore, isSearching],
    );

    const listFooter = useMemo(() => {
        if (!loadingMore) return <View style={styles.footerSpacer} />;
        return (
            <View style={styles.footerLoading}>
                <ActivityIndicator size="small" color={spinnerColor} />
                <AppText variant="caption-xs" className="text-text-primary-lighter mt-2">
                    Loading more...
                </AppText>
            </View>
        );
    }, [loadingMore, spinnerColor]);

    const listEmpty = useMemo(() => {
        if (!isSearching) return null;
        if (isSearchingGlobal) {
            return (
                <View style={styles.centeredBody}>
                    <ActivityIndicator size="small" color={spinnerColor} />
                    <AppText variant="caption-xs" className="text-text-primary-lighter mt-3">
                        Searching...
                    </AppText>
                </View>
            );
        }
        return (
            <SheetEmptyState
                icon={<Iconify icon="heroicons:magnifying-glass-minus" size={32} color={emptyIconColor} />}
                title="No results found"
                description={`Nothing matched “${trimmedQuery}”. Try a different name or add someone new.`}
                primaryAction={{
                    label: 'Clear Search',
                    onPress: handleClearSearch,
                    renderIcon: (color) => <Iconify icon="heroicons:x-mark" size={18} color={color} />,
                }}
            />
        );
    }, [
        emptyIconColor,
        handleClearSearch,
        isSearching,
        isSearchingGlobal,
        spinnerColor,
        trimmedQuery,
    ]);

    const renderBody = () => {
        if (loadingRelations && !hasPeople) {
            return (
                <View style={styles.centeredBody}>
                    <ActivityIndicator size="large" color={spinnerColor} />
                    <AppText variant="caption-xs" className="text-text-primary-lighter mt-3">
                        Loading people...
                    </AppText>
                </View>
            );
        }

        if (error && !hasPeople) {
            return (
                <View style={styles.centeredBody}>
                    <SheetEmptyState
                        icon={<Iconify icon="heroicons:exclamation-triangle" size={32} color={emptyIconColor} />}
                        title="Unable to load people"
                        description={error}
                        primaryAction={{
                            label: 'Try Again',
                            onPress: resetAndLoad,
                            renderIcon: (color) => (
                                <Iconify icon="heroicons:arrow-path" size={18} color={color} />
                            ),
                        }}
                    />
                </View>
            );
        }

        if (!hasPeople && !isSearching) {
            return (
                <View style={styles.centeredBody}>
                    <SheetEmptyState
                        icon={<Iconify icon="heroicons:user-group" size={32} color={emptyIconColor} />}
                        title="No people yet"
                        description="Add someone to your network, or search by name, email, or phone."
                        primaryAction={{
                            label: 'Add Person',
                            onPress: handleAddNewUser,
                            renderIcon: (color) => (
                                <Iconify icon="heroicons:user-plus" size={18} color={color} />
                            ),
                        }}
                    />
                </View>
            );
        }

        return (
            <BottomSheetFlatList
                data={combinedListData}
                keyExtractor={(item) => item.key}
                renderItem={renderItem}
                ListHeaderComponent={hasResults || isSearching ? listHeader : null}
                ListFooterComponent={listFooter}
                ListEmptyComponent={listEmpty}
                onEndReached={isSearching ? undefined : handleLoadMore}
                onEndReachedThreshold={0.4}
                initialNumToRender={12}
                maxToRenderPerBatch={12}
                windowSize={5}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={
                    combinedListData.length === 0 ? styles.emptyListContent : styles.listContent
                }
                style={styles.scroll}
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
                    <Pressable onPress={onClose} className="p-2 rounded-full">
                        <Iconify icon="heroicons:chevron-left" size={24} color={headerIconColor} />
                    </Pressable>
                    <AppText variant="h4" className="font-bold text-text-primary text-center">
                        Select Person
                    </AppText>
                    <Pressable
                        onPress={handleAddNewUser}
                        className="p-2 rounded-full"
                        accessibilityLabel="Add new person"
                    >
                        <Iconify icon="heroicons:user-plus" size={24} color={headerIconColor} />
                    </Pressable>
                </View>

                {showSearch ? (
                    <View className="px-6 pt-4 pb-2">
                        <AppInput
                            placeholder="Search name, email, or phone..."
                            value={search}
                            onChangeText={setSearch}
                            renderLeftIcon={(color) => (
                                <Iconify icon="heroicons:magnifying-glass" size={20} color={color} />
                            )}
                            renderRightIcon={(color) => {
                                if (isSearchingGlobal) {
                                    return <ActivityIndicator size="small" color={spinnerColor} />;
                                }
                                if (search.length > 0) {
                                    return (
                                        <Pressable onPress={handleClearSearch} hitSlop={8}>
                                            <Iconify icon="heroicons:x-mark" size={20} color={color} />
                                        </Pressable>
                                    );
                                }
                                return null;
                            }}
                        />
                    </View>
                ) : null}

                <View style={styles.body}>{renderBody()}</View>
            </View>
        </BottomSheetModal>
    );
};

const UserRowItem = React.memo(
    ({
        user,
        isSelected,
        onPress,
        subtext,
    }: {
        user: ListRow['data'];
        isSelected: boolean;
        onPress: (userId: number, userType: RelationWithUserType) => void;
        subtext: string;
    }) => {
        const isDark = themeStore((state) => state.theme === 'dark');
        const colors = isDark ? COLORS.dark : COLORS.light;

        return (
            <Pressable
                onPress={() => onPress(user.id, user.user_type)}
                className={`mb-2 flex-row items-center rounded-2xl border p-3 ${
                    isSelected ? 'border-accent-sky bg-accent-sky-bg' : 'border-transparent'
                }`}
                style={isSelected ? undefined : {backgroundColor: colors.bg.lighter}}
            >
                <AppImage
                    url={user.avatar?.url}
                    size="sm"
                    variant="circular"
                    fallbackIcon={
                        <EntityFallbackIcon kind="user" size={18} color={colors.icon.lighter} />
                    }
                />
                <View className="ml-3 flex-1">
                    <AppText className="font-semibold text-text-primary">{user.name}</AppText>
                    <AppText
                        variant="caption-xs"
                        className={`text-text-primary-lighter ${
                            subtext === 'You' ? 'text-accent-sky font-bold' : 'opacity-60'
                        }`}
                    >
                        {subtext}
                    </AppText>
                </View>
                {isSelected ? (
                    <Iconify icon="heroicons:check-circle-solid" size={24} color={colors.accent.sky} />
                ) : (
                    <Iconify icon="heroicons:check-circle" size={24} color={colors.icon.primary} />
                )}
            </Pressable>
        );
    },
    (prevProps, nextProps) =>
        prevProps.isSelected === nextProps.isSelected &&
        prevProps.user.id === nextProps.user.id &&
        prevProps.user.name === nextProps.user.name &&
        prevProps.user.avatar?.url === nextProps.user.avatar?.url &&
        prevProps.subtext === nextProps.subtext,
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    body: {
        flex: 1,
        paddingHorizontal: 24,
        paddingBottom: 8,
    },
    scroll: {
        flex: 1,
    },
    listContent: {
        paddingBottom: 40,
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

UserRowItem.displayName = 'UserRowItem';
SelectSinglePeopleBottomSheet.displayName = 'SelectSinglePeopleBottomSheet';
