import {RelationWithUserType} from "@/src/api/dto/constants";
import {GetRelationsApi} from "@/src/api/relations/relation";
import {GetGroupMembershipsApi} from "@/src/api/group/membership";
import {AppText} from '@/src/components/common/AppText';
import ModeTabBar from "@/src/components/expense/multi_user_select/ModeTabBar";
import ParticipantRow from "@/src/components/expense/multi_user_select/ParticipantRow";
import SuggestionsSection from "@/src/components/expense/multi_user_select/SuggestionSection";
import TypeToggleBar, { SplitSelectType } from "@/src/components/expense/multi_user_select/TypeToggleBar";
import {themeStore} from "@/src/store/themeStore";
import {userStore} from "@/src/store/userStore";
import { COLORS, PLATINUM_HEADER } from '@/src/constants/colors';
import { PlatinumFormHeader } from '@/src/components/common/PlatinumFormHeader';
import {
    useExpenseDraftStore,
    PayerUser as StorePayerUser,
    ExpenseItem,
    DraftSplitMode,
} from "@/src/store/draft/expenseDraftStore";
import {DraftValidationErrorKey} from "@/src/interfaces/expense/draft_validation";
import {
    allocateEqualAmounts,
    computePoolTotal,
    distributeProportionalAmounts,
    hasUnlockTotalDependents,
    itemAttrByUser,
    sumAllItemAttributions,
    toPoolAmount,
    toSettlementAmount,
} from "@/src/utils/expense/expenseCalculations";
import {
    getDefaultExpenseItemDraft,
    isSoleDefaultExpenseItem,
} from "@/src/utils/expense/defaultExpenseItem";
import {AppButton} from '@/src/components/common/AppButton';
import React, {useCallback, useEffect, useMemo, useState, useRef} from 'react';
import {
    FlatList,
    Pressable,
    View,
    Modal
} from 'react-native';
import {Iconify} from "react-native-iconify";
import {useNavigation, useRouter} from "expo-router";
import { ScreenWrapper } from "../common/ScreenWrapper";

/** Deep-enough clone so live draft edits cannot mutate the entry snapshot. */
function cloneDraftSlice() {
    const s = useExpenseDraftStore.getState();
    return {
        payers: JSON.parse(JSON.stringify(s.payers)) as StorePayerUser[],
        splitParticipants: JSON.parse(JSON.stringify(s.splitParticipants)) as StorePayerUser[],
        totalAmount: s.totalAmount,
        expenseItems: JSON.parse(JSON.stringify(s.expenseItems)) as ExpenseItem[],
        paidBySplitMode: s.paidBySplitMode as DraftSplitMode,
        splitBetweenSplitMode: s.splitBetweenSplitMode as DraftSplitMode,
    };
}

type DraftEntrySnapshot = ReturnType<typeof cloneDraftSlice>;

export type SplitMode = 'equal' | 'amount' | 'percentage' | 'shares';

export interface ToggleUserPayload {
    id: string;
    user_type: RelationWithUserType;
    name?: string;
    avatarUrl?: string | null;
}

export interface UserItem {
    id: string;
    name: string;
    avatarUrl: string | null;
    amount: number;
    isLocked: boolean;
    shares?: number;
    user_type: RelationWithUserType;
}

interface MultiUserSplitSelectProps {
    type: SplitSelectType;
    onSave?: (users: UserItem[]) => void;
}

const getUserItemKey = (id: string | number, type: RelationWithUserType): string => {
    return `${String(id)}-${type}`;
};

const MultiUserSplitSelect = ({type, onSave}: MultiUserSplitSelectProps) => {
    const {theme} = themeStore();
    const router = useRouter();
    const navigation = useNavigation();
    const {user: currentUser} = userStore();
    const isDark = theme === 'dark';
    const colors = isDark ? COLORS.dark : COLORS.light;

    const draft = useExpenseDraftStore();
    /** Live edits write to the draft; discard on back unless Confirm ran. */
    const entrySnapshotRef = useRef<DraftEntrySnapshot | null>(null);
    const didConfirmRef = useRef(false);
    const selectedGroupId = draft.groupId;
    const itemAttrMap = useMemo(
        () => itemAttrByUser(draft.expenseItems),
        [draft.expenseItems]
    );
    const itemAttrSum = useMemo(
        () => sumAllItemAttributions(draft.expenseItems),
        [draft.expenseItems]
    );
    const itemAttrMapRef = useRef(itemAttrMap);
    const itemAttrSumRef = useRef(itemAttrSum);
    useEffect(() => {
        itemAttrMapRef.current = itemAttrMap;
    }, [itemAttrMap]);
    useEffect(() => {
        itemAttrSumRef.current = itemAttrSum;
    }, [itemAttrSum]);

    const paidBySplitMode = useExpenseDraftStore((s) => s.paidBySplitMode);
    const splitBetweenSplitMode = useExpenseDraftStore((s) => s.splitBetweenSplitMode);
    const setPaidBySplitMode = useExpenseDraftStore((s) => s.setPaidBySplitMode);
    const setSplitBetweenSplitMode = useExpenseDraftStore((s) => s.setSplitBetweenSplitMode);

    const resolveStoredMode = useCallback(
        (side: SplitSelectType): SplitMode =>
            side === 'paidBy' ? paidBySplitMode : splitBetweenSplitMode,
        [paidBySplitMode, splitBetweenSplitMode],
    );

    const persistMode = useCallback(
        (side: SplitSelectType, mode: SplitMode) => {
            if (side === 'paidBy') setPaidBySplitMode(mode);
            else setSplitBetweenSplitMode(mode);
        },
        [setPaidBySplitMode, setSplitBetweenSplitMode],
    );

    const [activeType, setActiveType] = useState<SplitSelectType>(type);
    const [splitMode, setSplitMode] = useState<SplitMode>(() =>
        type === 'paidBy'
            ? useExpenseDraftStore.getState().paidBySplitMode
            : useExpenseDraftStore.getState().splitBetweenSplitMode,
    );
    const [availableUsers, setAvailableUsers] = useState<ToggleUserPayload[]>([]);
    const [loading, setLoading] = useState(true);

    const [isTotalLocked, setIsTotalLocked] = useState<boolean>(true);
    const [validationErrorModal, setValidationErrorModal] = useState<{ visible: boolean; msg: string }>({
        visible: false,
        msg: ''
    });
    /** Deferred expense total when dependents exist — applied on Confirm */
    const [pendingNextTotal, setPendingNextTotal] = useState<number | null>(null);
    const [totalDriftModalVisible, setTotalDriftModalVisible] = useState(false);
    const [confirmNextTotal, setConfirmNextTotal] = useState<number | null>(null);

    const entryTotalRef = useRef(draft.totalAmount);
    const splitModeRef = useRef<SplitMode>(
        type === 'paidBy'
            ? useExpenseDraftStore.getState().paidBySplitMode
            : useExpenseDraftStore.getState().splitBetweenSplitMode,
    );
    const isTotalLockedRef = useRef<boolean>(true);
    const activeTypeRef = useRef<SplitSelectType>(type);

    useEffect(() => {
        entrySnapshotRef.current = cloneDraftSlice();
        didConfirmRef.current = false;
    }, []);

    const restoreEntrySnapshot = useCallback(() => {
        const snap = entrySnapshotRef.current;
        if (!snap || didConfirmRef.current) return;
        const store = useExpenseDraftStore.getState();
        store.setPayers(snap.payers);
        store.setSplitParticipants(snap.splitParticipants);
        store.setTotalAmount(snap.totalAmount);
        store.setExpenseItems(snap.expenseItems);
        store.setPaidBySplitMode(snap.paidBySplitMode);
        store.setSplitBetweenSplitMode(snap.splitBetweenSplitMode);
    }, []);

    const commitAndLeave = useCallback(
        (users: UserItem[]) => {
            didConfirmRef.current = true;
            onSave?.(users);
        },
        [onSave],
    );

    useEffect(() => {
        const unsub = navigation.addListener('beforeRemove', () => {
            restoreEntrySnapshot();
        });
        return unsub;
    }, [navigation, restoreEntrySnapshot]);

    useEffect(() => {
        entryTotalRef.current = draft.totalAmount;
        setPendingNextTotal(null);
        setTotalDriftModalVisible(false);
        setConfirmNextTotal(null);
    }, [activeType]);

    useEffect(() => {
        splitModeRef.current = splitMode;
    }, [splitMode]);

    useEffect(() => {
        isTotalLockedRef.current = isTotalLocked;
    }, [isTotalLocked]);

    useEffect(() => {
        activeTypeRef.current = activeType;
    }, [activeType]);

    const onAddNewUser = () => {
        router.push('/(authenticated)/user/add');
    };

    const manualAmountsRef = useRef<Record<string, number>>({});

    const handleChangeActiveType = useCallback((nextType: SplitSelectType) => {
        if (nextType === activeTypeRef.current) return;
        manualAmountsRef.current = {};
        const restoredMode = resolveStoredMode(nextType);
        setSplitMode(restoredMode);
        splitModeRef.current = restoredMode;
        setActiveType(nextType);
    }, [resolveStoredMode]);

    // Keep local mode in sync if draft is reset while this screen is mounted.
    useEffect(() => {
        const stored = resolveStoredMode(activeType);
        if (stored !== splitModeRef.current) {
            setSplitMode(stored);
            splitModeRef.current = stored;
        }
    }, [resolveStoredMode, activeType]);

    const resolvedExpenseTotal = pendingNextTotal ?? draft.totalAmount;

    /** Split edits the pool only; Paid By uses full expense total. */
    const totalExpense = useMemo(() => {
        if (activeType === 'split') {
            return computePoolTotal(resolvedExpenseTotal, draft.expenseItems);
        }
        return resolvedExpenseTotal;
    }, [activeType, resolvedExpenseTotal, draft.expenseItems]);

    const selectedUsers = useMemo<UserItem[]>(() => {
        const targetingStoreList = activeType === 'paidBy' ? draft.payers : draft.splitParticipants;

        return targetingStoreList.map(u => {
            const isSelf = currentUser &&
                String(u.id) === String(currentUser.id) &&
                u.user_type === RelationWithUserType.USER;

            const key = getUserItemKey(u.id, u.user_type);
            const itemAttr = itemAttrMap.get(key) || 0;

            let cleanAmount = u.amount;
            if (activeType === 'split') {
                // Store holds settlement (pool + items); UI edits pool only
                cleanAmount = toPoolAmount(u.amount, itemAttr);
            }
            if (!isTotalLockedRef.current && splitModeRef.current === 'amount' && manualAmountsRef.current[key] !== undefined) {
                cleanAmount = manualAmountsRef.current[key];
            }

            return {
                id: u.id,
                name: isSelf ? "You" : u.name,
                avatarUrl: u.avatar?.url || null,
                amount: cleanAmount,
                isLocked: u.isLocked ?? false,
                shares: u.shares ?? 1,
                user_type: u.user_type
            };
        });
    }, [draft.payers, draft.splitParticipants, activeType, currentUser, totalExpense, splitMode, isTotalLocked, itemAttrMap]);

    const equalShareLabel = useMemo(() => {
        if (splitMode !== 'equal' || selectedUsers.length === 0) return null;
        const chunks = allocateEqualAmounts(totalExpense, selectedUsers.length);
        const min = Math.min(...chunks);
        const max = Math.max(...chunks);
        return min === max
            ? `₹${min.toFixed(2)} each`
            : `₹${min.toFixed(2)}–₹${max.toFixed(2)}`;
    }, [splitMode, selectedUsers.length, totalExpense]);

    const selectedUsersRef = useRef<UserItem[]>([]);

    useEffect(() => {
        selectedUsersRef.current = selectedUsers;
    }, [selectedUsers]);

    const sideHasUnlockDependents = useCallback(() => {
        const side = activeTypeRef.current === 'split' ? 'split' : 'paidBy';
        return hasUnlockTotalDependents(
            side,
            draft.payers,
            draft.splitParticipants,
            draft.expenseItems,
            currentUser?.id,
            entryTotalRef.current
        );
    }, [draft.payers, draft.splitParticipants, draft.expenseItems, currentUser?.id]);

    const dispatchStoreUpdate = (updatedUsers: UserItem[], forceTotalUpdate?: number) => {
        const isSplit = activeTypeRef.current === 'split';
        const attrs = itemAttrMapRef.current;
        const attrSum = itemAttrSumRef.current;

        const serializedStoreList: StorePayerUser[] = updatedUsers.map(u => {
            const key = getUserItemKey(u.id, u.user_type);
            const itemAttr = attrs.get(key) || 0;
            return {
                id: u.id,
                name: u.name,
                avatar: u.avatarUrl ? {id: `avatar-${u.id}`, name: '', url: u.avatarUrl, extension: ''} : null,
                // Persist settlement = pool UI amount + item attributions
                amount: isSplit ? toSettlementAmount(u.amount, itemAttr) : u.amount,
                shares: u.shares ?? 1,
                isLocked: u.isLocked,
                user_type: u.user_type
            };
        });

        if (isSplit) {
            draft.setSplitParticipants(serializedStoreList);
        } else {
            draft.setPayers(serializedStoreList);
        }

        if (forceTotalUpdate !== undefined) {
            // Keep pool+items for live UI math; Confirm Selection clears items and
            // commits the edited pool/paid sum as the new expense total.
            const nextExpenseTotal = isSplit
                ? forceTotalUpdate + attrSum
                : forceTotalUpdate;
            const drifted = Math.abs(nextExpenseTotal - entryTotalRef.current) > 0.009;
            if (drifted && sideHasUnlockDependents()) {
                // Defer expense total write until Confirm Selection
                setPendingNextTotal(nextExpenseTotal);
            } else {
                draft.setTotalAmount(nextExpenseTotal);
                const defaultItem = getDefaultExpenseItemDraft(nextExpenseTotal);
                if (defaultItem && (draft.expenseItems.length === 0 || isSoleDefaultExpenseItem(draft.expenseItems))) {
                    draft.setExpenseItems([defaultItem]);
                }
                setPendingNextTotal(null);
            }
        }
    };

    useEffect(() => {
        const mapToPayload = (
            id: number | string,
            name: string,
            avatarUrl: string | null | undefined,
            userType: RelationWithUserType,
        ): ToggleUserPayload => {
            const isSelf = !!currentUser &&
                String(id) === String(currentUser.id) &&
                userType === RelationWithUserType.USER;
            return {
                id: String(id),
                name: isSelf ? "You" : name,
                avatarUrl: avatarUrl || null,
                user_type: userType,
            };
        };

        const fetchUsers = async () => {
            try {
                setLoading(true);
                setAvailableUsers([]);

                if (selectedGroupId) {
                    const res = await GetGroupMembershipsApi(selectedGroupId, {offset: 0, limit: 100});
                    if (res?.data) {
                        setAvailableUsers(
                            res.data.map((membership) =>
                                mapToPayload(
                                    membership.user.id,
                                    membership.user.name,
                                    membership.user.avatar?.url,
                                    membership.user.user_type,
                                )
                            )
                        );
                    }
                } else {
                    const res = await GetRelationsApi({limit: 50});
                    if (res?.data) {
                        setAvailableUsers(
                            res.data.map((rel) =>
                                mapToPayload(
                                    rel.with_user.id,
                                    rel.with_user.name,
                                    rel.with_user.avatar?.url,
                                    rel.with_user.user_type,
                                )
                            )
                        );
                    }
                }
            } catch (e) {
                console.error(
                    selectedGroupId
                        ? "Error fetching group membership registry data:"
                        : "Error fetching relations registry data:",
                    e
                );
                setAvailableUsers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [currentUser, selectedGroupId]);

    // Re-check group membership when payers / split participants change
    useEffect(() => {
        if (!selectedGroupId) return;
        const timer = setTimeout(() => {
            void draft.runIntegrityValidation(DraftValidationErrorKey.GROUP_MISMATCH);
        }, 350);
        return () => clearTimeout(timer);
    }, [selectedGroupId, draft.payers, draft.splitParticipants]);

    const filteredSuggestions = useMemo<ToggleUserPayload[]>(() => {
        const suggestionsList: ToggleUserPayload[] = [];
        const selectedKeys = new Set(
            selectedUsers.map((su) => getUserItemKey(su.id, su.user_type))
        );

        const selfKey = currentUser
            ? getUserItemKey(currentUser.id, RelationWithUserType.USER)
            : null;
        const selfInAvailable = !!selfKey && availableUsers.some(
            (user) => getUserItemKey(user.id, user.user_type) === selfKey
        );

        // Relations mode: always offer "You" even if not returned by the relations API.
        // Group mode: only include self when they are an actual group member.
        if (
            currentUser &&
            selfKey &&
            !selectedKeys.has(selfKey) &&
            !selfInAvailable &&
            !selectedGroupId
        ) {
            suggestionsList.push({
                id: String(currentUser.id),
                name: "You",
                avatarUrl: currentUser.avatar?.url || null,
                user_type: RelationWithUserType.USER,
            });
        }

        availableUsers.forEach((user) => {
            const userKey = getUserItemKey(user.id, user.user_type);
            if (!selectedKeys.has(userKey)) {
                suggestionsList.push(user);
            }
        });

        return suggestionsList;
    }, [availableUsers, selectedUsers, currentUser, selectedGroupId]);

    // Shared targeted lock operational layout block (Common logic abstraction)
    const executeInternalTargetLock = (id: string, computedAmount: number, activeUsers: UserItem[]) => {
        if (activeUsers.length === 2) {
            const next = activeUsers.map(u => ({
                ...u,
                amount: getUserItemKey(u.id, u.user_type) === id ? computedAmount : totalExpense - computedAmount,
                isLocked: true
            }));
            console.log(next);
            dispatchStoreUpdate(next, totalExpense);
            return;
        }

        let next = activeUsers.map(u =>
            getUserItemKey(u.id, u.user_type) === id ? {...u, amount: computedAmount, isLocked: true} : u
        );

        const currentlyUnlocked = next.filter(u => !u.isLocked);

        if (currentlyUnlocked.length === 1) {
            next = next.map(u => ({...u, isLocked: true}));
        }

        const balancedList = balanceAmounts(next, splitModeRef.current, totalExpense);
        dispatchStoreUpdate(balancedList, totalExpense);
    };

    // --- ENCAPSULATED SEPARATE MODE WORKFLOWS ---

    const handleAmountModeWorkflow = (id: string, computedAmount: number, activeUsers: UserItem[], lockedState: boolean) => {
        const otherUsersSum = activeUsers
            .filter(u => getUserItemKey(u.id, u.user_type) !== id)
            .reduce((sum, u) => sum + u.amount, 0);

        const lockedOtherUsersSum = activeUsers
            .filter(u => getUserItemKey(u.id, u.user_type) !== id && u.isLocked)
            .reduce((sum, u) => sum + u.amount, 0);

        if (lockedState) {
            if (computedAmount + lockedOtherUsersSum > totalExpense) {
                setValidationErrorModal({
                    visible: true,
                    msg: `The value of ₹${computedAmount.toFixed(2)} combined with other locked allocations exceeds the absolute expense limit of ₹${totalExpense.toFixed(2)}.`
                });
                return false;
            }

            executeInternalTargetLock(id, computedAmount, activeUsers);
        } else {
            const newCalculatedTotal = computedAmount + otherUsersSum;

            activeUsers.forEach(u => {
                const key = getUserItemKey(u.id, u.user_type);
                manualAmountsRef.current[key] = key === id ? computedAmount : u.amount;
            });

            const next = activeUsers.map(u => {
                const key = getUserItemKey(u.id, u.user_type);
                return {
                    ...u,
                    amount: manualAmountsRef.current[key],
                    isLocked: false
                };
            });
            dispatchStoreUpdate(next, newCalculatedTotal);
        }
        return true;
    };

    const handlePercentageModeWorkflow = (id: string, computedAmount: number, activeUsers: UserItem[], lockedState: boolean) => {
        if (lockedState) {
            if (computedAmount > totalExpense) {
                setValidationErrorModal({
                    visible: true,
                    msg: `The specified percentage evaluates to ₹${computedAmount.toFixed(2)}, which exceeds the total budget pool of ₹${totalExpense.toFixed(2)}.`
                });
                return false;
            }

            const lockedOtherUsersSum = activeUsers
                .filter(u => getUserItemKey(u.id, u.user_type) !== id && u.isLocked)
                .reduce((sum, u) => sum + u.amount, 0);

            if (computedAmount + lockedOtherUsersSum > totalExpense) {
                setValidationErrorModal({
                    visible: true,
                    msg: "The sum of your entered percentage and other locked values exceeds 100% of the total layout limit."
                });
                return false;
            }

            executeInternalTargetLock(id, computedAmount, activeUsers);
        } else {
            const otherUsersSum = activeUsers
                .filter(u => getUserItemKey(u.id, u.user_type) !== id)
                .reduce((sum, u) => sum + u.amount, 0);

            const newCalculatedTotal = computedAmount + otherUsersSum;
            const next = activeUsers.map(u =>
                getUserItemKey(u.id, u.user_type) === id ? {...u, amount: computedAmount, isLocked: false} : {
                    ...u,
                    isLocked: false
                }
            );
            dispatchStoreUpdate(next, newCalculatedTotal);
        }
        return true;
    };

    const handleSharesModeWorkflow = (activeUsers: UserItem[], lockedState: boolean) => {
        const totalSharesCount = activeUsers.reduce((sum, u) => sum + (u.shares ?? 1), 0);

        if (lockedState) {
            const balanced = activeUsers.map(u => ({
                ...u,
                amount: totalSharesCount > 0 ? (totalExpense * (u.shares ?? 1)) / totalSharesCount : 0,
                isLocked: false
            }));
            dispatchStoreUpdate(balanced, totalExpense);
        } else {
            const baselineSharesCount = selectedUsersRef.current.reduce((sum, u) => sum + (u.shares ?? 1), 0);
            const pricingUnitCost = baselineSharesCount > 0 ? totalExpense / baselineSharesCount : 0;
            const scaledExpenseAmount = totalSharesCount * pricingUnitCost;

            const balanced = activeUsers.map(u => ({
                ...u,
                amount: totalSharesCount > 0 ? (scaledExpenseAmount * (u.shares ?? 1)) / totalSharesCount : 0,
                isLocked: false
            }));
            dispatchStoreUpdate(balanced, scaledExpenseAmount);
        }
    };

    const handleUpdateSingleUserAmount = (id: string, computedAmount: number) => {
        const activeUsers = [...selectedUsersRef.current];
        const lockedState = isTotalLockedRef.current;
        const currentMode = splitModeRef.current;

        console.log(`[FLOW ROUTER] Mode: ${currentMode}, Total Locked Status: ${lockedState}`);

        if (currentMode === 'amount') {
            return handleAmountModeWorkflow(id, computedAmount, activeUsers, lockedState);
        }

        if (currentMode === 'percentage') {
            return handlePercentageModeWorkflow(id, computedAmount, activeUsers, lockedState);
        }

        if (currentMode === 'shares') {
            handleSharesModeWorkflow(activeUsers, lockedState);
            return true;
        }
        return false;
    };

    const adjustShareValue = (id: string, action: 'increment' | 'decrement') => {
        const currentSelected = selectedUsersRef.current;
        const targetUser = currentSelected.find(u => getUserItemKey(u.id, u.user_type) === id);
        if (!targetUser) return;

        if (action === 'decrement' && (targetUser.shares ?? 1) === 1) {
            handleToggleUser({
                id: targetUser.id,
                user_type: targetUser.user_type,
                name: targetUser.name,
                avatarUrl: targetUser.avatarUrl
            });
            return;
        }

        const next = currentSelected.map(u => {
            if (getUserItemKey(u.id, u.user_type) !== id) return u;
            const currentShare = u.shares ?? 1;
            const targetShare = action === 'increment' ? Math.floor(currentShare) + 1 : Math.ceil(currentShare) - 1;
            return {...u, shares: Math.max(1, targetShare)};
        });

        handleSharesModeWorkflow(next, isTotalLockedRef.current);
    };

    const changeModeSetup = (mode: SplitMode) => {
        setSplitMode(mode);
        splitModeRef.current = mode;
        persistMode(activeTypeRef.current, mode);
        manualAmountsRef.current = {};

        const baselineUsers = selectedUsersRef.current.map(u => ({...u, isLocked: false}));

        if (mode === 'equal') {
            const chunks = allocateEqualAmounts(totalExpense, Math.max(1, baselineUsers.length));
            dispatchStoreUpdate(
                baselineUsers.map((u, i) => ({...u, amount: chunks[i] ?? 0})),
                totalExpense,
            );
        } else if (mode === 'shares') {
            const minAmount = Math.min(...baselineUsers.map(u => u.amount).filter(a => a > 0), totalExpense);
            const next = baselineUsers.map(u => ({
                ...u,
                shares: minAmount > 0 ? parseFloat((u.amount / minAmount).toFixed(6)) : 1
            }));
            const totalShares = next.reduce((sum, u) => sum + u.shares, 0);
            dispatchStoreUpdate(next.map(u => ({
                ...u,
                amount: totalShares > 0 ? (totalExpense * u.shares) / totalShares : 0
            })), totalExpense);
        }
    };

    const handleToggleUser = (user: ToggleUserPayload) => {
        const currentSelected = selectedUsersRef.current;
        const targetKey = getUserItemKey(user.id, user.user_type);
        const existingUser = currentSelected.find(u => getUserItemKey(u.id, u.user_type) === targetKey);
        let next: UserItem[];

        delete manualAmountsRef.current[targetKey];

        if (existingUser) {
            if (currentSelected.length <= 1) return;
            next = currentSelected.filter(u => getUserItemKey(u.id, u.user_type) !== targetKey);
            if (isTotalLockedRef.current && (next.length === 2 || next.every(u => u.isLocked))) {
                next = next.map(u => ({...u, isLocked: false}));
            }

            const nextSumTotal = next.reduce((sum, u) => sum + u.amount, 0);
            updateBalances(next, splitModeRef.current, isTotalLockedRef.current ? totalExpense : nextSumTotal);
        } else {
            const isSelf = currentUser &&
                String(user.id) === String(currentUser.id) &&
                user.user_type === RelationWithUserType.USER;

            const userToAdd: UserItem = {
                id: user.id,
                name: isSelf ? "You" : (user.name || "Unknown"),
                avatarUrl: user.avatarUrl || null,
                amount: 0,
                isLocked: false,
                shares: 1,
                user_type: user.user_type
            };

            if (!isTotalLockedRef.current) {
                next = [...currentSelected, userToAdd];
                updateBalances(next, splitModeRef.current, totalExpense);
            } else {
                if (currentSelected.length === 1) {
                    const halves = allocateEqualAmounts(totalExpense, 2);
                    next = [
                        {
                            ...currentSelected[0],
                            amount: halves[0] ?? 0,
                            isLocked: false,
                            shares: currentSelected[0].shares ?? 1
                        },
                        {...userToAdd, amount: halves[1] ?? 0}
                    ];
                } else {
                    next = [...currentSelected, userToAdd];
                }
                updateBalances(next);
            }
        }
    };

    const onToggleLock = (id: string) => {
        const currentSelected = selectedUsersRef.current;
        if (currentSelected.length <= 1 || splitModeRef.current === 'shares' || splitModeRef.current === 'equal') return;

        manualAmountsRef.current = {};

        if (currentSelected.length === 2) {
            const isCurrentlyLocked = currentSelected.every(u => u.isLocked);
            const next = currentSelected.map(u => ({...u, isLocked: !isCurrentlyLocked}));
            dispatchStoreUpdate(next, totalExpense);
            return;
        }

        let next = currentSelected.map(u => getUserItemKey(u.id, u.user_type) === id ? {
            ...u,
            isLocked: !u.isLocked
        } : u);
        const currentlyUnlocked = next.filter(u => !u.isLocked);

        if (currentlyUnlocked.length === 1 && currentSelected.find(u => getUserItemKey(u.id, u.user_type) === id)?.isLocked === false) {
            next = next.map(u => ({...u, isLocked: true}));
        } else if (currentlyUnlocked.length === 1 && currentSelected.every(u => u.isLocked)) {
            const partnerIndex = next.findIndex(u => getUserItemKey(u.id, u.user_type) !== id);
            if (partnerIndex !== -1) next[partnerIndex].isLocked = false;
        }

        updateBalances(next);
    };

    const balanceAmounts = (users: UserItem[], currentMode = splitModeRef.current, targetGlobalExpense = totalExpense): UserItem[] => {
        if (users.length === 0) return [];

        if (!isTotalLockedRef.current && currentMode === 'amount') {
            return users;
        }

        if (currentMode === 'equal') {
            const chunks = allocateEqualAmounts(targetGlobalExpense, users.length);
            return users.map((u, i) => ({...u, amount: chunks[i] ?? 0, isLocked: false}));
        }

        if (users.length === 1) {
            return [{...users[0], amount: targetGlobalExpense, isLocked: true, shares: users[0].shares ?? 1}];
        }

        if (currentMode === 'shares') {
            const totalShares = users.reduce((sum, u) => sum + (u.shares ?? 1), 0);
            return users.map(u => ({
                ...u,
                amount: totalShares > 0 ? (targetGlobalExpense * (u.shares ?? 1)) / totalShares : 0,
                isLocked: false
            }));
        }

        if (users.length === 2) {
            const anyLocked = users.some(u => u.isLocked);
            if (!anyLocked) {
                const halves = allocateEqualAmounts(targetGlobalExpense, 2);
                return users.map((u, i) => ({
                    ...u,
                    amount: halves[i] ?? 0,
                    isLocked: false,
                    shares: u.shares ?? 1,
                }));
            }
        }

        let processedUsers = [...users];
        const lockedUsers = processedUsers.filter(u => u.isLocked);
        const unlockedUsers = processedUsers.filter(u => !u.isLocked);
        const lockedTotal = lockedUsers.reduce((sum, u) => sum + u.amount, 0);

        const remainingToDistribute = Math.max(0, targetGlobalExpense - lockedTotal);
        if (unlockedUsers.length === 0) return processedUsers;

        const splitAmount = remainingToDistribute / unlockedUsers.length;
        return processedUsers.map(u => u.isLocked ? u : {...u, amount: splitAmount});
    };

    const updateBalances = (nextUsers: UserItem[], mode = splitModeRef.current, targetGlobalExpense = totalExpense) => {
        if (!isTotalLockedRef.current && mode === 'amount') {
            dispatchStoreUpdate(nextUsers, targetGlobalExpense);
            return;
        }
        const balanced = balanceAmounts(nextUsers, mode, targetGlobalExpense);
        dispatchStoreUpdate(balanced, targetGlobalExpense);
    };

    const canvasBg = colors.bg.primary;
    const heroStatusBar = isDark ? PLATINUM_HEADER.dark : PLATINUM_HEADER.light;

    return (
        <ScreenWrapper
            withPadding={false}
            backgroundColor={heroStatusBar}
            statusBarStyle="light-content"
            className="relative flex-1"
        >
            <View className="flex-1" style={{backgroundColor: heroStatusBar}}>
                <PlatinumFormHeader
                    title={activeType === 'paidBy' ? 'Paid by' : 'Split between'}
                    subtitle="People · Amounts · Lock shares"
                    onBack={() => router.back()}
                />

                <View
                    className="flex-1 overflow-hidden"
                    style={{
                        marginTop: -20,
                        borderTopLeftRadius: 28,
                        borderTopRightRadius: 28,
                        backgroundColor: canvasBg,
                    }}
                >
                <TypeToggleBar
                    activeType={activeType}
                    isDark={isDark}
                    onChangeType={handleChangeActiveType}
                />

                {/* Upper Horizontal Quick Suggestions Bar */}
                <SuggestionsSection
                    loading={loading}
                    allUsers={filteredSuggestions}
                    selectedUsers={selectedUsers}
                    title={selectedGroupId ? 'Group Members' : 'Suggestions'}
                    onToggleUser={handleToggleUser}
                    onAddNewUser={selectedGroupId ? undefined : onAddNewUser}
                />

                {/* Calculation Mode Switcher Bar */}
                <ModeTabBar
                    splitMode={splitMode}
                    isDark={isDark}
                    onChangeMode={changeModeSetup}
                />

                {/* Scrollable Selected Participants Section */}
                <View className="mt-4 flex-1 px-4">
                    <FlatList
                        data={selectedUsers}
                        keyExtractor={item => getUserItemKey(item.id, item.user_type)}
                        extraData={[splitMode, totalExpense, selectedUsers, isTotalLocked, activeType]}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{paddingBottom: 16}}
                        renderItem={({item}) => (
                            <ParticipantRow
                                item={item}
                                splitMode={splitMode}
                                totalExpense={totalExpense}
                                isTotalLocked={isTotalLocked}
                                isDark={isDark}
                                disableSwipe={selectedUsers.length <= 1}
                                onToggleUser={handleToggleUser}
                                onToggleLock={onToggleLock}
                                onAdjustShares={adjustShareValue}
                                onUpdateAmount={handleUpdateSingleUserAmount}
                            />
                        )}
                    />
                </View>

                {/* Fixed Summary & Confirmation Dock */}
                <View
                    className="p-5 border-t border-border-input"
                    style={{ backgroundColor: colors.bg.lighter }}
                >
                    <View
                        className="flex-row justify-between items-center mb-4 px-4 py-3.5 rounded-2xl"
                        style={{ backgroundColor: colors.bg.darker }}
                    >
                        <View className="space-y-0.5">
                            <View className="flex-row items-center gap-x-1.5">
                                <AppText variant="body-small"
                                         className="opacity-50 uppercase tracking-wider font-semibold">
                                    {activeType === 'split' && itemAttrSum > 0
                                        ? 'Remaining to split'
                                        : 'Total Expense'}
                                </AppText>

                                <Pressable
                                    onPress={() => {
                                        setIsTotalLocked(!isTotalLocked);
                                    }}
                                    className="p-1 rounded-md"
                                >
                                    {isTotalLocked ? (
                                        <Iconify icon="heroicons:lock-closed" size={14} color={colors.status.warning}/>
                                    ) : (
                                        <Iconify icon="heroicons:lock-open" size={14} color={colors.icon.primary}/>
                                    )}
                                </Pressable>
                            </View>
                            <AppText variant="body-small" className="text-green-increase font-medium">
                                {activeType === 'paidBy' ? 'Paid by' : 'Splitting with'}{' '}
                                {selectedUsers.length} {selectedUsers.length === 1 ? 'person' : 'people'}
                                {activeType === 'split' && itemAttrSum > 0
                                    ? ` · ₹${itemAttrSum.toFixed(2)} on items`
                                    : ''}
                            </AppText>
                        </View>
                        <View className="items-end">
                            <AppText variant="h2"
                                     className="font-black tracking-tight text-green-increase">
                                ₹{totalExpense.toFixed(2)}
                            </AppText>
                            {equalShareLabel != null && (
                                <AppText variant="caption-xs" className="opacity-40 font-medium mt-0.5">
                                    {equalShareLabel}
                                </AppText>
                            )}
                        </View>
                    </View>

                    <Pressable
                        onPress={() => {
                            const poolOrPaidSum = selectedUsers.reduce(
                                (sum, u) => sum + (u.amount || 0),
                                0
                            );
                            // Drift vs current expense (split still counts item floors).
                            const expenseIfKeepingItems =
                                activeType === 'split'
                                    ? poolOrPaidSum + itemAttrSum
                                    : poolOrPaidSum;
                            const drifted =
                                Math.abs(expenseIfKeepingItems - entryTotalRef.current) > 0.009;
                            if (drifted && sideHasUnlockDependents()) {
                                // Custom items / other side → confirm before replacing
                                setConfirmNextTotal(poolOrPaidSum);
                                setTotalDriftModalVisible(true);
                                return;
                            }
                            if (pendingNextTotal != null) {
                                draft.setTotalAmount(pendingNextTotal);
                                const defaultItem = getDefaultExpenseItemDraft(pendingNextTotal);
                                if (
                                    defaultItem &&
                                    (draft.expenseItems.length === 0 ||
                                        isSoleDefaultExpenseItem(draft.expenseItems))
                                ) {
                                    draft.setExpenseItems([defaultItem]);
                                }
                                setPendingNextTotal(null);
                            } else if (drifted) {
                                draft.setTotalAmount(poolOrPaidSum);
                                const defaultItem = getDefaultExpenseItemDraft(poolOrPaidSum);
                                if (
                                    defaultItem &&
                                    (draft.expenseItems.length === 0 ||
                                        isSoleDefaultExpenseItem(draft.expenseItems))
                                ) {
                                    draft.setExpenseItems([defaultItem]);
                                }
                                entryTotalRef.current = poolOrPaidSum;
                            }
                            commitAndLeave(selectedUsers);
                        }}
                        style={({pressed}) => [{transform: [{scale: pressed ? 0.98 : 1}]}]}
                        className="h-14 bg-bg-secondary rounded-2xl flex-row items-center justify-center active:opacity-95 shadow-sm"
                    >
                        <AppText className="text-text-secondary font-bold text-lg tracking-wide mr-2">Confirm Selection</AppText>
                        <Iconify icon="heroicons:arrow-right-20-solid" size={20} color={colors.text.contrast}/>
                    </Pressable>
                </View>
                </View>
            </View>

            <Modal visible={totalDriftModalVisible} animationType="fade" transparent>
                <View className="flex-1 items-center justify-center bg-black/60 px-6">
                    <View className="w-full rounded-3xl border border-border-input bg-bg-primary p-6">
                        <View className="mb-4 items-center">
                            <View className="mb-2 rounded-full bg-amber-500/10 p-3">
                                <Iconify
                                    icon="heroicons:exclamation-triangle"
                                    size={32}
                                    color={colors.status.warning}
                                />
                            </View>
                            <AppText variant="h3" className="text-center font-bold text-text-primary">
                                Update expense total?
                            </AppText>
                        </View>
                        <AppText className="mb-2 text-center text-text-primary-lighter">
                            Expense total would change from ₹{entryTotalRef.current.toFixed(2)} to ₹
                            {(confirmNextTotal ?? 0).toFixed(2)}. The other side (
                            {activeType === 'paidBy' ? 'Split Between' : 'Paid By'}) will be
                            redistributed.
                        </AppText>
                        {draft.expenseItems.length > 0 &&
                            !isSoleDefaultExpenseItem(draft.expenseItems) && (
                            <AppText
                                variant="caption-xs"
                                className="mb-2 text-center text-text-primary-lighter"
                            >
                                Selected items will be replaced by the default item at the new
                                total.
                            </AppText>
                        )}
                        <AppText
                            variant="caption-xs"
                            className="mb-6 text-center text-text-primary-lighter"
                        >
                            Locked shares stay fixed when possible.
                        </AppText>

                        <AppButton
                            variant="primary"
                            size="md"
                            onPress={() => {
                                const nextTotal = confirmNextTotal ?? entryTotalRef.current;
                                const defaultItem = getDefaultExpenseItemDraft(nextTotal);
                                draft.setExpenseItems(defaultItem ? [defaultItem] : []);
                                draft.setTotalAmount(nextTotal);

                                // Keep the side the user just confirmed; redistribute the other
                                const currentSide: StorePayerUser[] =
                                    selectedUsersRef.current.map((u) => ({
                                        id: u.id,
                                        name: u.name,
                                        avatar: u.avatarUrl
                                            ? {
                                                  id: `avatar-${u.id}`,
                                                  name: '',
                                                  url: u.avatarUrl,
                                                  extension: '',
                                              }
                                            : null,
                                        amount: u.amount,
                                        shares: u.shares ?? 1,
                                        isLocked: u.isLocked,
                                        user_type: u.user_type,
                                    }));

                                if (activeType === 'paidBy') {
                                    draft.setPayers(currentSide);
                                    draft.setSplitParticipants(
                                        distributeProportionalAmounts(
                                            draft.splitParticipants,
                                            nextTotal
                                        )
                                    );
                                } else {
                                    draft.setSplitParticipants(currentSide);
                                    draft.setPayers(
                                        distributeProportionalAmounts(draft.payers, nextTotal)
                                    );
                                }

                                setPendingNextTotal(null);
                                setTotalDriftModalVisible(false);
                                setConfirmNextTotal(null);
                                entryTotalRef.current = nextTotal;
                                commitAndLeave(selectedUsersRef.current);
                            }}
                        >
                            Update total & redistribute other side
                        </AppButton>

                        <Pressable
                            onPress={() => {
                                setTotalDriftModalVisible(false);
                                setConfirmNextTotal(null);
                                setPendingNextTotal(null);
                            }}
                            className="mt-3 items-center py-3"
                        >
                            <AppText className="font-bold text-text-link">Cancel</AppText>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {/* Validation Modal */}
            <Modal visible={validationErrorModal.visible} animationType="fade" transparent>
                <View className="flex-1 items-center justify-center bg-black/60 px-6">
                    <View className="w-full p-6 rounded-3xl" style={{ backgroundColor: colors.bg.overlay }}>
                        <View className="items-center mb-4">
                            <View className="p-3 rounded-full mb-2" style={{ backgroundColor: `${colors.status.error}1A` }}>
                                <Iconify icon="heroicons:exclamation-triangle" size={32} color={colors.status.error}/>
                            </View>
                            <AppText variant="h3" className="font-bold text-center" style={{ color: colors.status.error }}>Invalid Split
                                Allocation</AppText>
                        </View>

                        <AppText className="text-center opacity-70 mb-6 leading-relaxed">
                            {validationErrorModal.msg}
                        </AppText>

                        <Pressable
                            onPress={() => setValidationErrorModal({visible: false, msg: ''})}
                            className="w-full h-12 rounded-xl items-center justify-center active:opacity-80"
                            style={{ backgroundColor: colors.bg.darker }}
                        >
                            <AppText className="font-bold text-text-primary">Dismiss and Adjust</AppText>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </ScreenWrapper>
    );
};

export default MultiUserSplitSelect;