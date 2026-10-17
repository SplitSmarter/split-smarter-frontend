import React from 'react';
import {View, Pressable, ScrollView} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {AppText} from '@/src/components/common/AppText';
import {AppImageV2} from '@/src/components/common/AppImageV2';
import {EntityFallbackIcon} from '@/src/components/common/EntityFallbackIcon';
import type {BasicImage} from '@/src/api/dto/user/asset';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';

type ExpenseProofSectionProps = {
    assets: BasicImage[];
    showLinkPayment?: boolean;
    onLinkPayment?: () => void;
};

export function ExpenseProofSection({
    assets,
    showLinkPayment,
    onLinkPayment,
}: ExpenseProofSectionProps) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    if (!assets.length && !showLinkPayment) return null;

    return (
        <View>
            <View className="mb-3 flex-row items-center justify-between">
                <AppText
                    variant="h4"
                    className="font-bold"
                    style={{color: colors.text.primary}}
                >
                    Proof & Attachments
                </AppText>
                <AppText
                    variant="body-small"
                    className="font-semibold"
                    style={{color: colors.text.lighter}}
                >
                    {assets.length} Attachment{assets.length === 1 ? '' : 's'}
                </AppText>
            </View>

            <View
                className="gap-y-3 rounded-3xl border p-4"
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
                {assets.length > 0 ? (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{gap: 10}}
                    >
                        {assets.map((asset) => (
                            <View
                                key={asset.id}
                                className="h-28 w-28 overflow-hidden rounded-2xl border"
                                style={{
                                    backgroundColor: colors.bg.darker,
                                    borderColor: colors.status.border,
                                }}
                            >
                                <AppImageV2
                                    id={asset.id}
                                    url={asset.url}
                                    style={{width: '100%', height: '100%'}}
                                    contentFit="cover"
                                    fallbackComponent={
                                        <View className="flex-1 items-center justify-center">
                                            <EntityFallbackIcon
                                                kind="placePhoto"
                                                size={28}
                                                color={colors.icon.lighter}
                                            />
                                        </View>
                                    }
                                />
                            </View>
                        ))}
                    </ScrollView>
                ) : null}

                {showLinkPayment && onLinkPayment ? (
                    <Pressable
                        onPress={onLinkPayment}
                        className="w-full flex-row items-center justify-center gap-1.5 rounded-2xl border py-3 active:opacity-80"
                        style={{
                            backgroundColor: colors.bg.primary,
                            borderColor: colors.status.border,
                        }}
                    >
                        <Iconify
                            icon="heroicons:plus-circle"
                            size={16}
                            color={colors.accent.sky}
                        />
                        <AppText
                            variant="caption-xs"
                            className="font-semibold"
                            style={{color: colors.text.primary}}
                        >
                            Link Payment Record to Payer Cover
                        </AppText>
                    </Pressable>
                ) : null}
            </View>
        </View>
    );
}
