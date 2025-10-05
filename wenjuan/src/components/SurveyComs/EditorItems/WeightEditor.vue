<template>
  <ButtonGroup :title="`${configKey === 'titleWeight' ? '标题' : '描述'}粗细`" :status="status[currentStatus]">
    <el-button-group>
      <el-button
        :class="{
          select: currentStatus === 0,
        }"
        @click="changeWeight(0)"
      >
        <font-awesome-icon icon="fa-solid fa-bold" size="lg" />
      </el-button>
      <el-button
        :class="{
          select: currentStatus === 1,
        }"
        @click="changeWeight(1)"
      >
        <font-awesome-icon icon="fa-solid fa-bold" size="sm" />
      </el-button>
    </el-button-group>
  </ButtonGroup>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import ButtonGroup from './ButtonGroup.vue'
import type { VuecomType ,UpdateStatus} from '@/types'
const props = defineProps<{
  currentStatus: number
  status: string[]
  isShow: boolean
  configKey: string
  editCom: VuecomType
}>()
const updateStatus = inject<UpdateStatus>('updateStatus')
const changeWeight = (weight: number) => {
  if (updateStatus) updateStatus(props.configKey, weight)
}
</script>

<style scoped></style>
