import { defineStore } from "pinia";
import DefaultStatusMap from '@/configs/DefaultStatus/DefaultStatusMap'
import {
  setTextStatus,
  addOption,
  removeOption,
  setPosition,
  setCurrentStatus,
  setWeight,
  setItalic,
  setColor,
  setPicLinkByIndex
} from './actions'
import { updateInitStatusBeforeAdd } from '@/utils';
import type { Material, Status, SurveyDBReturnData } from '@/types';
import { isSurveyComName } from "@/types";

import { saveSurvey } from "@/db/operation";
import type { SurveyDBData ,TypeStatus} from "@/types";
import { v4 as uuidv4 } from 'uuid'
import { markRaw } from 'vue'
import ColorEditor from '@/components/SurveyComs/EditorItems/ColorEditor.vue'
import TitleEditor from '@/components/SurveyComs/EditorItems/TitleEditor.vue'
import TextTypeEditor from "@/components/SurveyComs/EditorItems/TextTypeEditor.vue";
import DescEditor from '@/components/SurveyComs/EditorItems/DescEditor.vue'
import ItalicEditor from '@/components/SurveyComs/EditorItems/ItalicEditor.vue'
import SizeEditor from '@/components/SurveyComs/EditorItems/SizeEditor.vue'
import WeightEditor from '@/components/SurveyComs/EditorItems/WeightEditor.vue'
import PositionEditor from '@/components/SurveyComs/EditorItems/PositionEditor.vue'
import textNoteDefaultStatus from "@/configs/DefaultStatus/TextNote";

import { getSurveyById ,updateSurveyById,deleteSurveyById} from "@/db/operation";

// 仓库的初始化状态
const initStore = () => [
  Object.assign({}, textNoteDefaultStatus(), {
    status: <TypeStatus>{
      type: {
        id: uuidv4(),
        currentStatus: 0,
        status: ['标题', '段落'],
        isShow: true,
        editCom: markRaw(TextTypeEditor),
        name: 'text-type-editor',
      },
      title: {
        id: uuidv4(),
        status: '问卷标题',
        isShow: true,
        editCom: markRaw(TitleEditor),
        name: 'title-editor',
      },
      desc: {
        id: uuidv4(),
        status: '默认描述内容',
        isShow: false,
        editCom: DescEditor,
        name: 'desc-editor',
      },
      position: {
        id: uuidv4(),
        currentStatus: 0,
        status: ['左对齐', '居中对齐'],
        isShow: false,
        editCom: markRaw(PositionEditor),
        name: 'position-editor',
      },
      titleSize: {
        id: uuidv4(),
        currentStatus: 0,
        status: ['26', '24', '22'],
        isShow: true,
        editCom: markRaw(SizeEditor),
        name: 'size-editor',
      },
      descSize: {
        id: uuidv4(),
        currentStatus: 0,
        status: ['16', '14', '12'],
        isShow: false,
        editCom: markRaw(SizeEditor),
        name: 'size-editor',
      },
      titleWeight: {
        id: uuidv4(),
        currentStatus: 1,
        status: ['加粗', '正常'],
        isShow: true,
        editCom: markRaw(WeightEditor),
        name: 'weight-editor',
      },
      descWeight: {
        id: uuidv4(),
        currentStatus: 1,
        status: ['加粗', '正常'],
        isShow: false,
        editCom: markRaw(WeightEditor),
        name: 'weight-editor',
      },
      titleItalic: {
        id: uuidv4(),
        currentStatus: 1,
        status: ['斜体', '正常'],
        isShow: true,
        editCom: markRaw(ItalicEditor),
        name: 'italic-editor',
      },
      descItalic: {
        id: uuidv4(),
        currentStatus: 1,
        status: ['斜体', '正常'],
        isShow: false,
        editCom: markRaw(ItalicEditor),
        name: 'italic-editor',
      },
      titleColor: {
        id: uuidv4(),
        status: '#000',
        isShow: true,
        editCom: markRaw(ColorEditor),
        name: 'color-editor',
      },
      descColor: {
        id: uuidv4(),
        status: '#909399',
        isShow: false,
        editCom: markRaw(ColorEditor),
        name: 'color-editor',
      },
    },
  }),
  Object.assign({}, textNoteDefaultStatus(), {
    status: <TypeStatus>{
      type: {
        id: uuidv4(),
        currentStatus: 1,
        status: ['标题', '段落'],
        isShow: true,
        editCom: markRaw(TextTypeEditor),
        name: 'text-type-editor',
      },
      title: {
        id: uuidv4(),
        status: '默认标题内容',
        isShow: false,
        editCom: markRaw(TitleEditor),
        name: 'title-editor',
      },
      desc: {
        id: uuidv4(),
        status:
          '为了给您提供更好的服务，希望您能抽出几分钟时间，将您的感受和建议告诉我们，我们非常重视每位用户的宝贵意见，期待您的参与！现在我们就马上开始吧！',
        isShow: true,
        editCom: markRaw(DescEditor),
        name: 'desc-editor',
      },
      position: {
        id: uuidv4(),
        currentStatus: 0,
        status: ['左对齐', '居中对齐'],
        isShow: true,
        editCom: markRaw(PositionEditor),
        name: 'position-editor',
      },
      titleSize: {
        id: uuidv4(),
        currentStatus: 0,
        status: ['26', '24', '22'],
        isShow: false,
        editCom: markRaw(SizeEditor),
        name: 'size-editor',
      },
      descSize: {
        id: uuidv4(),
        currentStatus: 0,
        status: ['16', '14', '12'],
        isShow: true,
        editCom: markRaw(SizeEditor),
        name: 'size-editor',
      },
      titleWeight: {
        id: uuidv4(),
        currentStatus: 1,
        status: ['加粗', '正常'],
        isShow: false,
        editCom: markRaw(WeightEditor),
        name: 'weight-editor',
      },
      descWeight: {
        id: uuidv4(),
        currentStatus: 1,
        status: ['加粗', '正常'],
        isShow: true,
        editCom: markRaw(WeightEditor),
        name: 'weight-editor',
      },
      titleItalic: {
        id: uuidv4(),
        currentStatus: 1,
        status: ['斜体', '正常'],
        isShow: false,
        editCom: markRaw(ItalicEditor),
        name: 'italic-editor',
      },
      descItalic: {
        id: uuidv4(),
        currentStatus: 1,
        status: ['斜体', '正常'],
        isShow: true,
        editCom: markRaw(ItalicEditor),
        name: 'italic-editor',
      },
      titleColor: {
        id: uuidv4(),
        status: '#000',
        isShow: false,
        editCom: markRaw(ColorEditor),
        name: 'color-editor',
      },
      descColor: {
        id: uuidv4(),
        status: '#909399',
        isShow: true,
        editCom: markRaw(ColorEditor),
        name: 'color-editor',
      },
    },
  }),
];

export const useEditorStore = defineStore("editor", {
  state: () => ({
    currentComponentIndex: -1, // 当前选中的组件索引，一开始都没有选中，所以是-1
    surveyCount: 0, // 问卷题目的数量
    coms:initStore() as unknown as Status[],
  }),
  actions: {
    setTextStatus,
    addOption,
    removeOption,
    setPosition,
    setCurrentStatus,
    setWeight,
    setItalic,
    setColor,
    setPicLinkByIndex,
    addCom(key: Material) {
      const newCom=DefaultStatusMap[key]() as Status;
      updateInitStatusBeforeAdd(newCom, key);
      this.coms.push(newCom);
      if(isSurveyComName(key)){
        this.surveyCount++;
      }
      this.currentComponentIndex=-1;
    },
    setCurrentComponentIndex(index: number) {
      this.currentComponentIndex = index;
    },
    removeCom(index: number) {
      this.coms.splice(index, 1);
      if (isSurveyComName(this.coms[index]?.name)) {
        this.surveyCount--;
      }
      this.currentComponentIndex = -1;
    },
    resetComs() {
      this.coms = initStore() as unknown as Status[];
      this.surveyCount = 0;
      this.currentComponentIndex = -1;
    },
    // 保存问卷数据
    saveComs(data: SurveyDBData) {
      return saveSurvey(data);
    },
    // 还原问卷的仓库状态，其实就是根据传入的数据设置 coms、surveyCount、currentComponentIndex
    setStore(data: SurveyDBReturnData) {
      this.coms = data.coms;
      this.surveyCount = data.surveyCount;
      this.currentComponentIndex = -1;
    },
    getCurComs(id:number){
      return getSurveyById(id)
    },
    updateComs(id:number,data:Partial<SurveyDBData>){
      return updateSurveyById(id,data)
    },
    deleteComs(id:number){
      return deleteSurveyById(id)
    }
  },
});
