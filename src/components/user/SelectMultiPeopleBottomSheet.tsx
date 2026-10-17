import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
    View,
    Pressable,
    ActivityIndicator,
    StyleSheet,
    ListRenderItem,
    Alert,
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
import {AppInput} from "@/src/components/common/AppInput";
import {AppImageV2} from "@/src/components/common/AppImageV2";
import {EntityFallbackIcon} from "@/src/components/common/EntityFallbackIcon";
import {AppButton} from "@/src/components/common/AppButton";
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

export interface SelectedUserEntity {
    id: number;
    name: string;
    user_type: 'USER' | 'CUSTOM';
    avatar?: {id?: string; url?: string} | null;
}

type ListFilterMode = 'all' | 'selected';

const DEFAULT_ALLOWED_USER_TYPES: RelationWithUserType[] = [
    RelationWithUserType.USER,
    RelationWithUserType.CUSTOM,
];

interface SelectMultiPeopleBottomSheetProps {
    visible: boolean;
    initialSelectedUsers?: SelectedUserEntity[];
    /**
     * Which relation user types can be listed / selected.
     * Pass `[USER]`, `[CUSTOM]`, or both. Default: both.
     * Global user search only runs when USER is included.
     */
    allowedUserTypes?: RelationWithUserType[];
    /** When set, sheet cannot dismiss until at least this many people are selected. */
    minSelectionToClose?: number;
    onClose: () => void;
    onConfirmed: (
        selectedUsers: SelectedUserEntity[],
        relations: RelationDetails[],
        globalUsers: UserSearchResponse[],
    ) => void;
}

type ListRow = {
    id: string;
    rawData: SelectedUserEntity;
    subtext: string;
    isSelected: boolean;
    isLocked: boolean;
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

function userKey(id: number | string, userType: string) {
    return `${userType}-${String(id)}`;
}

function isSelfUser(
    user: {id: number | string; user_type: string},
    currentUserId?: number | string | null,
) {
    if (currentUserId == null) return false;
    return (
        String(user.id) === String(currentUserId) &&
        String(user.user_type).toUpperCase() === RelationWithUserType.USER
    );
}

function ensureSelfSelected(
    users: SelectedUserEntity[],
    currentUser: {id: number; name?: string; avatar?: {url?: string} | null} | null,
): SelectedUserEntity[] {
    if (!currentUser) return users;
    const withoutSelf = users.filter((u) => !isSelfUser(u, currentUser.id));
    return [
        {
            id: currentUser.id,
            name: currentUser.name || 'You',
            user_type: RelationWithUserType.USER,
            avatar: currentUser.avatar,
        },
        ...withoutSelf,
    ];
}

export const SelectMultiPeopleBottomSheet = ({
    visible,
    initialSelectedUsers = [],
    allowedUserTypes = DEFAULT_ALLOWED_USER_TYPES,
    minSelectionToClose,
    onClose,
    onConfirmed,
}: SelectMultiPeopleBottomSheetProps) => {
    const theme = themeStore((state) => state.theme);
    const isDark = theme === 'dark';
    const colors = isDark ? COLORS.dark : COLORS.light;
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
    const initialSelectedUsersRef = useRef(initialSelectedUsers);
    initialSelectedUsersRef.current = initialSelectedUsers;
    const allowsUserRef = useRef(allowsUser);
    allowsUserRef.current = allowsUser;
    const isAllowedUserTypeRef = useRef(isAllowedUserType);
    isAllowedUserTypeRef.current = isAllowedUserType;
    const currentUserRef = useRef(currentUser);
    currentUserRef.current = currentUser;

    const [search, setSearch] = useState('');
    const [listMode, setListMode] = useState<ListFilterMode>('all');
    const [localSelectedUsers, setLocalSelectedUsers] = useState<SelectedUserEntity[]>(initialSelectedUsers);
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
                const existingIds = new Set(
                    prev.map((item) => userKey(item.with_user.id, item.with_user.user_type)),
                );
                return [
                    ...prev,
                    ...pageData.filter(
                        (item) => !existingIds.has(userKey(item.with_user.id, item.with_user.user_type)),
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
            setListMode('all');
            setGlobalResults([]);
            setError(null);
            setLoadingMore(false);
            const filteredInitial = initialSelectedUsersRef.current.filter((u) =>
                isAllowedUserTypeRef.current(u.user_type),
            );
            setLocalSelectedUsers(
                allowsUserRef.current
                    ? ensureSelfSelected(filteredInitial, currentUserRef.current)
                    : filteredInitial,
            );
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

    const selectedKeys = useMemo(() => {
        const keys = new Set(
            localSelectedUsers
                .filter((u) => isAllowedUserType(u.user_type))
                .map((u) => userKey(u.id, u.user_type)),
        );
        // Self is always treated as selected for tint / Selected filter (USER source).
        if (allowsUser && currentUser) {
            keys.add(userKey(currentUser.id, RelationWithUserType.USER));
        }
        return keys;
    }, [localSelectedUsers, currentUser, allowsUser, isAllowedUserType]);

    const resolveSubtext = useCallback(
        (user: SelectedUserEntity, fallback?: string) => {
            if (isSelfUser(user, currentUser?.id)) return 'You';

            const relation = relations.find(
                (r) =>
                    String(r.with_user.id) === String(user.id) &&
                    r.with_user.user_type === user.user_type,
            );
            return relation?.relationship?.title || fallback || user.user_type;
        },
        [currentUser, relations],
    );

    const allListItems = useMemo(() => {
        const structuralItems: ListRow[] = [];
        const seen = new Set<string>();

        const pushRow = (
            rawData: SelectedUserEntity,
            subtext: string,
            keyPrefix: string,
            options?: {locked?: boolean},
        ) => {
            const key = userKey(rawData.id, rawData.user_type);
            if (seen.has(key)) return;
            seen.add(key);
            const locked = options?.locked ?? isSelfUser(rawData, currentUser?.id);
            structuralItems.push({
                id: `${keyPrefix}-${key}`,
                rawData,
                subtext,
                isSelected: locked || selectedKeys.has(key),
                isLocked: locked,
            });
        };

        // Self always pinned at top, selected, and not toggleable (USER source only).
        if (allowsUser && currentUser) {
            const selfUser: SelectedUserEntity = {
                id: currentUser.id,
                name: 'You',
                user_type: RelationWithUserType.USER,
                avatar: currentUser.avatar,
            };
            pushRow(selfUser, 'You', 'self', {locked: true});
        }

        const filteredRelations = isSearching
            ? relations.filter((r) =>
                  r.with_user.name.toLowerCase().includes(trimmedQuery.toLowerCase()),
              )
            : relations;

        filteredRelations.forEach((item) => {
            if (!isAllowedUserType(item.with_user.user_type)) return;
            if (isSelfUser(item.with_user, currentUser?.id)) return;
            const rawData: SelectedUserEntity = {
                id: item.with_user.id,
                name: item.with_user.name,
                user_type: item.with_user.user_type,
                avatar: item.with_user.avatar,
            };
            pushRow(
                rawData,
                resolveSubtext(rawData, item.relationship?.title || item.with_user.user_type),
                'rel',
            );
        });

        if (isSearching && allowsUser) {
            globalResults.forEach((user) => {
                const fallbackType = (user.user_type || RelationWithUserType.USER) as 'USER' | 'CUSTOM';
                if (!isAllowedUserType(fallbackType)) return;
                if (isSelfUser({id: user.id, user_type: fallbackType}, currentUser?.id)) return;
                const rawData: SelectedUserEntity = {
                    id: user.id,
                    name: user.name,
                    user_type: fallbackType,
                    avatar: user.avatar,
                };
                pushRow(rawData, 'Not in your network', 'gl');
            });
        }

        // Other selected users not in relations/search (self already pinned above).
        localSelectedUsers.forEach((user) => {
            if (!isAllowedUserType(user.user_type)) return;
            if (isSelfUser(user, currentUser?.id)) return;
            if (isSearching) {
                const query = trimmedQuery.toLowerCase();
                if (!user.name.toLowerCase().includes(query)) return;
            }
            pushRow(user, resolveSubtext(user), 'sel');
        });

        return structuralItems;
    }, [
        localSelectedUsers,
        currentUser,
        relations,
        globalResults,
        isSearching,
        trimmedQuery,
        selectedKeys,
        resolveSubtext,
        allowsUser,
        isAllowedUserType,
    ]);

    const computedListItems = useMemo(() => {
        if (listMode === 'selected') {
            const selectedOnly = allListItems.filter((item) => item.isSelected);
            // Keep self first in Selected tab too.
            const selfRows = selectedOnly.filter((item) => isSelfUser(item.rawData, currentUser?.id));
            const otherRows = selectedOnly.filter((item) => !isSelfUser(item.rawData, currentUser?.id));
            return [...selfRows, ...otherRows];
        }
        return allListItems;
    }, [allListItems, listMode, currentUser?.id]);

    const hasRelations = relations.length > 0;
    const hasSelfSuggestion = allowsUser && !!currentUser;
    const hasPeople = hasRelations || hasSelfSuggestion;
    const selectionCount = (
        allowsUser
            ? ensureSelfSelected(localSelectedUsers, currentUser)
            : localSelectedUsers.filter((u) => isAllowedUserType(u.user_type))
    ).length;
    const hasSelection = selectionCount > 0;
    const canDismiss =
        minSelectionToClose == null || selectionCount >= minSelectionToClose;
    const showSearch =
        (hasPeople || isSearching || hasSelection) &&
        !loadingRelations &&
        !(error && !hasPeople);
    const emptyIconColor = isDark ? COLORS.dark.icon.primary : COLORS.light.icon.primary;
    const headerIconColor = isDark ? COLORS.dark.icon.primary : COLORS.light.icon.primary;
    const spinnerColor = isDark ? COLORS.dark.icon.primary : COLORS.light.icon.primary;

    const toggleUser = useCallback(
        (user: SelectedUserEntity) => {
            if (!isAllowedUserType(user.user_type)) return;
            // "You" is always selected and cannot be toggled off.
            if (allowsUser && isSelfUser(user, currentUser?.id)) return;

            setLocalSelectedUsers((prev) => {
                const baseline = allowsUser
                    ? ensureSelfSelected(prev, currentUser)
                    : prev.filter((u) => isAllowedUserType(u.user_type));
                const exists = baseline.some(
                    (u) =>
                        String(u.id) === String(user.id) &&
                        u.user_type === user.user_type,
                );
                if (exists) {
                    return baseline.filter(
                        (u) =>
                            (allowsUser && isSelfUser(u, currentUser?.id)) ||
                            !(
                                String(u.id) === String(user.id) &&
                                u.user_type === user.user_type
                            ),
                    );
                }
                return [
                    ...baseline,
                    {
                        id: user.id,
                        name: user.name,
                        user_type: user.user_type,
                        avatar: user.avatar,
                    },
                ];
            });
        },
        [currentUser, allowsUser, isAllowedUserType],
    );

    const requestClose = useCallback(() => {
        if (!canDismiss) {
            bottomSheetModalRef.current?.present();
            Alert.alert(
                'Select people',
                `Select at least ${minSelectionToClose} people to continue.`,
            );
            return;
        }
        onClose();
    }, [canDismiss, minSelectionToClose, onClose]);

    const handleConfirmSelection = useCallback(() => {
        const filtered = localSelectedUsers.filter((u) => isAllowedUserType(u.user_type));
        const selected = allowsUser
            ? ensureSelfSelected(filtered, currentUser)
            : filtered;
        if (minSelectionToClose != null && selected.length < minSelectionToClose) {
            Alert.alert(
                'Select people',
                `Select at least ${minSelectionToClose} people to continue.`,
            );
            return;
        }
        onConfirmed(selected, relations, allowsUser ? globalResults : []);
        onClose();
    }, [
        onConfirmed,
        localSelectedUsers,
        currentUser,
        relations,
        globalResults,
        onClose,
        minSelectionToClose,
        allowsUser,
        isAllowedUserType,
    ]);

    const handleAddNewUser = () => {
        // Allow leaving to add a person even when min selection is not met.
        onClose();
        setTimeout(() => {
            router.push('/(authenticated)/user/add');
        }, 200);
    };

    const handleSheetDismiss = useCallback(() => {
        if (!canDismiss && visible) {
            // Re-open if swipe/backdrop attempted dismiss too early.
            requestAnimationFrame(() => {
                bottomSheetModalRef.current?.present();
            });
            return;
        }
        onClose();
    }, [canDismiss, visible, onClose]);

    const handleClearSearch = useCallback(() => setSearch(''), []);

    const handleLoadMore = useCallback(() => {
        if (listMode !== 'all') return;
        if (!hasMore || loadingRef.current || loadingRelations || loadingMore) return;
        fetchRelations(offset, true);
    }, [listMode, hasMore, loadingRelations, loadingMore, offset, fetchRelations]);

    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                pressBehavior={canDismiss ? 'close' : 'none'}
                opacity={isDark ? 0.7 : 0.4}
            />
        ),
        [isDark, canDismiss],
    );

    const renderRowItem = useCallback<ListRenderItem<ListRow>>(
        ({item}) => (
            <UserMultiRowItem
                user={item.rawData}
                isSelected={item.isSelected}
                isLocked={item.isLocked}
                onPress={() => {
                    if (item.isLocked) return;
                    toggleUser(item.rawData);
                }}
                subtext={item.subtext}
            />
        ),
        [toggleUser],
    );

    const listHeader = useMemo(
        () => (
            <View className="flex-row items-center justify-between px-1 py-2">
                <AppText variant="body-base" className="font-bold text-text-primary">
                    {listMode === 'selected'
                        ? 'Selected'
                        : isSearching
                          ? 'Results'
                          : 'People you know'}
                </AppText>
                <Pressable
                    onPress={() => setListMode((prev) => (prev === 'all' ? 'selected' : 'all'))}
                    hitSlop={8}
                    className="flex-row items-center py-1"
                >
                    <AppText variant="caption-xs" className="text-accent-sky font-semibold">
                        {listMode === 'all' ? 'Show selected' : 'Show all'}
                    </AppText>
                    {listMode === 'all' ? (
                        <Iconify
                            icon="heroicons:funnel"
                            size={14}
                            color={colors.accent.sky}
                            style={{marginLeft: 4}}
                        />
                    ) : (
                        <Iconify
                            icon="heroicons:squares-2x2"
                            size={14}
                            color={colors.accent.sky}
                            style={{marginLeft: 4}}
                        />
                    )}
                </Pressable>
            </View>
        ),
        [colors.accent.sky, isSearching, listMode],
    );

    const listFooter = useMemo(() => {
        const showPagingLoader = listMode === 'all' && (loadingMore || (loadingRelations && hasPeople));
        if (!showPagingLoader) return <View style={styles.footerSpacer} />;
        return (
            <View style={styles.footerLoading}>
                <ActivityIndicator size="small" color={spinnerColor} />
                <AppText variant="caption-xs" className="text-text-primary-lighter mt-2">
                    Loading more users...
                </AppText>
            </View>
        );
    }, [loadingMore, loadingRelations, hasPeople, listMode, spinnerColor]);

    const confirmBar = useMemo(
        () => (
            <View
                style={[
                    styles.confirmBar,
                    {backgroundColor: isDark ? COLORS.dark.bg.overlay : COLORS.light.bg.overlay},
                ]}
                className="border-t border-border-input"
            >
                {minSelectionToClose != null && !canDismiss ? (
                    <AppText variant="caption-xs" className="text-text-primary-lighter text-center mb-3">
                        Select at least {minSelectionToClose} people to continue
                        {` (${selectionCount}/${minSelectionToClose})`}
                    </AppText>
                ) : null}
                {canDismiss ? (
                    <AppButton variant="primary" onPress={handleConfirmSelection}>
                        Done ({selectionCount})
                    </AppButton>
                ) : minSelectionToClose != null ? (
                    <AppButton variant="primary" disabled onPress={handleConfirmSelection}>
                        Done ({selectionCount}/{minSelectionToClose})
                    </AppButton>
                ) : hasSelection ? (
                    <AppButton variant="primary" onPress={handleConfirmSelection}>
                        Done ({selectionCount})
                    </AppButton>
                ) : (
                    <AppButton variant="secondary" onPress={requestClose}>
                        Cancel
                    </AppButton>
                )}
            </View>
        ),
        [
            isDark,
            hasSelection,
            selectionCount,
            canDismiss,
            minSelectionToClose,
            handleConfirmSelection,
            requestClose,
        ],
    );

    const listEmpty = useMemo(() => {
        if (listMode === 'selected') {
            return (
                <SheetEmptyState
                    icon={<Iconify icon="heroicons:check-circle" size={32} color={emptyIconColor} />}
                    title="No one selected"
                    description="Switch to All and tap people to select them. Selected rows highlight in blue."
                    primaryAction={{
                        label: 'Show All',
                        onPress: () => setListMode('all'),
                        renderIcon: (color) => (
                            <Iconify icon="heroicons:user-group" size={18} color={color} />
                        ),
                    }}
                />
            );
        }

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
        listMode,
        spinnerColor,
        trimmedQuery,
    ]);

    const renderBody = () => {
        if (loadingRelations && !hasPeople && listMode === 'all') {
            return (
                <View style={styles.centeredBody}>
                    <ActivityIndicator size="large" color={spinnerColor} />
                    <AppText variant="caption-xs" className="text-text-primary-lighter mt-3">
                        Loading people...
                    </AppText>
                </View>
            );
        }

        if (error && !hasPeople && listMode === 'all') {
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

        if (!hasPeople && !isSearching && !hasSelection && listMode === 'all') {
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
            <View style={styles.listArea}>
                <View
                    style={[
                        styles.stickySectionHeader,
                        {backgroundColor: isDark ? COLORS.dark.bg.overlay : COLORS.light.bg.overlay},
                    ]}
                >
                    {listHeader}
                </View>
                <BottomSheetFlatList
                    data={computedListItems}
                    keyExtractor={(item) => item.id}
                    renderItem={renderRowItem}
                    ListFooterComponent={listFooter}
                    ListEmptyComponent={listEmpty}
                    onEndReached={isSearching || listMode === 'selected' ? undefined : handleLoadMore}
                    onEndReachedThreshold={0.4}
                    initialNumToRender={12}
                    maxToRenderPerBatch={12}
                    windowSize={5}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={
                        computedListItems.length === 0 ? styles.emptyListContent : styles.listContent
                    }
                    style={styles.scroll}
                />
                {confirmBar}
            </View>
        );
    };

    return (
        <BottomSheetModal
            ref={bottomSheetModalRef}
            snapPoints={snapPoints}
            enableDynamicSizing={false}
            enablePanDownToClose={canDismiss}
            enableContentPanningGesture
            onDismiss={handleSheetDismiss}
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
                    <Pressable onPress={requestClose} className="p-2 rounded-full">
                        <Iconify icon="heroicons:chevron-left" size={24} color={headerIconColor} />
                    </Pressable>
                    <AppText variant="h4" className="font-bold text-text-primary text-center">
                        Select People
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
                ) : (
                    <View className="pt-2" />
                )}

                <View style={styles.body}>{renderBody()}</View>
            </View>
        </BottomSheetModal>
    );
};

const UserMultiRowItem = React.memo(
    ({
        user,
        isSelected,
        isLocked,
        onPress,
        subtext,
    }: {
        user: SelectedUserEntity;
        isSelected: boolean;
        isLocked: boolean;
        onPress: () => void;
        subtext: string;
    }) => {
        const isDark = themeStore((state) => state.theme === 'dark');
        const colors = isDark ? COLORS.dark : COLORS.light;

        return (
            <Pressable
                onPress={isLocked ? undefined : onPress}
                disabled={isLocked}
                className={`mb-2 flex-row items-center rounded-2xl border p-3 ${
                    isSelected ? 'bg-accent-sky-bg border-accent-sky' : 'border-transparent'
                }`}
                style={isSelected ? undefined : {backgroundColor: colors.bg.lighter}}
            >
                <View className="w-8 h-8 rounded-full overflow-hidden">
                    <AppImageV2
                        id={user.avatar?.id || `people-row-${user.user_type}-${user.id}`}
                        url={user.avatar?.url}
                        style={{width: '100%', height: '100%', borderRadius: 9999}}
                        contentFit="cover"
                        fallbackComponent={
                            <EntityFallbackIcon kind="user" size={18} color={colors.icon.lighter} />
                        }
                    />
                </View>
                <View className="ml-3 flex-1">
                    <AppText className="font-semibold text-text-primary">{user.name}</AppText>
                    <AppText
                        variant="caption-xs"
                        className={`text-text-primary-lighter ${
                            isLocked || subtext === 'You'
                                ? 'text-accent-sky font-bold'
                                : 'opacity-60'
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
    (prev, next) =>
        prev.isSelected === next.isSelected &&
        prev.isLocked === next.isLocked &&
        prev.user.id === next.user.id &&
        prev.user.name === next.user.name &&
        prev.user.avatar?.url === next.user.avatar?.url &&
        prev.subtext === next.subtext,
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
    listArea: {
        flex: 1,
    },
    stickySectionHeader: {
        zIndex: 1,
    },
    scroll: {
        flex: 1,
    },
    listContent: {
        paddingBottom: 12,
        paddingTop: 4,
    },
    emptyListContent: {
        flexGrow: 1,
        paddingBottom: 12,
        justifyContent: 'center',
    },
    footerSpacer: {
        height: 8,
    },
    footerLoading: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    confirmBar: {
        paddingTop: 12,
        paddingBottom: 24,
        zIndex: 1,
    },
    centeredBody: {
        flex: 1,
        justifyContent: 'center',
    },
});

UserMultiRowItem.displayName = 'UserMultiRowItem';
SelectMultiPeopleBottomSheet.displayName = 'SelectMultiPeopleBottomSheet';
