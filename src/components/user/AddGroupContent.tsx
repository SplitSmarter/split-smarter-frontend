import React, { useState } from 'react';
import { View, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { CreateGroupApi } from "@/src/api/group/group";
import { RelationDetails } from "@/src/api/dto/user/relation";
import { systemStore } from "@/src/store/systemStore";

// Sub-components
import { GroupForm } from '@/src/components/user/GroupForm';
import { SelectPeopleView } from '@/src/components/user/SelectPeopleView';

enum InternalView {
    FORM = 'FORM',
    SELECT_PEOPLE = 'SELECT_PEOPLE'
}

interface AddGroupContentProps {
    onCancel: () => void;
    onSuccess: (groupId: number) => void;
}

export const AddGroupContent = React.memo<AddGroupContentProps>(({ onCancel, onSuccess }: AddGroupContentProps) => {
    const { defaults } = systemStore();
    const [view, setView] = useState<InternalView>(InternalView.FORM);

    // Shared State
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
    const [relations, setRelations] = useState<RelationDetails[]>([]);

    const toggleUser = (userId: number) => {
        setSelectedUserIds(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const handleSelection = (ids: number[], allRelations: RelationDetails[]) => {
        setSelectedUserIds(ids);
        setRelations(allRelations); // Save the full details for GroupForm and API
        setView(InternalView.FORM);
    };

    const handleCreateGroup = async () => {
        if (!title.trim()) return Alert.alert("Required", "Please provide a group title.");

        setLoading(true);
        const usersPayload = selectedUserIds.flatMap(id => {
            const relation = relations.find(r => r.with_user.id === id);
            return relation ? [{ id: relation.with_user.id, type: relation.with_user.user_type }] : [];
        });

        const response = await CreateGroupApi({
            title: title.trim(),
            description: description.trim(),
            icon_asset_id: defaults.defaultGroupIconImage.id,
            background_asset_id: defaults.defaultGroupBackgroundImage.id,
            category_id: defaults.defaultGroupCategory.id,
            users: usersPayload
        });

        setLoading(false);
        if (response.data) onSuccess(response.data.id);
        else Alert.alert("Error", response.message || "Could not create group.");
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
            // Ensure the keyboard offset accounts for the bottom sheet height if needed
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View className="flex-1">
                    {view === InternalView.SELECT_PEOPLE ? (
                        <SelectPeopleView
                            initialSelectedIds={selectedUserIds}
                            onSelectionConfirmed={handleSelection}
                            onCancel={() => setView(InternalView.FORM)}
                        />
                    ) : (
                        <GroupForm
                            title={title}
                            setTitle={setTitle}
                            description={description}
                            setDescription={setDescription}
                            selectedUserIds={selectedUserIds}
                            relations={relations}
                            loading={loading}
                            onOpenSelect={() => setView(InternalView.SELECT_PEOPLE)}
                            onRemoveUser={toggleUser}
                            onSubmit={handleCreateGroup}
                            onCancel={onCancel}
                        />
                    )}
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
});

AddGroupContent.displayName = "AddGroupContent";