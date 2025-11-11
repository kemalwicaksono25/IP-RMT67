const { Sequelize } = require("sequelize");
const config = require("../config/config.json");

const dbConfig = config.development;

// Connect to postgres database to create new database
const sequelize = new Sequelize("postgres", dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  dialect: "postgres",
  logging: false,
});

async function createDatabase() {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to PostgreSQL");

    // Create database if not exists
    await sequelize.query(
      `CREATE DATABASE ${dbConfig.database};`,
      { raw: true }
    );
    console.log(`✅ Database "${dbConfig.database}" created successfully`);
  } catch (error) {
    if (error.message.includes("already exists")) {
      console.log(`ℹ️  Database "${dbConfig.database}" already exists`);
    } else {
      console.error("❌ Error creating database:", error.message);
      throw error;
    }
  } finally {
    await sequelize.close();
  }
}

createDatabase();

