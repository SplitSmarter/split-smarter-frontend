import React, {useState, useEffect} from 'react';
import {TextInput, Keyboard} from 'react-native';

interface DebouncedNumberInputProps {
    value: number;
    onChangeValue: (val: number) => void;
    min?: number;
}

export const DebouncedNumberInput = React.memo(
    ({value, onChangeValue, min = 1}: DebouncedNumberInputProps) => {
        const [text, setText] = useState<string>(String(value));

        useEffect(() => {
            setText(String(value));
        }, [value]);

        const handleTextChange = (raw: string) => {
            const cleaned = raw.replace(/[^0-9]/g, '');
            setText(cleaned);
        };

        const handleCommit = () => {
            Keyboard.dismiss();
            const parsed = parseInt(text, 10);

            if (isNaN(parsed) || parsed < min) {
                setText(String(min));
                onChangeValue(min);
            } else {
                setText(String(parsed));
                onChangeValue(parsed);
            }
        };

        return (
            <TextInput
                className="px-[10px] py-1 rounded-[10px] border min-w-[44px] text-center text-sm font-semibold bg-bg-primary-lighter text-text-primary border-border-input dark:border-white/10"
                keyboardType="number-pad"
                value={text}
                onChangeText={handleTextChange}
                onBlur={handleCommit}
                onSubmitEditing={handleCommit}
                returnKeyType="done"
            />
        );
    }
);

DebouncedNumberInput.displayName = 'DebouncedNumberInput';

interface DebouncedDateInputProps {
    value: string;
    onChangeValue: (val: string) => void;
    placeholder?: string;
}

export const DebouncedDateInput = React.memo(
    ({value, onChangeValue, placeholder}: DebouncedDateInputProps) => {
        const [text, setText] = useState<string>(value);

        useEffect(() => {
            setText(value);
        }, [value]);

        const handleCommit = () => {
            Keyboard.dismiss();
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

            if (!dateRegex.test(text)) {
                setText(value);
            } else {
                onChangeValue(text);
            }
        };

        return (
            <TextInput
                className="px-3 py-1 rounded-[10px] border w-[110px] text-center text-[13px] font-semibold bg-bg-primary-lighter text-text-primary border-border-input dark:border-white/10 placeholder:text-text-primary-placeholder"
                value={text}
                onChangeText={setText}
                onBlur={handleCommit}
                onSubmitEditing={handleCommit}
                placeholder={placeholder}
                returnKeyType="done"
            />
        );
    }
);

DebouncedDateInput.displayName = 'DebouncedDateInput';