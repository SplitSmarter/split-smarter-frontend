// ExpenseDetailsSection.tsx
import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import CustomText from "@/src/components/common/CustomText";
import { AddExpenseForm } from "@/src/interfaces/expense";
import { useTranslation } from "react-i18next";

interface Props {
    form: AddExpenseForm;
    updateForm: (key: keyof AddExpenseForm, value: any) => void;
}

const ExpenseDetailsSection = ({ form, updateForm }: Props) => {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [pickerMode, setPickerMode] = useState<"date" | "time">("date");
    const [advancedOpen, setAdvancedOpen] = useState(false);
    const { t } = useTranslation();

    const onDateChange = (_event: any, selectedValue?: Date) => {
        if (Platform.OS === "android") setShowDatePicker(false);

        if (selectedValue) {
            if (pickerMode === "date") {
                // Save selected date and open time picker
                updateForm("dated", selectedValue.toISOString());
                setPickerMode("time");
                setShowDatePicker(true); // Show time picker next
            } else {
                // Merge time with existing date
                const existingDate = form.dated ? new Date(form.dated) : new Date();
                const updatedDateTime = new Date(existingDate);

                updatedDateTime.setHours(selectedValue.getHours());
                updatedDateTime.setMinutes(selectedValue.getMinutes());

                updateForm("dated", updatedDateTime.toISOString());
                setPickerMode("date"); // Reset mode
            }
        } else {
            setPickerMode("date"); // Cancelled
        }
    };


    return (
        <View className="py-2">
            <TextInput
                placeholder={t("expense.add.input.title")}
                className="border-b border-gray-300 px-3 py-2 mb-3 rounded"
                value={form.name}
                onChangeText={(text) => updateForm("name", text)}
            />

            <TouchableOpacity
                onPress={() => {
                    setPickerMode("date");
                    setShowDatePicker(true);
                }}
                className="border-b border-gray-300 px-3 py-2 mb-3 rounded"
            >
                <CustomText>{
                    form.dated ? new Date(form.dated).toDateString() : t("expense.selectDate")
                }</CustomText>
            </TouchableOpacity>

            {showDatePicker && (
                <DateTimePicker
                    value={form.dated ? new Date(form.dated) : new Date()}
                    mode={pickerMode}
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
                        ? t("expense.add.hideAdvanced")
                        : t("expense.add.showAdvanced")}
                </CustomText>
            </TouchableOpacity>

            {advancedOpen && (
                <>
                    <TextInput
                        placeholder={t("expense.add.input.description")}
                        className="border-b border-gray-300 px-3 py-2 mb-3 rounded"
                        value={form.description}
                        onChangeText={(text) => updateForm("description", text)}
                    />
                    <TextInput
                        placeholder={t("expense.add.input.group")}
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
