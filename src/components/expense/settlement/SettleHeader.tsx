import React, {useState, useEffect, useMemo, useRef, useCallback} from 'react';
import {View, Pressable, Alert, Linking, ActivityIndicator} from 'react-native';
import {Iconify} from 'react-native-iconify';
import {BottomSheetModal, BottomSheetBackdrop, BottomSheetView} from '@gorhom/bottom-sheet';
import {AppText} from '@/src/components/common/AppText';
import {AppImageV2} from '@/src/components/common/AppImageV2';
import {EntityFallbackIcon} from '@/src/components/common/EntityFallbackIcon';
import {AppButtonV2} from "@/src/components/common/AppButtonV2";
import {AppInput} from "@/src/components/common/AppInput";
import {expensePaymentStore} from '@/src/store/expensePaymentStore';
import {GroupMemberDetails} from "@/src/api/dto/user/group";
import {themeStore} from '@/src/store/themeStore';
import { COLORS } from '@/src/constants/colors';
import {userStore} from '@/src/store/userStore';
import {Currency} from '@/src/constants/expense/currency';
import {CurrencyModal} from "@/src/components/expense/currency/CurrencyModal";
import {ExchangeRateDetails} from "@/src/api/dto/expense/expense";

// --- SUBCOMPONENTS ---

interface SettleHeaderProps {
    member: GroupMemberDetails;
    onClose: () => void;
}

const SettleHeader = React.memo(({member, onClose}: SettleHeaderProps) => {
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    return (
        <View className="w-full items-center">
            <View className="w-full flex-row items-center justify-between mb-5">
                <AppText variant="h3" className="font-extrabold text-text-primary text-xl">
                    Settle Balance
                </AppText>
                <Pressable onPress={onClose} className="p-2 bg-bg-primary-darker rounded-full active:opacity-60">
                    <Iconify icon="heroicons:x-mark" size={16} color={colors.icon.lighter}/>
                </Pressable>
            </View>

            <View
                className="w-16 h-16 rounded-full bg-bg-primary-darker items-center justify-center overflow-hidden mb-2 border-2 border-border-input shadow-sm">
                <AppImageV2
                    id={`settle-header-${member.id}`}
                    url={member.avatar?.url}
                    style={{width: '100%', height: '100%'}}
                    contentFit="cover"
                    fallbackComponent={
                        <EntityFallbackIcon kind="user" size={28} color={colors.icon.lighter}/>
                    }
                />
            </View>

            <AppText variant="h4" className="font-bold text-text-primary text-base mb-1">
                {member.name}
            </AppText>
        </View>
    );
});
SettleHeader.displayName = 'SettleHeader';

export default SettleHeader;