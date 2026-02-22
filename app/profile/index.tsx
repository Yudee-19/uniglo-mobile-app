import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 items-center justify-center">
                <Text className="text-xl font-loraBold text-primary-purple">
                    Profile
                </Text>
            </View>
        </SafeAreaView>
    );
}
