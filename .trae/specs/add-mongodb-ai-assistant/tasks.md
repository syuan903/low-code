# Tasks

- [x] Task 1: 重构 server 为 MongoDB 持久化分层结构
  - [x] SubTask 1.1: 升级 [server/package.json](file:///Users/bytedance/Desktop/low-code/server/package.json) 为 ESM，新增依赖（mongodb、dotenv、@langchain/openai、@langchain/community、langchain），补充 `.env.example`（MONGO_URL、LLM_BASE_URL、LLM_API_KEY、LLM_MODEL、EMBEDDING_MODEL）
  - [x] SubTask 1.2: 新增 `server/db/mongo.js`：连接 MongoDB、提供 `surveys`/`answers`/`quizzes` 集合与基于 `counters` 集合的自增数字 id 工具
  - [x] SubTask 1.3: 新增 `server/routes/survey.js`：问卷 CRUD REST 接口（list/get/create/update/delete），id 为自增 number
  - [x] SubTask 1.4: 重写在线问卷与答卷接口（saveQuiz/getQuiz/submitAnswers）落库 MongoDB，保留图片上传接口
  - [x] SubTask 1.5: 重写 `server/server.js` 为入口，挂载各路由与中间件

- [x] Task 2: 前端数据访问层切换到 REST API
  - [x] SubTask 2.1: 重写 [db/operation.ts](file:///Users/bytedance/Desktop/low-code/wenjuan/src/db/operation.ts) 为 fetch API 客户端，保持 `saveSurvey/getAllSurvey/getSurveyById/deleteSurveyById/updateSurveyById` 签名与 Promise 返回不变
  - [x] SubTask 2.2: 移除 [db/db.ts](file:///Users/bytedance/Desktop/low-code/wenjuan/src/db/db.ts) 的 Dexie 定义，更新引用
  - [x] SubTask 2.3: 在 [vite.config.ts](file:///Users/bytedance/Desktop/low-code/wenjuan/vite.config.ts) 确认 `/api` 代理覆盖新接口
  - [x] SubTask 2.4: 验证首页列表、编辑、预览、删除、保存/更新全链路可用

- [x] Task 3: 种子数据脚本
  - [x] SubTask 3.1: 新增 `server/seed/buildSurvey.js`：用纯 JSON 构建符合 `restoreComponentStatus` 还原要求的 coms（com 与各 status 字段均带正确 `name`，不含 Vue 组件引用）
  - [x] SubTask 3.2: 新增 `server/seed/seed.js`：随机生成 100 份不同主题问卷 + 每份若干随机答卷写入 MongoDB，加入 `npm run seed`

- [x] Task 4: 后端 AI - 对话式创建/修改问卷（Operations + LLM Wiki）
  - [x] SubTask 4.1: 新增 `server/wiki/` 初始 Markdown 知识库（题型说明、出题最佳实践）与加载器 `server/ai/wiki.js`（加载为上下文 + 追加摘要 ingest）
  - [x] SubTask 4.2: 新增 `server/ai/surveyAgent.js`：LangChain.js Agent，注册仅 push 指令到 operations 数组的 tools（addCom/removeCom/setText/addOption/removeOption/setSelect/reset）
  - [x] SubTask 4.3: 新增接口 `POST /api/ai/survey`：入参当前问卷摘要 + 用户消息，返回 `{ reply, operations }`

- [x] Task 5: 后端 AI - 问卷结果分析（RAG）
  - [x] SubTask 5.1: 新增 `server/ai/analyzeChain.js`：按 surveyId 拉取答卷，构建 `MemoryVectorStore`，检索 + LLM 生成分析
  - [x] SubTask 5.2: 新增接口 `POST /api/ai/analyze`：入参 surveyId + 用户问题，返回分析回答

- [x] Task 6: 前端 AI 助手 UI 与 Operations 执行器
  - [x] SubTask 6.1: 新增通用 aime 风格对话组件（输入框、发送、消息气泡、加载态），使用项目主题变量
  - [x] SubTask 6.2: 新增 `src/utils/applyOperations.ts`：把 operations 数组映射到 useEditor store action 顺序执行
  - [x] SubTask 6.3: 在 [EditorView/Index.vue](file:///Users/bytedance/Desktop/low-code/wenjuan/src/views/EditorView/Index.vue) 接入悬浮 AI 助手按钮 + 面板，调用 `/api/ai/survey` 并执行 operations
  - [x] SubTask 6.4: 在 [PreView.vue](file:///Users/bytedance/Desktop/low-code/wenjuan/src/views/PreView.vue) 新增"AI 结果分析"按钮 + 复用对话面板，调用 `/api/ai/analyze`
  - [x] SubTask 6.5: 新增 Operation / Chat 相关 TS 类型到 [types](file:///Users/bytedance/Desktop/low-code/wenjuan/src/types/index.ts)

# Task Dependencies
- Task 2 depends on Task 1
- Task 3 depends on Task 1
- Task 4 depends on Task 1
- Task 5 depends on Task 1、Task 3（需答卷数据）
- Task 6 depends on Task 4、Task 5
