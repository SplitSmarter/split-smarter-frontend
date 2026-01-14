import {View, Text, TouchableOpacity} from "react-native";
import React from "react";
import AddCustomUserScreen from "@/src/screens/AddCustomUser";
import {useAuthStore} from "@/src/store/authStore";

const GroupsScreen = () => {
    const {user, logout} = useAuthStore();

    return (
        <AddCustomUserScreen />
    );
};

export default GroupsScreen;
