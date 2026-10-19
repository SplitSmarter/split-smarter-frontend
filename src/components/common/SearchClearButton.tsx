import React from 'react';
import {Pressable} from 'react-native';
import {Iconify} from 'react-native-iconify';

type SearchClearButtonProps = {
    value: string;
    onClear: () => void;
    color: string;
    size?: number;
};

/** Right-side clear control for search fields — only renders when value is non-empty. */
export function SearchClearButton({
    value,
    onClear,
    color,
    size = 20,
}: SearchClearButtonProps) {
    if (!value.trim()) return null;

    return (
        <Pressable
            onPress={onClear}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            className="active:opacity-70"
        >
            <Iconify icon="heroicons:x-mark" size={size} color={color} />
        </Pressable>
    );
}
