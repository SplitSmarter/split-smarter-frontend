import {Platform, ViewStyle} from 'react-native';

export const FLOATING_TAB_BAR_STYLE: ViewStyle = {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 28 : 20,
    left: 20,
    right: 20,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(25, 25, 25, 0.85)',
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
    paddingBottom: 0,
    overflow: 'hidden',
};

export const HIDDEN_TAB_BAR_STYLE: ViewStyle = {
    display: 'none',
};
