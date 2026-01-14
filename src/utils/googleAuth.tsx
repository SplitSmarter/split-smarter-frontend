import {GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes} from "@react-native-google-signin/google-signin";

export const googleSignIn = async () => {
    try {
        await GoogleSignin.hasPlayServices();
        const response = await GoogleSignin.signIn();
        if (isSuccessResponse(response)) {
            // console.log({ userInfo: response.data });
            return Promise.resolve({"userInfo": response.data})
        } else {
            console.log("cancelled");
        }
        return Promise.reject({"message": "An error occurred"});
    } catch (error) {
        if (isErrorWithCode(error)) {
            switch (error.code) {
                case statusCodes.IN_PROGRESS:
                    console.log("progress");
                    break;
                case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                    // Android only, play services not available or outdated
                    console.log("not available");
                    break;
                default:
                    // some other error happened
                    console.log(error.cause);
                    console.log(error.message);
                    console.error("an error occurred while signing in");
            }
        } else {
            // an error that's not related to google sign in occurred
            console.error("an error that's not related to google sign in occurred");
        }
        return Promise.reject({"message": "An error occurred"});
    }
};
