import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import type { RecordItem } from '@/types';
import { formatDate } from '@/utils';
import classnames from 'classnames';

interface Props {
  data: RecordItem;
  onClick?: () => void;
}

const RecordCard: React.FC<Props> = ({ data, onClick }) => {
  return (
    <View className={styles.recordCard} onClick={onClick}>
      <View className={styles.header}>
        <Text className={styles.projectName}>{data.projectName}</Text>
        <Text className={styles.surgeryDate}>{formatDate(data.surgeryDate)}</Text>
      </View>
      <View className={styles.infoRow}>
        <Text className={styles.label}>主治医生：</Text>
        <Text className={styles.value}>{data.doctorName}</Text>
      </View>
      {data.nextFollowUp && (
        <View className={styles.infoRow}>
          <Text className={styles.label}>下次复诊：</Text>
          <Text className={classnames(styles.value, styles.followUp)}>{formatDate(data.nextFollowUp)}</Text>
        </View>
      )}
      <View className={styles.tagSection}>
        <View className={styles.tagRow}>
          <Text className={styles.tagLabel}>❌ 忌口：</Text>
          <View className={styles.tagList}>
            {data.forbidFoods.map((f, i) => (
              <Text key={i} className={classnames(styles.tag, styles.forbidTag)}>{f}</Text>
            ))}
          </View>
        </View>
        <View className={styles.tagRow}>
          <Text className={styles.tagLabel}>✅ 推荐：</Text>
          <View className={styles.tagList}>
            {data.recommendFoods.map((f, i) => (
              <Text key={i} className={classnames(styles.tag, styles.recommendTag)}>{f}</Text>
            ))}
          </View>
        </View>
      </View>
      <View className={styles.notesBox}>
        <Text className={styles.notes}>{data.notes}</Text>
      </View>
    </View>
  );
};

export default RecordCard;
