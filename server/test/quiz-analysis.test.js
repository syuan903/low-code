import assert from "node:assert/strict";
import test from "node:test";
import express from "express";
import { buildSurveyAnswerQuery } from "../ai/analyzeChain.js";
import { createQuizRouter } from "../routes/quiz.js";

function createCollection(initialDocs = []) {
  const docs = initialDocs.map((doc) => ({ ...doc }));

  return {
    docs,
    async findOne(filter) {
      return docs.find((doc) => matchesFilter(doc, filter));
    },
    async insertOne(doc) {
      docs.push({ ...doc });
      return { insertedId: docs.length };
    },
    async updateOne(filter, update) {
      const existing = docs.find((doc) => matchesFilter(doc, filter));
      if (existing) {
        Object.assign(existing, update.$set);
      } else {
        docs.push({ ...filter, ...update.$set });
      }
      return { acknowledged: true };
    },
  };
}

function matchesFilter(doc, filter) {
  return Object.entries(filter).every(([key, value]) => doc[key] === value);
}

async function withQuizServer(collections, callback) {
  const app = express();
  app.use(express.json());
  app.use(createQuizRouter({
    quizzes: () => collections.quizzes,
    answers: () => collections.answers,
  }));

  const server = await new Promise((resolve) => {
    const listening = app.listen(0, () => resolve(listening));
  });
  const { port } = server.address();

  try {
    await callback(`http://127.0.0.1:${port}`);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

test("getQuiz returns 404 JSON for a missing quiz", async () => {
  await withQuizServer({
    quizzes: createCollection(),
    answers: createCollection(),
  }, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/getQuiz/missing-quiz`);
    const body = await response.json();

    assert.equal(response.status, 404);
    assert.match(body.message, /问卷不存在/);
  });
});

test("saved quiz surveyId is copied onto submitted answers", async () => {
  const quizzes = createCollection();
  const answers = createCollection();

  await withQuizServer({ quizzes, answers }, async (baseUrl) => {
    const saveResponse = await fetch(`${baseUrl}/api/saveQuiz`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: "quiz-uuid",
        surveyId: "42",
        quizData: { coms: "[]", surveyCount: 0 },
      }),
    });
    assert.equal(saveResponse.status, 200);

    const submitResponse = await fetch(`${baseUrl}/api/submitAnswers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quizId: "quiz-uuid",
        answers: { 1: "A" },
      }),
    });
    assert.equal(submitResponse.status, 200);
  });

  assert.equal(quizzes.docs[0].surveyId, 42);
  assert.deepEqual(answers.docs[0], {
    quizId: "quiz-uuid",
    surveyId: 42,
    answers: { 1: "A" },
    createDate: answers.docs[0].createDate,
  });
  assert.equal(typeof answers.docs[0].createDate, "number");
});

test("analysis answer query includes linked quiz UUIDs", () => {
  assert.deepEqual(buildSurveyAnswerQuery(42, ["quiz-uuid", "42"]), {
    $or: [
      { surveyId: 42 },
      { quizId: 42 },
      { quizId: "42" },
      { quizId: "quiz-uuid" },
    ],
  });
});
