<template>
  <div key="id">
    <div class="flex align-items-center mb-10">
      <div class="mr-10">辅助文字</div>
      <el-switch :model-value="isUse" @change="switchChangeHandle" />
    </div>
    <div v-if="isUse">
      <el-input
        v-for="(_, index) in status"
        :key="index"
        class="mt-5 mb-5"
        placeholder="辅助文字"
        v-model="textArr[index]"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { VuecomType, StringStatusArr } from '@/types'
import { inject, ref } from 'vue'
const props = defineProps<{
  currentStatus: number
  status: StringStatusArr
  isShow: boolean
  isUse: boolean
  configKey: string
  editCom: VuecomType
  id: string
}>()
// 定义类型
import type { UpdateStatus } from '@/types'

// 注入 updateStatus
const updateStatus = inject<UpdateStatus>('updateStatus')

const textArr = ref(props.status)

function switchChangeHandle(val: boolean) {
  if (updateStatus) {
    updateStatus(props.configKey, val)
  }
}
// function inputHandle(val: string, index: number) {
//   if (updateStatus) {
//     updateStatus(props.configKey, { , index })
//   }
// }
</script>

<style scoped></style>
