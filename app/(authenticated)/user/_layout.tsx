import { Stack } from 'expo-router';

export default function UserLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen 
                name="group"
                options={{ 
                    headerShown: false,
                    presentation: 'modal'
                }} 
            />
            <Stack.Screen
                name="relationship"
                options={{
                    headerShown: false,
                    presentation: 'modal'
                }}
            />
        </Stack>
    );
}
