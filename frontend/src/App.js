import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, ScrollView, StyleSheet } from "react-native";
import axios from "axios";

const API_URL = "http://localhost:5000/game/daily-text";  // Update with backend URL

const App = () => {
    const [article, setArticle] = useState(null);
    const [guess, setGuess] = useState("");
    const [message, setMessage] = useState("");
    const [revealedText, setRevealedText] = useState("");

    useEffect(() => {
        fetchDailyArticle();
    }, []);

    const fetchDailyArticle = async () => {
        try {
            const response = await axios.get(API_URL);
            setArticle(response.data);
            setRevealedText(response.data.text);
        } catch (error) {
            console.error("Failed to fetch article:", error);
        }
    };

    const submitGuess = async () => {
        if (!article) return;

        try {
            const response = await axios.post("http://localhost:5000/game/guess", {
                session_token: "user123",
                guessed_word: guess,
            });

            if (response.data.isCorrect) {
                setMessage("✔️ Correct!");
                setRevealedText((prev) => prev.replace(new RegExp(guess, "gi"), guess));
            } else {
                setMessage("❌ Incorrect!");
            }

            setGuess("");
        } catch (error) {
            console.error("Error submitting guess:", error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>📜 Wikipedia Hidden Title Game</Text>
            <ScrollView style={styles.textContainer}>
                <Text style={styles.hiddenText}>{revealedText}</Text>
            </ScrollView>
            <TextInput
                style={styles.input}
                value={guess}
                onChangeText={setGuess}
                placeholder="Enter a word"
            />
            <Button title="Submit Guess" onPress={submitGuess} />
            <Text style={styles.message}>{message}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
    header: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
    textContainer: { maxHeight: 300, backgroundColor: "#fff", padding: 10, borderRadius: 10 },
    hiddenText: { fontSize: 18, backgroundColor: "#000", color: "#fff", padding: 10 },
    input: { borderWidth: 1, padding: 10, marginVertical: 10, borderRadius: 5 },
    message: { fontSize: 16, marginTop: 10, fontWeight: "bold" },
});

export default App;
