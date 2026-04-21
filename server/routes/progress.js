const router = require("express").Router();
const db = require("../db");

router.get("/:mentee_id", async (req, res) => {
  const { mentee_id } = req.params;

  const result = await db.query(
    "SELECT * FROM progress WHERE mentee_id=$1",
    [mentee_id]
  );

  res.json(result.rows[0]);
});

module.exports = router;