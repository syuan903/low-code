<template>
  <ButtonGroup :title="`${configKey === 'titleColor' ? '标题' : '描述'}颜色`" :status="status">
    <el-color-picker v-model="color" @change="changeColor" />
  </ButtonGroup>
</template>

<script setup lang="ts">
import { inject, ref } from 'vue'
import ButtonGroup from './ButtonGroup.vue'
import type { VuecomType ,UpdateStatus} from '@/types'
const props = defineProps<{
  status: string
  isShow: boolean
  configKey: string
  editCom: VuecomType
}>()
const color = ref(props.status)
const updateStatus = inject<UpdateStatus>('updateStatus')
const changeColor = (color: string) => {
  if (updateStatus) updateStatus(props.configKey, color)
}
</script>

<style scoped></style>
