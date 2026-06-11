import React from 'react';
import { View, SafeAreaView, StatusBar, Platform } from 'react-native';

interface ScreenWrapperProps {
    children: React.ReactNode;
    className?: string;
    withPadding?: boolean;
    backgroundColor?: string;
    statusBarStyle?: 'light-content' | 'dark-content';
}

export const ScreenWrapper = ({
                                  children,
                                  className = "",
                                  withPadding = true,
                                  backgroundColor = "white", // Default color
                                  statusBarStyle = "dark-content",
                                  style = {}
                              }: ScreenWrapperProps & { style?: any }) => {

    return (
        <SafeAreaView
            // The background color here covers the notch/status bar area
            style={[{ flex: 1, backgroundColor }, style]}
        >
            <StatusBar
                barStyle={statusBarStyle}
                // On Android, we make it transparent so the SafeAreaView color shows through
                backgroundColor="transparent"
                translucent={true}
            />
            <View
                className={`flex-1 ${withPadding ? 'px-6' : ''} ${className}`}
                style={{
                    // Optional: Manual tweak for Android status bar if needed
                    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
                }}
            >
                {children}
            </View>
        </SafeAreaView>
    );
};