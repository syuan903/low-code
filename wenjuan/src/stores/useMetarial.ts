import { defineStore } from 'pinia'
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
import type { Material, Status } from '@/types';

// 哪些业务组件需要初始化
const keyToInit = [
  'personal-info-tel',
  'personal-info-wechat',
  'personal-info-qq',
  'personal-info-email',
  'personal-info-address',
  'personal-info-name',
  'personal-info-id',
  'personal-info-gender',
  'personal-info-age',
  'personal-info-education',
  'personal-info-career',
  'personal-info-birth',
  'personal-info-collage',
  'personal-info-major',
  'personal-info-industry',
  'personal-info-company',
  'personal-info-position',
] as Material[];

const initializedStates: { [key: string]: Status } = {};

keyToInit.forEach((key) => {
  const defaultStatus = DefaultStatusMap[key]() as Status;
  updateInitStatusBeforeAdd(defaultStatus, key);
  initializedStates[key] = defaultStatus;
});

export const useMetarialStore = defineStore('metarial', {
  state: () => ({
    //记录所有业务组件
    currentMaterialCom: 'single-select',
    coms: {
      'single-select': DefaultStatusMap['single-select'](),
      'single-pic-select': DefaultStatusMap['single-pic-select'](),
      'text-note': DefaultStatusMap['text-note'](),
      'option-select': DefaultStatusMap['option-select'](),
      'multi-select': DefaultStatusMap['multi-select'](),
      'multi-pic-select': DefaultStatusMap['multi-pic-select'](),
      'text-input': DefaultStatusMap['text-input'](),
      'rate-score': DefaultStatusMap['rate-score'](),
      'date-time': DefaultStatusMap['date-time'](),
      'personal-info-name': initializedStates['personal-info-name'],
      'personal-info-id': initializedStates['personal-info-id'],
      'personal-info-tel': initializedStates['personal-info-tel'],
      'personal-info-wechat': initializedStates['personal-info-wechat'],
      'personal-info-qq': initializedStates['personal-info-qq'],
      'personal-info-email': initializedStates['personal-info-email'],
      'personal-info-address': initializedStates['personal-info-address'],
      'personal-info-gender': initializedStates['personal-info-gender'],
      'personal-info-age': initializedStates['personal-info-age'],
      'personal-info-education': initializedStates['personal-info-education'],
      'personal-info-career': initializedStates['personal-info-career'],
      'personal-info-birth': initializedStates['personal-info-birth'],
      'personal-info-collage': initializedStates['personal-info-collage'],
      'personal-info-major': initializedStates['personal-info-major'],
      'personal-info-industry': initializedStates['personal-info-industry'],
      'personal-info-company': initializedStates['personal-info-company'],
      'personal-info-position': initializedStates['personal-info-position'],
    },
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
    setCurrentMaterialCom(comName: string) {
      this.currentMaterialCom = comName
    },
  },
})
