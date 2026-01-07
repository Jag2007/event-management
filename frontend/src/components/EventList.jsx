import { useEffect, useState } from "react";
import useStore from "../store/store";
import { formatTime, getTimezones } from "../utils/time";
import { Select, Button } from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EditOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import EventUpdate from "./EventUpdate";
import UpdateLogs from "./UpdateLogs";

dayjs.extend(utc);
dayjs.extend(timezone);

const { Option } = Select;

export default function EventList() {
  const events = useStore((s) => s.events);
  const users = useStore((s) => s.users);
  const selectedUser = useStore((s) => s.selectedUser);
  const fetchEvents = useStore((s) => s.fetchEvents);

  const [viewTimezone, setViewTimezone] = useState("America/New_York");
  const [editingEvent, setEditingEvent] = useState(null);
  const [viewingLogs, setViewingLogs] = useState(null);
  const timezones = getTimezones();

  useEffect(() => {
    if (selectedUser) {
      fetchEvents();
    }
  }, [selectedUser, fetchEvents]);

  const currentUser = users.find((u) => u.name === selectedUser);
  const defaultTimezone = currentUser?.timezone || "America/New_York";

  useEffect(() => {
    if (currentUser?.timezone) {
      setViewTimezone(currentUser.timezone);
    }
  }, [currentUser]);

  const formatDateForDisplay = (date, tz) => {
    if (!date) return "";
    return dayjs(date).tz(tz).format("MMM DD, YYYY");
  };

  const formatTimeForDisplay = (date, tz) => {
    if (!date) return "";
    return dayjs(date).tz(tz).format("hh:mm A");
  };

  const formatDateTimeForDisplay = (date, tz) => {
    if (!date) return "";
    return dayjs(date).tz(tz).format("MMM DD, YYYY [at] hh:mm A");
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Events</h3>

      {/* View in Timezone Dropdown */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          View in Timezone
        </label>
        <Select
          value={viewTimezone}
          onChange={setViewTimezone}
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

      {events.length === 0 && (
        <p className="text-gray-400 text-center py-6">No events found</p>
      )}

      {events.map((event) => (
        <div
          key={event._id}
          className="border border-gray-200 rounded-lg p-4 mb-3 bg-white"
        >
          {/* Profiles */}
          <div className="flex items-center gap-2 mb-3">
            <UserOutlined className="text-gray-500" />
            <p className="font-medium text-gray-800">
              {event.profiles.join(", ")}
            </p>
          </div>

          {/* Start Date & Time */}
          <div className="flex items-center gap-2 mb-2 text-sm">
            <span className="text-gray-600">Start:</span>
            <CalendarOutlined className="text-gray-400" />
            <span className="text-gray-700">
              {formatDateForDisplay(event.start, viewTimezone)}
            </span>
            <ClockCircleOutlined className="text-gray-400 ml-2" />
            <span className="text-gray-700">
              {formatTimeForDisplay(event.start, viewTimezone)}
            </span>
          </div>

          {/* End Date & Time */}
          <div className="flex items-center gap-2 mb-3 text-sm">
            <span className="text-gray-600">End:</span>
            <CalendarOutlined className="text-gray-400" />
            <span className="text-gray-700">
              {formatDateForDisplay(event.end, viewTimezone)}
            </span>
            <ClockCircleOutlined className="text-gray-400 ml-2" />
            <span className="text-gray-700">
              {formatTimeForDisplay(event.end, viewTimezone)}
            </span>
          </div>

          {/* Created and Updated Timestamps */}
          {event.createdAt && (
            <div className="text-xs text-gray-500 mb-1">
              Created: {formatDateTimeForDisplay(event.createdAt, viewTimezone)}
            </div>
          )}
          {event.updatedAt && (
            <div className="text-xs text-gray-500 mb-3">
              Updated: {formatDateTimeForDisplay(event.updatedAt, viewTimezone)}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 mt-3">
            <Button
              type="default"
              icon={<EditOutlined />}
              onClick={() => setEditingEvent(event)}
              className="flex-1"
            >
              Edit
            </Button>
            <Button
              type="default"
              icon={<FileTextOutlined />}
              onClick={() => setViewingLogs(event._id)}
              className="flex-1"
            >
              View Logs
            </Button>
          </div>
        </div>
      ))}

      {/* Edit Event Modal */}
      {editingEvent && (
        <EventUpdate
          event={editingEvent}
          onClose={() => {
            setEditingEvent(null);
            // Refresh events after update
            fetchEvents();
          }}
        />
      )}

      {/* View Logs Modal */}
      {viewingLogs && (
        <UpdateLogs
          eventId={viewingLogs}
          onClose={() => setViewingLogs(null)}
        />
      )}
    </div>
  );
}
