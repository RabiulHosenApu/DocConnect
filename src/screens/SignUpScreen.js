import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet ,ScrollView,KeyboardAvoidingView} from "react-native";
import Button from "../components/button/Button";
import { Feather, Ionicons } from "@expo/vector-icons";
import InputBar from "../components/InputBar";
import { getAuth, createUserWithEmailAndPassword, signOut, sendEmailVerification } from "firebase/auth";
import { getFirestore, doc, setDoc,collection, query, where, getDocs } from "firebase/firestore";
import app from "../../firebaseConfig";
import { Formik } from "formik";
import { ActivityIndicator } from "react-native";
import ErrorHandler, { showTopMessage } from "../utils/ErrorHandler";
import LoginScreen from "./LoginScreen";

const initialFormValues = {
    usermail: "",
    password: "",
    passwordre: "",
};

export default function SignUpScreen({navigation}) {
    const [loading, setLoading] = useState(false);
    const [result,setResult] = useState(false);
    const [username,setUsername]= useState('');
    const [isUsernameAvailable, setIsUsernameAvailable] = useState(false);

    function handleFormSubmit(formValues) {
        const auth = getAuth(app);

        setLoading(true);
        if(!isUsernameAvailable){
            showTopMessage(
                "username is not available"
            );
            setLoading(false);
        }
        else if (formValues.password != formValues.passwordre) {
            showTopMessage(
                "The passwords do not match, please try again!"
            );
            setLoading(false);
        } else {
            createUserWithEmailAndPassword(
                auth,
                formValues.usermail,
                formValues.password
            ).then(
                    (res) => {
                        signOut(auth);
                        const db = getFirestore();
                        sendEmailVerification(res.user);
                        const newPatientRef = setDoc(doc(db, "userinfo", res.user.uid), {
                            username : formValues.username,
                            email: formValues.usermail,
                            firstname: formValues.firstname,
                            lastname: formValues.lastname,
                            phonenumber: formValues.phonenumber,
                        })
                        showTopMessage("Registration Successful! To log in verify your email first", "success");
                        navigation.goBack();
                        setLoading(false);
                    }
// Should navigate to the home screen or go back from here
                )
                .catch((err) =>
                    showTopMessage(ErrorHandler(err.code), "danger")
                );

            setLoading(false);
        }
    }
    useEffect(() => {
        const checkUsernameAvailability = async (username) => {
          try {
            if (!username) {
              setIsUsernameAvailable(''); // Reset state if username is empty
              return;
            }
    
            const db = getFirestore();
            const usernameRef = collection(db, 'userinfo');
            const usernameQuery = query(usernameRef, where('username', '==', username));
            const usernameSnapshot = await getDocs(usernameQuery);
    
            if (usernameSnapshot.empty) {
              setIsUsernameAvailable(true);
            } else {
              setIsUsernameAvailable(false);
            }
            setResult(1);
          } catch (error) {
            console.error('Error checking username availability:', error);
          }
        };
    
        checkUsernameAvailability(username);
      }, [username]);
    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior="padding"
        >
            <ScrollView style={styles.container}>
                <Text style={styles.text}> Sign Up </Text>
                <Formik
                    initialValues={{ initialFormValues }}
                    onSubmit={handleFormSubmit}
                >
                    {({ values, handleChange, handleSubmit }) => (
                        <>
                            <View style={styles.input_container}>
                                    <View>
                                            <InputBar
                                                
                                                onType={text => {
                                                    handleChange('username')(text); // Call handleChange('username') with the new text value
                                                    setUsername(text); // Call your second function with the new text value
                                                  }}
                                                value={values.username}
                                                placeholder={"Username"}

                                            />
                                    </View>
                                {result ? (
                                        <Ionicons
                                        name={isUsernameAvailable ? "checkmark-circle" : "close-circle"}
                                        size={24}
                                        color={isUsernameAvailable ? "green" : "red"}
                                        style={styles.icon}
                                        />
                                    ):null}
                                <InputBar 
                                    onType={handleChange("firstname")}
                                    value={values.firstname}
                                    placeholder={"First Name"} 
                                />
                                <InputBar 
                                    onType={handleChange("lastname")}
                                    value={values.lastname}
                                    placeholder={"Last Name"} 
                                />
                                <InputBar
                                    onType={handleChange("usermail")}
                                    value={values.usermail}
                                    placeholder={"Email Address"}
                                />
                                <InputBar
                                    onType={handleChange("phonenumber")}
                                    value={values.phonenumber}
                                    placeholder={"Phone Number"}
                                />
                                <InputBar
                                    onType={handleChange("password")}
                                    value={values.password}
                                    placeholder={"Password"}
                                    isSecure
                                />
                                <InputBar
                                    onType={handleChange("passwordre")}
                                    value={values.passwordre}
                                    placeholder={"Repeat Password"}
                                    isSecure
                                />
                            </View>
                            <View style={styles.button_container}>
                                <Button
                                    text="Complete Registration"
                                    onPress={handleSubmit}
                                    loading={loading}
                                />
                            </View>
                        </>
                    )}
                </Formik>
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Your App kjhlfkasdlfsadlkfjslfkhsdfashfljhffsadflkasflName</Text>
                    <Text style={styles.footerText}>Your App kjhlfkasdlfsadlkfjslfkhsdfashfljhffsadflkasflName</Text>
                    <Text style={styles.footerText}>Your App kjhlfkasdlfsadlkfjslfkhsdfashfljhffsadflkasflName</Text>
                    <Text style={styles.footerText}>Your App kjhlfkasdlfsadlkfjslfkhsdfashfljhffsadflkasflName</Text>
                    <Text style={styles.footerText}>Your App kjhlfkasdlfsadlkfjslfkhsdfashfljhffsadflkasflName</Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
        
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 48,
    },
    text: {
        marginHorizontal: 24,
        marginVertical: 32,
        fontSize: 30,
        fontFamily: "Mulish-Medium",
    },
    input_container: {
        marginHorizontal: 24,
    },
    button_container: {
        flexDirection: "row",
        margin: 16,
    },
    username_container: {
        flexDirection: 'row', // Arrange children horizontally
        alignItems: 'center', // Center children vertically
        marginBottom: 10,
      },
      input: {
        flex: 1, // Take up remaining space
        marginRight: 10, // Add spacing between InputBar and Button
      },
      button: {
        minWidth: 120, // Set minimum width to ensure button text is visible
      },
    
});
