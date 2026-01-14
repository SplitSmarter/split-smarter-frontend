// components/LanguageDropdown.tsx
import React, {useMemo} from "react";
import RNPickerSelect from "react-native-picker-select";
import { View, StyleSheet } from "react-native";
import {languages} from "@/src/constants/language";
import {LanguageTag} from "@/src/types/language";
import {useI18n} from "@/src/context/i18nContext";

const LanguageDropdown = () => {
    const { language, changeLanguage, isLoaded } = useI18n();
    const options = Object.keys(languages).map(item => ({
        label: item,
        value: item,
    }));

    const selectedLabel = Object.keys(languages).find(item => languages[item as keyof typeof languages] === language);

    const handleLanguageSelect = (selectedName: string) => {
        if (selectedName in languages) {
            const langCode = languages[selectedName as keyof typeof languages];
            changeLanguage(langCode as LanguageTag);
        }
    };

    return (
        <View style={styles.container}>
            <RNPickerSelect
                onValueChange={handleLanguageSelect}
                value={selectedLabel}
                items={options}
                style={pickerSelectStyles}
                placeholder={{ label: selectedLabel, value: null }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 12,
    },
});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        color: "black",
        paddingRight: 30,
    },
    inputAndroid: {
        fontSize: 16,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        color: "black",
        paddingRight: 30,
    },
});

export default LanguageDropdown;
