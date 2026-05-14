const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const { afterEach, beforeEach, test } = require("node:test");

const { app, resetState, state, uploadDir } = require("../server");

let server;
let baseUrl;

function listen() {
  return new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const { port } = server.address();
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
}

function closeServer() {
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

async function postJson(pathname, body) {
  return fetch(`${baseUrl}${pathname}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

beforeEach(async () => {
  resetState();
  await listen();
});

afterEach(async () => {
  await closeServer();
  resetState();
});

test("submitAnswers preserves every response for the same quiz", async () => {
  const firstSubmission = { 1: "Alice", 2: "yes" };
  const secondSubmission = { 1: "Bob", 2: "no" };

  const firstResponse = await postJson("/api/submitAnswers", {
    quizId: "quiz-1",
    answers: firstSubmission,
  });
  const secondResponse = await postJson("/api/submitAnswers", {
    quizId: "quiz-1",
    answers: secondSubmission,
  });

  assert.equal(firstResponse.status, 200);
  assert.equal(secondResponse.status, 200);
  assert.deepEqual(state.answers["quiz-1"], [firstSubmission, secondSubmission]);
});

test("upload endpoint serves files from the returned URL", async () => {
  const originalCwd = process.cwd();
  const tempCwd = fs.mkdtempSync(path.join(os.tmpdir(), "server-upload-cwd-"));
  let uploadedFile;

  process.chdir(tempCwd);
  try {
    const formData = new FormData();
    formData.set(
      "image",
      new Blob(["uploaded image contents"], { type: "image/png" }),
      "avatar.png"
    );

    const uploadResponse = await fetch(`${baseUrl}/api/upload`, {
      method: "POST",
      body: formData,
    });
    const uploadBody = await uploadResponse.json();
    uploadedFile = path.join(uploadDir, path.basename(uploadBody.imageUrl));

    assert.equal(uploadResponse.status, 200);
    assert.match(uploadBody.imageUrl, /^\/uploads\/image-\d+-\d+\.png$/);

    const imageResponse = await fetch(`${baseUrl}${uploadBody.imageUrl}`);
    assert.equal(imageResponse.status, 200);
    assert.equal(await imageResponse.text(), "uploaded image contents");
  } finally {
    process.chdir(originalCwd);
    fs.rmSync(tempCwd, { recursive: true, force: true });
    if (uploadedFile) {
      fs.rmSync(uploadedFile, { force: true });
    }
  }
});
