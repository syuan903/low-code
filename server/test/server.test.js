const assert = require("node:assert/strict");
const test = require("node:test");

const app = require("../server");

test("submitAnswers preserves every submission for the same quiz", async (t) => {
  const server = app.listen(0);
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const originalConsoleTable = console.table;
  let loggedAnswers;
  console.table = (value) => {
    loggedAnswers = JSON.parse(JSON.stringify(value));
  };
  t.after(() => {
    console.table = originalConsoleTable;
  });

  const { port } = server.address();
  const quizId = `quiz-${Date.now()}`;
  const submit = (answers) =>
    fetch(`http://127.0.0.1:${port}/api/submitAnswers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ quizId, answers }),
    });

  const firstResponse = await submit({ 1: "first respondent" });
  assert.equal(firstResponse.status, 200);

  const secondResponse = await submit({ 1: "second respondent" });
  assert.equal(secondResponse.status, 200);

  assert.deepEqual(loggedAnswers[quizId], [
    { 1: "first respondent" },
    { 1: "second respondent" },
  ]);
});
