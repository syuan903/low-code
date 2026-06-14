import test from "node:test";
import assert from "node:assert/strict";
import { buildAnswerQuizIdFilter } from "../ai/answerQuery.js";

test("buildAnswerQuizIdFilter includes linked quiz UUIDs for a survey", () => {
  assert.deepEqual(buildAnswerQuizIdFilter(5, ["quiz-uuid"]).quizId.$in, [
    5,
    "5",
    "quiz-uuid",
  ]);
});

test("buildAnswerQuizIdFilter keeps string and numeric survey ids compatible", () => {
  assert.deepEqual(buildAnswerQuizIdFilter("5").quizId.$in, ["5", 5]);
});
