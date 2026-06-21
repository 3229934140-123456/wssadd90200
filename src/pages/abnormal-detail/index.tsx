import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import BigButton from '@/components/BigButton';
import { abnormalList } from '@/data/mockData';
import { useAppContext } from '@/store/AppContext';

const AbnormalDetailPage: React.FC = () => {
  const { reports, userInfo } = useAppContext();
  const latestReport = reports[reports.length - 1];
  const matchedAbnormal = latestReport
    ? abnormalList.find((a) => a.id === latestReport.type)
    : null;

  const display = matchedAbnormal || abnormalList[0];
  const reportData = latestReport || {
    createdAt: Date.now(),
    remark: '暂无补充说明',
    photos: [] as string[]
  };

  const handleBack = () => {
    Taro.navigateBack({ delta: 1, fail: () => Taro.switchTab({ url: '/pages/abnormal/index' }) });
  };

  const handleCallNurse = () => {
    Taro.makePhoneCall({ phoneNumber: userInfo.nursePhone });
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.backBtn} onClick={handleBack}>
        <Text style={{ fontSize: 28 }}>←</Text>
        <Text className={styles.backText}>返回异常上报</Text>
      </View>

      <View className={styles.heroCard}>
        <Text className={styles.heroIcon}>{display.emoji}</Text>
        <Text className={styles.heroTitle}>{display.label}</Text>
        <Text className={styles.heroDate}>
          上报时间：{new Date(reportData.createdAt).toLocaleString('zh-CN')}
        </Text>
      </View>

      <View className={styles.infoCard}>
        <Text className={styles.cardTitle}>📋 处理步骤（请按顺序做）</Text>
        <View className={styles.stepsList}>
          {display.firstSteps.map((step, idx) => (
            <View className={styles.stepItem} key={idx}>
              <View className={styles.stepNum}>{idx + 1}</View>
              <View className={styles.stepContent}>
                <Text className={styles.stepText}>{step}</Text>
              </View>
            </View>
          ))}
        </View>
        <View className={styles.timeNotice}>
          <Text className={styles.timeText}>⏰ 联系门店：{display.contactTime}</Text>
        </View>
      </View>

      <View className={styles.remarkCard}>
        <Text className={styles.cardTitle}>📝 补充说明</Text>
        <Text className={styles.remarkLabel}>您填写的描述：</Text>
        <Text className={styles.remarkContent}>
          {reportData.remark || '未填写补充说明'}
        </Text>
      </View>

      {reportData.photos && reportData.photos.length > 0 && (
        <View className={styles.photosSection}>
          <Text className={styles.cardTitle}>🖼️ 上传照片 ({reportData.photos.length}张)</Text>
          <View className={styles.photosGrid}>
            {reportData.photos.map((photo, idx) => (
              <View
                key={idx}
                className={styles.photoItem}
                style={{
                  backgroundImage: `url(${photo})`,
                  backgroundSize: 'cover'
                }}
              />
            ))}
            {Array.from({ length: Math.max(0, 3 - reportData.photos.length) }).map((_, idx) => (
              <View key={`empty-${idx}`} className={styles.photoItem}>
                <Text className={styles.photoText}>无</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <BigButton
        text={`立即联系护士 ${userInfo.nurseName}`}
        icon="📞"
        type="primary"
        onClick={handleCallNurse}
      />
    </ScrollView>
  );
};

export default AbnormalDetailPage;
