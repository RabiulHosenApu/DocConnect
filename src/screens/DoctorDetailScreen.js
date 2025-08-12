import React from "react";
import { View,TextInput,FlatList, StyleSheet, Text, Image, ScrollView, Share, TouchableOpacity } from "react-native";
import Button from "../components/button/Button";
import { Feather, Ionicons } from "@expo/vector-icons";
import { colors, sizes } from "../styles/Theme";
import userImages from "../utils/UserImageUtils";
import { AirbnbRating } from "react-native-ratings";
import {getFirestore, collection, where, query, getDocs, addDoc } from '@firebase/firestore';
import app from "../../firebaseConfig";
import { getAuth } from "firebase/auth";
import { useState, useEffect } from "react";
import InputBar from "../components/InputBar";
export default function DoctorDetailScreen({ route, navigation }) {
    const auth = getAuth();
    const user = auth.currentUser;
    const db = getFirestore(app);
    const { item } = route.params;
    const shareContent = async () => {
        try {
            const result = await Share.share({
                message: "Take a look at this...",
                title: "Application Sharing",
            });
        } catch (error) {
            console.error(error.message);
        }
    };
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState('');
    const [review, setReview] = useState('');


    useEffect(() => {
        const getReviews = async () => {
            
          try {
            const reviewsRef = query(
                collection(db, 'doctorReviews'),
                where('doctorId', '==', item.id)
              );
            const reviewsSnapshot = await getDocs(reviewsRef);
            const reviewData = [];
            reviewsSnapshot.forEach((doc) => {
                        // Get data for each document and push it to the array
                        reviewData.push({ id: doc.id, ...doc.data() });
            });
            setReviews(reviewData);
          } catch (error) {
            console.error(error);
          }
        };
    
        getReviews();
      }, []);


    const handleRate = (newRating) => {
        setRating(newRating);
        console.log(rating);
    };

    const handleSubmitReview = async () => {
        try {
            
            const patRef = query(
            collection(db, 'doctorReviews'),
            where('userId', '==', user.uid),
            where('doctorId', '==', item.id)
            );
            const patSnapshot = await getDocs(patRef);
            if(!(patSnapshot.size>0)){
                try {
                    
                const newReview = {
                    
                    doctorId: item.id,
                    review: review,
                    rating: rating,
                    userId : user.uid,
                    likes: 0 
                };
    
                await addDoc(collection(db, 'doctorReviews'), newReview);
                setReview(''); // Clear the review input
                setRating(0); // Reset rating
                setReviews((prevReviews) => [...prevReviews, newReview]); // Add new review to state
                } catch (error) {
                console.error(error);
                }
            }
            else{console.log("alreadyreviewd")}
        } catch (error) {
            console.log(error);
        }
        
      };

    //NAVIGATION
    const goToBookingScreen = (item) => {
        navigation.navigate("ServiceBookingScreen", { item });
    };
    const goToReviewsScreen = (item) => {
        navigation.navigate("RatingAndReviews", { item });
    };

    return (
        <View style={styles.out_container}>
            <ScrollView style={styles.container}>
                <View style={styles.share_container}>
                    <TouchableOpacity onPress={shareContent}>
                        <Feather
                            name="share"
                            size={24}
                            color={colors.color_primary}
                        />
                    </TouchableOpacity>
                </View>
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
                {/* Body */}
                <View style={styles.body_container}>
                    <View style={styles.about_container}>
                        <Text style={styles.about}>About</Text>

                        <View style={styles.skills_container}>
                        {item.schedule.map((schedulE, index) => (
                            <View key={index} style={styles.chip_container}>
                                <Text style={styles.chips}>{schedulE.day} {schedulE.time}</Text>
                            </View>
                        ))}
                        </View>

                        <Text style={styles.desc}>{item.about}</Text>
                    </View>
                </View>
                <Button
                    text={"Reviews"}
                    onPress={() => goToReviewsScreen(item)}
                    theme="secondary"
                />
                <View style={styles.detail_container}>
                    <View style={styles.detail}>
                        <Text style={styles.detail_text}>
                            {item.experience} of Experience
                        </Text>
                    </View>
                    <View style={styles.detail}>
                        <Text style={styles.detail_text}>
                          100+  {/* {item.numberOf_books} */}
                        </Text>
                        <Text style={styles.detail_text}>
                            Completed Appointment
                        </Text>
                    </View>
                </View>
                </ScrollView>
            

            <View style={styles.button_container}>
                <Button
                    text={"Make an appointment"}
                    onPress={() => goToBookingScreen(item)}
                />
            </View>
            
        </View>
    );
}

const styles = StyleSheet.create({
    out_container: { flex: 1 },
    container: {
        flexGrow: 1,
        paddingHorizontal: 24,
    },
    share_container: {
        flex:1,
        marginTop: 48,
        marginHorizontal: 4,
        flexDirection: "row-reverse",
        alignItems: "center",
    },
    header_container: {
        flexDirection: "row",
        backgroundColor:  colors.color_white,
        marginVertical: 12,
        padding: 16,
        borderRadius: 20,

    },
    body_container: {
        flexDirection: "row",
        backgroundColor:  colors.color_white,
        marginVertical: 12,
        padding: 16,
        borderRadius: 20,
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
    button_container: {
        flexDirection: "row",
        marginBottom: 126,
        marginHorizontal: 24,
    },
    title: {
        fontSize: 20,
        fontFamily: "Mulish-Medium",
    },
    about: {
        fontSize: 20,
        fontFamily: "Mulish-Light",
    },
    desc: {
        fontSize: 14,
        fontFamily: "Mulish-Light",
    },
    detail_container: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 24,
        justifyContent: "space-between",
    },
    skills_container: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 16,
        flexWrap: "wrap",
    },
    detail: {
        flex: 1,
        alignItems: "center",
        borderRadius: 20,
        marginHorizontal: 12,
        height: sizes.width / 3,
        justifyContent: "center",
        backgroundColor: colors.color_white,
    },
    detail_text: {
        textAlign: "center",
        fontSize: 20,
        fontFamily: "Mulish-SemiBold",
        color: colors.color_primary,
    },
    chips: {
        alignSelf: "flex-start",
        fontFamily: "Mulish-Light",
        color: colors.color_white,
    },
    chip_container: {
        borderRadius: 20,
        backgroundColor: colors.color_primary,
        padding: 12,
        margin: 4,
    },
    location: {
        fontSize: 16,
        fontFamily: "Mulish-Light",
        flex: 1,
        color: colors.color_primary,
        justifyContent: "center",
    },
    starContainer: {
        flexDirection: 'row',
        alignItems: 'center',
      },
});
