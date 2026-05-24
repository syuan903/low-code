const assert = require("node:assert/strict");
const test = require("node:test");

const { app, state } = require("../server");

function startServer() {
  return new Promise((resolve) => {
    const server = app.listen(0, () => resolve(server));
  });
}

function postJson(url, body) {
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

test("submitAnswers preserves multiple submissions for the same quiz", async (t) => {
  const server = await startServer();
  t.after(() => server.close());

  Object.keys(state.answers).forEach((quizId) => {
    delete state.answers[quizId];
  });

  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  const firstResponse = await postJson(`${baseUrl}/api/submitAnswers`, {
    quizId: "quiz-1",
    answers: { 1: "first answer" },
  });
  const secondResponse = await postJson(`${baseUrl}/api/submitAnswers`, {
    quizId: "quiz-1",
    answers: { 1: "second answer" },
  });

  assert.equal(firstResponse.status, 200);
  assert.equal(secondResponse.status, 200);
  assert.deepEqual(state.answers["quiz-1"], [
    { 1: "first answer" },
    { 1: "second answer" },
  ]);
});
