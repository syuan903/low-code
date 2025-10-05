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
    <el-checkbox-group v-model="checkboxValue" @click.stop @change="updateAnswer">
      <el-checkbox
        v-for="(item, index) in computedState.options"
        :value="item"
        :key="index"
        :label="item"
      />
    </el-checkbox-group>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  getTextStatus,
  getStringStatus,
  getStringStatusByCurrentStatus,
  getCurrentStatus,
} from '@/utils'
import MaterialsHeader from '@/components/SurveyComs/Common/MetarialHeader.vue'
// 类型
import type { OptionsStatus } from '@/types'
const props = defineProps<{
  status: OptionsStatus
  serialNum: number
}>()
const checkboxValue = ref<string[]>([])
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
  (e: 'updateAnswer', value: string[]): void
}>()
const updateAnswer = () => {
  // 这里需要将答案传递给父组件
  // 通过自定义事件的形式
  // 传递的内容是当前选中的值
  emit('updateAnswer', checkboxValue.value)
}
</script>

<style scoped></style>
