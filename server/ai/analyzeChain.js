import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { Document } from "@langchain/core/documents";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { createChatModel, createEmbeddings } from "./llm.js";
import { surveys, answers } from "../db/mongo.js";

/**
 * 把单份答卷转换成可读的文本片段，便于向量化检索。
 * answers 结构：{ quizId, answers: { 题号: 答案值 }, createDate }
 * @param {object} answerDoc 答卷文档
 * @param {number} idx 序号
 * @returns {string}
 */
function answerToText(answerDoc, idx) {
  const ans = answerDoc.answers || {};
  const lines = Object.keys(ans).map((qno) => `第${qno}题：${formatAnswer(ans[qno])}`);
  const date = answerDoc.createDate ? new Date(answerDoc.createDate).toLocaleString("zh-CN") : "未知时间";
  return `【答卷${idx + 1}（${date}）】\n${lines.join("\n")}`;
}

/**
 * 格式化单个答案值（兼容数组/对象/原始值）。
 */
function formatAnswer(value) {
  if (Array.isArray(value)) return value.join("、");
  if (value && typeof value === "object") return JSON.stringify(value);
  return String(value);
}

/**
 * 从问卷的 coms 中提取题目清单文本，作为分析时的题目上下文。
 * @param {Array} coms
 * @returns {string}
 */
function extractQuestions(coms) {
  if (!Array.isArray(coms)) return "";
  let no = 0;
  const surveyComNames = [
    "single-select", "multi-select", "option-select", "single-pic-select",
    "multi-pic-select", "text-input", "rate-score", "date-time",
    "personal-info-name", "personal-info-id", "personal-info-tel",
    "personal-info-wechat", "personal-info-qq", "personal-info-email",
    "personal-info-address", "personal-info-gender", "personal-info-age",
    "personal-info-education", "personal-info-career", "personal-info-birth",
    "personal-info-collage", "personal-info-major", "personal-info-industry",
    "personal-info-company", "personal-info-position",
  ];
  const lines = [];
  for (const com of coms) {
    const title = com?.status?.title?.status || "";
    if (surveyComNames.includes(com?.name)) {
      no += 1;
      const options = com?.status?.options?.status;
      const optText = Array.isArray(options) && typeof options[0] === "string"
        ? `（选项：${options.join("、")}）`
        : "";
      lines.push(`第${no}题[${com.name}]：${title}${optText}`);
    }
  }
  return lines.join("\n");
}

/**
 * 基于 RAG 的问卷结果分析。
 * 按 surveyId 拉取答卷，构建内存向量库，检索与用户问题相关的答卷片段，
 * 再交给 LLM 生成分析结论。
 * @param {object} params
 * @param {number|string} params.surveyId 问卷数字 id
 * @param {string} params.question 用户的分析问题
 * @returns {Promise<{ reply: string }>}
 */
export async function analyzeSurvey({ surveyId, question }) {
  try {
    const id = Number(surveyId);
    // 1. 拉取问卷与答卷
    const survey = await surveys().findOne({ id });
    // quizId 在种子/提交时可能为数字或字符串，这里做兼容查询
    const answerDocs = await answers()
      .find({ $or: [{ quizId: id }, { quizId: String(id) }] })
      .toArray();

    if (!answerDocs || answerDocs.length === 0) {
      return { reply: "该问卷暂无答卷数据，无法进行结果分析。" };
    }

    const questionContext = survey ? extractQuestions(survey.coms) : "";

    // 2. 构建文档并向量化（内存向量库）
    const docs = answerDocs.map(
      (doc, idx) => new Document({ pageContent: answerToText(doc, idx), metadata: { idx } })
    );
    const embeddings = createEmbeddings();
    const vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);

    // 3. 检索与问题最相关的答卷片段
    const k = Math.min(8, docs.length);
    const related = await vectorStore.similaritySearch(question, k);
    const context = related.map((d) => d.pageContent).join("\n\n");

    // 4. 交给 LLM 生成分析
    const model = createChatModel();
    const system = new SystemMessage(
      [
        "你是一名专业的问卷数据分析师。请基于提供的答卷数据，客观、有条理地回答用户的分析问题。",
        "要求：先给出关键结论，再列出数据支撑（如各选项占比、明显倾向、异常点），必要时给出改进建议。",
        "只能依据提供的答卷数据作答，不要编造不存在的数据。若数据不足以回答，请如实说明。",
        survey ? `\n问卷标题：${survey.title}` : "",
        questionContext ? `\n问卷题目：\n${questionContext}` : "",
        `\n答卷总数：${answerDocs.length}`,
        `\n以下是与问题相关的答卷样本：\n${context}`,
      ].join("\n")
    );
    const human = new HumanMessage(question);

    const result = await model.invoke([system, human]);
    const reply = typeof result.content === "string"
      ? result.content
      : Array.isArray(result.content)
        ? result.content.map((c) => (typeof c === "string" ? c : c.text || "")).join("")
        : String(result.content);

    return { reply };
  } catch (error) {
    return { reply: `结果分析失败：${error?.message || "未知错误"}` };
  }
}
