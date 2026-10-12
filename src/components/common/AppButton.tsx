// /src/components/common/AppButton.tsx
import React, { ReactNode } from 'react';
import {
    Pressable,
    PressableProps,
    View,
    GestureResponderEvent,
    ActivityIndicator,
    StyleSheet,
    ViewStyle,
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

    const getIconColor = () => {
        // Primary CTA sits on bg-secondary — icons must match white CTA label text
        if (variant === 'primary') {
            return isDark ? COLORS.dark.text.contrast : COLORS.light.text.contrast;
        }
        return isDark ? COLORS.dark.icon.primary : COLORS.light.icon.primary;
    };

    // StyleSheet shadows — avoid NativeWind shadow-* during theme flips (nav-context race)
    const getShadowStyle = (isPressed: boolean): ViewStyle | undefined => {
        if (!hasShadow || isInteractionDisabled) return undefined;

        if (platform === 'android') {
            return {elevation: isPressed ? 1 : 4};
        }

        if (isPressed) {
            return styles.shadowPressed;
        }

        return isDark ? styles.shadowDark : styles.shadowLight;
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
                    style={[
                        (pressed && !isInteractionDisabled)
                            ? {transform: [{scale: 0.96}]}
                            : {transform: [{scale: 1}]},
                        getShadowStyle(pressed),
                        pressed && !isInteractionDisabled && platform === 'android'
                            ? {opacity: 0.9}
                            : undefined,
                    ]}
                    className={`
                        flex-row gap-x-2 rounded-full items-center justify-center border w-full
                        ${variant === 'primary' ? "bg-bg-secondary" : "bg-bg-primary-lighter"}
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

const styles = StyleSheet.create({
    shadowLight: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    shadowDark: {
        shadowColor: '#fff',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    shadowPressed: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.15,
        shadowRadius: 2,
        opacity: 0.8,
    },
});