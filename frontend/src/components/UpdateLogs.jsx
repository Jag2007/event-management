import { useEffect, useState } from "react";
import { getEventLogs } from "../api/api";
import { formatTime } from "../utils/time";
import { CloseOutlined } from "@ant-design/icons";
import { Button } from "antd";

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
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Event Update History
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <CloseOutlined />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <p className="text-gray-400 text-sm text-center py-8">Loading...</p>
          ) : logs.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">
              No update history yet.
            </p>
          ) : (
            logs.map((log) => (
              <div
                key={log._id}
                className="border border-gray-200 rounded-lg p-4 mb-3 bg-white"
              >
                <p className="text-gray-500 mb-3 text-sm">
                  {formatTime(log.timestamp, "UTC")}
                </p>

                <ul className="space-y-2">
                  {log.changes.map((c, idx) => (
                    <li key={idx} className="text-sm">
                      <span className="font-medium text-gray-700">
                        {c.field}
                      </span>
                      :{" "}
                      <span className="line-through text-red-500">
                        {String(c.oldValue)}
                      </span>{" "}
                      →{" "}
                      <span className="text-green-600">
                        {String(c.newValue)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>

        {/* Close Button */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button onClick={onClose} className="w-full" size="large">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
