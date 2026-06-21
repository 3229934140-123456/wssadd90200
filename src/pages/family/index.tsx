import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppContext } from '@/store/AppContext';
import CareTaskItem from '@/components/CareTaskItem';
import BigButton from '@/components/BigButton';
import { mealVoiceReminders } from '@/data/mockData';
import { formatDate, getDaysAfter, makePhoneCall, speakText, getTodayStr, addDays, getDateLabel } from '@/utils';
import type { CareTask } from '@/types';

const FamilyPage: React.FC = () => {
  const {
    userInfo,
    careTasks,
    careHistory,
    toggleCareTask,
    toggleCareTaskOnDate,
    resetCareTasks,
    resetCareTasksOnDate,
    getCareTasksForDate,
    updateCareNote,
    getActiveRecord
  } = useAppContext();

  const today = getTodayStr();
  const activeRecord = getActiveRecord();
  const surgeryPlan = activeRecord?.surgeryPlan;
  const daysAfter = useMemo(() => getDaysAfter(userInfo.surgeryDate), [userInfo.surgeryDate]);

  // 日历状态
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedDate, setSelectedDate] = useState(today);

  // 选中日期的任务（默认今天）
  const selectedTasks = useMemo(() => getCareTasksForDate(selectedDate), [selectedDate, careHistory, getCareTasksForDate]);
  const selectedEntry = careHistory[selectedDate];

  const completedCount = selectedTasks.filter((t) => t.checked).length;
  const allDone = selectedTasks.length > 0 && completedCount === selectedTasks.length;
  const progress = selectedTasks.length > 0 ? Math.round((completedCount / selectedTasks.length) * 100) : 0;

  // 今天已完成数量（从careTasks里取）
  const todayCompleted = careTasks?.filter((t) => t.checked).length || 0;

  // 日历计算
  const calendarDays = useMemo(() => {
    const [year, month] = currentMonth.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startWeekday = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const arr: (string | null)[] = [];
    for (let i = 0; i < startWeekday; i++) arr.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      arr.push(`${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
    }
    return arr;
  }, [currentMonth]);

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  const monthLabel = useMemo(() => {
    const [y, m] = currentMonth.split('-');
    return `${y}年${m}月`;
  }, [currentMonth]);

  const prevMonth = () => {
    const [y, m] = currentMonth.split('-').map(Number);
    const prev = new Date(y, m - 2, 1);
    setCurrentMonth(`${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`);
  };
  const nextMonth = () => {
    const [y, m] = currentMonth.split('-').map(Number);
    const next = new Date(y, m, 1);
    setCurrentMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`);
  };

  const getDayCompletedCount = (date: string): number => {
    const entry = careHistory[date];
    if (!entry) return 0;
    return entry.tasks.filter((t) => t.checked).length;
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
  };

  const handleToggleTask = (taskId: string) => {
    if (selectedDate === today) {
      toggleCareTask(taskId);
    } else {
      toggleCareTaskOnDate(selectedDate, taskId);
    }
  };

  const handleReset = () => {
    Taro.showModal({
      title: '提示',
      content: allDone
        ? `确定要重置${getDateLabel(selectedDate)}的所有任务吗？`
        : `确定要标记${getDateLabel(selectedDate)}的全部任务已完成吗？`,
      success: (res) => {
        if (res.confirm) {
          if (allDone) {
            if (selectedDate === today) resetCareTasks();
            else resetCareTasksOnDate(selectedDate);
            Taro.showToast({ title: '已重置', icon: 'success' });
          } else {
            selectedTasks.forEach((t) => {
              if (!t.checked) handleToggleTask(t.id);
            });
            Taro.showToast({ title: '已全部完成', icon: 'success' });
          }
        }
      }
    });
  };

  const handleMealVoice = (meal: 'breakfast' | 'lunch' | 'dinner') => {
    speakText(mealVoiceReminders[meal]);
  };

  const handleCallNurse = () => makePhoneCall(userInfo.nursePhone);
  const handleCallCustomer = () => makePhoneCall(userInfo.phone);

  const handleSaveNote = (value: string) => {
    updateCareNote(selectedDate, value);
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <View className={styles.userCard}>
          <Text className={styles.cardTitle}>👵 您正在照护</Text>
          <Text className={styles.userName}>{userInfo.name}</Text>
          <Text className={styles.userInfo}>
            {userInfo.projectName} · 术后第{daysAfter}天 · {formatDate(userInfo.surgeryDate)}手术
            {surgeryPlan?.stitchRemovalDate && ` · 预计${formatDate(surgeryPlan.stitchRemovalDate)}拆线`}
          </Text>
        </View>

        <View className={styles.tipsCard}>
          <Text className={styles.tipsTitle}>💡 照护小贴士</Text>
          <Text className={styles.tipsText}>
            每天做好清淡饮食、按时提醒吃药、观察伤口情况，记得打勾记录哦。
            有任何异常随时联系护士 {userInfo.nurseName}。
          </Text>
        </View>

        <View className={styles.syncBanner}>
          <View className={styles.syncLeft}>
            <Text className={styles.syncIcon}>🔄</Text>
            <View>
              <Text className={styles.syncText}>与顾客端实时同步</Text>
              <Text className={styles.syncSubText}>打勾后顾客也能看到</Text>
            </View>
          </View>
          <View className={styles.syncStatus}>
            <View className={styles.statusDot} />
            <Text className={styles.statusText}>已同步</Text>
          </View>
        </View>
      </View>

      {surgeryPlan && (
        <View className={styles.planTipCard}>
          <Text className={styles.planTipTitle}>📋 护士制定的术后计划</Text>
          <Text className={styles.planTipText}>
            {surgeryPlan.dailyCareFocus}
          </Text>
          {surgeryPlan.medicationPlan && (
            <Text className={styles.planTipText} style={{ marginTop: 8, color: '#165DFF' }}>
              💊 {surgeryPlan.medicationPlan}
            </Text>
          )}
        </View>
      )}

      {/* 照护日历 */}
      <View className={styles.calendarSection}>
        <View className={styles.sectionTitle}>
          <Text className={styles.titleText}>📅 照护日历</Text>
          <Text className={styles.progressBadge}>今天已完成 {todayCompleted}/4</Text>
        </View>

        <View className={styles.calendarCard}>
          <View className={styles.calendarHeader}>
            <Text className={styles.calendarMonth}>{monthLabel}</Text>
            <View className={styles.calendarNav}>
              <View className={styles.calendarNavBtn} onClick={prevMonth}>‹</View>
              <View className={styles.calendarNavBtn} onClick={() => {
                const d = new Date();
                setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
                setSelectedDate(today);
              }}>今</View>
              <View className={styles.calendarNavBtn} onClick={nextMonth}>›</View>
            </View>
          </View>

          <View className={styles.calendarWeekRow}>
            {weekDays.map((w) => (
              <View key={w} className={styles.calendarWeekDay}>{w}</View>
            ))}
          </View>

          <View className={styles.calendarDays}>
            {calendarDays.map((date, idx) => {
              if (!date) return <View key={`empty-${idx}`} className={`${styles.calendarDay} ${styles.calendarDayEmpty}`} />;
              const dayNum = date.split('-')[2];
              const isToday = date === today;
              const isSelected = date === selectedDate;
              const dayDoneCount = getDayCompletedCount(date);
              const dayTotal = 4;
              const dots: number[] = [];
              for (let i = 0; i < Math.min(dayDoneCount, 4); i++) dots.push(i);

              return (
                <View
                  key={date}
                  className={`${styles.calendarDay} ${isToday ? styles.calendarDayToday : ''} ${isSelected ? styles.calendarDaySelected : ''}`}
                  onClick={() => handleSelectDate(date)}
                >
                  <Text className={styles.calendarDayNumber}>{Number(dayNum)}</Text>
                  {dots.length > 0 && (
                    <View className={styles.calendarDayDots}>
                      {dots.map((d) => <View key={d} className={styles.calendarDot} />)}
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          <View className={styles.calendarLegend}>
            <View className={styles.legendItem}>
              <View className={styles.legendDot} />
              <Text>已完成</Text>
            </View>
            <View className={styles.legendItem}>
              <View className={styles.legendRing} />
              <Text>今天</Text>
            </View>
            <View className={styles.legendItem}>
              <View className={styles.legendFill} />
              <Text>选中</Text>
            </View>
          </View>

          <View className={styles.calendarSelectedInfo}>
            <Text className={styles.selectedDateTitle}>
              📍 {formatDate(selectedDate)}（{getDateLabel(selectedDate)}）
            </Text>
            <View className={styles.selectedDateStats}>
              <View className={styles.statItem}>
                <Text className={styles.statNum}>{completedCount}</Text>
                <Text className={styles.statLabel}>已完成</Text>
              </View>
              <View className={styles.statItem}>
                <Text className={styles.statNum}>{selectedTasks.length - completedCount}</Text>
                <Text className={styles.statLabel}>待完成</Text>
              </View>
              <View className={styles.statItem}>
                <Text className={styles.statNum}>{progress}%</Text>
                <Text className={styles.statLabel}>完成率</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.sectionTitle}>
        <Text className={styles.titleText}>✅ {getDateLabel(selectedDate)}照护清单</Text>
        <Text className={styles.progressBadge}>{completedCount}/{selectedTasks.length}</Text>
      </View>

      <View className={styles.progressBar}>
        <View className={styles.progressFill} style={{ width: `${progress}%` }} />
      </View>

      {allDone && (
        <View className={styles.doneBanner}>
          <Text className={styles.doneIcon}>🎉</Text>
          <View>
            <Text className={styles.doneText}>太棒了，全部完成！</Text>
            <Text className={styles.doneSub}>
              {selectedDate === today ? '今天' : selectedDate} 的照护任务全部做好了
            </Text>
          </View>
        </View>
      )}

      {selectedTasks.map((task: CareTask) => (
        <CareTaskItem
          key={task.id}
          data={task}
          disabled={false}
          onToggle={() => handleToggleTask(task.id)}
        />
      ))}

      <View style={{ marginBottom: 24 }}>
        <BigButton
          text={allDone ? '重置当天任务' : `一键全部完成（${getDateLabel(selectedDate)}）`}
          icon={allDone ? '🔄' : '✅'}
          type={allDone ? 'default' : 'warning'}
          onClick={handleReset}
        />
      </View>

      <View className={styles.noteSection}>
        <View className={styles.sectionTitle}>
          <Text className={styles.titleText}>📝 {getDateLabel(selectedDate)}观察记录</Text>
        </View>
        <View className={styles.noteCard}>
          <Text className={styles.noteTitle}>当天照护备注（护士可见）</Text>
          <Input
            type="textarea"
            className={styles.noteInput}
            placeholder="记录今天的恢复情况、有什么异常等..."
            value={selectedEntry?.notes || ''}
            onInput={(e) => handleSaveNote(e.detail.value)}
            onBlur={(e) => handleSaveNote(e.detail.value)}
            maxlength={300}
          />
          {selectedEntry?.updatedAt && (
            <Text style={{ fontSize: 22, color: '#86909C', marginTop: 8 }}>
              最后更新：{selectedEntry.updatedAt}
            </Text>
          )}
        </View>
      </View>

      <View className={styles.reminderSection}>
        <View className={styles.sectionTitle}>
          <Text className={styles.titleText}>🔔 三餐提醒</Text>
        </View>
        {[
          { key: 'breakfast' as const, icon: '🌅', title: '早饭前提醒', time: '7:30 - 8:30' },
          { key: 'lunch' as const, icon: '☀️', title: '午饭前提醒', time: '11:30 - 12:30' },
          { key: 'dinner' as const, icon: '🌙', title: '晚饭前提醒', time: '17:30 - 18:30' }
        ].map((meal) => (
          <View key={meal.key} className={styles.reminderCard}>
            <View className={styles.reminderHeader}>
              <Text className={styles.reminderTitle}>
                <Text className={styles.reminderIcon}>{meal.icon}</Text>
                {meal.title}
              </Text>
              <Text className={styles.reminderTime}>{meal.time}</Text>
            </View>
            <Text className={styles.reminderContent}>
              {mealVoiceReminders[meal.key]}
            </Text>
            <View className={styles.reminderActions}>
              <View className={`${styles.reminderBtn} ${styles.reminderBtnPrimary}`} onClick={() => handleMealVoice(meal.key)}>
                <Text className={styles.reminderBtnText}>🔊 语音播报</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View className={styles.contactSection}>
        <View className={styles.sectionTitle}>
          <Text className={styles.titleText}>📞 紧急联系</Text>
        </View>
        <View className={styles.contactCard}>
          <Text className={styles.contactTitle}>随时联系，有问题别犹豫</Text>

          <View className={styles.contactRow}>
            <View className={styles.contactInfo}>
              <Text className={styles.contactIcon}>👩‍⚕️</Text>
              <View>
                <Text className={styles.contactName}>{userInfo.nurseName}</Text>
                <Text className={styles.contactRole}>专属护士 · 一对一服务</Text>
              </View>
            </View>
            <View className={styles.contactBtn} onClick={handleCallNurse}>
              <Text className={styles.contactBtnText}>📞 拨打电话</Text>
            </View>
          </View>

          <View className={styles.contactRow}>
            <View className={styles.contactInfo}>
              <Text className={styles.contactIcon}>👵</Text>
              <View>
                <Text className={styles.contactName}>{userInfo.name}</Text>
                <Text className={styles.contactRole}>顾客本人</Text>
              </View>
            </View>
            <View className={styles.contactBtn} onClick={handleCallCustomer}>
              <Text className={styles.contactBtnText}>📞 拨打电话</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

export default FamilyPage;
