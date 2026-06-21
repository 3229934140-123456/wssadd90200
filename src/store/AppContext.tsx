import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { CareTask, AbnormalReport, UserInfo } from '@/types';
import { defaultCareTasks, userInfo as mockUserInfo, abnormalReports as mockReports } from '@/data/mockData';

interface AppState {
  userInfo: UserInfo;
  careTasks: CareTask[];
  reports: AbnormalReport[];
}

interface AppContextType extends AppState {
  toggleCareTask: (id: string) => void;
  addReport: (report: AbnormalReport) => void;
  updateUserInfo: (info: Partial<UserInfo>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userInfo, setUserInfo] = useState<UserInfo>(mockUserInfo);
  const [careTasks, setCareTasks] = useState<CareTask[]>(defaultCareTasks);
  const [reports, setReports] = useState<AbnormalReport[]>(mockReports);

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
    console.log('[照护任务更新]', id);
  }, []);

  const addReport = useCallback((report: AbnormalReport) => {
    setReports((prev) => [report, ...prev]);
    console.log('[异常上报新增]', report.id);
  }, []);

  const updateUserInfo = useCallback((info: Partial<UserInfo>) => {
    setUserInfo((prev) => ({ ...prev, ...info }));
  }, []);

  const value = useMemo(
    () => ({
      userInfo,
      careTasks,
      reports,
      toggleCareTask,
      addReport,
      updateUserInfo
    }),
    [userInfo, careTasks, reports, toggleCareTask, addReport, updateUserInfo]
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
