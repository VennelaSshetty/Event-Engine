import { useEffect, useState } from "react";

import {
  fetchDashboard,
  replayDLQEvent
} from "../services/api";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
const [error, setError] = useState(null);
const [replayingEventId, setReplayingEventId] = useState(null);

const handleReplay = async (eventId) => {
  try {
    setReplayingEventId(eventId);
    setError(null);

    await replayDLQEvent(eventId);

    await loadDashboard();
  } catch (err) {
    console.error("DLQ replay failed:", err);
    setError("Failed to replay event");
  } finally {
    setReplayingEventId(null);
  }
};

 const loadDashboard = async () => {
  try {
    const data = await fetchDashboard();

    const snapshot = data.data ?? data;

    setDashboard(snapshot);
    setError(null);
  } catch (err) {
    console.error("Dashboard fetch failed:", err);
    setError("Dashboard unavailable");
  }
};

  useEffect(() => {
    loadDashboard();

    const interval = setInterval(() => {
      loadDashboard();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-[#050b14] text-white flex items-center justify-center">
        <div className="text-sm text-slate-400">
          Connecting to Event Engine...
        </div>
      </div>
    );
  }

  const { metrics, counts, queue, workers, health } = dashboard;

  return (
    <div className="min-h-screen bg-[#050b14] text-white">

      {/* HEADER */}
      <header className="border-b border-white/10 bg-[#07101d]">
        <div className="max-w-[1800px] mx-auto px-6 py-4 flex items-center justify-between">

          <div>
            <div className="flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />

              <h1 className="text-lg font-semibold tracking-wide">
                EVENT ENGINE
              </h1>
            </div>

            <p className="text-xs text-slate-500 mt-1">
              Distributed event processing control room
            </p>
          </div>

          <div className="flex items-center gap-4">

            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-slate-500">
                System
              </p>

              <p className="text-sm text-emerald-400">
                {error ? "DEGRADED" : "OPERATIONAL"}
              </p>
            </div>

            <div className="h-8 w-px bg-white/10" />

            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-slate-500">
                Workers
              </p>

              <p className="text-sm">
                {workers.total}
              </p>
            </div>

          </div>
        </div>
      </header>


      <main className="max-w-[1800px] mx-auto px-6 py-6">


        {/* ERROR */}
        {error && (
          <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}


        {/* METRICS */}
        <section className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">

          <Metric
            label="Total Events"
            value={metrics.totalEvents}
          />

          <Metric
            label="Completed"
            value={metrics.successfulEvents}
          />

          <Metric
            label="Processing"
            value={counts.processing}
          />

          <Metric
            label="Retrying"
            value={counts.retrying}
          />

          <Metric
            label="Failed"
            value={metrics.failedEvents}
          />

          <Metric
            label="DLQ"
            value={counts.dlq}
          />

          <Metric
            label="P95 Latency"
            value={`${metrics.p95Latency} ms`}
          />

          <Metric
            label="Failure Rate"
            value={`${metrics.failureRate}%`}
          />

        </section>

       {/* PIPELINE */}
<section className="mt-6 rounded-xl border border-white/10 bg-[#07101d] p-6">

  <div className="flex items-center justify-between mb-6">

    <div>
      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
        Live pipeline
      </p>

      <h2 className="text-lg font-semibold mt-1">
        Event Processing Flow
      </h2>
    </div>

    <div className="flex items-center gap-2 text-xs text-emerald-400">
      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
      LIVE
    </div>

  </div>

  <div className="flex items-center gap-3 overflow-x-auto pb-2">

    <PipelineNode
      label="API INGEST"
      value={dashboard.pipeline.ingest}
    />

    <PipelineConnector
      active={
        dashboard.pipeline.ingest > 0 ||
        dashboard.pipeline.queue > 0 ||
        workers.activeJobs > 0
      }
    />

    <PipelineNode
      label="QUEUE"
      value={dashboard.pipeline.queue}
    />

    <PipelineConnector
      active={
        dashboard.pipeline.queue > 0 ||
        workers.activeJobs > 0
      }
    />

    <PipelineNode
      label="WORKER POOL"
      value={workers.busy}
      detail={`${workers.total} instance${workers.total === 1 ? "" : "s"}`}
    />

    <PipelineConnector
      active={
        workers.activeJobs > 0 ||
        workers.activeActions > 0
      }
    />

    <PipelineNode
      label="ACTIONS"
      value={workers.activeActions}
    />
<PipelineConnector
  active={workers.activeActions > 0}
/>

    <PipelineNode
      label="DONE / DLQ"
      value={dashboard.pipeline.doneOrDlq}
    />

  </div>

</section>


        {/* WORKERS + QUEUE */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-5 mt-5">


          {/* WORKERS */}
          <section className="rounded-xl border border-white/10 bg-[#07101d] p-5">

            <div className="flex items-center justify-between mb-5">

              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                  Runtime
                </p>

                <h2 className="text-lg font-semibold mt-1">
                  Worker Pool
                </h2>
              </div>

              <span className="text-xs text-slate-500">
                {workers.busy} busy · {workers.idle} idle
              </span>

            </div>


            <div className="space-y-3">

              {workers.instances.map((worker) => (
                <WorkerRow
                  key={worker.workerId}
                  worker={worker}
                />
              ))}

              {workers.instances.length === 0 && (
                <div className="text-sm text-slate-500 py-6 text-center">
                  No active workers detected
                </div>
              )}

            </div>

          </section>


          {/* QUEUE */}
<section className="rounded-xl border border-white/10 bg-[#07101d] p-5">

  <div className="flex items-center justify-between mb-5">

    <div>
      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
        BullMQ
      </p>

      <h2 className="text-lg font-semibold mt-1">
        Queue Depth
      </h2>
    </div>

    <div className="text-right">
      <p className="text-[10px] uppercase tracking-widest text-slate-500">
        In flight
      </p>

      <p className="text-lg font-semibold">
        {queue.waiting + queue.active + queue.delayed}
      </p>
    </div>

  </div>


  <div className="space-y-5">

    <QueueDepthRow
      label="Waiting"
      value={queue.waiting}
      maxValue={Math.max(
        queue.waiting,
        queue.active,
        queue.delayed,
        1
      )}
    />

    <QueueDepthRow
      label="Active"
      value={queue.active}
      maxValue={Math.max(
        queue.waiting,
        queue.active,
        queue.delayed,
        1
      )}
    />

    <QueueDepthRow
      label="Delayed"
      value={queue.delayed}
      maxValue={Math.max(
        queue.waiting,
        queue.active,
        queue.delayed,
        1
      )}
    />

  </div>


  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">

    <span className="text-xs text-slate-500">
      Total in flight
    </span>

    <span className="text-sm font-semibold text-slate-300">
      {queue.waiting + queue.active + queue.delayed}
    </span>

  </div>

</section>

        </section>


        {/* RECENT EVENTS */}
        <section className="mt-5 rounded-xl border border-white/10 bg-[#07101d] p-5">

          <div className="flex items-center justify-between mb-5">

            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                Event stream
              </p>

              <h2 className="text-lg font-semibold mt-1">
                Recent Events
              </h2>
            </div>

            <span className="text-xs text-slate-500">
              {dashboard.recentEvents.length} latest
            </span>

          </div>


          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead>
                <tr className="border-b border-white/10 text-left text-[10px] uppercase tracking-widest text-slate-500">

                  <th className="pb-3">Event</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Status</th>
                 <th className="pb-3">Replays</th>
                  <th className="pb-3">Latency</th>

                </tr>
              </thead>

              <tbody>

                {dashboard.recentEvents.map((event) => (
                  <EventRow
                    key={event._id}
                    event={event}
                  />
                ))}

              </tbody>

            </table>

          </div>

        </section>


        {/* DLQ */}
        <section className="mt-5 rounded-xl border border-white/10 bg-[#07101d] p-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                Failure handling
              </p>

              <h2 className="text-lg font-semibold mt-1">
                Dead Letter Queue
              </h2>
            </div>

            <div className="text-sm text-red-400">
              {dashboard.dlqEvents.length} events
            </div>

          </div>

          <div className="mt-5 space-y-3">

            {dashboard.dlqEvents.map((event) => (
              <div
                key={event._id}
                className="flex items-center justify-between rounded-lg border border-red-500/10 bg-red-500/5 px-4 py-3"
              >

                <div>
                  <p className="text-sm font-medium">
                    {event.type}
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    {event.dlqReason || "No failure reason recorded"}
                  </p>
                </div>

                <button
  onClick={() => handleReplay(event._id)}
  disabled={replayingEventId === event._id}
  className="rounded-md border border-white/10 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
>
  {replayingEventId === event._id ? "Replaying..." : "Replay"}
</button>

              </div>
            ))}

            {dashboard.dlqEvents.length === 0 && (
              <div className="py-6 text-center text-sm text-slate-500">
                Dead letter queue is empty
              </div>
            )}

          </div>

        </section>


        {/* HEALTH */}
        <section className="mt-5 flex flex-wrap gap-3">

          <HealthBadge
            label="API"
            healthy={health.api}
          />

          <HealthBadge
            label="Worker"
            healthy={health.worker}
          />

          <HealthBadge
            label="Redis"
            healthy={health.redis}
          />

          <HealthBadge
            label="MongoDB"
            healthy={health.mongodb}
          />

          <HealthBadge
            label="Queue"
            healthy={health.queue}
          />

        </section>

      </main>

    </div>
  );
}


function Metric({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#07101d] px-4 py-4">
      <p className="text-[10px] uppercase tracking-widest text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-xl font-semibold tracking-tight">
        {value}
      </p>
    </div>
  );
}


function PipelineNode({ label, value, detail }) {
  return (
    <div className="flex-1 min-w-[190px] rounded-lg border border-white/10 bg-[#0a1524] px-4 py-5 text-center">

      <p className="text-[10px] uppercase tracking-widest text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-semibold">
        {value}
      </p>

      {detail && (
        <p className="mt-1 text-[11px] text-slate-500">
          {detail}
        </p>
      )}

    </div>
  );
}


function PipelineConnector({ active }) {
  return (
    <div className="flex w-12 shrink-0 items-center justify-center">

      <div
        className={`relative h-px w-full overflow-hidden ${
          active
            ? "bg-emerald-400/30"
            : "bg-slate-700/50"
        }`}
      >

        {active && (
          <span className="pipeline-particle" />
        )}

      </div>

    </div>
  );
}


function WorkerRow({ worker }) {
  const busy = worker.status === "busy";

  return (
    <div className="rounded-lg border border-white/10 bg-[#0a1524] p-4">

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3">

          <span
            className={`h-2.5 w-2.5 rounded-full ${
              busy
                ? "bg-amber-400 animate-pulse"
                : "bg-emerald-400"
            }`}
          />

          <div>
            <p className="text-sm font-medium">
              {worker.workerId}
            </p>

            <p className="text-xs text-slate-500">
              {busy ? "Processing" : "Idle"}
            </p>
          </div>

        </div>

        <div className="text-right text-xs text-slate-500">
          {worker.activeJobs} job
          {worker.activeJobs === 1 ? "" : "s"}
        </div>

      </div>


      {worker.activeEvents?.length > 0 && (
        <div className="mt-3 text-xs text-slate-400">
          Event: {worker.activeEvents[0].type}
        </div>
      )}

      {worker.activeActions?.length > 0 && (
        <div className="mt-1 text-xs text-slate-500">
          Action: {worker.activeActions[0].action}
        </div>
      )}

    </div>
  );
}


function QueueDepthRow({ label, value, maxValue }) {
  const percentage =
    maxValue > 0
      ? Math.min((value / maxValue) * 100, 100)
      : 0;

  return (
    <div>

      <div className="flex items-center justify-between mb-2">

        <span className="text-xs text-slate-400">
          {label}
        </span>

        <span className="text-sm font-semibold text-slate-200">
          {value}
        </span>

      </div>


      <div className="h-2 w-full overflow-hidden rounded-full bg-[#0a1524]">

        <div
          className="h-full rounded-full bg-emerald-400/80 transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`
          }}
        />

      </div>

    </div>
  );
}


function EventRow({ event }) {
   console.log("RECENT EVENT:", event);

  const statusClass =
    event.status === "completed"
      ? "text-emerald-400"
      : event.status === "failed"
        ? "text-red-400"
        : event.status === "retrying"
          ? "text-amber-400"
          : "text-blue-400";

  return (
    <tr className="border-b border-white/5 last:border-0">

      <td className="py-3 font-mono text-xs text-slate-400">
        {String(event._id).slice(-8)}
      </td>

      <td className="py-3 text-slate-300">
        {event.type}
      </td>

      <td className={`py-3 ${statusClass}`}>
        {event.isInDLQ ? "DLQ" : event.status}
      </td>

<td className="py-3 text-slate-400">
  {event.replayCount ?? 0}
</td>

      <td className="py-3 text-slate-400">
        {event.processingTimeMs
          ? `${event.processingTimeMs} ms`
          : "—"}
      </td>

    </tr>
  );
}


function HealthBadge({ label, healthy }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#07101d] px-3 py-2">

      <span
        className={`h-2 w-2 rounded-full ${
          healthy
            ? "bg-emerald-400"
            : "bg-red-400"
        }`}
      />

      <span className="text-xs text-slate-400">
        {label}
      </span>

      <span
        className={`text-xs ${
          healthy
            ? "text-emerald-400"
            : "text-red-400"
        }`}
      >
        {healthy ? "OK" : "DOWN"}
      </span>

    </div>
  );
}

export default Dashboard;