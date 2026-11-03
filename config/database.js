const { MongoClient } = require("mongodb");

let client;
let database;

async function connectDatabase() {
  if (database) return database;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is missing. Add it to your .env file.");
  client = new MongoClient(uri);
  await client.connect();
  database = client.db(process.env.MONGODB_DB || "studiospace");
  await database.collection("studios").createIndex({ createdAt: -1 });
  await database.collection("studios").createIndex({ category: 1, location: 1 });
  await database.collection("bookings").createIndex({ studioId: 1, status: 1, startAt: 1, endAt: 1 });
  await database.collection("users").createIndex({ email: 1 }, { unique: true });
  console.log("Connected to MongoDB");
  return database;
}

function getDatabase() {
  if (!database) throw new Error("Database is not connected yet.");
  return database;
}

module.exports = { connectDatabase, getDatabase };
