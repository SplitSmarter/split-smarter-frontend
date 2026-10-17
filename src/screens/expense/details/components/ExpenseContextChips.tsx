import React from 'react';
import {Pressable, View} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import type {ExpenseDetailsBasicResponse} from '@/src/api/dto/expense/expense';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';

interface ExpenseContextChipsProps {
    expense: ExpenseDetailsBasicResponse;
    onPlacePress?: () => void;
    onGroupPress?: () => void;
    onMemoryPress?: () => void;
}

export function ExpenseContextChips({
    expense,
    onPlacePress,
    onGroupPress,
    onMemoryPress,
}: ExpenseContextChipsProps) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const chips: Array<{
        key: string;
        label: string;
        onPress?: () => void;
        icon: React.ReactNode;
    }> = [];

    if (expense.place?.name) {
        chips.push({
            key: 'place',
            label: expense.place.name,
            onPress: onPlacePress,
            icon: (
                <Iconify
                    icon="heroicons:map-pin"
                    size={14}
                    color={colors.accent.sky}
                />
            ),
        });
    }
    if (expense.group?.title) {
        chips.push({
            key: 'group',
            label: expense.group.title,
            onPress: onGroupPress,
            icon: (
                <Iconify
                    icon="heroicons:user-group"
                    size={14}
                    color={colors.accent.sky}
                />
            ),
        });
    }
    if (expense.memory?.title) {
        chips.push({
            key: 'memory',
            label: expense.memory.title,
            onPress: onMemoryPress,
            icon: (
                <Iconify
                    icon="heroicons:photo"
                    size={14}
                    color={colors.accent.sky}
                />
            ),
        });
    }

    if (chips.length === 0) return null;

    return (
        <View className="flex-row flex-wrap gap-2">
            {chips.map((chip) => (
                <Pressable
                    key={chip.key}
                    onPress={chip.onPress}
                    disabled={!chip.onPress}
                    accessibilityRole={chip.onPress ? 'button' : undefined}
                    className="max-w-full flex-row items-center gap-1.5 rounded-full border border-accent-sky bg-accent-sky-bg px-3 py-1.5 active:opacity-80"
                >
                    {chip.icon}
                    <AppText
                        variant="caption-xs"
                        className="max-w-[180px] font-semibold text-accent-sky"
                        numberOfLines={1}
                    >
                        {chip.label}
                    </AppText>
                </Pressable>
            ))}
        </View>
    );
}
