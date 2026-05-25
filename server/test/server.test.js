const assert = require("node:assert/strict");
const http = require("node:http");
const test = require("node:test");

const { app, stores } = require("../server");

function clearStore(store) {
  for (const key of Object.keys(store)) {
    delete store[key];
  }
}

function request(server, method, path, body) {
  const payload = body === undefined ? undefined : JSON.stringify(body);
  const { port } = server.address();

  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port,
        path,
        method,
        headers: payload
          ? {
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(payload),
            }
          : undefined,
      },
      (res) => {
        let data = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          resolve({
            statusCode: res.statusCode,
            body: data ? JSON.parse(data) : undefined,
          });
        });
      }
    );

    req.on("error", reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

test("submitAnswers retains every submission for the same quiz", async (t) => {
  clearStore(stores.quizzes);
  clearStore(stores.answers);

  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(() => server.close());

  const first = await request(server, "POST", "/api/submitAnswers", {
    quizId: "quiz-1",
    answers: { 1: "A" },
  });
  const second = await request(server, "POST", "/api/submitAnswers", {
    quizId: "quiz-1",
    answers: { 1: "B" },
  });

  assert.equal(first.statusCode, 200);
  assert.equal(second.statusCode, 200);
  assert.deepEqual(stores.answers["quiz-1"], [{ 1: "A" }, { 1: "B" }]);
});
