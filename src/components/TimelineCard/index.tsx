import { useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import type { RecordItem, DailyCareEntry, NurseFollowUpNote } from '@/types';
import { getDaysAfter, formatDate, getTodayStr } from '@/utils';
import styles from './index.module.scss';

export type TimelineItemType =
  | 'surgery'      // 手术日
  | 'stitch'       // 拆线日
  | 'followup'     // 复诊
  | 'nurse_note'   // 护士回访
  | 'care_done'    // 家属照护打卡完成
  | 'today';       // 今天

export interface TimelineItem {
  date: string;           // YYYY-MM-DD
  type: TimelineItemType;
  title: string;
  description?: string;
  status?: 'done' | 'current' | 'pending';
  doneCount?: number;     // 照护任务完成数量
  totalCount?: number;    // 照护任务总数
  note?: NurseFollowUpNote;
}

interface Props {
  record: RecordItem;
  careHistory: Record<string, DailyCareEntry>;
  dailyTotalTasks?: number;
}

const STATUS_META: Record<TimelineItemType, { icon: string; color: string; label: string }> = {
  surgery:    { icon: '🏥', color: '#165DFF', label: '手术日' },
  stitch:     { icon: '✂️',  color: '#722ED1', label: '拆线日' },
  followup:   { icon: '📅', color: '#FF7D00', label: '复诊' },
  nurse_note: { icon: '💬', color: '#4ECDC4', label: '护士回访' },
  care_done:  { icon: '✅', color: '#00B42A', label: '照护打卡' },
  today:      { icon: '📍', color: '#F53F3F', label: '今天' },
};

const STATUS_LABEL_MAP: Record<string, string> = {
  good: '恢复良好',
  caution: '需注意',
  visit: '建议到院',
};

const STATUS_COLOR_MAP: Record<string, string> = {
  good: '#00B42A',
  caution: '#FF7D00',
  visit: '#F53F3F',
};

const TimelineCard: React.FC<Props> = ({ record, careHistory, dailyTotalTasks = 4 }) => {
  const today = getTodayStr();

  const items = useMemo((): TimelineItem[] => {
    const list: TimelineItem[] = [];

    // 1. 手术日
    if (record.surgeryDate) {
      list.push({
        date: record.surgeryDate,
        type: 'surgery',
        title: `${record.projectName || record.project || '手术'}`,
        description: `手术日 · ${formatDate(record.surgeryDate)}`,
        status: 'done',
      });
    }

    // 2. 拆线日
    if (record.surgeryPlan?.stitchRemovalDate) {
      const stitchDate = record.surgeryPlan.stitchRemovalDate;
      list.push({
        date: stitchDate,
        type: 'stitch',
        title: '拆线',
        description: stitchDate < today ? '已完成拆线' : (stitchDate === today ? '今天拆线' : `预计${getDaysAfter(stitchDate)}天后拆线`),
        status: stitchDate <= today ? 'done' : 'pending',
      });
    }

    // 3. 下次复诊
    if (record.nextFollowUp) {
      list.push({
        date: record.nextFollowUp,
        type: 'followup',
        title: '下次复诊',
        description: record.nextFollowUp < today
          ? '复诊日期已过，请联系护士安排新的复诊'
          : (record.nextFollowUp === today ? '今天复诊，请按时到院'
            : `${getDaysAfter(record.nextFollowUp)}天后复诊`),
        status: record.nextFollowUp <= today ? 'current' : 'pending',
      });
    }

    // 4. 护士回访记录
    if (record.nurseNotes && record.nurseNotes.length > 0) {
      record.nurseNotes.forEach((note) => {
        list.push({
          date: note.date,
          type: 'nurse_note',
          title: `护士回访 - ${note.nurseName || '护士'}`,
          description: note.recoveryStatus,
          status: 'done',
          note,
        });
      });
    }

    // 5. 照护打卡（最近7天有完成任务的）
    const careDates = Object.keys(careHistory)
      .filter((d) => {
        const entry = careHistory[d];
        const done = entry?.tasks?.filter((t) => t.checked).length || 0;
        return done > 0;
      })
      .sort((a, b) => (a < b ? -1 : 1));

    // 只取最近 5 个有打卡的日期，避免时间线过长
    careDates.slice(-5).forEach((d) => {
      const entry = careHistory[d];
      const done = entry?.tasks?.filter((t) => t.checked).length || 0;
      const total = entry?.tasks?.length || dailyTotalTasks;
      list.push({
        date: d,
        type: 'care_done',
        title: '家属照护打卡',
        description: `完成 ${done}/${total} 项任务${entry?.notes ? ` · ${entry.notes.slice(0, 20)}` : ''}`,
        status: d <= today ? 'done' : 'pending',
        doneCount: done,
        totalCount: total,
      });
    });

    // 6. 今天（如果今天不在已有节点里就加一个今日标记）
    if (!list.find((it) => it.date === today)) {
      list.push({
        date: today,
        type: 'today',
        title: '今天',
        description: `术后第 ${getDaysAfter(record.surgeryDate)} 天`,
        status: 'current',
      });
    }

    // 按日期倒序（最新在上面）
    return list.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }, [record, careHistory, dailyTotalTasks, today]);

  if (items.length === 0) {
    return (
      <View className={styles.emptyWrap}>
        <Text className={styles.emptyIcon}>📊</Text>
        <Text className={styles.emptyText}>暂无恢复时间线</Text>
      </View>
    );
  }

  return (
    <View className={styles.card}>
      <View className={styles.header}>
        <Text className={styles.titleText}>📊 术后恢复时间线</Text>
        <Text className={styles.subText}>按日期记录每一步恢复</Text>
      </View>

      <View className={styles.timeline}>
        {items.map((item, idx) => {
          const meta = STATUS_META[item.type];
          const isLast = idx === items.length - 1;
          return (
            <View key={`${item.date}-${item.type}-${idx}`} className={styles.timelineRow}>
              {/* 左侧时间轴 */}
              <View className={styles.timelineAxis}>
                <View
                  className={`${styles.timelineDot} ${item.status === 'done' ? styles.dotDone : item.status === 'current' ? styles.dotCurrent : styles.dotPending}`}
                  style={{ backgroundColor: meta.color }}
                >
                  <Text className={styles.dotIcon}>{meta.icon}</Text>
                </View>
                {!isLast && (
                  <View
                    className={`${styles.timelineLine} ${item.status === 'done' ? styles.lineDone : styles.linePending}`}
                  />
                )}
              </View>

              {/* 右侧内容 */}
              <View className={styles.timelineContent}>
                <View className={styles.contentHeader}>
                  <Text className={styles.contentDate}>
                    {formatDate(item.date)}
                    {item.type !== 'surgery' && item.type !== 'today' && item.type !== 'followup' ? '' : ''}
                  </Text>
                  <Text className={styles.contentTag} style={{ color: meta.color, backgroundColor: `${meta.color}15` }}>
                    {meta.label}
                  </Text>
                </View>
                <Text className={styles.contentTitle}>{item.title}</Text>
                {item.description && (
                  <Text className={styles.contentDesc}>{item.description}</Text>
                )}

                {/* 护士回访状态标签 */}
                {item.type === 'nurse_note' && item.note?.status && (
                  <View className={styles.statusBadge} style={{ backgroundColor: `${STATUS_COLOR_MAP[item.note.status]}15` }}>
                    <Text className={styles.statusBadgeText} style={{ color: STATUS_COLOR_MAP[item.note.status] }}>
                      {STATUS_LABEL_MAP[item.note.status] || item.note.status}
                    </Text>
                  </View>
                )}

                {/* 照护完成进度 */}
                {item.type === 'care_done' && typeof item.doneCount === 'number' && (
                  <View className={styles.progressBar}>
                    <View
                      className={styles.progressFill}
                      style={{
                        width: `${Math.min(100, Math.round((item.doneCount / (item.totalCount || dailyTotalTasks)) * 100))}%`,
                      }}
                    />
                    <Text className={styles.progressText}>
                      {item.doneCount}/{item.totalCount || dailyTotalTasks} 完成
                    </Text>
                  </View>
                )}

                {/* 护士回访照片预览 */}
                {item.type === 'nurse_note' && item.note?.photos && item.note.photos.length > 0 && (
                  <View className={styles.photoRow}>
                    {item.note.photos.slice(0, 4).map((p, i) => (
                      <View key={i} className={styles.photoItem}>
                        <Text className={styles.photoIcon}>🖼️</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default TimelineCard;
