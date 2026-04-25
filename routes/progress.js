const router = require("express").Router();
const db = require("../db");

// GET LEADERBOARD
router.get("/", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        mentee_id,
        u.name,
        COUNT(*) AS total_submissions
      FROM submissions
      LEFT JOIN users u ON u.id = submissions.mentee_id
      GROUP BY mentee_id
      , u.name
      ORDER BY total_submissions DESC
    `);

    res.json(result.rows);

  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
