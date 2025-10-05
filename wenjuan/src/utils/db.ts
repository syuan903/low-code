import type { TableColumnCtx } from 'element-plus/es/components/table/src/table-column/defaults'
import type { SurveyDBData ,ComponentMap} from '@/types'
import type { Status } from '@/types/common';
// 处理日期格式的辅助方法
export function formatDate(
  row: SurveyDBData,
  column: TableColumnCtx<SurveyDBData>,
  cellValue: number,
) {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };
  return new Intl.DateTimeFormat('zh-CN', options).format(new Date(cellValue));
}

export const restoreComponentStatus = (coms: Status[],componentMap: ComponentMap) => {
  coms.forEach((com) => {
    // 业务组件的还原
    com.type = componentMap[com.name as keyof ComponentMap]; // 这一步就做了组件的还原
    // 接下来还原编辑组件
    for (const key in com.status) {
      const name = com.status[key].name;
      com.status[key].editCom = componentMap[name as keyof ComponentMap];
    }
  });
};
