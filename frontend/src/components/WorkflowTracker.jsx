import { useEffect, useState } from "react";
import { fetchWorkflowTracker } from "../services/api";

function WorkflowTracker() {
  const [workflows, setWorkflows] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const data = await fetchWorkflowTracker();
      setWorkflows(data);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="bg-[#0d1729] border border-slate-800 rounded-xl p-5">

      <h2 className="text-xl font-semibold mb-4">
        Workflow Execution Tracker
      </h2>

      <div className="space-y-4">

        {workflows.map((workflow) => (
          <div
            key={workflow._id}
            className="border-b border-slate-800 pb-4"
          >

            <div className="flex justify-between">

              <h3 className="font-semibold">
                {workflow.workflowName}
              </h3>

              <span
                className={
                  workflow.status === "completed"
                    ? "text-green-400"
                    : "text-red-400"
                }
              >
                {workflow.status}
              </span>

            </div>

            <div className="mt-2">

              {/* CLEAN ACTIONS */}
              {[...new Set(workflow.completedActions || [])].map((action) => (
                <div key={action} className="text-green-400 text-sm">
                  ✓ {action}
                </div>
              ))}

              {/* FAILED ONLY ON FAILED WORKFLOWS */}
              {workflow.status === "failed" && workflow.failedAction && (
                <div className="text-red-400 text-sm">
                  ✗ {workflow.failedAction}
                </div>
              )}

            </div>

          </div>
        ))}

      </div>
    </div>
  );
}

export default WorkflowTracker;