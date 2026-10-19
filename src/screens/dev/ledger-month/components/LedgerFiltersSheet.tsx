import React from 'react';
import {Pressable, View} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {AppBottomSheet} from '@/src/components/common/AppBottomSheet';
import {AppText} from '@/src/components/common/AppText';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';
import type {LedgerLens, LedgerScope} from '@/src/screens/dev/ledger-month/types';
import {LensScopeBar} from '@/src/screens/dev/ledger-month/components/LensScopeBar';

type LedgerFiltersSheetProps = {
    visible: boolean;
    onClose: () => void;
    lens: LedgerLens;
    onLensChange: (lens: LedgerLens) => void;
    scope: LedgerScope;
    onScopeChange: (scope: LedgerScope) => void;
    showUpcoming: boolean;
    onToggleUpcoming: () => void;
    showMemory: boolean;
    onToggleMemory: () => void;
    openOnly: boolean;
    onToggleOpenOnly: () => void;
};

export function LedgerFiltersSheet({
    visible,
    onClose,
    ...filterProps
}: LedgerFiltersSheetProps) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    return (
        <AppBottomSheet
            isVisible={visible}
            onClose={onClose}
            snapPoints={['62%', '88%']}
            showCloseButton={false}
        >
            <View className="pb-8">
                {/* Balanced header — equal side slots keep Filters centered */}
                <View className="mb-5 flex-row items-center">
                    <View className="w-10 items-start">
                        <Pressable
                            onPress={onClose}
                            hitSlop={12}
                            accessibilityRole="button"
                            accessibilityLabel="Close filters"
                            className="h-9 w-9 items-center justify-center rounded-full"
                            style={{backgroundColor: colors.bg.darker}}
                        >
                            <Iconify
                                icon="heroicons:x-mark"
                                size={18}
                                color={colors.icon.primary}
                            />
                        </Pressable>
                    </View>

                    <AppText
                        variant="h3"
                        className="flex-1 text-center font-bold"
                        style={{color: colors.text.primary}}
                    >
                        Filters
                    </AppText>

                    <View className="w-10" />
                </View>

                <LensScopeBar {...filterProps} />
            </View>
        </AppBottomSheet>
    );
}
