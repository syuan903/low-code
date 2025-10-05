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
    <el-date-picker
      v-model="datetimeValue"
      :type="computedState.type?.value"
      placeholder="请选择日期"
      @change="updateAnswer"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  getTextStatus,
  getStringStatusByCurrentStatus,
  getCurrentStatus,
  getValueStatusByCurrentStatus,
} from '@/utils'
import MaterialsHeader from '@/components/SurveyComs/Common/MetarialHeader.vue'
// 类型
import type { TypeStatus } from '@/types'
const props = defineProps<{
  status: TypeStatus
  serialNum: number
}>()
const datetimeValue = ref<Date>(new Date())
const computedState = computed(() => ({
  title: getTextStatus(props.status.title),
  desc: getTextStatus(props.status.desc),
  position: getCurrentStatus(props.status.position),
  type: getValueStatusByCurrentStatus(props.status.type),
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
  (e: 'updateAnswer', value: Date): void
}>()
const updateAnswer = () => {
  // 这里需要将答案传递给父组件
  // 通过自定义事件的形式
  // 传递的内容是当前选中的值
  emit('updateAnswer', datetimeValue.value)
}
</script>

<style scoped lang="scss"></style>
