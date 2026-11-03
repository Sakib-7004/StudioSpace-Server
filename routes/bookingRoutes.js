import express from "express";
import { ObjectId } from "mongodb";
import { getDatabase } from "../config/database.js";
import requireAuth from "../middleware/requireAuth.js";
const router = express.Router();

router.post("/", requireAuth, async (req, res) => {
  try {
    const { studioId, startAt, endAt } = req.body;
    if (!ObjectId.isValid(studioId) || !startAt || !endAt) {
      return res.status(400).json({ message: "Choose a studio and valid booking times." });
    }
    const start = new Date(startAt);
    const end = new Date(endAt);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end || start < new Date()) {
      return res.status(400).json({ message: "Please choose a valid future time range." });
    }
    const db = getDatabase();
    const collision = await db.collection("bookings").findOne({
      studioId, status: "Confirmed",
      startAt: { $lt: end }, endAt: { $gt: start }
    });
    if (collision) return res.status(409).json({ message: "This studio is already confirmed for part of that time. Choose another slot." });

    const studio = await db.collection("studios").findOne({ _id: new ObjectId(studioId) });
    if (!studio) return res.status(404).json({ message: "Studio not found." });
    const booking = {
      studioId, studioTitle: studio.title, studioImage: studio.imageUrl,
      hourlyRate: studio.hourlyRate, startAt: start, endAt: end,
      status: "Pending", customerId: req.user.id, customerName: req.user.name,
      customerEmail: req.user.email, hostEmail: studio.ownerEmail, createdAt: new Date()
    };
    const result = await db.collection("bookings").insertOne(booking);
    res.status(201).json({ ...booking, _id: result.insertedId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not create booking." });
  }
});

router.get("/mine", requireAuth, async (req, res) => {
  const bookings = await getDatabase().collection("bookings")
    .find({ customerEmail: req.user.email }).sort({ createdAt: -1 }).toArray();
  res.json(bookings);
});

router.patch("/:id/cancel", requireAuth, async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid booking ID." });
  const result = await getDatabase().collection("bookings").updateOne(
    { _id: new ObjectId(req.params.id), customerEmail: req.user.email, status: "Pending" },
    { $set: { status: "Cancelled", updatedAt: new Date() } }
  );
  if (!result.modifiedCount) return res.status(404).json({ message: "Pending booking not found." });
  res.json({ message: "Booking cancelled." });
});

router.patch("/:id/confirm", requireAuth, async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ message: "Invalid booking ID." });
  const db = getDatabase();
  const booking = await db.collection("bookings").findOne({ _id: new ObjectId(req.params.id), hostEmail: req.user.email, status: "Pending" });
  if (!booking) return res.status(404).json({ message: "Pending booking not found." });
  const collision = await db.collection("bookings").findOne({
    _id: { $ne: booking._id }, studioId: booking.studioId, status: "Confirmed",
    startAt: { $lt: booking.endAt }, endAt: { $gt: booking.startAt }
  });
  if (collision) return res.status(409).json({ message: "Another booking was confirmed for this time first." });
  await db.collection("bookings").updateOne({ _id: booking._id }, { $set: { status: "Confirmed", updatedAt: new Date() } });
  res.json({ message: "Booking confirmed." });
});

export default router;
