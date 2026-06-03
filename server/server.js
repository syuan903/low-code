const express = require("express"); // 引入 express
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3001;
const uploadDir = path.join(__dirname, "uploads");
const allowedImageTypes = new Map([
  ["image/jpeg", { extensions: new Set([".jpg", ".jpeg"]), storedExtension: ".jpg" }],
  ["image/png", { extensions: new Set([".png"]), storedExtension: ".png" }],
  ["image/gif", { extensions: new Set([".gif"]), storedExtension: ".gif" }],
  ["image/webp", { extensions: new Set([".webp"]), storedExtension: ".webp" }],
]);

// 设置 body-parser 选项，增加请求体大小限制
app.use(bodyParser.json({ limit: "50mb" })); // 允许最大 50MB 的 JSON 请求体
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true })); // 允许最大 50MB 的 URL 编码请求体

let quizzes = {}; // 存储问题
let answers = {}; // 存储答案

// 针对在线答题功能，提供3个新的接口
// 存储问卷
app.post("/api/saveQuiz", (req, res) => {
  const { id, quizData } = req.body;
  quizzes[id] = quizData;
  res.status(200).send({ message: "Quiz saved" });
});
// 根据id获取问卷内容
app.get("/api/getQuiz/:id", (req, res) => {
  // 本来正常的逻辑，这里应该根据前端传递过来的问卷 id，从数据库来获取问卷内容，然后返回给前端
  // 但是这是一个简化项目，没有数据库，使用的是 indexedDB 来存储的问卷数据
  // 因此有了saveQuiz这个接口，我们可以直接从内存中获取问卷数据
  const quizData = quizzes[req.params.id];
  res.status(200).send(quizData);
});
// 存储答案
app.post("/api/submitAnswers", (req, res) => {
  const { quizId, answers: userAnswers } = req.body;
  if (!quizId || userAnswers === undefined) {
    return res.status(400).send({ message: "quizId and answers are required" });
  }
  if (!answers[quizId]) {
    answers[quizId] = [];
  }
  answers[quizId].push(userAnswers);
  console.table(answers);
  res.status(200).send({ message: "Answers submitted", count: answers[quizId].length });
});

// 设置 multer 存储引擎
const storage = multer.diskStorage({
  // 上传的文件要存储到哪里
  destination: function (req, file, cb) {
    // 如果 uploads 子文件夹不存在，则创建它
    fs.mkdirSync(uploadDir, { recursive: true });
    // 上传的文件夹路径
    cb(null, uploadDir);
  },
  // 上传的文件名字如何命名
  filename: function (req, file, cb) {
    // 给上传的文件一个唯一的后缀来保证不重名
    cb(null, `${file.fieldname}-${crypto.randomUUID()}${allowedImageTypes.get(file.mimetype).storedExtension}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedType = allowedImageTypes.get(file.mimetype);
    if (!allowedType || !allowedType.extensions.has(ext)) {
      return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "image"));
    }
    cb(null, true);
  },
});

// 添加上传图片的路由接口
app.post("/api/upload", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({ message: "请选择要上传的图片" });
    }
    res.status(200).send({
      message: "图片上传成功",
      imageUrl: `/uploads/${req.file.filename}`,
    });
  } catch (error) {
    res.status(500).send({ message: "图片上传失败" });
  }
});

// 提供静态资源服务
app.use(
  "/uploads",
  express.static(uploadDir, {
    setHeaders: (res) => {
      res.setHeader("X-Content-Type-Options", "nosniff");
    },
  })
);

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).send({ message: "只支持上传 JPG、PNG、GIF 或 WebP 图片" });
  }
  next(error);
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`server is running at ${PORT}`);
  });
}

module.exports = {
  app,
  answers,
  uploadDir,
};
