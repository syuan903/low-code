import { ElMessage } from 'element-plus'
import { isPicLink } from '@/types'
import type { PicLink,storeType,Status, TextProps, OptionsProps} from '@/types'
import { isOptionsStatus,isTypeStatus,changeEditorIsShowStatus ,changeEditorIsUseStatus} from '@/utils'
import { provide } from "vue";

export function useUpdateStatus(store: storeType,currentCom:{ value: Status }) {
  const updateStatus = (configKey: string, payload?: string | number | boolean | object) => {
    if (!currentCom.value) {
      return
    }
  switch (configKey) {
    case 'type':{
      if(isTypeStatus(currentCom.value.status)){
      if (typeof payload !== 'number')
        console.error('Invalid payload type for "type". Expected number.')
      changeEditorIsShowStatus(currentCom.value.status, <number>payload)
      store.setCurrentStatus(currentCom.value.status[configKey], <number>payload)
    }
      break
 }
    case 'title':
    case 'desc': {
      if (typeof payload !== 'string')
        console.error('Invalid payload type for "title or desc". Expected string.')

      store.setTextStatus(currentCom.value.status[configKey] as TextProps, <string>payload)
      break
    }
    case 'options': {
      if(isOptionsStatus(currentCom.value.status)){
      if (payload === undefined) {
        // 添加选项
        store.addOption(currentCom.value.status.options)
      } else if (typeof payload === 'number') {
        // 删除选项
        const result = store.removeOption(currentCom.value.status.options, payload)
        if (result)
          ElMessage.success({
            message: '删除成功',
            type: 'success',
            showClose: true,
            grouping: true,
          })
        else
          ElMessage.error({
            message: '至少保留一个选项',
            type: 'error',
            showClose: true,
            grouping: true,
          })
      }else if (typeof payload === 'object' && isPicLink(payload)) {
        // 修改选项
        store.setPicLinkByIndex(currentCom.value.status.options, <PicLink>payload)
      }else if(typeof payload === 'boolean'){
        // 是否启用选项
        changeEditorIsUseStatus(currentCom.value.status, <boolean>payload)
      }
      else {
        console.error('Invalid payload for "options". Expected undefined or number.')
      }
      break}
    }
    case 'position': {
      if (typeof payload !== 'number')
        console.error('Invalid payload type for "position". Expected number.')
      store.setPosition(currentCom.value.status.position as OptionsProps, <number>payload)
      break
    }
    case 'titleSize':
    case 'descSize': {
      if (typeof payload !== 'number')
        console.error('Invalid payload type for "titleSize or descSize". Expected number.')
      store.setCurrentStatus(currentCom.value.status[configKey] as OptionsProps, <number>payload)
      break
    }
    case 'titleWeight':
    case 'descWeight': {
      if (typeof payload !== 'number')
        console.error('Invalid payload type for "titleWeight or descWeight". Expected number.')
      store.setWeight(currentCom.value.status[configKey] as OptionsProps, <number>payload)
      break
    }
    case 'titleItalic':
    case 'descItalic': {
      if (typeof payload !== 'number')
        console.error('Invalid payload type for "titleItalic or descItalic". Expected number.')
      store.setItalic(currentCom.value.status[configKey] as OptionsProps, <number>payload)
      break
    }
    case 'titleColor':
    case 'descColor': {
      if (typeof payload !== 'string')
        console.error('Invalid payload type for "titleColor or descColor". Expected string.')
      store.setColor(currentCom.value.status[configKey] as TextProps , <string>payload)
      break
    }
  }
}

provide('updateStatus', updateStatus);
}
