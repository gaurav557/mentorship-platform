const express = require("express");
const cors = require("cors");
const path = require("path");

const submissionRoute = require("./routes/submission");
const challengeRoute = require("./routes/challenge");
const feedbackRoute = require("./routes/feedback");
const authRoute = require("./routes/auth");
const progressRoute = require("./routes/progress");
const sessionRoute = require("./routes/session");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/session", sessionRoute);
app.use("/api/submission", submissionRoute);
app.use("/api/challenge", challengeRoute);
app.use("/api/feedback", feedbackRoute);
app.use("/api/auth", authRoute);
app.use("/api/progress", progressRoute);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

module.exports = app;
