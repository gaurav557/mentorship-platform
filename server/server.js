const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());

// ROUTES
const submissionRoute = require("./routes/submission");
const challengeRoute = require("./routes/challenge");
const feedbackRoute = require("./routes/feedback");
const authRoute = require("./routes/auth");

// USE ROUTES
app.use("/api/submission", submissionRoute);
app.use("/api/challenge", challengeRoute);
app.use("/api/feedback", feedbackRoute);
app.use("/api/auth", authRoute);

// ✅ ROOT ROUTE FIX
app.get("/", (req, res) => {
  res.send("Backend is running successfully 🚀");
});

// START SERVER
app.listen(5000, () => {
  console.log("Server running on port 5000 🚀");
});