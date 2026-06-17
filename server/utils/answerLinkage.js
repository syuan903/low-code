export function buildAnswerDocument({ quizId, userAnswers, quizDoc }) {
  const doc = {
    quizId,
    answers: userAnswers,
    createDate: Date.now(),
  };
  if (quizDoc?.surveyId !== undefined && quizDoc?.surveyId !== null) {
    doc.surveyId = quizDoc.surveyId;
  }
  return doc;
}

export function buildAnswerLookupQuery(surveyId, quizIds = []) {
  const id = Number(surveyId);
  const linkedQuizIds = [...new Set(quizIds.filter((quizId) => quizId !== undefined && quizId !== null))];
  const clauses = [{ surveyId: id }, { surveyId: String(id) }, { quizId: id }, { quizId: String(id) }];
  if (linkedQuizIds.length > 0) {
    clauses.push({ quizId: { $in: linkedQuizIds } });
  }
  return { $or: clauses };
}
