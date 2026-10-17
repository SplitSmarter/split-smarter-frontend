import React from 'react';
import {Pressable, View} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';

interface ExpenseActionsRowProps {
    showSettle: boolean;
    onSettle?: () => void;
    onEdit?: () => void;
    onSeeAll?: () => void;
    seeAllLabel?: string;
}

export function ExpenseActionsRow({
    showSettle,
    onSettle,
    onEdit,
    onSeeAll,
    seeAllLabel = 'See all details',
}: ExpenseActionsRowProps) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    return (
        <View className="flex-row flex-wrap gap-2">
            {showSettle && onSettle ? (
                <Pressable
                    onPress={onSettle}
                    accessibilityRole="button"
                    accessibilityLabel="Settle"
                    className="flex-row items-center gap-1.5 rounded-full bg-bg-secondary px-4 py-2.5 active:opacity-85"
                >
                    <Iconify
                        icon="heroicons:banknotes"
                        size={16}
                        color={COLORS.light.text.contrast}
                    />
                    <AppText
                        variant="caption-xs"
                        className="font-bold text-text-secondary"
                    >
                        Settle
                    </AppText>
                </Pressable>
            ) : null}

            {onEdit ? (
                <Pressable
                    onPress={onEdit}
                    accessibilityRole="button"
                    accessibilityLabel="Edit expense"
                    className="flex-row items-center gap-1.5 rounded-full border border-border-input bg-bg-primary px-4 py-2.5 active:opacity-80"
                >
                    <Iconify
                        icon="heroicons:pencil-square"
                        size={16}
                        color={colors.icon.primary}
                    />
                    <AppText
                        variant="caption-xs"
                        className="font-semibold text-text-primary"
                    >
                        Edit
                    </AppText>
                </Pressable>
            ) : null}

            {onSeeAll ? (
                <Pressable
                    onPress={onSeeAll}
                    accessibilityRole="button"
                    accessibilityLabel={seeAllLabel}
                    className="flex-row items-center gap-1.5 rounded-full border border-accent-sky bg-accent-sky-bg px-4 py-2.5 active:opacity-80"
                >
                    <Iconify
                        icon="heroicons:arrow-top-right-on-square"
                        size={16}
                        color={colors.accent.sky}
                    />
                    <AppText
                        variant="caption-xs"
                        className="font-semibold text-accent-sky"
                    >
                        {seeAllLabel}
                    </AppText>
                </Pressable>
            ) : null}
        </View>
    );
}
