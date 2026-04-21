const router = require("express").Router();
const db = require("../db");

router.post("/create", async (req, res) => {
  const { mentor_id, title, start_date } = req.body;

  await db.query(
    "INSERT INTO sessions(mentor_id,title,start_date) VALUES($1,$2,$3)",
    [mentor_id, title, start_date]
  );

  res.send("Session Created");
});

router.get("/all", async (req, res) => {
  const result = await db.query("SELECT * FROM sessions");
  res.json(result.rows);
});

module.exports = router;