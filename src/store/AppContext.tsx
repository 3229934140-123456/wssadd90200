import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import Taro from '@tarojs/taro';
import type { CareTask, AbnormalReport, UserInfo, RecordItem } from '@/types';
import { defaultCareTasks, userInfo as mockUserInfo, abnormalReports as mockReports, historyRecords as mockRecords } from '@/data/mockData';

interface AppState {
  userInfo: UserInfo;
  careTasks: CareTask[];
  reports: AbnormalReport[];
  records: RecordItem[];
  isProfileSetup: boolean;
}

interface AppContextType extends AppState {
  toggleCareTask: (id: string) => void;
  addReport: (report: AbnormalReport) => void;
  updateUserInfo: (info: Partial<UserInfo>) => void;
  saveProfile: (info: UserInfo) => void;
  addRecord: (record: RecordItem) => void;
  updateRecord: (id: string, record: Partial<RecordItem>) => void;
  resetCareTasks: () => void;
  resetAllData: () => void;
}

const STORAGE_KEYS = {
  USER_INFO: 'app_user_info',
  CARE_TASKS: 'app_care_tasks',
  REPORTS: 'app_reports',
  RECORDS: 'app_records',
  IS_SETUP: 'app_is_profile_setup'
};

const loadFromStorage = <T,>(key: string, fallback: T): T => {
  try {
    const stored = Taro.getStorageSync(key);
    if (stored) return JSON.parse(stored) as T;
  } catch (e) {
    console.warn(`[Storage] 读取 ${key} 失败:`, e);
  }
  return fallback;
};

const saveToStorage = (key: string, data: any): void => {
  try {
    Taro.setStorageSync(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`[Storage] 写入 ${key} 失败:`, e);
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userInfo, setUserInfo] = useState<UserInfo>(loadFromStorage(STORAGE_KEYS.USER_INFO, mockUserInfo));
  const [careTasks, setCareTasks] = useState<CareTask[]>(loadFromStorage(STORAGE_KEYS.CARE_TASKS, defaultCareTasks));
  const [reports, setReports] = useState<AbnormalReport[]>(loadFromStorage(STORAGE_KEYS.REPORTS, mockReports));
  const [records, setRecords] = useState<RecordItem[]>(loadFromStorage(STORAGE_KEYS.RECORDS, mockRecords));
  const [isProfileSetup, setIsProfileSetup] = useState<boolean>(loadFromStorage(STORAGE_KEYS.IS_SETUP, false));

  useEffect(() => { saveToStorage(STORAGE_KEYS.USER_INFO, userInfo); }, [userInfo]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.CARE_TASKS, careTasks); }, [careTasks]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.REPORTS, reports); }, [reports]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.RECORDS, records); }, [records]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.IS_SETUP, isProfileSetup); }, [isProfileSetup]);

  const toggleCareTask = useCallback((id: string) => {
    setCareTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              checked: !task.checked,
              checkedTime: !task.checked ? new Date().toLocaleString('zh-CN') : undefined
            }
          : task
      )
    );
  }, []);

  const resetCareTasks = useCallback(() => {
    setCareTasks((prev) =>
      prev.map((task) => ({
        ...task,
        checked: false,
        checkedTime: undefined
      }))
    );
  }, []);

  const addReport = useCallback((report: AbnormalReport) => {
    setReports((prev) => [report, ...prev]);
  }, []);

  const updateUserInfo = useCallback((info: Partial<UserInfo>) => {
    setUserInfo((prev) => ({ ...prev, ...info }));
  }, []);

  const saveProfile = useCallback((info: UserInfo) => {
    setUserInfo(info);
    setIsProfileSetup(true);
    const newRecord: RecordItem = {
      id: Date.now().toString(),
      projectName: info.projectName,
      surgeryDate: info.surgeryDate,
      doctorName: info.nurseName,
      nextFollowUp: undefined,
      notes: `${info.projectName}术后恢复计划，请按护士叮嘱注意饮食和休息。`,
      forbidFoods: ['辛辣', '酒精', '海鲜'],
      recommendFoods: ['鸡蛋', '牛奶', '瘦肉', '蔬菜', '水果']
    };
    setRecords((prev) => [newRecord, ...prev]);
    console.log('[建档成功]', info.name, info.projectName);
  }, []);

  const addRecord = useCallback((record: RecordItem) => {
    setRecords((prev) => [record, ...prev]);
  }, []);

  const updateRecord = useCallback((id: string, update: Partial<RecordItem>) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...update } : r))
    );
  }, []);

  const resetAllData = useCallback(() => {
    setUserInfo(mockUserInfo);
    setCareTasks(defaultCareTasks);
    setReports(mockReports);
    setRecords(mockRecords);
    setIsProfileSetup(false);
    Object.values(STORAGE_KEYS).forEach((key) => {
      try { Taro.removeStorageSync(key); } catch {}
    });
  }, []);

  const value = useMemo(
    () => ({
      userInfo,
      careTasks,
      reports,
      records,
      isProfileSetup,
      toggleCareTask,
      addReport,
      updateUserInfo,
      saveProfile,
      addRecord,
      updateRecord,
      resetCareTasks,
      resetAllData
    }),
    [userInfo, careTasks, reports, records, isProfileSetup, toggleCareTask, addReport, updateUserInfo, saveProfile, addRecord, updateRecord, resetCareTasks, resetAllData]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
