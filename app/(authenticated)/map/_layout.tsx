import { Stack } from 'expo-router';

export default function MapLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen 
                name="select"
                options={{ 
                    headerShown: false,
                    presentation: 'modal'
                }} 
            />
        </Stack>
    );
}
