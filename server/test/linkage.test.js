import assert from "node:assert/strict";
import test from "node:test";
import { buildAnswerLookupQuery } from "../ai/analyzeChain.js";
import { buildAnswerDocument } from "../routes/quiz.js";

test("submitted answers copy the linked surveyId from the quiz document", () => {
  const answerDoc = buildAnswerDocument({
    quizId: "quiz-uuid",
    userAnswers: { 1: "A" },
    quizDoc: { id: "quiz-uuid", surveyId: 42 },
  });

  assert.equal(answerDoc.quizId, "quiz-uuid");
  assert.equal(answerDoc.surveyId, 42);
  assert.deepEqual(answerDoc.answers, { 1: "A" });
  assert.equal(typeof answerDoc.createDate, "number");
});

test("answer lookup includes linked online quiz ids for a survey", () => {
  const query = buildAnswerLookupQuery(42, ["quiz-uuid", "quiz-uuid", "other-quiz"]);

  assert.deepEqual(query, {
    $or: [
      { surveyId: 42 },
      { surveyId: "42" },
      { quizId: 42 },
      { quizId: "42" },
      { quizId: { $in: ["quiz-uuid", "other-quiz"] } },
    ],
  });
});
