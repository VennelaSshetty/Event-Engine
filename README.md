# ⚡ Event Engine

> A Production-Grade Event Processing & Workflow Orchestration Platform built using Node.js, Redis, BullMQ, MongoDB, and React.

![Node.js](https://img.shields.io/badge/Node.js-Backend-green)
![React](https://img.shields.io/badge/React-Frontend-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green)
![Redis](https://img.shields.io/badge/Redis-Queue-red)
![BullMQ](https://img.shields.io/badge/BullMQ-Job%20Processing-orange)
![Status](https://img.shields.io/badge/Status-Deployed-success)

---

## 🚀 Live Demo

Frontend: `YOUR_VERCEL_URL`

Backend API: `YOUR_RENDER_API_URL`

---

# 📖 Overview

Event Engine is a distributed event-driven workflow orchestration platform designed to simulate how modern large-scale systems process asynchronous events reliably.

The platform accepts events from external applications, validates requests, stores event data, queues jobs for processing, executes configurable workflows, tracks execution status, retries failures automatically, manages dead-letter queues, and provides real-time observability through a monitoring dashboard.

This project demonstrates concepts commonly used in production systems at companies like Microsoft, Google, Amazon, Uber, Netflix, and Stripe.

---

# 🎯 Problem Statement

Modern applications generate thousands of events:

- User registrations
- Payment confirmations
- Order creations
- Notifications
- Analytics updates

Processing these synchronously leads to:

- Slow API responses
- Poor scalability
- System bottlenecks
- Reduced reliability

Event Engine solves these challenges using asynchronous event processing and workflow orchestration.

---

# ✨ Features

## Event Ingestion

- Secure Event APIs
- API Key Authentication
- Request Validation
- Event Persistence

## Reliability

- Retry Mechanism
- Exponential Backoff
- Dead Letter Queue (DLQ)
- Failure Recovery
- Event Replay

## Workflow Engine

- Config-Driven Workflows
- Sequential Execution
- Parallel Execution
- Dynamic Action Resolution

## Scalability

- Redis Queue
- BullMQ Workers
- Concurrent Job Processing
- Horizontal Scaling Ready

## Observability

- Live Event Feed
- Workflow Execution Tracker
- Processing Metrics
- DLQ Monitoring
- Event Analytics Dashboard

## Security

- API Key Authentication
- Rate Limiting
- Idempotency Protection
- Centralized Error Handling

---

# 🏗 Architecture

```text
                    ┌─────────────────────┐
                    │     Client Apps     │
                    │    (FoodApp etc.)   │
                    └──────────┬──────────┘
                               │
                               ▼

                    ┌─────────────────────┐
                    │      API Layer      │
                    │  Node.js + Express  │
                    └──────────┬──────────┘
                               │
      ┌────────────────────────┼────────────────────────┐
      │                        │                        │
      ▼                        ▼                        ▼

Authentication         Rate Limiting          Idempotency

      │                        │                        │
      └────────────────────────┼────────────────────────┘
                               │
                               ▼

                    MongoDB Event Store

                               │
                               ▼

                    Redis Queue (BullMQ)

                               │
                               ▼

                  ┌──────────────────────┐
                  │   Worker Service     │
                  │ Concurrent Workers   │
                  └──────────┬───────────┘
                             │
                             ▼

                    Workflow Engine

                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼

     Email Action     Notification      Analytics
                         Action

         │                   │                   │
         └───────────────────┼───────────────────┘
                             │
                             ▼

                     Status Tracking

                             │
                             ▼

                    Dashboard & Metrics
```

---

# 🔄 Event Lifecycle

```text
Client Request
      │
      ▼
Authentication
      │
      ▼
Rate Limiting
      │
      ▼
Idempotency Check
      │
      ▼
Save Event
      │
      ▼
Push To Queue
      │
      ▼
Worker Picks Job
      │
      ▼
Workflow Execution
      │
      ▼
Status Update
      │
      ▼
Analytics Dashboard
```

---

# ⚙ Workflow Engine

Instead of hardcoding logic:

```js
if (eventType === "USER_SIGNUP") {
  sendEmail();
}
```

Event Engine uses configurable workflows:

```json
{
  "USER_SIGNUP": [
    "sendWelcomeEmail",
    "sendNotification",
    "trackAnalytics"
  ],

  "PAYMENT_SUCCESS": [
    "updateOrderStatus",
    "sendPaymentEmail",
    "sendNotification",
    "trackAnalytics"
  ]
}
```

Worker Execution Flow:

```text
Event
 ↓
Workflow Engine
 ↓
Load Workflow
 ↓
Execute Actions
 ↓
Update Status
```

---

# 📂 Project Structure

```text
event-engine
│
├── frontend
│   ├── src
│   ├── pages
│   ├── components
│   ├── charts
│   └── services
│
├── backend
│   ├── src
│   │
│   ├── api
│   │   ├── controllers
│   │   ├── routes
│   │   └── middleware
│   │
│   ├── actions
│   │
│   ├── workflows
│   │
│   ├── workers
│   │
│   ├── queues
│   │
│   ├── services
│   │
│   ├── models
│   │
│   ├── config
│   │
│   └── utils
│
└── README.md
```

---

# 🛠 Tech Stack

## Frontend

- React.js
- Vite
- Tailwind CSS
- Axios
- Recharts

## Backend

- Node.js
- Express.js

## Database

- MongoDB Atlas

## Queue & Messaging

- Redis
- BullMQ

## Deployment

- Vercel
- Render
- Upstash Redis
- MongoDB Atlas

---

# 🔒 Reliability Features

### Retry Mechanism

```text
Attempt 1
   ↓
Attempt 2
   ↓
Attempt 3
   ↓
Move To DLQ
```

### Dead Letter Queue

Failed jobs are automatically moved to DLQ after exhausting retry attempts.

Benefits:

- No event loss
- Easier debugging
- Replay support

### Event Replay

```text
Failed Event
     ↓
Replay
     ↓
Queue
     ↓
Worker
     ↓
Workflow Execution
```

---

# 📊 Dashboard Features

## System Metrics

- Total Events
- Completed Events
- Processing Events
- Failed Events
- Average Processing Time

## Live Event Feed

Real-time monitoring of incoming events.

## Workflow Tracker

Displays workflow execution status for every action.

Example:

### USER_SIGNUP

```text
✓ sendWelcomeEmail
✓ sendNotification
✓ trackAnalytics
```

### PAYMENT_SUCCESS

```text
✓ updateOrderStatus
✓ sendPaymentEmail
✓ sendNotification
✓ trackAnalytics
```

## Analytics

- Event Type Distribution
- Event Timeline
- Processing Statistics

## Dead Letter Queue Monitoring

- Failed Events
- Failure Reason
- Replay Functionality

---

# ☁ Deployment Architecture

```text
Frontend (Vercel)
        │
        ▼

Backend API (Render)
        │
        ▼

MongoDB Atlas

        │

Redis Queue (Upstash)

        │

Worker Service (Render)
```

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/yourusername/event-engine.git
```

```bash
cd event-engine
```

---

## Backend Setup

```bash
cd backend
npm install
```

Create `.env`

```env
PORT=5000

MONGO_URI=

REDIS_HOST=

REDIS_PORT=

API_KEY=

QUEUE_NAME=
```

Run Backend

```bash
npm run dev
```

---

## Worker Setup

```bash
npm run worker
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

# 📈 Engineering Concepts Demonstrated

### Backend Engineering

- REST APIs
- Middleware
- Authentication
- Error Handling

### Distributed Systems

- Event-Driven Architecture
- Queue-Based Processing
- Worker Architecture
- Reliability Patterns

### Scalability

- Concurrent Workers
- Horizontal Scaling
- Workflow Orchestration

### Reliability Engineering

- Retry Logic
- DLQ
- Idempotency
- Failure Recovery

### Cloud Engineering

- Managed Redis
- Managed MongoDB
- Distributed Deployment

---

# 🔮 Future Improvements

- Kafka Integration
- RabbitMQ Support
- Kubernetes Deployment
- OpenTelemetry
- Jaeger Distributed Tracing
- Multi-Region Workers
- Event Sourcing
- Microservice Extraction

---

# 📸 Screenshots

## Dashboard

![Dashboard](./screenshots/dashboard.png)

---

# 🧑‍💻 Author

### Vennela Shetty

Engineering Student | Backend Developer | Distributed Systems Enthusiast

Interested in:

- Backend Engineering
- System Design
- Distributed Systems
- Cloud Infrastructure
- Scalable Software Architecture

---

## ⭐ If you found this project interesting, consider giving it a star.
