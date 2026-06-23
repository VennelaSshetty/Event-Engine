import { useEffect, useState } from "react";
import { fetchDashboard } from "../services/api";

function DashboardData({ children }) {
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    load();

    const interval = setInterval(load, 5000);

    return () => clearInterval(interval);
  }, []);

  async function load() {
    try {
      const data = await fetchDashboard();
      setDashboard(data);
    } catch (err) {
      console.error(err);
    }
  }

  if (!dashboard) {
    return (
      <div className="text-white p-10">
        Loading dashboard...
      </div>
    );
  }

  return children(dashboard);
}

export default DashboardData;