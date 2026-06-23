import Navbar from "../components/Navbar";
import StatsCards from "../components/StatsCards";
import RecentEvents from "../components/RecentEvents";
import EventTypeStats from "../components/EventTypeStats";
import TimelineChart from "../components/TimelineChart";
import DLQTable from "../components/DLQTable";
import WorkflowTracker
from "../components/WorkflowTracker";

function Dashboard() {
  return (
    <div className="min-h-screen bg-[#081120] text-white">
      <Navbar />

      <div className="max-w-[1600px] mx-auto p-5">

        <StatsCards />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mt-5">

          <RecentEvents />

          <WorkflowTracker />

        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mt-5">

          <EventTypeStats />

          <TimelineChart />

        </div>

        <div className="mt-5">
  <DLQTable />
</div>

      </div>
    </div>
  );
}

export default Dashboard;