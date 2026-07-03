import React, { forwardRef, useState } from 'react';
import { View, TextInput, TextInputProps } from 'react-native';
import { AppText } from "@/src/components/common/AppText";
import { themeStore } from "@/src/store/themeStore";
import { COLORS } from "@/src/constants/colors";

interface AppInputProps extends TextInputProps {
    label?: string;
    error?: string;
    required?: boolean;
    renderLeftIcon?: (color: string) => React.ReactNode;
    renderRightIcon?: (color: string) => React.ReactNode;
}

export const AppInput = forwardRef<TextInput, AppInputProps>((props, ref) => {
    const {
        label, error, required, renderLeftIcon, renderRightIcon, onFocus, onBlur, ...rest
    } = props;
    const [isFocused, setIsFocused] = useState(false);
    const { theme } = themeStore();
    const isDark = theme === 'dark';

    // 1. Dynamic Native Variable Assignments
    // Note: If your `COLORS` structure maps to tailwind vars, you can read directly from CSS variables here too!
    const iconColor = error
        ? (isDark ? '#F87171' : '#EF4444') // Maps exactly to --color-status-error
        : isFocused
            ? (isDark ? COLORS.icon_secondary_dark : COLORS.icon_secondary_light)
            : (isDark ? COLORS.icon_primary_dark : COLORS.icon_primary_light);

    const placeholderColor = isDark ? '#71717A' : '#A1A1AA';

    // 2. Pure Variable-Driven Tailwind Selection
    const getBorderClass = () => {
        if (error) return 'border-status-error';
        if (isFocused) return 'border-bg-secondary';
        return 'border-border-input';
    };

    const containerClass = `w-full px-4 rounded-2xl flex-row border ${getBorderClass()} bg-bg-primary-lighter ${
        rest.multiline ? 'py-4 items-start' : 'h-14 items-center'
    }`;

    return (
        <View className="gap-y-2 w-full">
            {label && (
                <View className="flex-row items-center">
                    <AppText variant="body-base" className="font-semibold text-text-primary">
                        {label}
                    </AppText>
                    {required && <AppText className="text-status-error ml-1">*</AppText>}
                </View>
            )}

            <View className={containerClass}>
                {renderLeftIcon && (
                    <View className={rest.multiline ? "mr-3 mt-1" : "mr-3"}>
                        {renderLeftIcon(iconColor)}
                    </View>
                )}

                <TextInput
                    ref={ref}
                    className={`flex-1 text-base text-text-primary ${
                        rest.multiline ? 'min-h-[100px]' : ''
                    }`}
                    textAlignVertical={rest.multiline ? 'top' : 'center'}
                    placeholderTextColor={placeholderColor}
                    multiline={rest.multiline}
                    onFocus={(e) => {
                        setIsFocused(true);
                        onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setIsFocused(false);
                        onBlur?.(e);
                    }}
                    {...rest}
                />

                {renderRightIcon && (
                    <View className="ml-2">
                        {renderRightIcon(iconColor)}
                    </View>
                )}
            </View>

            {error && (
                <AppText variant="caption-xs" className="text-status-error ml-1">
                    {error}
                </AppText>
            )}
        </View>
    );
});

AppInput.displayName = 'AppInput';