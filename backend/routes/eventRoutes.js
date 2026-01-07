import express from "express";
import mongoose from "mongoose";
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

    // Helper function to normalize dates for comparison (compare only up to seconds, ignore milliseconds)
    const normalizeDate = (date) => {
      if (!date) return null;
      const d = date instanceof Date ? date : new Date(date);
      if (isNaN(d.getTime())) return null;
      // Round to seconds to avoid millisecond precision issues
      return new Date(Math.floor(d.getTime() / 1000) * 1000);
    };

    // Helper function to format value for display
    const formatValue = (value, field) => {
      if (value === null || value === undefined) return null;

      if (field === "start" || field === "end") {
        try {
          const date = value instanceof Date ? value : new Date(value);
          if (isNaN(date.getTime())) return null;
          return date.toISOString();
        } catch (e) {
          return null;
        }
      }

      if (field === "profiles") {
        if (Array.isArray(value) && value.length > 0) {
          return value.join(", ");
        }
        return value ? String(value) : null;
      }

      // For timezone and other string fields
      return value ? String(value) : null;
    };

    // Track profiles changes
    if (body.profiles !== undefined) {
      const oldProfiles = Array.isArray(doc.profiles)
        ? [...doc.profiles].sort()
        : [];
      const newProfiles = Array.isArray(body.profiles)
        ? [...body.profiles].sort()
        : [];

      if (JSON.stringify(oldProfiles) !== JSON.stringify(newProfiles)) {
        const oldProfilesValue =
          Array.isArray(doc.profiles) && doc.profiles.length > 0
            ? doc.profiles.join(", ")
            : doc.profiles || null;
        const newProfilesValue =
          Array.isArray(body.profiles) && body.profiles.length > 0
            ? body.profiles.join(", ")
            : body.profiles || null;

        logChanges.push({
          field: "profiles",
          oldValue: oldProfilesValue,
          newValue: newProfilesValue,
        });
      }
    }

    // Track timezone changes
    if (body.timezone !== undefined) {
      const oldTimezone = doc.timezone || null;
      const newTimezone = body.timezone || null;

      if (oldTimezone !== newTimezone) {
        logChanges.push({
          field: "timezone",
          oldValue: oldTimezone,
          newValue: newTimezone,
        });
      }
    }

    // Track start date changes
    if (body.start !== undefined) {
      const oldStart = normalizeDate(doc.start);
      const newStart = normalizeDate(body.start);

      if (oldStart && newStart && oldStart.getTime() !== newStart.getTime()) {
        logChanges.push({
          field: "start",
          oldValue: formatValue(doc.start, "start"),
          newValue: formatValue(body.start, "start"),
        });
      } else if (!oldStart && newStart) {
        logChanges.push({
          field: "start",
          oldValue: null,
          newValue: formatValue(body.start, "start"),
        });
      } else if (oldStart && !newStart) {
        logChanges.push({
          field: "start",
          oldValue: formatValue(doc.start, "start"),
          newValue: null,
        });
      }
    }

    // Track end date changes
    if (body.end !== undefined) {
      const oldEnd = normalizeDate(doc.end);
      const newEnd = normalizeDate(body.end);

      if (oldEnd && newEnd && oldEnd.getTime() !== newEnd.getTime()) {
        logChanges.push({
          field: "end",
          oldValue: formatValue(doc.end, "end"),
          newValue: formatValue(body.end, "end"),
        });
      } else if (!oldEnd && newEnd) {
        logChanges.push({
          field: "end",
          oldValue: null,
          newValue: formatValue(body.end, "end"),
        });
      } else if (oldEnd && !newEnd) {
        logChanges.push({
          field: "end",
          oldValue: formatValue(doc.end, "end"),
          newValue: null,
        });
      }
    }

    // If no changes detected, return current document
    if (logChanges.length === 0) {
      return res.json(
        await Event.findById(eventId).populate("profileIds", "name timezone")
      );
    }

    // Prepare update object
    const updatePayload = {};

    if (body.profiles !== undefined) {
      updatePayload.profiles = body.profiles;
    }
    if (body.timezone !== undefined) {
      updatePayload.timezone = body.timezone;
    }
    if (body.start !== undefined) {
      updatePayload.start = new Date(body.start);
    }
    if (body.end !== undefined) {
      updatePayload.end = new Date(body.end);
    }

    // Validate date range if both dates are present
    const finalStart = updatePayload.start || doc.start;
    const finalEnd = updatePayload.end || doc.end;

    if (finalEnd <= finalStart) {
      return res.status(400).json({ error: "Invalid date range" });
    }

    const updated = await Event.findByIdAndUpdate(eventId, updatePayload, {
      new: true,
      runValidators: true,
    }).populate("profileIds", "name timezone");

    // Save history only if there are changes
    if (logChanges.length > 0) {
      await EventLog.create({
        eventId: updated._id,
        timestamp: new Date(),
        changes: logChanges,
      });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:eventId/logs", async (req, res) => {
  try {
    const eventId = req.params.eventId;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: "Invalid event ID format" });
    }

    const exists = await Event.exists({ _id: eventId });
    if (!exists) return res.status(404).json({ error: "No such event" });

    const history = await EventLog.find({
      eventId: new mongoose.Types.ObjectId(eventId),
    })
      .sort({ timestamp: -1 })
      .lean();

    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
