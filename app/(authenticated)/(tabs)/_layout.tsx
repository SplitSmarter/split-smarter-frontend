import {Tabs} from 'expo-router';
import {themeStore} from "@/src/store/themeStore";
import {Iconify} from "react-native-iconify";
import {Platform, View, StyleSheet} from 'react-native';
import {BlurView} from 'expo-blur';

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
                tabBarStyle: {
                    position: 'absolute',
                    bottom: Platform.OS === 'ios' ? 28 : 20,
                    left: 20,
                    right: 20,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: 'rgba(25. 25, 25, 0.85)',
                    borderTopWidth: 0,
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.12)',
                    elevation: 10,
                    shadowColor: '#000',
                    shadowOffset: {width: 0, height: 10},
                    shadowOpacity: 0.35,
                    shadowRadius: 15,
                    paddingHorizontal: 8,
                    paddingTop: 10,
                    paddingBottom: 0, // Prevents Android safe area shifts
                    overflow: 'hidden', // Fixes corner artifacts/extra layer bleed
                },
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