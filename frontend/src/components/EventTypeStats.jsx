import { useEffect, useState } from "react";
import { API } from "../services/api";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const COLORS = [
  "#2563eb",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#8b5cf6"
];

function EventTypeStats() {

  const [data, setData] = useState([]);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  useEffect(() => {

    const load = async () => {

    const res = await API.get("/dashboard");

     const chartData =
  (res.data?.eventTypes || []).map(item => ({
    name: item._id,
    value: item.count
  }));

      setData(chartData);
    };

    load();

  }, []);

  return (
    <div className="bg-[#0d1729] border border-slate-800 rounded-xl p-5">

      <h2 className="text-xl font-semibold mb-4">
        Events By Type
      </h2>

<div className="h-[300px] w-full flex gap-4">

  {/* LEFT SIDE - PIE CHART */}
  <div className="w-1/2 h-full">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>

        <Pie
          data={data}
          dataKey="value"
          innerRadius={70}
          outerRadius={100}
        >
          {data.map((entry, index) => (
            <Cell
              key={index}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>

        <Tooltip />

      </PieChart>
    </ResponsiveContainer>
  </div>

  {/* RIGHT SIDE - LEGEND */}
 <div className="w-1/2 h-full flex flex-col justify-center space-y-2 pr-2">

    {data.map((item, index) => {

      const total = data.reduce((sum, i) => sum + i.value, 0);

      const percent =
        total > 0
          ? ((item.value / total) * 100).toFixed(1)
          : 0;

      return (
        <div key={index} className="flex items-center justify-between text-sm">

          {/* color + name */}
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: COLORS[index % COLORS.length]
              }}
            />

            <span className="text-slate-300">
              {item.name}
            </span>
          </div>

          {/* value */}
          <div className="text-slate-400">
            {item.value} ({percent}%)
          </div>

        </div>
      );
    })}

  </div>

</div>
</div>
  );
}

export default EventTypeStats;