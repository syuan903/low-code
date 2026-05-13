const assert = require("node:assert/strict");
const { test } = require("node:test");

const { app, answers } = require("../server");

function resetAnswers() {
  for (const quizId of Object.keys(answers)) {
    delete answers[quizId];
  }
}

async function postJson(server, path, body) {
  const { port } = server.address();
  const response = await fetch(`http://127.0.0.1:${port}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  assert.equal(response.status, 200);
  return response.json();
}

test("submitAnswers preserves multiple submissions for the same quiz", async (t) => {
  resetAnswers();

  const server = app.listen(0);
  t.after(() => server.close());

  const firstSubmission = { 1: "Alice", 2: "Yes" };
  const secondSubmission = { 1: "Bob", 2: "No" };

  await postJson(server, "/api/submitAnswers", {
    quizId: "quiz-1",
    answers: firstSubmission,
  });
  await postJson(server, "/api/submitAnswers", {
    quizId: "quiz-1",
    answers: secondSubmission,
  });

  assert.deepEqual(answers["quiz-1"], [firstSubmission, secondSubmission]);
});
