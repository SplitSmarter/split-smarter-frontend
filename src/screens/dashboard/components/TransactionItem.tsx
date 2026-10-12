import React from 'react';
import { View } from 'react-native';
import { MaterialCommunityIcons, FontAwesome5, Feather } from '@expo/vector-icons';
import { AppText } from "@/src/components/common/AppText";
import { AppImageV2 } from "@/src/components/common/AppImageV2";
import { themeStore } from '@/src/store/themeStore';
import { COLORS } from '@/src/constants/colors';
import {userStore} from '@/src/store/userStore';
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

export const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, isLast = false }) => {
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;
    const userCurrency = userStore((s) => s.user?.currency);

    const renderIcon = () => {
        if (transaction.icon?.url) {
            return (
                <AppImageV2
                    id={transaction.icon.id}
                    url={transaction.icon.url}
                    contentFit="contain"
                    style={{ width: '70%', height: '70%' }}
                />
            );
        }

        switch (transaction.iconType) {
            case 'material':
                return (
                    <MaterialCommunityIcons
                        name={transaction.iconName as any}
                        size={20}
                        color={transaction.iconColor ?? colors.icon.primary}
                    />
                );
            case 'fontawesome':
                return (
                    <FontAwesome5
                        name={transaction.iconName as any}
                        size={18}
                        color={transaction.iconColor ?? colors.icon.primary}
                    />
                );
            case 'feather':
            default:
                return (
                    <Feather
                        name={(transaction.iconName as any) || 'credit-card'}
                        size={18}
                        color={transaction.iconColor ?? colors.icon.primary}
                    />
                );
        }
    };

    const isExpense = transaction.type === 'expense';
    const amountColor = isExpense ? colors.status.decrease : colors.status.success;
    const formattedAmount = `${isExpense ? '-' : '+'}${formatCurrency(
        Math.abs(transaction.amount),
        userCurrency
    )}`;

    return (
        <View
            className={`flex-row items-center justify-between py-2 ${!isLast ? 'border-b' : ''}`}
            style={!isLast ? { borderBottomColor: colors.status.border } : undefined}
        >
            <View className="flex-row items-center">
                <View
                    className={`w-10 h-10 rounded-2xl ${transaction.iconBgColor} border ${transaction.iconBorderColor} items-center justify-center mr-3`}
                >
                    {renderIcon()}
                </View>
                <View className="justify-center">
                    <AppText
                        variant="body-base"
                        className="font-semibold"
                        style={{ color: colors.text.primary }}
                    >
                        {transaction.title}
                    </AppText>
                    <AppText
                        variant="caption-xs"
                        className="mt-0.5"
                        style={{ color: colors.text.lighter }}
                    >
                        {transaction.timeLabel}
                    </AppText>
                </View>
            </View>
            <AppText
                variant="body-base"
                className="font-bold"
                style={{ color: amountColor }}
            >
                {formattedAmount}
            </AppText>
        </View>
    );
};
