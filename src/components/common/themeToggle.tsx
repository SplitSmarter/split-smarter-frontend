import React from 'react';
import { View, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Iconify } from 'react-native-iconify';
import { themeStore } from '@/src/store/themeStore';
import { COLORS } from '@/src/constants/colors';

const ThemeToggle = () => {
    const { theme, toggleTheme } = themeStore();
    const isDarkMode = theme === 'dark';
    const colors = isDarkMode ? COLORS.dark : COLORS.light;

    const animatedValue = React.useRef(new Animated.Value(isDarkMode ? 1 : 0)).current;

    React.useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: isDarkMode ? 1 : 0,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [isDarkMode]);

    const translateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [2, 26],
    });

    return (
        <TouchableOpacity onPress={toggleTheme} activeOpacity={0.8}>
            <View style={[styles.toggleContainer, { backgroundColor: isDarkMode ? colors.bg.lighter : colors.accent.sky }]}>
                <Animated.View style={[styles.circle, { transform: [{ translateX }], backgroundColor: colors.bg.canvas }]}>
                    {isDarkMode ? (
                        <Iconify icon="heroicons:moon" size={20} color={colors.text.primary} />
                    ) : (
                        <Iconify icon="heroicons:sun" size={20} color={colors.status.warning} />
                    )}
                </Animated.View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    toggleContainer: {
        width: 50,
        height: 30,
        borderRadius: 15,
        padding: 2,
        justifyContent: 'center',
    },
    circle: {
        width: 26,
        height: 26,
        borderRadius: 13,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 2,
        left: 2,
    },
});

export default ThemeToggle;
