<template>
  <Layout>
    <Router-link class="link-item mb-15" :to="{name: 'single-select'}" exact-active-class="link-item-active">单选题</Router-link>
    <Router-link class="link-item mb-15" :to="{name: 'multi-select'}" exact-active-class="link-item-active">多选题</Router-link>
    <Router-link class="link-item mb-15" :to="{name: 'option-select'}" exact-active-class="link-item-active">下拉选择</Router-link>
    <Router-link class="link-item mb-15" :to="{name: 'single-pic-select'}" exact-active-class="link-item-active">图片单选题</Router-link>
    <Router-link class="link-item mb-15" :to="{name: 'multi-pic-select'}" exact-active-class="link-item-active">图片多选题</Router-link>
  </Layout>
</template>

<script setup lang="ts">
import Layout from './Layout.vue'
</script>

<style scoped></style>
