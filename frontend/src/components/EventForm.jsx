import { useState } from "react";

export default function EventForm({ onEventCreated }) {
  const [type, setType] = useState("");
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Update form data
    setFormData({ ...formData, [name]: value });

    // Validate inline
    let errorMsg = "";

    if (name === "userId") {
      if (!/^user_\d+$/.test(value)) {
        errorMsg = "Format: user_ followed by numbers";
      }
    }

    if (name === "email") {
      if (!/^\S+@\S+\.\S+$/.test(value)) {
        errorMsg = "Enter a valid email address";
      }
    }

    if (name === "orderId") {
      if (!/^order_\d+$/.test(value)) {
        errorMsg = "Format: order_ followed by numbers";
      }
    }

    if (name === "paymentId") {
      if (!/^pay_\d+$/.test(value)) {
        errorMsg = "Format: pay_ followed by numbers";
      }
    }

    if (name === "amount") {
      if (!(Number(value) > 0)) {
        errorMsg = "Enter a positive number";
      }
    }

    setErrors({ ...errors, [name]: errorMsg });
  };

  const isFormValid = () => {
    // All fields must be non-empty & have no errors
    const values = Object.values(formData);
    const errs = Object.values(errors);
    return values.every((v) => v !== undefined && v !== "") && errs.every((e) => e === "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      alert("Please fix the errors before submitting!");
      return;
    }

    let payload = {};
    let idempotencyKey = "";

    if (type === "USER_SIGNUP") {
      payload = {
        userId: formData.userId,
        email: formData.email
      };
      idempotencyKey = formData.userId;
    }

    if (type === "ORDER_CREATED") {
      payload = {
        orderId: formData.orderId,
        amount: Number(formData.amount)
      };
      idempotencyKey = formData.orderId;
    }

    if (type === "PAYMENT_SUCCESS") {
      payload = {
        paymentId: formData.paymentId,
        orderId: formData.orderId
      };
      idempotencyKey = formData.paymentId;
    }

    try {
      const response = await fetch("http://localhost:5000/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, payload, idempotencyKey })
      });

      const data = await response.json();

      if (response.ok) {
        onEventCreated(data);
        setType("");
        setFormData({});
        setErrors({});
      } else {
        alert(data.message || data.error);
      }
    } catch {
      alert("Something went wrong");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 bg-white shadow-lg rounded-xl p-6">
      <h2 className="text-xl font-bold mb-4">Create Event</h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setFormData({});
            setErrors({});
          }}
          className="w-full border p-2 rounded"
          required
        >
          <option value="">Select Event Type</option>
          <option value="USER_SIGNUP">USER_SIGNUP</option>
          <option value="ORDER_CREATED">ORDER_CREATED</option>
          <option value="PAYMENT_SUCCESS">PAYMENT_SUCCESS</option>
        </select>

        {/* USER_SIGNUP */}
        {type === "USER_SIGNUP" && (
          <>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">User ID</label>
              <input
                name="userId"
                placeholder="e.g. user_123"
                value={formData.userId || ""}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
              {errors.userId && <p className="text-xs text-red-500">{errors.userId}</p>}
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">Email</label>
              <input
                name="email"
                placeholder="e.g. test@gmail.com"
                type="email"
                value={formData.email || ""}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>
          </>
        )}

        {/* ORDER_CREATED */}
        {type === "ORDER_CREATED" && (
          <>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">Order ID</label>
              <input
                name="orderId"
                placeholder="e.g. order_101"
                value={formData.orderId || ""}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
              {errors.orderId && <p className="text-xs text-red-500">{errors.orderId}</p>}
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">Amount</label>
              <input
                name="amount"
                type="number"
                placeholder="e.g. 499"
                value={formData.amount || ""}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
              {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
            </div>
          </>
        )}

        {/* PAYMENT_SUCCESS */}
        {type === "PAYMENT_SUCCESS" && (
          <>
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">Payment ID</label>
              <input
                name="paymentId"
                placeholder="e.g. pay_456"
                value={formData.paymentId || ""}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
              {errors.paymentId && <p className="text-xs text-red-500">{errors.paymentId}</p>}
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1">Order ID</label>
              <input
                name="orderId"
                placeholder="e.g. order_101"
                value={formData.orderId || ""}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />
              {errors.orderId && <p className="text-xs text-red-500">{errors.orderId}</p>}
            </div>
          </>
        )}

        <button
          type="submit"
          className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${
            !isFormValid() ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={!isFormValid()}
        >
          Send Event
        </button>

      </form>
    </div>
  );
}