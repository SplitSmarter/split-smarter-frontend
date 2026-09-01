import { Redirect } from 'expo-router';

export default function PaymentIndexScreen() {
    return <Redirect href="/(authenticated)/payment/account/add" />;
}