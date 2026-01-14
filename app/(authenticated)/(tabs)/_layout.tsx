import { Tabs } from 'expo-router';

export default function AuthTabLayout() {
    return (
        <Tabs>
            <Tabs.Screen name="index" options={{ title: 'Home' }} />
            <Tabs.Screen name="groups" options={{ title: 'Groups' }} />
            <Tabs.Screen name="camera" options={{ title: 'Camera' }} />
            <Tabs.Screen name="analytics" options={{ title: 'Analytics' }} />
            <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
        </Tabs>
    );
}
