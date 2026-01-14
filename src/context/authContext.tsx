// import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
// // import {googleSignIn} from "@/src/utils/googleAuth";
// import AsyncStorage from "@react-native-async-storage/async-storage";
import {User} from "@/src/types/auth";
// import {setupInterceptor} from "@/src/api/tokenInterceptor";
// import axiosUserServiceInstance from "@/src/api/axiosUserServiceInstance";
// import axiosInternalInstance from "@/src/api/axiosInternalInstance";
//
// let logoutHandler: (() => Promise<void>) | null = null;
//
// export const registerLogoutHandler = (fn: () => Promise<void>) => {
//     logoutHandler = fn;
// };
//
// export const getLogoutHandler = () => logoutHandler;
//
// export type AuthContextType = {
//     user: User | null;
//     login: (data: User) => Promise<void>;
//     logout: () => Promise<void>;
//     isAuthenticated: boolean;
//     isLoading: boolean;
// };
//
// const AuthContext = createContext<AuthContextType | undefined>(undefined);
//
// export const USER_STORAGE_KEY = "@auth_user";
//
// export function AuthProvider({ children }: { children: ReactNode }) {
//     const [user, setUser] = useState<User | null>(null);
//     const [isLoading, setLoading] = useState(true);
//     // const googleSignin = googleSignIn();
//
//     useEffect(() => {
//         const loadUser = async () => {
//             try {
//                 const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
//                 if (storedUser) {
//                     console.info("User storage key found: ", storedUser);
//                     const parsed = JSON.parse(storedUser);
//                     setUser(parsed);
//                 }
//                 else{
//                     console.info("User storage key not found");
//                 }
//             } catch (err) {
//                 console.error("Failed to load user:", err);
//             } finally {
//                 setLoading(false);
//             }
//         };
//
//         loadUser();
//     }, []);
//
//     const login = async (data: User) => {
//         setUser(data);
//         try {
//             await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data));
//         } catch (err) {
//             console.error("Failed to save user:", err);
//         }
//     };
//
//     const logout = async () => {
//         setUser(null);
//         try {
//             await AsyncStorage.removeItem(USER_STORAGE_KEY);
//         } catch (err) {
//             console.error("Failed to remove user:", err);
//         }
//     };
//
//     useEffect(() => {
//         registerLogoutHandler(logout);
//     }, [logout]);
//
//     return (
//         <AuthContext.Provider
//             value={{ user, login, logout, isAuthenticated: !!user, isLoading }}
//         >
//             {children}
//         </AuthContext.Provider>
//     );
// }
//
// export function useAuth(): AuthContextType {
//     const context = useContext(AuthContext);
//     if (!context) throw new Error('useAuth must be used within AuthProvider');
//     return context;
// }
