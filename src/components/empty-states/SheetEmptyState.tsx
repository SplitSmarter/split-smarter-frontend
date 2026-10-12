import React from 'react';
import {View, Pressable} from 'react-native';
import {AppText} from '@/src/components/common/AppText';
import {AppButton} from '@/src/components/common/AppButton';
import {themeStore} from '@/src/store/themeStore';

interface SheetEmptyAction {
    label: string;
    onPress: () => void;
    renderIcon?: (color: string) => React.ReactNode;
}

interface SheetEmptyStateProps {
    icon: React.ReactNode;
    title: string;
    description?: string;
    primaryAction?: SheetEmptyAction;
    secondaryAction?: SheetEmptyAction;
}

export function SheetEmptyState({
    icon,
    title,
    description,
    primaryAction,
    secondaryAction,
}: SheetEmptyStateProps) {
    return (
        <View className="items-center justify-center px-6 py-12">
            <View className="w-16 h-16 rounded-full items-center justify-center mb-4 bg-bg-primary-darker/10 dark:bg-white/10">
                {icon}
            </View>
            <AppText variant="body-base" className="font-semibold text-text-primary text-center">
                {title}
            </AppText>
            {description ? (
                <AppText variant="caption-xs" className="text-text-primary-lighter text-center mt-2 leading-5">
                    {description}
                </AppText>
            ) : null}
            {primaryAction ? (
                <AppButton
                    variant="primary"
                    className="mt-6 px-8 rounded-2xl h-12"
                    onPress={primaryAction.onPress}
                    renderIcon={primaryAction.renderIcon}
                >
                    {primaryAction.label}
                </AppButton>
            ) : null}
            {secondaryAction ? (
                <Pressable onPress={secondaryAction.onPress} className="mt-4 py-2 active:opacity-60">
                    <AppText variant="body-xs" className="text-text-link font-medium">
                        {secondaryAction.label}
                    </AppText>
                </Pressable>
            ) : null}
        </View>
    );
}
