import React, { useState } from "react";
import { View, TouchableOpacity } from "react-native";
import AccordionItem from "@/src/components/common/accordionItem";
import ExpenseDetailsSection from "@/src/components/expense/ExpenseDetailsSection";
import ExpenseComponentsSection from "@/src/components/expense/ExpenseComponentSection";
import ExpenseDistributionSection from "@/src/components/expense/ExpenseDistributionSection";
import CustomText from "@/src/components/common/CustomText";
import { useI18n } from "@/src/context/i18nContext";
import { useTheme } from "@/src/context/themeContext";
import { AddExpenseForm } from "@/src/interfaces/expense";
import {ExpenseComponentType, CurrencyType} from "@/src/constants/expense";
import { useTranslation } from "react-i18next";

const ExpenseForm = () => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const [form, setForm] = useState<AddExpenseForm>({
        name: "",
        expense_type: ExpenseComponentType.item,
        description: "",
        paid_by_users: [],
        category_id: 0,
        currency: CurrencyType.inr,
        dated: new Date().toISOString(),
        contributors: [],
        components: [],
    });

    const updateForm = (key: keyof AddExpenseForm, value: any) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = () => {
        console.log("Submitting:", form);
    };

    return (
        <View className={`flex-1 p-4 ${isDark ? "bg-black" : "bg-white"}`}>
            <ExpenseDetailsSection form={form} updateForm={updateForm} />
            <AccordionItem title={t("expense.add.components") ?? "Components"}>
                <ExpenseComponentsSection form={form} updateForm={updateForm} />
            </AccordionItem>

            <AccordionItem title={t("expense.add.distribution") ?? "Distribution"}>
                <ExpenseDistributionSection form={form} updateForm={updateForm} />
            </AccordionItem>

            <TouchableOpacity
                className="bg-blue-600 mt-4 py-3 rounded-lg items-center"
                onPress={handleSubmit}
            >
                <CustomText className="text-white font-semibold">
                    {t("common.submit") ?? "Submit"}
                </CustomText>
            </TouchableOpacity>
        </View>
    );
};

export default ExpenseForm;
