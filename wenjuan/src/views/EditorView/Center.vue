<template>
  <div class="center-container" ref="centerContainer" @scroll="emitter.emit('scrollToBottom')">
    <draggable
        v-model="store.coms"
        group="people"
        @start=""
        @end=""
        item-key="id">
      <template #item="{element, index}">
        <div class="content mb-10 relative" :class="{'active': store.currentComponentIndex === index}" @click="handleClick(index)" :ref="el => componentsRefs[index] = el">
          <component :is="element.type" :status="element.status" :serialNum="surveyNums[index]" />
          <!-- 删除按钮 -->
          <div class="absolute delete-btn" v-show="store.currentComponentIndex === index">
            <el-button
              type="danger"
              class="ml-10"
              size="small"
              :icon="Close"
              circle
              @click.stop="removeCom(index)"
            />
          </div>
        </div>
      </template>
    </draggable>
  </div>
</template>

<script setup lang="ts">
import { useEditorStore } from '@/stores/useEditor';
import { nextTick, ref ,computed, type ComponentPublicInstance} from "vue";
const store = useEditorStore();
import { emitter } from '@/utils';
import draggable from 'vuedraggable';
import { useSurveyNums } from "@/utils";
import { Close } from "@element-plus/icons-vue";
const centerContainer = ref<HTMLElement | null>(null);
const scrollToBottom = () => {
  nextTick(()=>{
    if (centerContainer.value) {
    window.scrollTo({
      top: centerContainer.value.scrollHeight,
      behavior: 'smooth'
    });
  }
  })
};
emitter.on('scrollToBottom', scrollToBottom);
// 在组件卸载时移除事件监听器
import { onUnmounted } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
onUnmounted(() => {
  emitter.off('scrollToBottom', scrollToBottom);
});

const handleClick=(index:number)=>{
  if(store.currentComponentIndex===index){
    store.setCurrentComponentIndex(-1);
  }else{
    store.setCurrentComponentIndex(index);
  }
}

const surveyNums = computed(() => useSurveyNums(store.coms).value);

const componentsRefs = ref<(Element | ComponentPublicInstance | null)[]>([]);

const scrollToCenter=(index:number)=>{
  nextTick(()=>{
    const el = componentsRefs.value[index];
    if (el instanceof HTMLElement) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
}

emitter.on('scrollToCenter', scrollToCenter);

const removeCom = (index: number) => {
  ElMessageBox.confirm('确定删除该组件吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      store.removeCom(index);
      store.setCurrentComponentIndex(-1);
      ElMessage.success('删除成功');
    })
    .catch(() => {
      ElMessage.info('已取消删除');
    });
};
</script>

<style scoped lang="scss">
.center-container {
  width: 50%;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  margin: 70px auto;
  padding: 20px;
  background: var(--white);
  position: relative;
  .content {
    cursor: pointer;
    padding: 10px;
    background-color: var(--white);
    border-radius: var(--border-radius-sm);
    &:hover {
      transform: scale(1.01);
      transition: 0.5s;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
  }
}
.active {
  transform: scale(1.01);
  transition: 0.5s;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
.delete-btn {
  right: -5px;
  top: -10px;
}
</style>
