import React from 'react';
import {Pressable, View} from 'react-native';
import {MaterialCommunityIcons, FontAwesome5, Feather} from '@expo/vector-icons';
import {AppText} from '@/src/components/common/AppText';
import {AppImageV2} from '@/src/components/common/AppImageV2';
import {EntityFallbackIcon} from '@/src/components/common/EntityFallbackIcon';
import {themeStore} from '@/src/store/themeStore';
import {COLORS} from '@/src/constants/colors';
import {userStore} from '@/src/store/userStore';
import {expenseDetailsSheetStore} from '@/src/store/expenseDetailsSheetStore';
import {Transaction} from '../types/dashboard';
import {formatCurrency} from '../utils/dashboard.utils';

interface TransactionItemProps {
    transaction: Transaction & {
        iconType?: 'material' | 'fontawesome' | 'feather';
        iconName?: string;
        iconColor?: string;
    };
    isLast?: boolean;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({transaction, isLast = false}) => {
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const userCurrency = userStore((s) => s.user?.currency);

    const renderIcon = () => {
        const iconColor = transaction.iconColor ?? colors.icon.primary;

        if (transaction.icon?.url || transaction.icon?.id) {
            return (
                <AppImageV2
                    id={transaction.icon.id}
                    url={transaction.icon.url}
                    contentFit="contain"
                    style={{width: '70%', height: '70%'}}
                    fallbackComponent={
                        <EntityFallbackIcon kind="expense" size={18} color={iconColor} />
                    }
                />
            );
        }

        switch (transaction.iconType) {
            case 'material':
                return (
                    <MaterialCommunityIcons
                        name={transaction.iconName as any}
                        size={20}
                        color={iconColor}
                    />
                );
            case 'fontawesome':
                return (
                    <FontAwesome5
                        name={transaction.iconName as any}
                        size={18}
                        color={iconColor}
                    />
                );
            case 'feather':
                return (
                    <Feather
                        name={(transaction.iconName as any) || 'credit-card'}
                        size={18}
                        color={iconColor}
                    />
                );
            default:
                return <EntityFallbackIcon kind="expense" size={18} color={iconColor} />;
        }
    };

    const isExpense = transaction.type === 'expense';
    const formattedAmount = `${isExpense ? '-' : '+'}${formatCurrency(
        Math.abs(transaction.amount),
        userCurrency
    )}`;

    const openExpense = () => {
        const id = Number(transaction.id);
        if (Number.isNaN(id)) return;
        expenseDetailsSheetStore.getState().open(id);
    };

    return (
        <Pressable
            onPress={openExpense}
            accessibilityRole="button"
            accessibilityLabel={`Open expense ${transaction.title}`}
            className={`flex-row items-center justify-between py-2 active:opacity-80 ${
                !isLast ? 'border-b border-border-input' : ''
            }`}
        >
            <View className="flex-row items-center">
                <View
                    className={`mr-3 h-10 w-10 items-center justify-center rounded-2xl border ${transaction.iconBgColor} ${transaction.iconBorderColor}`}
                >
                    {renderIcon()}
                </View>
                <View className="justify-center">
                    <AppText variant="body-base" className="font-semibold text-text-primary">
                        {transaction.title}
                    </AppText>
                    <AppText
                        variant="caption-xs"
                        className="mt-0.5 text-text-primary-lighter"
                    >
                        {transaction.timeLabel}
                    </AppText>
                </View>
            </View>
            <AppText
                variant="body-base"
                className={`font-bold ${isExpense ? 'text-red-decrease' : 'text-green-increase'}`}
            >
                {formattedAmount}
            </AppText>
        </Pressable>
    );
};
