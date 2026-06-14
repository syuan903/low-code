<template>
  <div class="preview-container pb-40">
    <div class="center mc">
      <!-- 上面的按钮组 -->
      <div class="button-group flex space-between align-items-center no-print">
        <!-- 左边按钮 -->
        <div class="flex space-between">
          <el-button type="danger" @click="gobackHandle">返回</el-button>
          <el-button type="success" @click="genQuiz">生成在线问卷</el-button>
          <el-button type="warning" @click="genPDF">生成本地PDF</el-button>
          <el-button type="primary" :icon="DataAnalysis" @click="aiVisible = !aiVisible">AI结果分析</el-button>
        </div>
        <!-- 题目数量 -->
        <div class="mr-15">
          <el-text class="mx-1">题目数量：{{ store.surveyCount }}</el-text>
        </div>
      </div>
      <!-- 对应的问卷 -->
      <div class="content-group no-border">
        <div class="content mb-10" v-for="(com, index) in store.coms" :key="index">
          <component :is="com.type" :status="com.status" :serialNum="serialNum[index]" />
        </div>
      </div>
    </div>
  </div>
  <el-dialog v-model="dialogVisible" title="在线问卷" width="500">
    分享链接: <a :href="quizLink" target="_blank">{{ quizLink }}</a>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="copyLink">复制链接</el-button>
      </div>
    </template>
  </el-dialog>

  <!-- AI 结果分析右侧抽屉 -->
  <transition name="ai-fade">
    <div v-if="aiVisible" class="ai-drawer-mask no-print" @click="aiVisible = false"></div>
  </transition>
  <transition name="ai-slide">
    <AiChatPanel
      v-if="aiVisible"
      class="ai-drawer no-print"
      title="AI 结果分析"
      :messages="aiMessages"
      :loading="aiLoading"
      placeholder="询问答卷结果，例如：大家最关注什么？"
      @send="handleAnalyze"
      @close="aiVisible = false"
    />
  </transition>
</template>

<script setup lang="ts">
import { useRoute ,useRouter} from 'vue-router';
const router = useRouter();
const route = useRoute();
import { getSurveyById } from '@/db/operation';
// 仓库
import { useEditorStore } from '@/stores/useEditor';
const store = useEditorStore();
// 工具方法
import { restoreComponentStatus ,useSurveyNums} from '@/utils';
import type { SurveyDBReturnData} from '@/types';
import { isUseForPDF } from "@/types";
import { computed ,ref} from "vue";
import { componentMap } from "@/configs/compontentMap";
import { v4 as uuidv4 } from 'uuid';
import { ElMessage } from 'element-plus';
import AiChatPanel from '@/components/AI/AiChatPanel.vue';
import { DataAnalysis } from '@element-plus/icons-vue';
import type { ChatMessage } from '@/types';

const dialogVisible = ref(false);

// 获取路由参数
const id = Number(route.params.id);
// 接下来应该根据拿到的 id 去获取存储的问卷题目
if (id) {
  getSurveyById(id).then((res) => {
    if (res) {
      // 拿到数据后，组件部分需要重新还原
      restoreComponentStatus(res.coms,componentMap);
      // 还原完成之后，将还原的数据设置为仓库里面的 coms 即可
      store.setStore(res as SurveyDBReturnData);
    }
  });
}

const serialNum = computed(() => useSurveyNums(store.coms).value);


const gobackHandle = () => {
  const path = history.state.from;
  if (path === 'home') {
    // 说明是从首页进来的
    router.back();
  } else {
    // 说明是从编辑页面进来的
    router.push(`/editor/${id}/survey-type`);
  }
};

const quizLink = ref(''); // 存储生成的在线答题的链接

// 生成PDF
const genPDF = () => {
  // 1. 检查：检查当前的问卷是否存在不适合生成PDF的业务组件
  const result = store.coms.every((item) => isUseForPDF(item.name));
  if (!result) {
    ElMessage.warning('当前问卷中存在不支持生成PDF的业务组件，请检查后再试！');
    return;
  }
  // 2. 开始生成PDF
  // 注意：关于生成PDF，解决方案非常的多，可以前端来生成PDF，也可以服务器端来生成PDF
  // 无论是前端还是后端，解决方案都不止一种
  // 因为我们这里生成PDF的需求很简单，所以我们选择使用浏览器的接口来生成PDF
  window.print();
};

// 生成在线问卷
const genQuiz = () => {
  // 1. 首先将问卷的数据传递到服务器端，服务器端存储到内存中
  const id = uuidv4();
  // 将问卷内容和id传递给服务器
  fetch('/api/saveQuiz', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id,
      quizData: {
        coms: JSON.stringify(store.coms),
        surveyCount: store.surveyCount,
      },
    }),
  });
  // 2. 将弹出框显示出来
  quizLink.value = `${window.location.origin}/quiz/${id}`;
  dialogVisible.value = true;
};

// 复制在线答题的链接
const copyLink = () => {
  dialogVisible.value = false;
  navigator.clipboard.writeText(quizLink.value);
  ElMessage.success('在线答题的链接已复制');
};

// ===== AI 结果分析 =====
const aiVisible = ref(false); // 面板显隐
const aiLoading = ref(false); // 请求中
const aiMessages = ref<ChatMessage[]>([]); // 对话消息列表

// 发送分析问题：调用 /api/ai/analyze（基于该问卷答卷的 RAG 分析）
const handleAnalyze = async (text: string) => {
  aiMessages.value.push({ role: 'user', content: text });
  aiLoading.value = true;
  try {
    const resp = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ surveyId: id, question: text }),
    });
    const data = await resp.json();
    aiMessages.value.push({ role: 'assistant', content: data.reply || '暂无分析结果。' });
  } catch (err) {
    aiMessages.value.push({ role: 'assistant', content: '抱歉，分析服务暂时不可用，请稍后再试。' });
  } finally {
    aiLoading.value = false;
  }
};
</script>

<style scoped lang="scss">
.preview-container {
  width: 100vw;
  min-height: 100vh;
  background: url('@/assets/img/editor_background.png');
}
.center {
  width: 800px;
}
.button-group {
  width: 100%;
  height: 60px;
  top: 0;
  left: 0;
  background-color: var(--white);
  z-index: 100;
}
.content-group {
  padding: 20px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  background: var(--white);
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
}
// AI 结果分析抽屉遮罩
.ai-drawer-mask {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.35);
  z-index: 2000;
}
// AI 结果分析右侧全高抽屉
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

@media print {
  .no-print {
    display: none;
  }
  .no-border {
    border: none;
    box-shadow: none;
  }
}
</style>
