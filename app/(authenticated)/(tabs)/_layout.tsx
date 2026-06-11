import { Tabs } from 'expo-router';
import { themeStore } from "@/src/store/themeStore";
import { Iconify } from "react-native-iconify";
import { Platform } from 'react-native';

export default function AuthTabLayout() {
    const { theme } = themeStore();
    const isDark = theme === 'dark';

    // Mapping colors from your global.css variables
    const activeColor = isDark ? 'rgb(50, 150, 110)' : 'rgb(43, 135, 97)'; // Brand Green
    const inactiveColor = isDark ? 'rgb(200, 200, 200)' : 'rgb(77, 77, 77)'; // Icon Primary
    const bgColor = isDark ? 'rgb(34, 34, 34)' : 'rgb(242, 242, 242)'; // Background Primary

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarStyle: {
                    backgroundColor: bgColor,
                    borderTopWidth: 0,
                    elevation: 0,
                    shadowOpacity: 0,
                    height: Platform.OS === 'ios' ? 88 : 70,
                    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
                },
                tabBarActiveTintColor: activeColor,
                tabBarInactiveTintColor: inactiveColor,
            }}
        >
            <Tabs.Screen name="index" options={{
                tabBarIcon: ({ color, focused }) => focused ? (
                    <Iconify icon="heroicons:home-solid" size={28} color={color} />
                ) : (
                    <Iconify icon="heroicons:home" size={28} color={color} />
                )
            }} />

            <Tabs.Screen name="groups" options={{
                tabBarIcon: ({ color, focused }) => focused ? (
                    <Iconify icon="heroicons:document-text-solid" size={28} color={color} />
                ) : (
                    <Iconify icon="heroicons:document-text" size={28} color={color} />
                )
            }} />

            <Tabs.Screen name="camera" options={{
                tabBarIcon: ({ color, focused }) => focused ? (
                    <Iconify icon="heroicons:cpu-chip-solid" size={30} color={color} />
                ) : (
                    <Iconify icon="heroicons:cpu-chip" size={30} color={color} />
                )
            }} />

            <Tabs.Screen name="analytics" options={{
                tabBarIcon: ({ color, focused }) => focused ? (
                    <Iconify icon="heroicons:chart-bar-solid" size={28} color={color} />
                ) : (
                    <Iconify icon="heroicons:chart-bar" size={28} color={color} />
                )
            }} />

            <Tabs.Screen name="settings" options={{
                tabBarIcon: ({ color, focused }) => focused ? (
                    <Iconify icon="heroicons:calendar-days-solid" size={28} color={color} />
                ) : (
                    <Iconify icon="heroicons:calendar-days" size={28} color={color} />
                )
            }} />
        </Tabs>
    );
}