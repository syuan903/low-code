//形成组件和组件名的映射
import type { ComponentMap} from "@/types";
//业务组件
import SingleSelect from "@/components/SurveyComs/MaterialsComs/SelectComs/SingleSelect.vue";
import MultiPicSelect from "@/components/SurveyComs/MaterialsComs/SelectComs/MultiPicSelect.vue";
import SinglePicSelect from "@/components/SurveyComs/MaterialsComs/SelectComs/SinglePicSelect.vue";
import MultiSelect from "@/components/SurveyComs/MaterialsComs/SelectComs/MultiSelect.vue";
import OptionalSelect from "@/components/SurveyComs/MaterialsComs/SelectComs/OptionalSelect.vue";
import TextInput from "@/components/SurveyComs/MaterialsComs/InputComs/TextInput.vue";
import TextNote from "@/components/SurveyComs/MaterialsComs/NoteComs/TextNote.vue";
import DateTime from "@/components/SurveyComs/MaterialsComs/AdvancedComs/DateTime.vue";
import RateScore from "@/components/SurveyComs/MaterialsComs/AdvancedComs/RateScore.vue";
//编辑组件
import TextTypeEditor from "@/components/SurveyComs/EditorItems/TextTypeEditor.vue";
import TitleEditor from "@/components/SurveyComs/EditorItems/TitleEditor.vue";
import DescEditor from "@/components/SurveyComs/EditorItems/DescEditor.vue";
import PositionEditor from "@/components/SurveyComs/EditorItems/PositionEditor.vue";
import SizeEditor from "@/components/SurveyComs/EditorItems/SizeEditor.vue";
import WeightEditor from "@/components/SurveyComs/EditorItems/WeightEditor.vue";
import ColorEditor from "@/components/SurveyComs/EditorItems/ColorEditor.vue";
import ItalicEditor from "@/components/SurveyComs/EditorItems/ItalicEditor.vue";
import DateTimeTypeEditor from "@/components/SurveyComs/EditorItems/DateTimeTypeEditor.vue";
import OptionsEditor from "@/components/SurveyComs/EditorItems/OptionsEditor.vue";
import PicOptionsEditor from "@/components/SurveyComs/EditorItems/PicOptionsEditor.vue";
import rateTextEditor from "@/components/SurveyComs/EditorItems/rateTextEditor.vue";
import TextInputTypeEditor from "@/components/SurveyComs/EditorItems/TextInputTypeEditor.vue";
import { markRaw } from "vue";

export const componentMap: ComponentMap = {
  //业务组件
  'single-select': markRaw(SingleSelect),
  'multi-pic-select': markRaw(MultiPicSelect),
  'single-pic-select': markRaw(SinglePicSelect),
  'multi-select': markRaw(MultiSelect),
  'option-select': markRaw(OptionalSelect),
  'text-input': markRaw(TextInput),
  'text-note': markRaw(TextNote),
  'date-time': markRaw(DateTime),
  'rate-score': markRaw(RateScore),
  'personal-info-address': markRaw(TextInput),
  'personal-info-age': markRaw(SingleSelect),
  'personal-info-birth': markRaw(DateTime),
  'personal-info-career': markRaw(SingleSelect),
  'personal-info-collage': markRaw(TextInput),
  'personal-info-company': markRaw(TextInput),
  'personal-info-education': markRaw(SingleSelect),
  'personal-info-major': markRaw(TextInput),
  'personal-info-industry': markRaw(TextInput),
  'personal-info-position': markRaw(TextInput),
  'personal-info-name': markRaw(TextInput),
  'personal-info-id': markRaw(TextInput),
  'personal-info-tel': markRaw(TextInput),
  'personal-info-wechat': markRaw(TextInput),
  'personal-info-qq': markRaw(TextInput),
  'personal-info-email': markRaw(TextInput),
  'personal-info-gender': markRaw(SingleSelect),
  //编辑组件
  'text-type-editor': markRaw(TextTypeEditor),
  'title-editor': markRaw(TitleEditor),
  'desc-editor': markRaw(DescEditor),
  'position-editor': markRaw(PositionEditor),
  'size-editor': markRaw(SizeEditor),
  'weight-editor': markRaw(WeightEditor),
  'color-editor': markRaw(ColorEditor),
  'italic-editor': markRaw(ItalicEditor),
  'date-time-type-editor': markRaw(DateTimeTypeEditor),
  'options-editor': markRaw(OptionsEditor),
  'pic-options-editor': markRaw(PicOptionsEditor),
  'rate-text-editor': markRaw(rateTextEditor),
  'text-input-type-editor': markRaw(TextInputTypeEditor),
}

