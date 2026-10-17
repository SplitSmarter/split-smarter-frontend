import React, {useMemo} from 'react';
import {Pressable, View} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';
import type {TrailTxn} from './TrailLayer';
import {getTimeSlotColor} from './TrailLayer';

interface TrailExpenseListRowProps {
    txn: TrailTxn;
    amountLabel?: string | null;
    isLast: boolean;
    onPress: () => void;
}

function formatTimeMeta(at?: string): string {
    if (!at) return '';
    const d = new Date(at);
    if (Number.isNaN(d.getTime())) {
        return at.includes('T') ? at.slice(11, 16) : at;
    }
    return d.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function TrailExpenseListRow({
    txn,
    amountLabel,
    isLast,
    onPress,
}: TrailExpenseListRowProps) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const displayIndex = txn.index ?? 0;
    const badgeColor = useMemo(() => getTimeSlotColor(txn.at), [txn.at]);
    const timeMeta = formatTimeMeta(txn.at);

    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={`Stop ${displayIndex}, ${txn.venueName}`}
            className={`flex-row items-center px-4 py-3.5 active:opacity-80 ${
                isLast ? '' : 'border-b border-border-input'
            }`}
        >
            <View
                className="mr-3 h-8 w-8 items-center justify-center rounded-full border-2 border-white"
                style={{backgroundColor: badgeColor}}
            >
                <AppText
                    variant="caption-xs"
                    className="font-extrabold text-white"
                >
                    {displayIndex}
                </AppText>
            </View>

            <View className="min-w-0 flex-1 pr-2">
                <AppText
                    variant="body-base"
                    className="font-semibold text-text-primary"
                    numberOfLines={1}
                >
                    {txn.venueName}
                </AppText>
                {timeMeta ? (
                    <AppText
                        variant="caption-xs"
                        className="mt-0.5 text-text-primary-lighter"
                        numberOfLines={1}
                    >
                        {timeMeta}
                    </AppText>
                ) : null}
            </View>

            {amountLabel ? (
                <AppText
                    variant="body-small"
                    className="mr-1 font-bold text-text-primary"
                >
                    {amountLabel}
                </AppText>
            ) : null}

            <Iconify
                icon="heroicons:chevron-right"
                size={16}
                color={colors.icon.lighter}
            />
        </Pressable>
    );
}
