<template>
  <div class="right-side-container">
    <div
      v-if="store.currentComponentIndex === -1"
      class="content flex justify-content-center align-items-center"
    >
      点击题型进行编辑
    </div>
    <div v-else>
      <EditPannel :com="currentCom" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, provide } from 'vue';
// 仓库
import { useEditorStore } from '@/stores/useEditor';
import EditPannel from '@/components/SurveyComs/EditorItems/EditPannel.vue';
// import { ElMessage } from 'element-plus'
// import { isPicLink } from '@/types'
// import type { PicLink} from '@/types'
// import { isOptionsStatus,isTypeStatus,changeEditorIsShowStatus ,changeEditorIsUseStatus} from '@/utils'
import type { EditorStore } from '@/types';

const store = useEditorStore() as unknown as EditorStore;

const currentCom = computed(() => store.coms[store.currentComponentIndex]);

// const updateStatus = (configKey: string, payload?: string | number | boolean | object) => {
//   switch (configKey) {
//     case 'type':{
//       if(isTypeStatus(currentCom.value.status)){
//       if (typeof payload !== 'number')
//         console.error('Invalid payload type for "type". Expected number.')
//       changeEditorIsShowStatus(currentCom.value.status, <number>payload)
//       store.setCurrentStatus(currentCom.value.status[configKey], <number>payload)
//     }
//       break
//  }
//     case 'title':
//     case 'desc': {
//       if (typeof payload !== 'string')
//         console.error('Invalid payload type for "title or desc". Expected string.')

//       store.setTextStatus(currentCom.value.status[configKey], <string>payload)
//       break
//     }
//     case 'options': {
//       if(isOptionsStatus(currentCom.value.status)){
//       if (payload === undefined) {
//         // 添加选项
//         store.addOption(currentCom.value.status.options)
//       } else if (typeof payload === 'number') {
//         // 删除选项
//         const result = store.removeOption(currentCom.value.status.options, payload)
//         if (result)
//           ElMessage.success({
//             message: '删除成功',
//             type: 'success',
//             showClose: true,
//             grouping: true,
//           })
//         else
//           ElMessage.error({
//             message: '至少保留一个选项',
//             type: 'error',
//             showClose: true,
//             grouping: true,
//           })
//       }else if (typeof payload === 'object' && isPicLink(payload)) {
//         // 修改选项
//         store.setPicLinkByIndex(currentCom.value.status.options, <PicLink>payload)
//       }else if(typeof payload === 'boolean'){
//         // 是否启用选项
//         changeEditorIsUseStatus(currentCom.value.status, <boolean>payload)
//       }
//       else {
//         console.error('Invalid payload for "options". Expected undefined or number.')
//       }
//       break}
//     }
//     case 'position': {
//       if (typeof payload !== 'number')
//         console.error('Invalid payload type for "position". Expected number.')
//       store.setPosition(currentCom.value.status.position, <number>payload)
//       break
//     }
//     case 'titleSize':
//     case 'descSize': {
//       if (typeof payload !== 'number')
//         console.error('Invalid payload type for "titleSize or descSize". Expected number.')
//       store.setCurrentStatus(currentCom.value.status[configKey], <number>payload)
//       break
//     }
//     case 'titleWeight':
//     case 'descWeight': {
//       if (typeof payload !== 'number')
//         console.error('Invalid payload type for "titleWeight or descWeight". Expected number.')
//       store.setWeight(currentCom.value.status[configKey], <number>payload)
//       break
//     }
//     case 'titleItalic':
//     case 'descItalic': {
//       if (typeof payload !== 'number')
//         console.error('Invalid payload type for "titleItalic or descItalic". Expected number.')
//       store.setItalic(currentCom.value.status[configKey], <number>payload)
//       break
//     }
//     case 'titleColor':
//     case 'descColor': {
//       if (typeof payload !== 'string')
//         console.error('Invalid payload type for "titleColor or descColor". Expected string.')
//       store.setColor(currentCom.value.status[configKey], <string>payload)
//       break
//     }
//   }
// }

// provide('updateStatus', updateStatus);


</script>

<style scoped lang="scss">
.right-side-container {
  width: 320px;
  height: calc(100vh - 50px - 40px);
  position: fixed;
  right: 20px;
  top: 70px;
  background-color: var(--white);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  overflow-y: scroll;
}
.content {
  height: 100%;
}
</style>
