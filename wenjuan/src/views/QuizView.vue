<template>
  <div v-if="errorMessage" class="quiz-container mc mt-30">
    <el-empty :description="errorMessage" />
  </div>
  <div v-else-if="quizData">
    <div class="quiz-container mc">
      <div class="mt-30 mb-20">题目数量：{{ quizData.surveyCount }}</div>
      <div class="content mb-10" v-for="(com, index) in quizData.coms" :key="index">
        <component
          :is="com.type"
          :status="com.status"
          :serialNum="serialNum[index]"
          @updateAnswer="updateAnswer(index, $event)"
        />
      </div>
      <div class="mt-20 mb-20 text-center">
        <el-button type="primary" @click="submitAnswers">提交答案</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Ref } from 'vue';
import { onMounted, ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { useRoute } from 'vue-router';
import { componentMap } from "@/configs/compontentMap";
const route = useRoute();

import type { QuizData } from '@/types';

import { restoreComponentStatus } from '@/utils';
// 组合式函数
import { useSurveyNums } from '@/utils';
// 获取题目编号
const serialNum = computed(() => useSurveyNums(quizData.value?.coms ?? []).value);

const quizData = ref<QuizData | null>(null);
const errorMessage = ref('');

onMounted(async () => {
  const quizId = route.params.id;
  try {
    // 从服务器获取试卷内容
    const response = await fetch(`/api/getQuiz/${quizId}`);
    if (!response.ok) {
      errorMessage.value = '问卷不存在或尚未生成';
      return;
    }
    const data = await response.json();
    if (!data || typeof data.coms !== 'string') {
      throw new Error('invalid quiz data');
    }
    const coms = JSON.parse(data.coms);
    if (!Array.isArray(coms)) {
      throw new Error('invalid quiz components');
    }
    data.coms = coms;
    restoreComponentStatus(data.coms,componentMap);
    quizData.value = data;
  } catch (error) {
    errorMessage.value = '问卷加载失败，请稍后再试';
  }
});

// 用来存储要发送服务器的答案
const answers: Ref<{ [key: number]: string | number | Date }> = ref({});

const updateAnswer = (index: number, answer: string | number) => {
  // console.log(index, answer);
  const serial = serialNum.value[index];
  if (serial !== null) {
    // 说明是题目组件
    answers.value[serial] = answer;
  }
  console.log(answers.value);
};

const submitAnswers = async () => {
  if (!quizData.value) return;
  const quizId = route.params.id;
  const response = await fetch(`/api/submitAnswers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      quizId,
      answers: answers.value,
    }),
  });
  if (!response.ok) {
    ElMessage.error('提交失败，请稍后再试');
    return;
  }
  ElMessage.success('提交成功！');
};
</script>

<style scoped lang="scss">
.quiz-container {
  width: 800px;
}
</style>
