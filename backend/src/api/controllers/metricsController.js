import {
  getMetricsSummary
} from "../../services/metrics.service.js";

export const getMetrics = async (req, res) => {
  const metrics = await getMetricsSummary();

  res.status(200).json({
    success: true,
    data: metrics
  });
};