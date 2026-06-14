import express from "express";
import { runSurveyAgent } from "../ai/surveyAgent.js";
import { ingestSummary } from "../ai/wiki.js";
import { analyzeSurvey } from "../ai/analyzeChain.js";

const router = express.Router();

/**
 * 对话式创建/修改问卷。
 * body: { currentSummary, message, history }
 * 返回: { reply, operations }
 */
router.post("/api/ai/survey", async (req, res) => {
  try {
    const { currentSummary, message, history } = req.body || {};
    if (!message) {
      return res.status(400).send({ message: "缺少 message 参数" });
    }

    const { reply, operations } = await runSurveyAgent({
      currentSummary,
      message,
      history,
    });

    // 若本轮生成了新题目（含 addCom），把题型组合摘要沉淀进 wiki
    const materials = (operations || [])
      .filter((o) => o && o.op === "addCom" && o.material)
      .map((o) => o.material);
    if (materials.length > 0) {
      ingestSummary(`用户需求：${message}\n题型组合：${materials.join("、")}`);
    }

    res.status(200).send({ reply, operations });
  } catch (error) {
    res.status(500).send({
      reply: "服务器处理 AI 请求时出错。",
      operations: [],
      message: error?.message || "未知错误",
    });
  }
});

// 预留：Task5 将在此添加 POST /api/ai/analyze

/**
 * 问卷结果分析（RAG）。
 * body: { surveyId, question }
 * 返回: { reply }
 */
router.post("/api/ai/analyze", async (req, res) => {
  try {
    const { surveyId, question } = req.body || {};
    if (!surveyId || !question) {
      return res.status(400).send({ reply: "缺少 surveyId 或 question 参数" });
    }
    const { reply } = await analyzeSurvey({ surveyId, question });
    res.status(200).send({ reply });
  } catch (error) {
    res.status(500).send({ reply: `结果分析失败：${error?.message || "未知错误"}` });
  }
});

export default router;
