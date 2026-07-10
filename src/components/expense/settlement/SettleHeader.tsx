import React, {useState, useEffect, useMemo, useRef, useCallback} from 'react';
import {View, Pressable, Alert, Linking, ActivityIndicator} from 'react-native';
import {Image} from 'expo-image';
import {Iconify} from 'react-native-iconify';
import {BottomSheetModal, BottomSheetBackdrop, BottomSheetView} from '@gorhom/bottom-sheet';
import {AppText} from '@/src/components/common/AppText';
import {AppButtonV2} from "@/src/components/common/AppButtonV2";
import {AppInput} from "@/src/components/common/AppInput";
import {expensePaymentStore} from '@/src/store/expensePaymentStore';
import {GroupMemberDetails} from "@/src/api/dto/user/group";
import {themeStore} from '@/src/store/themeStore';
import {userStore} from '@/src/store/userStore';
import {Currency} from '@/src/constants/expense/currency';
import {CurrencyModal} from "@/src/components/expense/currency/CurrencyModal";
import {ExchangeRateDetails} from "@/src/api/dto/expense/expense";

// --- SUBCOMPONENTS ---

interface SettleHeaderProps {
    member: GroupMemberDetails;
    onClose: () => void;
}

const SettleHeader = React.memo(({member, onClose}: SettleHeaderProps) => (
    <View className="w-full items-center">
        <View className="w-full flex-row items-center justify-between mb-5">
            <AppText variant="h3" className="font-extrabold text-text-primary text-xl">
                Settle Balance
            </AppText>
            <Pressable onPress={onClose} className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-full active:opacity-60">
                <Iconify icon="heroicons:x-mark" size={16} color="#71717A"/>
            </Pressable>
        </View>

        <View
            className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-900 items-center justify-center overflow-hidden mb-2 border-2 border-zinc-200 dark:border-zinc-800 shadow-sm">
            {member.avatar?.url ? (
                <Image source={{uri: member.avatar.url}} style={{width: '100%', height: '100%'}}/>
            ) : (
                <Iconify icon="heroicons:user" size={28} color="#A1A1AA"/>
            )}
        </View>

        <AppText variant="h4" className="font-bold text-text-primary text-base mb-1">
            {member.name}
        </AppText>
    </View>
));
SettleHeader.displayName = 'SettleHeader';

export default SettleHeader;