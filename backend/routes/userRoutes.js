import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const data = await User.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, timezone } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ error: "User name is required" });
    }

    const newUser = new User({
      name: name.trim(),
      timezone: timezone || "Asia/Kolkata",
    });

    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: "Failed to create user" });
  }
});

router.put("/:userId/timezone", async (req, res) => {
  const { userId } = req.params;
  const { timezone } = req.body;

  if (!timezone) return res.status(400).json({ error: "Timezone is required" });

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { timezone },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
