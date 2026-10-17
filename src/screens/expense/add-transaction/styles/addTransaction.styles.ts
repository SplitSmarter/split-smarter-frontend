import { StyleSheet } from 'react-native';

export const addTransactionStyles = StyleSheet.create({
    // Main Canvas & Screen Layout
    safeArea: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    mainContainer: {
        flex: 1,
    },

    // Header Component Styles
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 8,
    },
    headerIconButton: {
        padding: 6,
        borderRadius: 12,
    },
    headerIconGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 12,
    },

    // Tab Selector Styles
    tabsWrapper: {
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 16,
    },
    tabsContainer: {
        flexDirection: 'row',
        padding: 4,
        borderRadius: 9999,
        borderWidth: 1,
        width: '100%',
    },

    // Body Sheet Container
    sheetCardContainer: {
        flex: 1,
        borderTopLeftRadius: 36,
        borderTopRightRadius: 36,
        paddingHorizontal: 24,
        paddingTop: 24,
    },
    scrollContent: {
        paddingBottom: 28,
    },

    // Processing Overlay HUD
    overlayContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(9, 13, 22, 0.82)',
        zIndex: 50,
        alignItems: 'center',
        justifyContent: 'center',
        rowGap: 16,
    },
    overlayCard: {
        paddingHorizontal: 28,
        paddingVertical: 20,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
});