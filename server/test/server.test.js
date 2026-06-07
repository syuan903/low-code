const assert = require("node:assert/strict");
const { after, before, beforeEach, test } = require("node:test");

const app = require("../server");

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

beforeEach(() => {
  Object.keys(app.locals.answers).forEach((quizId) => {
    delete app.locals.answers[quizId];
  });
});

test("submitAnswers preserves multiple submissions for the same quiz", async () => {
  const quizId = "quiz-1";
  const firstSubmission = { 1: "Alice", 2: "A" };
  const secondSubmission = { 1: "Bob", 2: "B" };

  for (const answers of [firstSubmission, secondSubmission]) {
    const response = await fetch(`${baseUrl}/api/submitAnswers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ quizId, answers }),
    });

    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { message: "Answers submitted" });
  }

  assert.deepEqual(app.locals.answers[quizId], [
    firstSubmission,
    secondSubmission,
  ]);
});
