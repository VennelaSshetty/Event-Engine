import { useState } from "react";
import EventForm from "./components/EventForm";
import EventTimeline from "./components/EventTimeline";

function App() {
  const [newEvent, setNewEvent] = useState(null);

  return (
    <div className="min-h-screen bg-gray-100">

      <h1 className="text-4xl font-bold text-center pt-10">
        Event Engine Dashboard
      </h1>

      <EventForm onEventCreated={setNewEvent} />

      <EventTimeline newEvent={newEvent} />

    </div>
  );
}

export default App;