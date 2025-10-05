<template>
  <div class="layout-container flex">
    <!-- 选择具体的业务组件 -->
    <div class="left flex wrap space-between">
      <slot />
    </div>
    <!-- 显示对应的业务组件 -->
    <div class="center">
      <router-view v-slot="{ Component }">
        <component :is="Component" :serialNum="1" :status="currentCom.status" />
      </router-view>
    </div>
    <!-- 编辑面板 -->
    <div class="right">
      <EditPannel :com="currentCom" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useMetarialStore } from '@/stores/useMetarial'
import { computed, provide } from 'vue'
import EditPannel from '@/components/SurveyComs/EditorItems/EditPannel.vue'
// import { ElMessage } from 'element-plus'
// import { isPicLink } from '@/types'
// import type { PicLink ,MaterialStore} from '@/types'
// import { isOptionsStatus,isTypeStatus,changeEditorIsShowStatus ,changeEditorIsUseStatus} from '@/utils'
import { useUpdateStatus } from "@/utils";
import type { MaterialStore } from '@/types';

const store = useMetarialStore() as unknown as MaterialStore

const currentCom = computed(() => store.coms[store.currentMaterialCom])

useUpdateStatus(store,currentCom)

</script>

<style scoped lang="scss">
.layout-container {
  width: 100%;
  // Header组件高度50px，h1高度50px，上下margin 20px，最后20px是额外多减去一部分，避免贴底
  height: calc(100vh - 100px - 40px - 20px);
  align-items: flex-start;
  border: 1px solid var(--border-color);
  border-top-right-radius: var(--border-radius-lg);
  border-bottom-left-radius: var(--border-radius-lg);
  border-bottom-right-radius: var(--border-radius-lg);
}
.left {
  width: 210px;
  text-align: center;
  align-items: flex-start;
  box-sizing: border-box;
  padding: 20px;
}
.center {
  width: 580px;
  // 多减去的40px是上下的padding，，最后20px是额外多减去一部分，避免贴底
  box-sizing: border-box;
  height: calc(100vh - 100px - 40px - 20px);
  overflow-y: scroll;
  padding: 30px;
  border-left: 1px solid var(--border-color);
}
.right {
  width: 330px;
  box-sizing: border-box;
  height: calc(100vh - 100px - 40px - 20px);
  overflow-y: scroll;
  border-left: 1px solid var(--border-color);
}
</style>
