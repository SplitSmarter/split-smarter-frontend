import {View, Text, Button, TouchableOpacity} from "react-native";
import React from "react";
import {Redirect} from "expo-router";
import {useAuthStore} from "@/src/store/authStore";

const Home = () => {
    const {user, logout} = useAuthStore();
    // return (
    //     <View className="flex-1 justify-center px-6 bg-white dark:bg-black">
    //         <Text className="text-3xl font-bold text-center text-black dark:text-white mb-8">Welcome {user?.username}</Text>
    //         <TouchableOpacity
    //             onPress={logout}
    //             className="bg-green-700 py-3 rounded-lg"
    //         >
    //             <Text className="text-white text-center font-semibold">
    //                 Logout
    //             </Text>
    //         </TouchableOpacity>
    //     </View>
    // )
    return <Redirect href="/(authenticated)/(tabs)" />;
}

export default Home;
