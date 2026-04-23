const router = require("express").Router();
const db = require("../db");


// ✅ GET ALL SUBMISSIONS WITH FEEDBACK (JOIN)
router.get("/", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        s.id,
        s.challenge_id,
        s.mentee_id,
        s.answer,
        s.status,
        f.comment,
        f.score
      FROM submissions s
      LEFT JOIN feedback f 
      ON s.id = f.submission_id
      ORDER BY s.id DESC
    `);

    res.json(result.rows);

  } catch (err) {
    console.log("GET ERROR:", err);
    res.status(500).json({ message: "Server Error" });
  }
});


// ✅ CREATE SUBMISSION
router.post("/", async (req, res) => {
  try {
    const { challenge_id, mentee_id, answer } = req.body;

    if (!challenge_id || !mentee_id || !answer) {
      return res.status(400).json({ message: "Missing fields" });
    }

    await db.query(
      "INSERT INTO submissions(challenge_id, mentee_id, answer, status) VALUES($1,$2,$3,$4)",
      [challenge_id, mentee_id, answer, "pending"]
    );

    res.json({ message: "Submission successful" });

  } catch (err) {
    console.log("POST ERROR:", err);
    res.status(500).json({ message: "Server Error" });
  }
});


// ✅ EXPORT ROUTER (MOST IMPORTANT LINE)
module.exports = router;