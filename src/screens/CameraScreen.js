import React, { useState } from "react";
import {
    View,
    Text,
    ActivityIndicator,
    StyleSheet,
    ScrollView,
    Image,
    Alert,
    TouchableOpacity,ana
} from "react-native";
import * as ImagePicker from 'expo-image-picker';  // Import ImagePicker

export default function CameraScreen() {
    const [photo, setPhoto] = useState(null);  // Store the selected photo
    const [loading, setLoading] = useState(false);  // For showing a loading indicator
    const [result, setResult] = useState(null);  // Store the result from backend

    // Function to pick an image from camera or gallery
    const pickImage = async () => {
        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setPhoto(result.assets[0].uri);  // Save the URI of the selected image
            await processImage(result.assets[0].uri);  // Process the image (send to backend)
        }
    };

    // Function to handle sending image to backend for processing
    const processImage = async (imageUri) => {
        setLoading(true);
        try {
            // Sending image to backend for processing
            const data = new FormData();
            data.append('file', {
                uri: imageUri,
                name: 'photo.jpg',
                type: 'image/jpeg',
            });

            // Replace with your backend endpoint
            const response = await fetch('https://your-backend.com/api/process', {
                method: 'POST',
                body: data,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            const result = await response.json();
            setResult(result);  // Store the result returned from backend
        } catch (error) {
            Alert.alert('Error', 'There was an error processing the image');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header_text}>Take a Picture</Text>
            
            {/* Button to open camera or gallery */}
            <TouchableOpacity style={styles.button} onPress={pickImage}>
                <Text style={styles.buttonText}>Capture Image</Text>
            </TouchableOpacity>

            {/* Display the selected photo */}
            {photo && <Image source={{ uri: photo }} style={styles.preview} />}

            {/* Show loading indicator while processing */}
            {loading ? <ActivityIndicator size="large" color="#0000ff" /> : result && (
                <View style={styles.resultContainer}>
                    <Text style={styles.resultText}>Processing Result: {result.message}</Text>
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
    button: {
        backgroundColor: "#007bff",
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignSelf: 'center',
        marginVertical: 16,
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: 'bold',
    },
    preview: {
        marginTop: 16,
        width: '90%',
        height: 300,
        alignSelf: 'center',
        borderRadius: 8,
    },
    resultContainer: {
        marginTop: 16,
        padding: 16,
        backgroundColor: "#f8f9fa",
        borderRadius: 8,
        marginHorizontal: 24,
    },
    resultText: {
        fontSize: 18,
        fontFamily: "Mulish-Medium",
    },
});
