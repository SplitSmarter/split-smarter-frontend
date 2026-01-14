import { View, TouchableOpacity, Alert } from "react-native";
import React, { useState } from "react";
import CustomText from "@/src/components/common/CustomText";
import ThemeToggle from "@/src/components/common/themeToggle";
// import { testApi } from "@/src/api/test"; // Make sure the path is correct
import {useAlert} from "@/src/context/alertContext"
import {getExpenseItemByIdApi} from "@/src/api/expense/items";
import {useAuthStore} from "@/src/store/authStore";

const HomeScreen = () => {
    const { user, logout } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const {showAlert} = useAlert();

    const handleTestApi = async () => {
        setLoading(true);
        try {
            const res = await getExpenseItemByIdApi(2);
            showAlert("Success", "success");
        } catch (err: any) {
            showAlert(err.message || "Unknown error", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 justify-center px-6 bg-white dark:bg-black">
            <CustomText className="text-3xl font-bold text-center text-black dark:text-white mb-8">
                Welcome {user?.username}
            </CustomText>

            <ThemeToggle />

            <TouchableOpacity
                onPress={handleTestApi}
                disabled={loading}
                className={`py-3 rounded-lg my-4 ${loading ? "bg-gray-400" : "bg-blue-600"}`}
            >
                <CustomText className="text-white text-center font-semibold">
                    {loading ? "Testing..." : "Test API"}
                </CustomText>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={logout}
                className="bg-green-700 py-3 rounded-lg"
            >
                <CustomText className="text-white text-center font-semibold">
                    Logout
                </CustomText>
            </TouchableOpacity>
        </View>
    );
};

export default HomeScreen;
