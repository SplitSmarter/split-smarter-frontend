import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import CustomText from "@/src/components/common/CustomText";
import { getExpenseCategoryByIdApi } from "@/src/api/expense/categories";
import { ExpenseCategory } from "@/src/interfaces/expense";
import { useThemeStore } from "@/src/store/useThemeStore";
import { useLocalSearchParams } from "expo-router";
import CustomIcon from "@/src/components/common/CustomIcon";

const ExpenseCategoryDetailsScreen = () => {
    const { t } = useTranslation();
    const { theme } = useThemeStore();
    const isDark = theme === "dark";

    const { categoryId } = useLocalSearchParams();

    const [category, setCategory] = useState<ExpenseCategory | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const res = await getExpenseCategoryByIdApi(Number(categoryId));
                setCategory(res.data);
            } catch (err: any) {
                setError(err.message || "Failed to load category");
            } finally {
                setLoading(false);
            }
        };

        if (categoryId) {
            fetchCategory();
        }
    }, [categoryId]);

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (error || !category) {
        return (
            <View className="flex-1 items-center justify-center px-4">
                <CustomText className="text-red-500 text-center">
                    {error || "Category not found"}
                </CustomText>
            </View>
        );
    }

    return (
        <ScrollView className={`flex-1 p-6 ${isDark ? "bg-black" : "bg-white"}`}>
            <View className="items-center mb-6">
                <CustomIcon identifier={category.icon_identifier} name={category.icon_name} />
                <CustomText className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>
                    {category.title}
                </CustomText>
                {category.description ? (
                    <CustomText className={`text-sm mt-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        {category.description}
                    </CustomText>
                ) : null}
            </View>

            <View className="border-t border-b py-4 border-gray-300">
                <CustomText className={`text-base mb-2 ${isDark ? "text-white" : "text-black"}`}>
                    {t("Category Type")}: {category.category_type}
                </CustomText>
                <CustomText className={`text-base mb-2 ${isDark ? "text-white" : "text-black"}`}>
                    {t("Owner ID")}: {category.owner_id ?? t("Default")}
                </CustomText>
                <CustomText className={`text-base mb-2 ${isDark ? "text-white" : "text-black"}`}>
                    {t("Expense Count")}: {category.expense_count}
                </CustomText>
            </View>
        </ScrollView>
    );
};

export default ExpenseCategoryDetailsScreen;
