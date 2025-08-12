import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { colors } from "../styles/Theme";
import { useState , useEffect} from "react";
import * as ImagePicker from "expo-image-picker";
import { app } from "../../firebaseConfig";
import { getFirestore, doc, updateDoc, getDoc } from "firebase/firestore";
import axios from "axios";

export default function UploadImage(props) {
    const [image, setImage] = useState(null);
    const id=props.id;
    const db = getFirestore(app);
    const docRef = doc(db, "userinfo", id);

    useEffect(() => {
        // Function to fetch the image URL from Firestore
        const getImageUrl = async () => {
            try {
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    // Update the state with the image URL from the userinfo collection
                    setImage(data.imageUrl);
                } else {
                    console.log("No such document!");
                }
            } catch (error) {
                console.error("Error fetching document: ", error);
            }
        };

        getImageUrl(); // Call the function to fetch the image URL
    }, []);

    const addImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
        if (!result.canceled) {
            setImage(result.assets[0].uri);
            console.log("image selected");
            uploadToCloudinary(result.assets[0].uri);
        } else {
            alert("You did not select any image.");
        }
    };



    const uploadToCloudinary = async (uri) => {
        try {
            const data = new FormData();
            data.append('file', {
                uri,
                type: 'image/jpeg', // adjust the type based on the file type
                name: 'upload.jpg',
            });

            const preset_key = "DocConnect";
            const cloud_name = "dec3tmaxl";
            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
                data,
                {
                    withCredentials: false,

                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    params: {
                        upload_preset: preset_key,
                    },
                }
            );

            const result = response.data;
            console.log(result.secure_url);
            await updateDoc(docRef, { imageUrl: result.secure_url })
                .then(() => {
                    
                }).catch((err) => {
                    console.log("firebase err : " + err.code)
                })

        } catch (error) {
            console.error('Error uploading to Cloudinary:', error.message);
        }
    };



    return (
        <View style={styles.container}>
            {image ? (
                <Image source={{ uri: image }} style={styles.image} />
            ) : (
                <Image source={require("../../assets/user-profile.png")} style={styles.image} />
            )}
            <View style={styles.upload_button_container}>
                <TouchableOpacity
                    onPress={addImage}
                    style={styles.upload_button}
                >
                    <Text style={styles.desc}>
                        {image ? "" : "Upload"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: "center",
        borderRadius: 50,
        overflow: "hidden",
        width: 72,
        height: 72,
    },
    upload_button: {
        alignItems: "center",
        justifyContent: "center",
    },
    upload_button_container: {
        opacity: 0.5,
        position: "absolute",
        right: 0,
        bottom: 0,
        backgroundColor: colors.color_gray,
        width: "100%",
        height: "25%",
    },
    desc: {
        fontSize: 12,
        fontFamily: "Mulish-Light",
        color: colors.color_white,
    },
    image: {
        marginRight: 16,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 50,
        overflow: "hidden",
        width: 72,
        height: 72,
    },
});
