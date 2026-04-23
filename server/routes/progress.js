const router = require("express").Router();
const db = require("../db");

// LEADERBOARD API
router.get("/leaderboard", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT mentee_id, COUNT(*) as total
      FROM submissions
      GROUP BY mentee_id
      ORDER BY total DESC
    `);

    res.json(result.rows);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;