import { computed } from "vue";
import type { Status } from "@/types";
import { isSurveyComName } from "@/types";


export function useSurveyNums(coms:Status[]) {
  return computed(()=>{
    let count=1;
    return coms.map((com)=>{
      if(isSurveyComName(com.name)){
        return count++;
      }
      return null;
    })
  })
}
