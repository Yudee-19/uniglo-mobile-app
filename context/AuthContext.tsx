import { User, getCurrentUser, logoutUser } from "@/services/authServices";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRootNavigationState, useRouter, useSegments } from "expo-router";
import {
    ReactNode,
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

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

    // Check if user is logged in on app load
    useEffect(() => {
        const checkUserLoggedIn = async () => {
            try {
                // Check if token exists in AsyncStorage
                const token = await AsyncStorage.getItem("authToken");

                if (token) {
                    // Token exists, fetch user profile
                    try {
                        const response = await getCurrentUser();
                        if (response.success && response.data.user) {
                            setUser(response.data.user);
                        } else {
                            // Token exists but profile fetch failed, clear token
                            await AsyncStorage.removeItem("authToken");
                            setUser(null);
                        }
                    } catch (error) {
                        // Token exists but profile fetch failed, clear token
                        await AsyncStorage.removeItem("authToken");
                        setUser(null);
                    }
                } else {
                    // No token, user is not logged in
                    setUser(null);
                }
            } catch (error) {
                console.error("Error checking auth token:", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkUserLoggedIn();
    }, []);

    // Handle navigation based on auth state - ONLY after navigation is ready
    useEffect(() => {
        if (loading) return;
        if (!navigationState?.key) return; // Wait for navigator to be ready

        const inAuthGroup = segments[0] === "(auth)";

        if (!user && !inAuthGroup) {
            router.replace("/(auth)/login");
        } else if (user && inAuthGroup) {
            router.replace("/(tabs)");
        }
    }, [user, loading, segments, navigationState?.key]);

    // Logout Function
    const logout = async () => {
        try {
            await logoutUser();
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            // Clear token from AsyncStorage (logoutUser already does this, but ensure it's cleared)
            await AsyncStorage.removeItem("authToken");
            setUser(null);
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
