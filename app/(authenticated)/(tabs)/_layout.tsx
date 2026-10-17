import {Tabs} from 'expo-router';
import {themeStore} from "@/src/store/themeStore";
import {Iconify} from "react-native-iconify";
import {View, StyleSheet} from 'react-native';
import {BlurView} from 'expo-blur';
import {getFloatingTabBarStyle} from '@/src/constants/floatingTabBar';
import {COLORS} from '@/src/constants/colors';

export default function AuthTabLayout() {
    const {theme} = themeStore();
    const isDark = theme === 'dark';
    const colors = isDark ? COLORS.dark : COLORS.light;

    // Light: slate active pill + white icon (reads on white glass). Dark: soft white pill.
    const activePillBg = isDark ? 'rgba(255, 255, 255, 0.14)' : colors.brand.primary;
    const activeIconColor = isDark ? colors.text.primary : colors.text.contrast;
    const inactiveIconColor = isDark ? 'rgba(248, 250, 252, 0.45)' : colors.icon.primary;

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarBackground: () => (
                    <BlurView
                        tint={isDark ? 'dark' : 'light'}
                        intensity={isDark ? 80 : 60}
                        style={styles.blurBackground}
                    />
                ),
                tabBarItemStyle: {
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 0,
                    margin: 0,
                },
                tabBarStyle: getFloatingTabBarStyle(isDark),
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    tabBarIcon: ({focused}) => (
                        <View style={focused ? [styles.activeTabPill, {backgroundColor: activePillBg}] : styles.inactiveTab}>
                            {focused ? (
                                <Iconify icon="heroicons:wallet-20-solid" size={22} color={activeIconColor}/>
                            ) : (
                                <Iconify icon="heroicons:wallet" size={22} color={inactiveIconColor}/>
                            )}
                        </View>
                    ),
                }}
            />

            <Tabs.Screen
                name="groups"
                options={{
                    tabBarIcon: ({focused}) => (
                        <View style={focused ? [styles.activeTabPill, {backgroundColor: activePillBg}] : styles.inactiveTab}>
                            <Iconify
                                icon="octicon:arrow-switch-16"
                                size={22}
                                color={focused ? activeIconColor : inactiveIconColor}
                            />
                        </View>
                    ),
                }}
            />

            <Tabs.Screen
                name="camera"
                options={{
                    tabBarIcon: ({focused}) => (
                        <View style={focused ? [styles.activeTabPill, {backgroundColor: activePillBg}] : styles.inactiveTab}>
                            {focused ? (
                                <Iconify icon="heroicons:chart-pie-20-solid" size={22} color={activeIconColor}/>
                            ) : (
                                <Iconify icon="heroicons:chart-pie" size={22} color={inactiveIconColor}/>
                            )}
                        </View>
                    ),
                }}
            />

            <Tabs.Screen
                name="analytics"
                options={{
                    // Keep map tree mounted but frozen off-tab so return visits stay warm.
                    freezeOnBlur: true,
                    tabBarIcon: ({focused}) => (
                        <View style={focused ? [styles.activeTabPill, {backgroundColor: activePillBg}] : styles.inactiveTab}>
                            {focused ? (
                                <Iconify icon="heroicons:credit-card-20-solid" size={22} color={activeIconColor}/>
                            ) : (
                                <Iconify icon="heroicons:credit-card" size={22} color={inactiveIconColor}/>
                            )}
                        </View>
                    ),
                }}
            />

            <Tabs.Screen
                name="settings"
                options={{
                    tabBarIcon: ({focused}) => (
                        <View style={focused ? [styles.activeTabPill, {backgroundColor: activePillBg}] : styles.inactiveTab}>
                            {focused ? (
                                <Iconify icon="heroicons:squares-2x2-20-solid" size={22} color={activeIconColor}/>
                            ) : (
                                <Iconify icon="heroicons:squares-2x2" size={22} color={inactiveIconColor}/>
                            )}
                        </View>
                    ),
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    blurBackground: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 32,
        overflow: 'hidden',
    },
    activeTabPill: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    inactiveTab: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
