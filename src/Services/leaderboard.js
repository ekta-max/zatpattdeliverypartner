//src\Services\leaderboard.js

import api from "./api";

/**
 * Leaderboard API
 * POST /api/v1/common/delivery-partner/leaderboard-dp/
 */
export const getLeaderboard = async () => {
  const res = await api.post(
    "/api/v1/common/delivery-partner/leaderboard-dp/"
  );

  return res.data;
};