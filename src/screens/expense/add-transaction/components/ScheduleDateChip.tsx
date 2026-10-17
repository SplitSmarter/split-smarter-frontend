import React from 'react';
import {Pressable} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';

interface ScheduleDateChipProps {
    label: string;
    mode?: 'once' | 'recurring';
    onPress: () => void;
}

/** Compact date / schedule control for amount-row placement. */
export const ScheduleDateChip: React.FC<ScheduleDateChipProps> = ({
    label,
    mode = 'once',
    onPress,
}) => {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const isRecurring = mode === 'recurring';

    return (
        <Pressable
            onPress={onPress}
            hitSlop={6}
            className={`h-14 flex-row items-center rounded-2xl border px-3 active:opacity-80 max-w-[42%] ${
                isRecurring
                    ? 'bg-accent-sky-bg border-accent-sky'
                    : 'bg-bg-primary-lighter border-border-input'
            }`}
            accessibilityLabel={isRecurring ? `Recurring schedule: ${label}` : `Date: ${label}`}
        >
            {isRecurring ? (
                <Iconify icon="heroicons:arrow-path" size={16} color={colors.accent.sky} />
            ) : (
                <Iconify icon="heroicons:calendar" size={16} color={colors.status.decrease} />
            )}
            <AppText
                variant="caption-xs"
                className={`ml-1.5 font-bold ${isRecurring ? 'text-accent-sky' : 'text-text-primary'}`}
                numberOfLines={1}
            >
                {label}
            </AppText>
        </Pressable>
    );
};
