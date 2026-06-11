import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, Easing, StyleSheet, LayoutChangeEvent } from 'react-native';
import { themeStore } from '@/src/store/themeStore';

export const Shimmer = ({ height, borderRadius = 20, className = "" }: { height: any, borderRadius?: number, className?: string }) => {
    const isDark = themeStore((state) => state.theme === 'dark');
    const [viewWidth, setViewWidth] = useState(0);
    const shimmerAttr = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (viewWidth > 0) {
            Animated.loop(
                Animated.timing(shimmerAttr, {
                    toValue: 1,
                    duration: 1200,
                    easing: Easing.bezier(0.4, 0, 0.6, 1),
                    useNativeDriver: true,
                })
            ).start();
        }
    }, [viewWidth]);

    const onLayout = (event: LayoutChangeEvent) => {
        setViewWidth(event.nativeEvent.layout.width);
    };

    // Calculate translation based on actual numeric width
    const translateX = shimmerAttr.interpolate({
        inputRange: [0, 1],
        outputRange: [-viewWidth, viewWidth],
    });

    return (
        <View
            onLayout={onLayout}
            className={className}
            style={[
                { height, borderRadius, overflow: 'hidden' },
                { backgroundColor: isDark ? '#1E1E1E' : '#E5E7EB' }
            ]}
        >
            {viewWidth > 0 && (
                <Animated.View
                    style={[
                        StyleSheet.absoluteFill,
                        {
                            transform: [{ translateX }],
                            backgroundColor: isDark ? '#2D2D2D' : '#F3F4F6',
                            opacity: 0.6,
                            width: viewWidth * 0.5, // 50% of the container width
                        },
                    ]}
                />
            )}
        </View>
    );
};