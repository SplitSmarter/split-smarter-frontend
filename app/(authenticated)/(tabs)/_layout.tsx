import {Tabs} from 'expo-router';
import {themeStore} from "@/src/store/themeStore";
import {Iconify} from "react-native-iconify";
import {View, StyleSheet} from 'react-native';
import {BlurView} from 'expo-blur';
import {FLOATING_TAB_BAR_STYLE} from '@/src/constants/floatingTabBar';

export default function AuthTabLayout() {
    const {theme} = themeStore();
    const isDark = theme === 'dark';

    const activeIconColor = '#000000';
    const inactiveIconColor = 'rgba(255, 255, 255, 0.6)';

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarBackground: () => (
                    <BlurView
                        tint={isDark ? "dark" : "systemMaterialDark"}
                        intensity={80}
                        style={styles.blurBackground}
                    />
                ),
                tabBarItemStyle: {
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 0,
                    margin: 0,
                },
                tabBarStyle: FLOATING_TAB_BAR_STYLE,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    tabBarIcon: ({focused}) => (
                        <View style={focused ? styles.activeTabPill : styles.inactiveTab}>
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
                        <View style={focused ? styles.activeTabPill : styles.inactiveTab}>
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
                        <View style={focused ? styles.activeTabPill : styles.inactiveTab}>
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
                    tabBarIcon: ({focused}) => (
                        <View style={focused ? styles.activeTabPill : styles.inactiveTab}>
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
                        <View style={focused ? styles.activeTabPill : styles.inactiveTab}>
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
        backgroundColor: '#FFFFFF',
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