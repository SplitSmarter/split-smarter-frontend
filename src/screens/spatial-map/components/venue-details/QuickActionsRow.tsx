import React from 'react';
import {View, Pressable, ActivityIndicator} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';

function QuickAction({
    label,
    icon,
    onPress,
    primary,
    disabled,
    loading,
    spinnerColor,
}: {
    label: string;
    icon: React.ReactNode;
    onPress: () => void;
    primary?: boolean;
    disabled?: boolean;
    loading?: boolean;
    spinnerColor: string;
}) {
    const isDisabled = disabled || loading;
    return (
        <Pressable
            onPress={onPress}
            disabled={isDisabled}
            className={`flex-1 items-center gap-y-2 ${
                isDisabled ? 'opacity-35' : 'active:opacity-75'
            }`}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{disabled: !!isDisabled, busy: !!loading}}
        >
            <View
                className={`h-12 w-12 items-center justify-center rounded-2xl ${
                    primary ? 'bg-bg-secondary' : 'border border-border-input bg-bg-canvas'
                }`}
            >
                {loading ? (
                    <ActivityIndicator size="small" color={spinnerColor} />
                ) : (
                    icon
                )}
            </View>
            <AppText
                variant="caption-xs"
                className={`font-semibold ${
                    primary ? 'text-text-primary' : 'text-text-primary-lighter'
                }`}
            >
                {label}
            </AppText>
        </Pressable>
    );
}

interface QuickActionsRowProps {
    onAddExpense: () => void;
    onAddBudget: () => void;
    onShare: () => void;
    onDirections: () => void;
    directionsEnabled: boolean;
    expenseLoading?: boolean;
    /** Soft-disable Expense/Budget (e.g. reverse geocode still resolving). */
    saveActionsDisabled?: boolean;
}

export function QuickActionsRow({
    onAddExpense,
    onAddBudget,
    onShare,
    onDirections,
    directionsEnabled,
    expenseLoading = false,
    saveActionsDisabled = false,
}: QuickActionsRowProps) {
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const saveBlocked = expenseLoading || saveActionsDisabled;

    return (
        <View className="flex-row gap-2.5">
            <QuickAction
                label="Expense"
                primary
                onPress={onAddExpense}
                loading={expenseLoading}
                disabled={saveActionsDisabled}
                spinnerColor={colors.text.contrast}
                icon={
                    <Iconify icon="heroicons:plus" size={18} color={colors.text.contrast} />
                }
            />
            <QuickAction
                label="Budget"
                onPress={onAddBudget}
                disabled={saveBlocked}
                spinnerColor={colors.icon.primary}
                icon={
                    <Iconify
                        icon="heroicons:banknotes"
                        size={18}
                        color={colors.icon.primary}
                    />
                }
            />
            <QuickAction
                label="Share"
                onPress={onShare}
                disabled={saveBlocked}
                spinnerColor={colors.icon.primary}
                icon={<Iconify icon="heroicons:share" size={18} color={colors.icon.primary} />}
            />
            <QuickAction
                label="Directions"
                onPress={onDirections}
                disabled={!directionsEnabled || saveBlocked}
                spinnerColor={colors.icon.primary}
                icon={<Iconify icon="heroicons:map" size={18} color={colors.icon.primary} />}
            />
        </View>
    );
}

export function ClusterQuickActionsRow() {
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    return (
        <View className="flex-row gap-2.5">
            <QuickAction
                label="Filter"
                onPress={() => {}}
                spinnerColor={colors.icon.primary}
                icon={<Iconify icon="heroicons:funnel" size={18} color={colors.icon.primary} />}
            />
            <QuickAction
                label="Export"
                onPress={() => {}}
                spinnerColor={colors.icon.primary}
                icon={
                    <Iconify
                        icon="heroicons:arrow-down-tray"
                        size={18}
                        color={colors.icon.primary}
                    />
                }
            />
            <QuickAction
                label="Alert"
                onPress={() => {}}
                spinnerColor={colors.icon.primary}
                icon={<Iconify icon="heroicons:bell" size={18} color={colors.icon.primary} />}
            />
            <QuickAction
                label="Route"
                onPress={() => {}}
                spinnerColor={colors.icon.primary}
                icon={
                    <Iconify
                        icon="heroicons:paper-airplane"
                        size={18}
                        color={colors.icon.primary}
                    />
                }
            />
        </View>
    );
}
