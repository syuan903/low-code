<template>
  <div key="id">
    <div class="mb-10">描述内容</div>
    <el-input
      placeholder="请输入题目描述"
      v-model="text"
      @update:modelValue="inputHandle"
      type="textarea"
      :rows="5"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue'
import type { VuecomType ,UpdateStatus} from '@/types'
const props = defineProps<{
  status: string
  isShow: boolean
  configKey: string
  editCom: VuecomType
  id: string
}>()

const text = ref(props.status)
const updateStatus = inject<UpdateStatus>('updateStatus')

function inputHandle(newVal: string) {
  if (updateStatus) updateStatus(props.configKey, newVal)
}
</script>
