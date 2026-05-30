const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { after, before, beforeEach, test } = require("node:test");

const { app, stores } = require("../server");

let server;
let baseUrl;

before(() => {
  server = app.listen(0);
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

after(() => {
  server.close();
});

beforeEach(() => {
  for (const key of Object.keys(stores.quizzes)) {
    delete stores.quizzes[key];
  }
  for (const key of Object.keys(stores.answers)) {
    delete stores.answers[key];
  }
});

test("answer submissions for the same quiz are appended", async () => {
  const firstSubmission = { "1": "Alice" };
  const secondSubmission = { "1": "Bob" };

  for (const answers of [firstSubmission, secondSubmission]) {
    const response = await fetch(`${baseUrl}/api/submitAnswers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quizId: "quiz-1",
        answers,
      }),
    });

    assert.equal(response.status, 200);
  }

  assert.deepEqual(stores.answers["quiz-1"], [
    firstSubmission,
    secondSubmission,
  ]);
});

test("uploaded files are served from the same directory regardless of cwd", async () => {
  const originalCwd = process.cwd();
  const tempCwd = fs.mkdtempSync(path.join(os.tmpdir(), "server-cwd-"));

  try {
    process.chdir(tempCwd);

    const form = new FormData();
    form.append("image", new Blob(["uploaded content"]), "sample.txt");

    const uploadResponse = await fetch(`${baseUrl}/api/upload`, {
      method: "POST",
      body: form,
    });

    assert.equal(uploadResponse.status, 200);
    const { imageUrl } = await uploadResponse.json();

    const fileResponse = await fetch(`${baseUrl}${imageUrl}`);
    assert.equal(fileResponse.status, 200);
    assert.equal(await fileResponse.text(), "uploaded content");
  } finally {
    process.chdir(originalCwd);
    fs.rmSync(tempCwd, { recursive: true, force: true });
  }
});
