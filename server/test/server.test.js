const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const { app, stores } = require("../server");

const serverDir = path.join(__dirname, "..");
const workspaceDir = path.join(serverDir, "..");
const uploadDir = path.join(serverDir, "uploads");
const wrongUploadDir = path.join(workspaceDir, "uploads");

function listen() {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      resolve(server);
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

function resetStores() {
  for (const key of Object.keys(stores.quizzes)) {
    delete stores.quizzes[key];
  }
  for (const key of Object.keys(stores.answers)) {
    delete stores.answers[key];
  }
}

test.beforeEach(() => {
  resetStores();
});

test("submitAnswers preserves multiple responses for the same quiz", async () => {
  const server = await listen();
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  try {
    const firstResponse = await fetch(`${baseUrl}/api/submitAnswers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quizId: "quiz-1",
        answers: { 1: "first answer" },
      }),
    });
    const secondResponse = await fetch(`${baseUrl}/api/submitAnswers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quizId: "quiz-1",
        answers: { 1: "second answer" },
      }),
    });

    assert.equal(firstResponse.status, 200);
    assert.equal(secondResponse.status, 200);
    assert.deepEqual(stores.answers["quiz-1"], [
      { 1: "first answer" },
      { 1: "second answer" },
    ]);
  } finally {
    await close(server);
  }
});

test("uploaded files are written to the static uploads directory", async () => {
  const originalCwd = process.cwd();
  fs.rmSync(wrongUploadDir, { recursive: true, force: true });
  fs.rmSync(uploadDir, { recursive: true, force: true });

  const server = await listen();
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  try {
    process.chdir(workspaceDir);

    const form = new FormData();
    form.append(
      "image",
      new Blob(["image-bytes"], { type: "image/png" }),
      "photo.png"
    );

    const uploadResponse = await fetch(`${baseUrl}/api/upload`, {
      method: "POST",
      body: form,
    });
    const uploadBody = await uploadResponse.json();

    assert.equal(uploadResponse.status, 200);
    assert.match(uploadBody.imageUrl, /^\/uploads\/image-\d+-\d+\.png$/);
    assert.equal(fs.existsSync(path.join(uploadDir, path.basename(uploadBody.imageUrl))), true);
    assert.equal(fs.existsSync(wrongUploadDir), false);

    const staticResponse = await fetch(`${baseUrl}${uploadBody.imageUrl}`);
    assert.equal(staticResponse.status, 200);
    assert.equal(await staticResponse.text(), "image-bytes");
  } finally {
    process.chdir(originalCwd);
    await close(server);
    fs.rmSync(uploadDir, { recursive: true, force: true });
    fs.rmSync(wrongUploadDir, { recursive: true, force: true });
  }
});
