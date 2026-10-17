import React from 'react';
import {View} from 'react-native';
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
            showCloseButton
        >
            <View className="px-5 pb-8">
                <AppText
                    variant="caption-xs"
                    className="mb-1 font-semibold uppercase tracking-wider"
                    style={{color: colors.text.lighter}}
                >
                    Ledger
                </AppText>
                <AppText
                    variant="h3"
                    className="mb-4 font-bold"
                    style={{color: colors.text.primary}}
                >
                    Filters
                </AppText>
                <LensScopeBar {...filterProps} />
            </View>
        </AppBottomSheet>
    );
}
