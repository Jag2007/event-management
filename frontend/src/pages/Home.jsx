import { useEffect, useState } from "react";
import useStore from "../store/store";

import ProfileSelector from "../components/ProfileSelector";
import CreateEvent from "../components/CreateEvent";
import EventList from "../components/EventList";

export default function Home() {
  const fetchUsers = useStore((state) => state.fetchUsers);
  const [openProfiles, setOpenProfiles] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-start mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Event Management
          </h1>
          <p className="text-gray-600">
            Create and manage events across multiple timezones
          </p>
        </div>

        <div className="hidden md:block">
          <ProfileSelector />
        </div>

        <button
          className="md:hidden mt-1"
          onClick={() => setOpenProfiles(!openProfiles)}
        >
          <div className="space-y-1">
            <span className="block w-6 h-0.5 bg-gray-800"></span>
            <span className="block w-6 h-0.5 bg-gray-800"></span>
            <span className="block w-6 h-0.5 bg-gray-800"></span>
          </div>
        </button>
      </div>

      {openProfiles && (
        <div className="md:hidden mb-6">
          <ProfileSelector />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CreateEvent />
        <EventList />
      </div>
    </div>
  );
}
