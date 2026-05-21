const assert = require("node:assert/strict");
const test = require("node:test");

const { app, state } = require("../server");

function listen() {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const { port } = server.address();
      resolve({ server, url: `http://127.0.0.1:${port}` });
    });
  });
}

function close(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

test("submitAnswers keeps each response for a quiz", async () => {
  const quizId = "quiz-with-multiple-respondents";
  delete state.answers[quizId];

  const { server, url } = await listen();

  try {
    const firstAnswers = { 1: "Alice", 2: "Yes" };
    const secondAnswers = { 1: "Bob", 2: "No" };

    for (const submittedAnswers of [firstAnswers, secondAnswers]) {
      const response = await fetch(`${url}/api/submitAnswers`, {
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

    assert.deepEqual(state.answers[quizId], [firstAnswers, secondAnswers]);
  } finally {
    await close(server);
    delete state.answers[quizId];
  }
});
