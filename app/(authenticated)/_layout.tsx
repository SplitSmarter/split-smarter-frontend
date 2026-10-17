// app/(authenticated)/_layout.tsx
import { Stack } from 'expo-router';
import { ExpenseDetailsBottomSheet } from '@/src/screens/expense/details/ExpenseDetailsBottomSheet';

export default function AuthenticatedLayout() {
    return (
        <>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="expense" />
                <Stack.Screen name="group" />
                <Stack.Screen name="map" />
                <Stack.Screen name="user" />
            </Stack>
            <ExpenseDetailsBottomSheet />
        </>
    );
}