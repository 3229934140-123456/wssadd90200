// 食物查询结果类型
export type FoodStatus = 'allow' | 'caution' | 'forbid' | 'consult';

// 食物信息
export interface FoodItem {
  id: string;
  name: string;
  status: FoodStatus;
  reason: string;
  suggestion: string;
  category: string;
}

// 忌口提醒
export interface WarnItem {
  id: string;
  type: 'forbid' | 'caution';
  title: string;
  foods: string[];
  reason: string;
}

// 推荐食物
export interface RecommendItem {
  id: string;
  name: string;
  benefit: string;
  icon: string;
}

// 复诊信息
export interface FollowUpInfo {
  hasAppointment: boolean;
  date?: string;
  time?: string;
  note?: string;
  projectName: string;
  daysAfter: number;
}

// 家属照护任务
export interface CareTask {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  checkedTime?: string;
}

// 异常类型
export type AbnormalType = 'fever' | 'redness' | 'bleeding' | 'allergy' | 'pain' | 'other';

// 异常项
export interface AbnormalItem {
  id: string;
  type: AbnormalType;
  title: string;
  description: string;
  firstAction: string;
  contactTime: string;
  urgent: boolean;
}

// 异常上报记录
export interface AbnormalReport {
  id: string;
  type: AbnormalType;
  typeName: string;
  reportTime: string;
  photos?: string[];
  note?: string;
  status: 'submitted' | 'replied' | 'resolved';
}

// 复诊记录
export interface RecordItem {
  id: string;
  projectName: string;
  surgeryDate: string;
  doctorName: string;
  nextFollowUp?: string;
  notes: string;
  forbidFoods: string[];
  recommendFoods: string[];
}

// 用户信息
export interface UserInfo {
  name: string;
  age: number;
  phone: string;
  projectName: string;
  surgeryDate: string;
  nurseName: string;
  nursePhone: string;
  storeName: string;
  familyName?: string;
  familyPhone?: string;
}

// 语音提醒
export interface VoiceReminder {
  id: string;
  mealTime: 'breakfast' | 'lunch' | 'dinner';
  time: string;
  content: string;
}
