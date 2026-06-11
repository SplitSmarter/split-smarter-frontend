import React from 'react';
import { Modal, View, Pressable, Dimensions, Platform, KeyboardAvoidingView } from 'react-native';
import { themeStore } from '@/src/store/themeStore';
import { PaidByContent } from './PaidByContent';
import { Iconify } from 'react-native-iconify';
import { AppText } from '@/src/components/common/AppText';
import { AppButton } from '@/src/components/common/AppButton';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const SelectPaidByModal = ({ visible, setPayers, onClose, payers, totalExpense, onQuickAdd }: any) => {
    const isDark = themeStore((state) => state.theme === 'dark');

    const balanceAmounts = (currentPayers: any[]) => {
        const lockedPayers = currentPayers.filter(p => p.isLocked);
        const unlockedPayers = currentPayers.filter(p => !p.isLocked);

        const lockedTotal = lockedPayers.reduce((sum, p) => sum + p.amount, 0);
        const remainingToDistribute = Math.max(0, totalExpense - lockedTotal);

        if (unlockedPayers.length === 0) return currentPayers;

        const splitAmount = remainingToDistribute / unlockedPayers.length;

        return currentPayers.map(p => {
            if (p.isLocked) return p;
            return { ...p, amount: splitAmount };
        });
    };

    const onToggleLock = (id: number | string) => {
        setPayers((prev: any[]) => {
            // Rule 1: If only 1 person, they must stay locked/uneditable
            if (prev.length <= 1) return prev;

            // Apply the toggle
            let next = prev.map(p => p.id === id ? { ...p, isLocked: !p.isLocked } : p);

            const currentlyUnlocked = next.filter(p => !p.isLocked);
            const unlockedCount = currentlyUnlocked.length;

            // Rule 2: If the user just locked someone and only 1 person remains unlocked,
            // we lock everyone (since 1 person cannot balance against themselves).
            if (unlockedCount === 1 && prev.find(p => p.id === id)?.isLocked === false) {
                next = next.map(p => ({ ...p, isLocked: true }));
            }

                // Rule 3: If all were locked and the user just UNLOCKED one person,
            // we must unlock a second person to allow for balancing.
            else if (unlockedCount === 1 && prev.every(p => p.isLocked)) {
                // Find the first person who ISN'T the one we just unlocked
                const partnerIndex = next.findIndex(p => p.id !== id);
                if (partnerIndex !== -1) {
                    next[partnerIndex].isLocked = false;
                }
            }

            return balanceAmounts(next);
        });
    };

    const onUpdateAmount = (id: number | string, newAmount: number) => {
        setPayers((prev: any[]) => {
            // Rule: Cannot change amount if only one person exists
            if (prev.length <= 1) return prev;

            const next = prev.map(p => {
                if (p.id === id) {
                    // When user manually edits, we treat them as "temporarily locked" for calculation
                    return { ...p, amount: newAmount, isLocked: true };
                }
                return p;
            });

            // Distribute remaining to others, then revert the specific lock if it was just an edit
            const balanced = balanceAmounts(next);
            return balanced.map(p => p.id === id ? { ...p, isLocked: prev.find(old => old.id === id).isLocked } : p);
        });
    };

    const onDelete = (id: number | string) => {
        setPayers((prev: any[]) => {
            // Rule: Do not allow delete if only one person
            if (prev.length <= 1) return prev;
            const next = prev.filter(p => p.id !== id);
            return balanceAmounts(next);
        });
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <GestureHandlerRootView style={{ flex: 1 }}>
                {/* Backdrop */}
                <View className="flex-1 bg-black/60 justify-end">
                    <Pressable className="absolute inset-0" onPress={onClose} />

                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        className="w-full"
                    >
                        {/* 1. FIX: Use a fixed 'height' for the container to ensure
                               it stays large. The ScrollView inside will handle the overflow.
                        */}
                        <View
                            style={{ height: SCREEN_HEIGHT * 0.85 }}
                            className="w-full rounded-t-[40px] bg-bg-primary shadow-2xl overflow-hidden"
                        >
                            {/* Drag Handle */}
                            <View className="items-center pt-4">
                                <View className="w-12 h-1.5 bg-bg-secondary-darker/30 rounded-full" />
                            </View>

                            {/* Header */}
                            <View className="px-6 py-4 flex-row items-center border-b border-dashed border-bg-secondary-lighter/40">
                                <Pressable onPress={onClose} className="p-1">
                                    <Iconify icon="heroicons:chevron-left" size={24} color="rgb(var(--color-text-primary))" />
                                </Pressable>
                                <AppText variant="h3" className="flex-1 text-center font-bold text-text-primary mr-8">
                                    People who paid
                                </AppText>
                            </View>

                            {/* 2. FIX: This wrapper must be flex-1 to push the footer
                                   to the bottom and let the PaidByContent fill the middle.
                            */}
                            <View className="flex-1">
                                <PaidByContent
                                    payers={payers}
                                    totalExpense={totalExpense}
                                    onToggleLock={onToggleLock}
                                    onDelete={onDelete}
                                    onQuickAdd={onQuickAdd}
                                    onUpdateAmount={onUpdateAmount}
                                />
                            </View>

                            {/* Footer - Pinned to bottom */}
                            <View className="p-6 bg-bg-primary-lighter border-t border-bg-secondary-lighter/10">
                                <AppButton variant="primary" size="lg" onPress={onClose}>
                                    Confirm Selection
                                </AppButton>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </GestureHandlerRootView>
        </Modal>
    );
};