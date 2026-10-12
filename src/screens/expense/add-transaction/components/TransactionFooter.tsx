import React, {useEffect, useState} from 'react';
import {View, Pressable, ActivityIndicator, StyleSheet, Keyboard, Platform} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {AppButton} from '@/src/components/common/AppButton';
import {COLORS} from '@/src/constants/colors';
import {TransactionTabType} from '../constants/addTransaction.constants';

interface TransactionFooterProps {
    activeTab: TransactionTabType;
    readableDate: string;
    isDark: boolean;
    isValidating: boolean;
    isAddingMissingMembers?: boolean;
    submitDisabled?: boolean;
    activeValidationContent: any;
    pendingGroupMemberCount?: number;
    transferAmount: number;
    transferCurrency: string;
    isInitiatingPayment: boolean;
    onOpenDatePicker: () => void;
    onOpenPicker: () => void;
    onOpenValidationModal: () => void;
    onSubmit: () => void;
    onInitiatePayment: () => void;
}

export const TransactionFooter: React.FC<TransactionFooterProps> = ({
    activeTab,
    readableDate,
    isDark,
    isValidating,
    isAddingMissingMembers = false,
    submitDisabled = false,
    activeValidationContent,
    pendingGroupMemberCount = 0,
    transferAmount,
    transferCurrency,
    isInitiatingPayment,
    onOpenDatePicker,
    onOpenPicker,
    onOpenValidationModal,
    onSubmit,
    onInitiatePayment,
}) => {
    const insets = useSafeAreaInsets();
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const cameraIconColor = isDark ? COLORS.dark.icon.primary : COLORS.light.icon.primary;
    const mutedIconColor = isDark ? COLORS.dark.icon.lighter : COLORS.light.icon.lighter;
    const brandIconColor = isDark ? COLORS.dark.brand.primary : COLORS.light.brand.primary;
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

    return (
        <View
            className="w-full bg-bg-primary pt-4 px-6 rounded-t-[40px] border-t border-border-input"
            style={[styles.footerShadow, {paddingBottom: bottomPad}]}
        >
            <View className="flex-row justify-between items-center mb-6">
                <View className="flex-row items-center gap-x-2">
                    <Pressable
                        onPress={onOpenDatePicker}
                        className="flex-row items-center bg-bg-canvas border border-border-input rounded-full px-5 py-2 active:opacity-80"
                    >
                        <Iconify icon="heroicons:calendar" size={18} color={COLORS.color_red_decrease}/>
                        <AppText variant="body-base" className="ml-2 text-text-primary font-bold">
                            {readableDate}
                        </AppText>
                    </Pressable>

                    <Pressable
                        onPress={onOpenPicker}
                        className="p-2.5 rounded-full bg-bg-canvas border border-border-input active:opacity-80"
                        accessibilityLabel="Attach photo"
                    >
                        <Iconify icon="heroicons:camera" size={20} color={cameraIconColor}/>
                    </Pressable>
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
                                className={`flex-row items-center gap-x-1 px-3 py-1.5 rounded-xl max-w-[55%] active:opacity-70 ${
                                    activeValidationContent.type === 'ERROR'
                                        ? 'bg-red-500/10 dark:bg-red-500/20'
                                        : 'bg-amber-500/10 dark:bg-amber-500/20'
                                }`}
                            >
                                {activeValidationContent.type === 'ERROR' ? (
                                    <Iconify icon="heroicons:exclamation-circle" size={14} color="#EF4444"/>
                                ) : (
                                    <Iconify icon="heroicons:exclamation-triangle" size={14} color="#D97706"/>
                                )}
                                <AppText
                                    variant="caption-xs"
                                    className={`font-semibold mr-1 flex-1 ${
                                        activeValidationContent.type === 'ERROR'
                                            ? 'text-red-600 dark:text-red-400'
                                            : 'text-amber-700 dark:text-amber-400'
                                    }`}
                                    numberOfLines={1}
                                >
                                    {activeValidationContent.payload?.message}
                                </AppText>
                                <Iconify
                                    icon="heroicons:information-circle"
                                    size={14}
                                    color={activeValidationContent.type === 'ERROR' ? '#EF4444' : '#D97706'}
                                />
                            </Pressable>
                        ) : pendingGroupMemberCount > 0 ? (
                            <View className="flex-row items-center gap-x-1 bg-accent-sky-bg px-3 py-1.5 rounded-xl max-w-[55%]">
                                <Iconify icon="heroicons:user-plus" size={14} color="#0284C7"/>
                                <AppText
                                    variant="caption-xs"
                                    className="text-accent-sky font-medium"
                                    numberOfLines={1}
                                >
                                    Add {pendingGroupMemberCount} to group on submit
                                </AppText>
                            </View>
                        ) : (
                            <View className="flex-row items-center gap-x-1 bg-bg-secondary-lighter px-3 py-1.5 rounded-xl">
                                <Iconify icon="heroicons:check-circle" size={14} color={brandIconColor}/>
                                <AppText variant="caption-xs" className="text-green-increase font-medium">
                                    Ready
                                </AppText>
                            </View>
                        )}
                    </>
                )}
            </View>

            {activeTab === 'expense' ? (
                <AppButton
                    variant="primary"
                    size="lg"
                    onPress={onSubmit}
                    disabled={blockSubmit}
                    loading={isAddingMissingMembers}
                    loadingText="ADDING…"
                    renderIcon={(color, size) => (
                        <Iconify icon="heroicons:check" size={size} color={color}/>
                    )}
                >
                    SUBMIT
                </AppButton>
            ) : (
                <View className="gap-y-3">
                    <AppButton
                        variant="primary"
                        size="lg"
                        onPress={onInitiatePayment}
                        disabled={isInitiatingPayment}
                        loading={isInitiatingPayment}
                        loadingText="INITIATING..."
                    >
                        {`PAY NOW (${transferCurrency} ${transferAmount})`}
                    </AppButton>
                    <AppButton variant="secondary" size="md" onPress={onSubmit}>
                        RECORD ONLY (NO PAYMENT)
                    </AppButton>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    footerShadow: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: -10},
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 16,
    },
});
