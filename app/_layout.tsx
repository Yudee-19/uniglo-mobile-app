import { AuthProvider } from "@/context/AuthContext";
import {
    CormorantGaramond_400Regular,
    CormorantGaramond_600SemiBold,
    CormorantGaramond_700Bold,
} from "@expo-google-fonts/cormorant-garamond";
import {
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    useFonts,
} from "@expo-google-fonts/inter";
import { Lato_400Regular, Lato_700Bold } from "@expo-google-fonts/lato";
import {
    Lora_400Regular,
    Lora_600SemiBold,
    Lora_700Bold,
} from "@expo-google-fonts/lora";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "./global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [fontsLoaded, fontError] = useFonts({
        Inter_400Regular,
        Inter_600SemiBold,
        Inter_700Bold,
        CormorantGaramond_400Regular,
        CormorantGaramond_600SemiBold,
        CormorantGaramond_700Bold,
        Lora_400Regular,
        Lora_600SemiBold,
        Lora_700Bold,
        Lato_400Regular,
        Lato_700Bold,
    });

    useEffect(() => {
        if (fontsLoaded || fontError) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded, fontError]);

    if (!fontsLoaded && !fontError) {
        return null;
    }

    return (
        <AuthProvider>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                {/* <Stack.Screen name="cart" options={{ headerShown: false }} />
                <Stack.Screen name="profile" options={{ headerShown: false }} />
                <Stack.Screen name="diamond" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} /> */}
            </Stack>
        </AuthProvider>
    );
}
