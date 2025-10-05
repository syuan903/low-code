<template>
  <Layout>
    <Router-link class="link-item mb-15" :to="{ name: 'text-input' }" exact-active-class="link-item-active">文本输入</Router-link>
  </Layout>
</template>

<script setup lang="ts">
import Layout from './Layout.vue'
</script>

<style scoped></style>
