import React from 'react';
import {Pressable, View} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {AppImageV2} from '@/src/components/common/AppImageV2';
import {EntityFallbackIcon, EntityImageKind} from '@/src/components/common/EntityFallbackIcon';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';
import {BudgetScopeEntity} from '../types';

type Props = {
    items: BudgetScopeEntity[];
    kind: EntityImageKind;
    onRemove: (id: number) => void;
};

export function ScopeEntityChips({items, kind, onRemove}: Props) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    if (items.length === 0) return null;

    return (
        <View className="mt-3 flex-row flex-wrap gap-2">
            {items.map((item) => (
                <View
                    key={item.id}
                    className="flex-row items-center gap-2 rounded-full border border-border-input bg-bg-primary px-2.5 py-1.5"
                >
                    <View className="h-6 w-6 overflow-hidden rounded-full">
                        <AppImageV2
                            id={item.iconId ?? `budget-scope-${item.id}`}
                            url={item.iconUrl}
                            contentFit="cover"
                            style={{width: '100%', height: '100%'}}
                            fallbackComponent={
                                <EntityFallbackIcon
                                    kind={kind}
                                    size={14}
                                    color={colors.icon.lighter}
                                />
                            }
                        />
                    </View>
                    <View className="max-w-[140px]">
                        <AppText
                            variant="caption-xs"
                            className="font-semibold text-text-primary"
                            numberOfLines={1}
                        >
                            {item.name}
                        </AppText>
                        {item.coversDescendants ? (
                            <AppText
                                variant="caption-xs"
                                className="text-text-primary-lighter"
                                numberOfLines={1}
                            >
                                All under this
                            </AppText>
                        ) : null}
                    </View>
                    <Pressable
                        onPress={() => onRemove(item.id)}
                        hitSlop={8}
                        className="active:opacity-60"
                    >
                        <Iconify
                            icon="heroicons:x-mark"
                            size={14}
                            color={colors.icon.lighter}
                        />
                    </Pressable>
                </View>
            ))}
        </View>
    );
}
