import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import Taro from '@tarojs/taro';
import type { CareTask, AbnormalReport, UserInfo, RecordItem, DailyCareEntry, SurgeryPlan, NurseFollowUpNote } from '@/types';
import { defaultCareTasks, userInfo as mockUserInfo, abnormalReports as mockReports, historyRecords as mockRecords, demoDailyCareHistory, defaultSurgeryPlan } from '@/data/mockData';
import { getTodayStr, addDays } from '@/utils';

interface AppState {
  userInfo: UserInfo;
  careTasks: CareTask[]; // 兼容旧接口，始终=今天的任务
  careHistory: Record<string, DailyCareEntry>; // 照护日历：日期 -> 当日照护记录
  reports: AbnormalReport[];
  records: RecordItem[];
  isProfileSetup: boolean;
  activeRecordId: string | null;
}

interface AppContextType extends AppState {
  // 照护任务（兼容今天+按日期）
  toggleCareTask: (id: string) => void;
  toggleCareTaskOnDate: (date: string, id: string) => void;
  resetCareTasks: () => void;
  resetCareTasksOnDate: (date: string) => void;
  getCareTasksForDate: (date: string) => CareTask[];
  updateCareNote: (date: string, notes: string) => void;

  // 异常上报
  addReport: (report: AbnormalReport) => void;

  // 用户信息
  updateUserInfo: (info: Partial<UserInfo>) => void;
  saveProfile: (info: UserInfo, plan?: Partial<SurgeryPlan>, nextFollowUp?: string) => void;

  // 复诊记录
  addRecord: (record: RecordItem) => void;
  updateRecord: (id: string, update: Partial<RecordItem>) => void;
  setActiveRecord: (id: string) => void;
  getActiveRecord: () => RecordItem | null;

  // 术后计划（在活跃record上操作）
  updateSurgeryPlan: (plan: Partial<SurgeryPlan>) => void;

  // 护士回访
  addNurseNote: (recordId: string, note: Omit<NurseFollowUpNote, 'id' | 'createdAt'>) => void;
  updateNurseNote: (recordId: string, noteId: string, update: Partial<NurseFollowUpNote>) => void;

  resetAllData: () => void;
}

const STORAGE_KEYS = {
  USER_INFO: 'app_user_info',
  CARE_TASKS: 'app_care_tasks',
  CARE_HISTORY: 'app_care_history',
  REPORTS: 'app_reports',
  RECORDS: 'app_records',
  IS_SETUP: 'app_is_profile_setup',
  ACTIVE_RECORD: 'app_active_record_id'
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

const cloneDefaultTasks = (): CareTask[] =>
  defaultCareTasks.map((t) => ({ ...t, checked: false, checkedTime: undefined }));

const makeTodayEntry = (date: string): DailyCareEntry => ({
  date,
  tasks: cloneDefaultTasks(),
  notes: '',
  updatedAt: new Date().toLocaleString('zh-CN')
});

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userInfo, setUserInfo] = useState<UserInfo>(loadFromStorage(STORAGE_KEYS.USER_INFO, mockUserInfo));
  const [careHistory, setCareHistory] = useState<Record<string, DailyCareEntry>>(
    loadFromStorage(STORAGE_KEYS.CARE_HISTORY, demoDailyCareHistory)
  );
  const [reports, setReports] = useState<AbnormalReport[]>(loadFromStorage(STORAGE_KEYS.REPORTS, mockReports));
  const [records, setRecords] = useState<RecordItem[]>(loadFromStorage(STORAGE_KEYS.RECORDS, mockRecords));
  const [isProfileSetup, setIsProfileSetup] = useState<boolean>(loadFromStorage(STORAGE_KEYS.IS_SETUP, false));
  const [activeRecordId, setActiveRecordId] = useState<string | null>(
    loadFromStorage<string | null>(STORAGE_KEYS.ACTIVE_RECORD, null) || mockRecords.find((r) => r.isActive)?.id || null
  );

  // 今天的careTasks是careHistory的派生
  const today = getTodayStr();
  const careTasks: CareTask[] = useMemo(() => {
    return careHistory[today]?.tasks || cloneDefaultTasks();
  }, [careHistory, today]);

  useEffect(() => { saveToStorage(STORAGE_KEYS.USER_INFO, userInfo); }, [userInfo]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.CARE_HISTORY, careHistory); }, [careHistory]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.REPORTS, reports); }, [reports]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.RECORDS, records); }, [records]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.IS_SETUP, isProfileSetup); }, [isProfileSetup]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.ACTIVE_RECORD, activeRecordId); }, [activeRecordId]);

  const getCareTasksForDate = useCallback((date: string): CareTask[] => {
    return careHistory[date]?.tasks || cloneDefaultTasks();
  }, [careHistory]);

  const toggleCareTaskOnDate = useCallback((date: string, id: string) => {
    setCareHistory((prev) => {
      const entry = prev[date] || makeTodayEntry(date);
      const newTasks = entry.tasks.map((t) =>
        t.id === id
          ? { ...t, checked: !t.checked, checkedTime: !t.checked ? new Date().toLocaleString('zh-CN') : undefined }
          : t
      );
      return {
        ...prev,
        [date]: { date, tasks: newTasks, notes: entry.notes, updatedAt: new Date().toLocaleString('zh-CN') }
      };
    });
  }, []);

  const toggleCareTask = useCallback((id: string) => {
    toggleCareTaskOnDate(today, id);
  }, [toggleCareTaskOnDate, today]);

  const resetCareTasksOnDate = useCallback((date: string) => {
    setCareHistory((prev) => {
      const entry = prev[date] || makeTodayEntry(date);
      return {
        ...prev,
        [date]: {
          date,
          tasks: cloneDefaultTasks(),
          notes: entry.notes,
          updatedAt: new Date().toLocaleString('zh-CN')
        }
      };
    });
  }, []);

  const resetCareTasks = useCallback(() => {
    resetCareTasksOnDate(today);
  }, [resetCareTasksOnDate, today]);

  const updateCareNote = useCallback((date: string, notes: string) => {
    setCareHistory((prev) => {
      const entry = prev[date] || makeTodayEntry(date);
      return {
        ...prev,
        [date]: { ...entry, date, notes, updatedAt: new Date().toLocaleString('zh-CN') }
      };
    });
  }, []);

  const addReport = useCallback((report: AbnormalReport) => {
    setReports((prev) => [report, ...prev]);
  }, []);

  const updateUserInfo = useCallback((info: Partial<UserInfo>) => {
    setUserInfo((prev) => ({ ...prev, ...info }));
  }, []);

  const saveProfile = useCallback((info: UserInfo, plan?: Partial<SurgeryPlan>, nextFollowUp?: string) => {
    setUserInfo(info);
    setIsProfileSetup(true);

    // 计算拆线日期默认值（术后7天）
    const stitchDate = plan?.stitchRemovalDate || addDays(info.surgeryDate, 7);

    const newPlan: SurgeryPlan = {
      stitchRemovalDate: stitchDate,
      dailyCareFocus: plan?.dailyCareFocus || defaultSurgeryPlan.dailyCareFocus,
      forbiddenInstructions: plan?.forbiddenInstructions || defaultSurgeryPlan.forbiddenInstructions,
      followUpReminder: plan?.followUpReminder || defaultSurgeryPlan.followUpReminder,
      medicationPlan: plan?.medicationPlan || defaultSurgeryPlan.medicationPlan
    };

    const notesText = `${info.projectName}术后恢复计划。${newPlan.dailyCareFocus}`;

    const newRecord: RecordItem = {
      id: Date.now().toString(),
      projectName: info.projectName,
      surgeryDate: info.surgeryDate,
      doctorName: info.nurseName,
      nextFollowUp,
      notes: notesText,
      forbidFoods: plan?.forbiddenInstructions
        ? ['辛辣', '酒精', '海鲜']
        : ['辛辣', '酒精', '海鲜'],
      recommendFoods: ['鸡蛋', '牛奶', '瘦肉', '蔬菜', '水果'],
      surgeryPlan: newPlan,
      nurseNotes: [],
      isActive: true
    };

    setRecords((prev) => {
      // 旧活跃记录取消活跃
      const others = prev.map((r) => ({ ...r, isActive: false }));
      return [newRecord, ...others];
    });
    setActiveRecordId(newRecord.id);

    // 同步到userInfo
    setUserInfo((prev) => ({ ...prev, activePlanId: newRecord.id }));

    console.log('[建档成功]', info.name, info.projectName, 'activeRecordId=', newRecord.id);
  }, []);

  const addRecord = useCallback((record: RecordItem) => {
    setRecords((prev) => [record, ...prev]);
  }, []);

  const updateRecord = useCallback((id: string, update: Partial<RecordItem>) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...update } : r))
    );
  }, []);

  const setActiveRecord = useCallback((id: string) => {
    setRecords((prev) =>
      prev.map((r) => ({ ...r, isActive: r.id === id }))
    );
    setActiveRecordId(id);
    const record = records.find((r) => r.id === id);
    if (record) {
      setUserInfo((prev) => ({
        ...prev,
        projectName: record.projectName,
        surgeryDate: record.surgeryDate,
        nurseName: record.doctorName,
        activePlanId: id
      }));
    }
  }, [records]);

  const getActiveRecord = useCallback((): RecordItem | null => {
    if (activeRecordId) {
      const r = records.find((x) => x.id === activeRecordId);
      if (r) return r;
    }
    return records.find((r) => r.isActive) || records[0] || null;
  }, [activeRecordId, records]);

  const updateSurgeryPlan = useCallback((plan: Partial<SurgeryPlan>) => {
    const record = getActiveRecord();
    if (!record) return;
    const merged: SurgeryPlan = {
      ...(record.surgeryPlan || defaultSurgeryPlan),
      ...plan
    };
    updateRecord(record.id, { surgeryPlan: merged });
  }, [getActiveRecord, updateRecord]);

  const addNurseNote = useCallback((recordId: string, note: Omit<NurseFollowUpNote, 'id' | 'createdAt'>) => {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id !== recordId) return r;
        const newNote: NurseFollowUpNote = {
          ...note,
          id: 'n' + Date.now(),
          createdAt: new Date().toLocaleString('zh-CN')
        };
        return { ...r, nurseNotes: [newNote, ...(r.nurseNotes || [])] };
      })
    );
  }, []);

  const updateNurseNote = useCallback((recordId: string, noteId: string, update: Partial<NurseFollowUpNote>) => {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.id !== recordId) return r;
        return {
          ...r,
          nurseNotes: (r.nurseNotes || []).map((n) => (n.id === noteId ? { ...n, ...update } : n))
        };
      })
    );
  }, []);

  const resetAllData = useCallback(() => {
    setUserInfo(mockUserInfo);
    setCareHistory(demoDailyCareHistory);
    setReports(mockReports);
    setRecords(mockRecords);
    setIsProfileSetup(false);
    const active = mockRecords.find((r) => r.isActive);
    setActiveRecordId(active?.id || null);
    Object.values(STORAGE_KEYS).forEach((key) => {
      try { Taro.removeStorageSync(key); } catch {}
    });
  }, []);

  const value = useMemo(
    () => ({
      userInfo,
      careTasks,
      careHistory,
      reports,
      records,
      isProfileSetup,
      activeRecordId,
      toggleCareTask,
      toggleCareTaskOnDate,
      resetCareTasks,
      resetCareTasksOnDate,
      getCareTasksForDate,
      updateCareNote,
      addReport,
      updateUserInfo,
      saveProfile,
      addRecord,
      updateRecord,
      setActiveRecord,
      getActiveRecord,
      updateSurgeryPlan,
      addNurseNote,
      updateNurseNote,
      resetAllData
    }),
    [
      userInfo, careTasks, careHistory, reports, records, isProfileSetup, activeRecordId,
      toggleCareTask, toggleCareTaskOnDate, resetCareTasks, resetCareTasksOnDate,
      getCareTasksForDate, updateCareNote, addReport, updateUserInfo, saveProfile,
      addRecord, updateRecord, setActiveRecord, getActiveRecord, updateSurgeryPlan,
      addNurseNote, updateNurseNote, resetAllData
    ]
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
