import { getAuth } from "firebase/auth";
import app from "../../firebaseConfig";
import React from "react";
import { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    ImageBackground,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../styles/Theme";
import SearchBar from "../components/SearchBar";
import { getFirestore, collection, query, where, doc, getDoc,getDocs } from "firebase/firestore";
import parseContentData from "../utils/ParseContentData";
import CardAppointmentSmall from "../components/CardAppointmentSmall";
import { sortAppointmentsByDateAndTime } from "../utils/CalendarUtils";
import categories from "../utils/Categories";
import { CardCarousel } from "../components/CardCarousel";
import Category from "../components/Category";

export default function HomeScreen({ navigation }) {
        

    const [appointmentList, setAppointmentList] = useState([]);

    const [userAuth, setUserAuth] = useState(null);
    const [isReady, setIsReady] = useState(false);
    const [userInfo,setUserInfo] = useState("");
    const auth = getAuth();
    const user = auth.currentUser;
    // //User session
    useEffect(() => {
        auth.onAuthStateChanged((userAuth) => {
            setUserAuth(!!userAuth);
        });
    }, []);

    //get appointment listimport { child, get, getDatabase, ref } from "firebase/database";
    useEffect(() => {
        

        /// appointment detail
        if (userAuth) {
            const db = getFirestore(app);
            const docRef = doc(db, "userinfo", user.uid); 

            getDoc(docRef)
            .then((docSnapshot) => {
                if (docSnapshot.exists()) {
                    // Document exists, extract data
                    const userData = docSnapshot.data();
                    setUserInfo(userData); // Update userInfo state
                    console.log(userData);
                } else {
                    // Document does not exist
                    console.log("Document does not exist");
                }
            })
            .catch((error) => {
                // Error handling
                console.error("Error getting document:", error);
            });

            const appointmentsQuery = query(collection(db, "userappointment"), where("userid", "==", user.uid));
            const doctorData = []; 
            getDocs(appointmentsQuery)
                .then(async (querySnapshot) => {
                    const promises = []; // Array to store all promises// Initialize doctorData array
        
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
                    doctorData.push(...filteredDoctorData); // Add resolved data to doctorData
                })
                .then(() => {
                    setAppointmentList(doctorData); // Set appointment list after all data is fetched and processed
                     // Stop loading when all data is fetched and processed
                })
                .catch((error) => {
                    console.error(error);
                    setLoading(false); // Stop loading in case of error
                });
                

        } else {
            setAppointmentList([]);
            setTimeout(() => {
                setIsReady(true);
            }, 2000);
        }
    }, [userAuth]); // User auth dependecy


    //NAVIGATION
    function goToCalendar() {
        navigation.navigate("CalendarScreen");
    }

    //NAVIGATION
    function goToNotifications() {
        navigation.navigate("NotificationsScreen");
    }

    const handleSearch = () => {
        navigation.navigate("SearchScreen");
    };

    const handleCategorySelect = (selectedCategory) => {
        navigation.navigate("SearchScreen", { category: selectedCategory });
    };

    return (
        <ScrollView>
            { isReady &&  (
                <View style={styles.container}>
                    <View style={styles.top_container}>
                        <View style={styles.header_container}>
                            <Text style={styles.header_text}>DocConnect</Text>
                            <Feather
                                name="bell"
                                size={24}
                                style={styles.icon}
                                onPress={goToNotifications}
                            />
                        </View>
                        <ImageBackground
                            style={styles.card_container}
                            imageStyle={{ borderRadius: 20 , overflow: "hidden"}}
                            source={require("../../assets/backgroundsearch.png")}
                        >
                            <View style={styles.welcome_container}>
                                <Text style={styles.welcome_text}>
                                    Welcome
                                </Text>
                                <Text style={styles.welcome_text_bold}>
                                    {user ? ", " + userInfo.firstname : ""}
                                </Text>
                            </View>
                            <Text style={styles.detail_text}>
                            Let's make your weekly {"\n"}schedule together
                            </Text>
                            <View style={styles.search_container}>
                                <SearchBar
                                    placeholder_text={"Search for Doctors"}
                                    onSearch={handleSearch}
                                />
                            </View>
                        </ImageBackground>
                    </View>
                    <View style={styles.app_container}>
                        <Text style={styles.text}>For you</Text>
                        <View>
                            <CardCarousel
                                list={categories}
                                onSelectCategory={handleCategorySelect}
                            />
                        </View>

                        {appointmentList.length === 0 ? (
                            ""
                        ) : (
                            <View>
                                <Text style={styles.text}>
                                    Upcoming Appointments
                                </Text>
                                <View style={styles.list_container}>
                                    {appointmentList
                                        .slice(0, 2)
                                        .map((appointment) => (
                                            <CardAppointmentSmall
                                                appointment={appointment}
                                                key={appointment.id}
                                                onPress={goToCalendar}
                                            />
                                        ))}
                                </View>
                            </View>
                        )}
                        <Text style={styles.text}>All Catagories</Text>
                        <View style={styles.category_container}>
                            {categories.map((category) => (
                                <Category
                                    category={category}
                                    key={category.name}
                                    onPress={() =>
                                        handleCategorySelect(category)
                                    }
                                />
                            ))}
                        </View>
                    </View>
                </View>
            )}
            {!isReady &&(
                <View style={styles.loading_container}>
                    <ActivityIndicator
                        size="large"
                        color={colors.color_primary}
                    />
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 48,
        marginBottom: 120,
    },
    top_container: {
        paddingHorizontal: 24,
    },
    card_container: {
        marginVertical: 16,
        padding: 16,
    },
    header_container: {
        marginVertical: 16,
        flexDirection: "row",
        alignItems: "center",
    },
    welcome_container: {
        marginTop:8,
        marginBottom: 64,
        flexDirection: "row",
        alignItems: "center",
    },
    search_container: {
        flex: 1,
        paddingBottom: 8,
    },
    app_container: {
        flex: 1,
        paddingHorizontal: 24,
    },
    list_container: {
        flex: 1,
        marginVertical: 8,
    },
    category_container: {
        marginVertical:8,
        flexDirection: "row",
        flexWrap: "wrap",
    },
    header_text: {
        fontSize: 34,
        fontFamily: "Mulish-Medium",
        color: colors.color_primary,
        flex: 1,
    },
    welcome_text: {
        paddingHorizontal: 8,
        fontSize: 24,
        color: colors.color_white,
        fontFamily: "Mulish-Medium",
    },
    text: {
        flex: 1,
        fontSize: 18,
        fontFamily: "Mulish-Medium",
    },
    detail_text: {
        flex: 1,
        flexWrap: "wrap",
        fontSize: 16,
        paddingVertical: 16,
        paddingHorizontal: 8,
        color: colors.color_white,
        fontFamily: "Mulish-Medium",
    },
    welcome_text_bold: {
        color: colors.color_white,
        fontSize: 24,
        fontFamily: "Mulish-Bold",
    },
    icon: {
        color: colors.color_primary,
    },
    loading_container: {
        alignContent: "center",
        justifyContent: "center",
    },
});
