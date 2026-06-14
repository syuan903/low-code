// 该文件提供具体的数据库操作方法的支持
// 已由原 Dexie/IndexedDB 实现改为调用后端 REST API（通过 vite 代理 /api）

import type { SurveyDBData, SurveyDBReturnData } from '@/types';

// REST API 基础路径（由 vite 代理到 http://localhost:3001）
const BASE_URL = '/api/surveys';

// 简单的 fetch 封装：自动处理 JSON 请求/响应与错误
async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`请求失败：${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

// 保存数据：POST /api/surveys，返回新建记录的 id
export async function saveSurvey(data: SurveyDBData): Promise<number> {
  const res = await request<{ id: number }>(BASE_URL, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.id;
}

// 查询所有数据：GET /api/surveys
export async function getAllSurvey(): Promise<SurveyDBReturnData[]> {
  return await request<SurveyDBReturnData[]>(BASE_URL);
}

// 根据 id 查询某一条数据：GET /api/surveys/:id，404 时返回 undefined
export async function getSurveyById(id: number): Promise<SurveyDBReturnData | undefined> {
  const res = await fetch(`${BASE_URL}/${id}`);
  // 不存在时后端返回 404，对应返回 undefined
  if (res.status === 404) {
    return undefined;
  }
  if (!res.ok) {
    throw new Error(`请求失败：${res.status} ${res.statusText}`);
  }
  return (await res.json()) as SurveyDBReturnData;
}

// 根据 id 删除某一条数据：DELETE /api/surveys/:id，返回是否成功
export async function deleteSurveyById(id: number): Promise<boolean> {
  const res = await request<{ success: boolean }>(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  return res.success;
}

// 根据 id 更新某一条数据：PUT /api/surveys/:id，返回是否成功
export async function updateSurveyById(id: number, data: Partial<SurveyDBData>): Promise<boolean> {
  const res = await request<{ success: boolean }>(`${BASE_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return res.success;
}
