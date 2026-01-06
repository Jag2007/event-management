import { useState } from "react";
import useStore from "../store/store";
import { getTimezones } from "../utils/time";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export default function CreateEvent() {
  const users = useStore((s) => s.users);
  const addEvent = useStore((s) => s.addEvent);

  const [selectedProfiles, setSelectedProfiles] = useState([]);
  const [eventTimezone, setEventTimezone] = useState("Asia/Kolkata");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("09:00");
  const [error, setError] = useState("");

  const timezones = getTimezones();

  function handleCreate() {
    setError("");

    if (selectedProfiles.length === 0) {
      setError("Please select at least one profile");
      return;
    }

    if (!startDate || !endDate) {
      setError("Please select start and end dates");
      return;
    }

    const start = dayjs.tz(`${startDate}T${startTime}`, eventTimezone);
    const end = dayjs.tz(`${endDate}T${endTime}`, eventTimezone);

    if (!end.isAfter(start)) {
      setError("End must be after start");
      return;
    }

    const profileNames = selectedProfiles.map((id) => {
      const user = users.find((u) => u._id === id);
      return user.name;
    });

    addEvent({
      profiles: profileNames,
      profileIds: selectedProfiles,
      timezone: eventTimezone,
      start: start.toISOString(),
      end: end.toISOString(),
    });

    setSelectedProfiles([]);
    setStartDate("");
    setEndDate("");
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Create Event</h3>

      <select
        multiple
        value={selectedProfiles}
        onChange={(e) =>
          setSelectedProfiles(
            Array.from(e.target.selectedOptions, (o) => o.value)
          )
        }
        className="w-full border rounded p-2"
      >
        {users.map((u) => (
          <option key={u._id} value={u._id}>
            {u.name}
          </option>
        ))}
      </select>

      <select
        value={eventTimezone}
        onChange={(e) => setEventTimezone(e.target.value)}
        className="w-full border rounded p-2 mt-3"
      >
        {timezones.map((tz) => (
          <option key={tz.value} value={tz.value}>
            {tz.label}
          </option>
        ))}
      </select>

      <div className="flex gap-2 mt-3">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
      </div>

      <div className="flex gap-2 mt-2">
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
      </div>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      <button
        onClick={handleCreate}
        className="mt-4 w-full bg-purple-600 text-white py-2 rounded"
      >
        Create Event
      </button>
    </div>
  );
}
