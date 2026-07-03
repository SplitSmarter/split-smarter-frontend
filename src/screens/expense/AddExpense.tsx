import {AppButton} from '@/src/components/common/AppButton';
import {AppImageV2} from '@/src/components/common/AppImageV2';
import {AppInput} from '@/src/components/common/AppInput';
import {AppText} from '@/src/components/common/AppText';
import {ExpenseAttachments} from "@/src/components/expense/ExpenseAttachments";
import MultiExpenseItemSelect from "@/src/components/expense/MultiExpenseItemSelect";
import {CategoryGroupLocationSelector} from "@/src/screens/expense/CGLSelector";
import {themeStore} from "@/src/store/themeStore";
import {userStore} from "@/src/store/userStore";
import {useExpenseDraftStore} from "@/src/store/draft/expenseDraftStore";
import {RelationWithUserType} from "@/src/api/dto/constants";
import {router} from 'expo-router';
import React, {useMemo, useState, useEffect, useRef} from 'react';
import {Modal, Pressable, ScrollView, View} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {AppButtonV2} from "@/src/components/common/AppButtonV2";
import {COLORS} from "@/src/constants/colors";

const AddExpenseScreen = () => {
    const {user} = userStore();
    const {theme} = themeStore();
    const isDark = theme === 'dark';

    const [isItemSelectVisible, setIsItemSelectVisible] = useState(false);
    const isInitialMount = useRef(true);

    // Bind local UI rendering hooks completely to Zustand Context
    const draft = useExpenseDraftStore();

    // Format local text field display string wrappers safely
    const amountString = useMemo(() => {
        return draft.totalAmount === 0 ? "" : draft.totalAmount.toString();
    }, [draft.totalAmount]);

    // Track initialization parameters and bootstrap "You" configurations
    useEffect(() => {
        if (user && draft.payers.length === 0 && draft.splitParticipants.length === 0) {
            const initialUserObject = {
                id: String(user.id),
                name: "You",
                avatar: user.avatar ? {
                    id: String(user.avatar.id),
                    name: '',
                    url: user.avatar.url,
                    extension: ''
                } : null,
                amount: draft.totalAmount,
                shares: 1,
                isLocked: false,
                user_type: RelationWithUserType.USER
            };
            draft.setPayers([initialUserObject]);
            draft.setSplitParticipants([initialUserObject]);
        }
    }, [user]);

    // Handle background allocation mathematical scaling transformations dynamically
    useEffect(() => {
        // Safe check: If this is the initial layout pass, don't overwrite pre-populated store entries
        if (isInitialMount.current) {
            isInitialMount.current = false;

            // If the store already contains amounts distributed, do not reset them
            const totalPayerSum = draft.payers.reduce((sum, p) => sum + (p.amount || 0), 0);
            if (totalPayerSum > 0 || draft.totalAmount > 0) {
                return;
            }
        }

        const scaleDistribution = (prevList: any[]) => {
            if (prevList.length === 0) return prevList;

            // Look for locked amounts to subtract from the divisible total pool
            const lockedSum = prevList.reduce((sum, u) => sum + (u.isLocked ? (u.amount || 0) : 0), 0);
            const remainingPool = Math.max(0, draft.totalAmount - lockedSum);

            const unlockedParticipants = prevList.filter(u => !u.isLocked);
            const totalShares = unlockedParticipants.reduce((sum, u) => sum + (u.shares ?? 1), 0);

            return prevList.map(p => {
                if (p.isLocked) return p; // Preserve row if explicit lock is marked
                return {
                    ...p,
                    amount: totalShares > 0 ? (remainingPool * (p.shares ?? 1)) / totalShares : 0
                };
            });
        };

        // Batch set entries safely
        const updatedPayers = scaleDistribution(draft.payers);
        const updatedParticipants = scaleDistribution(draft.splitParticipants);

        draft.setPayers(updatedPayers);
        draft.setSplitParticipants(updatedParticipants);
    }, [draft.totalAmount]);

    const handleAmountChange = (text: string) => {
        const parsed = parseFloat(text);
        draft.setTotalAmount(isNaN(parsed) || parsed < 0 ? 0 : parsed);
    };

    const handleOpenPaidBy = () => {
        router.push({
            pathname: '/(authenticated)/expense/user/split',
            params: {type: 'paidBy', totalExpense: draft.totalAmount.toString()}
        });
    };

    const handleOpenSplitSelect = () => {
        router.push({
            pathname: '/(authenticated)/expense/user/split',
            params: {type: 'split', totalExpense: draft.totalAmount.toString()}
        });
    };

    // Humanize UI feedback label components based on exact arrays state metrics
    const payerText = useMemo(() => {
        if (draft.payers.length === 0) return "No one paid";
        const hasMe = draft.payers.some(p => String(p.id) === String(user?.id));
        if (draft.payers.length === 1) return hasMe ? "Paid by You" : `Paid by ${draft.payers[0].name}`;
        return hasMe ? `Paid by You and ${draft.payers.length - 1} Others` : `Paid by ${draft.payers[0].name} and ${draft.payers.length - 1} Others`;
    }, [draft.payers, user]);

    const splitTextSummary = useMemo(() => {
        if (draft.splitParticipants.length === 0) return "Split with no one";
        const hasMe = draft.splitParticipants.some(p => String(p.id) === String(user?.id));
        if (draft.splitParticipants.length === 1) return hasMe ? "Split completely with Yourself" : `Split with ${draft.splitParticipants[0].name}`;
        return hasMe ? `Split between You and ${draft.splitParticipants.length - 1} others` : `Split between ${draft.splitParticipants[0].name} and ${draft.splitParticipants.length - 1} others`;
    }, [draft.splitParticipants, user]);

    return (
        <>
            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{paddingBottom: 60}}
            >
                <View className="gap-y-6">
                    {/* 1. Name Input */}
                    <AppInput
                        label="Name"
                        value={draft.title}
                        onChangeText={draft.setTitle}
                        placeholder="Enter Name"
                        placeholderTextColor="rgb(var(--color-text-primary-placeholder))"
                    />

                    {/* 2. Amount Input */}
                    <AppInput
                        label="Amount"
                        value={amountString}
                        onChangeText={handleAmountChange}
                        placeholder="0.00"
                        placeholderTextColor="rgb(var(--color-text-primary-placeholder))"
                        renderLeftIcon={() => (
                            <AppText className="text-bg-secondary mr-2 text-heading-h3 font-bold">₹</AppText>
                        )}
                        keyboardType="numeric"
                        renderRightIcon={() => (
                            <Pressable onPress={() => draft.setTotalAmount(0)}>
                                <AppText variant="body-small" className="text-bg-secondary font-medium">Clear</AppText>
                            </Pressable>
                        )}
                    />

                    <CategoryGroupLocationSelector/>

                    {/* 4. Paid By Selection Box */}
                    <AppButtonV2
                        variant="secondary"
                        size="none"
                        /* changed to rounded-full for that perfect capsule shape */
                        className="w-full flex-row justify-between items-center px-6 py-4 rounded-full border border-border-input bg-bg-primary-lighter"
                        onPress={handleOpenPaidBy}
                        hasShadow={false}
                    >
                        <View className="flex-1 items-start space-y-0.5">
                            <AppText variant="caption-xs"
                                     className="text-text-primary-lighter font-semibold uppercase tracking-wider">
                                Paid By
                            </AppText>
                            <AppText variant="body-base" className="text-text-primary font-medium">
                                {payerText}
                            </AppText>
                        </View>

                        <Iconify
                            icon="heroicons:chevron-right"
                            size={20}
                            color={isDark ? COLORS.dark.icon.primary : COLORS.light.icon.primary}
                        />
                    </AppButtonV2>

                    {/* 5. Split Between List Component Box */}
                    <Pressable
                        className="bg-bg-primary-lighter rounded-2xl p-4 shadow-sm border border-border-input"
                        onPress={handleOpenSplitSelect}
                    >
                        <View className="flex-row justify-between items-center mb-4">
                            <AppText variant="h4" className="font-bold text-text-primary">Split Between</AppText>
                            <Iconify icon="heroicons:pencil-square" size={20}
                                     color={isDark ? COLORS.dark.icon.primary : COLORS.light.icon.primary}/>
                        </View>

                        {draft.splitParticipants.length > 0 ? (
                            draft.splitParticipants.map((participant, index) => (
                                <View
                                    key={`split-${participant.id}-${participant.user_type}`}
                                    className={`flex-row items-center justify-between py-3 ${index !== draft.splitParticipants.length - 1 ? 'border-b border-border-input' : ''}`}
                                >
                                    <View className="flex-row items-center flex-1">
                                        {participant.avatar?.url ? (
                                            <AppImageV2 id={`avatar-${participant.name}`} url={participant.avatar.url}
                                                        style={{width: 24, height: 24}} className="rounded-full"/>
                                        ) : (
                                            <View style={{width: 24, height: 24}}
                                                  className="bg-gray-200 dark:bg-zinc-800 rounded-full items-center justify-center">
                                                <Iconify icon="heroicons:user-solid" size={12} color="#999"/>
                                            </View>
                                        )}
                                        <AppText
                                            className="ml-3 flex-1 text-text-primary font-medium">{participant.name}</AppText>
                                    </View>
                                    <AppText
                                        className="font-bold text-text-primary">₹{(participant.amount || 0).toFixed(2)}</AppText>
                                </View>
                            ))
                        ) : (
                            <AppText variant="caption-xs" className="text-text-primary opacity-60 font-medium">Split with no one</AppText>
                        )}
                    </Pressable>

                    {/* 6. Items Section */}
                    <Pressable
                        className="bg-bg-primary-lighter rounded-2xl p-4 shadow-sm border border-border-input"
                        onPress={() => setIsItemSelectVisible(true)}
                    >
                        <View className="flex-row justify-between items-center mb-4">
                            <AppText variant="h4" className="font-bold text-text-primary">Items</AppText>
                            <Iconify icon="heroicons:pencil-square" size={20}
                                     color={isDark ? COLORS.dark.icon.primary : COLORS.light.icon.primary}/>
                        </View>
                        {draft.expenseItems.length > 0 ? (
                            draft.expenseItems.map((item, index) => (
                                <View key={item.id}
                                      className={`flex-row items-center justify-between py-3 ${index !== draft.expenseItems.length - 1 ? 'border-b border-bg-secondary-lighter' : ''}`}>
                                    <View className="flex-row items-center flex-1">
                                        {item.iconUrl ? (
                                            <AppImageV2 id={`selected-item-${item.id}`} url={item.iconUrl}
                                                        style={{width: 24, height: 24}} contentFit="contain"/>
                                        ) : (
                                            <View style={{width: 24, height: 24}}
                                                  className="bg-gray-200 rounded-full items-center justify-center">
                                                <Iconify icon="heroicons:shopping-cart" size={12} color="#999"/>
                                            </View>
                                        )}
                                        <View className="ml-3 flex-1">
                                            <AppText className="text-text-primary font-medium">{item.title}</AppText>
                                            <AppText variant="body-small"
                                                     className="text-text-secondary">Qty: {item.quantity}</AppText>
                                        </View>
                                    </View>
                                    <AppText
                                        className="font-bold text-text-primary">₹{(item.cost * item.quantity).toFixed(2)}</AppText>
                                </View>
                            ))
                        ) : (
                            <AppText variant="caption-xs"
                                     className="text-text-primary opacity-60 font-medium">No items selected</AppText>
                        )}
                    </Pressable>

                    <ExpenseAttachments onAttachmentsChange={(uris) => {
                        draft.setLocalAttachmentUris(uris)
                    }}/>
                </View>
            </ScrollView>

            {/* MultiExpenseItemSelect Modal */}
            <Modal visible={isItemSelectVisible} animationType="slide" transparent
                   onRequestClose={() => setIsItemSelectVisible(false)}>
                <View className="flex-1 justify-end bg-black/50">
                    <Pressable className="absolute inset-0" onPress={() => setIsItemSelectVisible(false)}/>
                    <View style={{height: '90%', zIndex: 1}}
                          className={`rounded-t-[32px] overflow-hidden ${isDark ? 'bg-[#121212]' : 'bg-[#F8F9FA]'}`}>
                        <View className="items-center pt-3 pb-1">
                            <View className={`w-12 h-1.5 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}/>
                        </View>
                        <View className="flex-1">
                            <MultiExpenseItemSelect
                                onSave={(items) => {
                                    draft.setExpenseItems(items);
                                    setIsItemSelectVisible(false);
                                }}
                                onAddNew={() => console.log('Add new item')}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
};

interface UserRowProps {
    name: string;
    avatarUrl: string | null;
    amount: string;
    isLast?: boolean;
}

const UserRow = ({name, avatarUrl, amount, isLast}: UserRowProps) => (
    <View
        className={`flex-row items-center justify-between py-3 ${!isLast ? 'border-b border-bg-secondary-lighter' : ''}`}>
        <View className="flex-row items-center">
            {avatarUrl ? (
                <AppImageV2 id={`avatar-${name}`} url={avatarUrl} style={{width: 32, height: 32}}
                            className="rounded-full"/>
            ) : (
                <View style={{width: 32, height: 32}}
                      className="bg-gray-200 dark:bg-gray-700 rounded-full items-center justify-center">
                    <Iconify icon="heroicons:user-solid" size={16} color="#999"/>
                </View>
            )}
            <AppText className="ml-3 text-text-primary font-medium">{name}</AppText>
        </View>
        <AppText className="font-bold text-text-primary">{amount}</AppText>
    </View>
);

export default AddExpenseScreen;