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
        borderTopWidth: 1,
    },
    scrollContent: {
        paddingBottom: 180,
    },

    // Footer Component Styles
    footerContainer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        paddingTop: 20,
        paddingBottom: 40,
        paddingHorizontal: 24,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        borderTopWidth: 1,
        // Dynamic Shadow Elevation
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
        elevation: 16,
    },
    footerStatusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    datePillButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 9999,
        borderWidth: 1,
    },

    // Status Pill Badges
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        maxWidth: '55%',
        columnGap: 4,
    },
    statusErrorBg: {
        backgroundColor: 'rgba(239, 68, 68, 0.12)',
    },
    statusWarningBg: {
        backgroundColor: 'rgba(217, 119, 6, 0.12)',
    },
    statusReadyBg: {
        backgroundColor: 'rgba(16, 185, 129, 0.12)',
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