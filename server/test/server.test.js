const test = require("node:test");
const assert = require("node:assert/strict");

const app = require("../server");

function resetState() {
  for (const key of Object.keys(app.locals.answers)) {
    delete app.locals.answers[key];
  }
}

function listen() {
  return new Promise((resolve) => {
    const server = app.listen(0, () => resolve(server));
  });
}

async function postJson(baseUrl, path, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  assert.equal(response.status, 200);
  return response.json();
}

test("submitAnswers preserves multiple responses for the same quiz", async (t) => {
  resetState();

  const server = await listen();
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  await postJson(baseUrl, "/api/submitAnswers", {
    quizId: "quiz-1",
    answers: { 1: "first respondent" },
  });
  await postJson(baseUrl, "/api/submitAnswers", {
    quizId: "quiz-1",
    answers: { 1: "second respondent" },
  });

  assert.deepEqual(app.locals.answers["quiz-1"], [
    { 1: "first respondent" },
    { 1: "second respondent" },
  ]);
});
