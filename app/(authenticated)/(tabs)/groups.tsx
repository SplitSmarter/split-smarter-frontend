import { View } from "react-native";
import React from "react";
import { useRouter } from "expo-router"; // 1. Import the router
import { authStore } from "@/src/store/authStore";
import { AppButton } from "@/src/components/common/AppButton";
import ThemeToggle from "@/src/components/common/themeToggle";

const GroupsScreen = () => {
    const { user, logout } = authStore();
    const router = useRouter(); // 2. Initialize the router

    return (
        <View className="flex-1 p-4">
            <AppButton
                // 3. Use router.push to navigate to the path
                onPress={() => router.push("/expense/add")}
                variant="primary"
                size="sm"
                className="w-full"
                hasShadow={true}
                loading={false}
            >
                Add Expense
            </AppButton>
            <ThemeToggle></ThemeToggle>
        </View>
    );
};

export default GroupsScreen;