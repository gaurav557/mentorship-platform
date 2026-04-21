const router = require("express").Router();
const db = require("../db");

router.post("/give", async (req, res) => {
  const { submission_id, comment, score, mentee_id } = req.body;

  await db.query(
    "INSERT INTO feedback(submission_id,comment,score) VALUES($1,$2,$3)",
    [submission_id, comment, score]
  );

  // update submission status
  await db.query(
    "UPDATE submissions SET status='reviewed' WHERE id=$1",
    [submission_id]
  );

  // update progress
  await db.query(
    `INSERT INTO progress(mentee_id,total_submissions,avg_score)
     VALUES($1,1,$2)
     ON CONFLICT (mentee_id)
     DO UPDATE SET
       total_submissions = progress.total_submissions + 1,
       avg_score = (progress.avg_score + $2)/2`,
    [mentee_id, score]
  );

  res.send("Feedback + Progress Updated");
});

module.exports = router;