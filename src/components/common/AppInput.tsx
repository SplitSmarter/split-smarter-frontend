// /src/components/common/AppInput.tsx
import React, {forwardRef, useState} from 'react';
import { View, TextInput, TextInputProps } from 'react-native';
import { AppText } from "@/src/components/common/AppText";
import { themeStore } from "@/src/store/themeStore";
import { COLORS } from "@/src/constants/colors";

interface AppInputProps extends TextInputProps {
    label?: string;
    error?: string;
    required?: boolean;
    renderLeftIcon?: (color: string) => React.ReactNode; // Added Left Icon prop
    renderRightIcon?: (color: string) => React.ReactNode;
}

// /src/components/common/AppInput.tsx
export const AppInput = forwardRef<TextInput, AppInputProps>((props, ref) => {
    const {
        label, error, required, renderLeftIcon, renderRightIcon, onFocus, onBlur, ...rest
    } = props;
    const [isFocused, setIsFocused] = useState(false);
    const { theme } = themeStore();
    const isDark = theme === 'dark';

    const getBorderClass = () => {
        if (error) return 'border-red-500';
        if (isFocused) return 'border-bg-secondary';
        return isDark ? 'border-white/10' : 'border-gray-200';
    };

    const iconColor = error
        ? '#EF4444'
        : isFocused
            ? isDark ? COLORS.icon_secondary_dark : COLORS.icon_secondary_light
            : isDark ? COLORS.icon_primary_dark : COLORS.icon_primary_light;

    // --- DYNAMIC CLASS CALCULATION ---
    const containerClass = `w-full px-4 rounded-2xl flex-row border ${getBorderClass()} ${
        isDark ? 'bg-bg-primary' : 'bg-white'
    } ${rest.multiline ? 'py-4 items-start' : 'h-14 items-center'}`;

    return (
        <View className="gap-y-2 w-full">
            {label && (
                <View className="flex-row items-center">
                    <AppText variant="body-base" className="font-semibold text-text-primary">
                        {label}
                    </AppText>
                    {required && <AppText className="text-red-500 ml-1">*</AppText>}
                </View>
            )}

            {/* REMOVED h-14 HERE, using containerClass instead */}
            <View className={containerClass}>
                {renderLeftIcon && (
                    <View className={rest.multiline ? "mr-3 mt-1" : "mr-3"}>
                        {renderLeftIcon(iconColor)}
                    </View>
                )}

                <TextInput
                    ref={ref}
                    // Adjusted height logic to avoid collisions
                    className={`flex-1 text-base ${isDark ? 'text-white' : 'text-gray-900'} ${
                        rest.multiline ? 'min-h-[100px]' : ''
                    }`}
                    textAlignVertical={rest.multiline ? 'top' : 'center'}
                    placeholderTextColor={isDark ? '#71717a' : '#a1a1aa'}
                    multiline={rest.multiline}
                    onFocus={(e) => {
                        setIsFocused(true);
                        onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setIsFocused(false);
                        onBlur?.(e);
                    }}
                    {...rest} // Use rest instead of props to avoid double-passing ref/onFocus
                />

                {renderRightIcon && (
                    <View className="ml-2">
                        {renderRightIcon(iconColor)}
                    </View>
                )}
            </View>

            {error && (
                <AppText variant="caption-xs" className="text-red-500 ml-1">
                    {error}
                </AppText>
            )}
        </View>
    );
});

AppInput.displayName = 'AppInput';