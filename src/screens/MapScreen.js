import React, { useEffect, useState } from "react";
import MapView, { Callout, Circle, Marker } from "react-native-maps";
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";
import * as Location from "expo-location";
import { colors, sizes } from "../styles/Theme";
import { Feather } from "@expo/vector-icons";
import app from "../../firebaseConfig";
import { getFirestore, collection, getDocs, doc } from "firebase/firestore"; 
import parseContentData from "../utils/ParseContentData";
import { showMessage } from "react-native-flash-message";
import districtCoordinates from "../utils/MapScreenUtils";

export default function MapScreen({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [doctorList, setDoctorList] = useState([]);
    const [initialRegion, setInitialRegion] = useState(null);

    useEffect(() => {
        async function getLocationAsync() {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = location.coords;
            setInitialRegion({
                latitude,
                longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            });
        }

        getLocationAsync();
    }, []);

    //get serviceList
    useEffect(() => {
        // Fetch data from Firestore when component mounts
        const db = getFirestore(app);
        const doctorsCollection = collection(db, "doctors");

        getDocs(doctorsCollection)
            .then((querySnapshot) => {
                if (!querySnapshot.empty) {
                    const doctorData = [];
                    querySnapshot.forEach((doc) => {
                        // Get data for each document and push it to the array
                        doctorData.push({ id: doc.id, ...doc.data() });
                    });
                    setDoctorList(doctorData); // Set the state with the array of doctor data
                } else {
                    showMessage("No data to show", "info");
                }
            })
            .catch((error) => {
                console.error("Error fetching doctors:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []); 


    //Navigate to detail
    const handleDoctorSelect = (item) => {
        console.log("hey");
        navigation.navigate("DoctorDetailScreen", { item });
    };

    return (
        <View style={styles.container}>
            {initialRegion && !loading ? (
                <MapView
                    style={styles.map}
                    provider="google"
                    initialRegion={initialRegion}
                    loadingIndicatorColor={colors.color_primary}
                    userLocationUpdateInterval={1000}
                    showsUserLocation={true}
                    showsMyLocationButton={true}
                >
                    <Circle
                        center={{
                            latitude: initialRegion.latitude,
                            longitude: initialRegion.longitude,
                        }}
                        radius={2000}
                        strokeWidth={2}
                        strokeColor="rgba(0, 0, 255, 0.5)"
                        fillColor="rgba(0, 0, 255, 0.2)"
                    />

                    {doctorList.map((doctor) => (
                        <Marker
                            key={doctor.id}
                            coordinate={{ latitude: doctor.latitude, longitude: doctor.longitude }}
                            title={`${doctor.dname}`}
                        >
                            <Callout style={styles.callout_container}>
                                <TouchableOpacity
                                    onPress={() => handleDoctorSelect(doctor)}
                                >
                                    <View style={styles.callout_button}>
                                        <Text style={styles.callout_title}>
                                            {doctor.dname}
                                           
                                        </Text>
                                        <Text style={styles.callout_text}>
                                            {doctor.department} at {doctor.area}
                                        </Text>
                                    </View>

                                    <Feather
                                        name="chevron-right"
                                        size={24}
                                        color={colors.color_primary}
                                    />
                                </TouchableOpacity>
                            </Callout>
                        </Marker>
                    ))}
                </MapView>
            ) : (
                <ActivityIndicator
                    style={styles.loading_container}
                    size="large"
                    color={colors.color_primary}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: "100%",
        height: "100%",
    },
    callout_container: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "center",
        backgroundColor: colors.color_white,
        paddingLeft: 8,
    },
    callout_title: {
        fontFamily: "Mulish-Medium",
        paddingBottom: 12,
        fontSize: 18,
    },
    callout_text: {
        fontFamily: "Mulish-Light",
        fontSize: 13,
    },
    callout_button: {
        justifyContent: "center",
        alignItems: "center",
        padding: 8,
    },
    loading_container: {
        position:"absolute",
        top:sizes.height/2,
        left:sizes.width/2,
    },
});
