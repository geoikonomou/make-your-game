const API_BASE = "http://localhost:8080";

/**
 * Submits a player's score to the Go API.
 *
 * @param {string} name
 * @param {number|string} score
 * @param {number|string} timeMs
 */
export async function submitScore(name, score, timeMs) {
  const payload = {
    name: String(name).trim(),
    score: parseInt(score, 10) || 0, // guarantee integer — never string, never NaN
    timeMs: parseInt(timeMs, 10) || 0, // guarantee integer — never string, never NaN
  };

  console.log("Submitting score payload:", payload);

  const res = await fetch(`${API_BASE}/scores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`submitScore failed (${res.status}): ${text}`);
  }

  return res.json();
}

/**
 * @typedef {Object} RankedScore
 * @property {number} rank
 * @property {string} name
 * @property {number} score
 * @property {number} timeMs
 * @property {string} time
 * @property {string} [date]
 */

/**
 * Retrieves all scores from the Go API (sorted desc by score).
 *
 * @returns {Promise<RankedScore[]>}
 */
export async function getLeaderboard() {
  const res = await fetch(`${API_BASE}/scores`);

  if (!res.ok) {
    throw new Error(`getLeaderboard failed (${res.status})`);
  }

  return res.json();
}
