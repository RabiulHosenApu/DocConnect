import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { getAuth, signOut } from "firebase/auth";
import { app } from "../../firebaseConfig";
import { Feather } from "@expo/vector-icons";
import CardSmall from "../components/CardSmall";
import { showTopMessage } from "../utils/ErrorHandler";
import { colors } from "../styles/Theme";
import UploadImage from "../components/UploadImage";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function UserProfileScreen({ navigation }) {
    const auth = getAuth();
    const user = auth.currentUser;
    const [userInfo,setUserInfo] = useState("");
    useEffect(() => {
        const db = getFirestore(app);
        const docRef = doc(db, "userinfo", user.uid);
        getDoc(docRef)
        .then((docSnapshot) => {
            if (docSnapshot.exists()) {
                // Document exists, extract data
                const userData = docSnapshot.data();
                setUserInfo(userData);
            } else {
                // Document does not exist
                console.log("Document does not exist");
            }
        })
        .catch((error) => {
            // Error handling
            console.error("Error getting document:", error);
        });
    }, []);




    //sing out user
    function handleSignOut() {
        signOut(auth)
            .then((res) => {
                AsyncStorage.clear()
                .then(() => {
                    showTopMessage("Session ended", "success");
                    goToLogin();
                })
                .catch((error) => {
                    console.error("Error clearing AsyncStorage:", error);
                    // Still navigate to login screen even if AsyncStorage clearing fails
                    showTopMessage("Session ended, but there was an error", "error");
                    goToLogin();
                });
            })
            .catch((err) => console.log(err));
    }

    // Navigation
    function goToLogin() {
        navigation.navigate("LoginScreen");
    }

    // Navigation
    function goToBookingHistory() {
        navigation.navigate("BookingHistoryScreen");
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header_text}>My Profile</Text>

            <View style={styles.section_container}>

                <View style={styles.user_card}>
                    <View style={styles.title_container}>
                        <Text style={styles.title}>
                            {userInfo.firstname} {userInfo.lastname}
                        </Text>
                        <Text style={styles.desc}>{userInfo.phonenumber}</Text>
                    </View>
                    <UploadImage id={user.uid}/>
                </View>

                <CardSmall
                
                    iconName={"user"}
                    text={"My Account Information"}
                />
                <CardSmall
                    onSelect={goToBookingHistory}
                    iconName={"list"}
                    text={"My Past Appointments"}
                />
                <CardSmall
                    iconName={"message-square"}
                    text={"Feedback"}
                />

                <View style={styles.logo_container}>
                    <TouchableOpacity
                        style={styles.logout_container}
                        onPress={handleSignOut}
                    >
                        <Text style={styles.text}>Sign Out</Text>
                        <Feather
                            style={styles.icon}
                            name="log-out"
                            size={24}
                            color="black"
                        />
                    </TouchableOpacity>
                </View>
                
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 48,
    },
    user_card: {
        flexDirection: "row",
        borderRadius: 20,
        marginHorizontal: 24,
        marginBottom: 16,
        backgroundColor: colors.color_white,
        padding:16
    },
    section_container: {
        flex: 1,
        marginBottom: 16,
    },
    text_container: {
        flex: 1,
    },
    title_container: {
        flex: 1,
        justifyContent: "center",
        paddingHorizontal:16
    },
    title: {
        fontSize: 18,
        fontFamily: "Mulish-Medium",
    },
    desc: {
        fontSize: 14,
        fontFamily: "Mulish-Light",
        color: colors.color_gray,
    },
    logout_container: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems:"center"
    },
    header_text: {
        marginHorizontal: 24,
        marginVertical: 16,
        fontSize: 30,
        fontFamily: "Mulish-Medium",
    },
    logo_container: {
        flex: 1,
        marginVertical: 24,
        alignItems: "center",
    },
    logo_text: {
        fontSize: 34,
        fontFamily: "Mulish-Medium",
        color: colors.color_light_gray,
    },
    icon: {
        padding: 4,
    },
    text: {
        padding: 8,
        fontSize: 18,
        fontFamily: "Mulish-Medium",
    },
});
