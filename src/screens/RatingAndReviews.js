import React, { useState, useEffect } from 'react';
import { View, TextInput, FlatList, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Button from '../components/button/Button';
import { AirbnbRating } from 'react-native-ratings';
import {getFirestore, collection, where, query, getDocs, addDoc, doc, getDoc, deleteDoc, updateDoc,increment } from '@firebase/firestore';
import app from '../../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { colors } from '../styles/Theme';
import { Ionicons } from '@expo/vector-icons';


export default function RatingAndReviews({ route, navigation }) {
    const { item } = route.params;
    const auth = getAuth();
    const user = auth.currentUser;
    const db = getFirestore(app);

    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState('');
    const [review, setReview] = useState('');
    const [userInfo,setUserInfo] = useState("");
    useEffect(() => {
        if(user){
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
        }
    }, []); // Empty dependency array ensures this runs only once, when the component mounts
    

    useEffect(() => {
            


        const getReviews = async () => {
            try {
                const reviewsRef = query(
                    collection(db, 'doctorReviews'),
                    where('doctorId', '==', item.id)
                );
                const reviewsSnapshot = await getDocs(reviewsRef);
                const reviewData = reviewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setReviews(reviewData);
            } catch (error) {
                console.error(error);
            }
        };
        getReviews();
    }, [db, item.id]);

    const handleSubmitReview = async () => {
        try {
            const patRef = query(
                collection(db, 'doctorReviews'),
                where('userId', '==', user.uid),
                where('doctorId', '==', item.id)
            );
            const patSnapshot = await getDocs(patRef);
            if (patSnapshot.size === 0) {
                const newReview = {
                    doctorId: item.id,
                    review: review,
                    rating: rating,
                    userId: user.uid,
                    likes: 0,
                    username:userInfo.username
                };
                const docRef = await addDoc(collection(db, 'doctorReviews'), newReview);
                newReview.id = docRef.id;

                setReview('');
                setRating(0);
                setReviews(prevReviews => [...prevReviews, newReview]);
            } else {
                console.log('Already reviewed');
            }
        } catch (error) {
            console.error(error);
        }
    };
    const handleLike = async (userId, id) => {
        console.log(userId, id);
        try {
            const likeRef = query(
                collection(db, 'likeRecord'),
                where('likedUser', '==', userId),
                where('reviewId', '==', id)
            );
            const likeSnapshot = await getDocs(likeRef);
            if (likeSnapshot.size === 0) {
                const patRef = doc(db, 'doctorReviews', id);
                const patSnapshot = await getDoc(patRef); // Use getDoc instead of getDocs
                if (patSnapshot.exists) { // Corrected usage of exists
                    await updateDoc(patRef, {
                        likes: increment(1)
                    });
                } else {
                    console.log('Review does not exist');
                }
                const newRecord = {
                    likedUser: userId,
                    reviewId: id,
                };
                await addDoc(collection(db, 'likeRecord'), newRecord);
                const updatedReviews = reviews.map(review => {
                    if (review.id === id) {
                        return { ...review, likes: review.likes + 1 };
                    }
                    return review;
                });
                setReviews(updatedReviews);
            } else {
                const patRef = doc(db, 'doctorReviews', id);
                const patSnapshot = await getDoc(patRef); // Use getDoc instead of getDocs
                if (patSnapshot.exists) { // Corrected usage of exists
                    await updateDoc(patRef, {
                        likes: increment(-1)
                    });
                } else {
                    console.log('Review does not exist');
                }
                await deleteDoc(likeSnapshot.docs[0].ref); // Fix the delete operation
                const updatedReviews = reviews.map(review => {
                    if (review.id === id) {
                        return { ...review, likes: review.likes - 1 };
                    }
                    return review;
                });
                setReviews(updatedReviews);
            }
        } catch (error) {
            console.error('Error updating like:', error);
        }
    };
    
    return (
        <View style={styles.container}>
            <View style={styles.header_container}>
                <Image style={styles.image_container} source={{ uri: item.image }} />
                <View>
                    <Text style={styles.title}>{item.dname}</Text>
                    <Text style={styles.about}>{item.department}</Text>
                    <View style={styles.location_container}>
                        <Ionicons name="location" size={18} color={colors.color_primary} />
                        <Text style={styles.location}>{item.area}</Text>
                    </View>
                </View>
            </View>
            <View>
            {user && (
                    <>
                        <View style={styles.rateContainer}>
                            <Text style={styles.rateText}>Rate :</Text>
                            <AirbnbRating
                                defaultRating={0}
                                selectedColor={colors.color_primary}
                                unSelectedColor="lightgray"
                                reviewColor="green"
                                size={25}
                                reviewSize={25}
                                showRating={false}
                                onFinishRating={setRating}
                            />
                        </View>
                        <TextInput
                            placeholder="Write your review..."
                            value={review}
                            onChangeText={setReview}
                            style={styles.textInput}
                        />
                        <View style={styles.button_container}>
                            <Button text="Submit Review" onPress={handleSubmitReview} />
                        </View>
                    </>
                )}
            </View>
            <View>
                <Text>Reviews</Text>
                <FlatList
                    data={reviews}
                    renderItem={({ item }) => (
                        <View style={styles.reviewContainer}>
                            <Text>{item.username}</Text>
                            <Text>{item.review}</Text>
                            <Text>Rating: {item.rating}</Text>
                            <TouchableOpacity onPress={() => handleLike(user.uid, item.id)}>
                                <Text>Like</Text>
                            </TouchableOpacity>
                            <Text>Likes: {item.likes}</Text>
                        </View>
                    )}
                    keyExtractor={item => item.id}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header_container: {
        flexDirection: 'row',
        backgroundColor: colors.color_white,
        marginTop: 36,
        padding: 16,
        borderRadius: 20,
    },
    image_container: {
        marginRight: 16,
        borderRadius: 50,
        overflow: 'hidden',
        width: 100,
        height: 100,
    },
    title: {
        fontSize: 24,
        fontFamily: 'Mulish-Medium',
    },
    about: {
        fontSize: 20,
        fontFamily: 'Mulish-Light',
    },
    location_container: {
        flexDirection: 'row',
        paddingVertical: 8,
    },
    location: {
        fontSize: 16,
        fontFamily: 'Mulish-Light',
        flex: 1,
        color: colors.color_primary,
        justifyContent: 'center',
    },
    rateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    rateText: {
        fontSize: 16,
        marginRight: 10,
    },
    textInput: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#6A5ACD',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
        alignSelf: 'center',
        width: '80%',
        height: 120,
    },
    button_container: {
        flexDirection: 'row',
        marginBottom: 20,
        paddingHorizontal: 24,
    },
    reviewContainer: {
        borderWidth: 1,
        borderColor: '#CCCCCC',
        padding: 10,
        marginBottom: 10,
    },
});
