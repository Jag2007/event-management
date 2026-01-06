import mongoose from "mongoose";

const changeSchema = new mongoose.Schema(
  {
    field: {
      type: String,
      required: true,
    },
    oldValue: {
      type: mongoose.Schema.Types.Mixed,
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { _id: false }
);

const eventLogSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    changes: {
      type: [changeSchema],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const EventLog = mongoose.model("EventLog", eventLogSchema);

export default EventLog;
