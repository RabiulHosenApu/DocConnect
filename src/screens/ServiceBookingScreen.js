import {
    View,
    StyleSheet,
    Text,
    Image,
    ScrollView,
    Alert,
    ActivityIndicator,
} from "react-native";
import Button from "../components/button/Button";
import React, { useState, useEffect, useRef } from "react";
import { Calendar } from "react-native-calendars";
import moment from "moment";
import { colors } from "../styles/Theme";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import app from "../../firebaseConfig";
import { showTopMessage } from "../utils/ErrorHandler";
import TimeSlot from "../components/TimeSlot";
import parseContentData from "../utils/ParseContentData";
import { Ionicons } from "@expo/vector-icons";
import {
    configureNotifications,
    handleNotification,
} from "../utils/NotificationService";
import userImages from "../utils/UserImageUtils";

export default function ServiceBookingScreen({ route, navigation }) {
    const { item } = route.params;
    const serviceId = item.id;
    const scrollViewRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [timeList, setTimeList] = useState([]);
    const [serviceTimeList, setServiceTimeList] = useState([]);
    const [bookedApps, setBookedApps] = useState([]);

    const today = moment().format("YYYY-MM-DD");
    const threeMonthsLater = moment().add(3, "months").format("YYYY-MM-DD");

    const auth = getAuth();
    const user = auth.currentUser;
    

    const getTimeListFromDatabase = async () => {
        setLoading(true);
        try {
            const dbRef = ref(getDatabase());
            const snapshot = await get(child(dbRef, "times"));

            if (snapshot.exists()) {
                const timeList = parseContentData(snapshot.val());
                setTimeList(timeList);
            } else {
                console.log("Veri yok");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getServiceAppointments = async (day) => {
        setLoading(true);
        setServiceTimeList([]);
        try {
            const appointmentsRef = ref(getDatabase(), "userAppointments");
            const snapshot = await get(appointmentsRef);

            if (snapshot.exists()) {
                const data = snapshot.val();
                let serviceBookings = [];

                Object.keys(data).forEach((user) => {
                    const userAppointments = data[user];

                    Object.keys(userAppointments).forEach((appointmentId) => {
                        const app = userAppointments[appointmentId];

                        if (
                            app.serviceId === serviceId &&
                            app.bookedDate === day
                        ) {
                            serviceBookings.push(app);
                        }
                    });
                });

                setBookedApps(serviceBookings);
                const availableTimes = timeList.map((time) => {
                    const bookedHour = serviceBookings.some(
                        (app) => app.bookedTime === time.apptime
                    );

                    return {
                        ...time,
                        isBooked: bookedHour ? true : false,
                    };
                });

                setServiceTimeList(availableTimes);
            } else {
                console.log("No data");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            return true;
        }
    };

    const handleBooking = () => {
        if (selectedDate && user) {
            Alert.alert(
                "Creating an Appointment",
                "Your appointment will be made, do you confirm?",
                [
                    {
                        text: "Cancel",
                        style: "cancel",
                    },
                    {
                        text: "Complete",
                        onPress: () => {
                            pushAppointment();
                        },
                    },
                ]
            );
        } else {
            if (!user) {
                showTopMessage("You are not logged in", "info");
                goToLoginScreen();
            } else if (!selectedDate) {
                showTopMessage("Please select a day", "info");
            }
        }
    };

    const pushAppointment = () => {
        const db = getFirestore(app);
        const appointmentData = {
            userid: user.uid,
            doctorid: item.id,
            date: selectedDate,
            time: selectedTime
          };
          
        addDoc(collection(db, "userappointment"), appointmentData)
            .then(async () => {
                showTopMessage("Your appointment has been created!", "success");

                handleNotification(
                    "Your upcoming appointment",
                    `your appointment ${selectedDate} Created for watch.`
                );
                goToCompletedScreen();
                setSelectedTime(null);
                setSelectedDate(null);
            })
            .catch((error) => {
                showTopMessage("Something went wrong.", "info");
                console.error(error);
                setSelectedTime(null);
                setSelectedDate(null);
            });
    };

    const onDateSelect = async (day) => {
        try {
            setLoading(true);
            setSelectedDate(null);
            setSelectedTime(null);
            const dayOfWeek = new Date(day.dateString).toLocaleDateString('en-US', { weekday: 'long' });
            console.log(dayOfWeek);
            let b=0;
            for (const schedulE of item.schedule) {
                if (schedulE.day === dayOfWeek) {
                    b=1;
                    setSelectedDate(day.dateString);
                    setSelectedTime(schedulE.time)
                    break;
                }
            }
            if(b==0) {
                showTopMessage("Not available on that day", "danger");
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    const onTimeSelect = (time) => {
        setSelectedTime(time);
    };

    const goToCompletedScreen = () => {
        navigation.navigate("SearchScreen");
    };

    const goToLoginScreen = () => {
        navigation.navigate("LoginScreen");
    };

    return (
        <View style={styles.out_container}>
            <ScrollView
                nestedScrollEnabled={true}
                ref={scrollViewRef}
                style={styles.container}
                onContentSizeChange={(contentWidth, contentHeight) => {
                    if (!loading && scrollViewRef.current) {
                        scrollViewRef.current.scrollToEnd({ animated: true });
                    }
                }}
            >
                {/* Header */}
                <View style={styles.header_container}>
                    <Image
                        style={styles.image_container}
                        source={{ uri: item.image }}
                    />
                    <View>
                        <View style={styles.title_container}>
                            <Text style={styles.title}>
                                {item.dname}
                            </Text>
                            <Text style={styles.about}>
                                {item.department}
                            </Text>
                        </View>
                        <View style={styles.location_container}>
                            <Ionicons
                                name="location"
                                size={18}
                                color={colors.color_primary}
                            />
                            <Text style={styles.location}>{item.area}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.text_container}>
                    <Text style={styles.subTitle}>Select Day:</Text>
                </View>

                <Calendar
                    style={styles.calendar_container}
                    onDayPress={ onDateSelect }
                    markedDates={{
                        [selectedDate]: {
                            selected: true,
                            disableTouchEvent: true,
                            selectedColor: colors.color_primary,
                            selectedTextColor: colors.color_white,
                        },
                    }}
                    customStyle={{
                        today: {
                            todayTextColor: colors.color_primary,
                        },
                    }}
                    minDate={today}
                    maxDate={threeMonthsLater}
                />

                {selectedDate && (
                    <View style={styles.bottom_container}>
                        {loading ? (
                            <ActivityIndicator
                                style={styles.loadingIndicator}
                            />
                        ) : (
                            <>
                                
                            </>
                        )}
                    </View>
                )}
            </ScrollView>
            <View style={styles.button_container}>
                <Button text={"Complete"} onPress={handleBooking} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    out_container: { flex: 1 },
    container: {
        flexGrow: 1,
        marginTop: 48,
        paddingHorizontal: 24,
    },
    header_container: {
        flexDirection: "row",
        backgroundColor: colors.color_white,
        marginTop: 36,
        padding: 16,
        borderRadius: 20,
    },

    calendar_container: {
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        justifyContent: "center",
    },

    image_container: {
        marginRight: 16,
        borderRadius: 50,
        overflow: "hidden",
        width: 100,
        height: 100,
    },
    title_container: {
        flex: 1,
    },
    location_container: { flexDirection: "row", paddingVertical: 8 },
    about_container: {
        flex: 1,
        justifyContent: "space-evenly",
    },
    text_container: {
        flex: 1,
        flexDirection: "row",
    },
    time_container: {
        flexDirection: "row",
        flexWrap: "wrap",
        padding: 16,
        backgroundColor: colors.color_white,
        borderRadius: 20,
        justifyContent: "space-between",
    },
    bottom_container: {
        flex: 1,
        marginBottom: 24,
    },
    button_container: {
        flexDirection: "row",
        marginBottom: 126,
        paddingHorizontal: 24,
    },
    about: {
        fontSize: 20,
        fontFamily: "Mulish-Light",
    },

    title: {
        fontSize: 24,
        fontFamily: "Mulish-Medium",
    },
    subTitle: {
        fontSize: 18,
        paddingVertical: 16,
    },
    desc: {
        fontSize: 14,
        fontFamily: "Mulish-Light",
    },
    location: {
        fontSize: 16,
        fontFamily: "Mulish-Light",
        flex: 1,
        color: colors.color_primary,
        justifyContent: "center",
    },
});
