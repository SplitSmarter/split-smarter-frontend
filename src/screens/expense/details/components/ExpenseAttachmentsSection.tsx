import React from 'react';
import {ScrollView, View} from 'react-native';
import {AppText} from '@/src/components/common/AppText';
import {AppImageV2} from '@/src/components/common/AppImageV2';
import {EntityFallbackIcon} from '@/src/components/common/EntityFallbackIcon';
import type {BasicImage} from '@/src/api/dto/user/asset';
import {COLORS} from '@/src/constants/colors';
import {themeStore} from '@/src/store/themeStore';

interface ExpenseAttachmentsSectionProps {
    assets: BasicImage[];
}

export function ExpenseAttachmentsSection({assets}: ExpenseAttachmentsSectionProps) {
    const isDark = themeStore((s) => s.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    if (!assets.length) return null;

    return (
        <View>
            <AppText
                variant="caption-xs"
                className="mb-2 px-0.5 font-semibold uppercase tracking-[1.2px] text-text-primary-lighter"
            >
                Attachments
            </AppText>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{gap: 10}}
            >
                {assets.map((asset) => (
                    <View
                        key={asset.id}
                        className="h-28 w-28 overflow-hidden rounded-2xl border border-border-input bg-bg-primary-darker"
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
        </View>
    );
}
