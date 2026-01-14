// src/components/expense/ExpenseTransferForm.tsx
import React from "react";
import { TextInput, View, Text } from "react-native";

interface Props {
    transferDetail: any;
    setTransferDetail: (transferDetail: any) => void;
}

export default function ExpenseTransferForm({ transferDetail, setTransferDetail } : Props) {
    return (
        <View className="mb-4">
            <Text className="font-medium">Transfer To</Text>
            <TextInput
                className="border border-gray-300 rounded-lg p-2"
                placeholder="Enter recipient name"
                value={transferDetail}
                onChangeText={setTransferDetail}
            />
        </View>
    );
}
