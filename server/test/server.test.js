const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");

const tableCalls = [];
const originalTable = console.table;
console.table = (data) => {
  tableCalls.push(JSON.parse(JSON.stringify(data)));
};

const app = require("../server");

let server;
let baseUrl;

before(() => {
  server = app.listen(0);
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(async () => {
  console.table = originalTable;
  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
});

test("submitAnswers keeps multiple submissions for the same quiz", async () => {
  const firstAnswers = { 1: "first response" };
  const secondAnswers = { 1: "second response" };

  for (const answers of [firstAnswers, secondAnswers]) {
    const response = await fetch(`${baseUrl}/api/submitAnswers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quizId: "quiz-1",
        answers,
      }),
    });

    assert.equal(response.status, 200);
  }

  assert.deepEqual(tableCalls.at(-1)["quiz-1"], [firstAnswers, secondAnswers]);
});
