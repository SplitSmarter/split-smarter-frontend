import { Redirect, Stack } from 'expo-router';
import {useAuthStore} from "@/src/store/authStore";

export default function UnauthenticatedLayout() {
    const { isAuthenticated, isLoading } = useAuthStore();
    if (isLoading) return null;
    if (isAuthenticated) return <Redirect href="/(authenticated)" />;

    return <Stack
        screenOptions={{
            headerShown: false, // This hides the header for ALL screens in this stack
        }}
    />;
}
