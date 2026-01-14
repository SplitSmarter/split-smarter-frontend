import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import CustomText from "@/src/components/common/CustomText";
import { useTheme } from "@/src/context/themeContext";
import { useLocalSearchParams } from "expo-router";
import { getExpenseItemByIdApi } from "@/src/api/expense/items"; // You need to create this file if not already
import { GetExpenseItemByIdResponse } from "@/src/interfaces/expense";
import CustomIcon from "@/src/components/common/CustomIcon";

const ExpenseItemDetailsScreen = () => {
    const { t } = useTranslation();
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const { itemId } = useLocalSearchParams();

    const [item, setItem] = useState<GetExpenseItemByIdResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const res = await getExpenseItemByIdApi(Number(itemId));
                setItem(res.data);
            } catch (err: any) {
                setError(err.message || "Failed to load item");
            } finally {
                setLoading(false);
            }
        };

        if (itemId) {
            fetchItem();
        }
    }, [itemId]);

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (error || !item) {
        return (
            <View className="flex-1 items-center justify-center px-4">
                <CustomText className="text-red-500 text-center">
                    {error || "Item not found"}
                </CustomText>
            </View>
        );
    }


    return (
        <ScrollView className={`flex-1 p-6 ${isDark ? "bg-black" : "bg-white"}`}>
            <View className="items-center mb-6">
                <CustomIcon identifier={item.icon_identifier} name={item.icon_name} />
                <CustomText className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}>
                    {item.title}
                </CustomText>
                {item.description ? (
                    <CustomText className={`text-sm mt-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        {item.description}
                    </CustomText>
                ) : null}
            </View>

            <View className="border-t border-b py-4 border-gray-300">
                <CustomText className={`text-base mb-2 ${isDark ? "text-white" : "text-black"}`}>
                    {t("Item Type")}: {item.item_type}
                </CustomText>
                <CustomText className={`text-base mb-2 ${isDark ? "text-white" : "text-black"}`}>
                    {t("Owner")}: {item.owner.name ?? t("Default")}
                </CustomText>
                <CustomText className={`text-base mb-2 ${isDark ? "text-white" : "text-black"}`}>
                    {t("Cost")}: ₹{item.cost.toFixed(2)}
                </CustomText>
                <CustomText className={`text-base mb-2 ${isDark ? "text-white" : "text-black"}`}>
                    {t("Created On")}: {new Date(item.created_on).toLocaleString()}
                </CustomText>
            </View>
        </ScrollView>
    );
};

export default ExpenseItemDetailsScreen;
