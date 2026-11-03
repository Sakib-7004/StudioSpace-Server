const express = require("express");
const { ObjectId } = require("mongodb");
const { getDatabase } = require("../config/database");
const requireAuth = require("../middleware/requireAuth");
const router = express.Router();

const validId = (id) => ObjectId.isValid(id);

// Public list with beginner-friendly filters and featured limit.
router.get("/", async (req, res) => {
  try {
    const { category, search, limit } = req.query;
    const filter = {};
    if (category && category !== "All") filter.category = category;
    if (search) filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } }
    ];
    let query = getDatabase().collection("studios").find(filter).sort({ createdAt: -1 });
    if (limit) query = query.limit(Math.min(Number(limit) || 6, 50));
    res.json(await query.toArray());
  } catch (error) {
    res.status(500).json({ message: "Could not load studios." });
  }
});

// Keep this named route before /:id so "owner" is not read as an ID.
router.get("/owner/mine", requireAuth, async (req, res) => {
  const studios = await getDatabase().collection("studios")
    .find({ ownerEmail: req.user.email }).sort({ createdAt: -1 }).toArray();
  res.json(studios);
});

router.get("/:id", async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ message: "Invalid studio ID." });
  const studio = await getDatabase().collection("studios").findOne({ _id: new ObjectId(req.params.id) });
  if (!studio) return res.status(404).json({ message: "Studio not found." });
  res.json(studio);
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const { title, category, hourlyRate, location, imageUrl, overview } = req.body;
    if (!title || !category || !hourlyRate || !location || !imageUrl || !overview) {
      return res.status(400).json({ message: "Please complete all required studio fields." });
    }
    const studio = {
      ...req.body,
      hourlyRate: Number(hourlyRate),
      securityDeposit: Number(req.body.securityDeposit || 0),
      maxCapacity: Number(req.body.maxCapacity || 1),
      ownerId: req.user.id,
      ownerName: req.user.name,
      ownerEmail: req.user.email,
      createdAt: new Date(),
      rating: 4.8,
      reviewCount: 0
    };
    const result = await getDatabase().collection("studios").insertOne(studio);
    res.status(201).json({ ...studio, _id: result.insertedId });
  } catch (error) {
    res.status(500).json({ message: "Could not create this studio." });
  }
});

router.patch("/:id", requireAuth, async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ message: "Invalid studio ID." });
  const collection = getDatabase().collection("studios");
  const safeUpdates = { ...req.body };
  delete safeUpdates.ownerEmail;
  delete safeUpdates.ownerId;
  delete safeUpdates.ownerName;
  const result = await collection.updateOne(
    { _id: new ObjectId(req.params.id), ownerEmail: req.user.email },
    { $set: { ...safeUpdates, hourlyRate: Number(safeUpdates.hourlyRate), updatedAt: new Date() } }
  );
  if (!result.matchedCount) return res.status(404).json({ message: "Studio not found or you do not own it." });
  res.json(await collection.findOne({ _id: new ObjectId(req.params.id) }));
});

router.delete("/:id", requireAuth, async (req, res) => {
  if (!validId(req.params.id)) return res.status(400).json({ message: "Invalid studio ID." });
  const result = await getDatabase().collection("studios").deleteOne({
    _id: new ObjectId(req.params.id), ownerEmail: req.user.email
  });
  if (!result.deletedCount) return res.status(404).json({ message: "Studio not found or you do not own it." });
  res.json({ message: "Studio deleted successfully." });
});

module.exports = router;
