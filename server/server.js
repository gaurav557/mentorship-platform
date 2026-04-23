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
const progressRoute = require("./routes/progress");

// USE ROUTES
app.use("/api/submission", submissionRoute);
app.use("/api/challenge", challengeRoute);
app.use("/api/feedback", feedbackRoute);
app.use("/api/auth", authRoute);
app.use("/api/progress", progressRoute);

// ROOT ROUTE
app.get("/", (req, res) => {
  res.send("Backend is running successfully 🚀");
});

// START SERVER
app.listen(5000, () => {
  console.log("Server running on port 5000 🚀");
});