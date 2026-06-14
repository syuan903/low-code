import test from "node:test";
import assert from "node:assert/strict";
import { redactMongoUrl } from "../db/mongo.js";

test("redactMongoUrl removes credentials and query parameters", () => {
  const redacted = redactMongoUrl(
    "mongodb+srv://app_user:secret_password@cluster.example/survey?retryWrites=true#logs"
  );

  assert.equal(redacted, "mongodb+srv://cluster.example/survey");
  assert.equal(redacted.includes("app_user"), false);
  assert.equal(redacted.includes("secret_password"), false);
  assert.equal(redacted.includes("retryWrites"), false);
});

test("redactMongoUrl preserves local hosts without credentials", () => {
  assert.equal(redactMongoUrl("mongodb://localhost:27017"), "mongodb://localhost:27017");
});
