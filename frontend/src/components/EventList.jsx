import { useEffect } from "react";
import useStore from "../store/store";
import { formatTime } from "../utils/time";

export default function EventList() {
  const events = useStore((s) => s.events);
  const users = useStore((s) => s.users);
  const selectedUser = useStore((s) => s.selectedUser);
  const setSelectedUser = useStore((s) => s.setSelectedUser);
  const fetchEvents = useStore((s) => s.fetchEvents);

  useEffect(() => {
    if (selectedUser) {
      fetchEvents();
    }
  }, [selectedUser]);

  const currentUser = users.find((u) => u.name === selectedUser);
  const userTimezone = currentUser?.timezone || "Asia/Kolkata";

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Events</h3>

      <select
        value={selectedUser || ""}
        onChange={(e) => setSelectedUser(e.target.value)}
        className="w-full border rounded p-2 mb-4"
      >
        {users.map((u) => (
          <option key={u._id} value={u.name}>
            {u.name}
          </option>
        ))}
      </select>

      {events.length === 0 && (
        <p className="text-gray-400 text-center py-6">No events found</p>
      )}

      {events.map((event) => (
        <div key={event._id} className="border rounded p-4 mb-3">
          <p className="font-medium">{event.profiles.join(", ")}</p>
          <p className="text-sm">
            Start: {formatTime(event.start, userTimezone)}
          </p>
          <p className="text-sm">End: {formatTime(event.end, userTimezone)}</p>
        </div>
      ))}
    </div>
  );
}
