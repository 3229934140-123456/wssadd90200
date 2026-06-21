import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Input } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppContext } from '@/store/AppContext';
import BigButton from '@/components/BigButton';
import { formatDate, makePhoneCall, speakText } from '@/utils';

const RecordDetailPage: React.FC = () => {
  const router = useRouter();
  const { records, updateRecord, userInfo } = useAppContext();
  const recordId = router.params.id || '';
  const record = records.find((r) => r.id === recordId);

  const [editMode, setEditMode] = useState(false);
  const [editNotes, setEditNotes] = useState('');
  const [editNextFollowUp, setEditNextFollowUp] = useState('');
  const [editForbidFoods, setEditForbidFoods] = useState('');
  const [editRecommendFoods, setEditRecommendFoods] = useState('');

  useEffect(() => {
    if (record) {
      setEditNotes(record.notes);
      setEditNextFollowUp(record.nextFollowUp || '');
      setEditForbidFoods(record.forbidFoods.join('、'));
      setEditRecommendFoods(record.recommendFoods.join('、'));
    }
  }, [record]);

  const handleBack = () => {
    Taro.navigateBack({ delta: 1, fail: () => Taro.switchTab({ url: '/pages/mine/index' }) });
  };

  const handleSpeak = () => {
    if (!record) return;
    const text = `${record.projectName}术后记录。医生叮嘱：${record.notes}。忌口食物：${record.forbidFoods.join('、')}。推荐饮食：${record.recommendFoods.join('、')}。${record.nextFollowUp ? `下次复诊时间：${formatDate(record.nextFollowUp)}。` : ''}`;
    speakText(text);
  };

  const handleSave = () => {
    if (!record) return;
    updateRecord(recordId, {
      notes: editNotes.trim(),
      nextFollowUp: editNextFollowUp.trim() || undefined,
      forbidFoods: editForbidFoods.split(/[、,，]/).map((s) => s.trim()).filter(Boolean),
      recommendFoods: editRecommendFoods.split(/[、,，]/).map((s) => s.trim()).filter(Boolean)
    });
    setEditMode(false);
    Taro.showToast({ title: '保存成功', icon: 'success' });
  };

  const handleCallNurse = () => {
    makePhoneCall(userInfo.nursePhone);
  };

  if (!record) {
    return (
      <ScrollView className={styles.page} scrollY>
        <View className={styles.backBtn} onClick={handleBack}>
          <Text style={{ fontSize: 28 }}>←</Text>
          <Text className={styles.backText}>返回</Text>
        </View>
        <View className={styles.sectionCard}>
          <Text style={{ fontSize: 30, color: '#86909C', textAlign: 'center', display: 'block', padding: 48 }}>
            未找到该记录
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.backBtn} onClick={handleBack}>
        <Text style={{ fontSize: 28 }}>←</Text>
        <Text className={styles.backText}>返回复诊记录</Text>
      </View>

      <View className={styles.heroCard}>
        <Text className={styles.heroIcon}>📋</Text>
        <Text className={styles.heroTitle}>{record.projectName}</Text>
        <Text className={styles.heroDate}>手术日期：{formatDate(record.surgeryDate)}</Text>
        <Text className={styles.heroInfo}>
          主治医生：{record.doctorName}
        </Text>
      </View>

      {record.nextFollowUp ? (
        <View className={styles.followUpCard}>
          <Text className={styles.followUpLabel}>📅 下次复诊时间</Text>
          <Text className={styles.followUpDate}>{formatDate(record.nextFollowUp)}</Text>
          <Text className={styles.followUpNote}>请提前10分钟到院，携带就诊卡</Text>
        </View>
      ) : (
        <View className={styles.noFollowUp}>
          <Text className={styles.noFollowUpText}>👍 暂无复诊安排，请继续注意饮食和休息</Text>
        </View>
      )}

      <View className={styles.sectionCard}>
        <Text className={styles.cardTitle}>📝 医生叮嘱</Text>
        {editMode ? (
          <Input
            type="textarea"
            className={styles.editTextarea}
            value={editNotes}
            onInput={(e) => setEditNotes(e.detail.value)}
            maxlength={1000}
          />
        ) : (
          <Text className={styles.notesText}>{record.notes}</Text>
        )}
      </View>

      <View className={styles.sectionCard}>
        <Text className={styles.cardTitle}>🍽️ 饮食管理</Text>

        <View className={styles.forbidSection}>
          <Text className={styles.forbidTitle}>❌ 忌口食物</Text>
          {editMode ? (
            <Input
              className={styles.editInput}
              value={editForbidFoods}
              onInput={(e) => setEditForbidFoods(e.detail.value)}
              placeholder="用顿号分隔，如：辛辣、酒精、海鲜"
            />
          ) : (
            <View className={styles.forbidTags}>
              {record.forbidFoods.map((food, idx) => (
                <Text key={idx} className={styles.forbidTag}>{food}</Text>
              ))}
            </View>
          )}
        </View>

        <View className={styles.recommendSection}>
          <Text className={styles.recommendTitle}>✅ 推荐饮食</Text>
          {editMode ? (
            <Input
              className={styles.editInput}
              value={editRecommendFoods}
              onInput={(e) => setEditRecommendFoods(e.detail.value)}
              placeholder="用顿号分隔，如：鸡蛋、牛奶、瘦肉"
            />
          ) : (
            <View className={styles.recommendTags}>
              {record.recommendFoods.map((food, idx) => (
                <Text key={idx} className={styles.recommendTag}>{food}</Text>
              ))}
            </View>
          )}
        </View>
      </View>

      {editMode && (
        <View className={styles.editSection}>
          <Text className={styles.cardTitle}>📅 修改复诊时间</Text>
          <Text className={styles.editLabel}>下次复诊日期</Text>
          <Input
            className={styles.editInput}
            type="text"
            value={editNextFollowUp}
            onInput={(e) => setEditNextFollowUp(e.detail.value)}
            placeholder="如：2026-07-01"
          />
        </View>
      )}

      <View style={{ marginBottom: 16 }}>
        <BigButton
          text="🔊 语音读给我听"
          icon="🔊"
          type="default"
          onClick={handleSpeak}
        />
      </View>

      {editMode ? (
        <>
          <View style={{ marginBottom: 16 }}>
            <BigButton text="保存修改" icon="💾" type="primary" onClick={handleSave} />
          </View>
          <BigButton text="取消编辑" icon="↩️" type="default" onClick={() => setEditMode(false)} />
        </>
      ) : (
        <>
          <View style={{ marginBottom: 16 }}>
            <BigButton text="✏️ 编辑记录" icon="✏️" type="warning" onClick={() => setEditMode(true)} />
          </View>
          <View style={{ marginBottom: 16 }}>
            <BigButton text={`联系护士 ${userInfo.nurseName}`} icon="📞" type="primary" onClick={handleCallNurse} />
          </View>
        </>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

export default RecordDetailPage;
