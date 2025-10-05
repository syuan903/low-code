<template>
  <Layout>
    <Router-link class="link-item mb-15" :to="{
      name: 'personal-info-tel'
    }" exact-active-class="link-item-active">手机</Router-link>
    <Router-link class="link-item mb-15" :to="{
      name: 'personal-info-wechat'
    }" exact-active-class="link-item-active">微信号</Router-link>
    <Router-link class="link-item mb-15" :to="{
      name: 'personal-info-qq'
    }" exact-active-class="link-item-active">QQ号</Router-link>
    <Router-link class="link-item mb-15" :to="{
      name: 'personal-info-email'
    }" exact-active-class="link-item-active">邮箱</Router-link>
    <Router-link class="link-item mb-15" :to="{
      name: 'personal-info-address'
    }" exact-active-class="link-item-active">地址</Router-link>
  </Layout>
</template>

<script setup lang="ts">
import Layout from './Layout.vue'
</script>

<style scoped></style>
