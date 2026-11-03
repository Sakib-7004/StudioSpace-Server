const { betterAuth } = require("better-auth");
const { mongodbAdapter } = require("better-auth/adapters/mongodb");
const { MongoClient } = require("mongodb");

const mongoClient = new MongoClient(process.env.MONGODB_URI);
const database = mongoClient.db(process.env.MONGODB_DB || "studiospace");

const auth = betterAuth({
  database: mongodbAdapter(database),
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5000",
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ""
    }
  },
  trustedOrigins: [process.env.CLIENT_URL || "http://localhost:3000"],
  advanced: {
    defaultCookieAttributes: {
      httpOnly: true,
      sameSite: "none",
      secure: true
    }
  }
});

module.exports = { auth, mongoClient };
