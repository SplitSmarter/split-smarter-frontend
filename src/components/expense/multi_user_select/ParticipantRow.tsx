import React, { useEffect, useState, memo } from 'react';
import {
    Pressable,
    TextInput,
    View,
    StyleSheet
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Iconify } from "react-native-iconify";
import { AppImageV2 } from "@/src/components/common/AppImageV2";
import { AppText } from '@/src/components/common/AppText';
import { useAlert } from "@/src/context/alertContext";
import { SplitMode, UserItem, ToggleUserPayload } from "@/src/components/expense/MultiUserSelect";
import { RelationWithUserType } from "@/src/api/dto/constants";

interface ParticipantRowProps {
    item: UserItem;
    splitMode: SplitMode;
    totalExpense: number;
    isDark: boolean;
    disableSwipe: boolean;
    isTotalLocked: boolean;
    onToggleUser: (user: ToggleUserPayload) => void;
    onToggleLock: (compositeId: string) => void;
    onAdjustShares: (compositeId: string, action: 'increment' | 'decrement') => void;
    onUpdateAmount: (compositeId: string, calculatedAmount: number) => boolean;
}

const getUserItemKey = (id: string | number, type: RelationWithUserType): string => {
    return `${String(id)}-${type}`;
};

const ParticipantRow = memo(({
                                 item,
                                 splitMode,
                                 totalExpense,
                                 isDark,
                                 disableSwipe,
                                 isTotalLocked,
                                 onToggleUser,
                                 onToggleLock,
                                 onAdjustShares,
                                 onUpdateAmount
                             }: ParticipantRowProps) => {
    const { showAlert } = useAlert();
    const [localAmount, setLocalAmount] = useState('');
    const [localPercent, setLocalPercent] = useState('');

    const compositeKey = getUserItemKey(item.id, item.user_type);
    const isFieldLocked = item.isLocked && splitMode !== 'shares' && splitMode !== 'equal';

    // Sync input values cleanly on layout changes
    useEffect(() => {
        if (!localAmount || parseFloat(localAmount) !== item.amount) {
            setLocalAmount(item.amount > 0 ? item.amount.toFixed(2) : '');
        }
        const calculatedPercentage = totalExpense > 0 ? (item.amount / totalExpense) * 100 : 0;
        setLocalPercent(calculatedPercentage > 0 ? calculatedPercentage.toFixed(1) : '');
    }, [item.amount, totalExpense]);

    const submitFinalAmount = () => {
        const parsed = parseFloat(localAmount || '0');
        if (isNaN(parsed) || parsed < 0) {
            showAlert("Please enter a valid amount greater than or equal to 0.", 'error');
            setLocalAmount(item.amount > 0 ? item.amount.toFixed(2) : '');
            return;
        }

        // Capture success status from parent workflow
        const isSuccess = onUpdateAmount(compositeKey, parsed);

        if (!isSuccess) {
            // Validation failed, snap back local string to previous store amount
            setLocalAmount(item.amount > 0 ? item.amount.toFixed(2) : '');
        }
    };

    const submitFinalPercentage = () => {
        const parsedPct = parseFloat(localPercent || '0');
        if (isNaN(parsedPct) || parsedPct < 0) {
            showAlert("Please enter a valid percentage value.", 'error');
            const pct = totalExpense > 0 ? (item.amount / totalExpense) * 100 : 0;
            setLocalPercent(pct > 0 ? pct.toFixed(1) : '');
            return;
        }

        const calculatedRupeeValue = (parsedPct / 100) * totalExpense;

        // Capture success status from parent workflow
        const isSuccess = onUpdateAmount(compositeKey, calculatedRupeeValue);

        if (!isSuccess) {
            // Validation failed, snap back local string to previous store percentage
            const currentPct = totalExpense > 0 ? (item.amount / totalExpense) * 100 : 0;
            setLocalPercent(currentPct > 0 ? currentPct.toFixed(1) : '');
        }
    };

    const renderRightSwipeAction = () => (
        <Pressable
            onPress={() => onToggleUser({
                id: item.id,
                user_type: item.user_type,
                name: item.name,
                avatarUrl: item.avatarUrl
            })}
            className="bg-red-500 w-20 justify-center items-center rounded-r-2xl mb-2"
        >
            <Iconify icon="heroicons:trash" size={24} color="white" />
        </Pressable>
    );

    const renderLeftSwipeAction = () => {
        if (splitMode === 'shares' || splitMode === 'equal') return null;
        return (
            <Pressable
                onPress={() => onToggleLock(compositeKey)}
                className="bg-amber-500 w-20 justify-center items-center rounded-l-2xl mb-2"
            >
                {item.isLocked ? (
                    <Iconify icon="heroicons:lock-open-solid" size={30}
                             color={item.isLocked ? "rgb(var(--color-golden))" : "rgb(var(--color-text-secondary))"}/>
                ) : (
                    <Iconify icon="heroicons:lock-closed-solid" size={30}
                             color={item.isLocked ? "rgb(var(--color-golden))" : "rgb(var(--color-text-secondary))"}/>
                )}
            </Pressable>
        );
    };

    return (
        <Swipeable
            enabled={!disableSwipe}
            renderRightActions={renderRightSwipeAction}
            renderLeftActions={renderLeftSwipeAction}
            containerStyle={styles.swipeableContainer}
        >
            <View className={`flex-row items-center p-4 rounded-2xl mb-2 ${isDark ? 'bg-gray-900' : 'bg-white shadow-sm'}`}>
                <View className="relative">
                    <AppImageV2 id={item.id} url={item.avatarUrl} style={{ width: 44, height: 44 }} className="rounded-full" />
                    {isFieldLocked && (
                        <View className="absolute -top-1 -right-1 bg-amber-500 p-0.5 rounded-full border border-white dark:border-gray-900">
                            <Iconify icon="heroicons:lock-closed-solid" size={10} color="white" />
                        </View>
                    )}
                </View>

                <View className="flex-1 ml-3 justify-center">
                    <AppText className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {item.name}
                    </AppText>
                </View>

                {/* Split Action Input Slots */}
                {splitMode === 'equal' && (
                    <View className="items-end">
                        <AppText className="font-bold text-emerald-600 dark:text-emerald-400">
                            ₹{item.amount.toFixed(2)}
                        </AppText>
                    </View>
                )}

                {splitMode === 'amount' && (
                    <View
                        className={`flex-row items-center border rounded-xl px-2 h-10 ${
                            isDark ? 'border-gray-800 bg-gray-950' : 'border-gray-200 bg-gray-50'
                        }`}
                        style={isFieldLocked ? styles.disabledOpacity : null}
                    >
                        <AppText className="opacity-40 mr-1 font-medium">₹</AppText>
                        <TextInput
                            value={localAmount}
                            onChangeText={setLocalAmount}
                            onBlur={submitFinalAmount}
                            keyboardType="numeric"
                            returnKeyType="done"
                            editable={!isFieldLocked} // Blocks typing entirely
                            style={[styles.input, { color: isDark ? '#fff' : '#000' }]}
                        />
                    </View>
                )}

                {splitMode === 'percentage' && (
                    <View
                        className={`flex-row items-center border rounded-xl px-2 h-10 ${
                            isDark ? 'border-gray-800 bg-gray-950' : 'border-gray-200 bg-gray-50'
                        }`}
                        style={isFieldLocked ? styles.disabledOpacity : null}
                    >
                        <TextInput
                            value={localPercent}
                            onChangeText={setLocalPercent}
                            onBlur={submitFinalPercentage}
                            keyboardType="numeric"
                            returnKeyType="done"
                            editable={!isFieldLocked} // Blocks typing entirely
                            style={[styles.input, { color: isDark ? '#fff' : '#000', textAlign: 'right' }]}
                        />
                        <AppText className="opacity-40 ml-1 font-medium">%</AppText>
                    </View>
                )}

                {splitMode === 'shares' && (
                    <View className="flex-row items-center gap-x-2">
                        <Pressable
                            onPress={() => onAdjustShares(compositeKey, 'decrement')}
                            className={`p-2 rounded-lg active:scale-95 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
                        >
                            <Iconify icon="heroicons:minus-solid" size={14} color={isDark ? '#FFF' : '#333'} />
                        </Pressable>
                        <AppText className="font-bold min-w-[20px] text-center">
                            {item.shares ?? 1}
                        </AppText>
                        <Pressable
                            onPress={() => onAdjustShares(compositeKey, 'increment')}
                            className={`p-2 rounded-lg active:scale-95 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
                        >
                            <Iconify icon="heroicons:plus-solid" size={14} color={isDark ? '#FFF' : '#333'} />
                        </Pressable>
                    </View>
                )}
            </View>
        </Swipeable>
    );
});

const styles = StyleSheet.create({
    swipeableContainer: { overflow: 'visible' },
    input: { width: 70, height: '100%', padding: 0, fontWeight: 'bold' },
    disabledOpacity: { opacity: 0.45 }
});

export default ParticipantRow;