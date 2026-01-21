// /src/components/common/AppButton.tsx
import React, { ReactNode } from 'react';
import { Pressable, PressableProps, View, GestureResponderEvent, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { AppText } from "@/src/components/common/AppText";
import { useThemeStore } from '@/src/store/useThemeStore';
import { useDeviceStore } from '@/src/store/deviceStore';
import { COLORS } from "@/src/constants/colors";

interface AppButtonProps extends PressableProps {
    children: ReactNode;
    variant?: 'primary' | 'secondary';
    size?: 'sm' | 'md' | 'lg';
    renderIcon?: (color: string, size: number) => ReactNode;
    className?: string;
    hasBorder?: boolean;
    hasShadow?: boolean;
    vibrate?: boolean;
    loading?: boolean;      // New Prop
    loadingText?: string;   // New Prop
}

export const AppButton = ({
                              children,
                              onPress,
                              size = 'md',
                              renderIcon,
                              variant = 'primary',
                              className = '',
                              disabled,
                              hasBorder = false,
                              hasShadow = false,
                              vibrate = false,
                              loading = false,      // Default to false
                              loadingText,           // Optional
                              ...props
                          }: AppButtonProps) => {

    const theme = useThemeStore((state) => state.theme);
    const platform = useDeviceStore((state) => state.platform);

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

    const getIconColor = () => {
        if (variant === 'primary') {
            return isDark ? COLORS.icon_secondary_dark : COLORS.icon_secondary_light;
        }
        return isDark ? COLORS.icon_primary_dark : COLORS.icon_primary_light;
    };

    const getShadowStyle = (isPressed: boolean) => {
        if (!hasShadow || isInteractionDisabled) return "";

        if (platform === 'android') {
            return isPressed ? "elevation-1 opacity-90" : "elevation-4 shadow-black";
        }

        if (isPressed) return "shadow-sm opacity-80";

        return isDark
            ? "shadow-lg shadow-white/10"
            : "shadow-lg shadow-black/30";
    };

    const getBorderStyle = () => {
        if (!hasBorder) return "border-0";
        return variant === 'primary' ? "border-golden" : "border-bg-primary-darker";
    };

    const sizes = { sm: "py-2 px-4", md: "py-3 px-6", lg: "py-4 px-8" };
    const textVariants = { sm: "body-small" as const, md: "body-base" as const, lg: "body-large" as const };
    const iconSizes = { sm: 16, md: 20, lg: 24 };

    return (
        <Pressable
            onPress={handlePress}
            disabled={isInteractionDisabled}
            className={className}
            {...props}
        >
            {({ pressed }) => (
                <View
                    style={(pressed && !isInteractionDisabled) ? { transform: [{ scale: 0.96 }] } : { transform: [{ scale: 1 }] }}
                    className={`
                        flex-row gap-x-2 rounded-full items-center justify-center border w-full
                        ${variant === 'primary' ? "bg-bg-secondary" : "bg-bg-primary-lighter"}
                        ${getBorderStyle()}
                        ${getShadowStyle(pressed)}
                        ${sizes[size]}
                        ${isInteractionDisabled ? 'opacity-60' : ''}
                    `}
                >
                    {loading ? (
                        <>
                            <ActivityIndicator
                                size="small"
                                color={getIconColor()}
                            />
                            {loadingText && (
                                <AppText
                                    variant={textVariants[size]}
                                    className={`${variant === 'primary' ? "text-text-secondary" : "text-text-primary"} font-bold`}
                                >
                                    {loadingText}
                                </AppText>
                            )}
                        </>
                    ) : (
                        <>
                            {renderIcon && renderIcon(getIconColor(), iconSizes[size])}
                            <AppText
                                variant={textVariants[size]}
                                className={`${variant === 'primary' ? "text-text-secondary" : "text-text-primary"} font-bold`}
                            >
                                {children}
                            </AppText>
                        </>
                    )}
                </View>
            )}
        </Pressable>
    );
};