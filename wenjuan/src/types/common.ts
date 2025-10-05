import type { defineComponent } from "vue";
import type { TextProps,OptionsProps} from './editProps'


export type VuecomType = ReturnType<typeof defineComponent>

export interface Status {
  id: string
  type: VuecomType
  name: string
  status: {
    [key: string]: TextProps | OptionsProps;
  };
}
