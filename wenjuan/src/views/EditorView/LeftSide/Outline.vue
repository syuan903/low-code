<template>
  <div v-if="store.surveyCount">
    <draggable v-model="store.coms" item-key="id" @start="">
      <template #item="{ element, index }">
        <div
          class="mb-10"
          v-show="isSurveyComName(element.name)"
          @click="clickHandle(index)"
          :class="{
            active: store.currentComponentIndex === index,
          }"
        >
          <div class="item">
            {{ surveyNums[index] }}.
            {{ element.status.title.status }}
          </div>
        </div>
      </template>
    </draggable>
  </div>
  <div v-else class="tip flex align-items-center justify-content-center">请添加题目</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
// 拖动组件
import draggable from 'vuedraggable';
import { isSurveyComName } from '@/types';
import { useEditorStore } from '@/stores/useEditor';
import { useSurveyNums , emitter} from "@/utils";

const store = useEditorStore();
const surveyNums = computed(() => useSurveyNums(store.coms).value);

const clickHandle = (index: number) => {
  if (store.currentComponentIndex === index) {
    store.setCurrentComponentIndex(-1);
  } else {
    store.setCurrentComponentIndex(index);
    emitter.emit('scrollToCenter', index);
  }
};

</script>

<style scoped>
.item {
  /* outline: 1px solid black; */
  color: var(--font-color-light);
  font-size: var(--font-size-base);
  padding: 10px;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tip {
  height: calc(100% - 50px);
}
.active {
  transform: scale(1.04);
  transition: 0.5s;
  background-color: var(--border-color);
  border-radius: var(--border-radius-lg);
}
</style>
