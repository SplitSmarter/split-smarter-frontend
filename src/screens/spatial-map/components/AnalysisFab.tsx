import React from 'react';
import {Pressable, View} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';

interface AnalysisFabProps {
    bottom: number;
    onPress: () => void;
}

export function AnalysisFab({bottom, onPress}: AnalysisFabProps) {
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    return (
        <View
            className="absolute right-3 z-40"
            style={{bottom}}
            pointerEvents="box-none"
        >
            <Pressable
                onPress={onPress}
                accessibilityRole="button"
                accessibilityLabel="Analyze places in view"
                className="h-[52px] w-[52px] items-center justify-center rounded-full bg-bg-primary-lighter shadow-lg shadow-black/30 elevation-6 active:opacity-80 dark:bg-bg-overlay"
            >
                <Iconify
                    icon="heroicons:chart-bar"
                    size={24}
                    color={colors.icon.primary}
                />
            </Pressable>
        </View>
    );
}
