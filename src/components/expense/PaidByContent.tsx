import React, { useEffect, useState } from 'react';
import { View, Pressable, ScrollView, ActivityIndicator, TextInput } from 'react-native';
import { Iconify } from 'react-native-iconify';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { AppText } from '@/src/components/common/AppText';
import { AppImage } from '@/src/components/common/AppImage';
import { GetRelationsApi } from "@/src/api/relations/relation";
import { RelationDetails } from "@/src/api/dto/user/relation";

const HORIZ_PADDING = 24;

export const PaidByContent = ({ payers, totalExpense, onQuickAdd, onToggleLock, onDelete, onUpdateAmount }: any) => {
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const res = await GetRelationsApi({ limit: 20 });
                if (res?.data) {
                    const mappedUsers = res.data.map((rel: RelationDetails) => ({
                        id: rel.with_user.id,
                        name: rel.with_user.name,
                        avatar: rel.with_user.avatar,
                    }));
                    setSuggestions(mappedUsers);
                }
            } catch (error) {
                console.error("Failed to fetch relations:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSuggestions();
    }, []);

    return (
        <ScrollView
            className="bg-bg-primary"
            showsVerticalScrollIndicator={false}
            // IMPORTANT: This allows the ScrollView to move out of the way
            automaticallyAdjustKeyboardInsets={true}
            // Ensures clicking 'Confirm' works while keyboard is up
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingBottom: 100 }} // Keep space for the absolute footer
        >
            {/* Suggestions Section */}
            <View style={{ paddingHorizontal: HORIZ_PADDING }} className="mt-6">
                <AppText variant="h3" className="text-text-primary font-bold mb-5">Suggestions</AppText>
                <View className="flex-row flex-wrap justify-between items-start mb-10">
                    {loading ? (
                        <View className="w-full items-center py-4">
                            <ActivityIndicator color="rgb(var(--color-bg-secondary))" />
                        </View>
                    ) : (
                        <>
                            {suggestions.slice(0, 3).map((user) => (
                                <Pressable
                                    key={user.id}
                                    onPress={() => onQuickAdd(user)}
                                    className="items-center"
                                    style={{ width: '22%' }}
                                >
                                    <AppImage url={user.avatar?.url || 'https://i.pravatar.cc/150'} size="lg" variant="circular" />
                                    <AppText variant="body-base" className="mt-2 text-text-primary text-center" numberOfLines={1}>
                                        {user.name.split(' ')[0]}
                                    </AppText>
                                </Pressable>
                            ))}
                            <Pressable className="items-center" style={{ width: '22%' }}>
                                <View className="bg-bg-primary-lighter h-[56px] w-[56px] rounded-full items-center justify-center border border-bg-secondary-lighter shadow-sm">
                                    <Iconify icon="ph:user-plus" size={24} color="rgb(var(--color-text-primary))" />
                                </View>
                                <AppText variant="body-base" className="mt-2 text-text-primary font-medium">More</AppText>
                            </Pressable>
                        </>
                    )}
                </View>
            </View>

            {/* Participants Table Container */}
            <View
                style={{ marginHorizontal: HORIZ_PADDING }}
                className="bg-bg-primary-lighter rounded-[24px] shadow-xl border border-bg-secondary-lighter p-4 overflow-hidden"
            >
                {/* Header Row */}
                <View className="flex-row justify-between items-center px-2 mb-4">
                    <AppText variant="body-xs" className="font-bold text-text-primary opacity-60 tracking-[3px]">PERSON</AppText>
                    <View className="flex-row items-center">
                        <AppText variant="body-xs" className="font-bold text-text-primary opacity-60 tracking-[3px]">AMOUNT</AppText>
                        <Iconify icon="tabler:chevron-down" size={14} color="rgb(var(--color-text-primary))" className="ml-1" />
                    </View>
                </View>

                {/* Main List */}
                <View className="flex-col">
                    {payers.map((payer: any, index: number) => (
                        <SwipeableRow
                            key={payer.id}
                            payer={payer}
                            totalExpense={totalExpense}
                            isLast={index === payers.length - 1}
                            onToggleLock={onToggleLock}
                            onDelete={onDelete}
                            onUpdateAmount={onUpdateAmount}
                            totalPayersCount={payers.length}
                        />
                    ))}
                </View>

                {/* Total Summary Row */}
                <View className="flex-row justify-end items-center mt-6 pt-6 border-t border-bg-secondary-lighter">
                    <AppText variant="h3" className="text-text-primary font-medium mr-5 opacity-70">Total</AppText>
                    <AppText variant="h3" className="text-text-primary font-bold">₹{totalExpense.toFixed(2)}</AppText>
                </View>
            </View>
        </ScrollView>
    );
};

const SwipeableRow = ({ payer, totalExpense, onToggleLock, onDelete, onUpdateAmount, isLast, totalPayersCount }: any) => {
    const percentage = totalExpense > 0 ? (payer.amount / totalExpense) * 100 : 0;

    // Initial display logic
    const getFormattedValue = (val: number) =>
        val % 1 === 0 ? val.toString() : val.toFixed(2).replace(/\.?0+$/, "");

    const [inputValue, setInputValue] = useState(getFormattedValue(payer.amount));

    const isEditable = !payer.isLocked && totalPayersCount > 1;

    useEffect(() => {
        // Only update if the numerical value actually changed to prevent cursor jumping
        if (parseFloat(inputValue) !== payer.amount) {
            setInputValue(getFormattedValue(payer.amount));
        }
    }, [payer.amount]);

    const handleAmountChange = (text: string) => {
        if (!isEditable) return;
        const cleaned = text.replace(/[^0-9.]/g, '');

        // Prevent multiple dots
        if ((cleaned.match(/\./g) || []).length > 1) return;

        setInputValue(cleaned);
        const numericValue = parseFloat(cleaned);
        onUpdateAmount(payer.id, isNaN(numericValue) ? 0 : numericValue);
    };

    const renderLeftActions = () => {
        // Rule: Don't show lock action if only one user
        if (totalPayersCount <= 1) return null;
        return (
            <Pressable onPress={() => onToggleLock(payer.id)} className="bg-golden w-20 justify-center items-center">
                {payer.isLocked ? (
                    <Iconify icon="heroicons:lock-open-solid" size={30} color={payer.isLocked ? "rgb(var(--color-golden))" : "rgb(var(--color-text-secondary))"}/>
                ) : (
                    <Iconify icon="heroicons:lock-closed-solid" size={30} color={payer.isLocked ? "rgb(var(--color-golden))" : "rgb(var(--color-text-secondary))"}/>
                )}
            </Pressable>
        );
    };

    const renderRightActions = () => {
        // Rule: Don't show delete action if only one user
        if (totalPayersCount <= 1) return null;
        return (
            <Pressable onPress={() => onDelete(payer.id)} className="bg-red-decrease w-20 justify-center items-center">
                <Iconify icon="material-symbols:delete-rounded" size={28} color="white" />
            </Pressable>
        );
    };

    return (
        <Swipeable
            renderLeftActions={renderLeftActions}
            renderRightActions={renderRightActions}
            enabled={totalPayersCount > 1} // Disable swipe if only one user
        >
            <View className={`flex-row items-center py-4 px-2 ${!isLast ? 'border-b border-bg-secondary-lighter' : ''} bg-bg-primary-lighter ${!isEditable ? 'opacity-80' : ''}`}>

                {/* Avatar */}
                <View className="relative">
                    <AppImage url={payer.avatar?.url || payer.avatar_url} size="md" variant="circular" />
                    {(payer.isLocked || totalPayersCount === 1) && (
                        <View className="absolute -top-1 -right-1 bg-bg-primary-lighter rounded-full p-0.5 shadow-sm">
                            <Iconify icon="material-symbols:lock" size={12} color="rgb(var(--color-golden))" />
                        </View>
                    )}
                </View>

                {/* Info */}
                <View className="flex-1 ml-4">
                    <View className="flex-row items-center">
                        <AppText variant="body-large" className="font-semibold text-text-primary">{payer.name}</AppText>
                    </View>
                    <AppText variant="caption-xs" className="text-text-primary opacity-50 font-bold uppercase tracking-wider">
                        {percentage.toFixed(1)}%
                    </AppText>
                </View>

                {/* Amount Input */}
                <View className={`flex-row items-center justify-end min-w-[100px] px-2 py-1 rounded-lg ${isEditable ? 'bg-bg-primary/50' : ''}`}>
                    <AppText className="text-text-primary font-bold mr-1">₹</AppText>
                    <TextInput
                        value={inputValue}
                        onChangeText={handleAmountChange}
                        onBlur={() => setInputValue(getFormattedValue(payer.amount))}
                        keyboardType="decimal-pad" // Better for decimal support
                        editable={isEditable}
                        className={`font-bold text-text-primary text-[16px] text-right min-w-[70px] ${!isEditable ? 'text-text-primary/60' : ''}`}
                        style={{ paddingVertical: 0 }}
                    />
                </View>
            </View>
        </Swipeable>
    );
};