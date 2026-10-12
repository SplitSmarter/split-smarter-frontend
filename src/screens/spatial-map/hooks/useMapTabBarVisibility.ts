import {useCallback, useEffect, useRef} from 'react';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {
    FLOATING_TAB_BAR_STYLE,
    HIDDEN_TAB_BAR_STYLE,
} from '@/src/constants/floatingTabBar';
import {TAB_BAR_IDLE_MS} from '../constants/mapConstants';

export function useMapTabBarVisibility() {
    const navigation = useNavigation();
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
        navigation.setOptions({tabBarStyle: FLOATING_TAB_BAR_STYLE});
    }, [navigation]);

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
                navigation.setOptions({tabBarStyle: FLOATING_TAB_BAR_STYLE});
            };
        }, [clearIdleTimer, navigation, showTabBar])
    );

    useEffect(() => () => clearIdleTimer(), [clearIdleTimer]);

    return {
        notifyActivity,
        setOverlayOpen,
    };
}
