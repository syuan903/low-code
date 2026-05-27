const assert = require("node:assert/strict");
const test = require("node:test");

const { app, state } = require("../server");

function startServer() {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      const { port } = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${port}` });
    });
    server.on("error", reject);
  });
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  assert.equal(response.status, 200);
  return response;
}

test("submitAnswers preserves multiple submissions for the same quiz", async (t) => {
  state.quizzes = {};
  state.answers = {};

  const { server, baseUrl } = await startServer();
  t.after(() => server.close());

  await postJson(`${baseUrl}/api/submitAnswers`, {
    quizId: "quiz-1",
    answers: { 1: "first response" },
  });
  await postJson(`${baseUrl}/api/submitAnswers`, {
    quizId: "quiz-1",
    answers: { 1: "second response" },
  });

  assert.deepEqual(state.answers["quiz-1"], [
    { 1: "first response" },
    { 1: "second response" },
  ]);
});
