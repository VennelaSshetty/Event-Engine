export default function EventCard({ event }) {
  return (
    <div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition">
      <h2 className="text-xl font-bold mb-2">{event.title}</h2>

      <p className="text-gray-600 mb-2">{event.description}</p>

      <p className="text-sm text-gray-500">
        📅 {event.date}
      </p>

      <p className="text-sm text-gray-500">
        📍 {event.location}
      </p>
    </div>
  );
}