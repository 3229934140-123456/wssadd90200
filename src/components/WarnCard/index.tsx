import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import type { WarnItem } from '@/types';
import { speakText } from '@/utils';
import classnames from 'classnames';

interface Props {
  data: WarnItem;
}

const WarnCard: React.FC<Props> = ({ data }) => {
  const isForbid = data.type === 'forbid';

  const handleSpeak = () => {
    const text = `${data.title}：${data.foods.join('、')}。原因：${data.reason}`;
    speakText(text);
  };

  return (
    <View
      className={classnames(styles.warnCard, isForbid ? styles.forbidCard : styles.cautionCard)}
      onClick={handleSpeak}
    >
      <View className={styles.titleRow}>
        <Text className={styles.title}>{data.title}</Text>
        <View className={styles.speakBtn}>
          <Text className={styles.speakIcon}>🔊</Text>
          <Text className={styles.speakText}>点我听</Text>
        </View>
      </View>
      <View className={styles.foodList}>
        {data.foods.map((food, idx) => (
          <View
            key={idx}
            className={classnames(
              styles.foodTag,
              isForbid ? styles.forbidTag : styles.cautionTag
            )}
          >
            <Text className={styles.foodName}>{food}</Text>
          </View>
        ))}
      </View>
      <View className={styles.reasonBox}>
        <Text className={styles.reasonLabel}>💡 为什么不能吃：</Text>
        <Text className={styles.reasonText}>{data.reason}</Text>
      </View>
    </View>
  );
};

export default WarnCard;
