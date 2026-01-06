import { useEffect } from "react";
import useStore from "../store/store";

import ProfileSelector from "../components/ProfileSelector";
import CreateEvent from "../components/CreateEvent";
import EventList from "../components/EventList";

export default function Home() {
  const fetchUsers = useStore((state) => state.fetchUsers);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Event Management
          </h1>
          <p className="text-gray-600">
            Create and manage events across multiple timezones
          </p>
        </div>
        <ProfileSelector />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CreateEvent />
        <EventList />
      </div>
    </div>
  );
}
