import { useAuth } from "@/context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Image } from "react-native";

export default function Index() {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (isAuthenticated) {
                // User is logged in, redirect to tabs
                router.replace("/(tabs)");
            } else {
                // User is not logged in, redirect to login
                router.replace("/(auth)/login");
            }
        }
    }, [isAuthenticated, loading]);

    // Show loading screen while checking auth state
    return (
        <LinearGradient
            colors={["#2e1035", "#050208"]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            className="flex-1 items-center justify-center"
        >
            <Image
                source={require("../assets/images/logo.png")}
                className="w-28 h-28 mb-2"
                resizeMode="contain"
            />
        </LinearGradient>
    );
}
