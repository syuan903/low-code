import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./db/mongo.js";
import surveyRouter from "./routes/survey.js";
import quizRouter from "./routes/quiz.js";
import aiRouter from "./routes/ai.js";

// ESM 中获取当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// 解析请求体，放宽大小限制以兼容嵌套较深的问卷数据
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// 挂载路由
app.use(surveyRouter);
app.use(quizRouter);
app.use(aiRouter);

// 提供 uploads 静态资源服务
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 连接数据库成功后再启动服务
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`server is running at ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("数据库连接失败，服务启动中止：", error);
    process.exit(1);
  });
