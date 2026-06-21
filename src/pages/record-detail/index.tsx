import { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Input, Textarea, Picker, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useAppContext } from '@/store/AppContext';
import { NurseFollowUpNote, RecordItem } from '@/types';
import { formatDate, getDateLabel } from '@/utils';
import styles from './index.module.scss';

const RecordDetailPage = () => {
  const router = useRouter();
  const { records, updateRecord, updateRecordNextFollowUp, addNurseNote, updateNurseNote } = useAppContext();
  const recordId = router.params?.id || '';

  const record = useMemo(() => records.find(r => r.id === recordId), [records, recordId]);

  // 编辑复诊日期
  const [editingFollowUp, setEditingFollowUp] = useState(false);
  const [tempNextDate, setTempNextDate] = useState('');

  // 新增护士回访记录
  const [addingNote, setAddingNote] = useState(false);
  const [noteNurseName, setNoteNurseName] = useState('李护士');
  const [noteRecovery, setNoteRecovery] = useState('');
  const [noteNextSteps, setNoteNextSteps] = useState('');

  // 编辑护士回访记录
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editNoteRecovery, setEditNoteRecovery] = useState('');
  const [editNoteNextSteps, setEditNoteNextSteps] = useState('');

  useEffect(() => {
    if (record) {
      setTempNextDate(record.nextFollowUp || '');
    }
  }, [recordId, record]);

  if (!record) {
    return (
      <View className={styles.page}>
        <Text>记录不存在</Text>
      </View>
    );
  }

  const goBack = () => {
    Taro.navigateBack({ delta: 1 }).catch(() => {
      Taro.switchTab({ url: '/pages/mine/index' });
    });
  };

  const handleSaveFollowUp = () => {
    if (!tempNextDate) {
      Taro.showToast({ title: '请选择复诊日期', icon: 'none' });
      return;
    }
    updateRecordNextFollowUp(recordId, tempNextDate);
    setEditingFollowUp(false);
    Taro.showToast({ title: '复诊日期已更新', icon: 'success' });
  };

  const handleAddNote = () => {
    if (!noteRecovery.trim()) {
      Taro.showToast({ title: '请填写恢复情况', icon: 'none' });
      return;
    }
    const newNote: NurseFollowUpNote = {
      id: `note_${Date.now()}`,
      date: formatDate(new Date()),
      nurseName: noteNurseName || '护士',
      recoveryStatus: noteRecovery,
      nextSteps: noteNextSteps,
      createdAt: new Date().toISOString(),
    };
    addNurseNote(recordId, newNote);
    setAddingNote(false);
    setNoteRecovery('');
    setNoteNextSteps('');
    Taro.showToast({ title: '回访记录已保存', icon: 'success' });
  };

  const startEditNote = (note: NurseFollowUpNote) => {
    setEditingNoteId(note.id);
    setEditNoteRecovery(note.recoveryStatus);
    setEditNoteNextSteps(note.nextSteps || '');
  };

  const handleSaveEditNote = () => {
    if (!editingNoteId) return;
    if (!editNoteRecovery.trim()) {
      Taro.showToast({ title: '请填写恢复情况', icon: 'none' });
      return;
    }
    updateNurseNote(recordId, editingNoteId, {
      recoveryStatus: editNoteRecovery,
      nextSteps: editNoteNextSteps,
    });
    setEditingNoteId(null);
    setEditNoteRecovery('');
    setEditNoteNextSteps('');
    Taro.showToast({ title: '回访记录已更新', icon: 'success' });
  };

  return (
    <ScrollView className={styles.page}>
      <View className={styles.backBtn} onClick={goBack}>
        <Text>←</Text>
        <Text className={styles.backText}>返回</Text>
      </View>

      {/* Hero 卡片 */}
      <View className={styles.heroCard}>
        <Text className={styles.heroIcon}>📋</Text>
        <Text className={styles.heroTitle}>{record.project}</Text>
        <Text className={styles.heroDate}>手术日期：{record.surgeryDate}</Text>
        {record.operator && (
          <Text className={styles.heroInfo}>操作护士：{record.operator}</Text>
        )}
        {record.familyContact && (
          <Text className={styles.heroInfo}>家属联系人：{record.familyContact}</Text>
        )}
        {record.isActive && (
          <View className={styles.activeBadge}>当前活跃计划</View>
        )}
      </View>

      {/* 下次复诊 */}
      {record.nextFollowUp ? (
        <View className={styles.followUpCard}>
          <Text className={styles.followUpLabel}>📅 下次复诊</Text>
          {!editingFollowUp ? (
            <>
              <Text className={styles.followUpDate}>{record.nextFollowUp}</Text>
              <Text className={styles.followUpNote}>
                {getDateLabel(record.nextFollowUp)}
                {record.surgeryPlan?.followUpReminder ? ` · ${record.surgeryPlan.followUpReminder}` : ''}
              </Text>
              <Button className={styles.addNoteBtn} onClick={() => setEditingFollowUp(true)}>修改复诊日期</Button>
            </>
          ) : (
            <>
              <Picker mode="date" value={tempNextDate} onChange={(e) => setTempNextDate(e.detail.value)}>
                <View className={styles.editInput}>{tempNextDate || '点击选择日期'}</View>
              </Picker>
              <View style={{ display: 'flex', gap: 16 }}>
                <Button onClick={() => setEditingFollowUp(false)} style={{ flex: 1, backgroundColor: '#EEE' }}>取消</Button>
                <Button onClick={handleSaveFollowUp} style={{ flex: 1 }}>保存</Button>
              </View>
            </>
          )}
        </View>
      ) : (
        <View className={styles.noFollowUp}>
          <Text className={styles.noFollowUpText}>暂无复诊安排</Text>
          <Button onClick={() => setEditingFollowUp(true)} style={{ marginTop: 16 }}>设置复诊日期</Button>
          {editingFollowUp && (
            <Picker mode="date" value={tempNextDate} onChange={(e) => setTempNextDate(e.detail.value)}>
              <View className={styles.editInput} style={{ marginTop: 16 }}>{tempNextDate || '点击选择日期'}</View>
            </Picker>
          )}
          {editingFollowUp && (
            <Button onClick={handleSaveFollowUp} style={{ marginTop: 16 }}>保存</Button>
          )}
        </View>
      )}

      {/* 术后恢复计划 */}
      {record.surgeryPlan && (
        <View className={styles.sectionCard}>
          <Text className={styles.cardTitle}>📋 术后恢复计划</Text>

          <View className={styles.infoGrid}>
            {record.surgeryPlan.stitchRemovalDate && (
              <View className={styles.infoItem}>
                <Text className={styles.infoLabel}>拆线日期</Text>
                <Text className={styles.infoValue}>{record.surgeryPlan.stitchRemovalDate}</Text>
              </View>
            )}
            {record.surgeryPlan.dailyCareFocus && (
              <View className={styles.infoItem}>
                <Text className={styles.infoLabel}>每天护理重点</Text>
                <Text className={styles.infoValue}>{record.surgeryPlan.dailyCareFocus}</Text>
              </View>
            )}
          </View>

          {record.surgeryPlan.medicationPlan && (
            <View className={styles.planBlock}>
              <Text className={styles.planBlockTitle}>💊 用药计划</Text>
              <Text className={styles.planBlockText}>{record.surgeryPlan.medicationPlan}</Text>
            </View>
          )}

          {record.surgeryPlan.dailyCareFocus && (
            <View className={styles.planBlock}>
              <Text className={styles.planBlockTitle}>🌡️ 每天护理重点</Text>
              <Text className={styles.planBlockText}>{record.surgeryPlan.dailyCareFocus}</Text>
            </View>
          )}

          {record.surgeryPlan.tabooNotes && (
            <View className={styles.planBlock}>
              <Text className={styles.planBlockTitle}>⚠️ 禁忌说明</Text>
              <Text className={styles.planBlockText}>{record.surgeryPlan.tabooNotes}</Text>
            </View>
          )}

          {record.surgeryPlan.followUpReminder && (
            <View className={styles.planBlock}>
              <Text className={styles.planBlockTitle}>🔔 复诊提醒</Text>
              <Text className={styles.planBlockText}>{record.surgeryPlan.followUpReminder}</Text>
            </View>
          )}
        </View>
      )}

      {/* 忌口 */}
      <View className={styles.sectionCard}>
        <Text className={styles.cardTitle}>⚠️ 忌口项目</Text>
        {record.forbiddenFoods && record.forbiddenFoods.length > 0 ? (
          <View className={styles.forbidSection}>
            <View className={styles.forbidTags}>
              {record.forbiddenFoods.map(food => (
                <View key={food} className={styles.forbidTag}>
                  🚫 {food}
                </View>
              ))}
            </View>
          </View>
        ) : (
          <Text className={styles.notesText}>暂无忌口</Text>
        )}
      </View>

      {/* 推荐饮食 */}
      <View className={styles.sectionCard}>
        <Text className={styles.cardTitle}>✅ 推荐饮食</Text>
        {record.recommendedFoods && record.recommendedFoods.length > 0 ? (
          <View className={styles.recommendSection}>
            <View className={styles.recommendTags}>
              {record.recommendedFoods.map(food => (
                <View key={food} className={styles.recommendTag}>
                  ✅ {food}
                </View>
              ))}
            </View>
          </View>
        ) : (
          <Text className={styles.notesText}>暂无推荐</Text>
        )}
      </View>

      {/* 护士回访记录 */}
      <View className={styles.sectionCard}>
        <Text className={styles.cardTitle}>📝 护士回访记录</Text>

        {record.nurseNotes && record.nurseNotes.length > 0 ? (
          record.nurseNotes.map(note => (
            <View key={note.id} className={styles.nurseNoteCard}>
              {editingNoteId === note.id ? (
                <>
                  <Text className={styles.noteFormLabel}>恢复情况</Text>
                  <Textarea
                    className={styles.editTextarea}
                    value={editNoteRecovery}
                    onInput={(e) => setEditNoteRecovery(e.detail.value)}
                    placeholder="请填写恢复情况..."
                  />
                  <Text className={styles.noteFormLabel}>下次注意事项</Text>
                  <Textarea
                    className={styles.editTextarea}
                    value={editNoteNextSteps}
                    onInput={(e) => setEditNoteNextSteps(e.detail.value)}
                    placeholder="请填写下次注意事项..."
                  />
                  <View style={{ display: 'flex', gap: 16 }}>
                    <Button onClick={() => setEditingNoteId(null)} style={{ flex: 1, backgroundColor: '#EEE' }}>取消</Button>
                    <Button onClick={handleSaveEditNote} style={{ flex: 1 }}>保存修改</Button>
                  </View>
                </>
              ) : (
                <>
                  <View className={styles.nurseNoteHeader}>
                    <View className={styles.nurseNoteLeft}>
                      <View className={styles.nurseAvatar}>
                        {note.nurseName ? note.nurseName.charAt(0) : '护'}
                      </View>
                      <View>
                        <Text className={styles.nurseName}>{note.nurseName || '护士'}</Text>
                        <Text className={styles.nurseDate}>
                          {note.date}
                          {getDateLabel(note.date) !== note.date ? ` · ${getDateLabel(note.date)}` : ''}
                        </Text>
                      </View>
                    </View>
                    <Button size="mini" onClick={() => startEditNote(note)}>编辑</Button>
                  </View>
                  <View className={styles.nurseNoteBody}>
                    <View className={styles.noteRow}>
                      <Text className={styles.noteLabel}>恢复情况</Text>
                      <Text className={styles.noteText}>{note.recoveryStatus}</Text>
                    </View>
                    {note.nextSteps && (
                      <View className={styles.noteRow}>
                        <Text className={styles.noteLabel}>下次注意事项</Text>
                        <Text className={styles.noteText}>{note.nextSteps}</Text>
                      </View>
                    )}
                  </View>
                  {note.createdAt && (
                    <Text className={styles.nurseNoteTime}>
                      记录时间：{new Date(note.createdAt).toLocaleString()}
                    </Text>
                  )}
                </>
              )}
            </View>
          ))
        ) : (
          <View className={styles.emptyNurseNote}>
            <Text className={styles.emptyNoteIcon}>💭</Text>
            <Text className={styles.emptyNoteText}>暂无回访记录</Text>
          </View>
        )}

        {!addingNote ? (
          <Button className={styles.addNoteBtn} onClick={() => setAddingNote(true)}>+ 新增回访记录</Button>
        ) : (
          <View className={styles.editSection}>
            <Text className={styles.noteFormLabel}>护士姓名</Text>
            <Input
              className={styles.editInput}
              value={noteNurseName}
              onInput={(e) => setNoteNurseName(e.detail.value)}
              placeholder="请输入护士姓名"
            />
            <Text className={styles.noteFormLabel}>恢复情况 *</Text>
            <Textarea
              className={styles.editTextarea}
              value={noteRecovery}
              onInput={(e) => setNoteRecovery(e.detail.value)}
              placeholder="如：伤口恢复良好，无红肿，疼痛减轻"
            />
            <Text className={styles.noteFormLabel}>下次注意事项</Text>
            <Textarea
              className={styles.editTextarea}
              value={noteNextSteps}
              onInput={(e) => setNoteNextSteps(e.detail.value)}
              placeholder="如：继续保持伤口干燥，避免剧烈运动"
            />
            <View style={{ display: 'flex', gap: 16 }}>
              <Button onClick={() => setAddingNote(false)} style={{ flex: 1, backgroundColor: '#EEE' }}>取消</Button>
              <Button onClick={handleAddNote} style={{ flex: 1 }}>保存记录</Button>
            </View>
          </View>
        )}
      </View>

      <View style={{ height: 80 }} />
    </ScrollView>
  );
};

export default RecordDetailPage;
