const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const { app, answers, uploadDir } = require("../server");

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test("submitAnswers appends submissions for the same quiz", async () => {
  const quizId = "quiz-answer-append-test";
  delete answers[quizId];

  const firstResponse = await postJson("/api/submitAnswers", {
    quizId,
    answers: { 1: "first respondent" },
  });
  const secondResponse = await postJson("/api/submitAnswers", {
    quizId,
    answers: { 1: "second respondent" },
  });

  assert.equal(firstResponse.status, 200);
  assert.equal(secondResponse.status, 200);
  assert.equal(secondResponse.body.count, 2);
  assert.deepEqual(answers[quizId], [
    { 1: "first respondent" },
    { 1: "second respondent" },
  ]);
});

test("upload rejects non-image files served from the app origin", async () => {
  const form = new FormData();
  form.append("image", new Blob(["<script>globalThis.pwned=1</script>"], { type: "text/html" }), "payload.html");

  const response = await fetch(`${baseUrl}/api/upload`, {
    method: "POST",
    body: form,
  });
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.imageUrl, undefined);
});

test("upload accepts allowed images and serves them with nosniff", async () => {
  const form = new FormData();
  form.append("image", new Blob(["fake png bytes"], { type: "image/png" }), "avatar.png");

  const uploadResponse = await fetch(`${baseUrl}/api/upload`, {
    method: "POST",
    body: form,
  });
  const uploadBody = await uploadResponse.json();
  const uploadedFile = path.join(uploadDir, path.basename(uploadBody.imageUrl || ""));

  try {
    assert.equal(uploadResponse.status, 200);
    assert.match(uploadBody.imageUrl, /^\/uploads\/image-[a-f0-9-]+\.png$/);
    assert.equal(fs.existsSync(uploadedFile), true);

    const staticResponse = await fetch(`${baseUrl}${uploadBody.imageUrl}`);
    assert.equal(staticResponse.status, 200);
    assert.equal(staticResponse.headers.get("x-content-type-options"), "nosniff");
  } finally {
    fs.rmSync(uploadedFile, { force: true });
  }
});

async function postJson(url, body) {
  const response = await fetch(`${baseUrl}${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return {
    status: response.status,
    body: await response.json(),
  };
}
