import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import type { RecommendItem } from '@/types';
import { speakText } from '@/utils';

interface Props {
  data: RecommendItem;
}

const RecommendCard: React.FC<Props> = ({ data }) => {
  const handleSpeak = () => {
    speakText(`推荐吃${data.name}，${data.benefit}`);
  };

  return (
    <View className={styles.item} onClick={handleSpeak}>
      <View className={styles.iconBox}>
        <Text className={styles.icon}>{data.icon}</Text>
      </View>
      <View className={styles.info}>
        <Text className={styles.name}>{data.name}</Text>
        <Text className={styles.benefit}>{data.benefit}</Text>
      </View>
    </View>
  );
};

export default RecommendCard;
