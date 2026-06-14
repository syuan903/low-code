# 接入 MongoDB 持久化与 AI 能力 Spec

## Why
当前后端 [server.js](file:///Users/bytedance/Desktop/low-code/server/server.js) 用内存对象存储问卷与答卷，重启即丢失，且无 AI 能力。本次升级把数据持久化到 MongoDB，并新增两项 AI 功能：基于 RAG 的问卷结果分析、基于 LLM Wiki + Operations 指令的对话式问卷创建/修改。

## What Changes
- **重构 server**：从单文件内存存储改为分模块的 MongoDB 持久化（问卷、答卷、在线问卷）。**BREAKING**：服务端数据结构与启动依赖变化。
- 问卷定义从前端 IndexedDB 迁移到 MongoDB，前端 [operation.ts](file:///Users/bytedance/Desktop/low-code/wenjuan/src/db/operation.ts) 改为调用后端 REST API（**保持函数签名与返回 Promise 不变**，id 继续为自增数字以兼容现有路由）。
- 新增**问卷结果分析**：后端用 LangChain.js + 内存向量库对某问卷的答卷做 RAG 问答，前端在预览页新增入口与对话面板。
- 新增**对话式创建/修改问卷**：后端用 LangChain.js Agent + LLM Wiki（Markdown 知识库）驱动；LLM 通过调用注册的 tools 生成一个 **operations 指令数组**（tools 仅向数组 push 指令，不做其他操作），前端执行该数组来增删改问卷。
- 新增 **aime 风格、贴合项目主题**的 AI 助手对话 UI（输入框 + 消息气泡），编辑器内以悬浮面板呈现。
- 新增**种子脚本**：随机生成 100 份不同主题的问卷及配套答卷写入 MongoDB，作为初始数据。

## Impact
- Affected specs: 数据持久化、在线问卷、问卷编辑、问卷预览、答卷收集
- Affected code:
  - 后端：[server/server.js](file:///Users/bytedance/Desktop/low-code/server/server.js)、[server/package.json](file:///Users/bytedance/Desktop/low-code/server/package.json)（新增 mongodb、langchain、@langchain/openai、@langchain/community、dotenv，改 ESM 模块）
  - 前端：[db/operation.ts](file:///Users/bytedance/Desktop/low-code/wenjuan/src/db/operation.ts)、[db/db.ts](file:///Users/bytedance/Desktop/low-code/wenjuan/src/db/db.ts)、[stores/useEditor.ts](file:///Users/bytedance/Desktop/low-code/wenjuan/src/stores/useEditor.ts)、[views/PreView.vue](file:///Users/bytedance/Desktop/low-code/wenjuan/src/views/PreView.vue)、[views/EditorView/Index.vue](file:///Users/bytedance/Desktop/low-code/wenjuan/src/views/EditorView/Index.vue)、[vite.config.ts](file:///Users/bytedance/Desktop/low-code/wenjuan/vite.config.ts)
  - 类型：[types/index.ts](file:///Users/bytedance/Desktop/low-code/wenjuan/src/types/index.ts)（新增 Operation、Chat 相关类型）

## 关键设计约定

### 1. id 兼容策略
MongoDB 通过 `counters` 集合实现自增数字 id，使问卷 id 仍为 `number`，从而保留 [router](file:///Users/bytedance/Desktop/low-code/wenjuan/src/router/index.ts#L13) 中 `:id(\\d+)` 路由与 `Number(id)` 调用，最大化减少前端改动。

### 2. Operations 指令协议（对话式编辑核心）
后端 Agent 的每个 tool 被调用时，仅向当前会话的 operations 数组 push 一条指令并返回确认；Agent 结束后把 operations 数组返回前端。前端逐条执行，映射到现有 Pinia store action。支持的指令：
- `addCom` `{ material }` → `store.addCom`
- `removeCom` `{ index }` → `store.removeCom`
- `setText` `{ index, field: 'title'|'desc'|'titleColor'|'descColor', value }` → `setTextStatus`/`setColor`
- `addOption` `{ index }` / `removeOption` `{ index, optionIndex }` → `addOption`/`removeOption`
- `setSelect` `{ index, field: 'position'|'titleSize'|'descSize'|'titleWeight'|'descWeight'|'titleItalic'|'descItalic'|'type', value:number }` → `setCurrentStatus` 等
- `reset` → `store.resetComs`

`index` 指当前编辑器 `store.coms` 中题目所在索引（含默认的标题/欢迎语两块）。

### 3. LLM Wiki（轻量实现）
在 `server/wiki/` 下维护一组 Markdown 文件（问卷类型、题型用法、出题最佳实践等），Agent 在生成问卷时将其作为知识上下文加载。新建问卷完成后追加一次 ingest，把新问卷的题型组合摘要增量写回 Wiki。首版只做"加载为上下文 + 追加摘要"，不做复杂的跨页链接/Lint。

### 4. LLM 接入
通过环境变量 `LLM_BASE_URL`、`LLM_API_KEY`、`LLM_MODEL`、`EMBEDDING_MODEL` 配置，使用 OpenAI 兼容接口（LangChain.js `ChatOpenAI` + `OpenAIEmbeddings`）。RAG 使用内存向量库 `MemoryVectorStore`。

## ADDED Requirements

### Requirement: MongoDB 持久化
系统 SHALL 使用 MongoDB 持久化存储问卷定义、在线问卷与答卷数据，替代原内存存储。

#### Scenario: 保存并读取问卷
- **WHEN** 用户在编辑器保存问卷
- **THEN** 问卷以自增数字 id 写入 MongoDB，刷新或重启服务后仍可在首页列表读取

#### Scenario: 答卷入库
- **WHEN** 答题者在 QuizView 提交答案
- **THEN** 答卷写入 MongoDB 并与对应问卷 id 关联

### Requirement: 问卷结果分析（RAG）
系统 SHALL 提供基于 LangChain.js + 内存向量库的问卷结果分析对话能力。

#### Scenario: 分析某问卷答卷
- **WHEN** 用户在预览页点击"AI 结果分析"并提问
- **THEN** 后端检索该问卷答卷构建上下文，由 LLM 生成分析回答并在对话面板展示

### Requirement: 对话式创建/修改问卷
系统 SHALL 提供 AI 助手，通过对话生成 operations 指令数组，由前端执行以创建或修改问卷。

#### Scenario: 对话生成问卷
- **WHEN** 用户在编辑器 AI 助手面板输入"做一份大学生消费习惯调研"
- **THEN** 后端 Agent 调用 tools 生成 operations 数组返回前端，前端逐条执行后画布出现对应题目

#### Scenario: 对话修改现有问卷
- **WHEN** 用户输入"把第 2 题改成多选并加两个选项"
- **THEN** 返回的 operations 仅针对目标题目，前端执行后该题被正确修改，其余题目不受影响

### Requirement: AI 助手对话 UI
系统 SHALL 提供 aime 风格、贴合项目主题色（参见 [variables.scss](file:///Users/bytedance/Desktop/low-code/wenjuan/src/assets/css/variables.scss)）的对话组件，含输入框、发送、消息气泡与加载态。

#### Scenario: 编辑器内唤起助手
- **WHEN** 用户在编辑器点击悬浮的 AI 助手按钮
- **THEN** 弹出对话面板，可输入与查看多轮对话

### Requirement: 初始种子数据
系统 SHALL 提供脚本随机生成 100 份不同主题问卷及配套答卷写入 MongoDB。

#### Scenario: 运行种子脚本
- **WHEN** 执行种子脚本
- **THEN** MongoDB 中出现 100 份主题各异、题型组合合理的问卷，且每份带若干份随机答卷，首页可见、可被结果分析使用

## MODIFIED Requirements

### Requirement: 前端数据访问层
前端 [operation.ts](file:///Users/bytedance/Desktop/low-code/wenjuan/src/db/operation.ts) 由 Dexie/IndexedDB 实现改为后端 REST API 客户端，函数名与 Promise 返回类型保持不变，问卷 id 仍为 number。原 [db.ts](file:///Users/bytedance/Desktop/low-code/wenjuan/src/db/db.ts) 的 Dexie 数据库定义被移除。

## REMOVED Requirements

### Requirement: 内存存储与前端 IndexedDB 存储
**Reason**: 改为 MongoDB 统一持久化。
**Migration**: 服务端 `quizzes`/`answers` 内存对象与前端 Dexie `surveys` 表移除；原 IndexedDB 中的历史本地数据不做迁移（开发期数据），统一以 MongoDB 为准并用种子数据初始化。
