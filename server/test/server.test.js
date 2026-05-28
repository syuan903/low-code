const assert = require("node:assert/strict");
const { test, beforeEach } = require("node:test");

const app = require("../server");

beforeEach(() => {
  for (const key of Object.keys(app.locals.answers)) {
    delete app.locals.answers[key];
  }
});

const postJson = async (server, path, body) => {
  const address = server.address();
  const response = await fetch(`http://127.0.0.1:${address.port}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return response;
};

test("submitAnswers keeps multiple submissions for the same quiz", async () => {
  const server = app.listen(0);

  try {
    const firstResponse = await postJson(server, "/api/submitAnswers", {
      quizId: "quiz-1",
      answers: { 1: "first response" },
    });
    const secondResponse = await postJson(server, "/api/submitAnswers", {
      quizId: "quiz-1",
      answers: { 1: "second response" },
    });

    assert.equal(firstResponse.status, 200);
    assert.equal(secondResponse.status, 200);
    assert.deepEqual(app.locals.answers["quiz-1"], [
      { 1: "first response" },
      { 1: "second response" },
    ]);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});
