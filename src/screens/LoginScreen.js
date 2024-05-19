import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Button from "../components/button/Button";
import InputBar from "../components/InputBar";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import app from "../../firebaseConfig";
import { Formik } from "formik";
import ErrorHandler, { showTopMessage } from "../utils/ErrorHandler";
import { colors } from "../styles/Theme";
import AsyncStorage from "@react-native-async-storage/async-storage";

const initialFormValues = {
    usermail: "",
    password: "",
};

const LoginScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(false);

    async function handleFormSubmit(formValues) {
        const auth = getAuth(app);
    
        setLoading(true); // Enable loading when the process starts.
    
        try {
            // Sign in with email and password
            const res = await signInWithEmailAndPassword(
                auth,
                formValues.usermail,
                formValues.password
            );
    
            const user = res.user;
    
            // Store user data in AsyncStorage
            const { usermail, password } = formValues;
            const userData = { usermail, password };
            await AsyncStorage.setItem("user", JSON.stringify(userData));
    
            // Retrieve stored user data from AsyncStorage (just for logging)
            const storedUser = await AsyncStorage.getItem('user');
            console.log("Stored user:", storedUser);
    
            if (user && !user.emailVerified) {
                // If user is not email verified, sign out and show warning message
                await signOut(auth);
                setLoading(false);
                showTopMessage("Please verify your email before logging in.", "warning");
            } else if (!user) {
                // If no user found, show danger message
                setLoading(false);
                showTopMessage("No user found", "danger");
            } else {
                // If login successful, show success message and navigate to user profile
                showTopMessage("Login Successful!", "success");
                setLoading(false); // When the process is completed, disable the loading
                goToUserProfile();
            }
        } catch (err) {
            // Handle errors
            setLoading(false);
            showTopMessage(ErrorHandler(err.code), "danger");
            console.log('Error:', err.message);
        }
    }

    // Navigation

    function goToMemberSignUp() {
        navigation.navigate("SignUpScreen");
    }

    // Navigation

    function goToUserProfile() {
        navigation.navigate("UserProfileScreen");
    }

    return (
        <View style={styles.container}>
            <Text style={styles.text}> Sign In </Text>
            <Formik
                initialValues={{ initialFormValues }}
                onSubmit={handleFormSubmit}
            >
                {({ values, handleChange, handleSubmit }) => (
                    <>
                        <View style={styles.input_container}>
                            <InputBar
                                onType={handleChange("usermail")}
                                value={values.usermail}
                                placeholder={"E-mail address"}
                            />
                            <InputBar
                                onType={handleChange("password")}
                                value={values.password}
                                placeholder={"password"}
                                isSecure
                            />
                            <TouchableOpacity style={styles.button}>
                                <Text style={styles.detail}>Forgot My Password?</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.button_container}>
                            <View style={styles.button}>
                                <Button
                                    text="Login"
                                    onPress={handleSubmit}
                                    loading={loading}
                                />
                            </View>
                            <View style={styles.button}>
                                <Button
                                    text="SignUp"
                                    onPress={goToMemberSignUp}
                                    theme="secondary"
                                />
                            </View>
                        </View>
                    </>
                )}
            </Formik>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-start",
        marginTop: 48,
        paddingHorizontal: 24,
    },
    text: {
        marginVertical: 32,
        fontSize: 30,
        fontFamily: "Mulish-Medium",
    },
    detail: {
        fontSize: 14,
        fontFamily: "Mulish-Medium",
        color:colors.color_gray
    },
    button_container: {
        paddingVertical: 8,
    },
    button: {
        paddingVertical: 8,
        flexDirection: "row",
    },
});

export default LoginScreen;
