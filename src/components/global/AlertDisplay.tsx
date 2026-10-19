import React, {useEffect, useMemo, useRef} from 'react';
import {Animated, Pressable, StyleSheet, View} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {useAlert} from '@/src/context/alertContext';
import {AlertSeverity} from '@/src/types/alertComponent';
import {PLATINUM_HEADER} from '@/src/constants/colors';
import {COLORS} from '@/src/constants/colors';
import {PLATINUM_HERO_GRADIENT} from '@/src/screens/dashboard/constants/dashboard.constants';

const SHOW_MS = 2600;
const ANIM_IN_MS = 280;
const ANIM_OUT_MS = 320;

const SEVERITY_META: Record<
    AlertSeverity,
    {label: string; accent: string}
> = {
    info: {label: 'Notice', accent: COLORS.dark.accent.sky},
    success: {label: 'Success', accent: COLORS.dark.status.success},
    warning: {label: 'Warning', accent: COLORS.dark.status.warning},
    error: {label: 'Error', accent: COLORS.dark.status.error},
};

function SeverityIcon({severity, color}: {severity: AlertSeverity; color: string}) {
    if (severity === 'success') {
        return <Iconify icon="heroicons:check-circle-solid" size={20} color={color} />;
    }
    if (severity === 'error') {
        return <Iconify icon="heroicons:exclamation-triangle" size={20} color={color} />;
    }
    if (severity === 'warning') {
        return <Iconify icon="heroicons:exclamation-circle" size={20} color={color} />;
    }
    return <Iconify icon="heroicons:information-circle" size={20} color={color} />;
}

const AlertDisplay = () => {
    const {alert} = useAlert();
    const insets = useSafeAreaInsets();
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(-14)).current;
    const shownKeyRef = useRef<string | null>(null);

    const severity = (alert?.severity ?? 'info') as AlertSeverity;
    const meta = SEVERITY_META[severity] ?? SEVERITY_META.info;

    const alertKey = useMemo(
        () => (alert ? `${alert.severity}:${alert.message}` : null),
        [alert],
    );

    useEffect(() => {
        if (!alert || !alertKey) return;
        if (shownKeyRef.current === alertKey) return;
        shownKeyRef.current = alertKey;

        opacity.setValue(0);
        translateY.setValue(-14);

        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: ANIM_IN_MS,
                useNativeDriver: true,
            }),
            Animated.spring(translateY, {
                toValue: 0,
                friction: 8,
                tension: 80,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setTimeout(() => {
                Animated.parallel([
                    Animated.timing(opacity, {
                        toValue: 0,
                        duration: ANIM_OUT_MS,
                        useNativeDriver: true,
                    }),
                    Animated.timing(translateY, {
                        toValue: -10,
                        duration: ANIM_OUT_MS,
                        useNativeDriver: true,
                    }),
                ]).start();
            }, SHOW_MS);
        });
    }, [alert, alertKey, opacity, translateY]);

    if (!alert) return null;

    return (
        <Animated.View
            pointerEvents="box-none"
            style={[
                styles.wrap,
                {
                    top: Math.max(insets.top, 12) + 8,
                    opacity,
                    transform: [{translateY}],
                },
            ]}
        >
            <Pressable style={styles.pressable}>
                <LinearGradient
                    colors={[...PLATINUM_HERO_GRADIENT.dark]}
                    start={{x: 0.05, y: 0}}
                    end={{x: 0.95, y: 1}}
                    style={styles.card}
                >
                    <View
                        style={[styles.accentRail, {backgroundColor: meta.accent}]}
                    />

                    <View
                        style={[
                            styles.iconChip,
                            {borderColor: `${meta.accent}55`, backgroundColor: `${meta.accent}22`},
                        ]}
                    >
                        <SeverityIcon severity={severity} color={meta.accent} />
                    </View>

                    <View style={styles.copy}>
                        <AppText
                            variant="caption-xs"
                            className="mb-0.5 font-bold uppercase tracking-widest text-white/55"
                        >
                            {meta.label}
                        </AppText>
                        <AppText
                            variant="body-small"
                            className="font-semibold leading-5 text-white"
                            numberOfLines={3}
                        >
                            {alert.message}
                        </AppText>
                    </View>
                </LinearGradient>
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    wrap: {
        position: 'absolute',
        left: 16,
        right: 16,
        zIndex: 9999,
        elevation: 24,
    },
    pressable: {
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255,255,255,0.18)',
        // Soft lift over canvas / platinum heroes
        shadowColor: PLATINUM_HEADER.dark,
        shadowOffset: {width: 0, height: 10},
        shadowOpacity: 0.35,
        shadowRadius: 20,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 14,
        paddingRight: 16,
        paddingLeft: 14,
        minHeight: 64,
    },
    accentRail: {
        position: 'absolute',
        left: 0,
        top: 10,
        bottom: 10,
        width: 3,
        borderTopRightRadius: 2,
        borderBottomRightRadius: 2,
    },
    iconChip: {
        width: 36,
        height: 36,
        borderRadius: 12,
        borderWidth: StyleSheet.hairlineWidth,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 4,
    },
    copy: {
        flex: 1,
        paddingRight: 4,
    },
});

export default AlertDisplay;
