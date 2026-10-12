import React, {useMemo} from 'react';
import {View, ScrollView, TouchableOpacity} from 'react-native';
import {AppText} from "@/src/components/common/AppText";
import {AppImageV2} from "@/src/components/common/AppImageV2";
import {themeStore} from '@/src/store/themeStore';
import {COLORS} from '@/src/constants/colors';
import {PeerSettlement} from '../types/dashboard';

interface PrivateP2PSettlementsProps {
    peers: PeerSettlement[];
    onSelectPeer?: (peer: PeerSettlement) => void;
}

export const PrivateP2PSettlements: React.FC<PrivateP2PSettlementsProps> = ({
                                                                                peers,
                                                                                onSelectPeer,
                                                                            }) => {
    const isDark = themeStore((state) => state.theme === 'dark');
    const colors = isDark ? COLORS.dark : COLORS.light;

    // Sort peers by descending order of magnitude (largest settlement first)
    const sortedPeers = useMemo(() => {
        return [...peers].sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
    }, [peers]);

    return (
        <View className="px-5 mb-6">
            {/* Section Header */}
            <View className="flex-row justify-between items-center mb-3">
                <AppText
                    variant="h4"
                    className="font-bold"
                    style={{color: colors.text.primary}}
                >
                    Pending Peer Settlements
                </AppText>
            </View>

            {/* Horizontal Contact Cards Stream */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{paddingRight: 20}}
                className="flex-row space-x-3.5"
            >
                {sortedPeers.map((peer) => {
                    const isOweYou = peer.amount > 0 || peer.type === 'owe_you';
                    const ringColorClass = isOweYou ? 'border-green-increase' : 'border-amber-500/80';
                    const textColorClass = isOweYou ? 'text-green-increase' : 'text-amber-400';
                    const labelText = isOweYou ? 'You receive' : 'You owe';
                    const prefix = isOweYou ? '+$' : '-$';

                    return (
                        <TouchableOpacity
                            key={peer.id}
                            activeOpacity={0.75}
                            onPress={() => onSelectPeer?.(peer)}
                            className="p-4 rounded-3xl border items-center justify-center min-w-[115px] shadow-2xl"
                            style={{
                                backgroundColor: colors.bg.overlay,
                                borderColor: colors.status.border,
                            }}
                        >
                            {/* Avatar with Status Color Ring */}
                            <View
                                className={`w-12 h-12 rounded-full p-0.5 border-2 ${ringColorClass} mb-2 overflow-hidden shadow-md`}>
                                <AppImageV2
                                    id={peer.avatar.id}
                                    url={peer.avatar.url}
                                    contentFit="cover"
                                    style={{width: '100%', height: '100%', borderRadius: 999}}
                                />
                            </View>

                            {/* Contact Name */}
                            <AppText
                                variant="body-base"
                                className="font-semibold text-center"
                                numberOfLines={1}
                                style={{color: colors.text.primary}}
                            >
                                {peer.name}
                            </AppText>

                            {/* Subtle Status Label (styled like transaction timeLabel) */}
                            <AppText
                                variant="caption-xs"
                                className="mt-0.5 mb-1 font-normal"
                                style={{color: colors.text.lighter}}
                            >
                                {labelText}
                            </AppText>

                            {/* Formatted Net Amount */}
                            <AppText
                                variant="body-small"
                                className={`${textColorClass} font-bold tracking-tight`}
                            >
                                {prefix}{Math.abs(peer.amount).toLocaleString('en-US', {minimumFractionDigits: 0})}
                            </AppText>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};
