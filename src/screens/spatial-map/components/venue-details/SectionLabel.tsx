import React from 'react';
import {View} from 'react-native';
import {AppText} from '@/src/components/common/AppText';

interface SectionLabelProps {
    children: string;
    trailing?: React.ReactNode;
    icon?: React.ReactNode;
}

export function SectionLabel({children, trailing, icon}: SectionLabelProps) {
    return (
        <View className="mb-3 flex-row items-center justify-between px-0.5">
            <View className="flex-row items-center gap-x-2">
                {icon}
                <AppText
                    variant="caption-xs"
                    className="font-semibold uppercase tracking-[1.2px] text-text-primary-lighter"
                >
                    {children}
                </AppText>
            </View>
            {trailing}
        </View>
    );
}
