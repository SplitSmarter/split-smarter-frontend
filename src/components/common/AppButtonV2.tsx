// /src/components/common/AppButtonV2.tsx
import React, { ReactNode } from 'react';
import {
    Pressable,
    PressableProps,
    View,
    GestureResponderEvent,
    ActivityIndicator,
    ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { AppText } from "@/src/components/common/AppText";
import { themeStore } from '@/src/store/themeStore';
import { deviceStore } from '@/src/store/deviceStore';
import { COLORS } from "@/src/constants/colors";

interface AppButtonV2Props extends PressableProps {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg' | 'none'; // 'none' allows complete layout overrides
    renderIcon?: (color: string, size: number) => ReactNode;
    className?: string;       // Placed directly on the visible outer container wrapper
    hasShadow?: boolean;
    vibrate?: boolean;
    loading?: boolean;
    loadingText?: string;
}

export const AppButtonV2 = ({
                                children,
                                onPress,
                                size = 'md',
                                renderIcon,
                                variant = 'primary',
                                className = '',
                                disabled,
                                hasShadow = false,
                                vibrate = false,
                                loading = false,
                                loadingText,
                                ...props
                            }: AppButtonV2Props) => {

    const theme = themeStore((state) => state.theme);
    const platform = deviceStore((state) => state.platform);

    const isDark = theme === 'dark';
    const colors = isDark ? COLORS.dark : COLORS.light;
    const isInteractionDisabled = disabled || loading;

    const handlePress = (event: GestureResponderEvent) => {
        if (!isInteractionDisabled) {
            if (vibrate) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            onPress?.(event);
        }
    };

    // Primary CTA = platinum invert (brand.primary) — icons match text.contrast
    const getIconColor = () => {
        if (variant === 'primary') {
            return colors.text.contrast;
        }
        return colors.icon.primary;
    };

    // StyleSheet shadows — avoid NativeWind shadow-* during theme flips
    const getShadowStyle = (isPressed: boolean): ViewStyle | undefined => {
        if (!hasShadow || isInteractionDisabled) return undefined;
        if (platform === 'android') {
            return {elevation: isPressed ? 1 : 4, opacity: isPressed ? 0.9 : 1};
        }
        if (isPressed) {
            return {
                shadowColor: COLORS.light.brand.primary,
                shadowOffset: {width: 0, height: 1},
                shadowOpacity: 0.12,
                shadowRadius: 2,
                opacity: 0.85,
            };
        }
        return isDark
            ? {
                shadowColor: COLORS.dark.text.primary,
                shadowOffset: {width: 0, height: 3},
                shadowOpacity: 0.05,
                shadowRadius: 6,
            }
            : {
                shadowColor: COLORS.light.brand.primary,
                shadowOffset: {width: 0, height: 3},
                shadowOpacity: 0.2,
                shadowRadius: 6,
            };
    };

    // Force fill via COLORS — NativeWind bg-bg-secondary can linger as emerald
    const variantSurfaceStyle: ViewStyle =
        variant === 'primary'
            ? {backgroundColor: colors.brand.primary}
            : variant === 'secondary'
                ? {backgroundColor: colors.bg.lighter}
                : {backgroundColor: 'transparent'};

    const labelColor =
        variant === 'primary' ? colors.text.contrast : colors.text.primary;

    // Structural / border classes only (fill + label color come from style)
    const variantStyles = {
        primary: "border-transparent",
        secondary: "border-border-input",
        ghost: "border-transparent",
    };

    // Core Metric Presets - Sensible defaults, completely omitted if size="none"
    const sizeStyles = {
        none: "",
        sm: "py-2 px-4 rounded-xl",
        md: "py-3 px-6 rounded-2xl",
        lg: "py-4 px-8 rounded-2xl",
    };

    const textVariants = { none: "body-base" as const, sm: "body-small" as const, md: "body-base" as const, lg: "body-large" as const };
    const iconSizes = { none: 20, sm: 16, md: 20, lg: 24 };

    return (
        <Pressable
            onPress={handlePress}
            disabled={isInteractionDisabled}
            /* className last so callers can override layout; fill always from COLORS */
            className={`
                flex-row gap-x-2 items-center justify-center border
                ${variantStyles[variant]}
                ${sizeStyles[size]}
                ${isInteractionDisabled ? 'opacity-50' : ''}
                ${className} 
            `}
            {...props}
            style={[variantSurfaceStyle, props.style as ViewStyle]}
        >
            {({ pressed }) => (
                <View
                    style={[
                        (pressed && !isInteractionDisabled)
                            ? {transform: [{scale: 0.98}]}
                            : {transform: [{scale: 1}]},
                        getShadowStyle(pressed),
                    ]}
                    className="flex-row items-center justify-center w-full h-full gap-x-2"
                >
                    {loading ? (
                        <>
                            <ActivityIndicator size="small" color={getIconColor()} />
                            {loadingText && (
                                <AppText
                                    variant={textVariants[size]}
                                    className="font-bold"
                                    style={{color: labelColor}}
                                >
                                    {loadingText}
                                </AppText>
                            )}
                        </>
                    ) : (
                        <>
                            {renderIcon && renderIcon(getIconColor(), iconSizes[size])}
                            {typeof children === 'string' ? (
                                <AppText
                                    variant={textVariants[size]}
                                    className="font-bold"
                                    style={{color: labelColor}}
                                >
                                    {children}
                                </AppText>
                            ) : (
                                children
                            )}
                        </>
                    )}
                </View>
            )}
        </Pressable>
    );
};

AppButtonV2.displayName = 'AppButtonV2';
