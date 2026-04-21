const router = require("express").Router();
const db = require("../db");

router.post("/add", async (req, res) => {
  const { submission_id, text } = req.body;

  await db.query(
    "INSERT INTO comments(submission_id,text) VALUES($1,$2)",
    [submission_id, text]
  );

  res.send("Comment Added");
});

router.get("/:submission_id", async (req, res) => {
  const result = await db.query(
    "SELECT * FROM comments WHERE submission_id=$1",
    [req.params.submission_id]
  );

  res.json(result.rows);
});

module.exports = router;