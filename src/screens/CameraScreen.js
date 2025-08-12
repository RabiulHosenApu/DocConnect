import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker"; // Import ImagePicker
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-react-native";
import * as FileSystem from "expo-file-system"; // For reading image files
import { decodeJpeg } from "@tensorflow/tfjs-react-native"; // To process image data
import { bundleResourceIO } from "@tensorflow/tfjs-react-native";
import Activity from "../components/Activity";
import YoutubePlayer from "react-native-youtube-iframe";

export default function CameraScreen() {
  const modelJson = require("../../assets/model/model.json"); // Model file (assumed to be stored in assets)
  const modelWeights = require("../../assets/model/weights.bin");
  const [photo, setPhoto] = useState(null); // Store the selected photo
  const [loading, setLoading] = useState(false); // For showing a loading indicator
  const [result, setResult] = useState(null); // Store the result from the model
  const [model, setModel] = useState(null); // Store the TensorFlow.js model
  const [imageProcessed, setImageProcessed] = useState(false); // Track if image has been processed
  const [playing, setPlaying] = useState(false);
  // Load the TensorFlow model when the component mounts
  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.ready(); // Ensure TensorFlow.js is initialized
        console.log("TensorFlow is ready");

        // Load the model using bundleResourceIO
        const loadedModel = await tf.loadLayersModel(
          bundleResourceIO(modelJson, [modelWeights])
        );
        setModel(loadedModel);
        console.log("Model loaded successfully");
      } catch (error) {
        console.log("Error loading model: ", error);
        Alert.alert(
          "Error",
          "There was an error loading the model: " + error.message
        );
      }
    };
    loadModel();
  }, []);

  // Function to pick an image from the camera
  const pickImage = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    // Check if the result contains any assets (i.e., an image was picked)
    if (result.assets && result.assets.length > 0) {
      setPhoto(result.assets[0].uri); // Save the URI of the selected image
      setImageProcessed(false); // Reset the image processed state
    }
  };

  // Function to choose an image from the device files
  const chooseImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    // Check if the result contains any assets (i.e., an image was picked)
    if (result.assets && result.assets.length > 0) {
      setPhoto(result.assets[0].uri); // Save the URI of the selected image
      setImageProcessed(false); // Reset the image processed state
    }
  };

  // Function to handle image processing and emotion classification
  const processImage = async (imageUri) => {
    setLoading(true);
    console.log(imageUri);

    try {
      // Load the image metadata
      const imageInfo = await FileSystem.getInfoAsync(imageUri);
      console.log("Image info:", imageInfo);

      if (!imageInfo.exists) {
        throw new Error("Image file does not exist");
      }

      // Load the image file as a base64 string
      const imgB64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Decode the image from base64 using TensorFlow.js as a JPEG image
      const imgBuffer = tf.util.encodeString(imgB64, "base64");
      const rawImageData = new Uint8Array(imgBuffer);

      // Decode the image as JPEG
      const imageTensor = decodeJpeg(rawImageData); // Directly decode as JPEG

      // Resize the image to 224x224 to match the model input size
      const processedImage = imageTensor
        .resizeNearestNeighbor([224, 224]) // Resize to 224x224
        .toFloat()
        .div(tf.scalar(255.0)) // Normalize the image (0-1 range)
        .expandDims(); // Add a batch dimension

      // Run the model prediction
      const prediction = model.predict(processedImage); // Prediction will return a tensor
      const predictionData = prediction.dataSync(); // Use .dataSync() to extract values from the tensor

      // Handle the prediction result
      const emotions = ["Happy", "Sad", "Disgust", "Angry", "Pain", "Fear"]; // Adjust based on your model labels
      const maxIndex = predictionData.indexOf(Math.max(...predictionData)); // Get the index of the highest probability
      const results = emotions.map((emotion, index) => ({
        emotion: emotion,
        probability: (predictionData[index] * 100).toFixed(2), // Convert probability to percentage
      }));
      console.log(results);
      setResult(emotions[maxIndex]); // Set the result based on the highest probability
      setImageProcessed(true); // Mark the image as processed
    } catch (error) {
      Alert.alert(
        "Error",
        "There was an error processing the image: " + error.message
      );
      console.log("Error processing image:", error);
    } finally {
      setLoading(false);
    }
  };
  const onStateChange = (state) => {
    if (state === "ended") {
      setPlaying(false);
      alert("Video has finished playing!");
    }
  };


  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header_text}>Take a Picture</Text>

      {/* Button to open camera */}
      <TouchableOpacity style={styles.button} onPress={pickImage}>
        <Text style={styles.buttonText}>Capture Image</Text>
      </TouchableOpacity>

      {/* Button to choose image from files */}
      <TouchableOpacity style={styles.button} onPress={chooseImage}>
        <Text style={styles.buttonText}>Choose from Files</Text>
      </TouchableOpacity>

      {/* Display the selected photo */}
      {photo && <Image source={{ uri: photo }} style={styles.preview} />}

      {/* Show the Process button if the photo is selected but not processed */}
      {photo && !imageProcessed && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => processImage(photo)}
        >
          <Text style={styles.buttonText}>Process Image</Text>
        </TouchableOpacity>
      )}

      {/* Show loading indicator while processing */}
      {loading ? (
        <Activity />
      ) : (
        result && (
          <View style={styles.resultContainer}>
            <Text style={styles.resultText}>Emotion Detected: {result}</Text>
          </View>
        )
      )}
      <View>
      <YoutubePlayer
        height={300}
        play={playing}
        videoId={"bzubMYUiCac"} // Replace with your YouTube video ID
        onChangeState={onStateChange}
      />
      </View>
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
    alignSelf: "center",
    marginVertical: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  preview: {
    marginTop: 16,
    width: "90%",
    height: 300,
    alignSelf: "center",
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
