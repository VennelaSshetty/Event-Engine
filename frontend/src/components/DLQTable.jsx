import { useEffect, useState } from "react";
import { fetchDLQ } from "../services/api";
import { replayDLQEvent } from "../services/api";

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

  async function handleReplay(eventId) {

  try {

    await replayDLQEvent(eventId);

    load();

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
  <th className="py-2">Event Type</th>
  <th className="py-2">Status</th>
  <th className="py-2">Reason</th>
  <th className="py-2">Moved To DLQ</th>
  <th className="py-2">Action</th>
</tr>
            </thead>

            <tbody>
              {events.map((event) => (
                <tr
                  key={event._id}
                  className="border-b border-slate-800"
                >
                  <td className="py-3">
                    {event.type}
                  </td>

                  <td className="py-3 text-red-400">
                    {event.status}
                  </td>

                  <td className="py-3">
                    {event.dlqReason}
                  </td>

                  <td className="py-3">
                    {new Date(
                      event.movedToDLQAt
                    ).toLocaleString()}
                  </td>

                  <td className="py-3">

  <button
    onClick={() => handleReplay(event._id)}
    className="
      px-3
      py-1
      bg-blue-600
      rounded
      hover:bg-blue-700
    "
  >
    Replay
  </button>

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