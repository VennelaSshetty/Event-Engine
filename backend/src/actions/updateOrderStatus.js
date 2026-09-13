import AppError from "../utils/AppError.js";

export default async function updateOrderStatus(payload) {
  //throw new AppError("Server Down", 400, true);
  if (!payload?.orderId) {
    throw new AppError("Order ID missing", 400, false);
  }

  try {
    // REAL PLACE: DB update (you will plug Mongo later)
    console.log("Updating order status:", payload.orderId);

  } catch (err) {
    throw new AppError(
      "Failed to update order status",
      500,
      true
    );
  }
}