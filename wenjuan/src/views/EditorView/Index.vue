<template>
  <div>
    <div class="header">
      <Header :isEditor="true" :id="Number(id)" :disabled="isLoading"/>
    </div>
    <!-- 编辑器主体区域 -->
    <div class="container">
      <LeftSide />
      <RightSide />
    </div>
    <div>
      <Center />
    </div>
  </div>
</template>

<script setup lang="ts">
import Header from '@/components/Common/Header.vue';
import LeftSide from '@/views/EditorView/LeftSide/Index.vue';
import Center from '@/views/EditorView/Center.vue';
import RightSide from '@/views/EditorView/RightSide.vue';
import { restoreComponentStatus } from '@/utils';
import { componentMap } from '@/configs/compontentMap';
import {computed, ref, watch} from 'vue';
import type { SurveyDBReturnData,EditorStore} from '@/types';
import { useUpdateStatus } from "@/utils";

// 路由
import { useRoute } from 'vue-router';
const route = useRoute();
// 仓库
import { useEditorStore } from '@/stores/useEditor';
const store = useEditorStore()as unknown as EditorStore;

const currentCom = computed(() => store.coms[store.currentComponentIndex]);
useUpdateStatus(store,currentCom)

const id = computed(() => (route.params.id ? route.params.id : ''));
const isLoading = ref(false);

const loadSurvey = async (surveyId: string | string[] | undefined) => {
  const currentId = Array.isArray(surveyId) ? surveyId[0] : surveyId;
  if (!currentId) {
    store.resetComs();
    isLoading.value = false;
    return;
  }

  isLoading.value = true;
  try {
    const res = await store.getCurComs(Number(currentId));
    if (res) {
      restoreComponentStatus(res.coms, componentMap);
      store.setStore(res as SurveyDBReturnData);
    } else {
      store.resetComs();
    }
  } finally {
    isLoading.value = false;
  }
};

watch(
  () => route.params.id,
  (surveyId) => {
    loadSurvey(surveyId as string | string[] | undefined);
  },
  { immediate: true },
);
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
</style>
