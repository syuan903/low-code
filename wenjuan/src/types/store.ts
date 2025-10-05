import type { TextProps, OptionsProps, PicLink, Status ,SurveyDBReturnData,VuecomType} from '@/types';
// 题目类型
export type SurveyComName =
  'single-select'|'multi-select'
  | 'option-select'
  | 'single-pic-select'
  | 'multi-pic-select'
  | 'text-input'
  | 'personal-info-name'
  | 'personal-info-id'
  | 'personal-info-tel'
  | 'personal-info-wechat'
  | 'personal-info-qq'
  | 'personal-info-email'
  | 'personal-info-address'
  | 'personal-info-gender'
  | 'personal-info-age'
  | 'personal-info-education'
  | 'personal-info-career'
  | 'rate-score'
  | 'date-time'
  | 'personal-info-birth'
  | 'personal-info-collage'
  | 'personal-info-major'
  | 'personal-info-industry'
  | 'personal-info-company'
  | 'personal-info-position'

// 业务组件类型(题目类型 + 非题目类型)
export type Material = SurveyComName | 'text-note';

// 编辑组件类型:集合了所有的编辑组件
export type EditComName =
  | 'title-editor'
  | 'desc-editor'
  | 'position-editor'
  | 'size-editor'
  | 'weight-editor'
  | 'italic-editor'
  | 'text-type-editor'
  | 'pic-options-editor'
  | 'options-editor'
  | 'color-editor'
  | 'date-time-type-editor'
  | 'rate-text-editor'
  | 'text-input-type-editor';

// 所有的组件类型：业务组件类型 + 编辑组件类型
export type ComponentName = Material | EditComName;

export type ComponentMap = {
  [key in ComponentName]: VuecomType;
};

export interface Actions {
  setTextStatus: (textProps: TextProps, text: string) => void;
  addOption: (optionProps: OptionsProps) => void;
  removeOption: (optionProps: OptionsProps, index: number) => boolean;
  setPosition: (optionProps: OptionsProps, index: number) => void;
  setCurrentStatus: (optionProps: OptionsProps, index: number) => void;
  setWeight: (optionProps: OptionsProps, index: number) => void;
  setItalic: (optionProps: OptionsProps, index: number) => void;
  setColor: (textProps: TextProps, color: string) => void;
  setPicLinkByIndex: (optionProps: OptionsProps, payload: PicLink) => void;
}

// 仓库状态
export interface MaterialStore extends Actions {
  currentMaterialCom: Material;
  coms: Record<Material, Status>;
  setCurrentSurveyCom: (com: Material) => void;
}

export interface EditorStore extends Actions {
  currentComponentIndex: number;
  coms: Status[];
  addCom: (com: Material) => void;
  setCurrentComponentIndex: (index: number) => void;
  removeCom: (index: number) => void;
  surveyCount: number; // 问卷题目的数量
  setStore: (data: SurveyDBReturnData) => void;
  resetComs: () => void;
  saveComs: (data: Omit<SurveyDBReturnData, 'id'>) => Promise<number | undefined>;
  // setComs: (coms: Status[]) => void;
  getCurComs: (id:number) => Promise<SurveyDBReturnData | undefined>;
  updateComs: (id:number,data:Partial<Omit<SurveyDBReturnData, 'id'>>) => Promise<boolean>;
  deleteComs: (id:number) => Promise<boolean>;
}

export type storeType = MaterialStore | EditorStore;

export const SurveyComNameArr=['single-select','multi-select',
  'option-select',
  'single-pic-select',
  'multi-pic-select',
  'text-input',
  'personal-info-name',
  'personal-info-id',
  'personal-info-tel',
  'personal-info-wechat',
  'personal-info-qq',
  'personal-info-email',
  'personal-info-address',
  'personal-info-gender',
  'personal-info-age',
  'personal-info-education',
  'personal-info-career',
  'rate-score',
  'date-time',
  'personal-info-birth',
  'personal-info-collage',
  'personal-info-major',
  'personal-info-industry',
  'personal-info-company',
  'personal-info-position']


  export function isSurveyComName(com: string): com is SurveyComName {
    return SurveyComNameArr.includes(com);
  }

const useForPDFComNameArr: Material[] = [
  'single-select',
  'multi-select',
  'single-pic-select',
  'multi-pic-select',
  'text-input',
  'text-note',
  'personal-info-name',
  'personal-info-id',
  'personal-info-tel',
  'personal-info-wechat',
  'personal-info-qq',
  'personal-info-email',
  'personal-info-address',
  'personal-info-gender',
  'personal-info-age',
  'personal-info-education',
  'personal-info-career',
  'personal-info-collage',
  'personal-info-major',
  'personal-info-industry',
  'personal-info-company',
  'personal-info-position',
]

export function isUseForPDF(value: string): value is SurveyComName {
  return useForPDFComNameArr.includes(value as SurveyComName)
}

  export type QuizData = {
  surveyCount: number;
  coms: Status[];
};

