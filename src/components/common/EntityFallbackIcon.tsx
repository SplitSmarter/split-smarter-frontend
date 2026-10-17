import React from 'react';
import {Iconify} from 'react-native-iconify';

/**
 * Entity-specific Iconify used as AppImage `fallbackIcon` /
 * AppImageV2 `fallbackComponent` when the caller knows the entity kind.
 * When nothing is passed, AppImage / AppImageV2 still use built-in `heroicons:photo`.
 *
 * Icon names must stay string literals (Iconify babel transform).
 */
export type EntityImageKind =
    | 'user'
    | 'group'
    | 'groupCategory'
    | 'expenseCategory'
    | 'expenseItem'
    | 'expense'
    | 'transfer'
    | 'merchant'
    | 'place'
    | 'placePhoto'
    | 'memory'
    | 'relationship'
    | 'paymentProvider'
    | 'paymentCategory'
    | 'currencyFlag'
    | 'attachment';

interface EntityFallbackIconProps {
    kind: EntityImageKind;
    size?: number;
    color: string;
}

export function EntityFallbackIcon({
    kind,
    size = 24,
    color,
}: EntityFallbackIconProps) {
    switch (kind) {
        case 'user':
            return <Iconify icon="heroicons:user-solid" size={size} color={color} />;
        case 'group':
            return (
                <Iconify icon="heroicons:user-group-solid" size={size} color={color} />
            );
        case 'groupCategory':
            return <Iconify icon="heroicons:folder" size={size} color={color} />;
        case 'expenseCategory':
            return <Iconify icon="heroicons:tag" size={size} color={color} />;
        case 'expenseItem':
            return <Iconify icon="heroicons:shopping-cart" size={size} color={color} />;
        case 'expense':
            return (
                <Iconify icon="heroicons:receipt-percent" size={size} color={color} />
            );
        case 'transfer':
            return (
                <Iconify icon="heroicons:arrows-right-left" size={size} color={color} />
            );
        case 'merchant':
            return (
                <Iconify
                    icon="heroicons:building-storefront"
                    size={size}
                    color={color}
                />
            );
        case 'place':
            return <Iconify icon="heroicons:map-pin" size={size} color={color} />;
        case 'placePhoto':
            return <Iconify icon="heroicons:photo" size={size} color={color} />;
        case 'memory':
            return <Iconify icon="heroicons:sparkles" size={size} color={color} />;
        case 'relationship':
            return <Iconify icon="heroicons:heart" size={size} color={color} />;
        case 'paymentProvider':
            return <Iconify icon="heroicons:credit-card" size={size} color={color} />;
        case 'paymentCategory':
            return <Iconify icon="heroicons:wallet" size={size} color={color} />;
        case 'currencyFlag':
            return <Iconify icon="heroicons:flag" size={size} color={color} />;
        case 'attachment':
            return <Iconify icon="heroicons:paper-clip" size={size} color={color} />;
    }
}
