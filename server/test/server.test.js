const assert = require("node:assert/strict");
const http = require("node:http");
const { after, before, beforeEach, test } = require("node:test");

const { app, answers } = require("../server");

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

beforeEach(() => {
  for (const quizId of Object.keys(answers)) {
    delete answers[quizId];
  }
});

function postJson(pathname, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const request = http.request(
      new URL(pathname, baseUrl),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (response) => {
        let responseBody = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          responseBody += chunk;
        });
        response.on("end", () => {
          resolve({
            statusCode: response.statusCode,
            body: responseBody ? JSON.parse(responseBody) : null,
          });
        });
      }
    );

    request.on("error", reject);
    request.write(payload);
    request.end();
  });
}

test("submitAnswers preserves multiple submissions for the same quiz", async () => {
  const firstSubmission = { 1: "first respondent", 2: "yes" };
  const secondSubmission = { 1: "second respondent", 2: "no" };

  const firstResponse = await postJson("/api/submitAnswers", {
    quizId: "quiz-1",
    answers: firstSubmission,
  });
  const secondResponse = await postJson("/api/submitAnswers", {
    quizId: "quiz-1",
    answers: secondSubmission,
  });

  assert.equal(firstResponse.statusCode, 200);
  assert.equal(secondResponse.statusCode, 200);
  assert.deepEqual(answers["quiz-1"], [firstSubmission, secondSubmission]);
});
