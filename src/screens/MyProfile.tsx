import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    View,
    RefreshControl,
    Alert,
} from "react-native";
import { GetMyDetailsApi } from "@/src/api/user/user";
import CustomAvatar from "@/src/components/common/CustomAvatar";
import { useUserStore } from "@/src/store/userStore";

export default function MyProfileScreen() {
    const { user, setUser } = useUserStore();
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const fetchUser = async () => {
        try {
            setLoading(true);
            // const data = await GetMyDetailsApi();
            // setUser(data);
        } catch (err: any) {
            Alert.alert("Error", err.message || "Failed to fetch user details");
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            const data = await GetMyDetailsApi();
            setUser(data);
        } catch (err: any) {
            Alert.alert("Error", err.message || "Failed to refresh");
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (!user) fetchUser();
    }, []);

    if (loading && !user) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    if (!user) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <Text>No user data found</Text>
            </View>
        );
    }

    return (
        <ScrollView
            className="flex-1 bg-white p-4"
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <View className="items-center mb-6">
                <CustomAvatar
                    name={user.name}
                    title={user.avatar_title}
                    url={user.avatar_url}
                    host={user.avatar_host}
                    host_type={user.avatar_host_type}
                    style={{ width: 80, height: 80, borderRadius: 40 }}
                    showTitle={false}
                />
                <Text className="mt-3 text-lg font-bold">{user.name}</Text>
                <Text className="text-gray-500">{user.email}</Text>
            </View>

            <View className="mb-4">
                <Text className="font-semibold">Phone</Text>
                <Text className="text-gray-600">{user.phone_number || "-"}</Text>
            </View>

            <View className="mb-4">
                <Text className="font-semibold">Location</Text>
                <Text className="text-gray-600">
                    {[user.city, user.region, user.country].filter(Boolean).join(", ")}
                </Text>
            </View>

            <View className="mb-4">
                <Text className="font-semibold">Currency</Text>
                <Text className="text-gray-600">{user.currency}</Text>
            </View>

            <View className="mb-4">
                <Text className="font-semibold">Language</Text>
                <Text className="text-gray-600">{user.language}</Text>
            </View>

            <View className="mb-4">
                <Text className="font-semibold">Registered On</Text>
                <Text className="text-gray-600">
                    {new Date(user.registered_on).toLocaleDateString()}
                </Text>
            </View>
        </ScrollView>
    );
}
