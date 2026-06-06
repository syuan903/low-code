const assert = require("node:assert/strict");
const { test } = require("node:test");

const { app, resetState, state } = require("../server");

function startServer() {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const { port } = server.address();
      resolve({
        server,
        baseUrl: `http://127.0.0.1:${port}`,
      });
    });
  });
}

async function postJson(url, body) {
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

test("submitAnswers keeps each submission for the same quiz", async (t) => {
  resetState();
  const { server, baseUrl } = await startServer();
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const firstResponse = await postJson(`${baseUrl}/api/submitAnswers`, {
    quizId: "quiz-1",
    answers: { 1: "first respondent" },
  });
  assert.equal(firstResponse.status, 200);

  const secondResponse = await postJson(`${baseUrl}/api/submitAnswers`, {
    quizId: "quiz-1",
    answers: { 1: "second respondent" },
  });
  assert.equal(secondResponse.status, 200);

  assert.deepEqual(state.answers["quiz-1"], [
    { 1: "first respondent" },
    { 1: "second respondent" },
  ]);
});
