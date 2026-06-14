function uniqueDefined(values) {
  const result = [];
  const seen = new Set();

  for (const value of values) {
    if (value === undefined || value === null) continue;
    if (typeof value === "number" && Number.isNaN(value)) continue;

    const key = `${typeof value}:${String(value)}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(value);
    }
  }

  return result;
}

export function buildAnswerQuizIdFilter(surveyId, linkedQuizIds = []) {
  const numericSurveyId = Number(surveyId);
  const candidateIds = [surveyId, String(surveyId), ...linkedQuizIds];

  if (Number.isFinite(numericSurveyId)) {
    candidateIds.push(numericSurveyId, String(numericSurveyId));
  }

  return {
    quizId: {
      $in: uniqueDefined(candidateIds),
    },
  };
}
