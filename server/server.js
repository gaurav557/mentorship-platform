const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/session", require("./routes/session"));
app.use("/api/challenge", require("./routes/challenge"));
app.use("/api/submission", require("./routes/submission"));
app.use("/api/feedback", require("./routes/feedback"));
app.use("/api/progress", require("./routes/progress"));
app.use("/api/comment", require("./routes/comment"));
app.get("/", (req, res) => {
  res.send("Backend is running successfully 🚀");
});
app.listen(5000, () => console.log("Server running on 5000"));