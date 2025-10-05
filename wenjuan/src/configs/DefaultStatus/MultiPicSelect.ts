// 业务组件
import MultiPicSelect from '@/components/SurveyComs/MaterialsComs/SelectComs/MultiPicSelect.vue'
// 编辑组件
import TitleEditor from '@/components/SurveyComs/EditorItems/TitleEditor.vue'
import DescEditor from '@/components/SurveyComs/EditorItems/DescEditor.vue'
import PicOptionsEditor from '@/components/SurveyComs/EditorItems/PicOptionsEditor.vue'
import PositionEditor from '@/components/SurveyComs/EditorItems/PositionEditor.vue'
import SizeEditor from '@/components/SurveyComs/EditorItems/SizeEditor.vue'
import WeightEditor from '@/components/SurveyComs/EditorItems/WeightEditor.vue'
import ItalicEditor from '@/components/SurveyComs/EditorItems/ItalicEditor.vue'
import ColorEditor from '@/components/SurveyComs/EditorItems/ColorEditor.vue'
import { markRaw } from 'vue'
import { v4 as uuidv4 } from 'uuid'

export default function () {
  return {
    type: markRaw(MultiPicSelect),
    name: 'multi-pic-select',
    id: uuidv4(),
    // 组件的状态：组件的每一个能够修改的状态都应该对应一个编辑组件
    status: {
      title: {
        id: uuidv4(),
        status: '图片多选标题!!!',
        isShow: true,
        name: 'title-editor',
        editCom: markRaw(TitleEditor),
      },
      desc: {
        id: uuidv4(),
        status: '图片多选描述~~~',
        isShow: true,
        name: 'desc-editor',
        editCom: markRaw(DescEditor),
      },
      options: {
        id: uuidv4(),
        status: [
          {
            picTitle: '图片标题1',
            picDesc: '图片描述1',
            value: '',
          },
          {
            picTitle: '图片标题2',
            picDesc: '图片描述2',
            value: '',
          },
        ],
        currentStatus: 0,
        isShow: true,
        name: 'pic-options-editor',
        editCom: markRaw(PicOptionsEditor),
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
