import { useEffect, useState } from "react";
import { fetchDashboard } from "../services/api";

function StatsCards() {
  const [data, setData] = useState({
    totalEvents: 0,
    completed: 0,
    processing: 0,
    failed: 0,
    avgProcessingTime: 0,
  });

  useEffect(() => {
    const load = async () => {
      const dashboard = await fetchDashboard();
      setData(dashboard);
    };

    load();
  }, []);

  const cards = [
    {
      title: "Total Events",
      value: data.totalEvents,
    },
    {
      title: "Completed",
      value: data.completed,
    },
    {
      title: "Processing",
      value: data.processing,
    },
    {
      title: "Failed ",
      value: data.failed,
    },
    {
      title: "Avg Process Time",
      value: `${data.avgProcessingTime}ms`,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-[#0f1b3d] border border-slate-800 rounded-xl p-6"
        >
          <p className="text-slate-400 text-sm">
            {card.title}
          </p>

          <h2 className="text-4xl font-bold mt-3">
            {card.value}
          </h2>
        </div>
      ))}
    </div>
  );
}

export default StatsCards;