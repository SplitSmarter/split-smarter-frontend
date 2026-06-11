// ============================================================================
// ISOLATED WORKER SUB-COMPONENT
// ============================================================================
import React, { useEffect, useState } from "react";
import { useRouter, Href } from "expo-router";
import { UserSearchResponse } from "@/src/api/dto/user/user";
import { RelationshipDetails } from "@/src/api/dto/user/relationship";
import { useAlert } from "@/src/context/alertContext";
import { getRelationshipsApi } from "@/src/api/relations/relationship";
import { SearchUsersApi } from "@/src/api/user/user";
import { RelationWithUserType } from "@/src/api/dto/constants";
import { createCustomUserApi } from "@/src/api/user/customuser";
import { logStore } from "@/src/store/logStore";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { AppText } from "@/src/components/common/AppText";
import { AppInput } from "@/src/components/common/AppInput";
import { Iconify } from "react-native-iconify";
import { COLORS } from "@/src/constants/colors";
import { AppImageV2 } from "@/src/components/common/AppImageV2";
import { AppButton } from "@/src/components/common/AppButton";
import { AddRelationApi } from "@/src/api/relations/relation";

type SelectedPersonState =
    | { type: 'VERIFIED'; id: number; name: string; avatarId?: string; avatarUrl?: string }
    | { type: 'CUSTOM'; name: string };

interface RelationshipFormProps {
    isDark: boolean;
    defaultAvatarAssetId: string;
    onSuccess: () => void;
}

export function RelationshipForm({ isDark, defaultAvatarAssetId, onSuccess }: RelationshipFormProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [globalResults, setGlobalResults] = useState<UserSearchResponse[]>([]);
    const [relationshipTypes, setRelationshipTypes] = useState<RelationshipDetails[]>([]);
    const [selectedPerson, setSelectedPerson] = useState<SelectedPersonState | null>(null);
    const [selectedRelationshipId, setSelectedRelationshipId] = useState<number | null>(null);

    const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);
    const [fetchingRelations, setFetchingRelations] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const { showAlert } = useAlert();
    const addRelationshipRoute = "/(authenticated)/user/relationship/add" as Href;

    // Fetch and explicitly format relationship data models
    useEffect(() => {
        let isMounted = true;
        const fetchRelationships = async () => {
            try {
                const res = await getRelationshipsApi({ limit: 50 });
                if (res?.data && Array.isArray(res.data) && isMounted) {
                    const formattedRelations: RelationshipDetails[] = res.data.map((item: any) => ({
                        id: item.id,
                        title: item.title,
                        description: item.description ?? "",
                        type: item.type,
                        icon: {
                            id: item.icon?.id ?? "",
                            name: item.icon?.name ?? "default_icon",
                            url: item.icon?.url ?? "",
                            extension: item.icon?.extension ?? "png"
                        },
                        created_at: item.created_at
                    }));
                    setRelationshipTypes(formattedRelations);
                }
            } catch (err) {
                console.error("Failed fetching relationship configurations", err);
            } finally {
                if (isMounted) setFetchingRelations(false);
            }
        };
        fetchRelationships();
        return () => {
            isMounted = false;
        };
    }, []);

    // Debounced Search Engine Context worker
    useEffect(() => {
        if (!searchQuery.trim() || selectedPerson) {
            setGlobalResults([]);
            return;
        }

        const taskDelayTimer = setTimeout(async () => {
            setIsSearchingGlobal(true);
            try {
                const res = await SearchUsersApi({ q: searchQuery });
                if (res.data) setGlobalResults(res.data);
            } catch (err) {
                console.error("Search runtime mapping context structural tracking error", err);
            } finally {
                setIsSearchingGlobal(false);
            }
        }, 400);

        return () => clearTimeout(taskDelayTimer);
    }, [searchQuery, selectedPerson]);

    const handleSaveRelationship = async () => {
        if (isSaving || !selectedPerson || !selectedRelationshipId) return;

        setIsSaving(true);
        try {
            if (selectedPerson.type === 'VERIFIED') {
                const res = await AddRelationApi({
                    user_id: selectedPerson.id,
                    user_type: RelationWithUserType.USER,
                    relationship_id: selectedRelationshipId
                });
                if (res.data) {
                    showAlert("Relationship added successfully!", "success");
                    onSuccess();
                }
            } else {
                const res = await createCustomUserApi({
                    name: selectedPerson.name,
                    relationship_id: selectedRelationshipId,
                    avatar_asset_id: defaultAvatarAssetId
                });
                if (res.data) {
                    showAlert(`Created contact for ${selectedPerson.name}`, "success");
                    onSuccess();
                }
            }
        } catch (err: any) {
            showAlert(err?.message || "Failed execution step.", "error");
            logStore.getState().addLog({
                level: 'ERROR',
                message: err?.message || "Failed execution link pass.",
                context: { error: err }
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <ScrollView
            className="flex-1 px-6"
            contentContainerStyle={{ paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
        >
            {/* Step 1 Section: Search & Pick Block */}
            <View className="mt-4">
                <AppText variant="body-base" className="font-bold mb-2 text-text-primary">
                    Who is this relationship with?
                </AppText>

                {!selectedPerson ? (
                    <View>
                        <AppInput
                            placeholder="Search name, phone number, or email..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            renderLeftIcon={(c) => <Iconify icon="heroicons:magnifying-glass" size={20} color={c} />}
                            renderRightIcon={() => isSearchingGlobal ? <ActivityIndicator size="small" color={COLORS.icon_primary_darker_light} /> : null}
                        />

                        {searchQuery.trim().length > 0 && (
                            <View className="mt-2 rounded-2xl overflow-hidden border border-bg-secondary-lighter bg-white dark:bg-zinc-900 shadow-sm">
                                <Pressable
                                    onPress={() => setSelectedPerson({ type: 'CUSTOM', name: searchQuery.trim() })}
                                    className="flex-row items-center p-4 border-b border-gray-100 dark:border-zinc-800 bg-bg-secondary/5"
                                >
                                    <Iconify icon="heroicons:user-plus-solid" size={22} color={COLORS.icon_primary_darker_light} />
                                    <AppText className="ml-3 font-semibold text-text-primary flex-1">
                                        Add &#34;{searchQuery}&#34; as custom contact
                                    </AppText>
                                </Pressable>

                                {globalResults.map((user) => {
                                    const hasExistingRelation = !!user.relation;

                                    return (
                                        <Pressable
                                            key={`user-${user.id}`}
                                            disabled={hasExistingRelation}
                                            pointerEvents={hasExistingRelation ? 'none' : 'auto'}
                                            onPress={() => setSelectedPerson({
                                                type: 'VERIFIED',
                                                id: user.id,
                                                name: user.name,
                                                avatarId: user.avatar?.id,
                                                avatarUrl: user.avatar?.url
                                            })}
                                            className={`flex-row items-center p-4 border-b border-gray-100 dark:border-zinc-800 ${
                                                hasExistingRelation ? 'opacity-40 bg-gray-50/50 dark:bg-zinc-900/50' : ''
                                            }`}
                                        >
                                            <View className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 dark:bg-zinc-800">
                                                <AppImageV2
                                                    id={user.avatar?.id || `${user.id}-search-img`}
                                                    url={user.avatar?.url}
                                                    style={{ width: '100%', height: '100%' }}
                                                />
                                            </View>

                                            <View className="ml-3 flex-1">
                                                <AppText className="font-semibold text-text-primary">{user.name}</AppText>
                                                <AppText variant="caption-xs" className="text-text-secondary">
                                                    {hasExistingRelation
                                                        ? `Already your ${user.relation?.relationship.title || 'relation'}`
                                                        : 'Verified Network Profile'
                                                    }
                                                </AppText>
                                            </View>

                                            {hasExistingRelation ? (
                                                <View className="flex-row items-center bg-gray-200/60 dark:bg-zinc-800 px-2.5 py-1 rounded-full">
                                                    <Iconify icon="heroicons:lock-closed-solid" size={12} color={isDark ? "#A1A1AA" : "#71717A"} />
                                                    <AppText className="text-[10px] font-bold text-text-secondary ml-1 uppercase tracking-wider">
                                                        Added
                                                    </AppText>
                                                </View>
                                            ) : (
                                                <Iconify icon="heroicons:check-badge" size={20} color="#3B82F6" />
                                            )}
                                        </Pressable>
                                    );
                                })}
                            </View>
                        )}
                    </View>
                ) : (
                    <View className="flex-row items-center p-4 rounded-2xl bg-bg-primary-lighter border border-bg-secondary-lighter justify-between">
                        <View className="flex-row items-center flex-1">
                            <View className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 dark:bg-zinc-800">
                                <AppImageV2
                                    id={selectedPerson.type === 'VERIFIED' ? (selectedPerson.avatarId || `${selectedPerson.id}-ribbon-img`) : defaultAvatarAssetId}
                                    url={selectedPerson.type === 'VERIFIED' ? selectedPerson.avatarUrl : undefined}
                                    style={{ width: '100%', height: '100%' }}
                                />
                            </View>
                            <View className="ml-3 flex-1">
                                <AppText className="font-bold text-text-primary text-lg">{selectedPerson.name}</AppText>
                                <AppText variant="caption-xs" className="text-text-secondary uppercase tracking-wider font-semibold">
                                    {selectedPerson.type === 'VERIFIED' ? 'Verified App Profile' : 'Custom Local Contact'}
                                </AppText>
                            </View>
                        </View>
                        <Pressable
                            onPress={() => {
                                setSelectedPerson(null);
                                setSelectedRelationshipId(null);
                            }}
                            className="p-2 bg-gray-200 dark:bg-zinc-800 rounded-full"
                        >
                            <Iconify icon="heroicons:x-mark" size={16} color={isDark ? "#FFF" : "#000"} />
                        </Pressable>
                    </View>
                )}
            </View>

            {/* Step 2 Section: Pick Relationship Context Balanced Matrix Grid Layout */}
            {selectedPerson && (
                <View className="mt-8">
                    <View className="flex-row justify-between items-end mb-4 px-1">
                        <AppText variant="body-base" className="font-bold text-text-primary uppercase tracking-widest opacity-60">
                            Relationship
                        </AppText>
                        <Pressable onPress={() => router.push(addRelationshipRoute)}>
                            <AppText className="text-bg-secondary font-bold">+ Create New</AppText>
                        </Pressable>
                    </View>

                    {fetchingRelations ? (
                        <ActivityIndicator color="rgb(var(--color-bg-secondary))" />
                    ) : (
                        <View className="flex-row flex-wrap justify-between">
                            {relationshipTypes.map((type) => {
                                const isSelected = selectedRelationshipId === type.id;
                                return (
                                    <Pressable
                                        key={`rel-type-${type.id}`}
                                        onPress={() => setSelectedRelationshipId(type.id)}
                                        style={{ width: '48%' }}
                                        className={`mb-4 p-4 rounded-3xl border-2 flex-row items-center ${
                                            isSelected
                                                ? 'bg-bg-secondary border-bg-secondary'
                                                : 'bg-bg-primary-lighter border-bg-secondary-lighter/20'
                                        }`}
                                    >
                                        <AppImageV2
                                            id={`rel-icon-${type.id}`}
                                            url={type.icon?.url}
                                            style={{ width: 32, height: 32 }}
                                            className="rounded-full"
                                            contentFit="cover"
                                            fallbackComponent={
                                                <View style={{ width: 32, height: 32 }} className="bg-gray-200 dark:bg-zinc-800 rounded-full items-center justify-center">
                                                    <Iconify icon="heroicons:heart" size={16} color={isSelected ? "#FFF" : "#9CA3AF"} />
                                                </View>
                                            }
                                        />
                                        <AppText
                                            className={`ml-3 font-semibold flex-1 ${isSelected ? 'text-white font-bold' : 'text-text-primary'}`}
                                            numberOfLines={1}
                                        >
                                            {type.title}
                                        </AppText>
                                    </Pressable>
                                );
                            })}
                        </View>
                    )}
                </View>
            )}

            {/* Action Call to Action Button */}
            {selectedPerson && selectedRelationshipId && (
                <View className="mt-8">
                    <AppButton
                        variant="primary"
                        className="w-full h-14 rounded-2xl"
                        onPress={handleSaveRelationship}
                        loading={isSaving}
                        loadingText="Saving..."
                    >
                        Confirm Relationship
                    </AppButton>
                </View>
            )}
        </ScrollView>
    );
}