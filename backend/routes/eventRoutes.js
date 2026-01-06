import express from "express";
import Event from "../models/Event.js";
import EventLog from "../models/EventLog.js";
import User from "../models/User.js";

const router = express.Router();

// Get events for a specific user
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query;

    let query = {};
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        query = { profiles: user.name };
      }
    }

    const events = await Event.find(query)
      .populate("profileIds", "name timezone")
      .sort({ createdAt: -1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new event
router.post("/", async (req, res) => {
  try {
    const { profiles, profileIds, timezone, start, end } = req.body;

    if (!profiles || !Array.isArray(profiles) || profiles.length === 0) {
      return res
        .status(400)
        .json({ error: "At least one profile is required" });
    }

    if (!timezone) {
      return res.status(400).json({ error: "Timezone is required" });
    }

    if (!start || !end) {
      return res
        .status(400)
        .json({ error: "Start and end dates are required" });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (endDate <= startDate) {
      return res.status(400).json({
        error: "End date/time must be after start date/time",
      });
    }

    const event = new Event({
      profiles,
      profileIds: profileIds || [],
      timezone,
      start: startDate,
      end: endDate,
    });

    const savedEvent = await event.save();
    const populatedEvent = await Event.findById(savedEvent._id).populate(
      "profileIds",
      "name timezone"
    );

    res.status(201).json(populatedEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update an event
router.put("/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;
    const { profiles, profileIds, timezone, start, end } = req.body;

    const oldEvent = await Event.findById(eventId);
    if (!oldEvent) {
      return res.status(404).json({ error: "Event not found" });
    }

    const changes = [];

    if (
      profiles &&
      JSON.stringify(profiles.sort()) !==
        JSON.stringify(oldEvent.profiles.sort())
    ) {
      changes.push({
        field: "profiles",
        oldValue: oldEvent.profiles,
        newValue: profiles,
      });
    }

    if (timezone && timezone !== oldEvent.timezone) {
      changes.push({
        field: "timezone",
        oldValue: oldEvent.timezone,
        newValue: timezone,
      });
    }

    if (start && new Date(start).getTime() !== oldEvent.start.getTime()) {
      changes.push({
        field: "start",
        oldValue: oldEvent.start.toISOString(),
        newValue: start,
      });
    }

    if (end && new Date(end).getTime() !== oldEvent.end.getTime()) {
      changes.push({
        field: "end",
        oldValue: oldEvent.end.toISOString(),
        newValue: end,
      });
    }

    if (changes.length === 0) {
      const populatedEvent = await Event.findById(eventId).populate(
        "profileIds",
        "name timezone"
      );
      return res.json(populatedEvent);
    }

    const updateData = {};
    if (profiles) updateData.profiles = profiles;
    if (profileIds) updateData.profileIds = profileIds;
    if (timezone) updateData.timezone = timezone;
    if (start) updateData.start = new Date(start);
    if (end) updateData.end = new Date(end);

    if (
      updateData.end &&
      updateData.start &&
      updateData.end <= updateData.start
    ) {
      return res.status(400).json({
        error: "End date/time must be after start date/time",
      });
    }

    const updatedEvent = await Event.findByIdAndUpdate(eventId, updateData, {
      new: true,
      runValidators: true,
    }).populate("profileIds", "name timezone");

    const eventLog = new EventLog({
      eventId: updatedEvent._id,
      timestamp: new Date(),
      changes,
    });

    await eventLog.save();

    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get update logs for an event
router.get("/:eventId/logs", async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    const logs = await EventLog.find({ eventId })
      .sort({ timestamp: -1 })
      .lean();

    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
