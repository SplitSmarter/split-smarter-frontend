import { Stack } from 'expo-router';

export default function ExpenseLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen 
                name="details" 
                options={{ 
                    headerShown: false,
                    presentation: 'modal'
                }} 
            />
        </Stack>
    );
}
