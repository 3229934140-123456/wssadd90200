import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppContext } from '@/store/AppContext';
import WarnCard from '@/components/WarnCard';
import RecommendCard from '@/components/RecommendCard';
import BigButton from '@/components/BigButton';
import TimelineCard from '@/components/TimelineCard';
import {
  todayForbidList,
  todayCautionList,
  todayRecommendList,
  mealVoiceReminders
} from '@/data/mockData';
import { formatDate, getDaysAfter, speakText, makePhoneCall, getTodayStr, buildMealVoiceText } from '@/utils';

const HomePage: React.FC = () => {
  const { userInfo, isProfileSetup, getActiveRecord, careHistory } = useAppContext();
  const daysAfter = useMemo(() => getDaysAfter(userInfo.surgeryDate), [userInfo.surgeryDate]);
  const todayStr = getTodayStr();

  // 从活跃Record获取复诊和计划信息，完全同步建档/复诊编辑数据
  const activeRecord = getActiveRecord();
  const projectName = activeRecord?.projectName || userInfo.projectName;
  const followUp = useMemo(() => {
    if (activeRecord?.nextFollowUp) {
      return {
        hasAppointment: true,
        date: activeRecord.nextFollowUp,
        time: '按预约时间',
        note: activeRecord.surgeryPlan?.followUpReminder || '请提前10分钟到院，携带就诊卡',
        projectName,
        daysAfter
      };
    }
    return { hasAppointment: false, projectName, daysAfter };
  }, [activeRecord, projectName, daysAfter]);

  const surgeryPlan = activeRecord?.surgeryPlan;

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 9) return '早上好';
    if (hour < 12) return '上午好';
    if (hour < 14) return '中午好';
    if (hour < 18) return '下午好';
    return '晚上好';
  };

  const handleMealVoice = (meal: 'breakfast' | 'lunch' | 'dinner') => {
    // 三餐语音联动术后计划：动态生成，含特殊忌口+用药提醒
    const text = buildMealVoiceText(meal, {
      projectName,
      daysAfter,
      surgeryPlan,
      forbiddenFoods: activeRecord?.forbiddenFoods || activeRecord?.forbidFoods || [],
      recommendedFoods: activeRecord?.recommendedFoods || activeRecord?.recommendFoods || [],
    });
    speakText(text);
  };

  const handleSpeakAll = () => {
    const forbidSummary = todayForbidList.map((w) => `${w.title}：${w.foods.join('、')}。${w.reason}`).join(' ');
    const recommendSummary = todayRecommendList.map((r) => `${r.name}：${r.benefit}`).join(' ');

    // 语音播报完全基于最新的activeRecord
    let planSummary = '';
    if (surgeryPlan) {
      if (surgeryPlan.stitchRemovalDate) {
        planSummary += `拆线日期是${formatDate(surgeryPlan.stitchRemovalDate)}。`;
      }
      if (surgeryPlan.medicationPlan) {
        planSummary += `用药提醒：${surgeryPlan.medicationPlan}。`;
      }
    }

    let followUpText = '';
    if (followUp.hasAppointment && followUp.date) {
      followUpText = `复诊提醒：${formatDate(followUp.date)}。${followUp.note}`;
    } else {
      followUpText = '暂无复诊安排，请继续注意休息。';
    }

    const fullText = `${getGreeting()}，${userInfo.name}！今天是您${projectName}术后第${daysAfter}天。${planSummary}${forbidSummary} 推荐您吃：${recommendSummary} ${followUpText}`;
    speakText(fullText);
  };

  const handleCallNurse = () => {
    makePhoneCall(userInfo.nursePhone);
  };

  const handleGoSetup = () => {
    Taro.navigateTo({ url: '/pages/nurse-setup/index' });
  };

  const handleGoPlanDetail = () => {
    if (activeRecord) {
      Taro.navigateTo({ url: `/pages/record-detail/index?id=${activeRecord.id}` });
    } else {
      handleGoSetup();
    }
  };

  const handleRefresh = () => {
    Taro.showLoading({ title: '刷新中...' });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.stopPullDownRefresh();
      Taro.showToast({ title: '已是最新', icon: 'success' });
    }, 800);
  };

  Taro.usePullDownRefresh(handleRefresh);

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <View className={styles.greetingCard}>
          <View className={styles.greetingTop}>
            <View>
              <Text className={styles.greetingText}>
                {getGreeting()}，{userInfo.name}
              </Text>
              <Text className={styles.projectInfo}>{projectName}</Text>
              <Text className={styles.surgeryDate}>
                手术日：{formatDate(userInfo.surgeryDate)}
                {surgeryPlan?.stitchRemovalDate && ` · 拆线日：${formatDate(surgeryPlan.stitchRemovalDate)}`}
              </Text>
            </View>
            <View className={styles.dayBadge}>术后第 {daysAfter} 天</View>
          </View>
          <View className={styles.voiceRow}>
            <View className={styles.voiceBtn} onClick={handleSpeakAll}>
              <Text className={styles.voiceBtnIcon}>🔊</Text>
              <Text className={styles.voiceBtnText}>全部读给我听</Text>
            </View>
            <View className={styles.voiceBtn} onClick={handleCallNurse}>
              <Text className={styles.voiceBtnIcon}>📞</Text>
              <Text className={styles.voiceBtnText}>联系护士</Text>
            </View>
          </View>
        </View>

        <View className={styles.voiceRow}>
          <View className={styles.voiceBtn} onClick={() => handleMealVoice('breakfast')}>
            <Text className={styles.voiceBtnIcon}>🌅</Text>
            <Text className={styles.voiceBtnText}>早饭前提醒</Text>
          </View>
          <View className={styles.voiceBtn} onClick={() => handleMealVoice('lunch')}>
            <Text className={styles.voiceBtnIcon}>☀️</Text>
            <Text className={styles.voiceBtnText}>午饭前提醒</Text>
          </View>
          <View className={styles.voiceBtn} onClick={() => handleMealVoice('dinner')}>
            <Text className={styles.voiceBtnIcon}>🌙</Text>
            <Text className={styles.voiceBtnText}>晚饭前提醒</Text>
          </View>
        </View>

        {!isProfileSetup && (
          <View style={{ marginTop: 16 }}>
            <BigButton text="👩‍⚕️ 护士建档（首次使用请点这里）" icon="📋" type="warning" onClick={handleGoSetup} />
          </View>
        )}
        {isProfileSetup && (
          <View style={{ marginTop: 16 }}>
            <BigButton text="查看完整术后计划" icon="📋" type="default" onClick={handleGoPlanDetail} />
          </View>
        )}
      </View>

      <View className={styles.content}>
        {/* 术后恢复时间线 */}
        {activeRecord && (
          <TimelineCard record={activeRecord} careHistory={careHistory} />
        )}

        <View className={styles.sectionTitle}>
          <Text className={styles.titleText}>🚫 今天不能吃什么</Text>
          <Text className={styles.titleBadge}>一定要记住！</Text>
        </View>
        <Text className={styles.sectionSubtitle}>
          以下食物会影响伤口恢复，吃了可能会红肿、发炎、留疤。为了早点变美，请一定忍住！
        </Text>
        {todayForbidList.map((item) => (
          <WarnCard key={item.id} data={item} />
        ))}
        {todayCautionList.map((item) => (
          <WarnCard key={item.id} data={item} />
        ))}

        {surgeryPlan?.forbiddenInstructions && (
          <View style={{
            marginTop: 24,
            padding: 24,
            backgroundColor: 'rgba(245,63,63,0.06)',
            borderRadius: 16,
            border: '2rpx solid rgba(245,63,63,0.15)'
          }}>
            <Text style={{ fontSize: 28, fontWeight: 600, color: '#F53F3F', display: 'block', marginBottom: 8 }}>
              ⚠️ 护士特别叮嘱
            </Text>
            <Text style={{ fontSize: 26, color: '#4E5969', lineHeight: 1.8 }}>
              {surgeryPlan.forbiddenInstructions}
            </Text>
          </View>
        )}

        <View className={styles.sectionTitle}>
          <Text className={styles.titleText}>✅ 今天该吃什么</Text>
          <Text className={styles.titleBadge} style={{ backgroundColor: 'rgba(0,180,42,0.1)', color: '#00B42A' }}>
            多吃恢复快
          </Text>
        </View>
        <Text className={styles.sectionSubtitle}>
          这些食物营养丰富，能帮助伤口长得又快又好，每天可以适量吃哦！
        </Text>
        {todayRecommendList.map((item) => (
          <RecommendCard key={item.id} data={item} />
        ))}

        {surgeryPlan?.medicationPlan && (
          <View style={{
            marginTop: 24,
            padding: 24,
            backgroundColor: 'rgba(22,93,255,0.06)',
            borderRadius: 16,
            border: '2rpx solid rgba(22,93,255,0.15)'
          }}>
            <Text style={{ fontSize: 28, fontWeight: 600, color: '#165DFF', display: 'block', marginBottom: 8 }}>
              💊 用药计划
            </Text>
            <Text style={{ fontSize: 26, color: '#4E5969', lineHeight: 1.8 }}>
              {surgeryPlan.medicationPlan}
            </Text>
          </View>
        )}

        {surgeryPlan?.dailyCareFocus && (
          <View style={{
            marginTop: 24,
            padding: 24,
            backgroundColor: 'rgba(78,205,196,0.08)',
            borderRadius: 16,
            border: '2rpx solid rgba(78,205,196,0.2)'
          }}>
            <Text style={{ fontSize: 28, fontWeight: 600, color: '#1FB5AD', display: 'block', marginBottom: 8 }}>
              🌡️ 每天护理重点
            </Text>
            <Text style={{ fontSize: 26, color: '#4E5969', lineHeight: 1.8 }}>
              {surgeryPlan.dailyCareFocus}
            </Text>
          </View>
        )}

        <View className={styles.sectionTitle}>
          <Text className={styles.titleText}>📅 是否需要复诊</Text>
        </View>
        {followUp.hasAppointment && followUp.date ? (
          <View className={styles.followUpCard}>
            <Text className={styles.followUpTitle}>⚠️ 您有复诊安排</Text>
            <Text className={styles.followUpDate}>{formatDate(followUp.date)}</Text>
            <Text className={styles.followUpTime}>{followUp.time} · {projectName}术后第{followUp.daysAfter}天复查</Text>
            <Text className={styles.followUpNote}>📝 {followUp.note}</Text>
            <View style={{ marginTop: 32 }}>
              <BigButton text="查看完整复诊计划" icon="📋" type="warning" onClick={handleGoPlanDetail} />
            </View>
          </View>
        ) : (
          <View className={styles.noFollowUp}>
            <Text className={styles.noFollowUpText}>
              👍 近期无复诊安排
              {'\n'}请继续注意饮食和休息，有问题随时联系护士
            </Text>
          </View>
        )}

        <View style={{ height: 32 }} />
        <BigButton text="有问题？一键拨打护士电话" icon="📞" type="primary" onClick={handleCallNurse} />
        <View style={{ height: 120 }} />
      </View>
    </ScrollView>
  );
};

export default HomePage;
