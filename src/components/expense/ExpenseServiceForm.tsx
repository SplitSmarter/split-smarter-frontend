// src/components/expense/ExpenseServiceForm.tsx
import React from "react";
import { TextInput, View, Text } from "react-native";

interface Props {
    serviceDetail: any;
    setServiceDetail: (serviceDetail: any) => void;
}

export default function ExpenseServiceForm({ serviceDetail, setServiceDetail }: Props) {
    return (
        <View className="mb-4">
            <Text className="font-medium">Service Details</Text>
            <TextInput
                className="border border-gray-300 rounded-lg p-2"
                placeholder="Enter service description"
                value={serviceDetail}
                onChangeText={setServiceDetail}
            />
        </View>
    );
}
