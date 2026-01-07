import { useEffect, useState } from "react";
import { getEventLogs } from "../api/api";
import { formatTime } from "../utils/time";
import { CloseOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button } from "antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export default function UpdateLogs({ eventId, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await getEventLogs(eventId);
      setLogs(res.data || []);
    } catch (err) {
      console.error("Failed to fetch logs", err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
          <div className="flex gap-2 items-center">
            <button
              onClick={fetchLogs}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Refresh logs"
            >
              <ReloadOutlined />
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <CloseOutlined />
            </button>
          </div>
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

                {log.changes && log.changes.length > 0 ? (
                  <ul className="space-y-2">
                    {log.changes.map((c, idx) => {
                      const formatValue = (value, field) => {
                        if (
                          value === null ||
                          value === undefined ||
                          value === ""
                        ) {
                          return "N/A";
                        }
                        // Format dates for start/end fields
                        if (field === "start" || field === "end") {
                          try {
                            // Handle both string and Date objects
                            const date =
                              typeof value === "string"
                                ? dayjs(value)
                                : dayjs(new Date(value));
                            if (date.isValid()) {
                              return date.format("MMM DD, YYYY [at] hh:mm A");
                            }
                          } catch (e) {
                            // Fall through to string conversion
                          }
                        }
                        return String(value);
                      };

                      return (
                        <li key={idx} className="text-sm">
                          <span className="font-medium text-gray-700 capitalize">
                            {c.field}
                          </span>
                          :{" "}
                          <span className="line-through text-red-500">
                            {formatValue(c.oldValue, c.field)}
                          </span>{" "}
                          →{" "}
                          <span className="text-green-600">
                            {formatValue(c.newValue, c.field)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-gray-400 text-sm">
                    No changes recorded in this log entry.
                  </p>
                )}
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
