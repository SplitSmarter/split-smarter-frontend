import React from 'react';
import {View} from 'react-native';
import {AppText} from '@/src/components/common/AppText';
import type {ExpenseLineItemDetail} from '@/src/api/dto/expense/expense';
import {formatExpenseMoney} from '../utils/formatExpenseMoney';

interface ExpenseLineItemsSectionProps {
    items: ExpenseLineItemDetail[];
    itemTitles: Record<number, string>;
}

export function ExpenseLineItemsSection({
    items,
    itemTitles,
}: ExpenseLineItemsSectionProps) {
    if (!items.length) return null;

    return (
        <View>
            <AppText
                variant="caption-xs"
                className="mb-2 px-0.5 font-semibold uppercase tracking-[1.2px] text-text-primary-lighter"
            >
                Line items
            </AppText>
            <View className="overflow-hidden rounded-[28px] border border-border-input bg-bg-canvas">
                {items.map((item, index) => {
                    const title =
                        itemTitles[item.expense_item_id] ??
                        `Item #${item.expense_item_id}`;
                    const qty = item.quantity ?? 1;
                    const unit = item.unit_price;
                    const meta =
                        unit != null
                            ? `${qty} × ${formatExpenseMoney(unit, item.currency)}`
                            : `Qty ${qty}`;
                    const isLast = index === items.length - 1;
                    return (
                        <View
                            key={`li-${item.expense_item_id}-${index}`}
                            className={`px-4 py-3 ${
                                isLast ? '' : 'border-b border-border-input'
                            }`}
                        >
                            <View className="flex-row items-start justify-between gap-3">
                                <View className="min-w-0 flex-1">
                                    <AppText
                                        variant="body-base"
                                        className="font-semibold text-text-primary"
                                        numberOfLines={2}
                                    >
                                        {title}
                                    </AppText>
                                    <AppText
                                        variant="caption-xs"
                                        className="mt-0.5 text-text-primary-lighter"
                                    >
                                        {meta}
                                        {item.is_shared_by_everyone
                                            ? ' · Shared by everyone'
                                            : item.shared_between.length
                                              ? ` · ${item.shared_between.length} sharers`
                                              : ''}
                                    </AppText>
                                </View>
                                <AppText
                                    variant="body-base"
                                    className="font-bold text-text-primary"
                                >
                                    {formatExpenseMoney(
                                        item.total_amount,
                                        item.currency
                                    )}
                                </AppText>
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}
