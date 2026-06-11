import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { authStore } from "@/src/store/authStore";
import { systemStore } from "@/src/store/systemStore";

export default function AuthenticatedLayout() {
    const { isAuthenticated, isLoading } = authStore();
    const fetchSystemDefaults = systemStore((state) => state.fetchSystemDefaults);
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace("/(unauthenticated)/login");
        }

        if (isAuthenticated) {
            fetchSystemDefaults();
        }
    }, [isAuthenticated, isLoading]);

    // 3. Keep showing a splash/null while we determine the auth state
    if (isLoading || !isAuthenticated) {
        return null;
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            {/* Optional: Add specific screens here if needed */}
        </Stack>
    );
}