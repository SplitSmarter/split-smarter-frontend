import { Redirect } from 'expo-router';

export default function AccountIndexScreen() {
    return <Redirect href="/(authenticated)/payment/account/add" />;
}