// Import necessary libraries
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { Audio } from 'expo-av';

const datasetId = "d_0d1da54a73733d33e40f662f757af537";
const url = `https://data.gov.sg/api/action/datastore_search?resource_id=${datasetId}`;

// Function to play background music
async function playBackgroundMusic() {
    const { sound } = await Audio.Sound.createAsync(require('./Jazz.wav.mp3'));
    await sound.setIsLoopingAsync(true);
    await sound.playAsync();
}

// Main screen that fetches and displays data
function HomeScreen({ navigation }) {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch(url)
            .then(response => response.json())
            .then(responseJson => {
                if (responseJson.result && responseJson.result.records) {
                    const records = responseJson.result.records;
                    setData(records);
                    setFilteredData(records);
                }
            })
            .catch(error => console.error('Error fetching data:', error));
    }, []);

    useEffect(() => {
        playBackgroundMusic();
    }, []);

    const handleSearch = (text) => {
        setSearch(text);
        const filtered = data.filter(item =>
            item.age_groups.toLowerCase().includes(text.toLowerCase()) ||
            item.clinical_status.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredData(filtered);
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.searchBar}
                placeholder="Search by age or status..."
                value={search}
                onChangeText={handleSearch}
            />
            <FlatList
                data={filteredData}
                keyExtractor={(item) => item._id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => navigation.navigate('Details', { item })}>
                        <View style={styles.item}>
                            <Text style={styles.title}>{item.clinical_status} ({item.age_groups})</Text>
                            <Text style={styles.count}>Cases: {item.count}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

// Detail screen to show more info about the selected item
function DetailScreen({ route }) {
    const { item } = route.params;
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{item.clinical_status} ({item.age_groups})</Text>
            <Text style={styles.detail}>Epidemic Year: {item.epi_year}</Text>
            <Text style={styles.detail}>Epidemic Week: {item.epi_week}</Text>
            <Text style={styles.detail}>Case Count: {item.count}</Text>
        </View>
    );
}

const Stack = createStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="Health Data" component={HomeScreen} />
                <Stack.Screen name="Details" component={DetailScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

// Styles for UI
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EFEFFF',
        padding: 10,
    },
    searchBar: {
        height: 40,
        borderColor: '#6A5ACD',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 10,
        backgroundColor: 'white',
    },
    item: {
        padding: 15,
        marginVertical: 8,
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#6A5ACD',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#6A5ACD',
    },
    count: {
        fontSize: 16,
        color: '#333',
    },
    detail: {
        fontSize: 16,
        marginVertical: 5,
    },
});
