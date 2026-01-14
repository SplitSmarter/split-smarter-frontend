import React, { useEffect, useState } from "react";
import { View, FlatList, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import CustomText from "@/src/components/common/CustomText";
import { getExpenseCategoriesApi } from "@/src/api/expense/categories";
import { ExpenseCategory } from "@/src/interfaces/expense";
import { useTheme } from "@/src/context/themeContext";
import { useRouter } from "expo-router";
import {ROUTES} from "@/src/constants/routes";
import CustomIcon from "@/src/components/common/CustomIcon";

const ExpenseCategoriesScreen = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const [categories, setCategories] = useState<ExpenseCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await getExpenseCategoriesApi();
                setCategories(res.data.categories);
                } catch (err: any) {
                    setError(err.message || "Failed to load categories");
                } finally {
                    setLoading(false);
                }
        };

        fetchCategories();
    }, []);
    const renderItem = ({ item }: { item: ExpenseCategory }) => {
        return (
            <View
                className="flex-row items-center p-4 border-b border-gray-300"
                onTouchEnd={() => router.push(ROUTES.categoryDetails(item.id))}
            >
                <CustomIcon identifier={item.icon_identifier} style={{height: 40, width: 40, marginRight: 12}} name={item.icon_name} />

                <View className="flex-1">
                    <CustomText
                        className={`text-base font-semibold ${isDark ? "text-white" : "text-black"}`}
                    >
                        {item.title}
                    </CustomText>
                    {item.description ? (
                        <CustomText
                            className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
                        >
                            {item.description}
                        </CustomText>
                    ) : null}
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
                data={categories}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </View>
    );
};

export default ExpenseCategoriesScreen;
