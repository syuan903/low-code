import type { VuecomType } from './common'
export interface BaseProps {
  id: string
  isShow: boolean
  name: string
  editCom: VuecomType
  isUse?: boolean // 是否启用该编辑项
}

export interface TextProps extends BaseProps {
  status: string
}

// 三种可能的 options 状态
export type StringStatusArr = string[]
export type ValueStatusArr = Array<{ value: string; status: string }>
export type PicTitleDescStatusArr = Array<{
  picTitle: string
  picDesc: string
  value: string
}>

export type PicTitleDescStatus = {
  picTitle: string
  picDesc: string
  value: string
}

export type OptionsStatusArr = StringStatusArr | ValueStatusArr | PicTitleDescStatusArr

export interface OptionsProps extends BaseProps {
  status: OptionsStatusArr
  currentStatus: number
}

export interface BaseStatus {
  title: TextProps
  desc: TextProps
  position: OptionsProps
  titleSize: OptionsProps
  descSize: OptionsProps
  titleWeight: OptionsProps
  descWeight: OptionsProps
  titleItalic: OptionsProps
  descItalic: OptionsProps
  titleColor: TextProps
  descColor: TextProps
}

export interface TypeStatus extends BaseStatus {
  type: OptionsProps
}

export interface OptionsStatus extends BaseStatus {
  options: OptionsProps
}

// 确定 status 是字符串数组
export function isStringArray(status: OptionsStatusArr): status is string[] {
  return Array.isArray(status) && typeof status[0] === 'string';
}

// 确定 status 是 { value: string; status: string } 这种类型的数组
export function isValueStatusArr(status: OptionsStatusArr): status is ValueStatusArr {
  return (
    Array.isArray(status) &&
    typeof status[0] === 'object' &&
    'value' in status[0] &&
    'status' in status[0]
  );
}

// 确定 status 是 { picTitle: string; picDesc: string; value: string } 这种类型的数组
export function isPicTitleDescStatusArr(status: OptionsStatusArr): status is PicTitleDescStatusArr {
  return (
    Array.isArray(status) &&
    typeof status[0] === 'object' &&
    'picTitle' in status[0] &&
    'picDesc' in status[0] &&
    'value' in status[0]
  );
}

export type PicLink = { link: string; index: number };
export function isPicLink(obj: object): obj is PicLink {
  return 'link' in obj && 'index' in obj;
}

export interface UpdateStatus {
  (configKey: string, payload?: number|undefined|string|boolean|PicLink): void
}
