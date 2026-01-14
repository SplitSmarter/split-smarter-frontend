import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { getExpenseItemsApi } from "@/src/api/expense/items";
import { CurrencyType } from "@/src/constants/expense";
import { ItemsComponentDto, ExpenseItem } from "@/src/interfaces/expense";
import { useAlert } from "@/src/context/alertContext";
import CustomIcon from "@/src/components/common/CustomIcon";

interface Props {
    selectedItems: ItemsComponentDto[];
    setSelectedItems: (items: ItemsComponentDto[]) => void;
    setTotalAmount: (total: string) => void;
}

export default function ExpenseItemForm({ selectedItems, setSelectedItems, setTotalAmount }: Props) {
    const { showAlert } = useAlert();
    const [availableItems, setAvailableItems] = useState<ExpenseItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const total = selectedItems.reduce(
            (sum, item) => sum + item.quantity * item.unit_cost,
            0
        );
        setTotalAmount(total.toString());
    }, [selectedItems]);

    useEffect(() => {
        const fetchItems = async () => {
            try {
                setLoading(true);
                const res = await getExpenseItemsApi();
                setAvailableItems(res.data.items || []);
            } catch (err: any) {
                showAlert(err.message || "Failed to fetch items", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchItems();
    }, []);

    const toggleSelectItem = (item: ExpenseItem) => {
        const alreadySelected = selectedItems.some((i) => i.id === item.id);
        if (alreadySelected) {
            setSelectedItems(selectedItems.filter((i) => i.id !== item.id));
        } else {
            setSelectedItems([
                ...selectedItems,
                {
                    id: item.id,
                    quantity: 1,
                    unit_cost: item.cost,
                    currency: CurrencyType.inr,
                },
            ]);
        }
    };

    return (
        <View className="mb-4">
            <Text className="font-medium mb-2">Select Items *</Text>
            {loading ? (
                <ActivityIndicator className="my-2" />
            ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-4">
                    {availableItems.map((item) => {
                        const alreadySelected = selectedItems.some((i) => i.id === item.id);
                        return (
                            <TouchableOpacity
                                key={item.id}
                                className={`px-3 py-2 rounded-lg mr-2 ${
                                    alreadySelected ? "bg-green-500" : "bg-gray-200"
                                }`}
                                onPress={() => toggleSelectItem(item)}
                            >
                                <View className="flex-row items-center">
                                    {/* Icon */}
                                    {item.icon_identifier && (
                                        <CustomIcon
                                            identifier={item.icon_identifier}
                                            name={item.icon_name}
                                            style={{ height: 20, width: 20, marginRight: 6 }}
                                        />
                                    )}
                                    <Text className={alreadySelected ? "text-white" : "text-gray-800"}>
                                        {item.title}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            )}

            {selectedItems.map((sel) => {
                const item = availableItems.find((i) => i.id === sel.id);
                if (!item) return null;

                return (
                    <View
                        key={sel.id}
                        className="flex-row items-center border rounded-lg p-2 mb-2 bg-gray-50"
                    >
                        {/* Left: Icon & Info */}
                        <View className="flex-1">
                            <View className="flex-row items-center mb-1">
                                {item.icon_identifier && (
                                    <CustomIcon
                                        identifier={item.icon_identifier}
                                        name={item.icon_name}
                                        style={{ height: 24, width: 24, marginRight: 8 }}
                                    />
                                )}
                                <Text className="font-semibold">{item.title}</Text>
                            </View>
                            {item.description ? (
                                <Text className="text-xs text-gray-500">{item.description}</Text>
                            ) : null}
                        </View>

                        {/* Quantity */}
                        <TextInput
                            className="border border-gray-300 rounded px-2 py-1 w-16 text-center mr-2"
                            keyboardType="numeric"
                            value={sel.quantity.toString()}
                            onChangeText={(val) => {
                                const qty = parseInt(val) || 1;
                                setSelectedItems(
                                    selectedItems.map((i) =>
                                        i.id === sel.id ? { ...i, quantity: qty } : i
                                    )
                                );
                            }}
                        />

                        {/* Price */}
                        <TextInput
                            className="border border-gray-300 rounded px-2 py-1 w-20 text-right mr-2"
                            keyboardType="numeric"
                            value={sel.unit_cost.toString()}
                            onChangeText={(val) => {
                                const cost = parseFloat(val) || 0;
                                setSelectedItems(
                                    selectedItems.map((i) =>
                                        i.id === sel.id ? { ...i, unit_cost: cost } : i
                                    )
                                );
                            }}
                        />

                        {/* Remove */}
                        <TouchableOpacity
                            className="bg-red-600 px-2 py-1 rounded"
                            onPress={() => setSelectedItems(selectedItems.filter((i) => i.id !== sel.id))}
                        >
                            <Text className="text-white text-xs">X</Text>
                        </TouchableOpacity>
                    </View>
                );
            })}
        </View>
    );
}
