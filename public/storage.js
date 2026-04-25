const MentorStorage = (() => {
  const STORAGE_KEY = "mentorHubData";

  function createSeedData() {
    return {
      counters: {
        users: 3,
        sessions: 2,
        challenges: 2,
        submissions: 1,
        feedback: 1,
      },
      users: [
        {
          id: 1,
          name: "Demo Mentor",
          email: "mentor@example.com",
          password: "mentor123",
          role: "mentor",
        },
        {
          id: 2,
          name: "Demo Student",
          email: "student@example.com",
          password: "student123",
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
    };
  }

  function loadData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = createSeedData();
      saveData(seed);
      return seed;
    }

    try {
      const parsed = JSON.parse(raw);
      if (!parsed.counters) {
        parsed.counters = createSeedData().counters;
      }
      return parsed;
    } catch {
      const seed = createSeedData();
      saveData(seed);
      return seed;
    }
  }

  function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function nextId(data, key) {
    const value = data.counters[key];
    data.counters[key] += 1;
    return value;
  }

  function registerUser({ name, email, password, role }) {
    const data = loadData();
    const normalizedEmail = email.trim().toLowerCase();

    if (data.users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
      throw new Error("Email already registered");
    }

    const user = {
      id: nextId(data, "users"),
      name: name.trim(),
      email: normalizedEmail,
      password,
      role,
    };

    data.users.push(user);
    saveData(data);
    return user;
  }

  function loginUser({ email, password }) {
    const data = loadData();
    const normalizedEmail = email.trim().toLowerCase();
    const user = data.users.find((item) => item.email.toLowerCase() === normalizedEmail);

    if (!user || user.password !== password) {
      return null;
    }

    return {
      token: "local-storage-token",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  function getSessions() {
    return [...loadData().sessions].sort((a, b) => b.id - a.id);
  }

  function addSession({ title, description }) {
    const data = loadData();
    const session = {
      id: nextId(data, "sessions"),
      title: title.trim(),
      description: description.trim(),
    };
    data.sessions.push(session);
    saveData(data);
    return session;
  }

  function getChallenges() {
    const data = loadData();
    return [...data.challenges]
      .sort((a, b) => b.id - a.id)
      .map((challenge) => {
        const session = data.sessions.find((item) => item.id === Number(challenge.session_id));
        return {
          ...challenge,
          session_title: session ? session.title : null,
        };
      });
  }

  function addChallenge(payload) {
    const data = loadData();
    const challenge = {
      id: nextId(data, "challenges"),
      mentor_id: Number(payload.mentor_id),
      title: payload.title.trim(),
      description: payload.description.trim(),
      subject: payload.subject || "",
      difficulty: payload.difficulty || "",
      deadline: payload.deadline || "",
      session_id: Number(payload.session_id),
    };
    data.challenges.push(challenge);
    saveData(data);
    return challenge;
  }

  function addSubmission({ challenge_id, mentee_id, answer }) {
    const data = loadData();
    const submission = {
      id: nextId(data, "submissions"),
      challenge_id: Number(challenge_id),
      mentee_id: Number(mentee_id),
      answer: answer.trim(),
      status: "pending",
      created_at: new Date().toISOString(),
    };
    data.submissions.push(submission);
    saveData(data);
    return submission;
  }

  function addFeedback({ submission_id, comment, score }) {
    const data = loadData();
    const submissionId = Number(submission_id);
    const existing = data.feedback.find((item) => item.submission_id === submissionId);

    if (existing) {
      existing.comment = comment.trim();
      existing.score = score ? Number(score) : null;
    } else {
      data.feedback.push({
        id: nextId(data, "feedback"),
        submission_id: submissionId,
        comment: comment.trim(),
        score: score ? Number(score) : null,
      });
    }

    const submission = data.submissions.find((item) => item.id === submissionId);
    if (submission) {
      submission.status = "reviewed";
    }

    saveData(data);
  }

  function getSubmissionsWithFeedback() {
    const data = loadData();
    return [...data.submissions]
      .sort((a, b) => b.id - a.id)
      .map((submission) => {
        const feedback = data.feedback.find((item) => item.submission_id === submission.id);
        return {
          ...submission,
          comment: feedback ? feedback.comment : null,
          score: feedback ? feedback.score : null,
        };
      });
  }

  function getLeaderboard() {
    const data = loadData();
    const totals = new Map();

    for (const submission of data.submissions) {
      const current = totals.get(submission.mentee_id) || 0;
      totals.set(submission.mentee_id, current + 1);
    }

    return [...totals.entries()]
      .map(([menteeId, totalSubmissions]) => {
        const user = data.users.find((item) => item.id === menteeId);
        return {
          mentee_id: menteeId,
          name: user ? user.name : `User ${menteeId}`,
          total_submissions: totalSubmissions,
        };
      })
      .sort((a, b) => b.total_submissions - a.total_submissions);
  }

  return {
    registerUser,
    loginUser,
    getSessions,
    addSession,
    getChallenges,
    addChallenge,
    addSubmission,
    addFeedback,
    getSubmissionsWithFeedback,
    getLeaderboard,
  };
})();
