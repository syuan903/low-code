<template>
  <div :class="{ 'text-center': computedState.position }">
    <MetarialHeader
      :serialNum="serialNum"
      :title="computedState.title"
      :desc="computedState.desc"
      :titleSize="computedState.titleSize"
      :descSize="computedState.descSize"
      :titleWeight="computedState.titleWeight"
      :descWeight="computedState.descWeight"
      :titleItalic="computedState.titleItalic"
      :descItalic="computedState.descItalic"
      :titleColor="computedState.titleColor"
      :descColor="computedState.descColor"
    />
    <div class="radio-group">
      <el-select v-model="optionValue" placeholder="请选择" style="width: 240px" @click.stop @change="updateAnswer">
    <el-option
      v-for="(item,index) in computedState.options"
      :key="index"
      :label="item"
      :value="item"
    />
  </el-select>
    </div>
  </div>
</template>

<script setup lang="ts">
import MetarialHeader from '@/components/SurveyComs/Common/MetarialHeader.vue'
import { computed ,ref} from 'vue'
import type { OptionsStatus } from '@/types'
import {
  getTextStatus,
  getStringStatus,
  getCurrentStatus,
  getStringStatusByCurrentStatus,
} from '@/utils'

const props = defineProps<{
  serialNum: number
  status: OptionsStatus
}>()
const optionValue = ref<string>('')
const computedState = computed(() => ({
  title: getTextStatus(props.status.title),
  desc: getTextStatus(props.status.desc),
  options: getStringStatus(props.status.options),
  position: getCurrentStatus(props.status.position),
  titleSize: <string>getStringStatusByCurrentStatus(props.status.titleSize),
  descSize: <string>getStringStatusByCurrentStatus(props.status.descSize),
  titleWeight: getCurrentStatus(props.status.titleWeight),
  descWeight: getCurrentStatus(props.status.descWeight),
  titleItalic: getCurrentStatus(props.status.titleItalic),
  descItalic: getCurrentStatus(props.status.descItalic),
  titleColor: getTextStatus(props.status.titleColor),
  descColor: getTextStatus(props.status.descColor),
}))
const emit = defineEmits<{
  (e: 'updateAnswer', value: string): void
}>()
const updateAnswer = () => {
  // 这里需要将答案传递给父组件
  // 通过自定义事件的形式
  // 传递的内容是当前选中的值
  emit('updateAnswer', optionValue.value)
}
</script>

<style scoped></style>
