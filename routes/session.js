const router = require("express").Router();
const db = require("../db");

// CREATE SESSION
router.post("/", async (req,res)=>{
  const {title, description} = req.body;

  try{
    const result = await db.query(
      "INSERT INTO sessions(title, description) VALUES($1,$2) RETURNING *",
      [title, description]
    );

    res.json(result.rows[0]);

  }catch(err){
    console.log(err);
    res.status(500).json({error:"Server error"});
  }
});

// GET ALL SESSIONS
router.get("/", async (req,res)=>{
  try{
    const result = await db.query("SELECT * FROM sessions ORDER BY id DESC");
    res.json(result.rows);

  }catch(err){
    console.log(err);
    res.status(500).json({error:"Server error"});
  }
});

module.exports = router;