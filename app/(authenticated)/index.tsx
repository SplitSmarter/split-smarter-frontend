import { authStore } from "@/src/store/authStore";
import { Redirect } from "expo-router";

export default function Home() {
    const { isAuthenticated, isLoading } = authStore();

    // Wait until we know the auth state
    if (isLoading) return null;

    if (isAuthenticated) {
        return <Redirect href="/(authenticated)/(tabs)" />;
    }

    return <Redirect href="/(unauthenticated)/login" />;
}