import MultiSelect from '@/components/SurveyComs/MaterialsComs/SelectComs/MultiSelect.vue'
import { v4 as uuidv4 } from 'uuid'
import { markRaw } from 'vue'
import ColorEditor from '@/components/SurveyComs/EditorItems/ColorEditor.vue'
import TitleEditor from '@/components/SurveyComs/EditorItems/TitleEditor.vue'
import OptionEditor from '@/components/SurveyComs/EditorItems/OptionsEditor.vue'
import DescEditor from '@/components/SurveyComs/EditorItems/DescEditor.vue'
import ItalicEditor from '@/components/SurveyComs/EditorItems/ItalicEditor.vue'
import SizeEditor from '@/components/SurveyComs/EditorItems/SizeEditor.vue'
import WeightEditor from '@/components/SurveyComs/EditorItems/WeightEditor.vue'
import PositionEditor from '@/components/SurveyComs/EditorItems/PositionEditor.vue'
export default function () {
  return {
    type: markRaw(MultiSelect),
    name: 'multi-select',
    id: uuidv4(),
    status: {
      title: {
        id: uuidv4(),
        status: '默认多选题标题123',
        isShow: true,
        name: 'title-editor',
        editCom: markRaw(TitleEditor),
      },
      desc: {
        id: uuidv4(),
        status: '默认多选题描述内容',
        isShow: true,
        name: 'desc-editor',
        editCom: markRaw(DescEditor),
      },
      options: {
        id: uuidv4(),
        currentStatus: 0,
        status: ['默认多选题选项1', '默认多选题选项2'],
        isShow: true,
        name: 'options-editor',
        editCom: markRaw(OptionEditor),
      },
      position: {
        id: uuidv4(),
        currentStatus: 0,
        status: ['左对齐', '居中对齐'],
        isShow: true,
        name: 'position-editor',
        editCom: markRaw(PositionEditor),
      },
      titleSize: {
        id: uuidv4(),
        currentStatus: 0,
        status: ['22', '20', '18'],
        isShow: true,
        name: 'size-editor',
        editCom: markRaw(SizeEditor),
      },
      descSize: {
        id: uuidv4(),
        currentStatus: 0,
        status: ['16', '14', '12'],
        isShow: true,
        name: 'size-editor',
        editCom: markRaw(SizeEditor),
      },
      titleWeight: {
        id: uuidv4(),
        currentStatus: 1,
        status: ['加粗', '正常'],
        isShow: true,
        name: 'weight-editor',
        editCom: markRaw(WeightEditor),
      },
      descWeight: {
        id: uuidv4(),
        currentStatus: 1,
        status: ['加粗', '正常'],
        isShow: true,
        name: 'weight-editor',
        editCom: markRaw(WeightEditor),
      },
      titleItalic: {
        id: uuidv4(),
        currentStatus: 1,
        status: ['斜体', '正常'],
        isShow: true,
        name: 'italic-editor',
        editCom: markRaw(ItalicEditor),
      },
      descItalic: {
        id: uuidv4(),
        currentStatus: 1,
        status: ['斜体', '正常'],
        isShow: true,
        name: 'italic-editor',
        editCom: markRaw(ItalicEditor),
      },
      titleColor: {
        id: uuidv4(),
        status: '#000',
        isShow: true,
        name: 'color-editor',
        editCom: markRaw(ColorEditor),
      },
      descColor: {
        id: uuidv4(),
        status: '#909399',
        isShow: true,
        name: 'color-editor',
        editCom: markRaw(ColorEditor),
      },
    },
  }
}
