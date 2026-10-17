import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { useAlert } from '@/src/context/alertContext';
import { AlertSeverity } from '@/src/types/alertComponent';
import { themeStore } from '@/src/store/themeStore';
import { COLORS } from '@/src/constants/colors';

const AlertDisplay = () => {
    const { alert } = useAlert();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    const severityColors: Record<AlertSeverity, string> = {
        info: colors.accent.sky,
        success: colors.status.success,
        warning: colors.status.warning,
        error: colors.status.error,
    };

    const getSeverityColor = (severity: string): string => {
        return severityColors[severity as AlertSeverity] || severityColors.info;
    };

    useEffect(() => {
        if (alert) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                setTimeout(() => {
                    Animated.timing(fadeAnim, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }).start();
                }, 2500);
            });
        }
    }, [alert]);

    if (!alert) return null;

    return (
        <Animated.View style={[styles.alertContainer, { backgroundColor: getSeverityColor(alert.severity), opacity: fadeAnim }]}>
            <Text style={[styles.alertText, { color: colors.text.contrast }]}>{alert.message}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    alertContainer: {
        position: 'absolute',
        top: 50,
        right: 20,
        left: 20,
        padding: 15,
        borderRadius: 8,
        zIndex: 9999,
        elevation: 10,
    },
    alertText: {
        fontWeight: 'bold',
    },
});

export default AlertDisplay;
