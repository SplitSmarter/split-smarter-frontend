// /src/components/common/AppButton.tsx
import React, { ReactNode } from 'react';
import {
    Pressable,
    PressableProps,
    View,
    GestureResponderEvent,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { AppText } from "@/src/components/common/AppText";
import { themeStore } from '@/src/store/themeStore';
import { deviceStore } from '@/src/store/deviceStore';
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
    loading?: boolean;
    loadingText?: string;
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
                              loading = false,
                              loadingText,
                              ...props
                          }: AppButtonProps) => {

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

    const getIconColor = () => {
        // Primary CTA = platinum invert (brand.primary) — icons match text.contrast
        if (variant === 'primary') {
            return colors.text.contrast;
        }
        return colors.icon.primary;
    };

    // Force fill via COLORS on the INNER surface — never put bg on Pressable className
    // (NativeWind can override style and leave a dark CTA on a dark sheet).
    const variantSurfaceStyle: ViewStyle =
        variant === 'primary'
            ? {backgroundColor: colors.brand.primary}
            : {backgroundColor: colors.bg.lighter};

    const labelColor = variant === 'primary' ? colors.text.contrast : colors.text.primary;

    const getShadowStyle = (isPressed: boolean): ViewStyle | undefined => {
        if (!hasShadow || isInteractionDisabled) return undefined;

        if (platform === 'android') {
            return {elevation: isPressed ? 1 : 4};
        }

        if (isPressed) {
            return {
                shadowColor: COLORS.light.brand.primary,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.15,
                shadowRadius: 2,
                opacity: 0.8,
            };
        }

        return isDark
            ? {
                shadowColor: COLORS.dark.text.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            }
            : {
                shadowColor: COLORS.light.brand.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            };
    };

    const getBorderStyle = () => {
        if (!hasBorder) return "border-0";
        return variant === 'primary' ? "border-golden" : "border-bg-primary-darker";
    };

    const sizes = { sm: "py-2 px-4", md: "py-3 px-6", lg: "py-4 px-8" };
    const textVariants = { sm: "body-small" as const, md: "body-base" as const, lg: "body-large" as const };
    const iconSizes = { sm: 16, md: 20, lg: 24 };
    const iconSize = iconSizes[size];
    const labelStyle: TextStyle = {
        color: labelColor,
        lineHeight: iconSize + 4,
        includeFontPadding: false,
        textAlignVertical: 'center',
    };

    return (
        <Pressable
            onPress={handlePress}
            disabled={isInteractionDisabled}
            // Outer only: positioning / caller overrides. Center so h-* still looks balanced.
            className={`w-full items-center justify-center ${className}`}
            {...props}
        >
            {({ pressed }) => (
                <View
                    style={[
                        variantSurfaceStyle,
                        (pressed && !isInteractionDisabled)
                            ? {transform: [{scale: 0.96}]}
                            : {transform: [{scale: 1}]},
                        getShadowStyle(pressed),
                        pressed && !isInteractionDisabled && platform === 'android'
                            ? {opacity: 0.9}
                            : undefined,
                    ]}
                    className={`
                        w-full flex-row items-center justify-center gap-x-2 rounded-full border
                        ${getBorderStyle()}
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
                            {loadingText ? (
                                <AppText
                                    variant={textVariants[size]}
                                    className="font-bold"
                                    style={labelStyle}
                                >
                                    {loadingText}
                                </AppText>
                            ) : null}
                        </>
                    ) : (
                        <>
                            {renderIcon ? (
                                <View
                                    style={{
                                        width: iconSize,
                                        height: iconSize,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {renderIcon(getIconColor(), iconSize)}
                                </View>
                            ) : null}
                            <AppText
                                variant={textVariants[size]}
                                className="font-bold"
                                style={labelStyle}
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
