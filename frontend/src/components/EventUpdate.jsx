import { useState } from "react";
import useStore from "../store/store";

export default function EventUpdate({ event, onClose }) {
  const users = useStore((s) => s.users);
  const updateEvent = useStore((s) => s.updateEvent);

  const [selectedProfiles, setSelectedProfiles] = useState(
    event.profiles
      .map((name) => users.find((u) => u.name === name)?._id)
      .filter(Boolean)
  );

  function handleUpdate() {
    const names = selectedProfiles.map(
      (id) => users.find((u) => u._id === id)?.name
    );

    updateEvent(event.id, { profiles: names });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-4 rounded w-96">
        <h3 className="font-semibold mb-3">Edit Event</h3>

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

        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 border py-2">
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            className="flex-1 bg-purple-600 text-white py-2"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
}
