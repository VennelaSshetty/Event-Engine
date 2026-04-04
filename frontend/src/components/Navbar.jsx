export default function Navbar() {
  return (
    <nav className="bg-gray-900 text-white px-8 py-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-indigo-400">Event Engine</h1>

      <div className="space-x-6">
        <button className="hover:text-indigo-400">Home</button>
        <button className="hover:text-indigo-400">Events</button>
        <button className="hover:text-indigo-400">Create Event</button>
      </div>
    </nav>
  );
}