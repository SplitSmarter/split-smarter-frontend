import React from 'react';
import {View} from 'react-native';
import {AppText} from '@/src/components/common/AppText';
import type {BasicUserDetails} from '@/src/api/dto/user/user';

interface ExpenseAuditFooterProps {
    createdBy: BasicUserDetails;
    createdAt: string;
    updatedAt: string;
}

export function ExpenseAuditFooter({
    createdBy,
    createdAt,
    updatedAt,
}: ExpenseAuditFooterProps) {
    return (
        <View className="px-0.5 pb-2">
            <AppText variant="caption-xs" className="text-text-primary-lighter">
                Created by {createdBy.name}
                {createdAt ? ` · ${String(createdAt).slice(0, 10)}` : ''}
            </AppText>
            {updatedAt ? (
                <AppText
                    variant="caption-xs"
                    className="mt-0.5 text-text-primary-lighter"
                >
                    Updated {String(updatedAt).slice(0, 10)}
                </AppText>
            ) : null}
        </View>
    );
}
