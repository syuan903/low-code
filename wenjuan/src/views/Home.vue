<template>
  <div>
    <div class="container">
      <h1 class="font-weight-100 text-center">低码问卷系统</h1>
      <div class="mb-15">
        <el-button type="primary" :icon="Plus" @click="goToEditor">创建问卷</el-button>
        <el-button type="success" :icon="Compass" @click="goToMaterials">组件市场</el-button>
      </div>
      <el-table :data="tableData" style="width: 100%" border>
        <el-table-column fixed prop="createDate" label="创建日期" width="175" :formatter="formatDate" />
        <el-table-column prop="title" label="问卷标题" />
        <el-table-column prop="surveyCount" label="题目数" width="150" align="center" />
        <el-table-column prop="updateDate" label="最近更新日期" width="175" align="center" :formatter="formatDate" />
        <el-table-column fixed="right" prop="surveyCount" label="操作" width="300" align="center">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="viewSurvey(scope.row)"
            >查看问卷</el-button
          >
          <el-button link type="primary" size="small" @click="editSurvey(scope.row)"
            >编辑</el-button
          >
          <el-button link type="primary" size="small" @click="deleteSurvey(scope.row)"
            >删除</el-button
          >
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, Compass } from '@element-plus/icons-vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getAllSurvey } from "@/db/operation";
import type { SurveyDBData, SurveyDBReturnData } from "@/types";
import { formatDate } from "@/utils";
import { ElMessageBox, ElMessage } from 'element-plus';
import { useEditorStore } from '@/stores/useEditor'
const store = useEditorStore();

const router = useRouter()
const tableData = ref<SurveyDBData[]>([])
getAllSurvey().then(res=>{
  tableData.value=res
})

const goToEditor = () => {
  router.push({ name: 'survey-type' })
  localStorage.setItem('activeView', 'editor')
}

const goToMaterials = () => {
  router.push({ name: 'materials' })
  localStorage.setItem('activeView', 'materials')
}

const viewSurvey = (row: SurveyDBReturnData) => {
  router.push({ name: 'preview', params: { id: row.id } ,state:{from:'home'}})
}

// 编辑问卷
const editSurvey = (row: SurveyDBReturnData) => {
  // 仅仅是做一个跳转，跳转到编辑器页面，但是需要将 id 带过去
  router.push(`/editor/${row.id}/survey-type`);
};

// 删除问卷
const deleteSurvey = (row: SurveyDBReturnData) => {
  ElMessageBox.confirm('确定要删除该问卷吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      store.deleteComs(row.id).then(()=>{
        getAllSurvey().then(res=>{
          tableData.value=res
        })
      })
      ElMessage.success('删除成功');
    })
    .catch(() => {
      ElMessage.info('已取消删除');
    });
};
</script>

<style scoped>
.container {
  padding: 20px;
}
</style>
