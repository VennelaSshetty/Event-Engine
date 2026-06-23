import { useEffect, useState } from "react";
import { fetchDashboard } from "../services/api";

function RecentEvents() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await fetchDashboard();
      setEvents(data.recentEvents);
    };

    load();
  }, []);

  return (
    <div className="bg-[#0d1729] border border-slate-800 rounded-xl p-5">

      <h2 className="text-xl font-semibold mb-4">
        Live Event Feed
      </h2>

      <div className="space-y-3">

        {events.map((event) => (

          <div
            key={event._id}
            className="flex justify-between border-b border-slate-800 pb-3"
          >

            <div>
              <div className="font-medium">
                {event.type}
              </div>

              <div className="text-slate-500 text-sm">
                {event.appName}
              </div>
            </div>

            <div
              className={`font-medium ${
                event.status === "completed"
                  ? "text-green-400"
                  : event.status === "failed"
                  ? "text-red-400"
                  : "text-yellow-400"
              }`}
            >
              {event.status}
            </div>

          </div>

        ))}

      </div>

    </div>
  );
}

export default RecentEvents;