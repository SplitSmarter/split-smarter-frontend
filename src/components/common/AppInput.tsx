// /src/components/common/AppInput.tsx
import React, {forwardRef, useState} from 'react';
import { View, TextInput, TextInputProps } from 'react-native';
import { AppText } from "@/src/components/common/AppText";
import { useThemeStore } from "@/src/store/useThemeStore";
import { COLORS } from "@/src/constants/colors";

interface AppInputProps extends TextInputProps {
    label?: string;
    error?: string;
    required?: boolean;
    renderLeftIcon?: (color: string) => React.ReactNode; // Added Left Icon prop
    renderRightIcon?: (color: string) => React.ReactNode;
}

export const AppInput = forwardRef<TextInput, AppInputProps>((props, ref) => {
    const {
        label,
        error,
        required,
        renderLeftIcon,
        renderRightIcon,
        onFocus,
        onBlur,
        ...rest // Use 'rest' to ensure all TextInputProps are passed
    } = props;
    const [isFocused, setIsFocused] = useState(false);
    const {theme} = useThemeStore();
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

            <View
                className={`w-full h-14 px-4 rounded-2xl flex-row items-center border ${getBorderClass()} ${
                    isDark ? 'bg-bg-primary' : 'bg-white'
                }`}
            >
                {/* --- Left Icon Section --- */}
                {renderLeftIcon && (
                    <View className="mr-3">
                        {renderLeftIcon(iconColor)}
                    </View>
                )}

                <TextInput
                    ref={ref}
                    className={`flex-1 text-base h-full ${isDark ? 'text-white' : 'text-gray-900'}`}
                    placeholderTextColor={isDark ? '#71717a' : '#a1a1aa'} // Updated to a hex string for better reliability
                    onFocus={(e) => {
                        setIsFocused(true);
                        onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setIsFocused(false);
                        onBlur?.(e);
                    }}
                    {...props}
                />

                {/* --- Right Icon Section --- */}
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