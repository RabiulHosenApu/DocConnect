import React from "react";
import { colors } from "../styles/Theme";
import { Entypo } from "@expo/vector-icons";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
    Menu,
    MenuOption,
    MenuOptions,
    MenuTrigger,
} from "react-native-popup-menu";

export default function CardAppointment({
    appointment,
    onPressCancel,
    onPress,
}) {

    const fullName = appointment.dname;

    const formattedDate = new Date(appointment.date);
    const day = formattedDate.getDate();
    const month = formattedDate.toLocaleString("default", { month: "short" });

    return (
        <View>
            <View style={styles.container}>
                <View style={styles.date_container}>
                    <View>
                        <Text style={styles.date_text}>{day}</Text>
                    </View>
                    <View>
                        <Text style={styles.month_text}>{month}</Text>
                    </View>
                </View>
                <View style={styles.info_container}>
                    <Text style={styles.appType}> {fullName}</Text>
                    <Text style={styles.time}>
                        {appointment.time}
                    </Text>
                    <View style={styles.location_container}>
                            <Ionicons
                                name="location"
                                size={18}
                                color={colors.color_primary}
                            />
                            <Text style={styles.location}>
                                {appointment.area}
                            </Text>

                            </View>
                </View>
                <TouchableOpacity style={styles.icon_container}>
                    <Menu>
                        <MenuTrigger>
                            <Entypo
                                name="dots-three-vertical"
                                size={20}
                                color={colors.color_light_gray}
                                onPress={onPress}
                            />
                        </MenuTrigger>
                        <MenuOptions>
                            <MenuOption
                                onSelect={onPressCancel}
                                text="Cancel"
                            ></MenuOption>
                        </MenuOptions>
                    </Menu>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: "row",
        borderRadius: 20,
        marginHorizontal: 24,
        marginBottom: 16,
        paddingVertical: 8,
        backgroundColor: colors.color_white,
        shadowColor: colors.color_gray,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        elevation: 6,
    },
    date_container: {
        backgroundColor: colors.color_primary,
        marginHorizontal: 8,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 8,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: colors.color_gray,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    info_container: {
        flex: 1,
        justifyContent: "center",
    },
    icon_container: {
        margin: 16,
        justifyContent: "flex-start",
    },
    location_container: {
        flexDirection: "row",
    },
    date_text: {
        fontFamily: "Mulish-Medium",
        fontSize: 34,
        color: colors.color_white,
    },
    month_text: {
        fontFamily: "Mulish-Medium",
        fontSize: 18,
        color: colors.color_white,
    },
    appType: {
        fontFamily: "Mulish-Medium",
        fontSize: 18,
        padding: 8,
    },
    time: {
        fontFamily: "Mulish-Medium",
        fontSize: 14,
        padding: 8,
        color: colors.color_gray,
    },
});
