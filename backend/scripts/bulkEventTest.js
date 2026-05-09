import axios from "axios";

const TOTAL_EVENTS = 20;

const sendBulkEvents = async () => {
  const requests = [];

  for (let i = 1; i <= TOTAL_EVENTS; i++) {
    const request = axios.post(
      "http://localhost:5000/api/events",
      {
        type: "USER_SIGNUP",

        payload: {
          userId: `user_${i}`,
          email: `user${i}@example.com`
        },

        idempotencyKey: `signup_${Date.now()}_${i}`
      },
      {
        headers: {
          "x-api-key": "sk_test_e79b66537b49e239e441ae5e953d88e1"
        }
      }
    );

    requests.push(request);
  }

  try {
    const responses = await Promise.all(requests);

    console.log(`🚀 Successfully sent ${responses.length} events`);
  } catch (err) {
    console.error("❌ Bulk event sending failed");

    if (err.response) {
      console.error("Status:", err.response.status);
      console.error("Data:", err.response.data);
    } else {
      console.error(err.message);
    }
  }
};

sendBulkEvents();