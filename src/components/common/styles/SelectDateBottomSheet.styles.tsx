import {
    StyleSheet,
} from 'react-native';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    headerBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 12,
        borderBottomWidth: 1,
    },
    headerIconBtn: {
        padding: 6,
        borderRadius: 12,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
    },
    saveHeaderBtn: {
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 16,
    },
    saveHeaderText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
    },
    segmentedControl: {
        flexDirection: 'row',
        marginTop: 12,
        marginBottom: 16,
        padding: 4,
        borderRadius: 18,
    },
    segmentBtn: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 14,
    },
    segmentText: {
        fontSize: 14,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    calendarCard: {
        borderRadius: 24,
        padding: 8,
        borderWidth: 1,
        overflow: 'hidden',
    },
    repeatSectionGap: {
        gap: 12,
    },
    startDateBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 14,
        borderRadius: 20,
        borderWidth: 1,
    },
    bannerLabelGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    bannerLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    bannerValue: {
        fontSize: 15,
        fontWeight: '700',
    },
    patternCard: {
        padding: 16,
        borderRadius: 24,
        borderWidth: 1,
        gap: 16,
    },
    radioOptionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    radioRing: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    optionText: {
        fontSize: 15,
    },
    weekdayRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 28,
        marginTop: -4,
    },
    weekdayChip: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    weekdayText: {
        fontSize: 12,
        fontWeight: '700',
    },
    subOptionGroup: {
        paddingLeft: 28,
        gap: 8,
    },
    pillFilterBtn: {
        alignSelf: 'flex-start',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
    },
    pillFilterText: {
        fontSize: 12,
        fontWeight: '600',
    },
    sectionHeaderTitle: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.8,
        marginTop: 8,
        marginLeft: 4,
    },
    numberInput: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        borderWidth: 1,
        minWidth: 44,
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '600',
    },
    dateInput: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 10,
        borderWidth: 1,
        width: 110,
        textAlign: 'center',
        fontSize: 13,
        fontWeight: '600',
    },
});