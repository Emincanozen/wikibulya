import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, ScrollView, StyleSheet } from "react-native";
import axios from "axios";

const API_URL = (process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");

const App = () => {
    const [article, setArticle] = useState(null);
    const [guess, setGuess] = useState("");
    const [message, setMessage] = useState("");
    const [revealedText, setRevealedText] = useState("");
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        fetchDailyArticle();
    }, []);

    const fetchDailyArticle = async () => {
        setBusy(true);
        setMessage("");
        try {
            const response = await axios.get(`${API_URL}/game/daily-text`, { timeout: 15000 });
            setArticle(response.data);
            setRevealedText(response.data.text);
        } catch (error) {
            setMessage("Impossible de charger la partie. Vérifiez la connexion au serveur.");
        } finally {
            setBusy(false);
        }
    };

    const submitGuess = async () => {
        if (!article || !guess.trim() || busy || article.won) return;
        setBusy(true);
        try {
            const { data } = await axios.post(`${API_URL}/game/guess`, {
                session_token: article.session_token,
                guessed_word: guess.trim(),
            }, { timeout: 15000 });
            setArticle(data);
            setRevealedText(data.text);
            setMessage(data.won ? `Bravo ! Le titre était « ${data.title} ».` :
                data.isCorrect ? "Mot trouvé !" : "Mot absent du texte.");
            setGuess("");
        } catch (error) {
            setMessage(error.response?.data?.error || "Serveur indisponible, réessayez.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>WikiBulYa — retrouvez le titre</Text>
            <ScrollView style={styles.textContainer}>
                <Text style={styles.hiddenText}>{revealedText}</Text>
            </ScrollView>
            <TextInput
                style={styles.input}
                value={guess}
                onChangeText={setGuess}
                placeholder="Proposez un mot ou le titre"
                accessibilityLabel="Votre proposition"
                onSubmitEditing={submitGuess}
            />
            <Button title={busy ? "Vérification…" : "Proposer"} onPress={submitGuess}
                disabled={busy || !article || !guess.trim() || article.won} />
            <Text>Score : {article?.score ?? "—"}</Text>
            <Button title="Charger une partie" disabled={busy} onPress={fetchDailyArticle} />
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
