const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const { app, uploadDir } = require("./server");

const listen = (server) =>
  new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, () => resolve(server.address().port));
  });

const close = (server) =>
  new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });

test("uploaded files are served from the returned URL regardless of process cwd", async (t) => {
  const previousCwd = process.cwd();
  const tempCwd = fs.mkdtempSync(path.join(os.tmpdir(), "upload-cwd-"));
  const server = http.createServer(app);
  const uploadedFiles = [];

  t.after(async () => {
    process.chdir(previousCwd);
    await close(server);
    for (const filePath of uploadedFiles) {
      fs.rmSync(filePath, { force: true });
    }
    fs.rmSync(tempCwd, { recursive: true, force: true });
  });

  process.chdir(tempCwd);
  const port = await listen(server);
  const formData = new FormData();
  formData.append("image", new Blob(["image-data"], { type: "image/png" }), "test.png");

  const uploadResponse = await fetch(`http://127.0.0.1:${port}/api/upload`, {
    method: "POST",
    body: formData,
  });

  assert.equal(uploadResponse.status, 200);
  const uploadBody = await uploadResponse.json();
  assert.match(uploadBody.imageUrl, /^\/uploads\/image-\d+-\d+\.png$/);

  const uploadedPath = path.join(uploadDir, path.basename(uploadBody.imageUrl));
  uploadedFiles.push(uploadedPath);
  assert.equal(fs.existsSync(uploadedPath), true);

  const imageResponse = await fetch(`http://127.0.0.1:${port}${uploadBody.imageUrl}`);
  assert.equal(imageResponse.status, 200);
  assert.equal(await imageResponse.text(), "image-data");
  assert.equal(fs.existsSync(path.join(tempCwd, "uploads")), false);
});
