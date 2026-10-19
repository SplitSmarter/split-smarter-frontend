import React from 'react';
import {Pressable} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {useRouter} from 'expo-router';

type AddMerchantHeaderButtonProps = {
    onClose: () => void;
    iconColor: string;
    backgroundColor: string;
};

/** Header “add merchant” control — closes host then opens create merchant. */
export function AddMerchantHeaderButton({
    onClose,
    iconColor,
    backgroundColor,
}: AddMerchantHeaderButtonProps) {
    const router = useRouter();

    return (
        <Pressable
            onPress={() => {
                onClose();
                setTimeout(() => {
                    router.push('/(authenticated)/expense/merchant/add');
                }, 200);
            }}
            accessibilityRole="button"
            accessibilityLabel="Add merchant"
            hitSlop={8}
            className="h-10 w-10 items-center justify-center rounded-full active:opacity-70"
            style={{backgroundColor}}
        >
            <Iconify
                icon="heroicons:building-storefront"
                size={20}
                color={iconColor}
            />
        </Pressable>
    );
}
