import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { authStore } from "@/src/store/authStore";

export default function UnauthenticatedLayout() {
    return <Stack screenOptions={{ headerShown: false }} />;
}