import { useEffect, useState } from "react";

export default function EventTimeline({ newEvent }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/events")
      .then((res) => res.json())
      .then((data) => setEvents(data));
  }, []);

  useEffect(() => {
    if (newEvent) {
      setEvents((prev) => [newEvent, ...prev]);
    }
  }, [newEvent]);

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white shadow-lg rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-6">Event Stream</h2>

      {events.map((event) => (
        <div
          key={event._id}
          className="border p-4 mb-3 rounded flex justify-between"
        >
          <div>
            <p className="font-semibold text-blue-600">
              {event.type}
            </p>

            <p className="text-sm text-gray-600">
              {JSON.stringify(event.payload)}
            </p>
          </div>

          <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded">
            received
          </span>
        </div>
      ))}
    </div>
  );
}