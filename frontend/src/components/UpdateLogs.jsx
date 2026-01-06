import { useEffect, useState } from "react";
import { getEventLogs } from "../api/api";
import { formatTime } from "../utils/time";

export default function UpdateLogs({ eventId, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await getEventLogs(eventId);
        setLogs(res.data);
      } catch (err) {
        console.error("Failed to fetch logs", err);
      } finally {
        setLoading(false);
      }
    }

    fetchLogs();
  }, [eventId]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-lg w-[420px] max-h-[80vh] overflow-y-auto">
        <h3 className="font-semibold mb-4">Event Update History</h3>

        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : logs.length === 0 ? (
          <p className="text-gray-400 text-sm">No updates yet</p>
        ) : (
          logs.map((log) => (
            <div key={log._id} className="border rounded p-3 mb-3 text-sm">
              <p className="text-gray-500 mb-2">{formatTime(log.timestamp)}</p>

              <ul className="space-y-1">
                {log.changes.map((c, idx) => (
                  <li key={idx}>
                    <span className="font-medium">{c.field}</span>:{" "}
                    <span className="line-through text-red-500">
                      {String(c.oldValue)}
                    </span>{" "}
                    →{" "}
                    <span className="text-green-600">{String(c.newValue)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full border rounded py-2 hover:bg-gray-50"
        >
          Close
        </button>
      </div>
    </div>
  );
}
