const { DataTypes } = require("sequelize");
const sequelize = require("../db/config");

const GameSession = sequelize.define("game_session", {
    session_token: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    wikipedia_article: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    guessed_words: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
    },
    score: {
        type: DataTypes.INTEGER,
        defaultValue: 10000,
    },
    time_elapsed: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
});

module.exports = GameSession;
