import React from 'react';
import {Pressable, View} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {PLATINUM_HERO_GRADIENT} from '@/src/screens/dashboard/constants/dashboard.constants';
import {themeStore} from '@/src/store/themeStore';
import {COLORS} from '@/src/constants/colors';

type Props = {
    title: string;
    subtitle?: string;
    onBack: () => void;
    disabled?: boolean;
    /** Optional trailing control (e.g. Done). Defaults to a spacer matching the back chip. */
    right?: React.ReactNode;
};

/**
 * Compact platinum chrome — flat bottom so the form sheet’s inverted-U
 * nests over it (add-budget / add-transaction language).
 */
export function PlatinumFormHeader({
    title,
    subtitle,
    onBack,
    disabled,
    right,
}: Props) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const gradient = isDark ? PLATINUM_HERO_GRADIENT.dark : PLATINUM_HERO_GRADIENT.light;
    const iconColor = COLORS.light.text.contrast;

    return (
        <LinearGradient
            colors={[...gradient]}
            start={{x: 0.1, y: 0.1}}
            end={{x: 0.9, y: 0.9}}
            className="px-5 pb-8 pt-2"
        >
            <View className="flex-row items-center justify-between">
                <Pressable
                    onPress={onBack}
                    disabled={disabled}
                    hitSlop={12}
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                    className="h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/15 active:opacity-70"
                >
                    <Iconify icon="heroicons:chevron-left" size={20} color={iconColor} />
                </Pressable>

                <View className="min-w-0 flex-1 items-center px-2">
                    <AppText variant="h4" className="font-bold text-white" numberOfLines={1}>
                        {title}
                    </AppText>
                    {subtitle ? (
                        <AppText
                            variant="caption-xs"
                            className="text-white/70"
                            numberOfLines={1}
                        >
                            {subtitle}
                        </AppText>
                    ) : null}
                </View>

                {right != null ? (
                    <View className="min-w-[40px] items-end justify-center">{right}</View>
                ) : (
                    <View className="h-10 w-10" />
                )}
            </View>
        </LinearGradient>
    );
}
