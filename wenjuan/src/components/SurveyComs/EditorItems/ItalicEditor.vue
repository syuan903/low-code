<template>
  <ButtonGroup :title="`${configKey === 'titleItalic' ? '标题' : '描述'}倾斜`" :status="status[currentStatus]">
    <el-button-group>
      <el-button
        :class="{
          select: currentStatus === 0,
        }"
        @click="changeItalic(0)"
      >
        <font-awesome-icon icon="fa-solid fa-italic" size="lg" />
      </el-button>
      <el-button
        :class="{
          select: currentStatus === 1,
        }"
        @click="changeItalic(1)"
      >
        <font-awesome-icon icon="fa-solid fa-italic" size="sm" />
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
const changeItalic = (italic: number) => {
  if (updateStatus) updateStatus(props.configKey, italic)
}
</script>

<style scoped></style>
