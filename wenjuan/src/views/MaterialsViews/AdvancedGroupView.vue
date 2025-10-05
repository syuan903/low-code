<template>
  <Layout>
    <Router-link class="link-item mb-15" :to="{
      name: 'rate-score'
    }" exact-active-class="link-item-active">评价/打分</Router-link>
    <Router-link class="link-item mb-15" :to="{
      name: 'date-time'
    }" exact-active-class="link-item-active">日期/时间</Router-link>
  </Layout>
</template>

<script setup lang="ts">
import Layout from './Layout.vue'
</script>

<style scoped></style>
