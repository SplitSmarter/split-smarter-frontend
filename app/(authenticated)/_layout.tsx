// app/(authenticated)/_layout.tsx
import { authStore } from "@/src/store/authStore";
import { systemStore } from "@/src/store/systemStore";
import { Redirect, Stack } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function AuthenticatedLayout() {
    const { isAuthenticated, isLoading } = authStore();
    const fetchSystemDefaults = systemStore((state) => state.fetchSystemDefaults);

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            fetchSystemDefaults();
        }
    }, [isAuthenticated, isLoading]);

    // Prevent unmounting the navigation tree during loading states
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (!isAuthenticated) {
        return <Redirect href="/(unauthenticated)/login" />;
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="expense" />
            <Stack.Screen name="group" />
            <Stack.Screen name="map" />
            <Stack.Screen name="user" />
        </Stack>
    );
}