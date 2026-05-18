const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { after, before, beforeEach, test } = require("node:test");

const app = require("../server");

let server;
let baseUrl;

before(async () => {
  server = await new Promise((resolve) => {
    const instance = app.listen(0, () => resolve(instance));
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

beforeEach(() => {
  for (const key of Object.keys(app.locals.answers)) {
    delete app.locals.answers[key];
  }
  for (const key of Object.keys(app.locals.quizzes)) {
    delete app.locals.quizzes[key];
  }
});

test("submitAnswers preserves multiple submissions for the same quiz", async () => {
  const firstResponse = await submitAnswers("quiz-1", { 1: "first" });
  const secondResponse = await submitAnswers("quiz-1", { 1: "second" });

  assert.equal(firstResponse.status, 200);
  assert.equal(secondResponse.status, 200);
  assert.deepEqual(app.locals.answers["quiz-1"], [
    { 1: "first" },
    { 1: "second" },
  ]);
});

test("uploaded images are written to and served from the server uploads directory", async () => {
  const originalCwd = process.cwd();
  const tempCwd = fs.mkdtempSync(path.join(os.tmpdir(), "server-upload-cwd-"));
  let uploadedPath;

  process.chdir(tempCwd);
  try {
    const form = new FormData();
    form.append(
      "image",
      new Blob([Buffer.from("fake image content")], { type: "image/png" }),
      "avatar.png"
    );

    const response = await fetch(`${baseUrl}/api/upload`, {
      method: "POST",
      body: form,
    });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.match(body.imageUrl, /^\/uploads\/image-\d+-\d+\.png$/);

    uploadedPath = path.join(
      __dirname,
      "..",
      body.imageUrl.replace(/^\//, "")
    );
    assert.equal(fs.existsSync(uploadedPath), true);

    const imageResponse = await fetch(`${baseUrl}${body.imageUrl}`);
    assert.equal(imageResponse.status, 200);
    assert.equal(
      Buffer.from(await imageResponse.arrayBuffer()).toString(),
      "fake image content"
    );
  } finally {
    process.chdir(originalCwd);
    if (uploadedPath) {
      fs.rmSync(uploadedPath, { force: true });
    }
    fs.rmSync(tempCwd, { recursive: true, force: true });
  }
});

async function submitAnswers(quizId, answers) {
  return fetch(`${baseUrl}/api/submitAnswers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      quizId,
      answers,
    }),
  });
}
