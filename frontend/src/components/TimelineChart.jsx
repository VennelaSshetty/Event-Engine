import { useEffect, useState } from "react";
import axios from "axios";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function TimelineChart() {

  const [timeline, setTimeline] =
    useState([]);

  useEffect(() => {

    const load = async () => {

      const res = await axios.get(
        "http://localhost:5000/api/dashboard"
      );

      const chartData =
        res.data.timeline.map(item => ({
          time: item.time,
          value:
            item.status === "completed"
              ? 1
              : 0
        }));

      setTimeline(chartData);
    };

    load();

  }, []);

  return (
    <div className="bg-[#0d1729] border border-slate-800 rounded-xl p-5">

      <h2 className="text-xl font-semibold mb-4">
        Events Over Time
      </h2>

      <div className="h-[300px] w-full">

        <ResponsiveContainer width="100%" height="100%">

          <LineChart data={timeline}>

            <XAxis dataKey="time" />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="value"
            />

          </LineChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}

export default TimelineChart;