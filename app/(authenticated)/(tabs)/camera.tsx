import React from "react";
import { View, StyleSheet } from "react-native";
import ExpenseChatGroupListScreen from "@/src/screens/ExpenseChatGroupListScreen";
import AddExpenseCategoryScreen from "@/src/screens/expense/AddExpenseCategory";
import AddGroupCategoryScreen from "@/src/screens/group/AddGroupCategory";
import AddRelationshipScreen from "@/src/screens/relation/AddRelationshipScreen";
import AddCustomUserScreen from "@/src/screens/user/AddCustomUserScreen";
import AddUserScreen from "@/src/screens/user/AddUser";
import AddGroupScreen from "@/src/screens/group/AddGroup";
import SettleButton from "@/src/screens/test/SettleButton";
import QRScannerPaymentScreen from "@/src/screens/test/QRScannerPaymentScreen";
import GroupDetailsScreen from "@/src/screens/group/GroupDetailsScreen";
import {SplitBackgroundScroll} from "@/src/screens/test/SplitBackgroundScroll";

const Camera = () => {
    return (
        // <View style={styles.container}>
        // </View>
            <SplitBackgroundScroll  />
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#F3F4F6',
    },
});

export default Camera;