import { Stack, Redirect } from 'expo-router';
import {authStore} from "@/src/store/authStore";

export default function ItemLayout() {
    const { isAuthenticated, isLoading } = authStore();

    if (isLoading) return null;
    if (!isAuthenticated) return <Redirect href="/(unauthenticated)" />;

    return <Stack />;
}
