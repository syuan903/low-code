// 用纯 JSON 构建合法的问卷组件（com）对象。
// 关键约定：所有 com 与 status 子字段都带正确的 name，不写 type / editCom，
// 前端读出后会通过 restoreComponentStatus 依据 name 自行挂载 Vue 组件。

import { randomUUID } from "crypto";

// 生成 uuid 的辅助（使用 node 内置 crypto，无需额外依赖）
export function uuid() {
  return randomUUID();
}

// 构建一组通用样式 status 字段（title/desc/位置/字号/字重/斜体/颜色）。
// titleStatus / descStatus 为标题与描述的文本内容。
function commonStatus(titleStatus, descStatus) {
  return {
    title: {
      id: uuid(),
      status: titleStatus,
      isShow: true,
      name: "title-editor",
    },
    desc: {
      id: uuid(),
      status: descStatus,
      isShow: true,
      name: "desc-editor",
    },
    position: {
      id: uuid(),
      currentStatus: 0,
      status: ["左对齐", "居中对齐"],
      isShow: true,
      name: "position-editor",
    },
    titleSize: {
      id: uuid(),
      currentStatus: 0,
      status: ["22", "20", "18"],
      isShow: true,
      name: "size-editor",
    },
    descSize: {
      id: uuid(),
      currentStatus: 0,
      status: ["16", "14", "12"],
      isShow: true,
      name: "size-editor",
    },
    titleWeight: {
      id: uuid(),
      currentStatus: 1,
      status: ["加粗", "正常"],
      isShow: true,
      name: "weight-editor",
    },
    descWeight: {
      id: uuid(),
      currentStatus: 1,
      status: ["加粗", "正常"],
      isShow: true,
      name: "weight-editor",
    },
    titleItalic: {
      id: uuid(),
      currentStatus: 1,
      status: ["斜体", "正常"],
      isShow: true,
      name: "italic-editor",
    },
    descItalic: {
      id: uuid(),
      currentStatus: 1,
      status: ["斜体", "正常"],
      isShow: true,
      name: "italic-editor",
    },
    titleColor: {
      id: uuid(),
      status: "#000",
      isShow: true,
      name: "color-editor",
    },
    descColor: {
      id: uuid(),
      status: "#909399",
      isShow: true,
      name: "color-editor",
    },
  };
}

/**
 * 备注说明块（问卷标题/欢迎语），不计入题目数量。
 * 多一个 text-type-editor 的 type 字段。
 */
export function makeTextNote(title, desc) {
  return {
    id: uuid(),
    name: "text-note",
    status: {
      type: {
        id: uuid(),
        status: ["标题", "描述"],
        currentStatus: 1,
        isShow: true,
        name: "text-type-editor",
      },
      ...commonStatus(title, desc),
    },
  };
}

/**
 * 选择类题目：single-select（单选）/ multi-select（多选）/ option-select（下拉）。
 * 带 options 字段，options 为字符串数组。
 */
export function makeChoice(name, title, options) {
  return {
    id: uuid(),
    name,
    status: {
      ...commonStatus(title, "请选择"),
      options: {
        id: uuid(),
        currentStatus: 0,
        status: options,
        isShow: true,
        name: "options-editor",
      },
    },
  };
}

/**
 * 文本输入题（无 options）。
 * 多一个 text-type-editor 的 type 字段（单行/多行文本）。
 */
export function makeTextInput(title) {
  return {
    id: uuid(),
    name: "text-input",
    status: {
      type: {
        id: uuid(),
        status: ["单行文本", "多行文本"],
        currentStatus: 0,
        isShow: true,
        name: "text-type-editor",
      },
      ...commonStatus(title, "请输入"),
    },
  };
}

/**
 * 评分/打分题（无 options 业务选项，含 rate-text-editor 的评分文案）。
 */
export function makeRate(title) {
  return {
    id: uuid(),
    name: "rate-score",
    status: {
      ...commonStatus(title, "请评分"),
      options: {
        id: uuid(),
        currentStatus: 0,
        status: ["非常不满意", "不满意", "一般", "满意", "非常满意"],
        isShow: true,
        isUse: false,
        name: "rate-text-editor",
      },
    },
  };
}

/**
 * 日期/时间题（无 options，含 date-time-type-editor 的 type 字段）。
 */
export function makeDateTime(title) {
  return {
    id: uuid(),
    name: "date-time",
    status: {
      ...commonStatus(title, "请选择日期"),
      type: {
        id: uuid(),
        currentStatus: 3,
        status: [
          { value: "week", status: "周" },
          { value: "year", status: "年" },
          { value: "month", status: "月" },
          { value: "date", status: "日期" },
        ],
        isShow: true,
        name: "date-time-type-editor",
      },
    },
  };
}
