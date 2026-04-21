const router = require("express").Router();
const db = require("../db");

router.post("/", async (req, res) => {
  try {
    const { challenge_id, mentee_id, answer } = req.body;

    if (!challenge_id || !mentee_id || !answer) {
      return res.status(400).json({ message: "Missing fields" });
    }

    await db.query(
      "INSERT INTO submissions (challenge_id, mentee_id, answer) VALUES ($1,$2,$3)",
      [challenge_id, mentee_id, answer]
    );

    res.json({ message: "Submitted" });

  } catch (err) {
    console.log("SUBMISSION ERROR:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;