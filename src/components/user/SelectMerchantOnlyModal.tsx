import React, {useMemo} from 'react';
import {
    Dimensions,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    View,
} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {AddMerchantHeaderButton} from '@/src/components/user/AddMerchantHeaderButton';
import {SelectMerchantTab} from '@/src/components/user/SelectMerchantTab';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';
import type {UserMerchantDetails} from '@/src/api/dto/expense/merchant';

/** Who opened the picker — drives title / subtitle copy. */
export type SelectMerchantCaller =
    | 'dropped_pin'
    | 'unsaved_google'
    | 'transfer'
    | 'default';

type MerchantModalCopy = {
    title: string;
    subtitle: string;
    dismissLabel: string;
};

const CALLER_COPY: Record<SelectMerchantCaller, MerchantModalCopy> = {
    dropped_pin: {
        title: 'Select merchant',
        subtitle: 'Link this pin to a merchant location',
        dismissLabel: 'Dismiss merchant picker',
    },
    unsaved_google: {
        title: 'Select merchant',
        subtitle: 'Link this Google place to a merchant',
        dismissLabel: 'Dismiss merchant picker',
    },
    transfer: {
        title: 'Select merchant',
        subtitle: 'Choose a merchant for this transfer',
        dismissLabel: 'Dismiss merchant picker',
    },
    default: {
        title: 'Select merchant',
        subtitle: 'Choose a merchant',
        dismissLabel: 'Dismiss merchant picker',
    },
};

interface SelectMerchantOnlyModalProps {
    visible: boolean;
    onClose: () => void;
    onSelectMerchant: (
        merchantId: number,
        merchant: UserMerchantDetails
    ) => void;
    /** Entry point — changes header copy (and future caller-specific UX). */
    caller?: SelectMerchantCaller;
}

const MODAL_MAX_HEIGHT = Math.round(Dimensions.get('window').height * 0.82);

/** Merchant picker modal — reusable across map pin, transfer, etc. */
export function SelectMerchantOnlyModal({
    visible,
    onClose,
    onSelectMerchant,
    caller = 'default',
}: SelectMerchantOnlyModalProps) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const copy = useMemo(() => CALLER_COPY[caller] ?? CALLER_COPY.default, [caller]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View className="flex-1 items-center justify-center bg-black/55 px-5">
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={copy.dismissLabel}
                        onPress={onClose}
                        className="absolute inset-0"
                    />
                    <View
                        className="w-full overflow-hidden rounded-[28px] border"
                        style={{
                            height: MODAL_MAX_HEIGHT,
                            backgroundColor: colors.bg.overlay,
                            borderColor: colors.status.border,
                        }}
                    >
                        <View className="flex-row items-center justify-between border-b border-border-input px-5 py-4">
                            <View className="flex-1 pr-3">
                                <AppText
                                    variant="h4"
                                    className="font-bold text-text-primary"
                                >
                                    {copy.title}
                                </AppText>
                                <AppText
                                    variant="caption-xs"
                                    className="mt-0.5 text-text-primary-lighter"
                                >
                                    {copy.subtitle}
                                </AppText>
                            </View>
                            <View className="flex-row items-center gap-2">
                                <AddMerchantHeaderButton
                                    onClose={onClose}
                                    iconColor={colors.icon.primary}
                                    backgroundColor={colors.bg.darker}
                                />
                                <Pressable
                                    onPress={onClose}
                                    accessibilityRole="button"
                                    accessibilityLabel="Close"
                                    hitSlop={8}
                                    className="h-10 w-10 items-center justify-center rounded-full active:opacity-70"
                                    style={{backgroundColor: colors.bg.darker}}
                                >
                                    <Iconify
                                        icon="heroicons:x-mark"
                                        size={20}
                                        color={colors.icon.primary}
                                    />
                                </Pressable>
                            </View>
                        </View>

                        <View className="flex-1 px-4 pb-4">
                            <SelectMerchantTab
                                isDark={isDark}
                                variant="plain"
                                onClose={onClose}
                                onSelect={(merchantId, merchant) => {
                                    onSelectMerchant(merchantId, merchant);
                                }}
                            />
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}
