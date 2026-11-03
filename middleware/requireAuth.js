const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const token = req.cookies?.studioToken;
  if (!token) return res.status(401).json({ message: "Please log in to continue." });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    res.clearCookie("studioToken");
    return res.status(401).json({ message: "Your session expired. Please log in again." });
  }
}

module.exports = requireAuth;
