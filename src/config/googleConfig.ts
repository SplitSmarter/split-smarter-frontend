import {GoogleSignin} from "@react-native-google-signin/google-signin";
import {GOOGLE_IOS_CLIENT_ID, GOOGLE_WEB_CLIENT_ID} from "@/src/config/config";

GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    offlineAccess: true,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    forceCodeForRefreshToken: true,
});
