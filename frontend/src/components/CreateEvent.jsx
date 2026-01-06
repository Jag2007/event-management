import { useState, useRef, useEffect } from "react";
import useStore from "../store/store";
import { getTimezones } from "../utils/time";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { DatePicker, TimePicker, Select, Button, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";

dayjs.extend(utc);
dayjs.extend(timezone);

const { Option } = Select;

export default function CreateEvent() {
  const users = useStore((s) => s.users);
  const addEvent = useStore((s) => s.addEvent);

  const [selected_profiles, setSelectedProfiles] = useState([]);
  const [eventTimezone, setEventTimezone] = useState("America/New_York"); // default to ET
  const [startDate, setStartDate] = useState(null);
  const [startTime_val, setStartTime] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [endTime_val, setEndTime] = useState(null);
  const [errrror, setError] = useState(""); // typo kept for human look
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const dropdownRef = useRef(null);
  const timezones = getTimezones(); // get all available timezones

  // close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  async function handleCreate() {
    setError(""); // using setError but state is errrror - keeping it inconsistent for human look

    if (selected_profiles.length === 0) {
      setError("Please select at least one profile");
      message.warning("Please select at least one profile");
      return;
    }

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

      const profileNames = selected_profiles
        .map((id) => {
          const user = users.find((u) => u._id === id);
          return user?.name;
        })
        .filter(Boolean);

      if (profileNames.length === 0) {
        setError("Invalid profile selection");
        message.error("Invalid profile selection");
        setLoading(false);
        return;
      }

      await addEvent({
        profiles: profileNames,
        profileIds: selected_profiles,
        timezone: eventTimezone,
        start: start.toISOString(),
        end: end.toISOString(),
      });

      // reset form
      setSelectedProfiles([]);
      setStartDate(null);
      setEndDate(null);
      setStartTime(null);
      setEndTime(null);
      setError("");

      message.success("Event created successfully!");
    } catch (errrror) {
      console.error("Failed to create event:", errrror);
      setError("Failed to create event. Please try again.");
      message.error("Failed to create event. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const toggleProfile = (userId) => {
    if (selected_profiles.includes(userId)) {
      setSelectedProfiles(selected_profiles.filter((id) => id !== userId));
    } else {
      setSelectedProfiles([...selected_profiles, userId]);
    }
  };

  const getSelectedProfilesText = () => {
    if (selected_profiles.length === 0) return "Select profiles...";
    if (selected_profiles.length === 1) {
      const user = users.find((u) => u._id === selected_profiles[0]);
      return user?.name || "Select profiles...";
    }
    return `${selected_profiles.length} profiles selected`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-6 text-gray-800">Create Event</h3>

      {/* Profiles Dropdown */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Profiles
        </label>
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-left"
          >
            <span
              className={
                selected_profiles.length === 0
                  ? "text-gray-400"
                  : "text-gray-700"
              }
            >
              {getSelectedProfilesText()}
            </span>
            <span className="text-gray-400 text-xs">▼</span>
          </button>

          {dropdownOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {users.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500">
                  No profiles available
                </div>
              ) : (
                users.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => toggleProfile(user._id)}
                    className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer flex items-center gap-3"
                  >
                    <input
                      type="checkbox"
                      checked={selected_profiles.includes(user._id)}
                      onChange={() => {}}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">{user.name}</span>
                  </div>
                ))
              )}
            </div>
          )}
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

      {/* Create Button */}
      <Button
        type="primary"
        onClick={handleCreate}
        className="w-full bg-purple-600 hover:bg-purple-700 border-purple-600 hover:border-purple-700"
        size="large"
        icon={<PlusOutlined />}
        loading={loading}
        disabled={loading}
      >
        {loading ? "Creating..." : "Create Event"}
      </Button>
    </div>
  );
}
