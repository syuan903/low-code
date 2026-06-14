import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";

// 共享的 LLM 配置（从环境变量读取，使用 OpenAI 兼容接口）
const LLM_BASE_URL = process.env.LLM_BASE_URL;
const LLM_API_KEY = process.env.LLM_API_KEY;
const LLM_MODEL = process.env.LLM_MODEL || "gpt-4o-mini";
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || "text-embedding-3-small";

/**
 * 创建支持工具调用的聊天模型实例。
 * baseURL/apiKey/model 均取自环境变量，temperature 适中。
 * @returns {ChatOpenAI}
 */
export function createChatModel() {
  return new ChatOpenAI({
    model: LLM_MODEL,
    apiKey: LLM_API_KEY,
    temperature: 0.5,
    configuration: {
      baseURL: LLM_BASE_URL,
    },
  });
}

/**
 * 创建 Embeddings 实例，供 RAG（Task5）复用。
 * @returns {OpenAIEmbeddings}
 */
export function createEmbeddings() {
  return new OpenAIEmbeddings({
    model: EMBEDDING_MODEL,
    apiKey: LLM_API_KEY,
    configuration: {
      baseURL: LLM_BASE_URL,
    },
  });
}
