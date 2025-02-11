const express = require("express");
const router = express.Router();
const axios = require("axios");
const GameSession = require("../models/GameSession");

const WIKIPEDIA_API_URL = "https://tr.wikipedia.org/api/rest_v1/page/random/summary";

// Function to fetch a random Wikipedia article
const getRandomWikipediaArticle = async () => {
    try {
        const response = await axios.get(WIKIPEDIA_API_URL);
        return {
            title: response.data.title,
            summary: response.data.extract, // Short summary of the article
        };
    } catch (error) {
        console.error("Error fetching Wikipedia article:", error);
        return null;
    }
};

// Route: Fetch and store the daily Wikipedia article
router.get("/daily-text", async (req, res) => {
    const article = await getRandomWikipediaArticle();

    if (!article) {
        return res.status(500).json({ error: "Failed to fetch Wikipedia article" });
    }

    res.json({
        title: article.title,
        text: article.summary.replace(/\w/g, "█"), // Hide words
    });
});

module.exports = router;
