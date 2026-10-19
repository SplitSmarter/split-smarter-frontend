import React, {useEffect, useState} from 'react';
import {View, Pressable, ActivityIndicator, Keyboard, Platform} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {AppButton} from '@/src/components/common/AppButton';
import {ApplicableBudgetItem} from '@/src/api/dto/expense/budget';
import {MemoryResponse} from '@/src/api/dto/user/memory';
import {COLORS} from '@/src/constants/colors';
import {CurrencyCode} from '@/src/constants/expense/currency';
import {TransactionTabType} from '../constants/addTransaction.constants';
import {ExpenseContextHintsRow} from '@/src/screens/expense/add-transaction/components/ExpenseContextHintsRow';

interface TransactionFooterProps {
    activeTab: TransactionTabType;
    isDark: boolean;
    isValidating: boolean;
    isAddingMissingMembers?: boolean;
    submitDisabled?: boolean;
    activeValidationContent: any;
    pendingGroupMemberCount?: number;
    contextMemories?: MemoryResponse[];
    contextBudgets?: ApplicableBudgetItem[];
    contextHintsLoading?: boolean;
    currencyCode?: CurrencyCode | string | null;
    onOpenPicker: () => void;
    onOpenValidationModal: () => void;
    onSubmit: () => void;
}

export const TransactionFooter: React.FC<TransactionFooterProps> = ({
    activeTab,
    isDark,
    isValidating,
    isAddingMissingMembers = false,
    submitDisabled = false,
    activeValidationContent,
    pendingGroupMemberCount = 0,
    contextMemories = [],
    contextBudgets = [],
    contextHintsLoading = false,
    currencyCode,
    onOpenPicker,
    onOpenValidationModal,
    onSubmit,
}) => {
    const insets = useSafeAreaInsets();
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const cameraIconColor = isDark ? COLORS.dark.icon.primary : COLORS.light.icon.primary;
    const mutedIconColor = isDark ? COLORS.dark.icon.lighter : COLORS.light.icon.lighter;
    const successIconColor = isDark ? COLORS.dark.icon.brand : COLORS.light.icon.brand;
    const blockSubmit = submitDisabled || isAddingMissingMembers;

    // Home-indicator inset is only needed when the keyboard is closed.
    // Keeping it while KeyboardAvoidingView lifts the footer leaves a blank gap above the keyboard.
    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
        const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
        const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));
        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    const bottomPad = keyboardVisible ? 12 : Math.max(insets.bottom, 16);
    const colors = isDark ? COLORS.dark : COLORS.light;
    const elevatedChip = {
        backgroundColor: colors.bg.lighter,
        borderColor: colors.status.border,
    };

    return (
        <View
            className="w-full border-t px-6 pt-4"
            style={{
                paddingBottom: bottomPad,
                backgroundColor: colors.bg.primary,
                borderTopColor: colors.status.border,
            }}
        >
            <View className="mb-6 flex-row items-center justify-between gap-x-2">
                <View className="min-w-0 flex-1 flex-row items-center">
                    <Pressable
                        onPress={onOpenPicker}
                        className="rounded-full border p-2.5 active:opacity-80"
                        style={elevatedChip}
                        accessibilityLabel="Scan document"
                    >
                        <Iconify icon="heroicons:viewfinder-circle" size={20} color={cameraIconColor}/>
                    </Pressable>
                    {activeTab === 'expense' ? (
                        <ExpenseContextHintsRow
                            isDark={isDark}
                            memories={contextMemories}
                            budgets={contextBudgets}
                            loading={contextHintsLoading}
                            currencyCode={currencyCode}
                            compact
                        />
                    ) : null}
                </View>

                {activeTab === 'expense' && (
                    <>
                        {isAddingMissingMembers ? (
                            <View className="flex-row items-center gap-x-1">
                                <ActivityIndicator size="small" color={mutedIconColor}/>
                                <AppText variant="caption-xs" className="text-text-primary-lighter font-medium">
                                    Adding members…
                                </AppText>
                            </View>
                        ) : isValidating ? (
                            <View className="flex-row items-center gap-x-1">
                                <ActivityIndicator size="small" color={mutedIconColor}/>
                                <AppText variant="caption-xs" className="text-text-primary-lighter font-medium">
                                    Checking group...
                                </AppText>
                            </View>
                        ) : activeValidationContent ? (
                            <Pressable
                                onPress={onOpenValidationModal}
                                className="max-w-[55%] flex-row items-center gap-x-1 rounded-xl px-3 py-1.5 active:opacity-70"
                                style={{
                                    backgroundColor:
                                        activeValidationContent.type === 'ERROR'
                                            ? `${colors.status.error}22`
                                            : `${colors.status.warning}22`,
                                }}
                            >
                                {activeValidationContent.type === 'ERROR' ? (
                                    <Iconify
                                        icon="heroicons:exclamation-circle"
                                        size={14}
                                        color={colors.status.error}
                                    />
                                ) : (
                                    <Iconify
                                        icon="heroicons:exclamation-triangle"
                                        size={14}
                                        color={colors.status.warning}
                                    />
                                )}
                                <AppText
                                    variant="caption-xs"
                                    className="mr-1 flex-1 font-semibold"
                                    style={{
                                        color:
                                            activeValidationContent.type === 'ERROR'
                                                ? colors.status.error
                                                : colors.status.warning,
                                    }}
                                    numberOfLines={1}
                                >
                                    {activeValidationContent.payload?.message}
                                </AppText>
                                <Iconify
                                    icon="heroicons:information-circle"
                                    size={14}
                                    color={
                                        activeValidationContent.type === 'ERROR'
                                            ? colors.status.error
                                            : colors.status.warning
                                    }
                                />
                            </Pressable>
                        ) : pendingGroupMemberCount > 0 ? (
                            <View
                                className="max-w-[55%] flex-row items-center gap-x-1 rounded-xl px-3 py-1.5"
                                style={{backgroundColor: colors.accent.skyBg}}
                            >
                                <Iconify
                                    icon="heroicons:user-plus"
                                    size={14}
                                    color={colors.accent.sky}
                                />
                                <AppText
                                    variant="caption-xs"
                                    className="font-medium"
                                    style={{color: colors.accent.sky}}
                                    numberOfLines={1}
                                >
                                    Add {pendingGroupMemberCount} to group on submit
                                </AppText>
                            </View>
                        ) : (
                            <View
                                className="flex-row items-center gap-x-1 rounded-xl px-3 py-1.5"
                                style={{backgroundColor: colors.brand.lighter}}
                            >
                                <Iconify icon="heroicons:check-circle" size={14} color={successIconColor}/>
                                <AppText
                                    variant="caption-xs"
                                    className="font-medium"
                                    style={{color: colors.status.success}}
                                >
                                    Ready
                                </AppText>
                            </View>
                        )}
                    </>
                )}
            </View>

            <AppButton
                variant="primary"
                size="md"
                onPress={onSubmit}
                disabled={activeTab === 'expense' ? blockSubmit : false}
                loading={activeTab === 'expense' && isAddingMissingMembers}
                loadingText="ADDING…"
                renderIcon={(color, size) => (
                    <Iconify icon="heroicons:check" size={size} color={color}/>
                )}
            >
                SUBMIT
            </AppButton>
        </View>
    );
};
