<template>
  <div
    :class="{
      'text-center': computedState.position,
    }"
  >
    <MaterialsHeader
      :serialNum="serialNum"
      :title="computedState.title"
      :titleSize="computedState.titleSize"
      :titleWeight="computedState.titleWeight"
      :titleItalic="computedState.titleItalic"
      :titleColor="computedState.titleColor"
      :desc="computedState.desc"
      :descSize="computedState.descSize"
      :descWeight="computedState.descWeight"
      :descItalic="computedState.descItalic"
      :descColor="computedState.descColor"
    />
    <el-rate
      v-model="rateValue"
      :texts="computedState.options"
      :show-text="status?.options?.isUse"
      size="large"
      allow-half
      clearable
      @change="updateAnswer"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  getTextStatus,
  getStringStatusByCurrentStatus,
  getCurrentStatus,
  getStringStatus,
} from '@/utils'
import MaterialsHeader from '@/components/SurveyComs/Common/MetarialHeader.vue'
// 类型
import type { OptionsStatus } from '@/types'
const props = defineProps<{
  status: OptionsStatus
  serialNum: number
}>()
const rateValue = ref<number>(3)

const computedState = computed(() => ({
  title: getTextStatus(props.status.title),
  desc: getTextStatus(props.status.desc),
  options: getStringStatus(props.status.options),
  position: getCurrentStatus(props.status.position),
  titleSize: getStringStatusByCurrentStatus(props.status.titleSize),
  descSize: getStringStatusByCurrentStatus(props.status.descSize),
  titleWeight: getCurrentStatus(props.status.titleWeight),
  descWeight: getCurrentStatus(props.status.descWeight),
  titleItalic: getCurrentStatus(props.status.titleItalic),
  descItalic: getCurrentStatus(props.status.descItalic),
  titleColor: getTextStatus(props.status.titleColor),
  descColor: getTextStatus(props.status.descColor),
}))
const emit = defineEmits<{
  (e: 'updateAnswer', value: number): void
}>()
const updateAnswer = () => {
  // 这里需要将答案传递给父组件
  // 通过自定义事件的形式
  // 传递的内容是当前选中的值
  emit('updateAnswer', rateValue.value)
}
</script>

<style scoped lang="scss"></style>
