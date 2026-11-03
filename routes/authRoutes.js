const express = require("express");
const jwt = require("jsonwebtoken");
const { auth } = require("../auth");
const { getDatabase } = require("../config/database");
const router = express.Router();

// Better Auth owns registration, login, Google OAuth and session cookies.
// After login, the client calls this endpoint to create the assignment JWT cookie.
router.post("/sync-token", async (req, res) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) return res.status(401).json({ message: "Please sign in first." });
    const user = {
      id: session.user.id,
      name: session.user.name || "",
      email: session.user.email,
      image: session.user.image || ""
    };
    await getDatabase().collection("users").updateOne(
      { email: user.email }, { $set: { ...user, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } }, { upsert: true }
    );
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("studioToken", token, {
      httpOnly: true, secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.json({ user });
  } catch (error) {
    console.error("Token sync error:", error);
    res.status(500).json({ message: "Could not create your secure session." });
  }
});

router.get("/me", async (req, res) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user) return res.status(401).json({ message: "Not logged in." });
    res.json({ user: session.user });
  } catch {
    res.status(401).json({ message: "Not logged in." });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("studioToken");
  res.json({ message: "Logged out successfully." });
});

module.exports = router;
