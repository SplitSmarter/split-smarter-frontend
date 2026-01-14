import React from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

interface Props {
    onSave: () => void;
    loading: boolean;
    error: string | null;
}

export default function SaveButton({ onSave, loading, error }: Props) {
    return (
        <TouchableOpacity
            onPress={onSave}
            disabled={loading || !!error}
            className={`rounded-lg py-3 items-center mt-6 ${
                loading || error ? "bg-gray-400" : "bg-green-600"
            }`}
        >
            {loading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text className="text-white font-semibold">Save Expense</Text>
            )}
        </TouchableOpacity>
    );
}
