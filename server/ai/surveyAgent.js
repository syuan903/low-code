import { z } from "zod";
import { tool } from "@langchain/core/tools";
import {
  SystemMessage,
  HumanMessage,
  AIMessage,
  ToolMessage,
} from "@langchain/core/messages";
import { createChatModel } from "./llm.js";
import { loadWiki } from "./wiki.js";

// 可用题型清单（material 取值）
const MATERIALS = [
  "single-select",
  "multi-select",
  "option-select",
  "text-input",
  "rate-score",
  "date-time",
  "text-note",
];

// 工具调用循环最大轮次，防止死循环
const MAX_ITERATIONS = 12;

/**
 * 构建一组工具，所有工具共享同一个 operations 数组。
 * 每个工具只做一件事：把对应指令 push 进 operations 并返回确认文本。
 * @param {Array} operations 累积操作指令的数组
 * @returns {Array} LangChain 工具列表
 */
function buildTools(operations) {
  const reset = tool(
    async () => {
      operations.push({ op: "reset" });
      return "已清空问卷";
    },
    {
      name: "reset",
      description: "清空整个问卷，回到初始状态。仅在用户明确要求重置/重新开始时调用。",
      schema: z.object({}),
    }
  );

  const addCom = tool(
    async ({ material }) => {
      operations.push({ op: "addCom", material });
      return `已添加题目（${material}）`;
    },
    {
      name: "addCom",
      description:
        "在问卷末尾添加一个题目/组件。material 为题型名，可选值：" +
        MATERIALS.join("、") +
        "。新题目会追加到 coms 数组末尾。",
      schema: z.object({
        material: z
          .enum(MATERIALS)
          .describe("题型名，必须是可选题型之一"),
      }),
    }
  );

  const setText = tool(
    async ({ index, field, value }) => {
      operations.push({ op: "setText", index, field, value });
      return `已设置第 ${index} 题的 ${field}`;
    },
    {
      name: "setText",
      description:
        "设置某题的文本或颜色。field 取值：title(标题)、desc(描述)、titleColor(标题颜色)、descColor(描述颜色)。index 为题目在 coms 数组中的索引。",
      schema: z.object({
        index: z.number().int().describe("题目在 coms 数组中的索引"),
        field: z
          .enum(["title", "desc", "titleColor", "descColor"])
          .describe("要设置的字段"),
        value: z.string().describe("文本内容或颜色值"),
      }),
    }
  );

  const addOption = tool(
    async ({ index }) => {
      operations.push({ op: "addOption", index });
      return `已为第 ${index} 题添加一个选项`;
    },
    {
      name: "addOption",
      description:
        "给某个选择题（single-select/multi-select/option-select）增加一个选项。index 为题目索引。添加后通常需用 setOptionText 设置该选项文案。",
      schema: z.object({
        index: z.number().int().describe("题目在 coms 数组中的索引"),
      }),
    }
  );

  const removeOption = tool(
    async ({ index, optionIndex }) => {
      operations.push({ op: "removeOption", index, optionIndex });
      return `已删除第 ${index} 题的第 ${optionIndex} 个选项`;
    },
    {
      name: "removeOption",
      description:
        "删除某选择题的某个选项。index 为题目索引，optionIndex 为选项索引。",
      schema: z.object({
        index: z.number().int().describe("题目在 coms 数组中的索引"),
        optionIndex: z.number().int().describe("选项索引"),
      }),
    }
  );

  const setOptionText = tool(
    async ({ index, optionIndex, value }) => {
      operations.push({ op: "setOptionText", index, optionIndex, value });
      return `已设置第 ${index} 题第 ${optionIndex} 个选项的文案`;
    },
    {
      name: "setOptionText",
      description:
        "设置某选择题某个选项的文本（修改 options.status[optionIndex]）。index 为题目索引，optionIndex 为选项索引，value 为选项文案。",
      schema: z.object({
        index: z.number().int().describe("题目在 coms 数组中的索引"),
        optionIndex: z.number().int().describe("选项索引"),
        value: z.string().describe("选项文案"),
      }),
    }
  );

  const setSelect = tool(
    async ({ index, field, value }) => {
      operations.push({ op: "setSelect", index, field, value });
      return `已设置第 ${index} 题的 ${field}`;
    },
    {
      name: "setSelect",
      description:
        "设置某题的下拉型属性的 currentStatus 索引。field 取值：position、titleSize、descSize、titleWeight、descWeight、titleItalic、descItalic、type。value 为对应的索引数字。一般用于样式微调，非必要可不调用。",
      schema: z.object({
        index: z.number().int().describe("题目在 coms 数组中的索引"),
        field: z
          .enum([
            "position",
            "titleSize",
            "descSize",
            "titleWeight",
            "descWeight",
            "titleItalic",
            "descItalic",
            "type",
          ])
          .describe("要设置的下拉型属性"),
        value: z.number().int().describe("currentStatus 索引值"),
      }),
    }
  );

  const removeCom = tool(
    async ({ index }) => {
      operations.push({ op: "removeCom", index });
      return `已删除第 ${index} 题`;
    },
    {
      name: "removeCom",
      description: "删除某道题目。index 为题目在 coms 数组中的索引。",
      schema: z.object({
        index: z.number().int().describe("题目在 coms 数组中的索引"),
      }),
    }
  );

  return [
    reset,
    addCom,
    setText,
    addOption,
    removeOption,
    setOptionText,
    setSelect,
    removeCom,
  ];
}

/**
 * 构建 system prompt：注入 wiki 知识、operations 协议、当前问卷摘要、题型清单。
 * @param {string} currentSummary 当前问卷摘要
 * @returns {string}
 */
function buildSystemPrompt(currentSummary) {
  const wiki = loadWiki();
  return [
    "你是一个问卷设计助手，帮助用户通过对话来创建和修改在线问卷。",
    "",
    "【硬性约束】",
    "1. 你不能直接返回问卷 JSON，也不能把工具调用写成普通文本输出；只能通过系统提供的工具调用机制（function calling）来构建/修改问卷。",
    "2. 只有当用户明确要求“创建/添加/修改/删除问卷或题目”时才调用工具。",
    "3. 对于打招呼、闲聊、提问、与问卷编辑无关的内容（例如“你好”“你是谁”“能做什么”），绝对不要调用任何工具，直接用自然语言友好回复即可。",
    "4. 严禁调用 reset，除非用户明确说“清空/重置/重新开始/全部删除”。",
    "每个工具只会向操作指令序列追加一条指令，前端会按顺序执行这些指令来增删改问卷。",
    "",
    "【可用题型】（addCom 的 material 取值）：",
    MATERIALS.join("、"),
    "",
    "【编辑器结构说明】",
    "- 编辑器的 coms 数组初始已有 2 个默认块（索引 0、1，为问卷标题区/欢迎语）。",
    "- 通过 addCom 新增的题目会从索引 2 开始往后依次追加。",
    "- 修改已有题目时，请依据下方“当前问卷摘要”给出的索引来定位。",
    "",
    "【出题流程建议】",
    "1. 创建全新问卷前，如有必要可先调用 reset 清空。",
    "2. 用 addCom 添加题目（注意添加顺序即索引顺序）。",
    "3. 添加后用 setText 设置该题的 title（标题）、必要时设 desc（描述）。",
    "4. 选择题：先用 addOption 把选项数量加到目标数量，再用 setOptionText 逐个设置每个选项的文案。",
    "5. 开头建议用 text-note 写问卷标题与欢迎语；个人信息等敏感题靠后放置。",
    "",
    "【当前问卷摘要】",
    currentSummary
      ? String(currentSummary)
      : "（暂无，当前为初始空白问卷）",
    "",
    "【出题知识库（Wiki）】",
    wiki || "（无）",
    "",
    "完成所有工具调用后，用简洁友好的自然语言向用户总结你做了什么。",
  ].join("\n");
}

/**
 * 把外部传入的 history（[{role, content}]）转换为 LangChain 消息。
 * @param {Array} history
 * @returns {Array}
 */
function historyToMessages(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter((m) => m && m.content)
    .map((m) =>
      m.role === "assistant"
        ? new AIMessage(String(m.content))
        : new HumanMessage(String(m.content))
    );
}

/**
 * 运行问卷 Agent：基于 bindTools 手动执行工具调用循环。
 * @param {Object} params
 * @param {string} params.currentSummary 当前问卷摘要
 * @param {string} params.message 用户本轮输入
 * @param {Array} [params.history] 历史对话
 * @returns {Promise<{reply: string, operations: Array}>}
 */
export async function runSurveyAgent({ currentSummary, message, history }) {
  // 局部累积的操作指令数组
  const operations = [];

  try {
    const tools = buildTools(operations);
    // 以工具名快速定位工具实例
    const toolMap = new Map(tools.map((t) => [t.name, t]));

    const model = createChatModel();
    const modelWithTools = model.bindTools(tools);

    // 组装初始消息列表：system + 历史 + 本轮用户输入
    const messages = [
      new SystemMessage(buildSystemPrompt(currentSummary)),
      ...historyToMessages(history),
      new HumanMessage(String(message || "")),
    ];

    let reply = "";

    // 手动 tool-calling 循环：调用模型 → 执行 tool_calls → 回填 ToolMessage → 再次调用
    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const ai = await modelWithTools.invoke(messages);
      messages.push(ai);

      const toolCalls = ai.tool_calls || [];

      // 无工具调用时，认为模型已给出最终回复，结束循环
      if (toolCalls.length === 0) {
        reply =
          typeof ai.content === "string"
            ? ai.content
            : Array.isArray(ai.content)
            ? ai.content
                .map((c) => (typeof c === "string" ? c : c.text || ""))
                .join("")
            : "";
        break;
      }

      // 依次执行每个工具调用，并把结果作为 ToolMessage 回填
      for (const call of toolCalls) {
        const t = toolMap.get(call.name);
        let result;
        try {
          result = t
            ? await t.invoke(call.args)
            : `未知工具：${call.name}`;
        } catch (err) {
          result = `工具执行失败：${err?.message || String(err)}`;
        }
        messages.push(
          new ToolMessage({
            content:
              typeof result === "string" ? result : JSON.stringify(result),
            tool_call_id: call.id,
          })
        );
      }
    }

    if (!reply) {
      reply = "已根据你的要求完成问卷的相应操作。";
    }

    return { reply, operations };
  } catch (error) {
    // LLM 不可用等异常：返回友好错误，operations 保持为空数组
    return {
      reply: `抱歉，AI 服务暂时不可用：${error?.message || String(error)}`,
      operations: [],
    };
  }
}
