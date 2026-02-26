import { Marquee } from "@animatereactnative/marquee";
import React from "react";
import { Image, View } from "react-native";

const CERT_LOGOS = [
    require("../assets/images/certificates/igi.jpg"),
    require("../assets/images/certificates/gia-removebg-preview.png"),
    require("../assets/images/certificates/hrd-removebg-preview.png"),
    // Add more logos as needed
];

const CertifiedDiamondMarquee = () => (
    <View className="w-full py-2 bg-white">
        <Marquee direction="horizontal">
            <View className="  flex-row items-center">
                <Image
                    key={1}
                    source={CERT_LOGOS[0]}
                    className="w-24 h-12 mx-4"
                    resizeMode="contain"
                />
                <Image
                    key={2}
                    source={CERT_LOGOS[1]}
                    className="w-24 h-12 mx-4"
                    resizeMode="contain"
                />
                <Image
                    key={3}
                    source={CERT_LOGOS[2]}
                    className="w-24 h-12 mx-4"
                    resizeMode="contain"
                />
            </View>
        </Marquee>
    </View>
);

export default CertifiedDiamondMarquee;
