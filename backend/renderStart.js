import { spawn } from "child_process";

const processes = [
  ["server.js", "api"],

  ...Array.from({ length: 8 }, (_, i) => [
    "src/workers/eventWorker.js",
    `event-worker-${i + 1}`,
  ]),

  ["src/workers/outboxWorker.js", "outbox-worker"],
  ["src/workers/dlqWorker.js", "dlq-worker"],
];

const children = processes.map(([file, name]) => {
  const child = spawn("node", [file], {
    stdio: "inherit",
  });

  console.log(`${name} started (PID: ${child.pid})`);

  child.on("exit", (code, signal) => {
    console.log(`${name} exited`, { code, signal });
  });

  return child;
});