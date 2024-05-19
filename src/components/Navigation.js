import * as React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/LoginScreen";
import SignUpScreen from "../screens/SignUpScreen";
import CalendarScreen from "../screens/CalendarScreen";
import SearchScreen from "../screens/SearchScreen";
import DoctorDetailScreen from "../screens/DoctorDetailScreen";
import ServiceBookingScreen from "../screens/ServiceBookingScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import MapScreen from "../screens/MapScreen";
import UserProfileScreen from "../screens/UserProfileScreen";
import UserInfosScreen from "../screens/UserInfosScreen";
import BookingHistoryScreen from "../screens/BookingHistoryScreen";
import RatingAndReviews from "../screens/RatingAndReviews";
import FeedBackScreen from "../screens/FeedBackScreen";
import app from "../../firebaseConfig";
import iconPref, { customTabButton } from "../utils/NavBarUtils";
import { useState } from "react";
import { getAuth,signInWithEmailAndPassword } from "firebase/auth";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function AuthStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="LoginScreen"
                component={LoginScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="SignUpScreen"
                component={SignUpScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="UserProfileScreen"
                component={UserProfileScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="RatingAndReviews"
                component={RatingAndReviews}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="ServiceBookingScreen"
                component={ServiceBookingScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="BookingHistoryScreen"
                component={BookingHistoryScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="UserInfosScreen"
                component={UserInfosScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="FeedBackScreen"
                component={FeedBackScreen}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
}

function SearchStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="SearchScreen"
                component={SearchScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="DoctorDetailScreen"
                component={DoctorDetailScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="RatingAndReviews"
                component={RatingAndReviews}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="ServiceBookingScreen"
                component={ServiceBookingScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="LoginScreen"
                component={LoginScreen}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
}

function HomeStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="HomeScreen"
                component={HomeScreen}
                options={{ headerShown: false }}
            />

            <Stack.Screen
                name="CalendarScreen"
                component={CalendarScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="NotificationsScreen"
                component={NotificationsScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="SearchScreen"
                component={SearchScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="DoctorDetailScreen"
                component={DoctorDetailScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="RatingAndReviews"
                component={RatingAndReviews}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="ServiceBookingScreen"
                component={ServiceBookingScreen}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
}

function MapStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="MapScreen"
                component={MapScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="DoctorDetailScreen"
                component={DoctorDetailScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="RatingAndReviews"
                component={RatingAndReviews}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
}

export default Navigation = () => {
    useEffect(() => {
        // Check async storage for user credentials
        const checkAsyncStorage = async () => {
            try {
                const storedUser = await AsyncStorage.getItem('user');
                console.log(storedUser);
                if (storedUser) {
                    const { usermail, password } = JSON.parse(storedUser);
                    signInWithEmailAndPassword(
                        auth,
                        usermail,
                        password
                    ).then(() => {
                        // console.log('Login successful')
                      })
                      .catch((err) => {
                        console.log('Error while sign in', err.message);
                      });
                }
            } catch (error) {
                console.error("Error reading user from async storage:", error);
            }
        };

        checkAsyncStorage();
    }, []);
    const [user, setUser] = useState(getAuth(app).currentUser);
    const auth = getAuth();
    useEffect(() => {
        auth.onAuthStateChanged((user) => {
            setUser(!!user);
        });
    }, []);

    function getTabScreen(authenticatedComponent, defaultComponent) {
        return (user ) ? authenticatedComponent : defaultComponent;
    }

    return (
        <>
            <Tab.Navigator screenOptions={iconPref} initialRouteName="Home page">
                <Tab.Screen name="Home page" component={HomeStack} />
                <Tab.Screen name="Search" component={SearchStack} />
                <Tab.Screen
                    name="Map"
                    component={MapStack}
                    options={{ tabBarButton: customTabButton }}
                />
                <Tab.Screen
                    name="My Appointments"
                    component={getTabScreen(CalendarScreen, AuthStack)}
                />
                <Tab.Screen
                    name="Profile"
                    component={getTabScreen(UserProfileScreen, AuthStack)}
                />
            </Tab.Navigator>
        </>
    );
};
