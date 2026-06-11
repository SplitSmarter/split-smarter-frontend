import React from 'react';
import { View, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { themeStore } from '@/src/store/themeStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ThemeToggle = () => {
    const { theme, toggleTheme } = themeStore();
    const isDarkMode = theme === 'dark';

    // Animation for sliding the ball
    const animatedValue = React.useRef(new Animated.Value(isDarkMode ? 1 : 0)).current;

    React.useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: isDarkMode ? 1 : 0,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [isDarkMode]);

    // Interpolate the animated value for horizontal movement
    const translateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [2, 26], // Adjust values to match your design
    });

    return (
        <TouchableOpacity onPress={toggleTheme} activeOpacity={0.8}>
            <View style={[styles.toggleContainer, { backgroundColor: isDarkMode ? '#333' : '#00BCD4' }]}>
                <Animated.View style={[styles.circle, { transform: [{ translateX }] }]}>
                    {isDarkMode ? (
                        <MaterialCommunityIcons name="moon-waning-crescent" size={20} color="#fff" />
                    ) : (
                        <MaterialCommunityIcons name="white-balance-sunny" size={20} color="#FFA726" />
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
        backgroundColor: '#ccc',
    },
    circle: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 2,
        left: 2,
    },
});

export default ThemeToggle;
