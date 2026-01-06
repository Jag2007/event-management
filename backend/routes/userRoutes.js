import express from "express";
import User from "../models/User.js";

const router = express.Router();

// Get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new user
router.post("/", async (req, res) => {
  try {
    const { name, timezone } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Name is required" });
    }

    const user = new User({
      name: name.trim(),
      timezone: timezone || "Asia/Kolkata",
    });

    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user timezone
router.put("/:userId/timezone", async (req, res) => {
  try {
    const { userId } = req.params;
    const { timezone } = req.body;

    if (!timezone) {
      return res.status(400).json({ error: "Timezone is required" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { timezone },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
