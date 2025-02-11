const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./db/config");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Wikipedia Hidden Title Guessing Game API");
});

// Import Routes
const gameRoutes = require("./routes/gameRoutes");
app.use("/game", gameRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
