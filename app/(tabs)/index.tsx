import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView>
                <View className="p-4">
                    <Text className="text-2xl font-bold mb-4">
                        Find Your Diamond
                    </Text>
                    {/* Add your home screen content here */}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
