// app/(authenticated)/_layout.tsx
import { authStore } from "@/src/store/authStore";
import { systemStore } from "@/src/store/systemStore";
import { Redirect, Stack } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function AuthenticatedLayout() {

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