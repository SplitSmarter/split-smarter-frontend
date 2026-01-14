import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';
import { useAlert } from '@/src/context/alertContext';
import {AlertSeverity} from "@/src/types/alertComponent";

const severityColors: Record<AlertSeverity, string> = {
    info: '#2196f3',
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
};

const AlertDisplay = () => {
    const { alert } = useAlert();
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const getSeverityColor = (severity: string ): string => {
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
            <Text style={styles.alertText}>{alert.message}</Text>
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
        color: 'white',
        fontWeight: 'bold',
    },
});

export default AlertDisplay;
