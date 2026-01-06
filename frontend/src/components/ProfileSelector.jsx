import { useEffect, useRef, useState } from "react";
import useStore from "../store/store";
import { getTimezones } from "../utils/time";

export default function ProfileSelector() {
  const users = useStore((s) => s.users);
  const selectedUser = useStore((s) => s.selectedUser);
  const setSelectedUser = useStore((s) => s.setSelectedUser);
  const addUser = useStore((s) => s.addUser);

  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserTimezone, setNewUserTimezone] = useState("Asia/Kolkata");

  const dropdownRef = useRef(null);
  const timezones = getTimezones();

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearchText("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchText.toLowerCase())
  );

  async function handleAddUser(e) {
    e.stopPropagation();
    if (!newUserName.trim()) return;

    await addUser(newUserName.trim(), newUserTimezone);
    setNewUserName("");
    setIsOpen(false);
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* SELECT BUTTON */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="flex items-center justify-between gap-2 border rounded-lg px-4 py-2 bg-white min-w-[200px]"
      >
        <span className="text-sm">{selectedUser || "Select profile"}</span>
        <span>▾</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white border rounded-lg shadow z-50">
          {/* SEARCH */}
          <div className="p-2 border-b">
            <input
              type="text"
              placeholder="Search current profile..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* USER LIST */}
          <div className="max-h-48 overflow-y-auto">
            {filteredUsers.map((user) => (
              <div
                key={user._id}
                onClick={() => {
                  setSelectedUser(user.name);
                  setIsOpen(false);
                }}
                className={`px-4 py-2 cursor-pointer text-sm hover:bg-gray-100 ${
                  user.name === selectedUser ? "bg-purple-100" : ""
                }`}
              >
                {user.name}
              </div>
            ))}
          </div>

          {/* ADD USER */}
          <div className="p-2 border-t bg-gray-50 space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="beta"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                className="flex-1 border rounded px-2 py-1 text-sm"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={handleAddUser}
                className="bg-purple-600 text-white px-3 rounded text-sm"
              >
                Add
              </button>
            </div>

            <select
              value={newUserTimezone}
              onChange={(e) => setNewUserTimezone(e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
              onClick={(e) => e.stopPropagation()}
            >
              {timezones.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
