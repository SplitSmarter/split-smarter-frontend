import React, { useEffect, useState } from "react";
import { View, FlatList, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import CustomText from "@/src/components/common/CustomText";
import { useThemeStore } from "@/src/store/useThemeStore";

import { getExpenseItemsApi } from "@/src/api/expense/items"; // You need to create this file if not already
import { ExpenseItem } from "@/src/interfaces/expense";
import { useRouter } from "expo-router";
import { ROUTES } from "@/src/constants/routes";
import CustomIcon from "@/src/components/common/CustomIcon";

const ExpenseItemsScreen = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const { theme } = useThemeStore();
    const isDark = theme === "dark";

    const [items, setItems] = useState<ExpenseItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const res = await getExpenseItemsApi();
                setItems(res.data.items);
            } catch (err: any) {
                setError(err.message || "Failed to load items");
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, []);

    const renderItem = ({ item }: { item: ExpenseItem }) => {

        return (
            <View
                className="flex-row items-center p-4 border-b border-gray-300"
                onTouchEnd={() => router.push(ROUTES.itemDetails(item.id))}
            >
                <CustomIcon identifier={item.icon_identifier} style={{height: 40, width: 40, marginRight: 12}} name={item.icon_name} />

                <View className="flex-1">
                    <CustomText className={`text-base font-semibold ${isDark ? "text-white" : "text-black"}`}>
                        {item.title}
                    </CustomText>

                    {item.description ? (
                        <CustomText className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                            {item.description}
                        </CustomText>
                    ) : null}

                    <View className="flex-row justify-between mt-2">
                        <CustomText className="text-sm text-green-600 font-medium">
                            ₹{item.cost.toFixed(2)}
                        </CustomText>
                        <CustomText className="text-sm text-gray-400">
                            {new Date(item.created_on).toLocaleDateString()}
                        </CustomText>
                    </View>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 items-center justify-center px-4">
                <CustomText className="text-red-500 text-center">{error}</CustomText>
            </View>
        );
    }

    return (
        <View className={`flex-1 ${isDark ? "bg-black" : "bg-white"}`}>
            <FlatList
                data={items}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </View>
    );
};

export default ExpenseItemsScreen;
