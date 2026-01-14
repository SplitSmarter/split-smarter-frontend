import { Stack, Redirect } from 'expo-router';
import {useAuthStore} from "@/src/store/authStore";

export default function ServiceLayout() {
    const { isAuthenticated, isLoading } = useAuthStore();

    if (isLoading) return null;
    if (!isAuthenticated) return <Redirect href="/(unauthenticated)" />;

    return <Stack />;
}
