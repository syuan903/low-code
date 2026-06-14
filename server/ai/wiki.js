import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ESM 中获取当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// wiki 知识库目录（server/wiki）
const WIKI_DIR = path.join(__dirname, "..", "wiki");
// 增量摘要写入文件
const INGESTED_FILE = path.join(WIKI_DIR, "_ingested.md");

/**
 * 读取 wiki 目录下所有 .md 文件，拼成一个字符串上下文返回。
 * 作为 LLM 出题时的知识背景。
 * @returns {string} 拼接后的知识库文本
 */
export function loadWiki() {
  try {
    if (!fs.existsSync(WIKI_DIR)) return "";
    const files = fs
      .readdirSync(WIKI_DIR)
      .filter((f) => f.endsWith(".md"))
      .sort();

    const parts = [];
    for (const file of files) {
      const full = path.join(WIKI_DIR, file);
      try {
        const content = fs.readFileSync(full, "utf-8");
        parts.push(`# 文件：${file}\n\n${content}`);
      } catch {
        // 单个文件读取失败时跳过，不影响整体
      }
    }
    return parts.join("\n\n---\n\n");
  } catch {
    return "";
  }
}

/**
 * 把一段新问卷的题型组合摘要追加写入 _ingested.md（带时间戳）。
 * 首版只做简单追加，不做去重/向量化等复杂处理。
 * @param {string} summary 题型组合摘要文本
 */
export function ingestSummary(summary) {
  if (!summary || typeof summary !== "string") return;
  try {
    if (!fs.existsSync(WIKI_DIR)) {
      fs.mkdirSync(WIKI_DIR, { recursive: true });
    }
    const timestamp = new Date().toISOString();
    const block = `\n## ${timestamp}\n${summary.trim()}\n`;
    // 文件不存在时先写入标题
    if (!fs.existsSync(INGESTED_FILE)) {
      fs.writeFileSync(
        INGESTED_FILE,
        "# 历史问卷题型组合摘要（自动沉淀）\n",
        "utf-8"
      );
    }
    fs.appendFileSync(INGESTED_FILE, block, "utf-8");
  } catch {
    // 写入失败不影响主流程
  }
}
