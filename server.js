require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { toNodeHandler } = require("better-auth/node");
const { auth } = require("./auth");
const { connectDatabase } = require("./config/database");

const app = express();
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
app.use(cookieParser());
app.all("/api/auth/*", toNodeHandler(auth));
app.use(express.json());

app.get("/", (req, res) => res.json({ message: "StudioSpace API is running." }));
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/session", require("./routes/authRoutes"));
app.use("/api/studios", require("./routes/studioRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));

const PORT = process.env.PORT || 5000;
connectDatabase()
  .then(() => app.listen(PORT, () => console.log(`StudioSpace API listening on port ${PORT}`)))
  .catch((error) => {
    console.error("Server could not start:", error.message);
    process.exit(1);
  });
