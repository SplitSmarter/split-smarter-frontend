import React from 'react';
import {ActivityIndicator, Pressable, StyleProp, View, ViewStyle} from 'react-native';
import {Iconify} from 'react-native-iconify';

interface MyLocationFabProps {
    isLoading: boolean;
    isDark: boolean;
    onPress: () => void;
    style?: StyleProp<ViewStyle>;
}

export function MyLocationFab({isLoading, isDark, onPress, style}: MyLocationFabProps) {
    return (
        <View
            className="absolute z-40"
            style={[{bottom: 32, right: 16}, style]}
            pointerEvents="box-none"
        >
            <Pressable
                onPress={onPress}
                disabled={isLoading}
                accessibilityRole="button"
                accessibilityLabel="Go to current location"
                className="h-[52px] w-[52px] items-center justify-center rounded-full bg-bg-primary-lighter shadow-lg shadow-black/30 elevation-6 active:opacity-80 dark:bg-bg-overlay"
            >
                {isLoading ? (
                    <ActivityIndicator size="small" color="#2D8A5B" />
                ) : (
                    <Iconify
                        icon="heroicons:map-pin"
                        size={24}
                        color={isDark ? '#FFFFFF' : '#2D8A5B'}
                    />
                )}
            </Pressable>
        </View>
    );
}
