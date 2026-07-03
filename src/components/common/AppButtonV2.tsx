// /src/components/common/AppButtonV2.tsx
import React, { ReactNode } from 'react';
import { Pressable, PressableProps, View, GestureResponderEvent, ActivityIndicator } from 'react-native';
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
    const isInteractionDisabled = disabled || loading;

    const handlePress = (event: GestureResponderEvent) => {
        if (!isInteractionDisabled) {
            if (vibrate) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            onPress?.(event);
        }
    };

    // Keep color tracking intact for standard icons
    const getIconColor = () => {
        if (variant === 'primary') return isDark ? COLORS.icon_secondary_dark : COLORS.icon_secondary_light;
        return isDark ? COLORS.icon_primary_dark : COLORS.icon_primary_light;
    };

    const getShadowStyle = (isPressed: boolean) => {
        if (!hasShadow || isInteractionDisabled) return "";
        if (platform === 'android') return isPressed ? "elevation-1 opacity-90" : "elevation-4 shadow-black";
        if (isPressed) return "shadow-sm opacity-85";
        return isDark ? "shadow-lg shadow-white/5" : "shadow-md shadow-black/20";
    };

    // Core Theme Presets - Only controls colors. Structurally naked!
    const variantStyles = {
        primary: "bg-bg-secondary border-transparent text-text-secondary",
        secondary: "bg-bg-primary-lighter border-border-input text-text-primary",
        ghost: "bg-transparent border-transparent text-text-primary",
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
            /* The user's custom className string is placed here at the end so it takes priority */
            className={`
                flex-row gap-x-2 items-center justify-center border
                ${variantStyles[variant]}
                ${sizeStyles[size]}
                ${isInteractionDisabled ? 'opacity-50' : ''}
                ${className} 
            `}
            {...props}
        >
            {({ pressed }) => (
                <View
                    style={(pressed && !isInteractionDisabled) ? { transform: [{ scale: 0.98 }] } : { transform: [{ scale: 1 }] }}
                    className={`flex-row items-center justify-center w-full h-full gap-x-2 ${getShadowStyle(pressed)}`}
                >
                    {loading ? (
                        <>
                            <ActivityIndicator size="small" color={getIconColor()} />
                            {loadingText && (
                                <AppText variant={textVariants[size]} className="font-bold text-inherit">
                                    {loadingText}
                                </AppText>
                            )}
                        </>
                    ) : (
                        <>
                            {renderIcon && renderIcon(getIconColor(), iconSizes[size])}
                            {/* If standard string children are passed, style it safely. Otherwise render node directly */}
                            {typeof children === 'string' ? (
                                <AppText variant={textVariants[size]} className="font-bold text-inherit">
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