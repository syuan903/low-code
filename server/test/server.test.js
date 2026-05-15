const assert = require("node:assert/strict");
const { test } = require("node:test");

const { app, getAnswersForQuiz } = require("../server");

function listen() {
  return new Promise((resolve) => {
    const server = app.listen(0, () => resolve(server));
  });
}

async function postJson(baseUrl, path, body) {
  return fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

test("submitAnswers preserves multiple submissions for the same quiz", async (t) => {
  const server = await listen();
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;
  const quizId = `quiz-${Date.now()}-${Math.random()}`;
  const firstSubmission = { 1: "Alice", 2: "A" };
  const secondSubmission = { 1: "Bob", 2: "B" };

  const firstResponse = await postJson(baseUrl, "/api/submitAnswers", {
    quizId,
    answers: firstSubmission,
  });
  assert.equal(firstResponse.status, 200);

  const secondResponse = await postJson(baseUrl, "/api/submitAnswers", {
    quizId,
    answers: secondSubmission,
  });
  assert.equal(secondResponse.status, 200);

  assert.deepEqual(getAnswersForQuiz(quizId), [firstSubmission, secondSubmission]);
});
