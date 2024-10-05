import { child, get, getDatabase, ref, remove } from "firebase/database";
import React, { useState, useEffect } from "react";
import app from "../../firebaseConfig";
import { getFirestore, collection, query, where, doc, getDoc,getDocs } from "firebase/firestore";
import {
    View,
    Text,
    ActivityIndicator,
    StyleSheet,
    ScrollView,
    Alert,
} from "react-native";
import parseContentData from "../utils/ParseContentData";
import { getAuth } from "firebase/auth";
import { colors, sizes } from "../styles/Theme";
import CardAppointment from "../components/CardAppointment";
import { showTopMessage } from "../utils/ErrorHandler";
import { sortAppointmentsByDateAndTime } from "../utils/CalendarUtils";
import {
    configureNotifications,
    handleNotification,
} from "../utils/NotificationService";

export default function CalendarScreen() {
    const [loading, setLoading] = useState(true);
    const [appointmentList, setAppointmentList] = useState([]);
    const auth = getAuth();
    const user = auth.currentUser;
    //notification
    // useEffect(() => {
    //     configureNotifications();
    // }, []);

    //get user appointments from database

    useEffect(() => {
       fetchData();
    }, [appointmentList]);

    const fetchData = () => {
        if (user) {
            const db = getFirestore(app);
            const appointmentsQuery = query(collection(db, "userappointment"), where("userid", "==", user.uid));
            const doctorData = []; 
            getDocs(appointmentsQuery)
                .then(async (querySnapshot) => {
                    const promises = []; // Array to store all promises
   // Initialize doctorData array
                    
                    querySnapshot.forEach((docu) => {
                        const doctorRef = doc(db, "doctors", docu.data().doctorid);
                        
                        // Push each asynchronous operation (getDoc) into the promises array
                        promises.push(getDoc(doctorRef)
                            .then((docSnapshot) => {
                                if (docSnapshot.exists()) {
                                    return { id: docu.id, ...docu.data(), ...docSnapshot.data() };
                                } else {
                                    console.log("Doctor not found");
                                    return null; // Return null if doctor not found
                                }
                            })
                            .catch((error) => {
                                console.error("Error getting doctor information:", error);
                                return null; // Return null in case of error
                            }));
                    });
        
                    // Wait for all promises to resolve
                    const resolvedData = await Promise.all(promises);
                    // Filter out null values (if any)
                    const filteredDoctorData = resolvedData.filter((data) => data !== null);
                    //console.log(filteredDoctorData);
                    doctorData.push(...filteredDoctorData); // Add resolved data to doctorData
                })
                .then(() => {
                    setAppointmentList(doctorData); // Set appointment list after all data is fetched and processed
                    setLoading(false); // Stop loading when all data is fetched and processed
                })
                .catch((error) => {
                    console.error(error);
                    setLoading(false); // Stop loading in case of error
                });
        }
        
        
    };


    function removeAppointment(appointment) {
        const appointmentsRef = ref(
            getDatabase(),
            "userAppointments/" + user.uid + "/" + appointment.id
        );

        remove(appointmentsRef)
            .then(() => {
                showTopMessage("Appointment deleted!", "success");
                handleNotification(
                    "Appointment cancellation",
                    ` ${appointment.appType} Your appointment has been canceled.`
                );
                if (appointmentList.length == 1) {
                    setAppointmentList([]);
                }
                fetchData();
            })
            .catch((error) => {
                showTopMessage("Error occurred while deleting the appointment!", "info");
            });
    }

    const handleCancel = (appointment) => {
        Alert.alert(
            "appointment cancellation",
            "Your appointment will be cancelled, do you confirm?",
            [
                {
                    text: "skip",
                    style: "cancel",
                },
                {
                    text: "Cancel",
                    onPress: () => {
                        removeAppointment(appointment);
                    },
                },
            ]
        );
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header_text}>my appointments</Text>
            {loading ? (
                <ActivityIndicator
                    style={styles.loading_container}
                    size="large"
                    color={colors.color_primary}
                />
            ) : (
                <View style={styles.list_container}>
                    {appointmentList.length === 0 ? (
                        <Text style={styles.emptyViewText}>
                            You do not have an appointment!
                        </Text>
                    ) : (
                        <View>
                            {appointmentList.map((appointment) => (
                                <CardAppointment
                                    appointment={appointment}
                                    key={appointment.id}
                                    onPressCancel={() =>
                                        handleCancel(appointment)
                                    }
                                />
                            ))}
                        </View>
                    )}
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 48,
    },
    header_text: {
        marginHorizontal: 24,
        marginVertical: 16,
        fontSize: 30,
        fontFamily: "Mulish-Medium",
    },
    list_container: {
        flex: 1,
        justifyContent: "center",
    },
    emptyViewText: {
        fontFamily: "Mulish-Medium",
        fontSize: 24,
        alignItems: "center",
        marginHorizontal: 24,
    },
    loading_container: {
        position:"absolute",
        top:sizes.height/2,
        left:sizes.width/2,
    },
});
