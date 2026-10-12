import React from 'react';
import { View, SafeAreaView, StatusBar, Platform, ViewStyle, StyleProp } from 'react-native';
import { themeStore } from '@/src/store/themeStore';
import { COLORS } from '@/src/constants/colors';

interface ScreenWrapperProps {
    children: React.ReactNode;
    className?: string;
    withPadding?: boolean;
    /**
     * Fills SafeAreaView including the system status-bar / notch strip.
     * `className` does NOT paint that strip — always set this when the header
     * chrome differs from the default canvas (e.g. brand green headers).
     * Prop name is camelCase: `backgroundColor` (not `backgroundcolor`).
     */
    backgroundColor?: string;
    statusBarStyle?: 'light-content' | 'dark-content';
    style?: StyleProp<ViewStyle>;
}

export const ScreenWrapper = ({
    children,
    className = '',
    withPadding = true,
    backgroundColor,
    statusBarStyle,
    style,
}: ScreenWrapperProps) => {
    const theme = themeStore((state) => state.theme);
    const isDark = theme === 'dark';

    const resolvedBackground =
        backgroundColor ?? (isDark ? COLORS.dark.bg.primary : COLORS.light.bg.primary);
    const resolvedStatusBarStyle =
        statusBarStyle ?? (isDark ? 'light-content' : 'dark-content');

    return (
        <SafeAreaView
            // backgroundColor covers the notch / status-bar area on both platforms
            style={[{ flex: 1, backgroundColor: resolvedBackground }, style]}
        >
            <StatusBar
                barStyle={resolvedStatusBarStyle}
                // Android: transparent so SafeAreaView color shows through
                backgroundColor="transparent"
                translucent={true}
            />
            <View
                className={`flex-1 ${withPadding ? 'px-6' : ''} ${className}`}
                style={{
                    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
                }}
            >
                {children}
            </View>
        </SafeAreaView>
    );
};
