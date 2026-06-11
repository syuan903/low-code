const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const repoRoot = path.join(__dirname, "..", "..");
process.chdir(repoRoot);

const { app, answers, uploadDir } = require("../server");

const rootUploadDir = path.join(repoRoot, "uploads");

function resetState() {
  for (const key of Object.keys(answers)) {
    delete answers[key];
  }
}

function cleanupUploads() {
  fs.rmSync(uploadDir, { recursive: true, force: true });
  fs.rmSync(rootUploadDir, { recursive: true, force: true });
}

async function withServer(fn) {
  const server = await new Promise((resolve) => {
    const instance = app.listen(0, () => resolve(instance));
  });

  try {
    const { port } = server.address();
    await fn(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

test("submitAnswers preserves multiple submissions for the same quiz", async () => {
  resetState();

  await withServer(async (baseUrl) => {
    for (const submittedAnswers of [{ 1: "first" }, { 1: "second" }]) {
      const response = await fetch(`${baseUrl}/api/submitAnswers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: "quiz-1",
          answers: submittedAnswers,
        }),
      });

      assert.equal(response.status, 200);
    }
  });

  assert.deepEqual(answers["quiz-1"], [{ 1: "first" }, { 1: "second" }]);
});

test("uploaded images are saved in the directory served by /uploads", async () => {
  cleanupUploads();

  await withServer(async (baseUrl) => {
    const imageBytes = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]);
    const form = new FormData();
    form.append(
      "image",
      new Blob([imageBytes], { type: "image/png" }),
      "pixel.png"
    );

    const uploadResponse = await fetch(`${baseUrl}/api/upload`, {
      method: "POST",
      body: form,
    });

    assert.equal(uploadResponse.status, 200);
    const body = await uploadResponse.json();
    assert.match(body.imageUrl, /^\/uploads\/image-\d+-\d+\.png$/);

    const servedResponse = await fetch(`${baseUrl}${body.imageUrl}`);
    assert.equal(servedResponse.status, 200);
    assert.deepEqual(
      Buffer.from(await servedResponse.arrayBuffer()),
      imageBytes
    );
    assert.equal(fs.existsSync(rootUploadDir), false);
  });

  cleanupUploads();
});
