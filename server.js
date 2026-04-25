const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ROUTES
const submissionRoute = require("./routes/submission");
const challengeRoute = require("./routes/challenge");
const feedbackRoute = require("./routes/feedback");
const authRoute = require("./routes/auth");
const progressRoute = require("./routes/progress");
const sessionRoute = require("./routes/session");

// USE ROUTES
app.use("/api/session", sessionRoute);
app.use("/api/submission", submissionRoute);
app.use("/api/challenge", challengeRoute);
app.use("/api/feedback", feedbackRoute);
app.use("/api/auth", authRoute);
app.use("/api/progress", progressRoute);

// ROOT ROUTE
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// START SERVER
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
