import { RelationWithUserType } from "@/src/api/dto/constants";
import { GetRelationsApi } from "@/src/api/relations/relation";
import { AppText } from '@/src/components/common/AppText';
import ModeTabBar from "@/src/components/expense/multi_user_select/ModeTabBar";
import ParticipantRow from "@/src/components/expense/multi_user_select/ParticipantRow";
import SuggestionsSection from "@/src/components/expense/multi_user_select/SuggestionSection";
import { themeStore } from "@/src/store/themeStore";
import { userStore } from "@/src/store/userStore";
import { useExpenseDraftStore, PayerUser as StorePayerUser } from "@/src/store/draft/expenseDraftStore";
import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
    FlatList,
    Pressable,
    StyleSheet,
    View,
    SafeAreaView,
    Modal
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Iconify } from "react-native-iconify";
import { useRouter } from "expo-router";

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
    type: 'split' | 'paidBy';
    onSave?: (users: UserItem[]) => void;
}

const getUserItemKey = (id: string | number, type: RelationWithUserType): string => {
    return `${String(id)}-${type}`;
};

const MultiUserSplitSelect = ({ type, onSave }: MultiUserSplitSelectProps) => {
    const { theme } = themeStore();
    const router = useRouter();
    const { user: currentUser } = userStore();
    const isDark = theme === 'dark';

    const draft = useExpenseDraftStore();
    const totalExpense = draft.totalAmount;

    const [splitMode, setSplitMode] = useState<SplitMode>('equal');
    const [allRelations, setAllRelations] = useState<ToggleUserPayload[]>([]);
    const [loading, setLoading] = useState(true);

    const [isTotalLocked, setIsTotalLocked] = useState<boolean>(true);
    const [validationErrorModal, setValidationErrorModal] = useState<{ visible: boolean; msg: string }>({
        visible: false,
        msg: ''
    });

    const splitModeRef = useRef<SplitMode>('equal');
    const isTotalLockedRef = useRef<boolean>(true);

    useEffect(() => {
        splitModeRef.current = splitMode;
    }, [splitMode]);

    useEffect(() => {
        isTotalLockedRef.current = isTotalLocked;
    }, [isTotalLocked]);

    const onAddNewUser = () => {
        router.push('/(authenticated)/user/add');
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/(authenticated)');
        }
    };

    const manualAmountsRef = useRef<Record<string, number>>({});

    const selectedUsers = useMemo<UserItem[]>(() => {
        const targetingStoreList = type === 'paidBy' ? draft.payers : draft.splitParticipants;

        return targetingStoreList.map(u => {
            const isSelf = currentUser &&
                String(u.id) === String(currentUser.id) &&
                u.user_type === RelationWithUserType.USER;

            const key = getUserItemKey(u.id, u.user_type);

            let cleanAmount = u.amount;
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
    }, [draft.payers, draft.splitParticipants, type, currentUser, totalExpense, splitMode, isTotalLocked]);

    const selectedUsersRef = useRef<UserItem[]>([]);

    useEffect(() => {
        selectedUsersRef.current = selectedUsers;
    }, [selectedUsers]);

    const dispatchStoreUpdate = (updatedUsers: UserItem[], forceTotalUpdate?: number) => {
        const serializedStoreList: StorePayerUser[] = updatedUsers.map(u => ({
            id: u.id,
            name: u.name,
            avatar: u.avatarUrl ? { id: `avatar-${u.id}`, name: '', url: u.avatarUrl, extension: '' } : null,
            amount: u.amount,
            shares: u.shares ?? 1,
            isLocked: u.isLocked,
            user_type: u.user_type
        }));

        if (type === 'paidBy') {
            draft.setPayers(serializedStoreList);
        } else {
            draft.setSplitParticipants(serializedStoreList);
        }

        if (forceTotalUpdate !== undefined) {
            draft.setTotalAmount(forceTotalUpdate);
        }
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const res = await GetRelationsApi({ limit: 50 });
                if (res?.data) {
                    const mapped: ToggleUserPayload[] = res.data.map((rel: any) => {
                        const isSelf = currentUser &&
                            String(rel.with_user.id) === String(currentUser.id) &&
                            rel.with_user.user_type === RelationWithUserType.USER;
                        return {
                            id: String(rel.with_user.id),
                            name: isSelf ? "You" : rel.with_user.name,
                            avatarUrl: rel.with_user.avatar?.url || null,
                            user_type: rel.with_user.user_type
                        };
                    });
                    setAllRelations(mapped);
                }
            } catch (e) {
                console.error("Error fetching relations registry data:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [currentUser]);

    const filteredSuggestions = useMemo<ToggleUserPayload[]>(() => {
        const suggestionsList: ToggleUserPayload[] = [];
        if (currentUser) {
            const selfKey = getUserItemKey(currentUser.id, RelationWithUserType.USER);
            const isSelfSelected = selectedUsers.some(su => getUserItemKey(su.id, su.user_type) === selfKey);
            if (!isSelfSelected) {
                suggestionsList.push({
                    id: String(currentUser.id),
                    name: "You",
                    avatarUrl: currentUser.avatar?.url || null,
                    user_type: RelationWithUserType.USER
                });
            }
        }
        allRelations.forEach(relUser => {
            const relKey = getUserItemKey(relUser.id, relUser.user_type);
            const isAlreadySelected = selectedUsers.some(su => getUserItemKey(su.id, su.user_type) === relKey);
            if (!isAlreadySelected) {
                suggestionsList.push(relUser);
            }
        });
        return suggestionsList;
    }, [allRelations, selectedUsers, currentUser]);

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
            getUserItemKey(u.id, u.user_type) === id ? { ...u, amount: computedAmount, isLocked: true } : u
        );

        const currentlyUnlocked = next.filter(u => !u.isLocked);

        if (currentlyUnlocked.length === 1) {
            next = next.map(u => ({ ...u, isLocked: true }));
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
                getUserItemKey(u.id, u.user_type) === id ? { ...u, amount: computedAmount, isLocked: false } : { ...u, isLocked: false }
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
            return { ...u, shares: Math.max(1, targetShare) };
        });

        handleSharesModeWorkflow(next, isTotalLockedRef.current);
    };

    const changeModeSetup = (mode: SplitMode) => {
        setSplitMode(mode);
        manualAmountsRef.current = {};

        const baselineUsers = selectedUsersRef.current.map(u => ({ ...u, isLocked: false }));

        if (mode === 'equal') {
            const chunk = totalExpense / Math.max(1, baselineUsers.length);
            dispatchStoreUpdate(baselineUsers.map(u => ({ ...u, amount: chunk })), totalExpense);
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
                next = next.map(u => ({ ...u, isLocked: false }));
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
                    next = [
                        { ...currentSelected[0], amount: totalExpense / 2, isLocked: false, shares: currentSelected[0].shares ?? 1 },
                        { ...userToAdd, amount: totalExpense / 2 }
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
            const next = currentSelected.map(u => ({ ...u, isLocked: !isCurrentlyLocked }));
            dispatchStoreUpdate(next, totalExpense);
            return;
        }

        let next = currentSelected.map(u => getUserItemKey(u.id, u.user_type) === id ? { ...u, isLocked: !u.isLocked } : u);
        const currentlyUnlocked = next.filter(u => !u.isLocked);

        if (currentlyUnlocked.length === 1 && currentSelected.find(u => getUserItemKey(u.id, u.user_type) === id)?.isLocked === false) {
            next = next.map(u => ({ ...u, isLocked: true }));
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
            const equalAmount = targetGlobalExpense / users.length;
            return users.map(u => ({ ...u, amount: equalAmount, isLocked: false }));
        }

        if (users.length === 1) {
            return [{ ...users[0], amount: targetGlobalExpense, isLocked: true, shares: users[0].shares ?? 1 }];
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
                const half = targetGlobalExpense / 2;
                return users.map(u => ({ ...u, amount: half, isLocked: false, shares: u.shares ?? 1 }));
            }
        }

        let processedUsers = [...users];
        const lockedUsers = processedUsers.filter(u => u.isLocked);
        const unlockedUsers = processedUsers.filter(u => !u.isLocked);
        const lockedTotal = lockedUsers.reduce((sum, u) => sum + u.amount, 0);

        const remainingToDistribute = Math.max(0, targetGlobalExpense - lockedTotal);
        if (unlockedUsers.length === 0) return processedUsers;

        const splitAmount = remainingToDistribute / unlockedUsers.length;
        return processedUsers.map(u => u.isLocked ? u : { ...u, amount: splitAmount });
    };

    const updateBalances = (nextUsers: UserItem[], mode = splitModeRef.current, targetGlobalExpense = totalExpense) => {
        if (!isTotalLockedRef.current && mode === 'amount') {
            dispatchStoreUpdate(nextUsers, targetGlobalExpense);
            return;
        }
        const balanced = balanceAmounts(nextUsers, mode, targetGlobalExpense);
        dispatchStoreUpdate(balanced, targetGlobalExpense);
    };

    return (
        <GestureHandlerRootView style={styles.container}>
            <SafeAreaView className="flex-1" style={{ backgroundColor: isDark ? "#121212" : "#F8F9FA" }}>
                <View className="flex-1">
                    <SuggestionsSection
                        loading={loading}
                        allUsers={filteredSuggestions}
                        selectedUsers={selectedUsers}
                        onToggleUser={handleToggleUser}
                        onAddNewUser={onAddNewUser}
                    />

                    <ModeTabBar
                        splitMode={splitMode}
                        isDark={isDark}
                        onChangeMode={changeModeSetup}
                    />

                    <View className="flex-1 px-4 mt-6">
                        <FlatList
                            data={selectedUsers}
                            keyExtractor={item => getUserItemKey(item.id, item.user_type)}
                            extraData={[splitMode, totalExpense, selectedUsers, isTotalLocked]}
                            renderItem={({ item }) => (
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

                    <View
                        className={`p-5 border-t-2 pb-8 ${
                            isDark ? 'bg-gray-900/90 border-gray-800/80' : 'bg-white/95 border-gray-100'
                        }`}
                    >
                        <View className={`flex-row justify-between items-center mb-5 px-4 py-3.5 rounded-2xl ${isDark ? 'bg-gray-800/40' : 'bg-gray-50/80'}`}>
                            <View className="space-y-0.5">
                                <View className="flex-row items-center gap-x-1.5">
                                    <AppText variant="body-small" className="opacity-50 uppercase tracking-wider font-semibold">Total Expense</AppText>

                                    <Pressable
                                        onPress={() => {
                                            setIsTotalLocked(!isTotalLocked);
                                        }}
                                        className="p-1 rounded-md active:bg-gray-500/10"
                                    >
                                        {isTotalLocked ? (
                                            <Iconify icon="heroicons:lock-closed" size={14} color="#F59E0B" />
                                        ) : (
                                            <Iconify icon="heroicons:lock-open" size={14} color="#10B981" />
                                        )}
                                    </Pressable>
                                </View>
                                <AppText variant="body-small" className="text-emerald-500 font-medium">Splitting with {selectedUsers.length} {selectedUsers.length === 1 ? 'person' : 'people'}</AppText>
                            </View>
                            <View className="items-end">
                                <AppText variant="h2" className="font-black tracking-tight text-emerald-600 dark:text-emerald-400">₹{totalExpense.toFixed(2)}</AppText>
                                {splitMode === 'equal' && selectedUsers.length > 0 && (
                                    <AppText variant="caption-xs" className="opacity-40 font-medium mt-0.5">₹{(totalExpense / selectedUsers.length).toFixed(2)} each</AppText>
                                )}
                            </View>
                        </View>

                        <Pressable
                            onPress={() => onSave?.(selectedUsers)}
                            style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.98 : 1 }] }]}
                            className="h-14 bg-emerald-600 dark:bg-emerald-500 rounded-2xl flex-row items-center justify-center active:opacity-95 shadow-md"
                        >
                            <AppText className="text-white font-bold text-lg tracking-wide mr-2">Confirm Selection</AppText>
                            <Iconify icon="heroicons:arrow-right-20-solid" size={20} color="white" />
                        </Pressable>
                    </View>
                </View>
            </SafeAreaView>

            <Modal visible={validationErrorModal.visible} animationType="fade" transparent>
                <View className="flex-1 items-center justify-center bg-black/60 px-6">
                    <View className={`w-full p-6 rounded-3xl ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
                        <View className="items-center mb-4">
                            <View className="p-3 bg-red-500/10 rounded-full mb-2">
                                <Iconify icon="heroicons:exclamation-triangle" size={32} color="#EF4444" />
                            </View>
                            <AppText variant="h3" className="font-bold text-center text-red-500">Invalid Split Allocation</AppText>
                        </View>

                        <AppText className="text-center opacity-70 mb-6 leading-relaxed">
                            {validationErrorModal.msg}
                        </AppText>

                        <Pressable
                            onPress={() => setValidationErrorModal({ visible: false, msg: '' })}
                            className="w-full h-12 bg-gray-200 dark:bg-gray-800 rounded-xl items-center justify-center active:opacity-80"
                        >
                            <AppText className="font-bold text-text-primary">Dismiss and Adjust</AppText>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 }
});

export default MultiUserSplitSelect;