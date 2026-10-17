import React, {useState} from 'react';
import {View, Pressable} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import type {ExpenseLineItemDetail} from '@/src/api/dto/expense/expense';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';
import {formatExpenseMoney} from '@/src/screens/expense/details/utils/formatExpenseMoney';

type ExpenseLineItemsAccordionProps = {
    items: ExpenseLineItemDetail[];
    itemTitles: Record<number, string>;
};

export function ExpenseLineItemsAccordion({
    items,
    itemTitles,
}: ExpenseLineItemsAccordionProps) {
    const [open, setOpen] = useState(false);
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    if (!items.length) return null;

    return (
        <View
            className="overflow-hidden rounded-3xl border"
            style={{
                backgroundColor: colors.bg.lighter,
                borderColor: colors.status.border,
                shadowColor: COLORS.light.brand.primary,
                shadowOpacity: isDark ? 0.35 : 0.08,
                shadowRadius: 12,
                shadowOffset: {width: 0, height: 4},
                elevation: 3,
            }}
        >
            <Pressable
                onPress={() => setOpen((v) => !v)}
                className="flex-row items-center justify-between px-4 py-3.5"
            >
                <View className="min-w-0 flex-1 flex-row items-center gap-2 pr-2">
                    <Iconify
                        icon="heroicons:queue-list"
                        size={16}
                        color={colors.accent.orbIndigo}
                    />
                    <AppText
                        variant="body-small"
                        className="font-bold"
                        style={{color: colors.text.primary}}
                    >
                        Line Items
                    </AppText>
                    <View
                        className="rounded-full px-2 py-0.5"
                        style={{backgroundColor: colors.bg.primary}}
                    >
                        <AppText
                            variant="caption-xs"
                            style={{color: colors.text.lighter}}
                        >
                            {items.length}
                        </AppText>
                    </View>
                </View>
                {open ? (
                    <Iconify
                        icon="heroicons:chevron-up"
                        size={16}
                        color={colors.icon.lighter}
                    />
                ) : (
                    <Iconify
                        icon="heroicons:chevron-down"
                        size={16}
                        color={colors.icon.lighter}
                    />
                )}
            </Pressable>

            {open ? (
                <View
                    className="gap-y-2 border-t px-4 pb-4 pt-3"
                    style={{borderTopColor: colors.status.border}}
                >
                    {items.map((item, index) => {
                        const title =
                            itemTitles[item.expense_item_id] ??
                            `Item #${item.expense_item_id}`;
                        const sharedNames = item.is_shared_by_everyone
                            ? 'Everyone'
                            : (item.shared_between ?? [])
                                  .map((u) => u.name)
                                  .filter(Boolean)
                                  .join(', ') || '—';
                        return (
                            <View
                                key={`li-${item.expense_item_id}-${index}`}
                                className="flex-row items-center justify-between rounded-2xl border p-3"
                                style={{
                                    backgroundColor: colors.bg.primary,
                                    borderColor: colors.status.border,
                                }}
                            >
                                <View className="min-w-0 flex-1 pr-2">
                                    <AppText
                                        variant="body-small"
                                        className="font-semibold"
                                        style={{color: colors.text.primary}}
                                        numberOfLines={2}
                                    >
                                        {title}
                                    </AppText>
                                    <AppText
                                        variant="caption-xs"
                                        className="mt-0.5"
                                        style={{color: colors.text.lighter}}
                                        numberOfLines={2}
                                    >
                                        Shared by: {sharedNames}
                                    </AppText>
                                </View>
                                <AppText
                                    variant="body-small"
                                    className="font-bold"
                                    style={{color: colors.text.primary}}
                                >
                                    {formatExpenseMoney(
                                        item.total_amount ??
                                            (item.unit_price != null
                                                ? item.unit_price * (item.quantity ?? 1)
                                                : null),
                                        item.currency,
                                    )}
                                </AppText>
                            </View>
                        );
                    })}
                </View>
            ) : null}
        </View>
    );
}
