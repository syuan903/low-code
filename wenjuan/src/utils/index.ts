// 工具库
import type { TextProps, OptionsProps, PicTitleDescStatus ,TypeStatus,OptionsStatus,Status,Material} from '@/types'
import { isStringArray, isPicTitleDescStatusArr,isValueStatusArr} from '@/types'
import { genderStatus, educationStatus ,careerStatus,ageStatus} from '@/configs/DefaultStatus/initStatus'
import { useMetarialStore } from '@/stores/useMetarial'

export function getTextStatus(props: TextProps) {
  return props.status
}

export function getStringStatus(props: OptionsProps) {
  if(props && isStringArray(props.status)) return props.status
}

export function getCurrentStatus(props: OptionsProps) {
  if (props) {
    return props.currentStatus
  }
}

export function getStringStatusByCurrentStatus(props: OptionsProps) {
  if (props && isStringArray(props.status)) {
    return props.status[props.currentStatus]
  }
}

export function getValueStatusByCurrentStatus(props: OptionsProps) {
  if (props && isValueStatusArr(props.status)) {
    return props.status[props.currentStatus]
  }
}

export function getStringOptionsNextText(props: OptionsProps): string {
  if (props && isStringArray(props.status)) {
    const lastOption = props.status[props.status.length - 1]
    if(isNaN(Number(lastOption.slice(-1)))) return `新选项`
    else {
      const nextIndex = Number(lastOption.slice(-1)) + 1
    return `新选项${nextIndex}`
    }
  }
  return ''
}

export function getPicOptionsNextText(props: OptionsProps): PicTitleDescStatus {
  if (props && isPicTitleDescStatusArr(props.status)) {
    const lastOption = props.status[props.status.length - 1]
    const nextIndex = Number(lastOption.picDesc.slice(-1)) + 1
    return { picTitle: `图片选项${nextIndex}`, picDesc: `图片描述${nextIndex}`, value: `` }
  }
  return { picTitle: '', picDesc: '', value: '' }
}

export function getPicTitleDescStatusArr(props: OptionsProps) {
  if (props && isPicTitleDescStatusArr(props.status)) {
    return props.status
  }
}

export function isOptionsStatus(props: any): props is OptionsStatus {
  return 'options' in props
}

export function isTypeStatus(props: any): props is TypeStatus {
  return 'type' in props
}

export function changeEditorIsShowStatus(status: TypeStatus, type: number) {
  const store = useMetarialStore()
  if(store.currentMaterialCom === 'text-input' || store.currentMaterialCom === 'date-time') return
  if (type !== status.type.currentStatus) {
    status.title.isShow = !status.title.isShow;
    status.desc.isShow = !status.desc.isShow;
    status.position.isShow = !status.position.isShow;
    status.titleSize.isShow = !status.titleSize.isShow;
    status.descSize.isShow = !status.descSize.isShow;
    status.titleWeight.isShow = !status.titleWeight.isShow;
    status.descWeight.isShow = !status.descWeight.isShow;
    status.titleItalic.isShow = !status.titleItalic.isShow;
    status.descItalic.isShow = !status.descItalic.isShow;
    status.titleColor.isShow = !status.titleColor.isShow;
    status.descColor.isShow = !status.descColor.isShow;
  }
}

export function changeEditorIsUseStatus(status: OptionsStatus, type: boolean) {
  status.options.isUse = type;
}

export const updateInitStatusBeforeAdd = (comStatus: Status, newMaterialName: Material) => {
  switch (newMaterialName) {
    case 'personal-info-name': {
      comStatus.name = 'personal-info-name'
      comStatus.status.title.status = '您的姓名是'
      if(isTypeStatus(comStatus.status)) comStatus.status.type.isShow = false
      break
    }
    case 'personal-info-id': {
      comStatus.name = 'personal-info-id'
      comStatus.status.title.status = '请填写身份证号'
      if(isTypeStatus(comStatus.status)) comStatus.status.type.isShow = false
      break
    }
    case 'personal-info-tel': {
      comStatus.name = 'personal-info-tel'
      comStatus.status.title.status = '请填写手机号'
      if(isTypeStatus(comStatus.status)) comStatus.status.type.isShow = false
      break
    }
    case 'personal-info-wechat': {
      comStatus.name = 'personal-info-wechat'
      comStatus.status.title.status = '请填写微信号'
      if(isTypeStatus(comStatus.status)) comStatus.status.type.isShow = false
      break
    }
    case 'personal-info-qq': {
      comStatus.name = 'personal-info-qq'
      comStatus.status.title.status = '请填写QQ号'
      if(isTypeStatus(comStatus.status)) comStatus.status.type.isShow = false
      break
    }
    case 'personal-info-email': {
      comStatus.name = 'personal-info-email'
      comStatus.status.title.status = '请填写邮箱'
      if(isTypeStatus(comStatus.status)) comStatus.status.type.isShow = false
      break
    }
    case 'personal-info-address': {
      comStatus.name = 'personal-info-address'
      comStatus.status.title.status = '请填写地址'
      if(isTypeStatus(comStatus.status)) comStatus.status.type.isShow = false
      break
    }
    case 'personal-info-gender': {
      comStatus.name = 'personal-info-gender'
      comStatus.status.title.status = '您的性别是'
      if(isOptionsStatus(comStatus.status)) comStatus.status.options.status = genderStatus()
      break
    }
    case 'personal-info-age': {
      comStatus.name = 'personal-info-age'
      comStatus.status.title.status = '您的年龄是'
      if(isOptionsStatus(comStatus.status)) comStatus.status.options.status = ageStatus()
      break
    }
    case 'personal-info-education': {
      comStatus.name = 'personal-info-education'
      comStatus.status.title.status = '到目前为止，您的最高学历是'
      if(isOptionsStatus(comStatus.status)) comStatus.status.options.status = educationStatus()
      break
    }
    case 'personal-info-career': {
      comStatus.name = 'personal-info-career'
      comStatus.status.title.status = '您目前的职业是'
      isOptionsStatus(comStatus.status) && (comStatus.status.options.status = careerStatus())
      break
    }
    case 'personal-info-birth': {
      comStatus.name = 'personal-info-birth'
      comStatus.status.title.status = '请选择出生日期'
      break
    }
    case 'personal-info-collage': {
      comStatus.name = 'personal-info-collage'
      comStatus.status.title.status = '请填写您的大学'
      if(isTypeStatus(comStatus.status)) comStatus.status.type.isShow = false
      break
    }
    case 'personal-info-major': {
      comStatus.name = 'personal-info-major'
      comStatus.status.title.status = '请填写您的专业'
      if(isTypeStatus(comStatus.status)) comStatus.status.type.isShow = false
      break
    }
    case 'personal-info-industry': {
      comStatus.name = 'personal-info-industry'
      comStatus.status.title.status = '请填写您的行业'
      if(isTypeStatus(comStatus.status)) comStatus.status.type.isShow = false
      break
    }
    case 'personal-info-company': {
      comStatus.name = 'personal-info-company'
      comStatus.status.title.status = '请填写您的公司'
      if(isTypeStatus(comStatus.status)) comStatus.status.type.isShow = false
      break
    }
    case 'personal-info-position': {
      comStatus.name = 'personal-info-position'
      comStatus.status.title.status = '请填写您的职位'
      if(isTypeStatus(comStatus.status)) comStatus.status.type.isShow = false
      break
    }
  }
}

export * from './eventBus'

export * from './useUpdateStatus'

export * from './hooks'

export * from './db'
