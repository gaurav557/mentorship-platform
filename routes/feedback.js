const router = require("express").Router();
const db = require("../db");

// ADD FEEDBACK
router.post("/", async (req, res) => {
  try {
    const { submission_id, comment, score } = req.body;

    if (!submission_id || !comment) {
      return res.status(400).json({ message: "Missing fields" });
    }

    await db.query(
      "INSERT INTO feedback(submission_id, comment, score) VALUES($1,$2,$3)",
      [submission_id, comment, score || null]
    );

    // ALSO UPDATE STATUS
    await db.query(
      "UPDATE submissions SET status = 'reviewed' WHERE id = $1",
      [submission_id]
    );

    res.json({ message: "Feedback added" });

  } catch (err) {
    console.log("FEEDBACK ERROR:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;