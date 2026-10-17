import React from 'react';
import {View, Pressable} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';

interface VenueSheetHeaderProps {
    title: string;
    /** Address under place name (or cluster subtitle). */
    subtitle?: string | null;
    showBack: boolean;
    onBack: () => void;
    onClose: () => void;
}

export function VenueSheetHeader({
    title,
    subtitle,
    showBack,
    onBack,
    onClose,
}: VenueSheetHeaderProps) {
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    return (
        <View className="px-6 pb-3 pt-1">
            <View className="flex-row items-center">
                <View className="w-10 items-start">
                    {showBack ? (
                        <Pressable
                            onPress={onBack}
                            className="h-10 w-10 items-center justify-center rounded-full active:opacity-70"
                            style={{backgroundColor: colors.bg.darker}}
                            accessibilityRole="button"
                            accessibilityLabel="Back to cluster"
                        >
                            <Iconify
                                icon="heroicons:arrow-left"
                                size={18}
                                color={colors.icon.primary}
                            />
                        </Pressable>
                    ) : (
                        <View className="h-10 w-10" />
                    )}
                </View>
                <View className="min-w-0 flex-1 items-center px-2">
                    <AppText
                        variant="h4"
                        className="text-center font-bold tracking-tight text-text-primary"
                        numberOfLines={1}
                    >
                        {title}
                    </AppText>
                    {subtitle ? (
                        <AppText
                            variant="caption-xs"
                            className="mt-0.5 text-center font-medium tracking-wide text-text-primary-lighter"
                            numberOfLines={2}
                        >
                            {subtitle}
                        </AppText>
                    ) : null}
                </View>
                <View className="w-10 items-end">
                    <Pressable
                        onPress={onClose}
                        className="h-10 w-10 items-center justify-center rounded-full active:opacity-70"
                        style={{backgroundColor: colors.bg.darker}}
                        accessibilityRole="button"
                        accessibilityLabel="Close"
                    >
                        <Iconify
                            icon="heroicons:x-mark"
                            size={18}
                            color={colors.icon.primary}
                        />
                    </Pressable>
                </View>
            </View>
        </View>
    );
}
