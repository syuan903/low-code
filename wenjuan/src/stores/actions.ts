import type { TextProps, OptionsProps ,PicLink} from '@/types'
import { isStringArray ,isPicTitleDescStatusArr} from '@/types'
import { getStringOptionsNextText ,getPicOptionsNextText} from '@/utils'
export function setTextStatus(textProps: TextProps, text: string) {
  textProps.status = text
}

export function addOption(optionProps: OptionsProps) {
  if (isStringArray(optionProps.status)) {
    optionProps.status.push(getStringOptionsNextText(optionProps))
  }else if (isPicTitleDescStatusArr(optionProps.status)) {
    optionProps.status.push(getPicOptionsNextText(optionProps))
  }
}

export function removeOption(optionProps: OptionsProps, index: number) {
  if (optionProps.status.length === 2) {
    return false
  }
  optionProps.status.splice(index, 1)
  return true
}

export function setPosition(positionProps: OptionsProps, index: number) {
  positionProps.currentStatus = index
}

export function setCurrentStatus(optionsProps: OptionsProps, index: number) {
  optionsProps.currentStatus = index
}

export function setWeight(weightProps: OptionsProps, index: number) {
  weightProps.currentStatus = index
}

export function setItalic(italicProps: OptionsProps, index: number) {
  italicProps.currentStatus = index
}

export function setColor(colorProps: TextProps, color: string) {
  colorProps.status = color
}

export function setPicLinkByIndex(picLinkProps: OptionsProps, { index, link }: PicLink) {
  if (isPicTitleDescStatusArr(picLinkProps.status)) {
    picLinkProps.status[index].value = link
  }
}
