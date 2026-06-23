import { useEffect, useState } from "react";
import { fetchDLQ } from "../services/api";

function DLQTable() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await fetchDLQ();
      setEvents(data);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="bg-[#0d1729] border border-slate-800 rounded-xl p-5">
      <h2 className="text-xl font-semibold mb-4">
        Dead Letter Queue
      </h2>

      {events.length === 0 ? (
        <p className="text-slate-400">
          No failed events
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="py-2">Event</th>
                <th className="py-2">Error Type</th>
              </tr>
            </thead>

            <tbody>
              {events.map((event, index) => (
                <tr
                  key={index}
                  className="border-b border-slate-800"
                >
                  <td className="py-3">
                    {event.eventId || "Batch"}
                  </td>

                  <td className="py-3 text-red-400">
                    {event.errorType}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DLQTable;