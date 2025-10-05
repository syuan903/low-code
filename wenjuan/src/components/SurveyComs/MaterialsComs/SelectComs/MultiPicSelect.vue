<template>
  <div
    :class="{
      'text-center': computedState.position,
    }"
  >
    <MaterialsHeader
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
    <div class="flex wrap">
      <el-checkbox-group  v-model="ValueList" class="flex wrap" @click.stop @change="updateAnswer">
        <el-checkbox
          v-for="(item, index) in computedState.options"
          class="picOption flex mb-15"
          :value="item.picTitle"
          :key="index"
        >
          <PicItem :key="index" v-bind="{ ...item, index }" />
        </el-checkbox>
      </el-checkbox-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import MaterialsHeader from '@/components/SurveyComs/Common/MetarialHeader.vue';
import PicItem from '@/components/SurveyComs/Common/PicItem.vue';
import type { OptionsStatus } from '@/types';
import {
  getTextStatus,
  getCurrentStatus,
  getStringStatusByCurrentStatus,
  getPicTitleDescStatusArr,
} from '@/utils';
const props = defineProps<{
  serialNum: number;
  status: OptionsStatus;
}>();
const ValueList = ref<string[]>([]);
const computedState = computed(() => ({
  title: getTextStatus(props.status.title),
  desc: getTextStatus(props.status.desc),
  position: getCurrentStatus(props.status.position),
  options: getPicTitleDescStatusArr(props.status.options),
  titleSize: getStringStatusByCurrentStatus(props.status.titleSize),
  descSize: getStringStatusByCurrentStatus(props.status.descSize),
  titleWeight: getCurrentStatus(props.status.titleWeight),
  descWeight: getCurrentStatus(props.status.descWeight),
  titleItalic: getCurrentStatus(props.status.titleItalic),
  descItalic: getCurrentStatus(props.status.descItalic),
  titleColor: getTextStatus(props.status.titleColor),
  descColor: getTextStatus(props.status.descColor),
}));
const emit = defineEmits<{
  (e: 'updateAnswer', value: string[]): void
}>()
const updateAnswer = () => {
  // 这里需要将答案传递给父组件
  // 通过自定义事件的形式
  // 传递的内容是当前选中的值
  emit('updateAnswer', ValueList.value)
}
</script>

<style scoped lang="scss">
.picOption {
  height: auto;
  flex-direction: column-reverse;
  width: 206.5px;
}
</style>
