import React from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import {AppText} from '@/src/components/common/AppText';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';
import type {LedgerLens, LedgerScope} from '@/src/screens/dev/ledger-month/types';

type ChipProps = {
    label: string;
    active: boolean;
    onPress: () => void;
};

function Chip({label, active, onPress}: ChipProps) {
    return (
        <Pressable
            onPress={onPress}
            className={`mr-2 mb-2 rounded-full border px-3.5 py-1.5 active:opacity-80 ${
                active
                    ? 'border-accent-sky bg-accent-sky-bg'
                    : 'border-border-input bg-bg-primary'
            }`}
        >
            <AppText
                variant="caption-xs"
                className={
                    active
                        ? 'font-semibold text-accent-sky'
                        : 'font-medium text-text-primary'
                }
            >
                {label}
            </AppText>
        </Pressable>
    );
}

export type LensScopeBarProps = {
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

export function LensScopeBar({
    lens,
    onLensChange,
    scope,
    onScopeChange,
    showUpcoming,
    onToggleUpcoming,
    showMemory,
    onToggleMemory,
    openOnly,
    onToggleOpenOnly,
}: LensScopeBarProps) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    return (
        <View>
            <AppText
                variant="caption-xs"
                className="mb-2 font-bold uppercase tracking-wider"
                style={{color: colors.text.lighter}}
            >
                Amount lens
            </AppText>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="mb-4"
            >
                <Chip
                    label="Your share"
                    active={lens === 'share'}
                    onPress={() => onLensChange('share')}
                />
                <Chip
                    label="You paid"
                    active={lens === 'paid'}
                    onPress={() => onLensChange('paid')}
                />
                <Chip
                    label="Full expense"
                    active={lens === 'total'}
                    onPress={() => onLensChange('total')}
                />
            </ScrollView>

            <AppText
                variant="caption-xs"
                className="mb-2 font-bold uppercase tracking-wider"
                style={{color: colors.text.lighter}}
            >
                Scope
            </AppText>
            <View className="flex-row flex-wrap">
                <Chip
                    label="Everything"
                    active={scope === 'all'}
                    onPress={() => onScopeChange('all')}
                />
                <Chip
                    label="Just you"
                    active={scope === 'personal'}
                    onPress={() => onScopeChange('personal')}
                />
                <Chip
                    label="Flatmates"
                    active={scope === 'flatmates'}
                    onPress={() => onScopeChange('flatmates')}
                />
                <Chip
                    label="Goa trip"
                    active={scope === 'goa'}
                    onPress={() => onScopeChange('goa')}
                />
                <Chip
                    label="Scheduled"
                    active={showUpcoming}
                    onPress={onToggleUpcoming}
                />
                <Chip label="Memories" active={showMemory} onPress={onToggleMemory} />
                <Chip label="Open only" active={openOnly} onPress={onToggleOpenOnly} />
            </View>
        </View>
    );
}
