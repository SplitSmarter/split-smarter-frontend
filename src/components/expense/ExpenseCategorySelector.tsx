import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { getExpenseCategoriesApi } from "@/src/api/expense/categories";
import CustomIcon from "@/src/components/common/CustomIcon";
import { useAlert } from "@/src/context/alertContext";

interface Props {
    categoryId: string;
    setCategoryId: (id: string) => void;
}

export default function ExpenseCategorySelector({ categoryId, setCategoryId }: Props) {
    const { showAlert } = useAlert();
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const res = await getExpenseCategoriesApi();
                setCategories(res.data.categories || []);
            } catch (err: any) {
                showAlert(err.message || "Failed to fetch categories", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    return (
        <View className="mb-4">
            <Text className="font-medium">Category *</Text>
            {loading ? (
                <ActivityIndicator className="my-2" />
            ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mt-2">
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            className={`px-3 py-2 rounded-lg mr-2 ${
                                categoryId === cat.id.toString() ? "bg-blue-500" : "bg-gray-200"
                            }`}
                            onPress={() => setCategoryId(cat.id.toString())}
                        >
                            <View className="flex-row items-center">
                                {cat.icon_identifier && (
                                    <CustomIcon
                                        identifier={cat.icon_identifier}
                                        name={cat.icon_name}
                                        style={{ height: 20, width: 20, marginRight: 6 }}
                                    />
                                )}
                                <Text
                                    className={`${
                                        categoryId === cat.id.toString() ? "text-white" : "text-gray-800"
                                    }`}
                                >
                                    {cat.title}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
        </View>
    );
}
