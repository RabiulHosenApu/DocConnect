import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import CardMedium from "../components/CardMedium";
import SearchBar from "../components/SearchBar";
import { colors, sizes } from "../styles/Theme";
import { filterServicesByCategory } from "../utils/CategoryUtils";
import categories from "../utils/Categories";
import Category from "../components/Category";
import app from "../../firebaseConfig";
import { showTopMessage } from "../utils/ErrorHandler";
import parseContentData from "../utils/ParseContentData";
import userImages from "../utils/UserImageUtils"
import { getFirestore, collection, getDocs } from "firebase/firestore"; 
export default function SearchScreen({ navigation, route }) {
    const [loading, setLoading] = useState(true);
    const [doctorList, setDoctorList] = useState([]);
    const [filteredDoctorList, setFilteredDoctorList] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");

    const category = route.params?.category;

    // useEffect(() => {
    //     // Fetch data from Firestore when component mounts
    //     const fetchDoctors = async () => {
    //         try {
    //             const db = getFirestore();
    //             const doctorsCollection = collection(db, "doctors");
    //             const querySnapshot = await getDocs(doctorsCollection);
    //             const doctorData = [];
    //             if(querySnapshot.exists()){
    //                 querySnapshot.forEach((doc) => {
    //                     // Get data for each document and push it to the array
    //                     doctorData.push({ id: doc.id, ...doc.data() });
    //                 });
    //                 setDoctorList(doctorData); // Set the state with the array of doctor data
    //                 if (category) {
    //                     const filteredList = filterServicesByCategory(
    //                         category.name,
    //                         doctorData
    //                     );
    //                     setSelectedCategory(category.name);
    //                     setFilteredDoctorList(filteredList);
    //                 } else {
    //                     setFilteredDoctorList(doctorData);
    //                 }
    //             }
    //             else {
    //                 showTopMessage("No data to show", "info");
    //             }

    //         } catch (error) {
    //             console.error("Error fetching doctors:", error);
    //         }
    //     };

    //     fetchDoctors();
    // }, []);



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
                    if (category) {
                        const filteredList = filterServicesByCategory(
                            category.name,
                            doctorData
                        );
                        setSelectedCategory(category.name);
                        setFilteredDoctorList(filteredList);
                    } else {
                        setFilteredDoctorList(doctorData);
                    }
                } else {
                    showTopMessage("No data to show", "info");
                }
            })
            .catch((error) => {
                console.error("Error fetching doctors:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []); 

    // useEffect(() => {
    //     const dbRef = ref(getDatabase());

    //     get(child(dbRef, "services"))
    //         .then((snapshot) => {
    //             if (snapshot.exists()) {
    //                 const serviceList = parseContentData(snapshot.val());
    //                 setServiceList(serviceList);

                    // if (category) {
                    //     const filteredList = filterServicesByCategory(
                    //         category.name,
                    //         serviceList
                    //     );
                    //     setSelectedCategory(category.name);
                    //     setFilteredServiceList(filteredList);
                    // } else {
                    //     setFilteredServiceList(serviceList);
                    // }
    //             } else {
    //                 showTopMessage("Gösterecek veri yok", "info");
    //             }
    //         })
    //         .catch((error) => {
    //             console.error(error);
    //         })
    //         .finally(() => {
    //             setLoading(false); // Veriler çekildikten sonra yükleme durumunu kapat
    //         });
    // }, []);

    //filtering by category name
    const handleCategoryFilter = (category) => {
        if (selectedCategory === category) {
            setSelectedCategory(""); // Eğer zaten seçiliyse, seçili kategoriyi temizle
            setFilteredDoctorList(doctorList); // Filtrelemeyi kaldır, tüm hizmetleri göster
        } else {
            const filteredList = filterServicesByCategory(
                category,
                doctorList
            );
            setSelectedCategory(category);
            setFilteredDoctorList(filteredList);
        }
    };

    //Render to flatlist
    const renderDoctor = ({ item }) => (
        <CardMedium
            doctor={item}
            key={item.id}
            onSelect={() => handleServiceSelect(item)}
        />
    );

    const renderCategory = ({ item }) => (
        <Category
            category={item}
            isSelected={selectedCategory === item.name}
            onPress={() => handleCategoryFilter(item.name)}
            key={item.name}
        />
    );

    //Navigate to detail
    const handleServiceSelect = (item) => {
        navigation.navigate("DoctorDetailScreen", { item });
    };

    //Search function
    const handleSearch = (text) => {
        const searchedText = text.toLowerCase();

        const filteredList = doctorList.filter((doctor) => {
            const nameMatch = doctor.dname
                .toLowerCase()
                .includes(searchedText);

            const expertAreaMatch = doctor.department
                .toLowerCase()
                .includes(searchedText);

            return nameMatch || expertAreaMatch;
        });

        setFilteredDoctorList(filteredList);
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator
                    style={styles.loadingIndicator}
                    size="large"
                    color={colors.color_primary}
                />
            ) : (
                <View style={styles.container}>
                    <View style={styles.search_container}>
                        <SearchBar
                            onSearch={handleSearch}
                            placeholder_text={"search"}
                        />
                    </View>

                    <View style={styles.category_container}>
                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            snapToInterval={sizes.width + 24}
                            decelerationRate={"fast"}
                            data={categories}
                            keyExtractor={(category) => category.name}
                            renderItem={renderCategory}
                        />
                    </View>

                    <View style={styles.list_container}>
                        <FlatList
                            data={filteredDoctorList}
                            renderItem={renderDoctor}
                            keyExtractor={(item) => item.id.toString()}
                            contentContainerStyle={{ paddingBottom: 330 }} //scroll viewdan dolayı flatlist gömülüyordu
                        />
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    search_container: {
        marginTop: 56,
        marginBottom: 12,
        marginHorizontal: 24,
    },
    category_container: {
        marginHorizontal: 24,
    },
    list_container: {
        marginBottom: 32,
    },
    loadingIndicator: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});
