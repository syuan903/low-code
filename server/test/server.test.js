const assert = require("node:assert/strict");
const { after, before, beforeEach, test } = require("node:test");
const { app, __test } = require("../server");

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

beforeEach(() => {
  __test.reset();
});

const postJson = async (path, body) => {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return response;
};

test("submitAnswers keeps every submission for the same quiz", async () => {
  const firstSubmission = { 1: "yes", 2: "blue" };
  const secondSubmission = { 1: "no", 2: "green" };

  const firstResponse = await postJson("/api/submitAnswers", {
    quizId: "quiz-1",
    answers: firstSubmission,
  });
  const secondResponse = await postJson("/api/submitAnswers", {
    quizId: "quiz-1",
    answers: secondSubmission,
  });

  assert.equal(firstResponse.status, 200);
  assert.equal(secondResponse.status, 200);
  assert.deepEqual(__test.getAnswers("quiz-1"), [
    firstSubmission,
    secondSubmission,
  ]);
});

test("submitAnswers rejects incomplete submissions", async () => {
  const response = await postJson("/api/submitAnswers", {
    answers: { 1: "yes" },
  });

  assert.equal(response.status, 400);
  assert.equal(__test.getAnswers("quiz-1"), undefined);
});
