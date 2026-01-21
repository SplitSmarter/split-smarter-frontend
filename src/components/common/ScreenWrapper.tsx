// /src/components/common/ScreenWrapper.tsx
import React from 'react';
import { View, SafeAreaView, Platform, StatusBar } from 'react-native';
import {useThemeStore} from "@/src/store/useThemeStore";
import {useDeviceStore} from "@/src/store/deviceStore";

interface ScreenWrapperProps {
    children: React.ReactNode;
    className?: string;
    withPadding?: boolean;
}

export const ScreenWrapper = ({
                                  children,
                                  className = "",
                                  withPadding = true
                              }: ScreenWrapperProps) => {
    const platform = useDeviceStore((state) => state.platform);

    return (
        // SafeAreaView handles the notch on iOS
        <SafeAreaView className="flex-1 bg-bg-primary-lighter">
            <View
                className={`flex-1 ${withPadding ? 'px-6' : ''} ${className}`}
                style={{
                    // Android SafeAreaView doesn't support paddingTop by default
                    paddingTop: platform === 'android' ? StatusBar.currentHeight : 0
                }}
            >
                {children}
            </View>
        </SafeAreaView>
    );
};