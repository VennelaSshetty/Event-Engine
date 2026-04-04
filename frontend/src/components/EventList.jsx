import { useEffect, useState } from "react";
import { getEvents } from "../services/api";

export default function EventList({ refresh }) {
  const [events, setEvents] = useState([]);

  const loadEvents = async () => {
    const res = await getEvents();
    setEvents(res.data);
  };

  useEffect(() => {
    loadEvents();
  }, [refresh]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4">Recent Events</h2>

      {events.length === 0 ? (
        <p>No events yet</p>
      ) : (
        <ul className="space-y-3">
          {events.map((event) => (
            <li
              key={event._id}
              className="border p-3 rounded bg-gray-50"
            >
              <p className="font-semibold">{event.type}</p>
              <pre className="text-sm text-gray-600">
                {JSON.stringify(event.payload, null, 2)}
              </pre>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}