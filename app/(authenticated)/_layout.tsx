import { Stack, Redirect } from 'expo-router';
import {useAuthStore} from "@/src/store/authStore";

export default function AuthenticatedLayout() {
    const { isAuthenticated, isLoading } = useAuthStore();
    console.log("is user authenticated: " + isAuthenticated);
    if (isLoading) return null;
    if (!isAuthenticated) return <Redirect href="/(unauthenticated)" />;

    return <Stack />;
}
