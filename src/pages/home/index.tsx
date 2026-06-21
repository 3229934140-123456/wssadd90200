import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppContext } from '@/store/AppContext';
import WarnCard from '@/components/WarnCard';
import RecommendCard from '@/components/RecommendCard';
import BigButton from '@/components/BigButton';
import {
  todayForbidList,
  todayCautionList,
  todayRecommendList,
  followUpInfo as defaultFollowUp,
  mealVoiceReminders
} from '@/data/mockData';
import { formatDate, getDaysAfter, speakText, makePhoneCall, getTodayStr } from '@/utils';

const HomePage: React.FC = () => {
  const { userInfo, isProfileSetup, records } = useAppContext();
  const daysAfter = useMemo(() => getDaysAfter(userInfo.surgeryDate), [userInfo.surgeryDate]);
  const todayStr = getTodayStr();

  const latestRecord = records[0];
  const followUp = latestRecord?.nextFollowUp
    ? { hasAppointment: true, date: latestRecord.nextFollowUp, time: '按预约时间', note: '请提前10分钟到院', projectName: latestRecord.projectName, daysAfter }
    : defaultFollowUp;

  const getGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 9) return '早上好';
    if (hour < 12) return '上午好';
    if (hour < 14) return '中午好';
    if (hour < 18) return '下午好';
    return '晚上好';
  };

  const handleMealVoice = (meal: 'breakfast' | 'lunch' | 'dinner') => {
    const text = mealVoiceReminders[meal];
    speakText(text);
  };

  const handleSpeakAll = () => {
    const forbidSummary = todayForbidList.map((w) => `${w.title}：${w.foods.join('、')}。${w.reason}`).join(' ');
    const recommendSummary = todayRecommendList.map((r) => `${r.name}：${r.benefit}`).join(' ');
    const followUpText = defaultFollowUp.hasAppointment
      ? `复诊提醒：${formatDate(defaultFollowUp.date!)} ${defaultFollowUp.time}。${defaultFollowUp.note}`
      : '暂无复诊安排。';
    const fullText = `${getGreeting()}，${userInfo.name}！今天是您术后第${daysAfter}天。${forbidSummary} 推荐您吃：${recommendSummary} ${followUpText}`;
    speakText(fullText);
  };

  const handleCallNurse = () => {
    makePhoneCall(userInfo.nursePhone);
  };

  const handleGoSetup = () => {
    Taro.navigateTo({ url: '/pages/nurse-setup/index' });
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
              <Text className={styles.projectInfo}>{userInfo.projectName}</Text>
              <Text className={styles.surgeryDate}>
                手术日：{formatDate(userInfo.surgeryDate)}
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
            <BigButton text="修改建档信息" icon="✏️" type="default" onClick={handleGoSetup} />
          </View>
        )}
      </View>

      <View className={styles.content}>
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

        <View className={styles.sectionTitle}>
          <Text className={styles.titleText}>📅 是否需要复诊</Text>
        </View>
        {defaultFollowUp.hasAppointment ? (
          <View className={styles.followUpCard}>
            <Text className={styles.followUpTitle}>⚠️ 您有复诊安排</Text>
            <Text className={styles.followUpDate}>{formatDate(defaultFollowUp.date!)}</Text>
            <Text className={styles.followUpTime}>{defaultFollowUp.time} · {defaultFollowUp.projectName}术后第{defaultFollowUp.daysAfter}天复查</Text>
            <Text className={styles.followUpNote}>📝 {defaultFollowUp.note}</Text>
            <View style={{ marginTop: 32 }}>
              <BigButton text="一键导航到门店" icon="🧭" type="warning" onClick={() => Taro.showToast({ title: '导航功能开发中', icon: 'none' })} />
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
