const db = require("../server/db");

async function init() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role VARCHAR(20) NOT NULL CHECK (role IN ('mentor', 'mentee'))
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS sessions (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS challenges (
      id SERIAL PRIMARY KEY,
      mentor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      subject VARCHAR(255),
      difficulty VARCHAR(50),
      deadline DATE,
      session_id INTEGER REFERENCES sessions(id) ON DELETE SET NULL
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS submissions (
      id SERIAL PRIMARY KEY,
      challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE,
      mentee_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      answer TEXT NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS feedback (
      id SERIAL PRIMARY KEY,
      submission_id INTEGER UNIQUE REFERENCES submissions(id) ON DELETE CASCADE,
      comment TEXT NOT NULL,
      score INTEGER CHECK (score BETWEEN 1 AND 5)
    );
  `);

  console.log("Database initialized successfully");
}

init()
  .catch((error) => {
    console.error("Database initialization failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.end();
  });
