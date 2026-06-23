import { useEffect, useState } from "react";
import axios from "axios";

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

  useEffect(() => {

    const load = async () => {

      const res = await axios.get(
        "http://localhost:5000/api/dashboard"
      );

      const chartData =
        res.data.eventTypes.map(item => ({
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

      <div className="h-[300px] w-full">

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
                  fill={
                    COLORS[
                      index % COLORS.length
                    ]
                  }
                />
              ))}

            </Pie>

            <Tooltip />

          </PieChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}

export default EventTypeStats;