import { useAuth } from "@/context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "react-native";

export default function Index() {
    const { loading } = useAuth();

    // This is just a splash/loading screen now.
    // AuthContext handles all navigation.
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
