const { Sequelize } = require("sequelize");
require("dotenv").config(); // Load environment variables

// Ensure DB_URL is defined in .env
if (!process.env.DB_URL) {
    console.error("❌ Error: DB_URL is not defined in .env file");
    process.exit(1);
}

// Database connection setup
const sequelize = new Sequelize(process.env.DB_URL, {
    dialect: "postgres",
    logging: false,  // Change to console.log for debugging
    define: {
        freezeTableName: true, 
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
});

// Test database connection
const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ Database connected successfully!");
    } catch (error) {
        console.error("❌ Database connection failed:", error.message);
        process.exit(1);
    }
};

connectDB();

module.exports = sequelize;
