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
  emoji?: string;
  relatedFoods?: string[];
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

// 家属照护任务（单日）
export interface CareTask {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  checkedTime?: string;
}

// 照护日历条目：某一天的完整照护情况
export interface DailyCareEntry {
  date: string; // YYYY-MM-DD
  tasks: CareTask[]; // 当天的任务及完成情况
  notes?: string; // 当天额外观察记录
  updatedAt: string;
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
  firstSteps: string[];
  contactTime: string;
  urgent: boolean;
  emoji: string;
  label: string;
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
  createdAt?: number;
}

// 护士回访记录
export interface NurseFollowUpNote {
  id: string;
  date: string; // 回访日期
  nurseName: string;
  recoveryStatus: string; // 恢复情况
  nextNotes: string; // 下次注意事项
  createdAt: string;
}

// 术后恢复计划（护士建档时填写）
export interface SurgeryPlan {
  stitchRemovalDate?: string; // 拆线日期
  dailyCareFocus: string; // 每天护理重点
  forbiddenInstructions: string; // 禁忌说明
  followUpReminder: string; // 复诊提醒
  medicationPlan?: string; // 用药计划
}

// 复诊记录
export interface RecordItem {
  id: string;
  projectName: string;
  surgeryDate: string;
  doctorName: string;
  nextFollowUp?: string;
  notes: string; // 医生叮嘱/术后计划
  forbidFoods: string[];
  recommendFoods: string[];
  // 新增字段：更完整的术后计划
  surgeryPlan?: SurgeryPlan;
  // 新增字段：护士回访记录（可以有多次）
  nurseNotes?: NurseFollowUpNote[];
  // 新增字段：是否为当前活跃的术后计划（建档时自动设为true）
  isActive?: boolean;
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
  // 建档时同时保存术后计划
  activePlanId?: string; // 关联的活跃RecordItem
}

// 语音提醒
export interface VoiceReminder {
  id: string;
  mealTime: 'breakfast' | 'lunch' | 'dinner';
  time: string;
  content: string;
}
