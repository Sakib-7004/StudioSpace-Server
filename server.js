import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";
import { connectDatabase } from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import studioRoutes from "./routes/studioRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";

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
app.use("/api/session", authRoutes);
app.use("/api/studios", studioRoutes);
app.use("/api/bookings", bookingRoutes);

const PORT = process.env.PORT || 5000;
connectDatabase()
  .then(() => app.listen(PORT, () => console.log(`StudioSpace API listening on port ${PORT}`)))
  .catch((error) => {
    console.error("Server could not start:", error.message);
    process.exit(1);
  });
