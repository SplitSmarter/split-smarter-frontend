import {useCallback, useEffect, useRef} from 'react';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {
    getFloatingTabBarStyle,
    HIDDEN_TAB_BAR_STYLE,
} from '@/src/constants/floatingTabBar';
import {themeStore} from '@/src/store/themeStore';
import {TAB_BAR_IDLE_MS} from '../constants/mapConstants';

export function useMapTabBarVisibility() {
    const navigation = useNavigation();
    const isDark = themeStore((s) => s.theme === 'dark');
    const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const overlayOpenRef = useRef(false);

    const clearIdleTimer = useCallback(() => {
        if (idleTimerRef.current) {
            clearTimeout(idleTimerRef.current);
            idleTimerRef.current = null;
        }
    }, []);

    const showTabBar = useCallback(() => {
        if (overlayOpenRef.current) return;
        navigation.setOptions({tabBarStyle: getFloatingTabBarStyle(isDark)});
    }, [navigation, isDark]);

    const hideTabBar = useCallback(() => {
        navigation.setOptions({tabBarStyle: HIDDEN_TAB_BAR_STYLE});
    }, [navigation]);

    const scheduleShowTabBar = useCallback(() => {
        clearIdleTimer();
        if (overlayOpenRef.current) return;
        idleTimerRef.current = setTimeout(showTabBar, TAB_BAR_IDLE_MS);
    }, [clearIdleTimer, showTabBar]);

    const notifyActivity = useCallback(() => {
        hideTabBar();
        scheduleShowTabBar();
    }, [hideTabBar, scheduleShowTabBar]);

    const setOverlayOpen = useCallback(
        (open: boolean) => {
            overlayOpenRef.current = open;
            if (open) {
                clearIdleTimer();
                hideTabBar();
                return;
            }
            scheduleShowTabBar();
        },
        [clearIdleTimer, hideTabBar, scheduleShowTabBar]
    );

    useFocusEffect(
        useCallback(() => {
            showTabBar();
            return () => {
                clearIdleTimer();
                overlayOpenRef.current = false;
                navigation.setOptions({tabBarStyle: getFloatingTabBarStyle(isDark)});
            };
        }, [clearIdleTimer, navigation, showTabBar, isDark])
    );

    useEffect(() => () => clearIdleTimer(), [clearIdleTimer]);

    return {
        notifyActivity,
        setOverlayOpen,
    };
}
