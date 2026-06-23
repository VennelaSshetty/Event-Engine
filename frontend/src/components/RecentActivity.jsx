import { useEffect, useState } from "react";
import axios from "axios";

function RecentActivity() {

  const [activities, setActivities] = useState([]);

  useEffect(() => {

    const load = async () => {

      const res = await axios.get(
        "http://localhost:5000/api/dashboard"
      );

      setActivities(
        res.data.recentActivity
      );
    };

    load();

  }, []);

  return (
    <div className="bg-[#0d1729] border border-slate-800 rounded-xl p-5">

      <h2 className="text-xl font-semibold mb-4">
        Recent Activity
      </h2>

      <div className="space-y-4">

        {activities.map(item => (

          <div
            key={item._id}
            className="border-b border-slate-800 pb-3"
          >

            <div className="font-medium">
              {item.workflowName}
            </div>

            <div
              className={`text-sm ${
                item.status === "completed"
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {item.status}
            </div>

          </div>

        ))}

      </div>

    </div>
  );
}

export default RecentActivity;