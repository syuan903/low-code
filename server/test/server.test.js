const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const { app, answers, uploadDir } = require("../server");

function clearAnswers() {
  for (const quizId of Object.keys(answers)) {
    delete answers[quizId];
  }
}

async function startServer(t) {
  const server = await new Promise((resolve) => {
    const instance = app.listen(0, () => resolve(instance));
  });
  t.after(() => server.close());

  return `http://127.0.0.1:${server.address().port}`;
}

test("stores every submission for the same quiz", async (t) => {
  clearAnswers();
  const baseUrl = await startServer(t);

  async function submit(answer) {
    const response = await fetch(`${baseUrl}/api/submitAnswers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quizId: "quiz-1", answers: answer }),
    });

    assert.equal(response.status, 200);
  }

  await submit({ 1: "first respondent" });
  await submit({ 1: "second respondent" });

  assert.deepEqual(answers["quiz-1"], [
    { 1: "first respondent" },
    { 1: "second respondent" },
  ]);
});

test("uploads are served from the same directory multer writes to", async (t) => {
  const originalCwd = process.cwd();
  const temporaryCwd = fs.mkdtempSync(path.join(os.tmpdir(), "survey-upload-cwd-"));
  let uploadedPath;

  t.after(() => {
    process.chdir(originalCwd);
    if (uploadedPath) {
      fs.rmSync(uploadedPath, { force: true });
    }
    fs.rmSync(temporaryCwd, { recursive: true, force: true });
  });

  process.chdir(temporaryCwd);
  const baseUrl = await startServer(t);
  const form = new FormData();
  form.append("image", new Blob(["image bytes"], { type: "image/png" }), "avatar.png");

  const response = await fetch(`${baseUrl}/api/upload`, {
    method: "POST",
    body: form,
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.match(body.imageUrl, /^\/uploads\/image-/);

  uploadedPath = path.join(uploadDir, path.basename(body.imageUrl));
  assert.equal(fs.existsSync(uploadedPath), true);
  assert.equal(fs.existsSync(path.join(temporaryCwd, "uploads", path.basename(body.imageUrl))), false);

  const uploadedResponse = await fetch(`${baseUrl}${body.imageUrl}`);
  assert.equal(uploadedResponse.status, 200);
  assert.equal(await uploadedResponse.text(), "image bytes");
});
