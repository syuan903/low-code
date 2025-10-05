<template>
  <Layout>
    <Router-link class="link-item mb-15" :to="{name:'personal-info-name'}" exact-active-class="link-item-active">姓名</Router-link>
    <Router-link class="link-item mb-15" :to="{name:'personal-info-id'}" exact-active-class="link-item-active">身份证</Router-link>
    <Router-link class="link-item mb-15" :to="{name:'personal-info-birth'}" exact-active-class="link-item-active">出生日期</Router-link>
    <Router-link class="link-item mb-15" :to="{name:'personal-info-gender'}" exact-active-class="link-item-active">性别</Router-link>
    <Router-link class="link-item mb-15" :to="{name:'personal-info-age'}" exact-active-class="link-item-active">年龄</Router-link>
    <Router-link class="link-item mb-15" :to="{name:'personal-info-education'}" exact-active-class="link-item-active">学历</Router-link>
    <Router-link class="link-item mb-15" :to="{name:'personal-info-collage'}" exact-active-class="link-item-active">大学</Router-link>
    <Router-link class="link-item mb-15" :to="{name:'personal-info-major'}" exact-active-class="link-item-active">专业</Router-link>
    <Router-link class="link-item mb-15" :to="{name:'personal-info-industry'}" exact-active-class="link-item-active">行业</Router-link>
    <Router-link class="link-item mb-15" :to="{name:'personal-info-career'}" exact-active-class="link-item-active">职业</Router-link>
    <Router-link class="link-item mb-15" :to="{name:'personal-info-company'}" exact-active-class="link-item-active">公司</Router-link>
    <Router-link class="link-item mb-15" :to="{name:'personal-info-position'}" exact-active-class="link-item-active">职位</Router-link>
  </Layout>
</template>

<script setup lang="ts">
import Layout from './Layout.vue'
</script>

<style scoped></style>
