// AI 指令执行器：将后端返回的 Operation 数组逐条映射到编辑器 store 的 action
import { useEditorStore } from '@/stores/useEditor'
import type { Operation, Status, TextProps, OptionsProps, Material } from '@/types'

// 逐条执行操作指令，每条用 try/catch 包裹，非法指令仅 console.warn 跳过，不中断整体执行
export function applyOperations(operations: Operation[]) {
  const store = useEditorStore()
  if (!Array.isArray(operations)) return

  for (const operation of operations) {
    try {
      switch (operation.op) {
        // 重置整个画布
        case 'reset': {
          store.resetComs()
          break
        }
        // 在末尾追加一个题目组件
        case 'addCom': {
          store.addCom(operation.material as Material)
          break
        }
        // 设置文本（标题/描述/标题颜色/描述颜色）
        case 'setText': {
          const com = store.coms[operation.index]
          if (!com) break
          const target = com.status[operation.field]
          if (!target) break
          if (operation.field === 'titleColor' || operation.field === 'descColor') {
            // 颜色字段调用 setColor
            store.setColor(target as TextProps, operation.value)
          } else {
            // title / desc 调用 setTextStatus
            store.setTextStatus(target as TextProps, operation.value)
          }
          break
        }
        // 给指定题目新增一个选项
        case 'addOption': {
          const com = store.coms[operation.index]
          if (!com || !com.status.options) break
          store.addOption(com.status.options as OptionsProps)
          break
        }
        // 删除指定题目的某个选项
        case 'removeOption': {
          const com = store.coms[operation.index]
          if (!com || !com.status.options) break
          store.removeOption(com.status.options as OptionsProps, operation.optionIndex)
          break
        }
        // 修改指定题目某个选项的文本（无现成 action，直接操作字符串数组）
        case 'setOptionText': {
          const com = store.coms[operation.index]
          if (!com || !com.status.options) break
          const options = com.status.options as OptionsProps
          if (Array.isArray(options.status) && typeof options.status[operation.optionIndex] === 'string') {
            ;(options.status as string[])[operation.optionIndex] = operation.value
          }
          break
        }
        // 设置下拉/枚举型字段的 currentStatus（对齐/字号/粗细/斜体/类型等）
        case 'setSelect': {
          const com = store.coms[operation.index]
          if (!com) break
          const target = com.status[operation.field]
          if (!target) break
          store.setCurrentStatus(target as OptionsProps, operation.value)
          break
        }
        // 删除指定题目
        case 'removeCom': {
          if (!store.coms[operation.index]) break
          store.removeCom(operation.index)
          break
        }
        default: {
          console.warn('未知的 AI 操作指令：', operation)
        }
      }
    } catch (err) {
      // 单条指令执行失败时跳过，避免整体中断
      console.warn('执行 AI 操作指令失败，已跳过：', operation, err)
    }
  }
}

// 把当前 store.coms 转成精简摘要字符串，供请求 /api/ai/survey 时传 currentSummary
// 每行格式：`index] name: 标题文本`
export function buildCurrentSummary(coms: Status[]): string {
  if (!Array.isArray(coms)) return ''
  return coms
    .map((com, index) => {
      const titleProp = com?.status?.title as TextProps | undefined
      const title = titleProp && typeof titleProp.status === 'string' ? titleProp.status : ''
      return `${index}] ${com?.name ?? ''}: ${title}`
    })
    .join('\n')
}
