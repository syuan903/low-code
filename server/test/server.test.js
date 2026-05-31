const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const { app, answers, uploadDir } = require("../server");

function resetAnswers() {
  for (const key of Object.keys(answers)) {
    delete answers[key];
  }
}

async function withServer(run) {
  const server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const { port } = server.address();
  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

test("submitAnswers keeps each submission for the same quiz", async () => {
  resetAnswers();

  await withServer(async (baseUrl) => {
    const first = await fetch(`${baseUrl}/api/submitAnswers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quizId: "quiz-1", answers: { 1: "Alice" } }),
    });
    const second = await fetch(`${baseUrl}/api/submitAnswers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quizId: "quiz-1", answers: { 1: "Bob" } }),
    });

    assert.equal(first.status, 200);
    assert.equal(second.status, 200);
    assert.deepEqual(answers["quiz-1"], [{ 1: "Alice" }, { 1: "Bob" }]);
  });
});

test("upload rejects active content and serves accepted images", async () => {
  fs.rmSync(uploadDir, { recursive: true, force: true });

  await withServer(async (baseUrl) => {
    const htmlForm = new FormData();
    htmlForm.append(
      "image",
      new Blob(["<script>alert(1)</script>"], { type: "text/html" }),
      "attack.html"
    );

    const rejected = await fetch(`${baseUrl}/api/upload`, {
      method: "POST",
      body: htmlForm,
    });
    assert.equal(rejected.status, 400);

    const pngForm = new FormData();
    pngForm.append(
      "image",
      new Blob([Buffer.from("89504e470d0a1a0a", "hex")], { type: "image/png" }),
      "pixel.png"
    );

    const uploaded = await fetch(`${baseUrl}/api/upload`, {
      method: "POST",
      body: pngForm,
    });
    assert.equal(uploaded.status, 200);
    const body = await uploaded.json();
    assert.match(body.imageUrl, /^\/uploads\/image-\d+-\d+\.png$/);

    const served = await fetch(`${baseUrl}${body.imageUrl}`);
    assert.equal(served.status, 200);
    assert.equal(served.headers.get("x-content-type-options"), "nosniff");

    const uploadedPath = path.join(uploadDir, path.basename(body.imageUrl));
    assert.equal(fs.existsSync(uploadedPath), true);
  });
});
