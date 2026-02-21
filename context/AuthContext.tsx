import { User, getCurrentUser, logoutUser } from "@/services/authServices";
import { useRouter, useSegments } from "expo-router";
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

    // Check if user is logged in on app load
    useEffect(() => {
        const checkUserLoggedIn = async () => {
            try {
                const response = await getCurrentUser();
                if (response.success && response.data.user) {
                    setUser(response.data.user);
                } else {
                    setUser(null);
                }
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkUserLoggedIn();
    }, []);

    // Handle navigation based on auth state
    useEffect(() => {
        if (loading) return;

        const inAuthGroup = segments[0] === "(auth)";

        if (!user && !inAuthGroup) {
            // Redirect to login if not authenticated
            router.replace("/");
        } else if (user && !inAuthGroup) {
            // Redirect to home if authenticated
            router.replace("/(tabs)");
        }
    }, [user, loading, segments]);

    // Logout Function
    const logout = async () => {
        try {
            await logoutUser();
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            setUser(null);
            router.replace("/");
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
