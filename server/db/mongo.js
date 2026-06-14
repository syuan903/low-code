import { MongoClient } from "mongodb";

// MongoDB 连接配置（从环境变量读取）
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017";
const MONGO_DB = process.env.MONGO_DB || "survey";

let client; // MongoClient 实例
let db; // 已连接的数据库实例

export function redactMongoUrl(mongoUrl) {
  try {
    const parsed = new URL(mongoUrl);
    const path = parsed.pathname && parsed.pathname !== "/" ? parsed.pathname : "";
    return `${parsed.protocol}//${parsed.host}${path}`;
  } catch (error) {
    return "[invalid MongoDB URL]";
  }
}

/**
 * 连接数据库，返回 db 实例。
 * 多次调用只会建立一次连接。
 */
export async function connectDB() {
  if (db) return db;
  client = new MongoClient(MONGO_URL);
  await client.connect();
  db = client.db(MONGO_DB);
  console.log(`MongoDB 已连接：${redactMongoUrl(MONGO_URL)} / ${MONGO_DB}`);
  return db;
}

/**
 * 获取已连接的 db 实例（需先调用 connectDB）。
 */
export function getDB() {
  if (!db) {
    throw new Error("数据库尚未连接，请先调用 connectDB()");
  }
  return db;
}

// 便捷方法：获取各集合
export function surveys() {
  return getDB().collection("surveys");
}

export function answers() {
  return getDB().collection("answers");
}

export function quizzes() {
  return getDB().collection("quizzes");
}

export function counters() {
  return getDB().collection("counters");
}

/**
 * 基于 counters 集合实现自增数字 id。
 * seq 从 1 开始递增。
 * @param {string} name 计数器名称（如 'survey'）
 * @returns {Promise<number>} 新的自增 id
 */
export async function getNextId(name) {
  const result = await counters().findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );
  // 兼容不同驱动版本返回结构
  const doc = result && result.value ? result.value : result;
  return doc.seq;
}
