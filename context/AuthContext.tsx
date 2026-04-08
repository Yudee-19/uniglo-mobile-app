import { resetSessionExpiredFlag } from "@/services/api";
import { User, getCurrentUser, logoutUser } from "@/services/authServices";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AxiosError } from "axios";
import {
    usePathname,
    useRootNavigationState,
    useRouter,
    useSegments,
} from "expo-router";

import {
    ReactNode,
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { DeviceEventEmitter } from "react-native";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    setUser: (user: User | null) => void;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const segments = useSegments();
    const navigationState = useRootNavigationState();
    const pathname = usePathname();

    // Guard: prevents duplicate session-expiry handling
    const isLoggingOut = useRef(false);

    // Check if user is logged in on app load
    useEffect(() => {
        const checkUserLoggedIn = async () => {
            try {
                // 1. Instantly check for token AND cached user profile
                const token = await AsyncStorage.getItem("authToken");
                const cachedUserString = await AsyncStorage.getItem("authUser");

                if (token) {
                    // 2. Hydrate state immediately if we have cached data
                    if (cachedUserString) {
                        setUser(JSON.parse(cachedUserString));
                    }

                    // 3. Unblock the UI immediately!
                    setLoading(false);

                    // 4. Fetch fresh data in the background silently
                    try {
                        const response = await getCurrentUser();
                        if (response.success && response.data.user) {
                            setUser(response.data.user);
                            await AsyncStorage.setItem(
                                "authUser",
                                JSON.stringify(response.data.user),
                            );
                        }
                    } catch (error) {
                        const axiosError = error as AxiosError;
                        if (axiosError.response?.status === 401) {
                            // The EXPIRED_SESSION event handler already takes
                            // care of cleanup & navigation — nothing extra needed here.
                            // Just make sure local state is consistent.
                            if (!isLoggingOut.current) {
                                await AsyncStorage.multiRemove([
                                    "authToken",
                                    "authUser",
                                ]);
                                setUser(null);
                            }
                        } else {
                            // It's a network error (offline). Leave the cached user intact.
                            console.log(
                                "Offline mode: using cached user data.",
                            );
                        }
                    }
                } else {
                    // No token, user is not logged in
                    setLoading(false);
                    setUser(null);
                }
            } catch (error) {
                console.error("Error reading from AsyncStorage:", error);
                setLoading(false);
                setUser(null);
            }
        };

        checkUserLoggedIn();
    }, []);

    // Handle navigation based on auth state - ONLY after navigation is ready
    useEffect(() => {
        if (loading) return;
        if (!navigationState?.key) return;

        const inAuthGroup = segments[0] === "(auth)";

        if (user) {
            // User IS logged in.
            // If they are on the login screens OR at the blank root screen, push to tabs.
            if (inAuthGroup || pathname === "/") {
                router.replace("/(tabs)");
            }
        } else if (!user && pathname === "/") {
            // Not logged in and at root — go to tabs (home is public)
            router.replace("/(tabs)");
        }
    }, [user, loading, segments, pathname, navigationState?.key]);

    // Listen for 401 Unauthorized events from Axios (fires at most once
    // thanks to the isSessionExpired flag in api.ts)
    useEffect(() => {
        const subscription = DeviceEventEmitter.addListener(
            "EXPIRED_SESSION",
            async () => {
                // Guard: if we are already processing a logout, skip
                if (isLoggingOut.current) return;
                isLoggingOut.current = true;

                console.log("Session expired globally. Forcing logout...");

                // Wipe local storage
                await AsyncStorage.multiRemove(["authToken", "authUser"]);

                // Reset context state — the navigation useEffect above will
                // detect user === null and redirect to /(auth)/login, so we
                // do NOT call router.replace here to avoid competing navigations.
                setUser(null);
            },
        );

        // Cleanup the listener when the provider unmounts
        return () => {
            subscription.remove();
        };
    }, []);

    // Logout Function (user-initiated)
    const logout = async () => {
        // Prevent the 401 interceptor from also firing EXPIRED_SESSION
        isLoggingOut.current = true;

        try {
            await logoutUser();
        } catch (error) {
            console.error("Logout API failed, forcing local logout", error);
        } finally {
            // Clear token from AsyncStorage (logoutUser already does this, but ensure it's cleared)
            setUser(null);

            // Reset guards so the next login cycle works cleanly
            isLoggingOut.current = false;
            resetSessionExpiredFlag();

            router.replace("/(auth)/login");
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                setUser,
                logout,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
