import React from 'react';
import {View} from 'react-native';
import {AppText} from '@/src/components/common/AppText';
import type {PaymentLinkSummary} from '@/src/api/dto/expense/expense';
import {formatExpenseMoney} from '../utils/formatExpenseMoney';

interface ExpensePaymentLinksSectionProps {
    links: PaymentLinkSummary[];
}

export function ExpensePaymentLinksSection({
    links,
}: ExpensePaymentLinksSectionProps) {
    if (!links.length) return null;

    return (
        <View>
            <AppText
                variant="caption-xs"
                className="mb-2 px-0.5 font-semibold uppercase tracking-[1.2px] text-text-primary-lighter"
            >
                Payment links
            </AppText>
            <View className="overflow-hidden rounded-[28px] border border-border-input bg-bg-canvas">
                {links.map((link, i) => (
                    <View
                        key={link.id}
                        className={`flex-row items-center justify-between px-4 py-3 ${
                            i === links.length - 1 ? '' : 'border-b border-border-input'
                        }`}
                    >
                        <View className="min-w-0 flex-1 pr-3">
                            <AppText
                                variant="body-base"
                                className="font-semibold text-text-primary"
                            >
                                Linked transfer #{link.transfer_id}
                            </AppText>
                            <AppText
                                variant="caption-xs"
                                className="mt-0.5 text-text-primary-lighter"
                            >
                                Covered
                            </AppText>
                        </View>
                        <AppText
                            variant="body-base"
                            className="font-bold text-green-increase"
                        >
                            {formatExpenseMoney(
                                link.covered_amount,
                                link.transfer_currency
                            )}
                        </AppText>
                    </View>
                ))}
            </View>
        </View>
    );
}
