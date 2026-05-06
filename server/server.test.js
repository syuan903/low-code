const assert = require("node:assert/strict");
const { describe, it, beforeEach } = require("node:test");

const { app, answers } = require("./server");

let server;

async function postJson(path, body) {
  const response = await fetch(`http://127.0.0.1:${server.address().port}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  assert.equal(response.status, 200);
}

describe("answer submissions", () => {
  beforeEach(() => {
    for (const key of Object.keys(answers)) {
      delete answers[key];
    }
  });

  it("keeps every submission for the same quiz", async () => {
    server = app.listen(0);

    try {
      await postJson("/api/submitAnswers", {
        quizId: "quiz-1",
        answers: { 1: "first respondent" },
      });
      await postJson("/api/submitAnswers", {
        quizId: "quiz-1",
        answers: { 1: "second respondent" },
      });

      assert.deepEqual(answers["quiz-1"], [
        { 1: "first respondent" },
        { 1: "second respondent" },
      ]);
    } finally {
      await new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }
  });
});
