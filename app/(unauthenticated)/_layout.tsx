import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { authStore } from "@/src/store/authStore";

export default function UnauthenticatedLayout() {
    const { isAuthenticated, isLoading } = authStore();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.replace("/(authenticated)");
        }
    }, [isAuthenticated, isLoading]);

    if (isLoading || isAuthenticated) return null;

    return <Stack screenOptions={{ headerShown: false }} />;
}