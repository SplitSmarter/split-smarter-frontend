import { Stack } from 'expo-router';

export default function GroupDetailsLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen 
                name="index" 
                options={{ 
                    headerShown: false,
                    presentation: 'modal'
                }} 
            />
        </Stack>
    );
}
