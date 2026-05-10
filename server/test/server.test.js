const assert = require("node:assert/strict");
const { after, beforeEach, test } = require("node:test");

const { app, answers } = require("../server");

const server = app.listen(0);

after(() => {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
});

beforeEach(() => {
  for (const quizId of Object.keys(answers)) {
    delete answers[quizId];
  }
});

function apiUrl(path) {
  const { port } = server.address();
  return `http://127.0.0.1:${port}${path}`;
}

async function submitAnswers(quizId, submittedAnswers) {
  const response = await fetch(apiUrl("/api/submitAnswers"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      quizId,
      answers: submittedAnswers,
    }),
  });

  assert.equal(response.status, 200);
}

test("stores multiple answer submissions for the same quiz", async () => {
  await submitAnswers("quiz-1", { name: "Alice", score: 5 });
  await submitAnswers("quiz-1", { name: "Bob", score: 4 });

  assert.deepEqual(answers["quiz-1"], [
    { name: "Alice", score: 5 },
    { name: "Bob", score: 4 },
  ]);
});
