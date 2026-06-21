import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import type { FoodItem } from '@/types';
import { getStatusText } from '@/utils';
import { speakText } from '@/utils';
import classnames from 'classnames';

interface Props {
  data: FoodItem;
}

const FoodResultCard: React.FC<Props> = ({ data }) => {
  const handleSpeak = () => {
    const text = `${data.name}，${getStatusText(data.status)}。${data.reason}。建议：${data.suggestion}`;
    speakText(text);
  };

  return (
    <View className={classnames(styles.resultCard, styles[data.status])}>
      <View className={styles.header}>
        <View className={styles.statusBadge}>
          <Text className={styles.statusText}>{getStatusText(data.status)}</Text>
        </View>
        <View className={styles.speakBtn} onClick={handleSpeak}>
          <Text className={styles.speakIcon}>🔊</Text>
          <Text className={styles.speakText}>语音读给我听</Text>
        </View>
      </View>
      <Text className={styles.foodName}>{data.name}</Text>
      <View className={styles.section}>
        <Text className={styles.label}>原因：</Text>
        <Text className={styles.content}>{data.reason}</Text>
      </View>
      <View className={styles.section}>
        <Text className={styles.label}>建议：</Text>
        <Text className={styles.content}>{data.suggestion}</Text>
      </View>
    </View>
  );
};

export default FoodResultCard;
