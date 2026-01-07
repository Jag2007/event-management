import express from "express";
import Event from "../models/Event.js";
import EventLog from "../models/EventLog.js";
import User from "../models/User.js";

const router = express.Router();

// Grab events - filter by user if ID is provided
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;
    let filter = {};

    if (userId) {
      const user = await User.findById(userId);
      // Only filter if we actually find a user
      if (user) filter = { profiles: user.name };
    }

    const list = await Event.find(filter)
      .populate("profileIds", "name timezone")
      .sort({ createdAt: -1 });

    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { profiles, profileIds, timezone, start, end } = req.body;

    // Basic validation
    if (!profiles?.length)
      return res.status(400).json({ error: "Need at least one profile" });
    if (!timezone) return res.status(400).json({ error: "Timezone missing" });
    if (!start || !end)
      return res.status(400).json({ error: "Timestamps required" });

    const sDate = new Date(start);
    const eDate = new Date(end);

    if (eDate <= sDate) {
      return res.status(400).json({ error: "End time must be after start" });
    }

    const newEvent = await Event.create({
      profiles,
      profileIds: profileIds || [],
      timezone,
      start: sDate,
      end: eDate,
    });

    const result = await Event.findById(newEvent._id).populate(
      "profileIds",
      "name timezone"
    );
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;
    const body = req.body;

    const doc = await Event.findById(eventId);
    if (!doc) return res.status(404).json({ error: "Event not found" });

    const logChanges = [];

    // Tracking changes manually for the log
    if (
      body.profiles &&
      JSON.stringify([...body.profiles].sort()) !==
        JSON.stringify([...doc.profiles].sort())
    ) {
      logChanges.push({
        field: "profiles",
        old: doc.profiles,
        new: body.profiles,
      });
    }

    if (body.timezone && body.timezone !== doc.timezone) {
      logChanges.push({
        field: "timezone",
        old: doc.timezone,
        new: body.timezone,
      });
    }

    // Time comparison logic
    const hasStartChanged =
      body.start && new Date(body.start).getTime() !== doc.start.getTime();
    const hasEndChanged =
      body.end && new Date(body.end).getTime() !== doc.end.getTime();

    if (hasStartChanged)
      logChanges.push({ field: "start", old: doc.start, new: body.start });
    if (hasEndChanged)
      logChanges.push({ field: "end", old: doc.end, new: body.end });

    if (logChanges.length === 0) {
      return res.json(
        await Event.findById(eventId).populate("profileIds", "name timezone")
      );
    }

    // Prepare update object
    const updatePayload = {
      ...body,
      start: body.start ? new Date(body.start) : doc.start,
      end: body.end ? new Date(body.end) : doc.end,
    };

    if (updatePayload.end <= updatePayload.start) {
      return res.status(400).json({ error: "Invalid date range" });
    }

    const updated = await Event.findByIdAndUpdate(eventId, updatePayload, {
      new: true,
      runValidators: true,
    }).populate("profileIds", "name timezone");

    // Save history
    await EventLog.create({
      eventId: updated._id,
      timestamp: new Date(),
      changes: logChanges,
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:eventId/logs", async (req, res) => {
  try {
    const exists = await Event.exists({ _id: req.params.eventId });
    if (!exists) return res.status(404).json({ error: "No such event" });

    const history = await EventLog.find({ eventId: req.params.eventId })
      .sort({ timestamp: -1 })
      .lean();

    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
