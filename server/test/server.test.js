const assert = require("node:assert/strict");
const { after, before, beforeEach, test } = require("node:test");

const { app, getSubmittedAnswers, resetForTest } = require("../server");

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

beforeEach(() => {
  resetForTest();
});

after(async () => {
  if (!server) return;
  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
});

async function postJson(path, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  assert.equal(response.status, 200);
  return response.json();
}

test("submitAnswers preserves every submission for the same quiz", async () => {
  await postJson("/api/submitAnswers", {
    quizId: "quiz-1",
    answers: { 1: "first respondent" },
  });
  await postJson("/api/submitAnswers", {
    quizId: "quiz-1",
    answers: { 1: "second respondent" },
  });

  const submittedAnswers = getSubmittedAnswers("quiz-1");

  assert.equal(submittedAnswers.length, 2);
  assert.deepEqual(submittedAnswers.map((submission) => submission.answers), [
    { 1: "first respondent" },
    { 1: "second respondent" },
  ]);
  assert.ok(submittedAnswers.every((submission) => submission.submittedAt));
});
