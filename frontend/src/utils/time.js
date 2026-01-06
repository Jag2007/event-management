import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export function formatTime(date, tz) {
  if (!date) return "";
  return dayjs(date).tz(tz).format("DD MMM YYYY, hh:mm A");
}
export function formatDateTimeLocal(date, tz) {
  if (!date) return "";
  return dayjs(date).tz(tz).format("YYYY-MM-DDTHH:mm");
}

export function convertTimezone(date, fromTz, toTz) {
  if (!date) {
    return null;
  }
  return dayjs(date).tz(fromTz).tz(toTz).toISOString();
}

export function getTimezones() {
  return [
    { value: "Asia/Kolkata", label: "India (IST)" },
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "America/Chicago", label: "Central Time (CT)" },
    { value: "America/Denver", label: "Mountain Time (MT)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
    { value: "Europe/London", label: "Europe/London (GMT/BST)" },
    { value: "Europe/Paris", label: "Europe/Paris (CET/CEST)" },
    { value: "Europe/Berlin", label: "Europe/Berlin (CET/CEST)" },
    { value: "Asia/Tokyo", label: "Asia/Tokyo (JST)" },
    { value: "Asia/Shanghai", label: "Asia/Shanghai (CST)" },
    { value: "Australia/Sydney", label: "Australia/Sydney (AEDT/AEST)" },
    { value: "UTC", label: "UTC" },
  ];
}
export function validateEventDates(startDate, endDate, timezone) {
  if (!startDate || !endDate) {
    return {
      valid: false,
      error: "Both dates are required",
    };
  }
  const start = dayjs(startDate).tz(timezone);
  const end = dayjs(endDate).tz(timezone);

  if (end.isBefore(start) || end.isSame(start)) {
    return {
      valid: false,
      error: "End date/time must be after start date/time",
    };
  }
}
