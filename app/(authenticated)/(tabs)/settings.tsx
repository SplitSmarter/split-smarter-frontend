import {View, Text, TouchableOpacity} from "react-native";
import React from "react";
import {useAuthStore} from "@/src/store/authStore";

const SettingsScreen = () => {
    const {logout} = useAuthStore();

    return (
        <View className="flex-1 justify-center px-6 bg-white dark:bg-black">
            <Text
                className="text-3xl font-bold text-center text-black dark:text-white mb-8">Welcome to Settings</Text>
            <TouchableOpacity
                onPress={logout}
                className="bg-green-700 py-3 rounded-lg"
            >
                <Text className="text-white text-center font-semibold">
                    Logout
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default SettingsScreen;
