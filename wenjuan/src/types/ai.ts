// AI 助手相关类型定义

// 对话角色
export type ChatRole = 'user' | 'assistant'

// 单条对话消息
export interface ChatMessage {
  role: ChatRole
  content: string
}

// 后端返回、前端逐条执行的操作指令协议
export type Operation =
  | { op: 'reset' }
  | { op: 'addCom'; material: string }
  | {
      op: 'setText'
      index: number
      field: 'title' | 'desc' | 'titleColor' | 'descColor'
      value: string
    }
  | { op: 'addOption'; index: number }
  | { op: 'removeOption'; index: number; optionIndex: number }
  | { op: 'setOptionText'; index: number; optionIndex: number; value: string }
  | {
      op: 'setSelect'
      index: number
      field:
        | 'position'
        | 'titleSize'
        | 'descSize'
        | 'titleWeight'
        | 'descWeight'
        | 'titleItalic'
        | 'descItalic'
        | 'type'
      value: number
    }
  | { op: 'removeCom'; index: number }
