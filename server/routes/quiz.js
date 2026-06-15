import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { quizzes as getQuizzes, answers as getAnswers } from "../db/mongo.js";

// ESM 中获取当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// uploads 目录位于 server 根目录下
const uploadDir = path.join(__dirname, "..", "uploads");

function normalizeSurveyId(surveyId) {
  const numericSurveyId = Number(surveyId);
  return Number.isFinite(numericSurveyId) ? numericSurveyId : undefined;
}

export function createQuizRouter({
  quizzes = getQuizzes,
  answers = getAnswers,
} = {}) {
const router = express.Router();

// 存储在线问卷（id 为前端传来的 uuid 字符串），使用 upsert
router.post("/api/saveQuiz", async (req, res) => {
  try {
    const { id, quizData, surveyId } = req.body;
    if (!id || !quizData) {
      return res.status(400).send({ message: "缺少问卷参数" });
    }

    const normalizedSurveyId = normalizeSurveyId(surveyId);
    const quizDoc = { id, quizData };
    if (normalizedSurveyId !== undefined) {
      quizDoc.surveyId = normalizedSurveyId;
    }

    await quizzes().updateOne(
      { id },
      { $set: quizDoc },
      { upsert: true }
    );
    res.status(200).send({ message: "Quiz saved" });
  } catch (error) {
    res.status(500).send({ message: "保存问卷失败" });
  }
});

// 根据 id 获取在线问卷内容（返回 quizData，与原逻辑一致）
router.get("/api/getQuiz/:id", async (req, res) => {
  try {
    const doc = await quizzes().findOne({ id: req.params.id });
    if (!doc) {
      return res.status(404).send({ message: "问卷不存在或尚未生成" });
    }
    res.status(200).send(doc.quizData);
  } catch (error) {
    res.status(500).send({ message: "获取问卷失败" });
  }
});

// 提交答卷，追加存储（一份问卷可对应多份答卷）
router.post("/api/submitAnswers", async (req, res) => {
  try {
    const { quizId, answers: userAnswers } = req.body;
    if (!quizId) {
      return res.status(400).send({ message: "缺少问卷参数" });
    }

    const quizDoc = await quizzes().findOne({ id: quizId });
    if (!quizDoc) {
      return res.status(404).send({ message: "问卷不存在或尚未生成" });
    }

    const answerDoc = {
      quizId,
      answers: userAnswers,
      createDate: Date.now(),
    };
    if (quizDoc.surveyId !== undefined) {
      answerDoc.surveyId = quizDoc.surveyId;
    }

    await answers().insertOne(answerDoc);
    res.status(200).send({ message: "Answers submitted" });
  } catch (error) {
    res.status(500).send({ message: "提交答卷失败" });
  }
});

// 配置 multer 磁盘存储引擎
const storage = multer.diskStorage({
  // 上传文件的存储目录
  destination: function (req, file, cb) {
    // 若 uploads 目录不存在则创建
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  // 上传文件命名规则，加唯一后缀避免重名
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

// 上传图片接口
router.post("/api/upload", upload.single("image"), (req, res) => {
  try {
    res.status(200).send({
      message: "图片上传成功",
      imageUrl: `/uploads/${req.file.filename}`,
    });
  } catch (error) {
    res.status(500).send({ message: "图片上传失败" });
  }
});

return router;
}

export default createQuizRouter();
