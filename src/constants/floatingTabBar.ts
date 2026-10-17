import {Platform, ViewStyle} from 'react-native';
import {COLORS} from '@/src/constants/colors';

const baseFloatingTabBar: ViewStyle = {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 28 : 20,
    left: 20,
    right: 20,
    height: 64,
    borderRadius: 32,
    borderTopWidth: 0,
    borderWidth: 1,
    elevation: 12,
    shadowOffset: {width: 0, height: 8},
    shadowRadius: 16,
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: 0,
    overflow: 'hidden',
};

/** Platinum glass nav — light mode needs stronger edge so it doesn’t vanish on canvas. */
export const getFloatingTabBarStyle = (isDark: boolean): ViewStyle => ({
    ...baseFloatingTabBar,
    backgroundColor: isDark ? 'rgba(11, 15, 23, 0.92)' : 'rgba(255, 255, 255, 0.96)',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.10)' : COLORS.light.status.border,
    shadowColor: COLORS.light.brand.primary,
    shadowOpacity: isDark ? 0.5 : 0.14,
});

/** @deprecated Prefer getFloatingTabBarStyle(isDark) for Platinum theme. */
export const FLOATING_TAB_BAR_STYLE: ViewStyle = getFloatingTabBarStyle(true);

export const HIDDEN_TAB_BAR_STYLE: ViewStyle = {
    display: 'none',
};
