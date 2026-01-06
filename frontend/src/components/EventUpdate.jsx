import { useState, useRef, useEffect } from "react";
import useStore from "../store/store";
import { getTimezones } from "../utils/time";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { DatePicker, TimePicker, Select, Button, message } from "antd";
import { CloseOutlined } from "@ant-design/icons";

dayjs.extend(utc);
dayjs.extend(timezone);

const { Option } = Select;

export default function EventUpdate({ event, onClose }) {
  const updateEvent = useStore((s) => s.updateEvent);
  const users = useStore((s) => s.users);
  const selectedUser = useStore((s) => s.selectedUser);

  const [eventTimezone, setEventTimezone] = useState(
    event.timezone || "America/New_York"
  );
  const [startDate, setStartDate] = useState(null);
  const [startTime_val, setStartTime] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [endTime_val, setEndTime] = useState(null);
  const [errrror, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const timezones = getTimezones();

  // Initialize form with event data
  useEffect(() => {
    if (event) {
      setEventTimezone(event.timezone || "America/New_York");

      // Parse start date/time from event (convert from UTC to event timezone)
      const start = dayjs(event.start).tz(event.timezone || "America/New_York");
      setStartDate(start);
      setStartTime(start);

      // Parse end date/time from event (convert from UTC to event timezone)
      const end = dayjs(event.end).tz(event.timezone || "America/New_York");
      setEndDate(end);
      setEndTime(end);
    }
  }, [event]);

  // disable past dates for start date
  const disabledStartDate = (current) => {
    if (!current) return false;
    return current && current < dayjs().startOf("day");
  };

  // disable dates before start date for end date
  const disabledEndDate = (current) => {
    if (!current || !startDate) return false;
    return current && current < startDate.startOf("day");
  };

  // disable end time if same date and before start time
  const disabledEndTime = () => {
    if (!startDate || !endDate || !startTime_val) return {};

    if (startDate.format("YYYY-MM-DD") === endDate.format("YYYY-MM-DD")) {
      return {
        disabledHours: () => {
          const startHour = startTime_val.hour();
          const hours = [];
          for (let i = 0; i < startHour; i++) {
            hours.push(i);
          }
          return hours;
        },
        disabledMinutes: (selectedHour) => {
          if (selectedHour === startTime_val.hour()) {
            const startMinute = startTime_val.minute();
            const minutes = [];
            for (let i = 0; i <= startMinute; i++) {
              minutes.push(i);
            }
            return minutes;
          }
          return [];
        },
      };
    }
    return {};
  };

  async function handleUpdate() {
    setError("");

    if (!startDate || !endDate || !startTime_val || !endTime_val) {
      setError("Please select start and end dates with times");
      message.warning("Please select start and end dates with times");
      return;
    }

    try {
      setLoading(true);

      // combine date and time
      const start = startDate
        .hour(startTime_val.hour())
        .minute(startTime_val.minute())
        .second(0)
        .tz(eventTimezone);

      const end = endDate
        .hour(endTime_val.hour())
        .minute(endTime_val.minute())
        .second(0)
        .tz(eventTimezone);

      if (!end.isAfter(start)) {
        setError("End must be after start");
        message.error("End date and time must be after start date and time");
        setLoading(false);
        return;
      }

      await updateEvent(event._id, {
        timezone: eventTimezone,
        start: start.toISOString(),
        end: end.toISOString(),
      });

      message.success("Event updated successfully!");
      onClose();
    } catch (errrror) {
      console.error("Failed to update event:", errrror);
      setError("Failed to update event. Please try again.");
      message.error("Failed to update event. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Edit Event</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <CloseOutlined />
          </button>
        </div>

        {/* Profiles Display (Read-only) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profiles
          </label>
          <div className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
            {event.profiles.join(", ")}
          </div>
        </div>

        {/* Timezone Select */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <Select
            value={eventTimezone}
            onChange={setEventTimezone}
            className="w-full"
            size="large"
            style={{ width: "100%" }}
          >
            {timezones.map((tz) => (
              <Option key={tz.value} value={tz.value}>
                {tz.label}
              </Option>
            ))}
          </Select>
        </div>

        {/* Start Date & Time */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date & Time
          </label>
          <div className="flex gap-2">
            <DatePicker
              value={startDate}
              onChange={setStartDate}
              disabledDate={disabledStartDate}
              format="YYYY-MM-DD"
              className="flex-1"
              size="large"
              placeholder="Pick a date"
              style={{ width: "100%" }}
            />
            <TimePicker
              value={startTime_val}
              onChange={setStartTime}
              format="HH:mm"
              className="flex-1"
              size="large"
              placeholder="09:00"
              style={{ width: "100%" }}
            />
          </div>
        </div>

        {/* End Date & Time */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date & Time
          </label>
          <div className="flex gap-2">
            <DatePicker
              value={endDate}
              onChange={setEndDate}
              disabledDate={disabledEndDate}
              format="YYYY-MM-DD"
              className="flex-1"
              size="large"
              placeholder="Pick a date"
              style={{ width: "100%" }}
            />
            <TimePicker
              value={endTime_val}
              onChange={setEndTime}
              format="HH:mm"
              className="flex-1"
              size="large"
              placeholder="09:00"
              disabledTime={disabledEndTime}
              style={{ width: "100%" }}
            />
          </div>
        </div>

        {/* Error Message */}
        {errrror && <div className="mb-4 text-red-500 text-sm">{errrror}</div>}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-6">
          <Button
            onClick={onClose}
            className="flex-1"
            size="large"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={handleUpdate}
            className="flex-1 bg-purple-600 hover:bg-purple-700 border-purple-600 hover:border-purple-700"
            size="large"
            loading={loading}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Event"}
          </Button>
        </div>
      </div>
    </div>
  );
}
