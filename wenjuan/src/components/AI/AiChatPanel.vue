<template>
  <!-- Aime 风格聊天面板（右侧抽屉，撑满全高） -->
  <div class="ai-chat-panel">
    <!-- 顶部标题栏：极简白底 -->
    <div class="ai-chat-header">
      <div class="ai-chat-header-left">
        <span class="ai-chat-logo">
          <el-icon><MagicStick /></el-icon>
        </span>
        <span class="ai-chat-title">{{ title }}</span>
      </div>
      <el-icon class="ai-chat-close" @click="emit('close')"><Close /></el-icon>
    </div>

    <!-- 中间消息滚动区 -->
    <div ref="scrollRef" class="ai-chat-body">
      <!-- 空态引导 -->
      <div v-if="!messages.length && !loading" class="ai-chat-empty">
        <span class="ai-chat-empty-icon">
          <el-icon><MagicStick /></el-icon>
        </span>
        <p class="ai-chat-empty-text">你好，我是你的 AI 助手</p>
        <p class="ai-chat-empty-sub">{{ placeholder || '把你的想法告诉我吧～' }}</p>
      </div>

      <div
        v-for="(msg, index) in messages"
        :key="index"
        class="ai-chat-row"
        :class="msg.role === 'user' ? 'is-user' : 'is-assistant'"
      >
        <!-- AI：无气泡，纯文本平铺，带小标识 -->
        <template v-if="msg.role === 'assistant'">
          <div class="ai-chat-name">
            <span class="ai-chat-avatar">
              <el-icon><MagicStick /></el-icon>
            </span>
            <span>AI 助手</span>
          </div>
          <div class="ai-chat-text">{{ msg.content }}</div>
        </template>
        <!-- 用户：浅灰圆角气泡靠右 -->
        <div v-else class="ai-chat-bubble">{{ msg.content }}</div>
      </div>

      <!-- 加载态：思考中 -->
      <div v-if="loading" class="ai-chat-row is-assistant">
        <div class="ai-chat-name">
          <span class="ai-chat-avatar">
            <el-icon><MagicStick /></el-icon>
          </span>
          <span>AI 助手</span>
        </div>
        <div class="ai-chat-thinking">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </div>
    </div>

    <!-- 底部输入区：大圆角卡片 + 深色圆形发送按钮 -->
    <div class="ai-chat-footer">
      <div class="ai-chat-input-wrap">
        <el-input
          v-model="inputText"
          type="textarea"
          :autosize="{ minRows: 1, maxRows: 6 }"
          resize="none"
          :placeholder="placeholder || '请输入内容…'"
          @keydown.enter="onEnter"
        />
        <div class="ai-chat-input-bar">
          <span class="ai-chat-tip">Enter 发送 · Shift + Enter 换行</span>
          <button
            class="ai-chat-send"
            :disabled="loading || !inputText.trim()"
            @click="onSend"
          >
            <el-icon><Top /></el-icon>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { Close, MagicStick, Top } from '@element-plus/icons-vue'
import type { ChatMessage } from '@/types'

// 受控组件：仅展示与事件上抛，内部不发请求
const props = defineProps<{
  title: string
  messages: ChatMessage[]
  loading: boolean
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'send', text: string): void
  (e: 'close'): void
}>()

const inputText = ref('')
const scrollRef = ref<HTMLElement | null>(null)

// 发送消息
const onSend = () => {
  const text = inputText.value.trim()
  if (!text || props.loading) return
  emit('send', text)
  inputText.value = ''
}

// 回车发送、shift+回车换行
const onEnter = (e: KeyboardEvent) => {
  if (e.shiftKey) return
  e.preventDefault()
  onSend()
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (scrollRef.value) {
      scrollRef.value.scrollTop = scrollRef.value.scrollHeight
    }
  })
}

// 新消息或加载态变化时自动滚动到底部
watch(
  () => [props.messages.length, props.loading],
  () => scrollToBottom(),
  { immediate: true }
)
</script>

<style scoped lang="scss">
.ai-chat-panel {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: var(--white);
  overflow: hidden;
}

/* 顶部标题栏：极简白底 + 细分割线 */
.ai-chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 18px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--white);
  flex-shrink: 0;
}
.ai-chat-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.ai-chat-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background-color: var(--font-color);
  color: var(--white);
  font-size: 15px;
}
.ai-chat-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--font-color);
}
.ai-chat-close {
  cursor: pointer;
  font-size: 18px;
  padding: 5px;
  border-radius: 6px;
  color: var(--font-color-lighter);
  transition: background-color 0.2s, color 0.2s;
  &:hover {
    background-color: var(--background-color);
    color: var(--font-color);
  }
}

/* 消息滚动区 */
.ai-chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: var(--white);
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--font-color-lightest);
    border-radius: 3px;
  }
}

/* 空态 */
.ai-chat-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--font-color-lighter);
  text-align: center;
}
.ai-chat-empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background-color: var(--font-color);
  color: var(--white);
  font-size: 24px;
  margin-bottom: 16px;
}
.ai-chat-empty-text {
  font-size: 15px;
  font-weight: 600;
  color: var(--font-color);
  margin: 0 0 6px;
}
.ai-chat-empty-sub {
  font-size: 13px;
  margin: 0;
  max-width: 240px;
  line-height: 1.6;
}

/* 消息行 */
.ai-chat-row {
  display: flex;
  flex-direction: column;
  margin-bottom: 22px;
}
.ai-chat-row.is-user {
  align-items: flex-end;
}
.ai-chat-row.is-assistant {
  align-items: flex-start;
}

/* AI 标识行 */
.ai-chat-name {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--font-color-light);
}
.ai-chat-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 7px;
  background-color: var(--font-color);
  color: var(--white);
  font-size: 13px;
}

/* AI 回复：无气泡，纯文本平铺 */
.ai-chat-text {
  width: 100%;
  font-size: 14px;
  line-height: 1.75;
  color: var(--font-color);
  white-space: pre-wrap;
  word-break: break-word;
  padding-left: 32px;
}

/* 用户气泡：浅灰圆角 */
.ai-chat-bubble {
  max-width: 82%;
  padding: 10px 14px;
  border-radius: 16px;
  border-bottom-right-radius: 4px;
  background-color: var(--background-color);
  color: var(--font-color);
  font-size: 14px;
  line-height: 1.65;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 思考中 loading 点动画 */
.ai-chat-thinking {
  display: flex;
  align-items: center;
  gap: 5px;
  padding-left: 32px;
}
.ai-chat-thinking .dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: var(--font-color-lighter);
  animation: ai-blink 1.2s infinite both;
}
.ai-chat-thinking .dot:nth-child(2) {
  animation-delay: 0.2s;
}
.ai-chat-thinking .dot:nth-child(3) {
  animation-delay: 0.4s;
}
@keyframes ai-blink {
  0%,
  80%,
  100% {
    opacity: 0.3;
    transform: scale(0.85);
  }
  40% {
    opacity: 1;
    transform: scale(1);
  }
}

/* 底部输入区：大圆角卡片 */
.ai-chat-footer {
  padding: 12px 16px 16px;
  background-color: var(--white);
  flex-shrink: 0;
}
.ai-chat-input-wrap {
  padding: 10px 12px 10px;
  border: 1px solid var(--border-color);
  border-radius: 18px;
  background-color: var(--white);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  transition: border-color 0.2s, box-shadow 0.2s;
  &:focus-within {
    border-color: var(--font-color-lighter);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }
}
.ai-chat-input-wrap :deep(.el-textarea__inner) {
  background-color: transparent;
  border: none;
  box-shadow: none;
  padding: 2px 2px 0;
  font-size: 14px;
  line-height: 1.6;
}
.ai-chat-input-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
}
.ai-chat-tip {
  font-size: 12px;
  color: var(--font-color-lighter);
}
/* 发送按钮：深色圆形 */
.ai-chat-send {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background-color: var(--font-color);
  color: var(--white);
  font-size: 16px;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s, background-color 0.2s;
  &:hover:not(:disabled) {
    opacity: 0.85;
  }
  &:active:not(:disabled) {
    transform: scale(0.92);
  }
  &:disabled {
    background-color: var(--font-color-lightest);
    cursor: not-allowed;
  }
}
</style>
