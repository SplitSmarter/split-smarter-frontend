import React, {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';
import {View} from 'react-native';
import {BottomSheetTextInput} from '@gorhom/bottom-sheet';

export type DroppedPinTitleFieldHandle = {
    /**
     * Flush typing. Returns typed title, or `defaultTitle` when empty.
     * Does not fill the input with the default — field stays empty if blank.
     */
    commit: () => string;
};

type DroppedPinTitleFieldProps = {
    /** Shown as placeholder; also used when saving with an empty field. */
    defaultTitle: string;
    /** Reset signal — when this key changes, clear the field (e.g. sheet open). */
    resetKey: string;
    editable: boolean;
    placeholderColor: string;
    textColor: string;
    onCommit: (title: string) => void;
    onFocusChange?: (focused: boolean) => void;
};

/**
 * Owns typing state locally so keystrokes do not re-render the parent sheet.
 * Starts empty; empty save uses `defaultTitle`.
 */
export const DroppedPinTitleField = forwardRef<
    DroppedPinTitleFieldHandle,
    DroppedPinTitleFieldProps
>(function DroppedPinTitleField(
    {
        defaultTitle,
        resetKey,
        editable,
        placeholderColor,
        textColor,
        onCommit,
        onFocusChange,
    },
    ref
) {
    const [value, setValue] = useState('');
    const focusedRef = useRef(false);
    const valueRef = useRef(value);
    valueRef.current = value;
    const defaultTitleRef = useRef(defaultTitle);
    defaultTitleRef.current = defaultTitle;
    const onCommitRef = useRef(onCommit);
    onCommitRef.current = onCommit;

    useEffect(() => {
        setValue('');
        valueRef.current = '';
        focusedRef.current = false;
        onCommitRef.current('');
    }, [resetKey]);

    const commit = () => {
        const typed = valueRef.current.trim();
        onCommitRef.current(typed);
        return typed || defaultTitleRef.current.trim() || 'Dropped pin';
    };

    useImperativeHandle(ref, () => ({commit}), []);

    return (
        <View>
            <BottomSheetTextInput
                value={value}
                onChangeText={setValue}
                onFocus={() => {
                    focusedRef.current = true;
                    onFocusChange?.(true);
                }}
                onBlur={() => {
                    focusedRef.current = false;
                    onFocusChange?.(false);
                    // Persist typed value (may be empty); do not inject default into the field.
                    onCommitRef.current(valueRef.current.trim());
                }}
                onSubmitEditing={() => {
                    commit();
                }}
                returnKeyType="done"
                placeholder={defaultTitle || 'Name this location'}
                placeholderTextColor={placeholderColor}
                editable={editable}
                className="rounded-2xl border border-border-input bg-bg-canvas px-4 py-3 text-base font-semibold text-text-primary"
                style={{color: textColor}}
            />
        </View>
    );
});
