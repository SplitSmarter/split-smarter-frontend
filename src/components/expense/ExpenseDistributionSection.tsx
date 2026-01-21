// ExpenseDetailsSection.tsx
import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import CustomText from "@/src/components/common/CustomText";
import AccordionItem from "@/src/components/common/accordionItem";
import { AddExpenseForm } from "@/src/interfaces/expense";
import { useTranslation } from "react-i18next";
import {useDeviceStore} from "@/src/store/deviceStore";

interface Props {
    form: AddExpenseForm;
    updateForm: (key: keyof AddExpenseForm, value: any) => void;
}

const ExpenseDetailsSection = ({ form, updateForm }: Props) => {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [advancedOpen, setAdvancedOpen] = useState(false);
    const { t } = useTranslation();
    const platform = useDeviceStore((state) => state.platform);

    const onDateChange = (_event: any, selectedDate?: Date) => {
        setShowDatePicker(platform === "ios");
        if (selectedDate) {
            updateForm("dated", selectedDate.toISOString());
        }
    };

    return (
        <View className="py-2">
            <TextInput
                placeholder={t("expense.title")}
                className="border-b border-gray-300 px-3 py-2 mb-3 rounded"
                value={form.name}
                onChangeText={(text) => updateForm("name", text)}
            />

            <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className="border-b border-gray-300 px-3 py-2 mb-3 rounded"
            >
                <CustomText>{
                    form.dated ? new Date(form.dated).toDateString() : t("expense.selectDate")
                }</CustomText>
            </TouchableOpacity>

            {showDatePicker && (
                <DateTimePicker
                    value={form.dated ? new Date(form.dated) : new Date()}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                />
            )}

            <TouchableOpacity
                className="mt-2 self-end"
                onPress={() => setAdvancedOpen(!advancedOpen)}
            >
                <CustomText className="text-blue-600 font-medium">
                    {advancedOpen
                        ? t("expense.hideAdvanced")
                        : t("expense.showAdvanced")}
                </CustomText>
            </TouchableOpacity>

            {advancedOpen && (
                <>
                    <TextInput
                        placeholder={t("expense.description")}
                        className="border-b border-gray-300 px-3 py-2 mb-3 rounded"
                        value={form.description}
                        onChangeText={(text) => updateForm("description", text)}
                    />
                    <TextInput
                        placeholder={t("expense.group")}
                        className="border-b border-gray-300 px-3 py-2 mb-3 rounded"
                        value={form.group_id?.toString() || ""}
                        onChangeText={(text) => updateForm("group_id", parseInt(text) || undefined)}
                        keyboardType="numeric"
                    />
                </>
            )}
        </View>
    );
};

export default ExpenseDetailsSection;
