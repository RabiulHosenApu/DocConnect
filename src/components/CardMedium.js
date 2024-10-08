import React from "react";
import {
    Image,
    StyleSheet,
    Text,
    View,
    TouchableWithoutFeedback,
    ScrollView,
} from "react-native";
import { colors } from "../styles/Theme";
import { Ionicons } from "@expo/vector-icons";

export default function CardMedium({ doctor, onSelect }) {
    return (
            <View style={styles.container}>
                <TouchableWithoutFeedback onPress={onSelect}>
                <View style={styles.info_container}>
                <Image source={{ uri: doctor.image }} style={styles.image} />
                    <View style={styles.text_container}>
                        <View style={styles.title_container}>
                            <Text style={styles.title}>
                                {doctor.dname}
                            </Text>
                            <Text style={styles.desc}>
                                {doctor.department}
                            </Text>
                        </View>

                        <View style={styles.location_container}>
                            <Ionicons
                                name="location"
                                size={18}
                                color={colors.color_primary}
                            />
                            <Text style={styles.location}>
                                {doctor.area}
                            </Text>
                        </View>
                    </View>
                </View>
                </TouchableWithoutFeedback>
                <View style={styles.skills_container}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.contentContainer}
                    >
                        {doctor.schedule.map((schedulE, index) => (
                            <View key={index} style={styles.chip_container}>
                                <Text style={styles.chips}>{schedulE.day} {schedulE.time}</Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderRadius: 20,
        padding: 16,
        marginHorizontal: 24,
        marginVertical: 8,
        backgroundColor: colors.color_white,
        shadowColor: colors.color_light_gray,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        elevation: 4,
        justifyContent: "center",
    },
    info_container: {
        flex: 1,
        flexDirection: "row",
        backgroundColor: colors.color_white,
        justifyContent: "center",
        paddingBottom: 8,
    },
    image: {
        marginRight: 16,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 50,
        overflow: "hidden",
        width: 72,
        height: 72,
    },
    text_container: {
        flex: 1,
    },
    title_container: {
        flex: 1,
    },
    location_container: {
        flexDirection: "row",
    },
    skills_container: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
    },
    contentContainer: {
        paddingHorizontal: 16, // Add horizontal padding to the content container
        minWidth: '100%', // Set a minimum width to enable scrolling
    },
    chip_container: {
        borderRadius: 20,
        backgroundColor: colors.color_secondary,
        padding: 12,
        margin: 4,
    },
    chips: {
        alignSelf: "flex-start",
        fontFamily: "Mulish-Light",
        color: colors.color_white,
    },
    title: {
        fontSize: 18,
        fontFamily: "Mulish-Medium",
    },
    desc: {
        fontSize: 16,
        fontFamily: "Mulish-Light",
        color: colors.color_gray,
    },
    location: {
        fontSize: 16,
        fontFamily: "Mulish-Light",
        flex: 1,
        color: colors.color_primary,
        justifyContent: "center",
    },
});
