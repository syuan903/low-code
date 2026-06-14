# Checklist

## 持久化
- [x] server 连接 MongoDB，移除内存 quizzes/answers 对象
- [x] 问卷以自增数字 id 存取，重启服务后数据不丢失
- [x] 在线问卷 saveQuiz/getQuiz 走 MongoDB
- [x] 答卷 submitAnswers 落库并关联问卷 id
- [x] 图片上传接口保留可用

## 前端数据层
- [x] operation.ts 改为 REST 客户端且函数签名/返回类型不变
- [x] db.ts Dexie 定义已移除且无残留引用
- [x] 首页列表/编辑/预览/删除/保存/更新全链路正常

## 种子数据
- [x] 运行种子脚本后 MongoDB 出现 100 份不同主题问卷
- [x] 种子 coms 能被前端 restoreComponentStatus 正确还原并渲染
- [x] 每份种子问卷带有若干随机答卷

## 对话式创建/修改问卷
- [x] /api/ai/survey 返回 { reply, operations }
- [x] tools 仅向 operations 数组 push 指令，不做其他副作用
- [x] 前端 applyOperations 能逐条映射到 store action 并正确改动画布
- [x] 修改场景只影响目标题目，其余题目不变
- [x] LLM Wiki 作为上下文加载，新建后追加摘要

## 结果分析（RAG）
- [x] /api/ai/analyze 基于 MemoryVectorStore 检索答卷并由 LLM 生成回答
- [x] 预览页"AI 结果分析"入口可发起对话并展示结果

## AI 助手 UI
- [x] 对话组件为 aime 风格（输入框/发送/气泡/加载态）
- [x] 样式使用项目主题变量，风格统一
- [x] 编辑器内悬浮面板可正常唤起与多轮对话
