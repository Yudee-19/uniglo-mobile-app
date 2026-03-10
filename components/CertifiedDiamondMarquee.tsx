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

// import React, { useEffect, useRef } from "react";
// import {
//     Animated,
//     Easing,
//     Image,
//     ScrollView,
//     View,
//     useWindowDimensions,
// } from "react-native";

// const CERT_LOGOS = [
//     require("../assets/images/certificates/igi.jpg"),
//     require("../assets/images/certificates/gia-removebg-preview.png"),
//     require("../assets/images/certificates/hrd-removebg-preview.png"),
// ];

// const CertifiedDiamondMarquee = () => {
//     const scrollRef = useRef<ScrollView>(null);
//     const animatedValue = useRef(new Animated.Value(0)).current;
//     const { width } = useWindowDimensions();
//     // Each logo ~96px wide + 32px margin = ~128px, 3 logos duplicated
//     const contentWidth = CERT_LOGOS.length * 128;

//     useEffect(() => {
//         const animate = () => {
//             animatedValue.setValue(0);
//             Animated.loop(
//                 Animated.timing(animatedValue, {
//                     toValue: -contentWidth,
//                     duration: 6000,
//                     easing: Easing.linear,
//                     useNativeDriver: true,
//                 }),
//             ).start();
//         };
//         animate();
//     }, []);

//     // Duplicate logos so the scroll looks continuous
//     const logos = [...CERT_LOGOS, ...CERT_LOGOS];

//     return (
//         <View className="w-full py-2 bg-white overflow-hidden">
//             <Animated.View
//                 style={[
//                     {
//                         flexDirection: "row",
//                         alignItems: "center",
//                         transform: [{ translateX: animatedValue }],
//                     },
//                 ]}
//             >
//                 {logos.map((source, i) => (
//                     <Image
//                         key={i}
//                         source={source}
//                         className="w-24 h-12 mx-4"
//                         resizeMode="contain"
//                     />
//                 ))}
//             </Animated.View>
//         </View>
//     );
// };

// export default CertifiedDiamondMarquee;
