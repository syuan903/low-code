<template>
  <div>
    <div
      class="survey-com-item-container pointer flex justify-content-center align-items-center self-center pl-5 pr-5 mb-10" @click="addSurveyCom"
    >
      {{ item.comName }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditorStore } from '@/stores/useEditor';
import { emitter } from '@/utils';
const props=defineProps(['item']);
const editorStore=useEditorStore();
const addSurveyCom=()=>{
  editorStore.addCom(props.item.materialName);
  emitter.emit('scrollToBottom');
}
</script>

<style scoped lang="scss">
.survey-com-item-container {
  width: 70px;
  height: 30px;
  background-color: var(--background-color);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-base);
  color: var(--font-color-light);
  user-select: none;
}
.survey-com-item-container:hover {
  background-color: var(--font-color-lightest);
}
</style>
