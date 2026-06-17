<template>
  <div>
    <div class="header">
      <Header :isEditor="true" :id="Number(id)" :loading="isLoadingSurvey"/>
    </div>
    <!-- 编辑器主体区域 -->
    <div class="container">
      <LeftSide />
      <RightSide />
    </div>
    <div>
      <Center />
    </div>

    <!-- AI 助手右侧抽屉 -->
    <transition name="ai-fade">
      <div v-if="aiVisible" class="ai-drawer-mask" @click="aiVisible = false"></div>
    </transition>
    <transition name="ai-slide">
      <AiChatPanel
        v-if="aiVisible"
        class="ai-drawer"
        title="AI 问卷助手"
        :messages="aiMessages"
        :loading="aiLoading"
        placeholder="描述你想要的问卷或修改…"
        @send="handleSend"
        @close="aiVisible = false"
      />
    </transition>
    <!-- 右下角悬浮唤起按钮 -->
    <button class="ai-float-btn" title="AI 问卷助手" @click="aiVisible = !aiVisible">
      <el-icon><ChatDotRound /></el-icon>
    </button>
  </div>
</template>

<script setup lang="ts">
import Header from '@/components/Common/Header.vue';
import LeftSide from '@/views/EditorView/LeftSide/Index.vue';
import Center from '@/views/EditorView/Center.vue';
import RightSide from '@/views/EditorView/RightSide.vue';
import { restoreComponentStatus } from '@/utils';
import { componentMap } from '@/configs/compontentMap';
import {computed, ref} from 'vue';
import { ElMessage } from 'element-plus';
import type { SurveyDBReturnData,EditorStore, ChatMessage} from '@/types';
import { useUpdateStatus, applyOperations, buildCurrentSummary } from "@/utils";
import AiChatPanel from '@/components/AI/AiChatPanel.vue';
import { ChatDotRound } from '@element-plus/icons-vue';

// 路由
import { useRoute } from 'vue-router';
const route = useRoute();
// 仓库
import { useEditorStore } from '@/stores/useEditor';
const store = useEditorStore()as unknown as EditorStore;
store.resetComs();

const currentCom = computed(() => store.coms[store.currentComponentIndex]);
useUpdateStatus(store,currentCom)

const id = computed(() => (route.params.id ? route.params.id : ''));
const isLoadingSurvey = ref(Boolean(id.value));
if (id.value) {
  store.getCurComs(Number(id.value))
    .then((res) => {
      if (res) {
        restoreComponentStatus(res.coms, componentMap);
        store.setStore(res as SurveyDBReturnData);
      }
    })
    .catch(() => {
      ElMessage.error('问卷加载失败，请稍后重试');
    })
    .finally(() => {
      isLoadingSurvey.value = false;
    });
}

// ===== AI 问卷助手 =====
const aiVisible = ref(false); // 面板显隐
const aiLoading = ref(false); // 请求中
const aiMessages = ref<ChatMessage[]>([]); // 对话消息列表

// 发送消息：调用 /api/ai/survey，拿到 operations 后逐条执行到画布
const handleSend = async (text: string) => {
  aiMessages.value.push({ role: 'user', content: text });
  aiLoading.value = true;
  // 历史消息（不含本轮，已在上面 push）
  const history = aiMessages.value.slice(0, -1).map((m) => ({ role: m.role, content: m.content }));
  try {
    const resp = await fetch('/api/ai/survey', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentSummary: buildCurrentSummary(store.coms),
        message: text,
        history,
      }),
    });
    const data = await resp.json();
    if (Array.isArray(data.operations) && data.operations.length) {
      if (data.operations.some((operation: { op?: string }) => operation?.op === 'reset')) {
        ElMessage.warning('AI 建议清空问卷，已跳过自动清空；如需重置请使用顶部按钮确认操作');
      }
      applyOperations(data.operations);
    }
    aiMessages.value.push({ role: 'assistant', content: data.reply || '已处理完成。' });
  } catch (err) {
    aiMessages.value.push({ role: 'assistant', content: '抱歉，AI 服务暂时不可用，请稍后再试。' });
  } finally {
    aiLoading.value = false;
  }
};
</script>

<style scoped lang="scss">
.header {
  width: 100%;
  background-color: var(--white);
  position: fixed;
  top: 0;
  z-index: 10;
}
.container {
  width: calc(100vw - 40px);
  padding: 20px;
  // Header的高度50px，上下padding 20px
  height: calc(100vh - 50px - 40px);
  background: url('@/assets/img/editor_background.png');
  position: fixed;
  top: 50px;
}
// AI 助手悬浮唤起按钮
.ai-float-btn {
  position: fixed;
  right: 30px;
  bottom: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color), #6cb4ff);
  color: var(--white);
  font-size: 24px;
  cursor: pointer;
  z-index: 2000;
  box-shadow: 0 6px 18px rgba(64, 158, 255, 0.4);
  transition: transform 0.2s, box-shadow 0.2s;
  &:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 10px 24px rgba(64, 158, 255, 0.5);
  }
  &:active {
    transform: scale(0.96);
  }
}
// AI 助手抽屉遮罩
.ai-drawer-mask {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.35);
  z-index: 2000;
}
// AI 助手右侧全高抽屉
.ai-drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 420px;
  max-width: 90vw;
  height: 100vh;
  z-index: 2001;
  box-shadow: -8px 0 28px rgba(0, 0, 0, 0.18);
}
// 遮罩淡入淡出
.ai-fade-enter-active,
.ai-fade-leave-active {
  transition: opacity 0.28s ease;
}
.ai-fade-enter-from,
.ai-fade-leave-to {
  opacity: 0;
}
// 抽屉滑入滑出
.ai-slide-enter-active,
.ai-slide-leave-active {
  transition: transform 0.32s cubic-bezier(0.22, 0.61, 0.36, 1);
}
.ai-slide-enter-from,
.ai-slide-leave-to {
  transform: translateX(100%);
}
</style>
