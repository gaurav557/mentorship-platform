require("dotenv").config();

const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

const usingDatabaseUrl = Boolean(process.env.DATABASE_URL);
const usingDbCredentials = Boolean(
  process.env.DB_USER &&
  process.env.DB_HOST &&
  process.env.DB_NAME &&
  process.env.DB_PASSWORD &&
  process.env.DB_PORT
);

function createMemoryDb() {
  const mentorPassword = bcrypt.hashSync("mentor123", 10);
  const menteePassword = bcrypt.hashSync("student123", 10);

  const state = {
    users: [
      {
        id: 1,
        name: "Demo Mentor",
        email: "mentor@example.com",
        password: mentorPassword,
        role: "mentor",
      },
      {
        id: 2,
        name: "Demo Student",
        email: "student@example.com",
        password: menteePassword,
        role: "mentee",
      },
    ],
    sessions: [
      {
        id: 1,
        title: "Week 1",
        description: "Start with a small challenge and submit your solution.",
      },
    ],
    challenges: [
      {
        id: 1,
        mentor_id: 1,
        title: "Build a Profile Card",
        description: "Create a simple profile card component using HTML, CSS, and JavaScript.",
        subject: "Frontend",
        difficulty: "Easy",
        deadline: "2026-05-15",
        session_id: 1,
      },
    ],
    submissions: [],
    feedback: [],
    ids: {
      users: 3,
      sessions: 2,
      challenges: 2,
      submissions: 1,
      feedback: 1,
    },
  };

  return {
    async query(sql, params = []) {
      const normalized = sql.replace(/\s+/g, " ").trim();

      if (normalized === "SELECT * FROM users WHERE email=$1") {
        const email = params[0];
        return {
          rows: state.users.filter((user) => user.email === email),
        };
      }

      if (normalized === "INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,$4)") {
        const [name, email, password, role] = params;
        const existing = state.users.find((user) => user.email === email);
        if (existing) {
          const error = new Error("User already exists");
          error.code = "23505";
          throw error;
        }

        const user = {
          id: state.ids.users++,
          name,
          email,
          password,
          role,
        };

        state.users.push(user);
        return { rows: [] };
      }

      if (normalized === "INSERT INTO sessions(title, description) VALUES($1,$2) RETURNING *") {
        const [title, description] = params;
        const session = {
          id: state.ids.sessions++,
          title,
          description,
        };
        state.sessions.push(session);
        return { rows: [session] };
      }

      if (normalized === "SELECT * FROM sessions ORDER BY id DESC") {
        return {
          rows: [...state.sessions].sort((a, b) => b.id - a.id),
        };
      }

      if (
        normalized ===
        "INSERT INTO challenges(mentor_id,title,description,subject,difficulty,deadline,session_id) VALUES($1,$2,$3,$4,$5,$6,$7)"
      ) {
        const [mentor_id, title, description, subject, difficulty, deadline, session_id] = params;
        const challenge = {
          id: state.ids.challenges++,
          mentor_id,
          title,
          description,
          subject,
          difficulty,
          deadline,
          session_id,
        };
        state.challenges.push(challenge);
        return { rows: [] };
      }

      if (normalized.includes("FROM challenges c LEFT JOIN sessions s ON c.session_id = s.id")) {
        const rows = [...state.challenges]
          .sort((a, b) => b.id - a.id)
          .map((challenge) => {
            const session = state.sessions.find((item) => item.id === challenge.session_id);
            return {
              ...challenge,
              session_title: session ? session.title : null,
            };
          });

        return { rows };
      }

      if (
        normalized ===
        "INSERT INTO submissions(challenge_id, mentee_id, answer, status) VALUES($1,$2,$3,$4)"
      ) {
        const [challenge_id, mentee_id, answer, status] = params;
        const submission = {
          id: state.ids.submissions++,
          challenge_id,
          mentee_id,
          answer,
          status,
          created_at: new Date().toISOString(),
        };
        state.submissions.push(submission);
        return { rows: [] };
      }

      if (normalized.includes("FROM submissions s LEFT JOIN feedback f ON s.id = f.submission_id")) {
        const rows = [...state.submissions]
          .sort((a, b) => b.id - a.id)
          .map((submission) => {
            const itemFeedback = state.feedback.find((item) => item.submission_id === submission.id);
            return {
              ...submission,
              comment: itemFeedback ? itemFeedback.comment : null,
              score: itemFeedback ? itemFeedback.score : null,
            };
          });

        return { rows };
      }

      if (normalized === "INSERT INTO feedback(submission_id, comment, score) VALUES($1,$2,$3)") {
        const [submission_id, comment, score] = params;
        const existing = state.feedback.find((item) => item.submission_id === submission_id);
        if (existing) {
          existing.comment = comment;
          existing.score = score;
        } else {
          state.feedback.push({
            id: state.ids.feedback++,
            submission_id,
            comment,
            score,
          });
        }
        return { rows: [] };
      }

      if (normalized === "UPDATE submissions SET status = 'reviewed' WHERE id = $1") {
        const submission = state.submissions.find((item) => item.id === params[0]);
        if (submission) {
          submission.status = "reviewed";
        }
        return { rows: [] };
      }

      if (normalized.includes("FROM submissions LEFT JOIN users u ON u.id = submissions.mentee_id")) {
        const counts = new Map();

        for (const submission of state.submissions) {
          const key = submission.mentee_id;
          counts.set(key, (counts.get(key) || 0) + 1);
        }

        const rows = [...counts.entries()]
          .map(([mentee_id, total]) => {
            const user = state.users.find((item) => item.id === mentee_id);
            return {
              mentee_id,
              name: user ? user.name : null,
              total_submissions: String(total),
            };
          })
          .sort((a, b) => Number(b.total_submissions) - Number(a.total_submissions));

        return { rows };
      }

      throw new Error(`Unsupported in-memory query: ${normalized}`);
    },
  };
}

let db;

if (usingDatabaseUrl || usingDbCredentials) {
  db = new Pool(
    usingDatabaseUrl
      ? {
          connectionString: process.env.DATABASE_URL,
          ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
        }
      : {
          user: process.env.DB_USER,
          host: process.env.DB_HOST,
          database: process.env.DB_NAME,
          password: process.env.DB_PASSWORD,
          port: process.env.DB_PORT,
        }
  );
} else {
  db = createMemoryDb();
}

module.exports = db;
